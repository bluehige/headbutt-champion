// 경기 로직 시뮬레이션 (렌더링 없이 node에서 실행)
// 사용법: node tools/sim.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Match, EMPTY_INPUT, makeRng } from '../src/game.js';
import { readerBot, masherBot } from './bots.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillsData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/skills.json'), 'utf8'));
const opponentsData = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/opponents.json'), 'utf8'));
const GWAK = opponentsData.opponents.find((o) => o.id === 'gwak');
const DUMMY = opponentsData.debugOpponent;
const STEP = 1 / 120;

let failures = 0;
function check(cond, msg) {
  console.log(`${cond ? '  OK ' : '  FAIL'} ${msg}`);
  if (!cond) failures++;
}

// bot(m, mem) → 입력 객체. 반환 객체의 *Pressed는 그 스텝에서만 유효
function run(opponent, bot, { seed = 1, level = 1, maxTime = 80 } = {}) {
  const m = new Match({ skillsData, opponentsData, opponent, level, seed });
  const mem = { lastTele: -1, events: [] };
  let t = 0;
  while (!m.done && t < maxTime) {
    const inp = { ...EMPTY_INPUT, ...(bot(m, mem) || {}) };
    m.update(STEP, inp);
    for (const e of m.drainEvents()) mem.events.push(e);
    t += STEP;
  }
  return { m, mem };
}

const answerKey = { high: 'duckPressed', low: 'backPressed' };

// 정답 봇: 예고 끝나기 0.25초 전에 정답 입력, 잡기는 박치기로 끊고, 빈틈엔 박치기
function perfectBot(m, mem, opts = {}) {
  const o = m.opp;
  const p = m.player;
  const R = m.R;
  const inp = {};
  if (o.state === 'telegraph') {
    const id = `${m.clock.toFixed(0)}-${o.attackId}-${mem.teleCount || 0}`;
    if (o.t < STEP * 1.5) mem.teleCount = (mem.teleCount || 0) + 1;
    const tg = o.attack.telegraph;
    if (tg === 'grab') {
      if (m.dist > R.headbutt.reach) inp.right = true;
      else if (o.t > 0.3 && p.state === 'idle') inp.hbPressed = true;
    } else if (o.dur - o.t <= 0.25 && mem.answered !== mem.teleCount) {
      mem.answered = mem.teleCount;
      inp[answerKey[tg]] = true;
    }
    void id;
  } else if (o.state === 'stun' && !opts.noCounter) {
    if (m.dist > R.headbutt.reach - 5) inp.right = true;
    else inp.hbPressed = true;
    if (opts.useSkill && m.hasSkill(opts.useSkill) && p.gauge >= m.skills[opts.useSkill].cost) {
      inp.hbPressed = false;
      inp[opts.skillKey] = true;
    }
  } else if (opts.noCounter && opts.hitOnce && m.stats.headbuttHits === 0 && o.state === 'idle' && !o.guard && m.dist <= R.headbutt.reach - 40 && p.state === 'idle') {
    inp.hbPressed = true;

  } else if (opts.approach !== false && m.dist > R.headbutt.reach - 5) {
    inp.right = true;
  }
  return inp;
}

function fixedAnswerBot(key) {
  const mem2 = { n: 0, answered: 0 };
  return (m) => {
    const o = m.opp;
    const inp = {};
    if (o.state === 'telegraph') {
      if (o.t < STEP * 1.5) mem2.n++;
      if (o.dur - o.t <= 0.25 && mem2.answered !== mem2.n) {
        mem2.answered = mem2.n;
        inp[key] = true;
      }
    }
    return inp;
  };
}

function summary(m) {
  const s = m.stats;
  return `결과=${m.result ? m.result.outcome + '/' + m.result.reason : '없음'} 남은시간=${m.timeLeft.toFixed(1)} 나=${m.player.hp}/${m.player.maxHp} 상대=${m.opp.hp}/${m.opp.maxHp} ` +
    `예고(▲${s.telegraphs.high} ▶${s.telegraphs.low} ●${s.telegraphs.grab}) 회피(▲${s.evades.high} ▶${s.evades.low} ●${s.evades.grab}) ` +
    `피격(▲${s.hitsTaken.high} ▶${s.hitsTaken.low} ●${s.hitsTaken.grab}) 반격=${s.counters} 명중=${s.headbuttHits} 막힘=${s.blocks}`;
}

console.log('\n[1] 곽두팔 vs 정답 봇 (읽고 → 숙이고 → 박는다)');
for (const seed of [1, 2, 3]) {
  const { m } = run(GWAK, (mm, mem) => perfectBot(mm, mem), { seed });
  console.log('   ', summary(m));
  check(m.result && m.result.outcome === 'win' && m.result.reason === 'ko', `seed ${seed}: KO 승리`);
  check(m.stats.telegraphs.low === 0 && m.stats.telegraphs.grab === 0, `seed ${seed}: 곽두팔은 빨강(상단)만 사용`);
  check(m.stats.hitsTaken.high === 0, `seed ${seed}: 피격 0`);
  check(m.stats.counters > 0 && m.opp.maxHp - m.opp.hp >= 30, `seed ${seed}: 반격 피해 30 이상 들어감`);
}

console.log('\n[2] 곽두팔 vs 가만히 있는 봇');
{
  const { m } = run(GWAK, () => ({}), { seed: 5 });
  console.log('   ', summary(m));
  check(m.result && m.result.outcome === 'lose' && m.result.reason === 'ko', 'KO 패배');
  check(m.stats.hitsTaken.high > 0 && m.stats.evades.high === 0, '빨강 공격에 맞음');
}

console.log('\n[3] 곽두팔 vs 피하기만 하는 봇 → 시간 종료');
{
  const { m } = run(GWAK, (mm, mem) => perfectBot(mm, mem, { noCounter: true }), { seed: 7 });
  console.log('   ', summary(m));
  check(m.result && m.result.reason === 'decision', '시간 종료 판정까지 감');
  check(m.timeLeft === 0, '타이머 0');
  check(m.result.outcome === 'draw', '체력 비율 동률 → 무승부(재경기)');
}
{
  const { m } = run(GWAK, (mm, mem) => perfectBot(mm, mem, { noCounter: true, hitOnce: true }), { seed: 8 });
  console.log('   ', summary(m));
  check(m.result && m.result.reason === 'decision' && m.result.outcome === 'win', '한 번 맞히고 버티면 판정승');
}

console.log('\n[4] 시험용 상대(예고 3종) vs 정답 봇');
{
  const tot = { tele: { high: 0, low: 0, grab: 0 }, ev: { high: 0, low: 0, grab: 0 }, taken: 0, wins: 0 };
  for (const seed of [11, 12, 13, 14, 15]) {
    const { m } = run(DUMMY, (mm, mem) => perfectBot(mm, mem), { seed });
    console.log('   ', summary(m));
    const s = m.stats;
    for (const k of ['high', 'low', 'grab']) {
      tot.tele[k] += s.telegraphs[k];
      tot.ev[k] += s.evades[k];
    }
    tot.taken += s.hitsTaken.high + s.hitsTaken.low + s.hitsTaken.grab;
    if (m.result.outcome === 'win') tot.wins++;
  }
  check(tot.tele.high > 0 && tot.tele.low > 0 && tot.tele.grab > 0, `5판 합계 예고 3종 모두 나옴 (▲${tot.tele.high} ▶${tot.tele.low} ●${tot.tele.grab})`);
  check(tot.ev.high === tot.tele.high && tot.ev.low === tot.tele.low && tot.ev.grab === tot.tele.grab, '모든 예고를 정답으로 회피(잡기는 박치기로 끊기)');
  check(tot.taken === 0 && tot.wins === 5, `피격 ${tot.taken}, 승리 ${tot.wins}/5`);
}

console.log('\n[5] 오답 판정: 무엇이 오든 숙이기만 / 물러서기만');
{
  const { m } = run(DUMMY, fixedAnswerBot('duckPressed'), { seed: 21 });
  console.log('    숙이기만:', summary(m));
  const s = m.stats;
  check(s.evades.high > 0 && s.hitsTaken.high === 0, '빨강은 숙이기로 회피');
  check(s.hitsTaken.low > 0 && s.evades.low === 0, '파랑은 숙이기로 못 피함');
  check(s.hitsTaken.grab > 0 && s.evades.grab === 0, '노랑은 숙이기로 못 피함(잡힘)');
}
{
  const { m } = run(DUMMY, fixedAnswerBot('backPressed'), { seed: 22 });
  console.log('    물러서기만:', summary(m));
  const s = m.stats;
  check(s.evades.low > 0 && s.hitsTaken.low === 0, '파랑은 물러서기로 회피');
  check(s.hitsTaken.high > 0 && s.evades.high === 0, '빨강은 물러서기로 못 피함');
  check(s.hitsTaken.grab > 0, '노랑은 물러서기로 못 피함');
}
{
  // 잡기 피해가 일반 피해의 2배인지
  const { m, mem } = run(DUMMY, () => ({}), { seed: 23 });
  const grabHit = mem.events.find((e) => e.type === 'hit' && e.who === 'player' && e.tg === 'grab');
  const hookHit = mem.events.find((e) => e.type === 'hit' && e.who === 'player' && e.tg === 'high');
  check(grabHit && hookHit && grabHit.damage === hookHit.damage * 2, `잡히면 큰 피해(${grabHit && grabHit.damage} vs ${hookHit && hookHit.damage})`);
  void m;
}

console.log('\n[6] 수치: 회피 +20, 빈틈 0.8초, 반격 2.5배, 미리 누르면 실패');
{
  // 예고 시작하자마자 숙이면 0.5초 뒤 풀려서 맞아야 한다
  const mem2 = { n: 0, a: 0 };
  const { m } = run(GWAK, (mm) => {
    const o = mm.opp;
    if (o.state === 'telegraph') {
      if (o.t < STEP * 1.5) mem2.n++;
      if (mem2.a !== mem2.n) {
        mem2.a = mem2.n;
        return { duckPressed: true };
      }
    }
    return {};
  }, { seed: 31 });
  check(m.stats.evades.high === 0 && m.stats.hitsTaken.high > 0, '예고 시작에 미리 숙이면 회피 실패');
}
{
  let gaugeAfter = null;
  let stunDur = null;
  let counterDmg = null;
  const m = new Match({ skillsData, opponentsData, opponent: GWAK, level: 1, seed: 41 });
  const mem = {};
  let t = 0;
  while (!m.done && t < 70 && counterDmg === null) {
    const inp = { ...EMPTY_INPUT, ...perfectBot(m, mem) };
    const g0 = m.player.gauge;
    m.update(STEP, inp);
    for (const e of m.drainEvents()) {
      if (e.type === 'evade' && gaugeAfter === null) {
        gaugeAfter = m.player.gauge - g0;
        stunDur = m.opp.dur;
      }
      if (e.type === 'hit' && e.counter) counterDmg = e.damage;
    }
    t += STEP;
  }
  check(gaugeAfter === 20, `회피 성공 소맥 +20 (실제 ${gaugeAfter})`);
  check(Math.abs(stunDur - 0.8) < 1e-9, `빈틈 ${stunDur}초`);
  check(counterDmg === 30, `빈틈 박치기 피해 ${counterDmg} (= 12 × 2.5)`);
}

console.log('\n[7] 기술 Lv.2~5');
{
  // Lv.2 이환이형: 빈틈에 Q
  const { m, mem } = run(GWAK, (mm, me) => perfectBot(mm, me, { useSkill: 'double', skillKey: 'slot1' }), { seed: 51, level: 2 });
  const used = m.stats.skillsUsed.double || 0;
  const dHits = mem.events.filter((e) => e.type === 'hit' && e.kind === 'double');
  console.log('    Lv.2:', summary(m), `사용=${used}`);
  check(used > 0 && dHits.length >= 2, `이환이형 박치기 사용 ${used}회, 타격 ${dHits.length}번`);
  check(dHits.some((e) => e.damage === 18), '둘째 타 18 피해');
}
{
  // Lv.2 둘째 타 가드 관통: 가드 중인 상대에게 Q
  const m = new Match({ skillsData, opponentsData, opponent: { ...GWAK, guardChance: 1, attackInterval: 99, pattern: {} }, level: 2, seed: 52 });
  m.player.gauge = 100;
  let pierced = false, blocked = false;
  for (let t = 0; t < 8 && !m.done; t += STEP) {
    const inp = { ...EMPTY_INPUT };
    if (m.phase === 'fight' && m.dist > m.R.headbutt.reach - 30) inp.right = true;
    else if (m.phase === 'fight' && m.opp.guard && m.player.state === 'idle' && !m.stats.skillsUsed.double) inp.slot1 = true;
    m.update(STEP, inp);
    for (const e of m.drainEvents()) {
      if (e.type === 'block') blocked = true;
      if (e.type === 'hit' && e.kind === 'double' && e.pierced) pierced = true;
    }
  }
  check(blocked && pierced, '이환이형: 첫 타는 가드에 막히고 둘째 타는 가드 관통');
}
{
  // Lv.3 금강불괴: 아무것도 안 하고 W만 → 공격 무효 + 상대 빈틈
  const m = new Match({ skillsData, opponentsData, opponent: DUMMY, level: 3, seed: 61 });
  m.player.gauge = 100;
  let iron = 0;
  for (let t = 0; t < 20 && !m.done && iron < 2; t += STEP) {
    const inp = { ...EMPTY_INPUT };
    if (m.opp.state === 'telegraph' && m.player.ironTime <= 0 && m.player.gauge >= 40) inp.slot2 = true;
    m.update(STEP, inp);
    for (const e of m.drainEvents()) if (e.type === 'ironBlock') iron++;
  }
  check(iron > 0 && m.stats.hitsTaken.high + m.stats.hitsTaken.low + m.stats.hitsTaken.grab === 0, `금강불괴 이마로 ${iron}번 받아냄, 피격 0`);
}
{
  // Lv.4 결재 박치기: Space 1초 이상 누르고 떼기 → 28 피해, 가드 파괴
  const m = new Match({ skillsData, opponentsData, opponent: { ...GWAK, guardChance: 1, attackInterval: 99, pattern: {} }, level: 4, seed: 71 });
  let hold = 0, dmg = null, gb = false, phaseFired = false;
  for (let t = 0; t < 10 && !m.done && dmg === null; t += STEP) {
    const inp = { ...EMPTY_INPUT };
    if (m.phase === 'fight') {
      if (m.dist > m.R.headbutt.reach - 30 && !phaseFired) inp.right = true;
      else if (m.opp.guard || phaseFired) {
        phaseFired = true;
        hold += STEP;
        if (hold === STEP) inp.hbPressed = true;
        inp.hbHeld = hold < 1.3;
      }
    }
    m.update(STEP, inp);
    for (const e of m.drainEvents()) {
      if (e.type === 'hit' && e.kind === 'kyuljae') dmg = e.damage;
      if (e.type === 'guardBreak') gb = true;
    }
  }
  check(dmg === 28, `결재 박치기 피해 ${dmg}`);
  check(gb, '결재 박치기 가드 파괴');
}
{
  // Lv.5 원거리 박치기: 멀리서 E
  const m = new Match({ skillsData, opponentsData, opponent: { ...GWAK, attackInterval: 99, pattern: {}, walkSpeed: 0 }, level: 5, seed: 81 });
  m.player.gauge = 100;
  let hit = null;
  for (let t = 0; t < 6 && !m.done && !hit; t += STEP) {
    const inp = { ...EMPTY_INPUT };
    if (m.phase === 'fight' && m.player.state === 'idle' && !m.stats.skillsUsed.ranged) inp.slot3 = true;
    m.update(STEP, inp);
    for (const e of m.drainEvents()) if (e.type === 'hit' && e.kind === 'ranged') hit = { e, dist: m.dist };
  }
  check(hit && hit.e.damage === 25 && hit.dist > 400, `원거리 박치기 거리 ${hit && Math.round(hit.dist)}에서 피해 ${hit && hit.e.damage}`);
  check(m.player.gauge === 100 - 50 + 10, `소맥 50 소모 후 명중 +10 (${m.player.gauge})`);
}
{
  // 게이지 부족·레벨 부족
  const m = new Match({ skillsData, opponentsData, opponent: GWAK, level: 1, seed: 91 });
  const evs = [];
  for (let t = 0; t < 2.5; t += STEP) {
    const inp = { ...EMPTY_INPUT, slot1: m.phase === 'fight' && evs.length === 0 };
    m.update(STEP, inp);
    evs.push(...m.drainEvents().filter((e) => e.type === 'locked' || e.type === 'noGauge'));
  }
  check(evs[0] && evs[0].type === 'locked', 'Lv.1에서 Q → 레벨 부족');
  m.levelUp();
  check(m.level === 2 && m.player.maxHp === 110, '레벨업 시 체력 +10');
}

console.log('\n[8] 곽두팔 vs 마구 박는 봇(읽지 않음)');
{
  let w = 0, l = 0, d = 0;
  for (let seed = 100; seed < 120; seed++) {
    const { m } = run(GWAK, (mm) => {
      const inp = {};
      if (mm.dist > mm.R.headbutt.reach - 10) inp.right = true;
      if (mm.player.state === 'idle') inp.hbPressed = true;
      return inp;
    }, { seed });
    if (m.result.outcome === 'win') w++;
    else if (m.result.outcome === 'lose') l++;
    else d++;
  }
  console.log(`    20판: 승 ${w} / 패 ${l} / 무 ${d}`);
  check(w < l, '마구 누르기는 읽는 쪽보다 불리하다(정답 봇은 전승)');
}

// ═════════════════════════ M2: 상대 7명 ═════════════════════════
const OPP = Object.fromEntries(opponentsData.opponents.map((o) => [o.id, o]));
const STAGES = opponentsData.opponents.slice().sort((a, b) => a.stage - b.stage);
// 경기 시작 시 레벨 = 1 + 앞 경기들의 rewardLevel로 오른 만큼
function levelAt(stage) {
  let lv = 1;
  for (const o of STAGES) if (o.stage < stage && o.rewardLevel) lv = Math.max(lv, o.rewardLevel);
  return lv;
}
const SOLUTION = { mabongchun: 'double', gregor: 'kyuljae', helmet: 'ranged' };

function runBot(opponent, bot, { seed = 1, level = 1, maxTime = 80, onStep } = {}) {
  const m = new Match({ skillsData, opponentsData, opponent, level, seed });
  const events = [];
  let t = 0;
  while (!m.done && t < maxTime) {
    const inp = { ...EMPTY_INPUT, ...(bot(m) || {}) };
    m.update(STEP, inp);
    const evs = m.drainEvents();
    for (const e of evs) events.push(e);
    if (onStep) onStep(m, evs);
    t += STEP;
  }
  return { m, events };
}

function batch(opponent, makeBot, { seeds = 30, level, seed0 = 1000 } = {}) {
  const r = { n: 0, win: 0, ko: 0, lose: 0, draw: 0, timeToKO: [], hpLeft: [], dealt: [], taken: [] };
  for (let i = 0; i < seeds; i++) {
    const seed = seed0 + i * 7;
    const { m } = runBot(opponent, makeBot(seed), { seed, level });
    r.n++;
    const o = m.result ? m.result.outcome : 'none';
    if (o === 'win') r.win++;
    else if (o === 'lose') r.lose++;
    else r.draw++;
    if (o === 'win' && m.result.reason === 'ko') {
      r.ko++;
      r.timeToKO.push(m.R.matchTime - m.timeLeft);
    }
    r.hpLeft.push(m.player.hp / m.player.maxHp);
    r.dealt.push(1 - m.opp.hp / m.opp.maxHp);
    r.taken.push(m.stats.damageTaken);
  }
  const avg = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : NaN);
  r.winRate = r.win / r.n;
  r.koRate = r.ko / r.n;
  r.avgKO = avg(r.timeToKO);
  r.avgDealt = avg(r.dealt);
  r.avgHp = avg(r.hpLeft);
  return r;
}
const pct = (v) => `${Math.round(v * 100)}%`.padStart(4);
const fmt = (r) => `승 ${pct(r.winRate)} (KO ${pct(r.koRate)}${r.ko ? `, 평균 ${r.avgKO.toFixed(1)}초` : ''})  패 ${r.lose}  무 ${r.draw}  상대 체력 깎음 ${pct(r.avgDealt)}  내 체력 남음 ${pct(r.avgHp)}`;

const seededRng = (seed) => makeRng(seed * 31 + 7);
const perfect = (skills) => (seed) => readerBot({ skills, rng: seededRng(seed) });
// 사람에 가까운 봇: 위협 10%는 틀리고, 누르는 시점이 들쭉날쭉하며, 30%는 첫 표시에 곧바로 반응한다
const human = (skills) => (seed) => readerBot({ skills, err: 0.1, react: [0.1, 0.42], naive: 0.3, rng: seededRng(seed) });
const masher = () => () => masherBot();

console.log('\n[9] 7경기 전체: 정답 봇 / 사람 비슷한 봇 / 해법 없는 봇 / 마구 박는 봇 (각 30판)');
const table = {};
for (const opp of STAGES) {
  const lv = levelAt(opp.stage);
  const sol = SOLUTION[opp.id];
  const noSol = sol ? { [sol]: false } : null;
  const row = {
    perfect: batch(opp, perfect({}), { level: lv }),
    human: batch(opp, human({}), { level: lv }),
    masher: batch(opp, masher(), { level: lv }),
  };
  if (noSol) {
    row.perfectNoSol = batch(opp, perfect(noSol), { level: lv });
    row.humanNoSol = batch(opp, human(noSol), { level: lv });
  }
  table[opp.id] = row;
  console.log(`  ${opp.stage}. ${opp.name} (Lv.${lv}, 체력 ${opp.hp}${opp.helmet ? ` + 헬멧 ${opp.helmet.hp}` : ''})`);
  console.log(`     정답 봇        ${fmt(row.perfect)}`);
  console.log(`     사람 비슷한 봇 ${fmt(row.human)}`);
  if (noSol) {
    console.log(`     정답 봇(${sol} 안 씀) ${fmt(row.perfectNoSol)}`);
    console.log(`     사람 봇(${sol} 안 씀) ${fmt(row.humanNoSol)}`);
  }
  console.log(`     마구 박는 봇   ${fmt(row.masher)}`);
  check(row.perfect.winRate === 1, `${opp.name}: 예고를 읽는 정답 봇 전승`);
  check(row.masher.lose / row.masher.n >= 0.6, `${opp.name}: 마구 박는 봇은 대부분 진다 (패 ${row.masher.lose}/${row.masher.n})`);
  check(row.human.winRate >= 0.6, `${opp.name}: 사람 비슷한 봇도 이길 수 있다 (${pct(row.human.winRate)})`);
  if (noSol) {
    const dropHuman = row.human.winRate - row.humanNoSol.winRate;
    const dropKO = row.perfect.koRate - row.perfectNoSol.koRate;
    check(dropHuman >= 0.3 || dropKO >= 0.5,
      `${opp.name}: ${sol}을 안 쓰면 눈에 띄게 불리 (사람 봇 승률 ${pct(row.human.winRate)}→${pct(row.humanNoSol.winRate)}, 정답 봇 KO ${pct(row.perfect.koRate)}→${pct(row.perfectNoSol.koRate)})`);
  }
}
{
  const all = Object.values(table).reduce((a, r) => ({ lose: a.lose + r.masher.lose, n: a.n + r.masher.n }), { lose: 0, n: 0 });
  check(all.lose / all.n >= 0.75, `마구 박는 봇: 7경기 합계 패배 ${all.lose}/${all.n}`);
}
check(table.helmet.humanNoSol.winRate <= 0.2, `더 헬멧: 근접만으로는 사실상 못 이긴다 (사람 봇 ${pct(table.helmet.humanNoSol.winRate)}, 정답 봇 KO ${pct(table.helmet.perfectNoSol.koRate)})`);
check(table.helmet.perfectNoSol.koRate === 0, '더 헬멧: 근접만 쓰는 정답 봇은 KO를 못 낸다');

console.log('\n[10] 새 규칙 판정');
{
  // 오순자: 파랑 위주, 가끔 빨강
  const s = { high: 0, low: 0, grab: 0 };
  for (let sd = 0; sd < 5; sd++) {
    const { m } = runBot(OPP.osunja, readerBot({ passive: true, rng: seededRng(3 + sd) }), { seed: 3 + sd, level: 2 });
    for (const k in s) s[k] += m.stats.telegraphs[k];
  }
  check(s.low > s.high * 1.5 && s.high > 0 && s.grab === 0, `오순자: 파랑 ${s.low} > 빨강 ${s.high}, 잡기 없음`);
}
{
  // 마봉춘: 잡기 위주, 빈틈에도 단단한 가드 → 일반 반격은 막히고 이환이형 둘째 타가 관통 반격
  const a = runBot(OPP.mabongchun, readerBot({ skills: { double: false }, rng: seededRng(4) }), { seed: 4, level: 3 });
  const b = runBot(OPP.mabongchun, readerBot({ rng: seededRng(4) }), { seed: 4, level: 3 });
  const s = a.m.stats.telegraphs;
  check(s.grab > s.high, `마봉춘: 노랑(잡기) ${s.grab} > 빨강 ${s.high}`);
  check(a.m.stats.stunBlocks > 0 && a.m.stats.counters === 0, `마봉춘: 빈틈에 기본 박치기는 막힘 ${a.m.stats.stunBlocks}회, 반격 0`);
  const piercedCounter = b.events.filter((e) => e.type === 'hit' && e.who === 'opp' && e.counter && e.kind === 'double' && e.pierced);
  check(piercedCounter.length > 0 && piercedCounter[0].damage === 45, `마봉춘: 이환이형 둘째 타가 빈틈 가드를 뚫고 반격 ${piercedCounter.length}회 (피해 ${piercedCounter[0] && piercedCounter[0].damage})`);
}
{
  // 고회전: 콤보. 첫 타를 피해도 빈틈 없음 → 곧바로 둘째 예고, 둘째까지 피해야 빈틈
  let firstEvadeNoStun = 0, firstEvadeStun = 0, secondStun = 0, minSecond = 9;
  const { m } = runBot(OPP.gohoejeon, readerBot({ passive: true, rng: seededRng(5) }), {
    seed: 5, level: 3,
    onStep(mm, evs) {
      for (const e of evs) {
        if (e.type === 'evade' && e.chain) {
          if (mm.opp.state === 'telegraph' && mm.opp.chained) firstEvadeNoStun++;
          if (mm.opp.state === 'stun') firstEvadeStun++;
        }
        if (e.type === 'telegraph' && e.chained) minSecond = Math.min(minSecond, e.dur);
        if (e.type === 'evade' && !e.chain && mm.opp.state === 'stun' && mm.opp.attack && mm.opp.attack.chainOnly) secondStun++;
      }
    },
  });
  check(m.stats.chains > 0 && firstEvadeNoStun === m.stats.chainEvades && firstEvadeStun === 0, `고회전: 콤보 첫 타 회피 ${firstEvadeNoStun}회 모두 빈틈 없이 둘째 예고로`);
  check(secondStun > 0, `고회전: 둘째 타까지 피하면 빈틈 (${secondStun}회)`);
  const types = Object.keys(OPP.gohoejeon.pattern).filter((k) => opponentsData.attackTypes[k].chain);
  const colorsDiffer = types.every((k) => opponentsData.attackTypes[k].telegraph !== opponentsData.attackTypes[opponentsData.attackTypes[k].chain].telegraph);
  check(colorsDiffer, '고회전: 콤보는 빨강·파랑이 섞여 있다');
  check(minSecond >= 0.55, `고회전: 둘째 예고도 반응할 시간 ${minSecond.toFixed(2)}초 이상 (연속 회피 허용)`);
  check(m.stats.hitsTaken.high + m.stats.hitsTaken.low === 0, '고회전: 정답 봇은 콤보를 모두 피함');
  // 첫 타를 맞아도 둘째 타가 이어진다
  const idle = runBot(OPP.gohoejeon, () => ({}), { seed: 6, level: 3 });
  const hits = idle.events.filter((e) => e.type === 'hit' && e.who === 'player');
  const chainedHit = hits.some((e) => opponentsData.attackTypes[e.attack].chainOnly);
  check(chainedHit, '고회전: 첫 타를 맞아도 둘째 타가 이어진다');
  // 첫 타를 피한 뒤 성급하게 박으면 둘째 예고(힘준 상태)에 막힌다(빈틈이 아니다)
  let rash = 0, rashHit = 0, rashBlock = 0, waiting = false;
  const rb = readerBot({ passive: true, rng: seededRng(7) });
  runBot(OPP.gohoejeon, (mm) => {
    const inp = rb(mm);
    if (mm.player.evaded && (mm.player.state === 'duck' || mm.player.state === 'backstep') && mm.opp.state === 'telegraph' && mm.opp.chained) {
      rash++;
      waiting = true;
      return { hbPressed: true };
    }
    return inp;
  }, {
    seed: 7, level: 3,
    onStep(mm, evs) {
      for (const e of evs) {
        if (!waiting) continue;
        if (e.type === 'block') { rashBlock++; waiting = false; }
        if (e.type === 'hit' && e.who === 'opp') { rashHit++; waiting = false; }
      }
    },
  });
  check(rash > 0 && rashBlock > 0 && rashHit === 0, `고회전: 첫 타 피하고 바로 박으면 둘째 예고에 막힌다 (막힘 ${rashBlock}, 명중 ${rashHit})`);
}
{
  // 엘 프렌테: 속임. 예고가 도중에 바뀌고, 바뀐 뒤에도 새 예고 시간 전체가 남는다
  let minAfter = 9, switches = 0, kindChanged = 0;
  const { m } = runBot(OPP.frente, readerBot({ rng: seededRng(8) }), {
    seed: 8, level: 4,
    onStep(mm, evs) {
      for (const e of evs) if (e.type === 'feint') {
        switches++;
        if (e.from !== e.tg) kindChanged++;
        minAfter = Math.min(minAfter, e.dur);
      }
    },
  });
  check(switches > 0 && kindChanged === switches, `엘 프렌테: 속임 ${switches}회, 모두 다른 종류로 바뀜`);
  check(minAfter >= OPP.frente.telegraphTime - 1e-9, `엘 프렌테: 바뀐 뒤 남은 시간 ${minAfter.toFixed(2)}초 ≥ 기본 예고 ${OPP.frente.telegraphTime}초`);
  const tk = m.stats.hitsTaken;
  check(tk.high + tk.low + tk.grab === 0, '엘 프렌테: 끝까지 보는 정답 봇은 속임도 모두 피함');
  // 첫 표시에 바로 반응하는 봇은 속임에 걸린다(보통 공격은 피한다)
  let baited = 0, baitTotal = 0, plainHit = 0, plainTotal = 0;
  for (let sd = 0; sd < 30; sd++) {
    let curFeint = false;
    runBot(OPP.frente, readerBot({ naive: 1, rng: seededRng(200 + sd) }), {
      seed: 200 + sd, level: 4,
      onStep(mm, evs) {
        for (const e of evs) {
          if (e.type === 'telegraph') curFeint = false;
          if (e.type === 'feint') curFeint = true;
          const resolved = (e.type === 'hit' && e.who === 'player') || e.type === 'evade' || e.type === 'grabBreak';
          if (resolved && e.type !== 'grabBreak') {
            if (curFeint) { baitTotal++; if (e.type === 'hit') baited++; }
            else { plainTotal++; if (e.type === 'hit') plainHit++; }
          }
        }
      },
    });
  }
  check(baitTotal > 0 && baited / baitTotal > 0.5 && plainHit / Math.max(1, plainTotal) < 0.2,
    `엘 프렌테: 첫 표시에 바로 반응하면 속임에 걸림 (속임 피격 ${baited}/${baitTotal}, 보통 공격 피격 ${plainHit}/${plainTotal})`);
}
{
  // 그레고르: 철벽 가드. 이환이형 둘째 타도 막히고, 결재 박치기만 가드를 부순다. 잽은 빈틈이 얕다
  const g = { ...OPP.gregor, attackInterval: 99, pattern: {} };
  const m = new Match({ skillsData, opponentsData, opponent: g, level: 4, seed: 9 });
  m.player.gauge = 100;
  const evs = [];
  for (let t = 0; t < 6 && !m.done; t += STEP) {
    const inp = { ...EMPTY_INPUT };
    if (m.phase === 'fight' && m.dist > m.R.headbutt.reach - 30) inp.right = true;
    else if (m.phase === 'fight' && m.opp.guard && m.player.state === 'idle' && !m.stats.skillsUsed.double) inp.slot1 = true;
    m.update(STEP, inp);
    evs.push(...m.drainEvents());
  }
  const blocks = evs.filter((e) => e.type === 'block');
  check(m.stats.skillsUsed.double === 1 && blocks.length >= 2 && blocks.some((e) => e.iron) && !evs.some((e) => e.type === 'hit' && e.who === 'opp'),
    `그레고르: 이환이형 두 타 모두 철벽에 막힘 (막힘 ${blocks.length})`);
  const { m: m2, events } = runBot(OPP.gregor, readerBot({ rng: seededRng(10) }), { seed: 10, level: 4 });
  check(m2.stats.guardBreaks > 0 && events.some((e) => e.type === 'guardBreak'), `그레고르: 결재 박치기로 가드 파괴 ${m2.stats.guardBreaks}회`);
  let jabStun = null, jabMul = null;
  runBot(OPP.gregor, readerBot({ skills: { kyuljae: false }, rng: seededRng(11) }), {
    seed: 11, level: 4,
    onStep(mm, es) {
      for (const e of es) if (e.type === 'evade' && jabStun === null && mm.opp.state === 'stun') { jabStun = mm.opp.dur; jabMul = mm.opp.counterMul; }
    },
  });
  check(Math.abs(jabStun - 0.8 * 0.55) < 1e-6 && jabMul === 0.4, `그레고르: 잽을 피하면 빈틈 ${jabStun && jabStun.toFixed(2)}초, 반격 배율 ×${jabMul}`);
  check(OPP.gregor.guardChance >= 0.95, `그레고르: 거의 항상 가드 (가드 확률 ${OPP.gregor.guardChance})`);
}
{
  // 더 헬멧: 발사체가 실제로 날아오고, 상단(트로피)은 숙이기, 하단(볼링공)은 물러서기로 피한다
  const h = OPP.helmet;
  let moved = false, firstX = null;
  const kinds = new Set();
  const { m, events } = runBot(h, readerBot({ rng: seededRng(12), skills: { ranged: false } }), {
    seed: 12, level: 5,
    onStep(mm) {
      const pr = mm.oppProjectiles[0];
      if (pr) {
        kinds.add(`${pr.kind}:${pr.tg}`);
        if (firstX === null) firstX = pr.x;
        else if (pr.x < firstX - 100) moved = true;
      }
    },
  });
  // 던지기는 멀리서만 하므로, 다가가지 않고 피하기만 하는 봇으로 따로 본다
  const keepOut = readerBot({ rng: seededRng(16), passive: true });
  const far = runBot(h, (mm) => { const i = keepOut(mm); delete i.right; return i; }, {
    seed: 16, level: 5,
    onStep(mm) {
      const pr = mm.oppProjectiles[0];
      if (pr) {
        kinds.add(`${pr.kind}:${pr.tg}`);
        if (firstX === null) firstX = pr.x;
        else if (pr.x < firstX - 100) moved = true;
      }
    },
  });
  check(far.m.stats.throws > 0 && moved, `더 헬멧: 던진 물건 ${far.m.stats.throws}개, 화면을 가로질러 날아옴`);
  check(kinds.has('trophy:high') && kinds.has('bowling:low'), `더 헬멧: 트로피=빨강, 볼링공=파랑 (${[...kinds].join(', ')})`);
  const projEv = far.events.filter((e) => e.type === 'evade' && e.proj);
  check(projEv.some((e) => e.proj === 'trophy' && e.tg === 'high') && projEv.some((e) => e.proj === 'bowling' && e.tg === 'low') && far.m.stats.projHits === 0,
    `더 헬멧: 정답 봇은 트로피는 숙여서, 볼링공은 물러서서 모두 피함 (${projEv.length}회, 피격 ${far.m.stats.projHits})`);
  // 오답이면 맞는다
  const duckOnly = runBot(h, fixedAnswerBotProj('duckPressed'), { seed: 13, level: 5 });
  check(duckOnly.m.stats.projHits > 0 && duckOnly.events.some((e) => e.type === 'hit' && e.who === 'player' && e.proj === 'bowling'), '더 헬멧: 볼링공은 숙여도 맞는다');
  // 다가가면 달아남
  check(m.stats.retreatTime > 1, `더 헬멧: 다가가면 달아남 (뒤로 빠진 시간 ${m.stats.retreatTime.toFixed(1)}초)`);
  // 헬멧: 근접 피해 감소, 원거리 박치기로만 헬멧이 깎임
  const melee = events.filter((e) => e.type === 'hit' && e.who === 'opp' && e.kind !== 'ranged');
  check(melee.length > 0 && melee.every((e) => e.damage <= Math.round(30 * h.helmet.bodyDamageMul)) && m.opp.helmetHp === h.helmet.hp,
    `더 헬멧: 헬멧이 있으면 근접 피해 ×${h.helmet.bodyDamageMul}, 헬멧은 그대로 ${m.opp.helmetHp}`);
  const withRanged = runBot(h, readerBot({ rng: seededRng(14) }), { seed: 14, level: 5 });
  const hh = withRanged.events.filter((e) => e.type === 'helmetHit');
  const br = withRanged.events.findIndex((e) => e.type === 'helmetBreak');
  check(hh.length > 0 && hh[0].damage === 25 && br >= 0, `더 헬멧: 원거리 박치기로 헬멧 -25씩, ${hh.length}번 맞혀 파괴`);
  const after = withRanged.events.slice(br + 1).filter((e) => e.type === 'hit' && e.who === 'opp' && e.counter && e.kind === 'basic');
  check(after.length > 0 && after[0].damage === 30, `더 헬멧: 헬멧이 깨진 뒤에는 반격이 온전히 들어감 (${after[0] && after[0].damage})`);
  check(withRanged.m.def.keepAway === 0, '더 헬멧: 헬멧이 깨지면 더는 멀리 달아나지 않음');
  // 금강불괴는 던진 물건도 받아낸다
  const ironM = new Match({ skillsData, opponentsData, opponent: h, level: 5, seed: 15 });
  ironM.player.gauge = 100;
  let ib = 0;
  for (let t = 0; t < 10 && ib === 0 && !ironM.done; t += STEP) {
    const th = ironM.threat();
    const inp = { ...EMPTY_INPUT, slot2: !!th && th.src === 'proj' && th.eta < 0.2 && ironM.player.ironTime <= 0 };
    ironM.update(STEP, inp);
    for (const e of ironM.drainEvents()) if (e.type === 'ironBlock' && e.proj) ib++;
  }
  check(ib > 0 && ironM.stats.projHits === 0, '더 헬멧: 금강불괴로 던진 물건도 받아냄');
}
{
  // 연속 회피, 차지 중 걷기·회피
  const m = new Match({ skillsData, opponentsData, opponent: OPP.gohoejeon, level: 3, seed: 16 });
  let chained = false;
  for (let t = 0; t < 30 && !chained && !m.done; t += STEP) {
    const th = m.threat();
    const inp = { ...EMPTY_INPUT };
    if (th && th.eta < (m.opp.chained ? 0.45 : 0.25)) inp[th.tg === 'high' ? 'duckPressed' : 'backPressed'] = true;
    const before = m.player.state;
    m.update(STEP, inp);
    m.drainEvents();
    if ((before === 'duck' && m.player.state === 'backstep') || (before === 'backstep' && m.player.state === 'duck')) chained = true;
  }
  check(chained, '연속 회피: 피한 직후 곧바로 다른 회피로 이어짐');
  const c = new Match({ skillsData, opponentsData, opponent: { ...OPP.gregor, attackInterval: 99, pattern: {} }, level: 4, seed: 17 });
  let x0 = null, moved = false, cancelled = false;
  for (let t = 0; t < 4 && !c.done; t += STEP) {
    const inp = { ...EMPTY_INPUT };
    if (c.phase === 'fight') {
      inp.hbHeld = true;
      if (c.player.state === 'idle' && c.player.t > 0.05 && x0 === null) inp.hbPressed = true;
      if (c.player.state === 'charge') {
        if (x0 === null) x0 = c.player.x;
        inp.right = true;
        if (c.player.x > x0 + 20) moved = true;
        if (c.player.t > 0.5) inp.duckPressed = true;
      }
    }
    const before = c.player.state;
    c.update(STEP, inp);
    if (before === 'charge' && c.player.state === 'duck') cancelled = true;
  }
  check(moved && cancelled, '결재 박치기: 차지 중 천천히 걸을 수 있고, 숙이기로 끊을 수 있다');
}
{
  // 레벨 표: 1경기 승 Lv.2, 동대회 우승 Lv.3, 전국 우승 Lv.4, 세계 우승 Lv.5
  const lv = STAGES.map((o) => levelAt(o.stage));
  check(JSON.stringify(lv) === JSON.stringify([1, 2, 3, 3, 4, 4, 5]), `경기별 시작 레벨 ${lv.join(',')}`);
}

function fixedAnswerBotProj(key) {
  const done = new Set();
  return (m) => {
    const th = m.threat();
    if (th && th.eta <= 0.25 && !done.has(th.key) && m.player.state === 'idle') {
      done.add(th.key);
      return { [key]: true };
    }
    return {};
  };
}

console.log(`\n${failures === 0 ? '모든 검사 통과' : `실패 ${failures}건`}`);
process.exit(failures ? 1 : 0);
