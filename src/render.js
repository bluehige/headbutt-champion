// 경기 장면 그리기: 배경, 캐릭터(포즈 교체 + 코드 트윈), 타격 연출.
// 포즈 이미지가 없으면 idle(아저씨는 ref_sheet)에 기울이기·찌그러뜨리기를 크게 줘서 동작을 구분한다.
import { FONT_TITLE, FONT_BODY, COLORS } from './style.js';

export const W = 1280;
export const H = 720;
export const FLOOR_Y = 650;
export const CHAR_H = 440; // 1024×1536 이미지를 그릴 높이
const FOOT = 0.96; // 이미지 위에서 발까지의 비율(아래에서 약 4~5% 위)

const lerp = (a, b, k) => a + (b - a) * k;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const easeOut = (k) => 1 - (1 - k) * (1 - k);
const pick = (arr) => (arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : '');

// ───────── 배경 ─────────
// img가 없으면 bgId(대회별)에 맞춰 코드로 그린다.
export function drawBackground(ctx, img, dim = 0, bgId = 'dong_gym') {
  if (img) {
    // 1920×1080 → 1280×720 꽉 채우기
    const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  } else {
    drawFallbackBg(ctx, bgId);
  }
  if (dim > 0) {
    ctx.fillStyle = `rgba(10,14,30,${dim})`;
    ctx.fillRect(0, 0, W, H);
  }
}

// 배경 이미지가 아직 없을 때의 대회별 코드 배경(정적인 그림이라 캐시해 둔다)
const bgCache = {};
function drawFallbackBg(ctx, id) {
  if (typeof document === 'undefined') return;
  let c = bgCache[id];
  if (!c) {
    c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    paintFallbackBg(c.getContext('2d'), id);
    bgCache[id] = c;
  }
  ctx.drawImage(c, 0, 0, W, H);
}

function paintFallbackBg(g, id) {
  const horizon = 400;
  const fill = (stops, y0, y1) => {
    const gr = g.createLinearGradient(0, y0, 0, y1);
    stops.forEach(([k, col]) => gr.addColorStop(k, col));
    g.fillStyle = gr;
    g.fillRect(0, y0, W, y1 - y0);
  };
  if (id === 'national_hall') {
    // 전국대회: 나무 벽 체육관, 위에 현수막, 조명 두 줄
    fill([[0, '#3b2a1e'], [1, '#6b4a30']], 0, horizon);
    g.fillStyle = 'rgba(0,0,0,0.18)';
    for (let x = 0; x < W; x += 64) g.fillRect(x, 0, 4, horizon);
    g.fillStyle = '#1d3d7a';
    g.fillRect(140, 70, W - 280, 70);
    g.fillStyle = '#f2b632';
    g.fillRect(140, 134, W - 280, 6);
    g.font = '40px "Black Han Sans", sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = '#f7f3e8';
    g.fillText('전국 이마 선수권 대회', W / 2, 106);
    for (let i = 0; i < 6; i++) {
      const x = 120 + i * 208;
      const rg = g.createRadialGradient(x, 20, 2, x, 20, 80);
      rg.addColorStop(0, 'rgba(255,240,200,0.9)');
      rg.addColorStop(1, 'rgba(255,240,200,0)');
      g.fillStyle = rg;
      g.fillRect(x - 80, 0, 160, 100);
    }
    fill([[0, '#c98d4f'], [1, '#8a5a2e']], horizon, H);
    g.strokeStyle = 'rgba(60,30,10,0.35)';
    g.lineWidth = 2;
    for (let y = horizon + 18; y < H; y += 26) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(W, y);
      g.stroke();
    }
    g.strokeStyle = 'rgba(214,43,31,0.8)';
    g.lineWidth = 6;
    g.strokeRect(60, horizon + 40, W - 120, H - horizon - 20);
  } else if (id === 'world_arena') {
    // 세계대회: 어두운 경기장, 관중석 점, 만국기, 조명 빛줄기
    fill([[0, '#0f1230'], [1, '#2b2060']], 0, horizon);
    for (let i = 0; i < 900; i++) {
      const x = (i * 97) % W;
      const y = 150 + ((i * 53) % (horizon - 160));
      g.fillStyle = ['#d62b1f', '#f2b632', '#2f6fe0', '#f7f3e8', '#2a9d8f'][i % 5];
      g.globalAlpha = 0.25 + ((i * 31) % 50) / 100;
      g.fillRect(x, y, 4, 4);
    }
    g.globalAlpha = 1;
    const flags = ['#d62b1f', '#2f6fe0', '#f2b632', '#2a9d8f', '#f7f3e8', '#8a4fd6'];
    g.strokeStyle = 'rgba(255,255,255,0.6)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(0, 60);
    g.quadraticCurveTo(W / 2, 120, W, 60);
    g.stroke();
    for (let i = 0; i < 24; i++) {
      const x = 26 + i * 53;
      const t = x / W;
      const y = 60 + 4 * 60 * t * (1 - t);
      g.fillStyle = flags[i % flags.length];
      g.beginPath();
      g.moveTo(x - 14, y);
      g.lineTo(x + 14, y);
      g.lineTo(x, y + 30);
      g.closePath();
      g.fill();
    }
    for (const [x, a] of [[200, 0.35], [W - 200, -0.35]]) {
      g.save();
      g.translate(x, 0);
      g.rotate(a);
      const lg = g.createLinearGradient(0, 0, 0, H);
      lg.addColorStop(0, 'rgba(255,255,230,0.35)');
      lg.addColorStop(1, 'rgba(255,255,230,0)');
      g.fillStyle = lg;
      g.beginPath();
      g.moveTo(-20, 0);
      g.lineTo(20, 0);
      g.lineTo(160, H);
      g.lineTo(-160, H);
      g.closePath();
      g.fill();
      g.restore();
    }
    fill([[0, '#3d3f7a'], [1, '#1c1d40']], horizon, H);
    g.fillStyle = 'rgba(242,182,50,0.85)';
    g.fillRect(0, horizon, W, 6);
  } else if (id === 'champ_dome') {
    // 챔피언십: 검정·금색 돔, 방사형 빛, 링 로프
    fill([[0, '#050505'], [1, '#2a2110']], 0, horizon);
    g.save();
    g.translate(W / 2, horizon - 40);
    for (let i = 0; i < 24; i++) {
      g.rotate((Math.PI * 2) / 24);
      g.fillStyle = i % 2 ? 'rgba(242,182,50,0.10)' : 'rgba(242,182,50,0.04)';
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(-60, -900);
      g.lineTo(60, -900);
      g.closePath();
      g.fill();
    }
    g.restore();
    g.strokeStyle = 'rgba(242,182,50,0.55)';
    g.lineWidth = 3;
    for (let r = 300; r < 1100; r += 120) {
      g.beginPath();
      g.arc(W / 2, horizon + 200, r, Math.PI, Math.PI * 2);
      g.stroke();
    }
    fill([[0, '#3a2c10'], [1, '#120d04']], horizon, H);
    for (const [y, col] of [[horizon + 30, '#d62b1f'], [horizon + 70, '#f7f3e8'], [horizon + 110, '#2f6fe0']]) {
      g.fillStyle = col;
      g.fillRect(0, y - 40, W, 6);
    }
    g.fillStyle = '#c9a227';
    g.fillRect(70, horizon - 60, 16, 200);
    g.fillRect(W - 86, horizon - 60, 16, 200);
  } else {
    // 동대회(기본): 회색 벽 + 파랑 매트 + 빨강 띠
    fill([[0, '#5b5a55'], [1, '#8a877c']], 0, 382);
    fill([[0, '#2f5fb0'], [1, '#2a56a0']], 382, 684);
    g.fillStyle = '#c2372c';
    g.fillRect(0, 684, W, H - 684);
  }
}

// ───────── 캐릭터 한 명 그리기 ─────────
// spec: { img, x, screenFacing(+1 오른쪽/-1 왼쪽), nativeFacing(+1/-1), rot, sx, sy, dx, dy,
//         outline: {color, width}, flash: {color, alpha}, tint: {color, alpha}, alpha }
export function drawSprite(ctx, assets, spec) {
  const { img } = spec;
  if (!img) return;
  const h = CHAR_H;
  const w = (img.width / img.height) * h;
  ctx.save();
  ctx.globalAlpha = spec.alpha ?? 1;
  ctx.translate(spec.x + (spec.dx || 0) * spec.screenFacing, FLOOR_Y + (spec.dy || 0));
  ctx.scale(spec.screenFacing, 1);
  ctx.rotate(spec.rot || 0);
  ctx.scale(spec.sx || 1, spec.sy || 1);
  if (spec.nativeFacing !== 1) ctx.scale(-1, 1); // 이미지가 왼쪽을 보고 있으면 뒤집어서 "앞=+x"로 맞춤
  const x0 = -w / 2;
  const y0 = -h * FOOT;
  if (spec.outline) {
    const sil = assets.silhouette(img, spec.outline.color);
    const o = spec.outline.width;
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * Math.PI * 2;
      ctx.drawImage(sil, x0 + Math.cos(ang) * o, y0 + Math.sin(ang) * o, w, h);
    }
  }
  ctx.drawImage(img, x0, y0, w, h);
  if (spec.tint && spec.tint.alpha > 0) {
    ctx.globalAlpha = (spec.alpha ?? 1) * spec.tint.alpha;
    ctx.drawImage(assets.silhouette(img, spec.tint.color), x0, y0, w, h);
  }
  if (spec.flash && spec.flash.alpha > 0) {
    ctx.globalAlpha = (spec.alpha ?? 1) * spec.flash.alpha;
    ctx.drawImage(assets.silhouette(img, spec.flash.color), x0, y0, w, h);
  }
  ctx.restore();
}

function shadow(ctx, x, scale = 1, alpha = 0.35) {
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.beginPath();
  ctx.ellipse(x, FLOOR_Y + 4, 95 * scale, 16 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ───────── 포즈 결정 ─────────
// 반환: { pose, alt, mo:{dx,dy,rot}, sh:{rot,sx,sy}, keep }  keep = 실제 포즈 이미지가 있을 때 남길 변형 비율
function playerLook(p, m, T) {
  const Hb = m.R.headbutt;
  const r = { pose: 'idle', alt: null, mo: { dx: 0, dy: 0, rot: 0 }, sh: { rot: 0, sx: 1, sy: 1 }, keep: 0.15 };
  const { mo, sh } = r;
  switch (p.state) {
    case 'idle':
      if (p.moving) {
        r.pose = 'walk';
        mo.dy = -Math.abs(Math.sin(T * 11)) * 7;
        mo.rot = Math.sin(T * 11) * 0.035;
      } else {
        const b = Math.sin(T * 3) * 0.012;
        sh.sy = 1 + b;
        sh.sx = 1 - b * 0.5;
        r.keep = 1;
      }
      break;
    case 'duck': {
      r.pose = 'duck';
      const k = Math.min(1, p.t / 0.06, Math.max(0, (p.dur - p.t) / 0.08));
      sh.sy = 1 - 0.36 * k;
      sh.sx = 1 + 0.1 * k;
      sh.rot = 0.34 * k;
      mo.dx = -8 * k;
      r.keep = 0;
      break;
    }
    case 'backstep': {
      r.pose = 'backstep';
      const k = clamp(p.t / p.dur, 0, 1);
      sh.rot = -0.2;
      mo.dy = -Math.sin(k * Math.PI) * 18;
      break;
    }
    case 'headbutt': {
      const boost = p.charged ? 1.4 : 1;
      if (p.t < Hb.windup) {
        r.pose = 'headbutt_ready';
        sh.rot = -0.25 * boost;
        sh.sy = 1.03;
      } else {
        r.pose = 'headbutt_hit';
        r.alt = 'headbutt_ready';
        const k = Math.max(0, 1 - (p.t - Hb.windup) / (Hb.active + Hb.recovery));
        sh.rot = (0.44 * k + 0.04) * boost;
        sh.sx = 1 + 0.12 * k;
        sh.sy = 1 - 0.06 * k;
        mo.dx = 16 * k * boost;
      }
      break;
    }
    case 'charge': {
      r.pose = 'headbutt_ready';
      const k = Math.min(1, p.holdTime / m.skills.kyuljae.chargeTime);
      sh.rot = -0.18 - 0.14 * k;
      sh.sy = 1 + 0.03 * k;
      mo.dx = (Math.random() - 0.5) * 6 * k;
      break;
    }
    case 'double': {
      const s = m.skills.double;
      const hits = s.hits.map((h) => h.at);
      let phase = 'ready';
      for (const at of hits) if (p.t >= at && p.t < at + 0.18) phase = 'hit';
      if (phase === 'hit') {
        r.pose = 'headbutt_hit';
        r.alt = 'headbutt_ready';
        sh.rot = 0.42;
        sh.sx = 1.12;
        mo.dx = 14;
      } else {
        r.pose = 'headbutt_ready';
        sh.rot = -0.22;
      }
      break;
    }
    case 'ranged':
      r.pose = 'ranged';
      r.alt = 'headbutt_hit';
      sh.rot = 0.3;
      sh.sx = 1.08;
      mo.dx = 10;
      break;
    case 'recoil': {
      // 가드에 튕겨 나옴
      r.pose = 'headbutt_ready';
      const k = 1 - clamp(p.t / p.dur, 0, 1);
      sh.rot = -0.3 * k;
      mo.dx = Math.sin(T * 50) * 3 * k;
      mo.rot = Math.sin(T * 25) * 0.04 * k;
      break;
    }
    case 'hurt': {
      r.pose = 'hurt';
      const k = 1 - clamp(p.t / p.dur, 0, 1);
      sh.rot = -0.32 * k - 0.04;
      mo.dx = Math.sin(T * 70) * 4 * k;
      break;
    }
    case 'grabbed': {
      r.pose = 'hurt';
      const up = Math.sin(clamp(p.t / p.dur, 0, 1) * Math.PI);
      sh.rot = -0.22;
      mo.dy = -46 * up;
      mo.dx = 18 * up + Math.sin(T * 45) * 5;
      break;
    }
    case 'win':
      r.pose = 'win';
      mo.dy = -Math.abs(Math.sin(T * 5)) * 22;
      sh.rot = Math.sin(T * 5) * 0.05;
      r.keep = 0;
      break;
    case 'ko':
    case 'lose': {
      r.pose = 'lose';
      const k = easeOut(Math.min(1, p.t / 0.5));
      sh.rot = p.state === 'ko' ? -1.42 * k : -0.12 * k;
      sh.sy = p.state === 'ko' ? 1 : 1 - 0.08 * k;
      r.keep = 0;
      break;
    }
    default:
      break;
  }
  return r;
}

// 공격 포즈 후보: 데이터의 attackPose → attack_<예고> → attack(곽두팔) → 예고 포즈
function attackChain(type) {
  if (!type) return ['attack', 'idle'];
  const tg = type.telegraph;
  return [type.attackPose, `attack_${tg}`, 'attack', tg === 'grab' ? 'attack_low' : null, type.telegraphPose, `telegraph_${tg}`].filter(Boolean);
}
function telegraphChain(type) {
  const tg = type.telegraph;
  return [type.telegraphPose, `telegraph_${tg}`, tg === 'grab' ? 'telegraph_low' : null, 'idle'].filter(Boolean);
}

function oppLook(o, m, T) {
  const r = { pose: 'idle', alt: null, mo: { dx: 0, dy: 0, rot: 0 }, sh: { rot: 0, sx: 1, sy: 1 }, keep: 0.15 };
  const { mo, sh } = r;
  switch (o.state) {
    case 'idle':
      if (o.retreating) {
        // 헬멧: 뒤로 달아남(전용 포즈가 없으면 idle을 뒤로 젖혀 종종걸음)
        r.pose = ['retreat', 'idle'];
        mo.dy = -Math.abs(Math.sin(T * 14)) * 8;
        sh.rot = -0.12;
        r.keep = 0.2;
      } else if (o.moving) {
        mo.dy = -Math.abs(Math.sin(T * 9)) * 6;
        mo.rot = Math.sin(T * 9) * 0.03;
      } else {
        const b = Math.sin(T * 2.6 + 1) * 0.012;
        sh.sy = 1 + b;
      }
      if (o.guard && !o.retreating) {
        r.pose = ['guard', 'idle'];
        sh.sy *= 0.95;
        sh.sx = 0.97;
        sh.rot = 0.08;
        r.keep = 0.1;
      }
      break;
    case 'throw': {
      // 던진 직후 잠깐 공격 포즈, 그 뒤엔 던진 쪽을 보며 기다림
      const k = clamp(o.strikeT / 0.3, 0, 1);
      if (k < 1) {
        r.pose = attackChain(o.attack);
        sh.rot = 0.3 * (1 - k);
        sh.sx = 1 + 0.1 * (1 - k);
        mo.dx = 18 * (1 - k);
      }
      break;
    }
    case 'telegraph': {
      const tg = o.attack.telegraph;
      const k = clamp(o.t / o.dur, 0, 1);
      r.pose = telegraphChain(o.attack);
      const tremble = k > 0.65 ? Math.sin(T * 60) * 2.5 : 0;
      if (tg === 'high') {
        sh.rot = -0.24 * easeOut(k);
        sh.sy = 1 + 0.05 * k;
        mo.dx = -14 * k + tremble;
      } else if (tg === 'low') {
        sh.rot = 0.24 * k;
        sh.sy = 1 - 0.15 * k;
        sh.sx = 1 + 0.08 * k;
        mo.dx = -20 * k + tremble;
      } else {
        // 잡기: 전용 포즈가 없으면 가장 가까운 포즈(하단 예고)를 옆으로 벌려 표현
        sh.sx = 1 + 0.2 * k;
        sh.sy = 1 - 0.06 * k;
        sh.rot = 0.1 * k;
        mo.dx = tremble;
      }
      // 속임: 바뀐 직후 몸이 휙 비틀린다
      if (o.feinted && o.t < 0.18) {
        const f = 1 - o.t / 0.18;
        mo.rot += Math.sin(T * 70) * 0.06 * f;
        mo.dx += 10 * f;
      }
      break;
    }
    case 'recover':
    case 'grabHold':
      if (o.strikeT < 0.28 || o.state === 'grabHold') {
        r.pose = attackChain(o.attack);
        const k = o.state === 'grabHold' ? 0.5 : 1 - o.strikeT / 0.28;
        sh.rot = 0.36 * k;
        sh.sx = 1 + 0.14 * k;
        mo.dx = 22 * k;
      }
      break;
    case 'stun':
      if (o.strikeT < 0.2) {
        // 헛친 직후 잠깐은 공격 포즈
        r.pose = attackChain(o.attack);
        sh.rot = 0.4;
        sh.sx = 1.12;
        mo.dx = 26;
      } else {
        r.pose = 'stun';
        sh.rot = -0.08 + Math.sin(T * 12) * 0.07;
        sh.sy = 0.97;
        mo.dx = Math.sin(T * 7) * 4;
      }
      break;
    case 'flinch':
    case 'stagger': {
      r.pose = 'stun';
      const k = 1 - clamp(o.t / o.dur, 0, 1);
      sh.rot = (o.state === 'stagger' ? -0.38 : -0.2) * k;
      mo.dx = Math.sin(T * 70) * 4 * k;
      break;
    }
    case 'ko':
    case 'lose': {
      r.pose = 'lose';
      const k = easeOut(Math.min(1, o.t / 0.55));
      sh.rot = o.state === 'ko' ? -1.42 * k : -0.12 * k;
      sh.sy = o.state === 'ko' ? 1 : 1 - 0.08 * k;
      r.keep = 0;
      break;
    }
    case 'win':
      r.pose = ['win', 'idle'];
      mo.dy = -Math.abs(Math.sin(T * 4)) * 14;
      sh.sx = 1.03 + Math.sin(T * 8) * 0.02;
      break;
    default:
      break;
  }
  if (o.hitT < 0.2) mo.rot -= 0.1 * (1 - o.hitT / 0.2); // 약한 박치기에 살짝 젖혀짐
  return r;
}

// ───────── 타격 연출 ─────────
export class Effects {
  constructor(captions) {
    this.captions = captions || {};
    this.shakeAmp = 0;
    this.particles = [];
    this.texts = [];
    this.flash = { player: null, opp: null };
    this.caption = null; // { text, t, life, prio }
    this.screenFlash = 0;
  }

  say(key, prio = 1, life = 2.4) {
    const text = pick(this.captions[key]);
    if (!text) return;
    if (this.caption && this.caption.t < this.caption.life * 0.6 && this.caption.prio > prio) return;
    this.caption = { text, t: 0, life, prio };
  }

  pop(text, x, y, opt = {}) {
    this.texts.push({
      text, x, y,
      size: opt.size || 64,
      color: opt.color || COLORS.gold,
      stroke: opt.stroke || COLORS.ink,
      life: opt.life || 0.7,
      t: 0,
      vy: opt.vy ?? -40,
      rot: opt.rot ?? (Math.random() - 0.5) * 0.25,
      font: opt.font || FONT_TITLE,
      punch: opt.punch ?? true,
    });
  }

  impact(x, y, big) {
    const n = big ? 18 : 11;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.2;
      this.particles.push({ kind: 'line', x, y, a, r0: big ? 40 : 28, len: (big ? 120 : 70) * (0.7 + Math.random() * 0.6), t: 0, life: big ? 0.28 : 0.2 });
    }
    this.particles.push({ kind: 'ring', x, y, t: 0, life: 0.25, r: big ? 120 : 70 });
  }

  shake(a) {
    this.shakeAmp = Math.max(this.shakeAmp, a);
  }

  sparks(x, y, n = 8) {
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4;
      const v = 260 + Math.random() * 260;
      this.particles.push({ kind: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: 0.35 + Math.random() * 0.2 });
    }
  }

  // 헬멧 조각(이미지가 있으면 helmet_shard.png, 없으면 코드로 그린 금속 조각)
  shards(x, y) {
    for (let i = 0; i < 12; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.8;
      const v = 320 + Math.random() * 420;
      this.particles.push({
        kind: 'shard', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 18,
        size: 26 + Math.random() * 30, t: 0, life: 1.1 + Math.random() * 0.4, seed: i,
      });
    }
    this.sparks(x, y, 14);
  }

  handle(events, m) {
    const p = m.player;
    const o = m.opp;
    const headY = FLOOR_Y - CHAR_H * 0.78;
    for (const e of events) {
      switch (e.type) {
        case 'fight':
          this.pop('박아!', W / 2, H / 2 - 40, { size: 150, color: COLORS.red, stroke: COLORS.paper, life: 0.9, vy: 0, rot: -0.06 });
          break;
        case 'telegraph':
          if (e.chained) {
            this.pop('하나 더!', o.x, headY - 150, { size: 44, color: COLORS.paper, stroke: COLORS.red, life: 0.7 });
          }
          break;
        case 'feint':
          this.feint = { from: e.from, to: e.tg, t: 0 };
          this.pop('속임!', o.x - 10, headY - 160, { size: 54, color: COLORS.gold, stroke: COLORS.ink, life: 0.8 });
          this.shake(4);
          this.say('feint', 3, 1.8);
          break;
        case 'throw':
          if (!this.saidThrow || Math.random() < 0.25) this.say(e.tg === 'high' ? 'throwHigh' : 'throwLow', 1, 1.8);
          this.saidThrow = true;
          break;
        case 'helmetHit':
          this.impact(e.x, headY - 10, false);
          this.sparks(e.x, headY - 20, 10);
          this.pop(`헬멧 -${e.damage}`, e.x + 40, headY - 110, { size: 36, color: '#c9ced8', stroke: COLORS.ink, life: 0.8, punch: false, rot: 0 });
          if (e.left > 0) this.say('helmetHit', 3, 1.8);
          break;
        case 'helmetBreak':
          this.shards(e.x - 20, headY - 20);
          this.shake(20);
          this.screenFlash = 0.22;
          this.pop('헬멧 파괴!', W / 2, H / 2 - 120, { size: 110, color: COLORS.gold, stroke: COLORS.red, life: 1.3, vy: -10, rot: -0.05 });
          this.say('helmetBreak', 8, 3);
          break;
        case 'hit':
          if (e.who === 'opp') {
            const big = e.counter || e.kind === 'kyuljae';
            this.impact(e.x, headY + 20, big);
            this.shake(big ? 18 : 8);
            this.flash.opp = { color: '#ffffff', t: 0, life: big ? 0.22 : 0.14 };
            this.pop(big ? '쾅!!' : '쾅!', e.x, headY - 40, { size: big ? 140 : 86, color: big ? COLORS.red : COLORS.gold, stroke: big ? COLORS.paper : COLORS.ink });
            this.pop(`-${e.damage}`, o.x + 40, headY + 60, { size: big ? 52 : 38, color: COLORS.paper, font: FONT_BODY, punch: false, life: 0.8, rot: 0 });
            const halved = m.def.helmet && o.helmetHp > 0 && e.kind !== 'ranged';
            if (halved) this.pop('헬멧이 받아냄 ½', o.x + 20, headY - 150, { size: 32, color: '#c9ced8', stroke: COLORS.ink, life: 0.8, punch: false, rot: 0 });
            if (e.counter && e.pierced) {
              this.pop('가드 관통!', o.x, headY - 110, { size: 44, color: COLORS.gold, stroke: COLORS.red });
              this.say('pierce', 6, 2.6);
              this.screenFlash = 0.18;
            } else if (e.counter) {
              if (halved && Math.random() < 0.5) this.say('halfDamage', 5, 2.4);
              else this.say('counter', 5, 2.6);
              this.screenFlash = 0.18;
            } else if (e.pierced) this.pop('가드 관통!', o.x, headY - 110, { size: 40, color: COLORS.paper });
          } else {
            this.impact(p.x + 40, headY + 40, false);
            this.shake(e.tg === 'grab' ? 16 : 11);
            this.flash.player = { color: '#ff2a1a', t: 0, life: 0.25 };
            this.pop(e.tg === 'grab' ? '으악!' : '퍽!', p.x + 20, headY - 30, { size: 76, color: COLORS.paper, stroke: COLORS.red });
            this.pop(`-${e.damage}`, p.x - 40, headY + 60, { size: 38, color: '#ff8a7a', font: FONT_BODY, punch: false, life: 0.8, rot: 0 });
            if (e.counterHit) this.pop('박다가 맞음!', p.x, headY - 100, { size: 36, color: '#ff8a7a', stroke: COLORS.ink, life: 0.9 });
            if (e.tg === 'grab') this.say('grabbed', 3);
            else if (e.tg === 'low') this.say('hitLow', 2);
            else this.say('hitHigh', 2);
          }
          break;
        case 'grabBreak':
          this.impact(e.x, headY + 20, true);
          this.shake(14);
          this.flash.opp = { color: COLORS.gold, t: 0, life: 0.2 };
          this.pop('쾅!', e.x, headY - 40, { size: 100, color: COLORS.gold });
          this.say('grabBreak', 4);
          break;
        case 'evade':
          this.pop(e.tg === 'high' ? '숙였다!' : e.tg === 'low' ? '빠졌다!' : '끊었다!', p.x - 10, headY - 70, { size: 46, color: COLORS.paper, stroke: COLORS.navy, life: 0.8 });
          if (e.chain) {
            this.pop('아직이다!', p.x + 40, headY - 130, { size: 40, color: COLORS.gold, stroke: COLORS.red, life: 0.8 });
            this.say('combo', 3, 1.8);
            this.comboEvaded = true;
          } else if (e.noGap) {
            this.pop('빈틈 없음', o.x, headY - 120, { size: 38, color: '#c9ced8', stroke: COLORS.ink, life: 0.8 });
          } else if (this.comboEvaded && m.opp.state === 'stun') {
            this.say('comboClear', 4, 2.2);
            this.comboEvaded = false;
          } else if (e.shallow) {
            this.pop('빈틈이 얕다', o.x, headY - 120, { size: 36, color: COLORS.paper, stroke: COLORS.ink, life: 0.8 });
            if (Math.random() < 0.4) this.say('shallow', 2, 1.8);
          } else if (e.tg === 'high') this.say('evadeHigh', 2);
          else if (e.tg === 'low') this.say('evadeLow', 2);
          if (!e.chain) this.comboEvaded = false;
          break;
        case 'ironBlock':
          this.impact(e.x + 40, headY + 30, true);
          this.shake(10);
          this.flash.player = { color: COLORS.gold, t: 0, life: 0.3 };
          this.pop('깡!', e.x + 30, headY - 40, { size: 100, color: COLORS.gold });
          this.say('ironBlock', 4);
          break;
        case 'block': {
          const label = e.helmet ? '헬멧에 막힘' : e.iron ? '철벽!' : e.stunGuard ? '팔을 안 푼다!' : e.armor ? '안 먹힘!' : '막힘';
          this.pop(label, e.x, headY - 20, { size: 44, color: '#c9ced8', stroke: COLORS.ink, life: 0.6 });
          this.shake(3);
          if (e.iron) this.say('ironGuard', 3, 2.2);
          else if (e.stunGuard) this.say('stunGuard', 3, 2.2);
          else if (Math.random() < 0.5) this.say('guard', 1, 1.8);
          break;
        }
        case 'guardBreak':
          this.pop('가드 파괴!', e.x, headY - 120, { size: 56, color: COLORS.red, stroke: COLORS.paper, life: 0.9 });
          this.shake(14);
          this.say('guardBreak', 6, 2.6);
          break;
        case 'whiff':
          this.pop('슉~', p.x + 150, headY + 10, { size: 34, color: '#d8d8d8', stroke: COLORS.ink, life: 0.45, punch: false });
          break;
        case 'noGauge':
          this.gaugeShake = 0.4;
          this.pop('소맥 부족!', p.x, headY - 90, { size: 42, color: COLORS.gold, stroke: COLORS.ink, life: 0.8 });
          this.say('noGauge', 1, 1.4);
          break;
        case 'locked': {
          const s = m.skills[e.id];
          this.pop(`Lv.${s.level} 필요`, p.x, headY - 90, { size: 38, color: '#cfcfcf', stroke: COLORS.ink, life: 0.8 });
          break;
        }
        case 'skill': {
          const s = m.skills[e.id];
          this.pop(s.name, p.x, headY - 110, { size: 46, color: COLORS.gold, stroke: COLORS.red, life: 0.9, vy: -20 });
          if (e.id === 'iron') this.flash.player = { color: COLORS.gold, t: 0, life: 0.4 };
          break;
        }
        case 'levelUp':
          this.pop(`Lv.${e.level}!`, W / 2, H / 2 - 60, { size: 120, color: COLORS.gold, stroke: COLORS.red, life: 1.0, vy: -10 });
          break;
        case 'end':
          if (e.reason === 'ko') {
            this.pop('K.O.', W / 2, H / 2 - 60, { size: 190, color: COLORS.red, stroke: COLORS.paper, life: 1.8, vy: 0, rot: -0.05 });
            this.say(e.outcome === 'win' ? 'koWin' : 'koLose', 9, 3);
            this.screenFlash = 0.3;
          } else {
            this.pop('경기 종료', W / 2, H / 2 - 60, { size: 130, color: COLORS.paper, stroke: COLORS.navy, life: 1.8, vy: 0, rot: 0 });
            this.say('timeUp', 9, 3);
          }
          break;
        default:
          break;
      }
    }
  }

  update(dt) {
    this.shakeAmp = Math.max(0, this.shakeAmp - dt * 60);
    this.screenFlash = Math.max(0, this.screenFlash - dt);
    this.gaugeShake = Math.max(0, (this.gaugeShake || 0) - dt);
    for (const k of ['player', 'opp']) {
      const f = this.flash[k];
      if (f) {
        f.t += dt;
        if (f.t >= f.life) this.flash[k] = null;
      }
    }
    for (const q of this.particles) {
      q.t += dt;
      if (q.kind === 'spark' || q.kind === 'shard') {
        q.x += q.vx * dt;
        q.y += q.vy * dt;
        q.vy += 1400 * dt;
        if (q.kind === 'shard') {
          q.rot += q.vr * dt;
          if (q.y > FLOOR_Y - 6) {
            q.y = FLOOR_Y - 6;
            q.vy *= -0.3;
            q.vx *= 0.6;
            q.vr *= 0.5;
          }
        }
      }
    }
    this.particles = this.particles.filter((q) => q.t < q.life);
    if (this.feint) {
      this.feint.t += dt;
      if (this.feint.t > 0.6) this.feint = null;
    }
    for (const q of this.texts) {
      q.t += dt;
      q.y += q.vy * dt;
    }
    this.texts = this.texts.filter((q) => q.t < q.life);
    if (this.caption) {
      this.caption.t += dt;
      if (this.caption.t >= this.caption.life) this.caption = null;
    }
  }

  flashOf(k) {
    const f = this.flash[k];
    if (!f) return null;
    return { color: f.color, alpha: 0.85 * (1 - f.t / f.life) };
  }

  shakeOffset() {
    const a = this.shakeAmp;
    return a > 0 ? [(Math.random() - 0.5) * a, (Math.random() - 0.5) * a] : [0, 0];
  }

  drawParticles(ctx) {
    for (const q of this.particles) {
      const k = q.t / q.life;
      ctx.save();
      if (q.kind === 'line') {
        const r0 = q.r0 + k * 40;
        const r1 = r0 + q.len * (1 - k * 0.5);
        ctx.strokeStyle = `rgba(255,255,255,${1 - k})`;
        ctx.lineWidth = 6 * (1 - k) + 1;
        ctx.beginPath();
        ctx.moveTo(q.x + Math.cos(q.a) * r0, q.y + Math.sin(q.a) * r0);
        ctx.lineTo(q.x + Math.cos(q.a) * r1, q.y + Math.sin(q.a) * r1);
        ctx.stroke();
      } else if (q.kind === 'ring') {
        ctx.strokeStyle = `rgba(242,182,50,${1 - k})`;
        ctx.lineWidth = 8 * (1 - k);
        ctx.beginPath();
        ctx.arc(q.x, q.y, q.r * easeOut(k), 0, Math.PI * 2);
        ctx.stroke();
      } else if (q.kind === 'spark') {
        ctx.strokeStyle = `rgba(255,236,170,${1 - k})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(q.x, q.y);
        ctx.lineTo(q.x - q.vx * 0.03, q.y - q.vy * 0.03);
        ctx.stroke();
      } else if (q.kind === 'shard') {
        ctx.globalAlpha = k > 0.75 ? (1 - k) / 0.25 : 1;
        ctx.translate(q.x, q.y);
        ctx.rotate(q.rot);
        const s = q.size;
        if (this.shardImg) {
          const iw = this.shardImg.width;
          const ih = this.shardImg.height;
          const sc = s / Math.max(iw, ih);
          ctx.drawImage(this.shardImg, (-iw * sc) / 2, (-ih * sc) / 2, iw * sc, ih * sc);
        } else {
          ctx.fillStyle = q.seed % 3 === 0 ? '#e8e8e8' : q.seed % 3 === 1 ? '#b9bec7' : '#c9a227';
          ctx.strokeStyle = COLORS.ink;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-s * 0.5, -s * 0.2);
          ctx.lineTo(s * 0.1, -s * 0.45);
          ctx.lineTo(s * 0.5, s * 0.1);
          ctx.lineTo(-s * 0.1, s * 0.4);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  drawTexts(ctx) {
    for (const q of this.texts) {
      const k = q.t / q.life;
      const s = q.punch ? (k < 0.12 ? 1.6 - (k / 0.12) * 0.6 : 1) : 1;
      ctx.save();
      ctx.globalAlpha = k > 0.75 ? (1 - k) / 0.25 : 1;
      ctx.translate(q.x, q.y);
      ctx.rotate(q.rot);
      ctx.scale(s, s);
      ctx.font = `${q.font === FONT_BODY ? '800 ' : ''}${q.size}px ${q.font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineWidth = Math.max(4, q.size * 0.12);
      ctx.strokeStyle = q.stroke;
      ctx.strokeText(q.text, 0, 0);
      ctx.fillStyle = q.color;
      ctx.fillText(q.text, 0, 0);
      ctx.restore();
    }
  }
}

// ───────── 경기 장면 ─────────
export class MatchView {
  // visual: { sprite, tint, scale:[sx,sy] } 상대 그림(이미지가 하나도 없으면 곽두팔 그림에 색을 입힌 대체)
  constructor(assets, match, playerDef, captions, visual) {
    this.assets = assets;
    this.m = match;
    this.playerDef = playerDef;
    this.visual = visual || { sprite: match.oppDef.sprite, tint: match.oppDef.tint || null, scale: null };
    this.fx = new Effects(captions);
    this.fx.shardImg = assets.image('fx', 'helmet_shard');
    this.px = match.player.x;
    this.ox = match.opp.x;
    this.T = 0;
    this.retreatSaid = -99;
  }

  update(dt) {
    this.T += dt;
    const m = this.m;
    if (m.opp.retreating && this.T - this.retreatSaid > 8) {
      this.retreatSaid = this.T;
      this.fx.say('retreat', 1, 1.8);
    }
    this.fx.handle(m.drainEvents(), m);
    this.fx.update(dt);
    const k = 1 - Math.exp(-dt * 28);
    this.px = lerp(this.px, m.player.x, k);
    this.ox = lerp(this.ox, m.opp.x, k);
  }

  look(spriteId, nativeFacingStr, look) {
    const a = this.assets;
    const got = a.pose(spriteId, look.pose, look.alt);
    const keep = got.fallback ? 1 : look.keep;
    const s = look.sh;
    return {
      img: got.img,
      nativeFacing: nativeFacingStr === 'left' ? -1 : 1,
      rot: look.mo.rot + s.rot * keep,
      sx: 1 + (s.sx - 1) * keep,
      sy: 1 + (s.sy - 1) * keep,
      dx: look.mo.dx,
      dy: look.mo.dy,
    };
  }

  draw(ctx) {
    const m = this.m;
    const a = this.assets;
    const fx = this.fx;
    const T = this.T;
    const [sx, sy] = fx.shakeOffset();

    ctx.save();
    ctx.translate(sx, sy);
    drawBackground(ctx, a.bgs[m.oppDef.bg], 0, m.oppDef.bg);

    const vis = this.visual;
    const [vsx, vsy] = vis.scale || [1, 1];
    shadow(ctx, this.ox, 1.05 * vsx);
    shadow(ctx, this.px, 1);

    // 상대
    const o = m.opp;
    const ol = oppLook(o, m, T);
    const ospec = this.look(vis.sprite, m.oppDef.spriteFacing, ol);
    ospec.x = this.ox;
    ospec.screenFacing = -1;
    ospec.sx *= vsx;
    ospec.sy *= vsy;
    if (o.state === 'telegraph') {
      const tg = m.telegraphs[o.attack.telegraph];
      ospec.outline = { color: tg.color, width: 5 + Math.sin(T * 20) * 1.5 };
    } else if (o.state === 'stun' && o.strikeT >= 0.2) {
      ospec.outline = { color: COLORS.gold, width: 3 };
    }
    if (vis.tint) ospec.tint = { color: vis.tint, alpha: vis.tintAlpha ?? 0.22 };
    ospec.flash = fx.flashOf('opp');
    drawSprite(ctx, a, ospec);

    // 아저씨
    const p = m.player;
    const pl = playerLook(p, m, T);
    const pspec = this.look(this.playerDef.sprite, this.playerDef.spriteFacing, pl);
    pspec.x = this.px;
    pspec.screenFacing = 1;
    if (p.ironTime > 0) pspec.outline = { color: COLORS.gold, width: 4 + Math.sin(T * 18) * 2 };
    if (p.state === 'charge') {
      const k = Math.min(1, p.holdTime / m.skills.kyuljae.chargeTime);
      pspec.outline = { color: k >= 1 ? COLORS.red : COLORS.gold, width: 2 + 4 * k };
    }
    pspec.flash = fx.flashOf('player');
    if (!pspec.flash && p.state === 'charge' && p.holdTime >= m.skills.kyuljae.chargeTime) {
      pspec.flash = { color: COLORS.red, alpha: 0.15 + 0.15 * Math.sin(T * 30) };
    }
    drawSprite(ctx, a, pspec);

    this.drawProjectiles(ctx);
    this.drawOppProjectiles(ctx);
    this.drawOverheads(ctx);
    fx.drawParticles(ctx);
    fx.drawTexts(ctx);
    ctx.restore();

    if (fx.screenFlash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${fx.screenFlash * 2})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  drawProjectiles(ctx) {
    const y = FLOOR_Y - CHAR_H * 0.76;
    const wave = this.assets.image('fx', 'forehead_wave');
    for (const pr of this.m.projectiles) {
      if (wave) {
        // 1024×512, 오른쪽으로 날아가는 그림. 앞(오른쪽) 끝을 pr.x에 맞춘다
        const h = 150;
        const w = (wave.width / wave.height) * h;
        ctx.save();
        ctx.globalAlpha = Math.min(1, pr.age / 0.06);
        ctx.drawImage(wave, pr.x - w * 0.85, y - h / 2, w, h);
        ctx.restore();
        continue;
      }
      ctx.save();
      ctx.translate(pr.x, y);
      // 충격파 고리
      for (let i = 0; i < 3; i++) {
        ctx.strokeStyle = `rgba(242,182,50,${0.7 - i * 0.2})`;
        ctx.lineWidth = 5 - i;
        ctx.beginPath();
        ctx.ellipse(-30 - i * 26, 0, 16 + i * 6, 46 + i * 12, 0, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      }
      // 이마 모양
      const g = ctx.createRadialGradient(-6, -14, 4, 0, 0, 46);
      g.addColorStop(0, '#fff3dc');
      g.addColorStop(0.35, '#f0b48a');
      g.addColorStop(1, '#b86e48');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 0, 30, 42, 0, -Math.PI / 2, Math.PI / 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath();
      ctx.ellipse(10, -16, 6, 12, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // 더 헬멧이 던진 물건: 트로피(빨강 ▲, 머리 높이로 날아옴), 볼링공(파랑 ▶, 바닥을 굴러옴)
  // 예고 규칙과 같게 물건 테두리를 그 색으로 칠하고 머리 위에 같은 아이콘을 붙인다.
  drawOppProjectiles(ctx) {
    const m = this.m;
    const T = this.T;
    for (const pr of m.oppProjectiles) {
      const tg = m.telegraphs[pr.tg];
      const high = pr.kind === 'trophy';
      const travel = Math.max(1, pr.x0 - (m.player.x + 50));
      const k = clamp((pr.x0 - pr.x) / travel, 0, 1);
      const size = high ? 96 : 70;
      const y = high ? FLOOR_Y - CHAR_H * 0.8 - Math.sin(k * Math.PI) * 50 : FLOOR_Y - size / 2 - 2;
      const rot = high ? -T * 9 : -(pr.x0 - pr.x) / (size / 2);
      const img = this.assets.image('fx', high ? 'proj_trophy' : 'proj_bowling');
      ctx.save();
      ctx.globalAlpha = pr.passed ? 0.55 : 1;
      // 바닥 그림자
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(pr.x, FLOOR_Y + 2, size * 0.45, 9, 0, 0, Math.PI * 2);
      ctx.fill();
      // 속도선
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 3;
      for (let i = 0; i < 3; i++) {
        const yy = y - size * 0.25 + i * size * 0.25;
        ctx.beginPath();
        ctx.moveTo(pr.x + size * 0.6, yy);
        ctx.lineTo(pr.x + size * 0.6 + 40 + i * 14, yy);
        ctx.stroke();
      }
      ctx.translate(pr.x, y);
      ctx.save();
      ctx.rotate(rot);
      if (img) {
        const s = size / Math.max(img.width, img.height);
        const w = img.width * s;
        const h = img.height * s;
        const sil = this.assets.silhouette(img, tg.color);
        for (let a = 0; a < 8; a++) {
          const ang = (a / 8) * Math.PI * 2;
          ctx.drawImage(sil, -w / 2 + Math.cos(ang) * 4, -h / 2 + Math.sin(ang) * 4, w, h);
        }
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      } else if (high) {
        drawTrophyShape(ctx, size, tg.color);
      } else {
        drawBowlingShape(ctx, size, tg.color);
      }
      ctx.restore();
      if (!pr.passed) drawTelegraphIcon(ctx, 0, -size / 2 - 34, 18, tg, 0);
      ctx.restore();
    }
  }

  // 상대 머리 위 예고 아이콘, 빈틈 표시, 가드 표시
  drawOverheads(ctx) {
    const m = this.m;
    const o = m.opp;
    const T = this.T;
    const x = this.ox;
    const y = FLOOR_Y - CHAR_H * 0.96 - 58;
    if (o.state === 'telegraph') {
      const tg = m.telegraphs[o.attack.telegraph];
      const k = clamp(o.t / o.dur, 0, 1);
      const pop = o.t < 0.1 ? 1.5 - (o.t / 0.1) * 0.5 : 1;
      // 속임이 들어 있는 예고는 아이콘이 미세하게 흔들린다(끝까지 보라는 신호)
      const wob = o.attack.feint && !o.feinted ? Math.sin(T * 26) * 3 : 0;
      drawTelegraphIcon(ctx, x + wob, y, 38 * pop, tg, k);
      // 바뀌기 전 아이콘이 X 표시와 함께 옆으로 밀려나며 사라진다
      const ff = this.fx.feint;
      if (ff && o.feinted && ff.t < 0.5) {
        const fk = ff.t / 0.5;
        ctx.save();
        ctx.globalAlpha = 1 - fk;
        const fx0 = x + 70 + fk * 40;
        drawTelegraphIcon(ctx, fx0, y - 10, 22, m.telegraphs[ff.from], 0);
        ctx.strokeStyle = COLORS.paper;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(fx0 - 22, y - 32);
        ctx.lineTo(fx0 + 22, y + 12);
        ctx.moveTo(fx0 + 22, y - 32);
        ctx.lineTo(fx0 - 22, y + 12);
        ctx.stroke();
        ctx.restore();
      }
      // 콤보 표시: 첫 타 예고에 "×2", 이어지는 둘째 타에 "2타"
      if (o.attack.chain || o.chained) {
        ctx.save();
        ctx.font = `26px ${FONT_TITLE}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 6;
        ctx.lineJoin = 'round';
        ctx.strokeStyle = COLORS.ink;
        const label = o.chained ? '2타!' : '×2';
        ctx.strokeText(label, x + 56, y - 26);
        ctx.fillStyle = COLORS.gold;
        ctx.fillText(label, x + 56, y - 26);
        ctx.restore();
      }
      // 정답 힌트
      ctx.save();
      ctx.font = `28px ${FONT_TITLE}`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 6;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = COLORS.ink;
      ctx.strokeText(tg.hint, x - 62, y);
      ctx.fillStyle = tg.color === '#F2B632' ? COLORS.gold : COLORS.paper;
      ctx.fillText(tg.hint, x - 62, y);
      ctx.restore();
    } else if (o.state === 'stun' && o.strikeT >= 0.2) {
      const k = 1 - clamp(o.t / o.dur, 0, 1);
      // 별
      for (let i = 0; i < 3; i++) {
        const a = T * 6 + (i * Math.PI * 2) / 3;
        drawStar(ctx, x + Math.cos(a) * 46, y + 30 + Math.sin(a) * 12, 11, COLORS.gold);
      }
      ctx.save();
      ctx.font = `40px ${FONT_TITLE}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 7;
      ctx.lineJoin = 'round';
      ctx.strokeStyle = COLORS.ink;
      ctx.strokeText('빈틈!', x, y - 14);
      ctx.fillStyle = COLORS.gold;
      ctx.fillText('빈틈!', x, y - 14);
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(x - 60, y + 10, 120, 10);
      ctx.fillStyle = COLORS.gold;
      ctx.fillRect(x - 60, y + 10, 120 * k, 10);
      ctx.restore();
    } else if (o.state === 'idle' && o.guard) {
      ctx.save();
      ctx.translate(x, y + 20);
      ctx.fillStyle = 'rgba(20,33,61,0.85)';
      ctx.strokeStyle = '#c9ced8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -24);
      ctx.lineTo(22, -16);
      ctx.lineTo(18, 10);
      ctx.lineTo(0, 24);
      ctx.lineTo(-18, 10);
      ctx.lineTo(-22, -16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.font = `16px ${FONT_TITLE}`;
      ctx.fillStyle = '#e7ebf2';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('가드', 0, 1);
      ctx.restore();
    }
    // 결재 박치기 차지 도장
    const p = m.player;
    if (p.state === 'charge' && p.holdTime >= m.skills.kyuljae.chargeTime) {
      const px = this.px + 30;
      const py = FLOOR_Y - CHAR_H * 0.96 - 30;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-0.15);
      ctx.strokeStyle = COLORS.red;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, 34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = `30px ${FONT_TITLE}`;
      ctx.fillStyle = COLORS.red;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('결재', 0, 2);
      ctx.restore();
    }
  }
}

function drawTrophyShape(ctx, size, edge) {
  const s = size / 100;
  ctx.save();
  ctx.scale(s, s);
  ctx.lineJoin = 'round';
  ctx.lineWidth = 7;
  ctx.strokeStyle = edge;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(-30, -44);
    ctx.lineTo(30, -44);
    ctx.quadraticCurveTo(30, 6, 8, 12);
    ctx.lineTo(8, 26);
    ctx.lineTo(24, 40);
    ctx.lineTo(-24, 40);
    ctx.lineTo(-8, 26);
    ctx.lineTo(-8, 12);
    ctx.quadraticCurveTo(-30, 6, -30, -44);
    ctx.closePath();
  };
  path();
  ctx.stroke();
  const g = ctx.createLinearGradient(-30, -44, 30, 40);
  g.addColorStop(0, '#fff1a8');
  g.addColorStop(0.5, '#f2b632');
  g.addColorStop(1, '#a87410');
  ctx.fillStyle = g;
  path();
  ctx.fill();
  // 손잡이
  ctx.strokeStyle = '#c98f12';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(-34, -24, 12, Math.PI * 0.5, Math.PI * 1.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(34, -24, 12, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.stroke();
  ctx.restore();
}

function drawBowlingShape(ctx, size, edge) {
  const r = size / 2;
  ctx.save();
  ctx.lineWidth = 6;
  ctx.strokeStyle = edge;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.stroke();
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.35, 2, 0, 0, r);
  g.addColorStop(0, '#5b6c99');
  g.addColorStop(1, '#141c33');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.fillStyle = '#05070d';
  for (const [x, y] of [[-r * 0.2, -r * 0.35], [r * 0.15, -r * 0.4], [0, -r * 0.08]]) {
    ctx.beginPath();
    ctx.arc(x, y, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawStar(ctx, x, y, r, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// 예고 아이콘: 색 + 모양(▲ 빨강, ▶ 파랑, ● 노랑) + 남은 시간 고리
export function drawTelegraphIcon(ctx, x, y, r, tg, progress = 0, dir = -1) {
  ctx.save();
  ctx.translate(x, y);
  // 남은 시간 고리
  if (progress > 0) {
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(0, 0, r + 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = COLORS.paper;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(0, 0, r + 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - progress));
    ctx.stroke();
  }
  ctx.fillStyle = tg.color;
  ctx.strokeStyle = COLORS.paper;
  ctx.lineWidth = 5;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  if (tg.shape === 'triangle') {
    ctx.moveTo(0, -r);
    ctx.lineTo(r * 0.95, r * 0.7);
    ctx.lineTo(-r * 0.95, r * 0.7);
  } else if (tg.shape === 'arrow') {
    // ▶ 모양을 돌진 방향(아저씨 쪽)으로 그린다
    ctx.moveTo(r * dir, 0);
    ctx.lineTo(-r * 0.75 * dir, -r * 0.85);
    ctx.lineTo(-r * 0.75 * dir, r * 0.85);
  } else {
    ctx.arc(0, 0, r * 0.85, 0, Math.PI * 2);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
