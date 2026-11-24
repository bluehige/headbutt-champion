// 진입점: 화면 흐름(로딩 → 타이틀 → 경기 전 소개 → 경기 → 결과), 루프, 화면 맞춤.
import { Match, EMPTY_INPUT } from './game.js';
import { Assets } from './assets.js';
import { Input } from './input.js';
import { MatchView, W, H } from './render.js';
import { drawHUD, drawTitle, drawIntro, drawResult, drawLoading } from './ui.js';

const params = new URLSearchParams(location.search);
const DEBUG = params.get('debug') === '1';
const FORCE_TOUCH = params.get('touch') === '1';
const STEP = 1 / 120;

const stage = document.getElementById('stage');
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = new Input();

let backing = 1;
function fit() {
  const s = Math.min(window.innerWidth / W, window.innerHeight / H);
  stage.style.transform = `translate(-50%, -50%) scale(${s})`;
  const k = Math.min(2, Math.max(1, s * (window.devicePixelRatio || 1)));
  if (Math.abs(k - backing) > 0.01 || canvas.width !== Math.round(W * k)) {
    backing = k;
    canvas.width = Math.round(W * k);
    canvas.height = Math.round(H * k);
  }
}
window.addEventListener('resize', fit);
fit();

// 터치 기기 판정: 터치 버튼은 터치 기기에서만 보인다
const isTouch = FORCE_TOUCH || window.matchMedia('(pointer: coarse)').matches;
if (isTouch) document.body.classList.add('touch');
window.addEventListener('touchstart', () => document.body.classList.add('touch'), { once: true, passive: true });
const touchOn = () => document.body.classList.contains('touch');

document.querySelectorAll('[data-btn]').forEach((el) => input.bindButton(el, el.dataset.btn));

// 웹폰트 미리 요청(실패해도 대체 글꼴로 진행)
if (document.fonts && document.fonts.load) {
  ['40px "Black Han Sans"', '700 20px "Pretendard"', '900 20px "Pretendard"'].forEach((f) => document.fonts.load(f).catch(() => {}));
}

const assets = new Assets({ onlyBase: params.get('nopose') === '1' });
let data = null;
let scene = { name: 'loading', k: 0, msg: '' };
let buttons = [];
let sceneT = 0;
let acc = 0;
let pending = null;
let debugLevel = Math.max(1, Math.min(5, Number(params.get('lv')) || 1));
let lag = { p: 1, o: 1 };

async function loadJSON(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`${url} 불러오기 실패 (${res.status})`);
  return res.json();
}

function chooseOpponent() {
  const list = data.opponents.opponents;
  const want = params.get('opp');
  if (want) {
    const found = list.find((o) => o.id === want) || (data.opponents.debugOpponent.id === want ? data.opponents.debugOpponent : null);
    if (found) return found;
  }
  return DEBUG ? data.opponents.debugOpponent : list[0];
}

async function boot() {
  if (location.protocol === 'file:') {
    document.getElementById('fileWarn').hidden = false;
  }
  try {
    const [skills, opponents] = await Promise.all([loadJSON('data/skills.json'), loadJSON('data/opponents.json')]);
    data = { skills, opponents };
  } catch (e) {
    scene = { name: 'error', msg: String(e.message || e) };
    console.error(e);
    return;
  }
  const opp = chooseOpponent();
  const spriteIds = [...new Set([data.skills.player.sprite, opp.sprite])];
  let done = 0;
  const total = spriteIds.length * 16 + 1;
  const tick = () => {
    done++;
    scene.k = done / total;
  };
  scene.msg = '이마 데우는 중…';
  await Promise.all([...spriteIds.map((id) => assets.loadSprite(id, tick)), assets.loadBg(opp.bg).then(tick)]);
  if (!assets.bgs.dong_gym && opp.bg !== 'dong_gym') await assets.loadBg('dong_gym');
  data.opp = opp;
  goTitle();
}

function goTitle() {
  scene = { name: 'title' };
  sceneT = 0;
  document.body.classList.remove('in-match');
}

function goIntro() {
  scene = { name: 'intro' };
  sceneT = 0;
}

function goMatch() {
  const m = new Match({
    skillsData: data.skills,
    opponentsData: data.opponents,
    opponent: data.opp,
    level: DEBUG ? debugLevel : 1,
    seed: (Date.now() & 0xffffffff) >>> 0,
  });
  const view = new MatchView(assets, m, data.skills.player, data.skills.captions);
  scene = { name: 'match', m, view };
  sceneT = 0;
  acc = 0;
  pending = null;
  lag = { p: 1, o: 1 };
  document.body.classList.add('in-match');
  window.__match = m; // 콘솔·자동 시험용(읽기 전용으로만 쓴다)
}

function goResult(m) {
  scene = { name: 'result', m };
  sceneT = 0;
  document.body.classList.remove('in-match');
}

function doAction(a) {
  if (a === 'start') goIntro();
  else if (a === 'fight' || a === 'retry') goMatch();
  else if (a === 'title') goTitle();
}

// 캔버스 클릭/터치 → 화면 버튼
canvas.addEventListener('pointerdown', (e) => {
  const r = canvas.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * W;
  const y = ((e.clientY - r.top) / r.height) * H;
  const hit = buttons.find((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
  if (hit) doAction(hit.action);
  else if (scene.name === 'title' && sceneT > 0.3) doAction('start');
  else if (scene.name === 'intro' && sceneT > 0.5) doAction('fight');
});

function mergeEdges(a, b) {
  if (!a) return b;
  return {
    ...b,
    duckPressed: a.duckPressed || b.duckPressed,
    backPressed: a.backPressed || b.backPressed,
    hbPressed: a.hbPressed || b.hbPressed,
    slot1: a.slot1 || b.slot1,
    slot2: a.slot2 || b.slot2,
    slot3: a.slot3 || b.slot3,
  };
}

function update(dt) {
  sceneT += dt;
  const go = input.wasPressed('Enter', 'Space');
  switch (scene.name) {
    case 'title':
      if (go && sceneT > 0.2) goIntro();
      break;
    case 'intro':
      if (go && sceneT > 0.4) goMatch();
      else if (input.wasPressed('Escape')) goTitle();
      break;
    case 'match': {
      const { m, view } = scene;
      if (DEBUG) {
        if (input.wasPressed('KeyL') && m.levelUp()) debugLevel = m.level;
        if (input.wasPressed('KeyT') && m.phase === 'fight') m.timeLeft = Math.min(m.timeLeft, 5);
        if (input.wasPressed('KeyK') && m.phase === 'fight') m.opp.hp = Math.min(m.opp.hp, 1);
        if (input.wasPressed('KeyJ') && m.phase === 'fight') m.player.hp = Math.min(m.player.hp, 1);
      }
      pending = mergeEdges(pending, input.gameInput());
      acc += dt;
      while (acc >= STEP) {
        const inp = pending || { ...EMPTY_INPUT, ...input.gameInput(), duckPressed: false, backPressed: false, hbPressed: false, slot1: false, slot2: false, slot3: false };
        pending = null;
        m.update(STEP, inp);
        acc -= STEP;
      }
      view.update(dt);
      lag.p = Math.max(m.player.hp / m.player.maxHp, lag.p - dt * 0.5);
      lag.o = Math.max(m.opp.hp / m.opp.maxHp, lag.o - dt * 0.5);
      if (m.done) goResult(m);
      break;
    }
    case 'result':
      if (sceneT > 0.6) {
        if (input.wasPressed('Enter', 'KeyR')) goMatch();
        else if (input.wasPressed('Escape')) goTitle();
      }
      break;
    default:
      break;
  }
}

function draw() {
  ctx.setTransform(backing, 0, 0, backing, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  buttons = [];
  const common = {
    playerDef: data && data.skills.player,
    oppDef: data && data.opp,
    telegraphs: data && data.opponents.telegraphs,
    touch: touchOn(),
    debug: DEBUG,
  };
  switch (scene.name) {
    case 'loading':
      drawLoading(ctx, scene.k, scene.msg);
      break;
    case 'error':
      drawLoading(ctx, 0, `오류: ${scene.msg}`);
      break;
    case 'title':
      buttons = drawTitle(ctx, assets, sceneT, common);
      break;
    case 'intro':
      buttons = drawIntro(ctx, assets, sceneT, common);
      break;
    case 'match':
      scene.view.draw(ctx);
      drawHUD(ctx, scene.m, scene.view, { ...common, lag });
      break;
    case 'result':
      buttons = drawResult(ctx, assets, sceneT, { ...common, match: scene.m });
      break;
    default:
      break;
  }
}

// 자동 시험용 훅: 브라우저 탭이 가려져 rAF가 멈춰도, 콘솔에서 프레임을 직접 돌려 실제 화면 흐름을 확인할 수 있다.
//   __test.hold = true;  __test.tick(1/60);  __test.scene
const testHook = {
  hold: false,
  tick(dt = 1 / 60) {
    update(dt);
    draw();
    input.endFrame();
  },
  get scene() {
    return scene.name;
  },
};
window.__test = testHook;

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
  last = now;
  if (testHook.hold) {
    requestAnimationFrame(frame);
    return;
  }
  try {
    update(dt);
    draw();
  } catch (e) {
    console.error(e);
  }
  input.endFrame();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
boot();
