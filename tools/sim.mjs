// 경기 로직 시뮬레이션 (렌더링 없이 node에서 실행)
// 사용법: node tools/sim.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Match, EMPTY_INPUT } from '../src/game.js';

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

console.log(`\n${failures === 0 ? '모든 검사 통과' : `실패 ${failures}건`}`);
process.exit(failures ? 1 : 0);
