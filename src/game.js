// 경기 로직 (렌더링·DOM과 분리. node에서 tools/sim.mjs로 돌릴 수 있다)
// 좌표: x는 1280 폭 무대 기준 픽셀. 아저씨는 왼쪽(오른쪽을 봄), 상대는 오른쪽(왼쪽을 봄).
//
// M2에서 늘어난 규칙(모두 data/opponents.json의 값으로 켜고 끈다)
// - 콤보(attackType.chain): 첫 타를 피해도 빈틈이 없고 곧바로 둘째 예고가 이어진다. 둘째까지 피해야 빈틈.
// - 속임(attackType.feint): 예고 도중에 다른 종류로 바뀐다. 바뀐 뒤에는 새 예고 시간 전체가 다시 주어진다.
// - 단단한 가드(opponent.stunGuard): 빈틈 중에도 팔을 안 풀어 일반 박치기는 막힌다. 가드 관통·파괴만 들어간다.
// - 철벽 가드(opponent.guardIron): 가드 관통(이환이형 둘째 타)도 막는다. 가드 파괴(결재 박치기)만 통한다.
//   staggerGuard: 반격을 맞고 밀려나는 중에도 가드(이어지는 추가타가 막힌다).
// - 얕은 빈틈(attackType.gapMul, counterMul): 짧은 잽은 피해도 빈틈이 짧고 반격 피해가 줄어든다.
// - 던지기(attackType.throw): 예고가 끝나면 물건이 날아온다. 물건이 아저씨에게 닿는 순간 회피를 판정한다.
// - 헬멧(opponent.helmet): 헬멧이 있는 동안 본체 피해가 줄고, 헬멧은 원거리 박치기로만 깎인다.
// - 거리 두기(opponent.keepAway): 가까이 오면 뒤로 달아난다. 구석에 몰리면 가드를 올린다.
// - 연속 회피: 회피에 성공한 직후에는 곧바로 다른 회피(숙이기↔물러서기)로 이어 쓸 수 있다.
import { OpponentBrain } from './opponent.js';

export function makeRng(seed = 1) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

export const EMPTY_INPUT = Object.freeze({
  left: false, right: false,
  duckPressed: false, backPressed: false,
  hbPressed: false, hbHeld: false,
  slot1: false, slot2: false, slot3: false,
});

// 아저씨 앞쪽(날아오는 물건이 닿는 지점)
const PLAYER_FRONT = 50;
// 상대가 물건을 놓는 위치(상대 x 기준 앞쪽)
const THROW_OFFSET = 70;
// 날아오는 물건: 닿기 이만큼(초) 전부터 맞는 회피 자세면 피한 것으로 판정
const PROJ_EARLY = 0.1;

export class Match {
  // opts: { skillsData, opponentsData, opponent, level, seed }
  constructor({ skillsData, opponentsData, opponent, level = 1, seed = 1 }) {
    const R = (this.R = skillsData.rules);
    this.skillList = skillsData.skills;
    this.skills = Object.fromEntries(skillsData.skills.map((s) => [s.id, s]));
    this.telegraphs = opponentsData.telegraphs;
    this.attackTypes = opponentsData.attackTypes;
    this.oppDef = opponent; // 원본(표시용 이름 등)
    this.def = { ...opponent }; // 경기 중 바뀔 수 있는 실제 수치(헬멧이 깨지면 바뀜)
    this.rng = makeRng(seed);
    this.level = clamp(level, 1, 5);

    this.phase = 'ready'; // ready → fight → end
    this.phaseTime = 0;
    this.clock = 0; // 경기 시작부터 흐른 시간(정지 포함 안 함)
    this.timeLeft = R.matchTime;
    this.hitStop = 0;
    this.events = [];
    this.result = null; // { outcome: win|lose|draw, reason: ko|decision }
    this.done = false; // 종료 연출까지 끝났는지
    this.teleSeq = 0; // 예고 일련번호(속임으로 바뀌면 새 번호)
    this.projSeq = 0;

    const maxHp = R.playerBaseHp + R.hpPerLevel * (this.level - 1);
    this.player = {
      x: R.playerStartX, hp: maxHp, maxHp,
      gauge: R.gauge.start,
      state: 'idle', t: 0, dur: 0,
      evadeCd: 0, evaded: false,
      ironTime: 0, moving: 0,
      holdTime: 0, hbBuffer: 0, hitsDone: 0, charged: false,
    };
    const helmet = opponent.helmet || null;
    this.opp = {
      x: R.opponentStartX, hp: opponent.hp, maxHp: opponent.hp,
      state: 'idle', t: 0, dur: 0,
      attackId: null, attack: null, guard: false, moving: 0,
      strikeT: 99, // 공격이 나간 뒤 흐른 시간(렌더용)
      hitT: 99, // 약한 박치기를 맞은 뒤 흐른 시간(렌더용)
      counterMul: 1, // 지금 빈틈에서 반격이 들어갈 때의 배율(얕은 빈틈이면 1보다 작다)
      feinted: false, chained: false, // 지금 예고가 속임으로 바뀐 것인지 / 콤보 둘째 타인지
      retreating: false, cornered: false,
      helmetHp: helmet ? helmet.hp : 0, helmetMax: helmet ? helmet.hp : 0,
      teleSeq: 0,
    };
    this.brain = new OpponentBrain(this.def, this.attackTypes, this.rng);
    this.projectiles = []; // 아저씨의 원거리 박치기
    this.oppProjectiles = []; // 상대가 던진 물건
    this.stats = {
      evades: { high: 0, low: 0, grab: 0 },
      hitsTaken: { high: 0, low: 0, grab: 0 },
      telegraphs: { high: 0, low: 0, grab: 0 },
      counters: 0, headbuttHits: 0, blocks: 0, whiffs: 0, ironBlocks: 0,
      damageDealt: 0, damageTaken: 0, skillsUsed: {},
      feints: 0, chains: 0, chainEvades: 0, throws: 0, projEvades: 0, projHits: 0,
      guardBreaks: 0, pierces: 0, stunBlocks: 0, ironGuardBlocks: 0,
      helmetDamage: 0, helmetBroken: false, rangedHits: 0, retreatTime: 0,
    };
  }

  emit(type, data = {}) {
    this.events.push({ type, t: this.clock, ...data });
  }

  drainEvents() {
    const e = this.events;
    this.events = [];
    return e;
  }

  get dist() {
    return this.opp.x - this.player.x;
  }

  skillForInput(input) {
    return this.skillList.find((s) => s.input === input) || null;
  }

  hasSkill(id) {
    const s = this.skills[id];
    return !!s && this.level >= s.level;
  }

  addGauge(v) {
    const p = this.player;
    p.gauge = clamp(p.gauge + v, 0, this.R.gauge.max);
  }

  // 지금 아저씨에게 다가오는 가장 급한 위협(봇·시험용). { tg, eta(초), key, src: tele|proj, feintPending }
  threat() {
    const o = this.opp;
    const p = this.player;
    let best = null;
    if (o.state === 'telegraph') {
      const type = o.attack;
      let eta = o.dur - o.t;
      if (type.throw) eta += Math.max(0, (o.x - THROW_OFFSET - (p.x + PLAYER_FRONT)) / type.throw.speed);
      best = { tg: type.telegraph, eta, key: o.teleSeq, src: 'tele', feintPending: !!type.feint && !o.feinted, throw: !!type.throw };
    }
    for (const pr of this.oppProjectiles) {
      if (pr.passed || pr.dead) continue;
      const eta = Math.max(0, (pr.x - (p.x + PLAYER_FRONT)) / pr.speed);
      if (!best || eta < best.eta) best = { tg: pr.tg, eta, key: pr.teleSeq, src: 'proj', feintPending: false, throw: true };
    }
    return best;
  }

  // ───────── 메인 업데이트 ─────────
  update(dt, inp = EMPTY_INPUT) {
    if (this.done) return;
    if (this.hitStop > 0) {
      this.hitStop -= dt;
      return;
    }
    this.clock += dt;
    this.phaseTime += dt;
    const R = this.R;

    if (this.phase === 'ready') {
      if (this.phaseTime >= R.readyTime) {
        this.phase = 'fight';
        this.phaseTime = 0;
        this.emit('fight');
      }
      return;
    }

    const live = this.phase === 'fight';
    this.updatePlayer(dt, live ? inp : EMPTY_INPUT);
    this.updateOpponent(dt, live);
    this.updateProjectiles(dt);
    this.updateOppProjectiles(dt);

    if (this.phase === 'fight') {
      this.timeLeft = Math.max(0, this.timeLeft - dt);
      if (this.timeLeft <= 0) this.timeUp();
    } else if (this.phase === 'end' && this.phaseTime >= R.endDelay) {
      this.done = true;
    }
  }

  // ───────── 아저씨 ─────────
  setPlayerState(state, dur = 0) {
    const p = this.player;
    p.state = state;
    p.t = 0;
    p.dur = dur;
    p.hitsDone = 0;
  }

  startEvade(kind) {
    const p = this.player;
    this.setPlayerState(kind, kind === 'duck' ? this.R.duckTime : this.R.backstepTime);
    p.evaded = false;
    this.emit(kind);
  }

  updatePlayer(dt, inp) {
    const p = this.player;
    const R = this.R;
    p.t += dt;
    p.evadeCd = Math.max(0, p.evadeCd - dt);
    p.ironTime = Math.max(0, p.ironTime - dt);
    p.hbBuffer = Math.max(0, p.hbBuffer - dt);
    p.moving = 0;
    if (inp.hbPressed) {
      p.holdTime = 0;
      p.hbBuffer = 0.12;
    }
    if (inp.hbHeld) p.holdTime += dt;
    const slot = inp.slot1 ? 'slot1' : inp.slot2 ? 'slot2' : inp.slot3 ? 'slot3' : null;

    switch (p.state) {
      case 'idle': {
        if (inp.duckPressed && p.evadeCd <= 0) {
          this.startEvade('duck');
        } else if (inp.backPressed && p.evadeCd <= 0) {
          this.startEvade('backstep');
        } else if (slot) {
          this.trySkill(slot);
        } else if (p.hbBuffer > 0) {
          this.startHeadbutt();
        } else {
          const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
          p.x += dir * R.walkSpeed * dt;
          p.moving = dir;
        }
        break;
      }
      case 'duck':
      case 'backstep': {
        if (p.state === 'backstep') {
          // 앞쪽에서 빠르게, 뒤로 갈수록 느리게
          const k = 1 - p.t / p.dur;
          p.x -= ((R.backstepDistance * 2) / p.dur) * Math.max(0, k) * dt;
        }
        // 연속 회피: 방금 피했다면 곧바로 다른 회피로 이어 쓸 수 있다(콤보 대응)
        if (p.evaded && (inp.duckPressed || inp.backPressed)) {
          this.startEvade(inp.duckPressed ? 'duck' : 'backstep');
          break;
        }
        // 회피에 성공했다면 "숙였다 올라오는 힘"으로 바로 박치기 가능
        if (p.evaded && p.hbBuffer > 0) {
          p.evadeCd = R.evadeCooldown;
          this.startHeadbutt();
          break;
        }
        if (p.evaded && slot) {
          p.evadeCd = R.evadeCooldown;
          this.setPlayerState('idle');
          this.trySkill(slot);
          break;
        }
        if (p.t >= p.dur) {
          // 피하는 데 성공했으면 곧바로 다시 피할 수 있다(미리 눌러 두기 억제는 실패했을 때만)
          p.evadeCd = p.evaded ? 0 : R.evadeCooldown;
          this.setPlayerState('idle');
        }
        break;
      }
      case 'headbutt': {
        const H = R.headbutt;
        const dmg = p.charged ? this.skills.kyuljae.damage : this.skills.basic.damage;
        // 잡기를 끊은 직후에는 남은 동작을 기술로 이어 쓸 수 있다
        if (p.hitsDone && p.evaded && slot) {
          this.setPlayerState('idle');
          p.charged = false;
          this.trySkill(slot);
          break;
        }
        // Lv.4부터: 스페이스를 짧게 치면 기본 박치기, 준비 동작이 끝날 때까지 누르고 있으면 박지 않고 곧바로 차지
        // (가드에 먼저 부딪혀 휘청이지 않고 결재 박치기를 준비할 수 있다)
        if (p.hitsDone === 0 && !p.charged && p.t >= H.windup && inp.hbHeld && p.holdTime >= H.windup - 1e-6 && this.hasSkill('kyuljae')) {
          this.setPlayerState('charge');
          break;
        }
        if (p.t < H.windup + H.active) p.x += (H.lunge / (H.windup + H.active)) * dt;
        if (p.hitsDone === 0 && p.t >= H.windup) {
          p.hitsDone = 1;
          this.playerStrike({
            damage: dmg,
            guardBreak: p.charged,
            kind: p.charged ? 'kyuljae' : 'basic',
          });
        }
        if (p.state === 'headbutt' && p.t >= H.windup + H.active + H.recovery + (p.charged ? 0.12 : 0)) {
          if (!p.charged && inp.hbHeld && this.hasSkill('kyuljae')) this.setPlayerState('charge');
          else this.setPlayerState('idle');
          p.charged = false;
        }
        break;
      }
      case 'charge': {
        const need = this.skills.kyuljae.chargeTime;
        // 차지 중에도 회피로 끊을 수 있다(차지는 처음부터)
        if ((inp.duckPressed || inp.backPressed) && p.evadeCd <= 0) {
          this.startEvade(inp.duckPressed ? 'duck' : 'backstep');
          p.hbBuffer = 0;
          break;
        }
        const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
        p.x += dir * R.walkSpeed * (R.chargeWalkMul ?? 0.5) * dt;
        p.moving = dir;
        if (!inp.hbHeld) {
          if (p.holdTime >= need) {
            this.setPlayerState('headbutt');
            p.charged = true;
            p.evaded = false;
            this.useSkillStat('kyuljae');
            this.emit('skill', { id: 'kyuljae' });
          } else {
            this.setPlayerState('idle');
          }
          p.hbBuffer = 0;
        }
        break;
      }
      case 'double': {
        const s = this.skills.double;
        const hit = s.hits[p.hitsDone];
        if (p.t < 0.5) p.x += 50 * dt;
        if (hit && p.t >= hit.at) {
          p.hitsDone++;
          this.playerStrike({ damage: hit.damage, pierceGuard: hit.pierceGuard, kind: 'double' });
        }
        if (p.state === 'double' && p.t >= s.duration) this.setPlayerState('idle');
        break;
      }
      case 'ranged': {
        const s = this.skills.ranged;
        if (p.hitsDone === 0 && p.t >= s.fireAt) {
          p.hitsDone = 1;
          this.projectiles.push({ x: p.x + 70, speed: s.speed, damage: s.damage, age: 0 });
          this.emit('shoot', { x: p.x + 70 });
        }
        if (p.t >= s.castTime) this.setPlayerState('idle');
        break;
      }
      case 'recoil':
        p.x -= 60 * Math.max(0, 1 - p.t / 0.2) * dt;
        if (p.t >= p.dur) {
          // 계속 누르고 있으면 결재 박치기 차지로 이어진다
          if (inp.hbHeld && this.hasSkill('kyuljae')) this.setPlayerState('charge');
          else this.setPlayerState('idle');
        }
        break;
      case 'hurt':
      case 'grabbed': {
        const kb = p.state === 'grabbed' ? 0 : 160;
        p.x -= kb * Math.max(0, 1 - p.t / 0.2) * dt;
        if (p.t >= p.dur) this.setPlayerState('idle');
        break;
      }
      default:
        break; // ko, win, lose, draw
    }
    p.x = clamp(p.x, R.stageLeft, this.opp.x - R.minGap);
  }

  startHeadbutt() {
    this.setPlayerState('headbutt');
    this.player.charged = false;
    this.player.hbBuffer = 0;
    this.player.evaded = false;
    this.emit('headbutt');
  }

  useSkillStat(id) {
    this.stats.skillsUsed[id] = (this.stats.skillsUsed[id] || 0) + 1;
  }

  trySkill(input) {
    const s = this.skillForInput(input);
    if (!s) return;
    if (this.level < s.level) {
      this.emit('locked', { id: s.id });
      return;
    }
    const p = this.player;
    if (p.gauge < s.cost) {
      this.emit('noGauge', { id: s.id });
      return;
    }
    this.addGauge(-s.cost);
    this.useSkillStat(s.id);
    this.emit('skill', { id: s.id });
    if (s.id === 'double') this.setPlayerState('double');
    else if (s.id === 'iron') p.ironTime = s.duration;
    else if (s.id === 'ranged') this.setPlayerState('ranged');
  }

  // 가드에 막힘: 튕겨 나와 휘청이고, 상대는 곧바로 반격 예고에 들어간다
  blocked(hitX, extra = {}) {
    const R = this.R;
    const o = this.opp;
    this.stats.blocks++;
    this.player.x -= R.blockPushback;
    if (this.player.state === 'headbutt') this.setPlayerState('recoil', R.blockRecoil);
    if (o.state === 'idle') this.brain.nextAttackIn = Math.min(this.brain.nextAttackIn, R.blockPunishDelay);
    this.emit('block', { x: hitX, armor: o.state === 'telegraph', ...extra });
  }

  // 박치기 계열 타격 판정. opts: { damage, pierceGuard, guardBreak, kind }
  playerStrike(opts) {
    const R = this.R;
    const o = this.opp;
    if (o.state === 'ko') return;
    if (this.dist > R.headbutt.reach) {
      this.stats.whiffs++;
      this.emit('whiff');
      return;
    }
    const hitX = this.player.x + this.dist * 0.55;
    const pierces = !!opts.pierceGuard && !this.def.guardIron;
    // 헬멧 가드(guardUnbreakable)는 결재 박치기로도 안 부서진다
    const breaks = !!opts.guardBreak && !this.def.guardUnbreakable;

    // 잡기 예고 중에 먼저 박으면 끊기 = 회피 성공(무거운 상대는 breakDamageMul만큼만 피해가 들어간다)
    if (o.state === 'telegraph' && o.attack.telegraph === 'grab') {
      const real = this.damageOpp(Math.round(opts.damage * (o.attack.breakDamageMul ?? 1)), opts.kind);
      this.stats.evades.grab++;
      this.stats.headbuttHits++;
      this.addGauge(R.gauge.evade + R.gauge.hit);
      this.setOppStun(R.gapTime * (o.attack.gapMul ?? 1), o.attack.counterMul ?? 1);
      this.player.evaded = true;
      this.hitStop = R.hitStop;
      this.emit('grabBreak', { x: hitX, damage: real });
      this.emit('evade', { tg: 'grab' });
      this.checkKO();
      return;
    }
    // 빈틈 중이면 반격(2.5배). 반격 한 번에 빈틈은 끝난다.
    if (o.state === 'stun') {
      // 단단한 가드: 빈틈에도 팔을 안 풀어 일반 박치기는 막힌다
      if (this.def.stunGuard && !pierces && !breaks) {
        this.stats.stunBlocks++;
        this.blocked(hitX, { stunGuard: true });
        return;
      }
      const dmg = Math.round(opts.damage * R.counterMultiplier * (o.counterMul ?? 1));
      const real = this.damageOpp(dmg, opts.kind);
      this.stats.counters++;
      this.stats.headbuttHits++;
      if (this.def.stunGuard && pierces) this.stats.pierces++;
      this.addGauge(R.gauge.hit);
      this.setOppState('stagger', R.opponentStaggerTime);
      this.hitStop = R.counterHitStop;
      this.emit('hit', { who: 'opp', x: hitX, damage: real, counter: true, kind: opts.kind, pierced: this.def.stunGuard && pierces });
      this.checkKO();
      return;
    }
    // 가드 중이거나, 상단·돌진 예고로 힘을 주고 있을 때는 막힌다(잡기 예고는 위에서 끊기로 처리)
    // 철벽(staggerGuard)은 반격을 맞고 밀려나는 중에도 가드를 다시 올린다
    const guarding = (o.state === 'idle' && o.guard) || o.state === 'telegraph' || (o.state === 'stagger' && !!this.def.staggerGuard);
    if (guarding && !pierces && !breaks) {
      if (opts.pierceGuard && this.def.guardIron) this.stats.ironGuardBlocks++;
      this.blocked(hitX, { iron: !!opts.pierceGuard && !!this.def.guardIron, helmet: !!opts.guardBreak && !!this.def.guardUnbreakable });
      return;
    }
    const real = this.damageOpp(opts.damage, opts.kind);
    this.stats.headbuttHits++;
    this.addGauge(R.gauge.hit);
    this.hitStop = R.hitStop;
    if (guarding && breaks) {
      o.guard = false;
      this.stats.guardBreaks++;
      this.setOppStun(R.gapTime, 1);
      this.emit('guardBreak', { x: hitX });
    } else {
      if (guarding && pierces) this.stats.pierces++;
      // 빈틈이 아닐 때의 박치기는 약하다: 피해만 들어가고 상대 행동은 끊기지 않는다(살짝 밀릴 뿐)
      o.x += R.hitPush;
      o.hitT = 0;
    }
    this.emit('hit', { who: 'opp', x: hitX, damage: real, counter: false, kind: opts.kind, pierced: guarding && !breaks });
    this.checkKO();
  }

  // 상대에게 피해. 헬멧이 있으면 본체 피해를 줄이고, 원거리 박치기는 헬멧을 깎는다. 반환: 본체에 들어간 피해
  damageOpp(dmg, kind) {
    const o = this.opp;
    const hm = this.def.helmet;
    let body = dmg;
    let breakNow = false;
    if (hm && o.helmetHp > 0) {
      body = Math.round(dmg * (hm.bodyDamageMul ?? 0.5));
      const hd = Math.min(o.helmetHp, Math.round(dmg * ((hm.breakBy || {})[kind] ?? 0)));
      if (hd > 0) {
        o.helmetHp -= hd;
        this.stats.helmetDamage += hd;
        this.emit('helmetHit', { damage: hd, left: o.helmetHp, x: o.x - 30 });
        if (o.helmetHp <= 0) breakNow = true;
      }
    }
    const real = Math.min(o.hp, body);
    o.hp -= real;
    this.stats.damageDealt += real;
    if (breakNow) this.breakHelmet();
    return real;
  }

  breakHelmet() {
    const o = this.opp;
    const hm = this.def.helmet;
    o.helmetHp = 0;
    this.stats.helmetBroken = true;
    if (hm.after) {
      Object.assign(this.def, hm.after);
      this.brain.def = this.def;
    }
    this.emit('helmetBreak', { x: o.x });
    if (o.hp > 0 && o.state !== 'ko') {
      // 던지는 중이던 물건은 그대로 날아온다. 본인은 크게 휘청인다
      this.setOppStun(hm.breakStun ?? 1.4, 1);
    }
  }

  // ───────── 상대 ─────────
  setOppState(state, dur = 0) {
    const o = this.opp;
    const wasBusy = o.state !== 'idle';
    o.state = state;
    o.t = 0;
    o.dur = dur;
    if (state !== 'idle') o.guard = false;
    if (state !== 'telegraph') {
      o.feinted = false;
      o.chained = false;
    }
    if (state === 'idle' && wasBusy) this.brain.onNeutral();
  }

  setOppStun(dur, counterMul = 1) {
    this.setOppState('stun', dur);
    this.opp.counterMul = counterMul;
  }

  telegraphTime(type) {
    return (this.def.telegraphTime ?? 0.9) * (type.telegraphTimeMul ?? 1);
  }

  updateOpponent(dt, live) {
    const o = this.opp;
    const p = this.player;
    const R = this.R;
    const def = this.def;
    o.t += dt;
    o.strikeT += dt;
    o.hitT += dt;
    o.moving = 0;
    o.retreating = false;
    o.cornered = o.x >= R.stageRight - 4;
    const speed = def.walkSpeed ?? 140;

    switch (o.state) {
      case 'idle': {
        if (!live) break;
        const d = this.brain.think(dt, this.dist, { cornered: o.cornered });
        if (d.attack) {
          this.startTelegraph(d.attack);
        } else {
          o.guard = d.guard;
          const sp = d.retreat ? def.retreatSpeed ?? speed : speed;
          o.x += d.move * sp * (o.guard ? 0.5 : 1) * dt;
          o.moving = d.move;
          o.retreating = !!d.retreat && d.move > 0;
          if (o.retreating) this.stats.retreatTime += dt;
        }
        break;
      }
      case 'telegraph': {
        const type = o.attack;
        // 속임: 예고 도중에 다른 종류로 바뀐다
        if (type.feint && !o.feinted && o.t >= o.dur * (type.feint.at ?? 0.55)) {
          this.switchFeint();
          break;
        }
        // 예고 중에는 거리를 좁혀 공격 사거리를 유지한다(멀리 걸어 도망가도 따라온다)
        const close = type.closeTo;
        if (close && this.dist > close) {
          o.x -= Math.max(speed, R.walkSpeed + 30) * dt;
          o.moving = -1;
        }
        if (o.t >= o.dur) {
          if (type.throw) this.throwProjectile();
          else this.resolveAttack();
        }
        break;
      }
      case 'throw':
        // 던진 물건이 판정될 때까지 던진 자세로 기다린다(판정되면 상태가 바뀜)
        if (o.t >= o.dur) this.setOppState('idle');
        break;
      case 'grabHold':
        if (p.state !== 'grabbed') this.setOppState('recover', 0.35);
        break;
      case 'recover':
      case 'stun':
      case 'flinch':
      case 'stagger': {
        if (o.state === 'stagger' || o.state === 'flinch') {
          const kb = o.state === 'stagger' ? 260 : 120;
          o.x += kb * Math.max(0, 1 - o.t / 0.25) * dt;
        }
        if (o.t >= o.dur) this.setOppState('idle');
        break;
      }
      default:
        break; // ko, win
    }
    o.x = clamp(o.x, p.x + R.minGap, R.stageRight);
  }

  startTelegraph(id, chained = false) {
    const type = this.attackTypes[id];
    const o = this.opp;
    this.setOppState('telegraph', this.telegraphTime(type));
    o.attackId = id;
    o.attack = type;
    o.chained = chained;
    o.teleSeq = ++this.teleSeq;
    this.brain.onAttackStarted(id);
    this.stats.telegraphs[type.telegraph]++;
    if (chained) this.stats.chains++;
    this.emit('telegraph', { id, tg: type.telegraph, dur: o.dur, chained, throw: !!type.throw });
  }

  switchFeint() {
    const o = this.opp;
    const from = o.attack;
    const toId = from.feint.to;
    const to = this.attackTypes[toId];
    this.stats.telegraphs[from.telegraph]--;
    this.stats.telegraphs[to.telegraph]++;
    this.stats.feints++;
    o.attackId = toId;
    o.attack = to;
    o.feinted = true;
    o.t = 0;
    // 바뀐 뒤에는 새 예고 시간 전체를 다시 준다(공정한 반응 시간)
    o.dur = this.telegraphTime(to) * (from.feint.remainMul ?? 1);
    o.teleSeq = ++this.teleSeq;
    this.emit('feint', { from: from.telegraph, tg: to.telegraph, id: toId, dur: o.dur });
  }

  // 회피를 판정할 공통 규칙: 상단은 숙이기, 하단은 물러서기
  isCorrectEvade(tg) {
    const s = this.player.state;
    return (tg === 'high' && s === 'duck') || (tg === 'low' && s === 'backstep');
  }

  hurtPlayer(type, tg, extra = {}) {
    const p = this.player;
    const o = this.opp;
    const R = this.R;
    // 박치기를 내미는 중에 맞으면(마구 누르기) 피해가 커진다
    const attacking = ['headbutt', 'double', 'charge', 'ranged', 'recoil'].includes(p.state);
    const dmg = Math.round((this.def.damage ?? 12) * (type.damageMul ?? 1) * (attacking ? R.counterHitMultiplier : 1));
    const real = Math.min(p.hp, dmg);
    p.hp -= real;
    this.stats.damageTaken += real;
    this.stats.hitsTaken[tg]++;
    this.addGauge(R.gauge.hurt);
    p.charged = false;
    this.hitStop = R.hitStop;
    this.emit('hit', { who: 'player', x: p.x + 40, damage: dmg, tg, attack: o.attackId, counterHit: attacking, ...extra });
    return dmg;
  }

  resolveAttack() {
    const o = this.opp;
    const p = this.player;
    const R = this.R;
    const type = o.attack;
    const tg = type.telegraph;
    o.strikeT = 0;
    if (type.dash) o.x = p.x + R.minGap;
    else if (type.lunge) o.x = Math.max(p.x + R.minGap, o.x - type.lunge);

    if (p.state === 'ko') {
      this.setOppState('recover', type.recover);
      return;
    }
    if (p.ironTime > 0) {
      this.stats.ironBlocks++;
      this.setOppStun(R.gapTime, 1);
      this.hitStop = R.hitStop;
      this.emit('ironBlock', { tg, x: p.x + 60 });
      return;
    }
    if (this.isCorrectEvade(tg)) {
      this.stats.evades[tg]++;
      this.addGauge(R.gauge.evade);
      p.evaded = true;
      if (type.chain) {
        // 콤보 첫 타: 피해도 빈틈이 없다. 곧바로 둘째 예고
        this.stats.chainEvades++;
        this.emit('evade', { tg, chain: true });
        this.startTelegraph(type.chain, true);
        return;
      }
      if (type.gapMul === 0) {
        // 빈틈이 전혀 없는 공격(헬멧 들이받기): 피해도 곧바로 자세를 되찾는다
        this.setOppState('recover', type.recover);
        this.emit('evade', { tg, noGap: true });
        return;
      }
      this.setOppStun(R.gapTime * (type.gapMul ?? 1), type.counterMul ?? 1);
      this.emit('evade', { tg, shallow: (type.gapMul ?? 1) < 1 });
      return;
    }
    this.hurtPlayer(type, tg);
    if (tg === 'grab') {
      this.setPlayerState('grabbed', R.playerGrabbedTime);
      this.setOppState('grabHold', R.playerGrabbedTime);
    } else {
      this.setPlayerState('hurt', R.playerHurtTime);
      if (type.chain && p.hp > 0) this.startTelegraph(type.chain, true);
      else this.setOppState('recover', type.recover);
    }
    this.checkKO();
  }

  throwProjectile() {
    const o = this.opp;
    const type = o.attack;
    const th = type.throw;
    o.strikeT = 0;
    this.stats.throws++;
    const pr = {
      id: ++this.projSeq, teleSeq: o.teleSeq, kind: th.kind, tg: type.telegraph, type, attackId: o.attackId,
      x: o.x - THROW_OFFSET, x0: o.x - THROW_OFFSET, speed: th.speed, age: 0, passed: false, dead: false,
    };
    this.oppProjectiles.push(pr);
    this.setOppState('throw', 3);
    this.emit('throw', { kind: th.kind, tg: pr.tg, x: pr.x });
  }

  // 던진 물건이 아저씨 앞에 닿는 순간의 판정
  resolveProjectile(pr) {
    const p = this.player;
    const o = this.opp;
    const R = this.R;
    const type = pr.type;
    const oppWaiting = o.state === 'throw' || o.state === 'idle';
    if (p.state === 'ko' || this.phase !== 'fight') {
      pr.passed = true;
      return;
    }
    if (p.ironTime > 0) {
      pr.dead = true;
      this.stats.ironBlocks++;
      if (oppWaiting) this.setOppStun(R.gapTime, 1);
      this.hitStop = R.hitStop;
      this.emit('ironBlock', { tg: pr.tg, x: p.x + 60, proj: pr.kind });
      return;
    }
    if (this.isCorrectEvade(pr.tg)) {
      pr.passed = true;
      this.stats.evades[pr.tg]++;
      this.stats.projEvades++;
      this.addGauge(R.gauge.evade);
      p.evaded = true;
      if (oppWaiting && type.gapMul !== 0) this.setOppStun(R.gapTime * (type.gapMul ?? 1), type.counterMul ?? 1);
      this.emit('evade', { tg: pr.tg, proj: pr.kind });
      return;
    }
    pr.dead = true;
    this.stats.projHits++;
    this.hurtPlayer(type, pr.tg, { proj: pr.kind, x: p.x + 40 });
    this.setPlayerState('hurt', R.playerHurtTime);
    if (o.state === 'throw') this.setOppState('recover', type.recover);
    this.checkKO();
  }

  updateOppProjectiles(dt) {
    const p = this.player;
    for (const pr of this.oppProjectiles) {
      pr.age += dt;
      pr.x -= pr.speed * dt;
      if (pr.x < -200) pr.dead = true;
      if (pr.passed || pr.dead) continue;
      const gap = pr.x - (p.x + PLAYER_FRONT);
      // 닿기 직전(PROJ_EARLY초 안)에 이미 맞는 회피 자세면 그 자리에서 피한 것으로 친다.
      // 물러서기는 뒤로 빠지면서 공이 늦게 닿으므로, 닿는 순간만 보면 자세가 이미 풀려 있을 수 있다.
      if (gap <= 0 || (gap <= pr.speed * PROJ_EARLY && this.isCorrectEvade(pr.tg))) this.resolveProjectile(pr);
    }
    this.oppProjectiles = this.oppProjectiles.filter((pr) => !pr.dead);
    // 던진 물건이 모두 판정됐는데 아직 던진 자세면 풀어 준다
    const o = this.opp;
    if (o.state === 'throw' && !this.oppProjectiles.some((pr) => !pr.passed)) {
      if (o.t > 0.05) this.setOppState('recover', (o.attack && o.attack.recover) || 0.3);
    }
  }

  updateProjectiles(dt) {
    const o = this.opp;
    for (const pr of this.projectiles) {
      pr.age += dt;
      pr.x += pr.speed * dt;
      if (!pr.dead && o.state !== 'ko' && pr.x >= o.x - 50) {
        pr.dead = true;
        // 원거리 박치기는 가드를 무시하고 빈틈 배율은 받지 않는다
        const real = this.damageOpp(pr.damage, 'ranged');
        this.addGauge(this.R.gauge.hit);
        this.stats.headbuttHits++;
        this.stats.rangedHits++;
        o.x += this.R.hitPush;
        o.hitT = 0;
        this.hitStop = this.R.hitStop;
        this.emit('hit', { who: 'opp', x: o.x - 40, damage: real, counter: false, kind: 'ranged' });
        this.checkKO();
      }
      if (pr.x > 1500) pr.dead = true;
    }
    this.projectiles = this.projectiles.filter((pr) => !pr.dead);
  }

  // ───────── 종료 ─────────
  checkKO() {
    if (this.phase !== 'fight') return;
    if (this.opp.hp <= 0) this.endMatch('win', 'ko');
    else if (this.player.hp <= 0) this.endMatch('lose', 'ko');
  }

  timeUp() {
    const pr = this.player.hp / this.player.maxHp;
    const or = this.opp.hp / this.opp.maxHp;
    const eps = 1e-9;
    const outcome = pr > or + eps ? 'win' : or > pr + eps ? 'lose' : 'draw';
    this.endMatch(outcome, 'decision');
  }

  endMatch(outcome, reason) {
    this.phase = 'end';
    this.phaseTime = 0;
    this.result = { outcome, reason };
    const p = this.player;
    const o = this.opp;
    this.projectiles = [];
    this.oppProjectiles = [];
    if (outcome === 'win') {
      this.setPlayerState('win');
      this.setOppState(reason === 'ko' ? 'ko' : 'lose');
    } else if (outcome === 'lose') {
      this.setPlayerState(reason === 'ko' ? 'ko' : 'lose');
      this.setOppState('win');
    } else {
      this.setPlayerState('draw');
      this.setOppState('win');
    }
    o.guard = false;
    p.ironTime = 0;
    this.hitStop = reason === 'ko' ? 0.35 : 0;
    this.emit('end', { outcome, reason });
  }

  // ───────── 디버그 ─────────
  levelUp() {
    if (this.level >= 5) return false;
    this.level++;
    const add = this.R.hpPerLevel;
    this.player.maxHp += add;
    this.player.hp += add;
    this.emit('levelUp', { level: this.level });
    return true;
  }
}
