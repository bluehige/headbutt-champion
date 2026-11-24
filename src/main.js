// 진입점: 화면 흐름, 루프, 화면 맞춤.
// 흐름: 로딩 → 타이틀 → 대진표 → 경기 전 소개(상대 그림 불러오기) → 경기 → 결과
//        → (이기면) [레벨업·기술 습득] → 대진표 … → 7경기 승리 → 엔딩
//        → (지거나 비기면) 같은 경기 바로 재도전
// 디버그: ?debug=1 → 예전처럼 시험 상대(더미) 자유 대전, ?debug=1&stage=N → N경기로 바로(저장 안 함)
//         경기 중 L 레벨업, T 남은 시간 5초, K 상대 체력 1, J 내 체력 1
import { Match, EMPTY_INPUT } from './game.js';
import { Assets } from './assets.js';
import { Input } from './input.js';
import { MatchView, W, H } from './render.js';
import { drawHUD, drawTitle, drawIntro, drawResult, drawLoading, drawBracket, drawLevelUp, drawEnding } from './ui.js';
import { loadSave, writeSave, clearSave } from './save.js';

const params = new URLSearchParams(location.search);
const DEBUG = params.get('debug') === '1';
const DEBUG_STAGE = DEBUG ? Number(params.get('stage')) || 0 : 0;
const FREE_PLAY = DEBUG && !(DEBUG_STAGE >= 1 && DEBUG_STAGE <= 7); // 시험 상대 자유 대전
const FORCE_TOUCH = params.get('touch') === '1';
const STEP = 1 / 120;

const stage = document.getElementById('stage');
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = new Input();

let backing = 1;
let fitW = 0;
let fitH = 0;
// 실제로 보이는 영역 크기. 휴대폰은 주소창·하단 바 때문에 innerHeight와 다를 수 있어 visualViewport를 우선한다.
function viewSize() {
  const vv = window.visualViewport;
  if (vv && vv.width > 0 && vv.height > 0) return { w: vv.width, h: vv.height, x: vv.offsetLeft, y: vv.offsetTop };
  return { w: window.innerWidth, h: window.innerHeight, x: 0, y: 0 };
}
function fit() {
  const v = viewSize();
  fitW = v.w;
  fitH = v.h;
  const s = Math.min(v.w / W, v.h / H);
  stage.style.left = `${v.x + v.w / 2}px`;
  stage.style.top = `${v.y + v.h / 2}px`;
  stage.style.transform = `translate(-50%, -50%) scale(${s})`;
  const k = Math.min(2, Math.max(1, s * (window.devicePixelRatio || 1)));
  if (Math.abs(k - backing) > 0.01 || canvas.width !== Math.round(W * k)) {
    backing = k;
    canvas.width = Math.round(W * k);
    canvas.height = Math.round(H * k);
  }
}
window.addEventListener('resize', fit);
window.addEventListener('orientationchange', fit);
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', fit);
  window.visualViewport.addEventListener('scroll', fit);
}
// 일부 휴대폰 브라우저는 화면을 돌리거나 주소창이 접힐 때 resize를 너무 일찍(옛 크기로) 보내거나 아예 안 보낸다.
// 그래서 크기가 바뀌었는지 주기적으로 다시 확인한다.
setInterval(() => {
  const v = viewSize();
  if (Math.abs(v.w - fitW) > 0.5 || Math.abs(v.h - fitH) > 0.5) fit();
}, 250);
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

const assets = new Assets({ onlyBase: params.get('nopose') === '1', forceStatic: params.get('static') === '1' });
let data = null;
let scene = { name: 'loading', k: 0, msg: '' };
let buttons = [];
let sceneT = 0;
let acc = 0;
let pending = null;
let lag = { p: 1, o: 1 };
// 진행: 다음 경기 번호(1~7, 8 = 우승)와 레벨
let progress = { stage: 1, level: 1 };
let saved = null; // 타이틀에 보여 줄 저장
let confirmReset = 0; // 처음부터 확인 남은 시간
let curOpp = null; // 지금 경기 상대 데이터
let curVisual = null; // 지금 상대 그림 { sprite, tint, scale }
const visuals = {}; // 상대 id → 그림(대진표 얼굴용)
let loadToken = 0;
let freeLevel = Math.max(1, Math.min(5, Number(params.get('lv')) || 1));

async function loadJSON(url) {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`${url} 불러오기 실패 (${res.status})`);
  return res.json();
}

const opponentsByStage = () => [...data.opponents.opponents].sort((a, b) => a.stage - b.stage);
const oppForStage = (s) => data.opponents.opponents.find((o) => o.stage === s);
const skillForLevel = (lv) => data.skills.skills.find((s) => s.level === lv && s.id !== 'basic');
// 그 경기에 들어갈 때의 레벨 = 앞 경기들의 보상 레벨 중 가장 높은 값
function levelForStage(s) {
  let lv = 1;
  for (const o of data.opponents.opponents) if (o.stage < s && o.rewardLevel) lv = Math.max(lv, o.rewardLevel);
  return lv;
}

function freeOpponent() {
  const list = data.opponents.opponents;
  const want = params.get('opp');
  if (want) {
    const found = list.find((o) => o.id === want) || (data.opponents.debugOpponent.id === want ? data.opponents.debugOpponent : null);
    if (found) return found;
  }
  return data.opponents.debugOpponent;
}

function persist() {
  if (DEBUG) return; // 디버그 진행은 실제 저장을 건드리지 않는다
  writeSave(progress.stage, progress.level);
  saved = loadSave();
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
  saved = DEBUG ? null : loadSave();
  // 타이틀에 필요한 것만 먼저: 아저씨, 키 아트, 첫 배경, 기술 아이콘(작음)
  scene.msg = '이마 데우는 중…';
  const parts = { p: 0, rest: 0 };
  const upd = () => {
    scene.k = parts.p * 0.75 + parts.rest * 0.25;
  };
  const restJobs = [
    assets.loadImageAsset('ui', 'title_key', { process: false }),
    assets.loadBg('dong_gym'),
    ...data.skills.skills.filter((s) => s.icon).map((s) => assets.loadImageAsset('ui', s.icon, { targetH: 256 })),
  ];
  let restDone = 0;
  restJobs.forEach((p) => p.then(() => {
    restDone++;
    parts.rest = restDone / restJobs.length;
    upd();
  }));
  await Promise.all([
    assets.loadSprite(data.skills.player.sprite, { onProgress: (k) => { parts.p = k; upd(); } }),
    ...restJobs,
  ]);
  if (DEBUG_STAGE >= 1 && DEBUG_STAGE <= 7) {
    progress = { stage: DEBUG_STAGE, level: Math.max(levelForStage(DEBUG_STAGE), Number(params.get('lv')) || 0) };
    goIntro();
    return;
  }
  goTitle();
}

function goTitle() {
  scene = { name: 'title' };
  sceneT = 0;
  confirmReset = 0;
  document.body.classList.remove('in-match');
}

function startCampaign(fresh) {
  if (FREE_PLAY) {
    curOpp = freeOpponent();
    goIntro();
    return;
  }
  if (fresh || !saved || saved.stage > 7) {
    if (!DEBUG) clearSave();
    progress = { stage: 1, level: 1 };
    persist();
  } else {
    progress = { stage: saved.stage, level: Math.max(saved.level, levelForStage(saved.stage)) };
  }
  goBracket();
}

// 대진표의 얼굴: 알게 된 상대(이긴 상대 + 다음 상대)의 idle만 불러온다
async function ensureVisual(def, poses) {
  await assets.loadSprite(def.sprite, { poses });
  let v;
  if (assets.hasBase(def.sprite)) {
    v = { sprite: def.sprite, tint: def.tint || null, scale: null };
  } else {
    // 이 상대 그림이 아직 하나도 없으면 곽두팔 그림에 색을 입혀 구분한다
    const fb = def.fallback || { sprite: 'gwak', tint: '#888888', scale: [1, 1] };
    await assets.loadSprite(fb.sprite, { poses });
    v = { sprite: fb.sprite, tint: fb.tint || null, tintAlpha: 0.42, scale: fb.scale || null };
  }
  visuals[def.id] = v;
  return v;
}

function goBracket() {
  scene = { name: 'bracket' };
  sceneT = 0;
  document.body.classList.remove('in-match');
  const t = data.opponents.tournaments.find((x) => x.stages.includes(progress.stage));
  if (t) assets.loadBg(t.bg);
  for (const o of data.opponents.opponents) {
    if (o.stage <= progress.stage && !visuals[o.id]) ensureVisual(o, ['idle']);
  }
}

function goIntro() {
  if (!FREE_PLAY) curOpp = oppForStage(progress.stage);
  scene = { name: 'intro', loadK: 0 };
  sceneT = 0;
  document.body.classList.remove('in-match');
  const def = curOpp;
  const token = ++loadToken;
  curVisual = null;
  // 다른 상대의 큰 포즈는 내려 둔다(idle만 남김)
  for (const o of data.opponents.opponents) if (o.sprite !== def.sprite) assets.unloadSprite(o.sprite);
  const level = FREE_PLAY ? freeLevel : progress.level;
  const jobs = [];
  let n = 0;
  const done = () => {
    n++;
    if (token === loadToken && scene.name === 'intro') scene.loadK = Math.min(0.99, n / jobs.length);
  };
  jobs.push(ensureVisual(def, null).then((v) => {
    curVisual = v;
    done();
  }));
  jobs.push(assets.loadBg(def.bg).then(done));
  if (def.helmet || (def.pattern && Object.keys(def.pattern).some((id) => data.opponents.attackTypes[id] && data.opponents.attackTypes[id].throw))) {
    for (const f of ['proj_trophy', 'proj_bowling', 'helmet_shard']) jobs.push(assets.loadImageAsset('fx', f, { targetH: 256 }).then(done));
  }
  if (level >= 5) jobs.push(assets.loadImageAsset('fx', 'forehead_wave', { targetH: 512 }).then(done));
  Promise.all(jobs).then(() => {
    if (token === loadToken && scene.name === 'intro') scene.loadK = 1;
  });
}

function setTouchSkills(level) {
  const need = { q: 2, w: 3, e: 5 };
  document.querySelectorAll('[data-btn="q"],[data-btn="w"],[data-btn="e"]').forEach((el) => {
    el.classList.toggle('locked', level < need[el.dataset.btn]);
  });
}

function goMatch() {
  const level = FREE_PLAY ? freeLevel : progress.level;
  const m = new Match({
    skillsData: data.skills,
    opponentsData: data.opponents,
    opponent: curOpp,
    level,
    seed: (Date.now() & 0xffffffff) >>> 0,
  });
  const view = new MatchView(assets, m, data.skills.player, data.skills.captions, curVisual);
  scene = { name: 'match', m, view };
  sceneT = 0;
  acc = 0;
  pending = null;
  lag = { p: 1, o: 1 };
  setTouchSkills(level);
  document.body.classList.add('in-match');
  window.__match = m; // 콘솔·자동 시험용(읽기 전용으로만 쓴다)
}

function goResult(m) {
  scene = { name: 'result', m };
  sceneT = 0;
  document.body.classList.remove('in-match');
  if (FREE_PLAY || m.result.outcome !== 'win') return;
  // 이긴 순간 진행을 저장한다(결과 화면에서 꺼도 다음 경기부터)
  const won = progress.stage;
  const reward = curOpp.rewardLevel;
  scene.levelUp = reward && reward > progress.level ? reward : 0;
  progress = { stage: won + 1, level: Math.max(progress.level, reward || 0) };
  persist();
}

function afterWin() {
  const r = scene;
  if (r.levelUp) {
    scene = { name: 'levelup', level: r.levelUp, skill: skillForLevel(r.levelUp) };
    sceneT = 0;
    return;
  }
  continueAfterLevel();
}

function continueAfterLevel() {
  if (progress.stage > 7) {
    scene = { name: 'ending' };
    sceneT = 0;
    assets.loadBg('champ_dome');
    return;
  }
  goBracket();
}

function doAction(a) {
  switch (a) {
    case 'continue':
      startCampaign(false);
      break;
    case 'newgame':
      if (saved && saved.stage <= 7 && !confirmReset && !FREE_PLAY) {
        confirmReset = 3;
        break;
      }
      startCampaign(true);
      break;
    case 'start':
      startCampaign(false);
      break;
    case 'fight':
      if (scene.name === 'intro' && scene.loadK >= 1) goMatch();
      break;
    case 'retry':
      goMatch();
      break;
    case 'next':
      if (scene.name === 'result') afterWin();
      else if (scene.name === 'levelup') continueAfterLevel();
      break;
    case 'title':
      goTitle();
      break;
    default:
      break;
  }
}

// 캔버스 클릭/터치 → 화면 버튼. 버튼 밖을 눌러도 넘어가는 화면이 있다.
canvas.addEventListener('pointerdown', (e) => {
  const r = canvas.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * W;
  const y = ((e.clientY - r.top) / r.height) * H;
  const hit = buttons.find((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
  if (hit) doAction(hit.action);
  else if (scene.name === 'title' && sceneT > 0.3 && !(saved && saved.stage <= 7)) doAction('newgame');
  else if (scene.name === 'bracket' && sceneT > 0.4) goIntro();
  else if (scene.name === 'intro' && sceneT > 0.5) doAction('fight');
  else if (scene.name === 'levelup' && sceneT > 0.6) doAction('next');
  else if (scene.name === 'ending' && sceneT > 1.5) goTitle();
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
  confirmReset = Math.max(0, confirmReset - dt);
  const go = input.wasPressed('Enter', 'Space');
  switch (scene.name) {
    case 'title':
      if (sceneT > 0.2) {
        if (go) doAction(saved && saved.stage <= 7 ? 'continue' : 'newgame');
        else if (input.wasPressed('KeyN')) doAction('newgame');
      }
      break;
    case 'bracket':
      if (go && sceneT > 0.3) goIntro();
      else if (input.wasPressed('Escape')) goTitle();
      break;
    case 'intro':
      if (go && sceneT > 0.4) doAction('fight');
      else if (input.wasPressed('Escape')) goTitle();
      break;
    case 'match': {
      const { m, view } = scene;
      if (DEBUG) {
        if (input.wasPressed('KeyL') && m.levelUp()) {
          if (FREE_PLAY) freeLevel = m.level;
          setTouchSkills(m.level);
        }
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
        if (input.wasPressed('Enter', 'KeyR')) {
          if (scene.m.result.outcome === 'win' && !FREE_PLAY) afterWin();
          else goMatch();
        } else if (input.wasPressed('Escape')) goTitle();
      }
      break;
    case 'levelup':
      if (go && sceneT > 0.6) continueAfterLevel();
      break;
    case 'ending':
      if (go && sceneT > 1.5) goTitle();
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
    oppDef: curOpp,
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
      buttons = drawTitle(ctx, assets, sceneT, {
        ...common,
        save: FREE_PLAY ? null : saved,
        confirmReset: confirmReset > 0,
        debugNote: FREE_PLAY ? 'DEBUG 모드: 시험 상대 자유 대전 · 경기 중 L 레벨업 T 시간 K 상대1 J 나1 · &stage=N 으로 N경기' : null,
      });
      break;
    case 'bracket':
      buttons = drawBracket(ctx, assets, sceneT, {
        ...common,
        tournaments: data.opponents.tournaments,
        opponents: opponentsByStage(),
        stage: progress.stage,
        level: progress.level,
        visuals,
      });
      break;
    case 'intro':
      buttons = drawIntro(ctx, assets, sceneT, { ...common, visual: curVisual || visuals[curOpp.id], loadK: scene.loadK });
      break;
    case 'match':
      scene.view.draw(ctx);
      drawHUD(ctx, scene.m, scene.view, { ...common, lag });
      break;
    case 'result':
      buttons = drawResult(ctx, assets, sceneT, { ...common, match: scene.m, freePlay: FREE_PLAY });
      break;
    case 'levelup': {
      const t = data.opponents.tournaments.find((x) => x.stages.includes(Math.min(7, progress.stage)));
      buttons = drawLevelUp(ctx, assets, sceneT, {
        ...common,
        level: scene.level,
        skill: scene.skill,
        nextOpp: progress.stage <= 7 ? oppForStage(progress.stage) : null,
        bg: t ? t.bg : 'dong_gym',
      });
      break;
    }
    case 'ending':
      buttons = drawEnding(ctx, assets, sceneT, common);
      break;
    default:
      break;
  }
}

// 자동 시험용 훅: 브라우저 탭이 가려져 rAF가 멈춰도, 콘솔에서 프레임을 직접 돌려 실제 화면 흐름을 확인할 수 있다.
//   __test.hold = true;  __test.tick(1/60);  __test.scene  __test.progress  __test.act('next')
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
  get progress() {
    return { ...progress };
  },
  get loadK() {
    return scene.loadK;
  },
  get buttons() {
    return buttons.map((b) => ({ label: b.label, action: b.action }));
  },
  act(a) {
    doAction(a);
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
