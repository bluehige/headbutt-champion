// 경기 로직 (렌더링·DOM과 분리. node에서 tools/sim.mjs로 돌릴 수 있다)
// 좌표: x는 1280 폭 무대 기준 픽셀. 아저씨는 왼쪽(오른쪽을 봄), 상대는 오른쪽(왼쪽을 봄).
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

export class Match {
  // opts: { skillsData, opponentsData, opponent, level, seed }
  constructor({ skillsData, opponentsData, opponent, level = 1, seed = 1 }) {
    const R = (this.R = skillsData.rules);
    this.skillList = skillsData.skills;
    this.skills = Object.fromEntries(skillsData.skills.map((s) => [s.id, s]));
    this.telegraphs = opponentsData.telegraphs;
    this.attackTypes = opponentsData.attackTypes;
    this.oppDef = opponent;
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

    const maxHp = R.playerBaseHp + R.hpPerLevel * (this.level - 1);
    this.player = {
      x: R.playerStartX, hp: maxHp, maxHp,
      gauge: R.gauge.start,
      state: 'idle', t: 0, dur: 0,
      evadeCd: 0, evaded: false,
      ironTime: 0, moving: 0,
      holdTime: 0, hbBuffer: 0, hitsDone: 0, charged: false,
    };
    this.opp = {
      x: R.opponentStartX, hp: opponent.hp, maxHp: opponent.hp,
      state: 'idle', t: 0, dur: 0,
      attackId: null, attack: null, guard: false, moving: 0,
      strikeT: 99, // 공격이 나간 뒤 흐른 시간(렌더용)
      hitT: 99, // 약한 박치기를 맞은 뒤 흐른 시간(렌더용)
    };
    this.brain = new OpponentBrain(opponent, this.attackTypes, this.rng);
    this.projectiles = [];
    this.stats = {
      evades: { high: 0, low: 0, grab: 0 },
      hitsTaken: { high: 0, low: 0, grab: 0 },
      telegraphs: { high: 0, low: 0, grab: 0 },
      counters: 0, headbuttHits: 0, blocks: 0, whiffs: 0, ironBlocks: 0,
      damageDealt: 0, damageTaken: 0, skillsUsed: {},
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

    switch (p.state) {
      case 'idle': {
        if (inp.duckPressed && p.evadeCd <= 0) {
          this.setPlayerState('duck', R.duckTime);
          p.evaded = false;
          this.emit('duck');
        } else if (inp.backPressed && p.evadeCd <= 0) {
          this.setPlayerState('backstep', R.backstepTime);
          p.evaded = false;
          this.emit('backstep');
        } else if (inp.slot1 || inp.slot2 || inp.slot3) {
          this.trySkill(inp.slot1 ? 'slot1' : inp.slot2 ? 'slot2' : 'slot3');
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
        // 회피에 성공했다면 "숙였다 올라오는 힘"으로 바로 박치기 가능
        if (p.evaded && p.hbBuffer > 0) {
          p.evadeCd = R.evadeCooldown;
          this.startHeadbutt();
          break;
        }
        if (p.evaded && (inp.slot1 || inp.slot2 || inp.slot3)) {
          p.evadeCd = R.evadeCooldown;
          this.setPlayerState('idle');
          this.trySkill(inp.slot1 ? 'slot1' : inp.slot2 ? 'slot2' : 'slot3');
          break;
        }
        if (p.t >= p.dur) {
          p.evadeCd = R.evadeCooldown;
          this.setPlayerState('idle');
        }
        break;
      }
      case 'headbutt': {
        const H = R.headbutt;
        const dmg = p.charged ? this.skills.kyuljae.damage : this.skills.basic.damage;
        if (p.t < H.windup + H.active) p.x += (H.lunge / (H.windup + H.active)) * dt;
        if (p.hitsDone === 0 && p.t >= H.windup) {
          p.hitsDone = 1;
          this.playerStrike({
            damage: dmg,
            guardBreak: p.charged,
            kind: p.charged ? 'kyuljae' : 'basic',
          });
        }
        if (p.t >= H.windup + H.active + H.recovery + (p.charged ? 0.12 : 0)) {
          if (!p.charged && inp.hbHeld && this.hasSkill('kyuljae')) this.setPlayerState('charge');
          else this.setPlayerState('idle');
          p.charged = false;
        }
        break;
      }
      case 'charge': {
        const need = this.skills.kyuljae.chargeTime;
        if (!inp.hbHeld) {
          if (p.holdTime >= need) {
            this.setPlayerState('headbutt');
            p.charged = true;
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
        if (p.t >= s.duration) this.setPlayerState('idle');
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

    // 잡기 예고 중에 먼저 박으면 끊기 = 회피 성공
    if (o.state === 'telegraph' && o.attack.telegraph === 'grab') {
      this.damageOpp(opts.damage);
      this.stats.evades.grab++;
      this.stats.headbuttHits++;
      this.addGauge(R.gauge.evade + R.gauge.hit);
      this.setOppState('stun', R.gapTime);
      this.player.evaded = true;
      this.hitStop = R.hitStop;
      this.emit('grabBreak', { x: hitX, damage: opts.damage });
      this.emit('evade', { tg: 'grab' });
      this.checkKO();
      return;
    }
    // 빈틈 중이면 반격(2.5배). 반격 한 번에 빈틈은 끝난다.
    if (o.state === 'stun') {
      const dmg = Math.round(opts.damage * R.counterMultiplier);
      this.damageOpp(dmg);
      this.stats.counters++;
      this.stats.headbuttHits++;
      this.addGauge(R.gauge.hit);
      this.setOppState('stagger', R.opponentStaggerTime);
      this.hitStop = R.counterHitStop;
      this.emit('hit', { who: 'opp', x: hitX, damage: dmg, counter: true, kind: opts.kind });
      this.checkKO();
      return;
    }
    // 가드 중이거나, 상단·돌진 예고로 힘을 주고 있을 때는 막힌다(잡기 예고는 위에서 끊기로 처리)
    const guarding = (o.state === 'idle' && o.guard) || o.state === 'telegraph';
    if (guarding && !opts.pierceGuard && !opts.guardBreak) {
      // 가드에 막히면 튕겨 나와 휘청이고, 상대는 곧바로 반격 예고에 들어간다
      this.stats.blocks++;
      this.player.x -= R.blockPushback;
      if (this.player.state === 'headbutt') this.setPlayerState('recoil', R.blockRecoil);
      if (o.state === 'idle') this.brain.nextAttackIn = Math.min(this.brain.nextAttackIn, R.blockPunishDelay);
      this.emit('block', { x: hitX, armor: o.state === 'telegraph' });
      return;
    }
    this.damageOpp(opts.damage);
    this.stats.headbuttHits++;
    this.addGauge(R.gauge.hit);
    this.hitStop = R.hitStop;
    if (guarding && opts.guardBreak) {
      o.guard = false;
      this.setOppState('stun', R.gapTime);
      this.emit('guardBreak', { x: hitX });
    } else {
      // 빈틈이 아닐 때의 박치기는 약하다: 피해만 들어가고 상대 행동은 끊기지 않는다(살짝 밀릴 뿐)
      o.x += R.hitPush;
      o.hitT = 0;
    }
    this.emit('hit', { who: 'opp', x: hitX, damage: opts.damage, counter: false, kind: opts.kind, pierced: guarding });
    this.checkKO();
  }

  damageOpp(dmg) {
    const o = this.opp;
    const real = Math.min(o.hp, dmg);
    o.hp -= real;
    this.stats.damageDealt += real;
  }

  // ───────── 상대 ─────────
  setOppState(state, dur = 0) {
    const o = this.opp;
    const wasBusy = o.state !== 'idle';
    o.state = state;
    o.t = 0;
    o.dur = dur;
    if (state !== 'idle') o.guard = false;
    if (state === 'idle' && wasBusy) this.brain.onNeutral();
  }

  telegraphTime(type) {
    return (this.oppDef.telegraphTime ?? 0.9) * (type.telegraphTimeMul ?? 1);
  }

  updateOpponent(dt, live) {
    const o = this.opp;
    const p = this.player;
    const R = this.R;
    o.t += dt;
    o.strikeT += dt;
    o.hitT += dt;
    o.moving = 0;
    const speed = this.oppDef.walkSpeed ?? 140;

    switch (o.state) {
      case 'idle': {
        if (!live) break;
        const d = this.brain.think(dt, this.dist);
        if (d.attack) {
          this.startTelegraph(d.attack);
        } else {
          o.guard = d.guard;
          o.x += d.move * speed * (o.guard ? 0.5 : 1) * dt;
          o.moving = d.move;
        }
        break;
      }
      case 'telegraph': {
        // 예고 중에는 거리를 좁혀 공격 사거리를 유지한다(멀리 걸어 도망가도 따라온다)
        const close = o.attack.closeTo;
        if (close && this.dist > close) {
          o.x -= Math.max(speed, R.walkSpeed + 30) * dt;
          o.moving = -1;
        }
        if (o.t >= o.dur) this.resolveAttack();
        break;
      }
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

  startTelegraph(id) {
    const type = this.attackTypes[id];
    const o = this.opp;
    this.setOppState('telegraph', this.telegraphTime(type));
    o.attackId = id;
    o.attack = type;
    this.brain.onAttackStarted(id);
    this.stats.telegraphs[type.telegraph]++;
    this.emit('telegraph', { id, tg: type.telegraph, dur: o.dur });
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

    const correct = (tg === 'high' && p.state === 'duck') || (tg === 'low' && p.state === 'backstep');
    if (p.state === 'ko') {
      this.setOppState('recover', type.recover);
      return;
    }
    if (p.ironTime > 0) {
      this.stats.ironBlocks++;
      this.setOppState('stun', R.gapTime);
      this.hitStop = R.hitStop;
      this.emit('ironBlock', { tg, x: p.x + 60 });
      return;
    }
    if (correct) {
      this.stats.evades[tg]++;
      this.addGauge(R.gauge.evade);
      p.evaded = true;
      this.setOppState('stun', R.gapTime);
      this.emit('evade', { tg });
      return;
    }
    // 피격. 박치기를 내미는 중에 맞으면(마구 누르기) 피해가 커진다
    const attacking = ['headbutt', 'double', 'charge', 'ranged', 'recoil'].includes(p.state);
    const dmg = Math.round((this.oppDef.damage ?? 12) * (type.damageMul ?? 1) * (attacking ? R.counterHitMultiplier : 1));
    const real = Math.min(p.hp, dmg);
    p.hp -= real;
    this.stats.damageTaken += real;
    this.stats.hitsTaken[tg]++;
    this.addGauge(R.gauge.hurt);
    p.charged = false;
    if (tg === 'grab') {
      this.setPlayerState('grabbed', R.playerGrabbedTime);
      this.setOppState('grabHold', R.playerGrabbedTime);
    } else {
      this.setPlayerState('hurt', R.playerHurtTime);
      this.setOppState('recover', type.recover);
    }
    this.hitStop = R.hitStop;
    this.emit('hit', { who: 'player', x: p.x + 40, damage: dmg, tg, attack: o.attackId, counterHit: attacking });
    this.checkKO();
  }

  updateProjectiles(dt) {
    const o = this.opp;
    for (const pr of this.projectiles) {
      pr.age += dt;
      pr.x += pr.speed * dt;
      if (!pr.dead && o.state !== 'ko' && pr.x >= o.x - 50) {
        pr.dead = true;
        // 원거리 박치기는 가드를 무시하고 빈틈 배율은 받지 않는다
        this.damageOpp(pr.damage);
        this.addGauge(this.R.gauge.hit);
        this.stats.headbuttHits++;
        o.x += this.R.hitPush;
        o.hitT = 0;
        this.hitStop = this.R.hitStop;
        this.emit('hit', { who: 'opp', x: o.x - 40, damage: pr.damage, counter: false, kind: 'ranged' });
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
