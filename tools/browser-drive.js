// 브라우저 자동 시험 도우미. 게임 페이지 콘솔에서:
//   await import('/tools/browser-drive.js');
//   __drive.frames(60);                                   // 프레임 60개 진행
//   __drive.until(() => __match.done, __drive.bots.reader()) // 예고를 읽는 봇으로 경기 끝까지
//   await __drive.campaign()                               // 타이틀 → … → 엔딩까지 자동 진행(결과 목록 반환)
// 실제 키보드 이벤트를 window에 보내고, __test.tick()으로 프레임을 직접 돌린다(탭이 가려져 rAF가 멈춰도 동작).
// reader 봇은 node 시뮬레이션과 같은 tools/bots.mjs 를 쓴다.
import { readerBot, masherBot } from './bots.mjs';

const send = (type, code) => window.dispatchEvent(new KeyboardEvent(type, { code, key: code }));
const T = window.__test;
T.hold = true;
let ups = [];
const holding = {};
const tap = (code, frames = 3) => {
  if (holding[code]) return;
  send('keydown', code);
  holding[code] = true;
  ups.push([code, frames]);
};
const hold = (code, on) => {
  if (!!holding[code] === on) return;
  holding[code] = on;
  send(on ? 'keydown' : 'keyup', code);
};
function step(bot) {
  ups = ups.filter((u) => {
    if (u[1] <= 0) {
      holding[u[0]] = false;
      send('keyup', u[0]);
      return false;
    }
    u[1]--;
    return true;
  });
  if (bot) bot();
  T.tick(1 / 60);
}

// bots.mjs의 입력 객체({left,right,duckPressed,…})를 키 이벤트로 바꾼다
function fromInputBot(make) {
  const b = make();
  let space = false;
  return () => {
    const m = window.__match;
    if (!m || T.scene !== 'match') return;
    const inp = b(m) || {};
    hold('ArrowRight', !!inp.right);
    hold('ArrowLeft', !!inp.left);
    if (inp.duckPressed) tap('ArrowDown', 1);
    if (inp.backPressed) tap('ShiftLeft', 1);
    if (inp.slot1) tap('KeyQ', 1);
    if (inp.slot2) tap('KeyW', 1);
    if (inp.slot3) tap('KeyE', 1);
    const want = !!(inp.hbHeld || inp.hbPressed);
    if (inp.hbPressed && space) {
      send('keyup', 'Space');
      send('keydown', 'Space');
    } else if (want && !space) send('keydown', 'Space');
    else if (!want && space) send('keyup', 'Space');
    space = want;
  };
}

const bots = {
  idle: () => () => {},
  reader: (opts = {}) => fromInputBot(() => readerBot(opts)),
  masher: () => fromInputBot(() => masherBot()),
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function press(code) {
  tap(code, 2);
  for (let i = 0; i < 4; i++) step();
}

// 타이틀부터 엔딩까지. opts.fresh(기본 true)면 '처음부터', 아니면 '이어하기'.
// opts.loseFirst: 이 경기 번호에서 한 번은 일부러 진다(재도전 확인용)
async function campaign(opts = {}) {
  const log = [];
  const fresh = opts.fresh ?? true;
  let lostOnce = false;
  for (let guard = 0; guard < 400; guard++) {
    const sc = T.scene;
    if (sc === 'title') {
      if (fresh) {
        T.act('newgame');
        if (T.scene === 'title') T.act('newgame'); // 저장이 있으면 확인 한 번 더
      } else T.act('continue');
      step();
    } else if (sc === 'bracket') {
      log.push({ at: 'bracket', progress: T.progress });
      press('Enter');
    } else if (sc === 'intro') {
      let w = 0;
      while ((T.loadK ?? 1) < 1 && w < 300) {
        await sleep(50);
        step();
        w++;
      }
      press('Enter');
    } else if (sc === 'match') {
      const m = window.__match;
      const stageNo = T.progress.stage;
      const lose = opts.loseFirst === stageNo && !lostOnce;
      const bot = lose ? bots.idle() : bots.reader({ rng: mulberry(stageNo * 7 + 1) });
      if (lose) lostOnce = true;
      let i = 0;
      while (!m.done && i < 120 * 60) {
        step(bot);
        if (lose && m.phase === 'fight' && m.player.hp > 1) m.player.hp = 1; // 빨리 지게
        i++;
      }
      hold('ArrowRight', false);
      hold('ArrowLeft', false);
      if (holding.Space) hold('Space', false);
      for (let k = 0; k < 4; k++) step();
      log.push({ at: 'match', stage: stageNo, opp: m.oppDef.id, lv: m.level, result: m.result, hp: [m.player.hp, m.opp.hp], helmet: m.opp.helmetHp, time: +m.timeLeft.toFixed(1), skills: { ...m.stats.skillsUsed } });
    } else if (sc === 'result') {
      for (let k = 0; k < 40; k++) step();
      log.push({ at: 'result', buttons: T.buttons.map((b) => b.label), save: localStorage.getItem('bakchigi-champion.save') });
      press('Enter');
    } else if (sc === 'levelup') {
      for (let k = 0; k < 40; k++) step();
      log.push({ at: 'levelup', progress: T.progress });
      press('Enter');
    } else if (sc === 'ending') {
      for (let k = 0; k < 100; k++) step();
      log.push({ at: 'ending', buttons: T.buttons.map((b) => b.label), save: localStorage.getItem('bakchigi-champion.save') });
      if (opts.stopAtEnding !== false) return log;
      press('Enter');
    } else {
      await sleep(50);
      step();
    }
    if (opts.stopAfterMatches && log.filter((l) => l.at === 'match').length >= opts.stopAfterMatches && T.scene !== 'match') return log;
  }
  return log;
}

function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

window.__drive = {
  step,
  tap,
  hold,
  bots,
  campaign,
  frames(n, bot) {
    for (let i = 0; i < n; i++) step(bot);
    return T.scene;
  },
  until(cond, bot, max = 6000) {
    let i = 0;
    while (i < max && !cond()) {
      step(bot);
      i++;
    }
    return { frames: i, ok: !!cond() };
  },
  stat() {
    const m = window.__match;
    if (!m) return { scene: T.scene };
    const s = m.stats;
    return {
      scene: T.scene, phase: m.phase, result: m.result, time: +m.timeLeft.toFixed(1), lv: m.level,
      hp: [m.player.hp, m.player.maxHp, m.opp.hp, m.opp.maxHp], gauge: m.player.gauge,
      tele: s.telegraphs, ev: s.evades, hit: s.hitsTaken, counters: s.counters, hits: s.headbuttHits,
      blocks: s.blocks, skills: s.skillsUsed, iron: s.ironBlocks,
    };
  },
};
