// HUD와 화면(타이틀, 경기 전 소개, 결과). 중계 자막풍 그래픽은 모두 Canvas로 그린다.
import { COLORS, FONT_TITLE, FONT_BODY, bodyFont, titleFont } from './style.js';
import { drawBackground, drawSprite, drawTelegraphIcon, W, H } from './render.js';

export { COLORS, FONT_TITLE, FONT_BODY };

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, { font, color = COLORS.paper, align = 'left', base = 'middle', stroke, sw = 6 } = {}) {
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = base;
  if (stroke) {
    ctx.lineJoin = 'round';
    ctx.lineWidth = sw;
    ctx.strokeStyle = stroke;
    ctx.strokeText(str, x, y);
  }
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

// 중계 자막풍 이름표: [빨강 직함][남색 이름]
function namePlate(ctx, x, y, title, name, alignRight) {
  ctx.font = bodyFont(18, 700);
  const tw = ctx.measureText(title).width + 22;
  ctx.font = titleFont(30);
  const nw = ctx.measureText(name).width + 34;
  const h = 40;
  const total = tw + nw;
  const x0 = alignRight ? x - total : x;
  ctx.save();
  ctx.fillStyle = COLORS.red;
  ctx.fillRect(x0, y, tw, h);
  ctx.fillStyle = COLORS.navy;
  ctx.fillRect(x0 + tw, y, nw, h);
  ctx.fillStyle = COLORS.gold;
  ctx.fillRect(x0, y + h, total, 4);
  text(ctx, title, x0 + tw / 2, y + h / 2 + 1, { font: bodyFont(18, 700), align: 'center' });
  text(ctx, name, x0 + tw + nw / 2, y + h / 2 + 2, { font: titleFont(30), align: 'center' });
  ctx.restore();
  return { x0, w: total };
}

function hpBar(ctx, x, y, w, h, ratio, lagRatio, alignRight) {
  ctx.save();
  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
  ctx.fillStyle = '#3a3a3a';
  ctx.fillRect(x, y, w, h);
  const fill = (r, style) => {
    const fw = w * clamp(r, 0, 1);
    ctx.fillStyle = style;
    if (alignRight) ctx.fillRect(x + w - fw, y, fw, h);
    else ctx.fillRect(x, y, fw, h);
  };
  fill(lagRatio, COLORS.paper);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  const low = ratio < 0.3;
  g.addColorStop(0, low ? '#ff6a4d' : '#ffd760');
  g.addColorStop(1, low ? COLORS.red : '#e09a12');
  fill(ratio, g);
  // 눈금
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  for (let i = 1; i < 10; i++) ctx.fillRect(x + (w * i) / 10, y, 2, h);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(x, y + 2, w, 4);
  ctx.restore();
}

// 맥주잔 모양 소맥 게이지
function beerGauge(ctx, x, y, w, h, value, max, T, shake) {
  const k = clamp(value / max, 0, 1);
  ctx.save();
  ctx.translate(x + (shake ? Math.sin(T * 60) * 3 : 0), y);
  const top = 0;
  const bot = h;
  const inset = 10; // 아래가 살짝 좁은 잔
  const glass = () => {
    ctx.beginPath();
    ctx.moveTo(0, top);
    ctx.lineTo(w, top);
    ctx.lineTo(w - inset, bot);
    ctx.lineTo(inset, bot);
    ctx.closePath();
  };
  // 손잡이
  ctx.strokeStyle = 'rgba(247,243,232,0.85)';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(w - 2, h * 0.22);
  ctx.bezierCurveTo(w + 30, h * 0.22, w + 30, h * 0.72, w - 6, h * 0.72);
  ctx.stroke();
  // 잔 안쪽
  glass();
  ctx.fillStyle = 'rgba(20,33,61,0.72)';
  ctx.fill();
  ctx.save();
  glass();
  ctx.clip();
  const ly = bot - (bot - top - 6) * k;
  const g = ctx.createLinearGradient(0, ly, 0, bot);
  g.addColorStop(0, '#ffc93c');
  g.addColorStop(1, '#d98a0b');
  ctx.fillStyle = g;
  ctx.fillRect(0, ly, w, bot - ly);
  // 거품
  if (k > 0.02) {
    ctx.fillStyle = COLORS.paper;
    for (let i = 0; i < 6; i++) {
      const bx = (w / 5) * i;
      ctx.beginPath();
      ctx.arc(bx, ly + Math.sin(T * 3 + i) * 1.5, 9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillRect(0, ly, w, 5);
    // 기포
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    for (let i = 0; i < 7; i++) {
      const bx = 12 + ((i * 37) % (w - 24));
      const by = bot - ((T * 40 + i * 29) % Math.max(1, bot - ly));
      if (by > ly + 8) {
        ctx.beginPath();
        ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  // 기술 비용 눈금(30/40/50)
  ctx.strokeStyle = 'rgba(247,243,232,0.45)';
  ctx.lineWidth = 2;
  for (const c of [30, 40, 50]) {
    const yy = bot - (bot - top - 6) * (c / max);
    ctx.beginPath();
    ctx.moveTo(w - 22, yy);
    ctx.lineTo(w, yy);
    ctx.stroke();
  }
  ctx.restore();
  glass();
  ctx.strokeStyle = COLORS.paper;
  ctx.lineWidth = 4;
  ctx.stroke();
  // 반사광
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(12, 12);
  ctx.lineTo(18, h - 16);
  ctx.stroke();
  text(ctx, String(Math.round(value)), w / 2, h / 2 + 4, { font: bodyFont(30, 900), align: 'center', stroke: COLORS.ink, sw: 6 });
  text(ctx, '소맥', w / 2, -16, { font: titleFont(22), align: 'center', color: COLORS.gold, stroke: COLORS.ink, sw: 5 });
  ctx.restore();
}

const SKILL_SHORT = { double: '이환이형', iron: '금강불괴', kyuljae: '결재', ranged: '원거리' };

function skillIcon(ctx, x, y, size, s, m) {
  const unlocked = m.level >= s.level;
  const affordable = m.player.gauge >= s.cost;
  const active = (s.id === 'iron' && m.player.ironTime > 0) || (s.id === 'kyuljae' && m.player.state === 'charge');
  const ready = unlocked && affordable;
  ctx.save();
  roundRect(ctx, x, y, size, size, 10);
  ctx.fillStyle = unlocked ? (ready ? COLORS.navy : 'rgba(20,33,61,0.75)') : 'rgba(27,27,27,0.7)';
  ctx.fill();
  ctx.lineWidth = active ? 5 : 3;
  ctx.strokeStyle = active ? COLORS.red : ready ? COLORS.gold : 'rgba(247,243,232,0.35)';
  ctx.stroke();
  const c = unlocked ? COLORS.paper : 'rgba(247,243,232,0.4)';
  text(ctx, SKILL_SHORT[s.id] || s.name, x + size / 2, y + size * 0.42, { font: titleFont(s.id === 'double' || s.id === 'iron' ? 16 : 19), align: 'center', color: c });
  text(ctx, s.keyLabel, x + 6, y + 12, { font: bodyFont(12, 800), color: unlocked ? COLORS.gold : c });
  const sub = !unlocked ? `Lv.${s.level}` : s.cost ? `${s.cost}` : '차지';
  text(ctx, sub, x + size / 2, y + size - 13, { font: bodyFont(14, 800), align: 'center', color: unlocked && !affordable ? '#ff7a6a' : c });
  if (s.id === 'iron' && m.player.ironTime > 0) {
    ctx.fillStyle = 'rgba(242,182,50,0.4)';
    ctx.fillRect(x, y + size * (1 - m.player.ironTime / s.duration), size, size * (m.player.ironTime / s.duration));
  }
  if (s.id === 'kyuljae' && m.player.state === 'charge') {
    const k = clamp(m.player.holdTime / s.chargeTime, 0, 1);
    ctx.fillStyle = 'rgba(214,43,31,0.45)';
    ctx.fillRect(x, y + size * (1 - k), size, size * k);
  }
  ctx.restore();
}

function caption(ctx, cap) {
  if (!cap) return;
  const inK = clamp(cap.t / 0.18, 0, 1);
  const outK = clamp((cap.life - cap.t) / 0.25, 0, 1);
  const k = Math.min(inK, outK);
  ctx.save();
  ctx.globalAlpha = k;
  ctx.font = bodyFont(30, 800);
  const tw = Math.max(380, ctx.measureText(cap.text).width + 60);
  const tag = 96;
  const total = tag + tw;
  const x = W / 2 - total / 2 + (1 - inK) * -60;
  const y = 612;
  const h = 58;
  ctx.fillStyle = COLORS.red;
  ctx.fillRect(x, y, tag, h);
  ctx.fillStyle = 'rgba(20,33,61,0.94)';
  ctx.fillRect(x + tag, y, tw, h);
  ctx.fillStyle = COLORS.gold;
  ctx.fillRect(x, y + h, total, 5);
  text(ctx, '중계', x + tag / 2, y + h / 2 + 1, { font: titleFont(28), align: 'center' });
  text(ctx, cap.text, x + tag + tw / 2, y + h / 2 + 1, { font: bodyFont(30, 800), align: 'center' });
  ctx.restore();
}

export function drawHUD(ctx, m, view, opts) {
  const { playerDef, debug, lag } = opts;
  const o = m.opp;
  const p = m.player;
  const od = m.oppDef;
  const T = view.T;

  // 체력 바
  const bw = 480;
  hpBar(ctx, 40, 30, bw, 28, p.hp / p.maxHp, lag.p, true);
  hpBar(ctx, W - 40 - bw, 30, bw, 28, o.hp / o.maxHp, lag.o, false);
  namePlate(ctx, 40, 70, playerDef.title, playerDef.name, false);
  namePlate(ctx, W - 40, 70, od.title, od.name, true);
  text(ctx, `${Math.ceil(p.hp)}`, 40 + bw - 8, 44, { font: bodyFont(20, 900), align: 'right', stroke: COLORS.ink, sw: 4 });
  text(ctx, `${Math.ceil(o.hp)}`, W - 40 - bw + 8, 44, { font: bodyFont(20, 900), align: 'left', stroke: COLORS.ink, sw: 4 });
  // 레벨 배지
  ctx.save();
  roundRect(ctx, 40, 122, 70, 30, 6);
  ctx.fillStyle = COLORS.gold;
  ctx.fill();
  text(ctx, `Lv.${m.level}`, 75, 138, { font: titleFont(22), align: 'center', color: COLORS.ink });
  ctx.restore();

  // 타이머
  const tl = Math.ceil(m.timeLeft);
  const urgent = m.phase === 'fight' && m.timeLeft <= 10;
  ctx.save();
  const tw = 150;
  const tx = W / 2 - tw / 2;
  ctx.fillStyle = COLORS.ink;
  ctx.fillRect(tx - 4, 14, tw + 8, 104);
  ctx.fillStyle = urgent && Math.floor(T * 4) % 2 ? COLORS.red : COLORS.navy;
  ctx.fillRect(tx, 18, tw, 96);
  ctx.fillStyle = COLORS.gold;
  ctx.fillRect(tx, 108, tw, 6);
  text(ctx, String(tl), W / 2, 64, { font: bodyFont(76, 900), align: 'center', color: COLORS.paper });
  ctx.fillStyle = COLORS.red;
  ctx.font = bodyFont(16, 800);
  const lw = ctx.measureText(od.matchLabel).width + 28;
  ctx.fillRect(W / 2 - lw / 2, 122, lw, 28);
  text(ctx, od.matchLabel, W / 2, 137, { font: bodyFont(16, 800), align: 'center' });
  ctx.restore();

  // 소맥 게이지 + 기술 아이콘
  const gShake = view.fx.gaugeShake > 0;
  beerGauge(ctx, 32, 566, 92, 136, p.gauge, m.R.gauge.max, T, gShake);
  const skills = m.skillList.filter((s) => s.id !== 'basic');
  const size = 62;
  skills.forEach((s, i) => {
    const cx = 160 + (i % 2) * (size + 8);
    const cy = 572 + Math.floor(i / 2) * (size + 8);
    skillIcon(ctx, cx, cy, size, s, m);
  });

  caption(ctx, view.fx.caption);

  // 준비 카운트
  if (m.phase === 'ready') {
    const k = m.phaseTime / m.R.readyTime;
    ctx.save();
    ctx.fillStyle = 'rgba(20,33,61,0.35)';
    ctx.fillRect(0, 0, W, H);
    const msg = k < 0.55 ? '준비…' : '자세 잡고!';
    text(ctx, msg, W / 2, H / 2 - 40, { font: titleFont(110), align: 'center', color: COLORS.paper, stroke: COLORS.navy, sw: 14 });
    text(ctx, `${od.matchLabel} · ${od.title} ${od.name}`, W / 2, H / 2 + 50, { font: bodyFont(28, 800), align: 'center', color: COLORS.gold, stroke: COLORS.ink, sw: 6 });
    ctx.restore();
  }

  if (debug) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(W - 560, H - 56, 550, 50);
    text(ctx, 'DEBUG  L: 레벨업  T: 남은 시간 5초  K: 상대 체력 1  J: 내 체력 1', W - 550, H - 42, { font: bodyFont(14, 700), color: '#9fe8a0' });
    text(ctx, `아저씨 ${p.state} (${p.t.toFixed(2)})  상대 ${o.state}${o.attackId && o.state === 'telegraph' ? ':' + o.attackId : ''} (${o.t.toFixed(2)})  거리 ${Math.round(m.dist)}`, W - 550, H - 20, { font: bodyFont(14, 700), color: '#d7f7d8' });
    ctx.restore();
  }
}

// ───────── 캔버스 버튼 ─────────
export function drawButton(ctx, b, T, primary = true) {
  ctx.save();
  const pulse = primary ? 1 + Math.sin(T * 5) * 0.02 : 1;
  ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
  ctx.scale(pulse, pulse);
  roundRect(ctx, -b.w / 2, -b.h / 2, b.w, b.h, 12);
  ctx.fillStyle = primary ? COLORS.red : COLORS.navy;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = primary ? COLORS.gold : COLORS.paper;
  ctx.stroke();
  text(ctx, b.label, 0, 2, { font: titleFont(b.size || 30), align: 'center' });
  ctx.restore();
}

function banner(ctx, y, h, str, size = 34) {
  ctx.save();
  ctx.fillStyle = COLORS.red;
  ctx.fillRect(0, y, W, h);
  ctx.fillStyle = COLORS.gold;
  ctx.fillRect(0, y + h - 5, W, 5);
  ctx.fillRect(0, y, W, 3);
  // 현수막 끈 구멍
  ctx.fillStyle = COLORS.paper;
  for (const x of [24, W - 24]) {
    ctx.beginPath();
    ctx.arc(x, y + h / 2, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  text(ctx, str, W / 2, y + h / 2 + 2, { font: titleFont(size), align: 'center', color: COLORS.paper });
  ctx.restore();
}

function poseImg(assets, sprite, pose) {
  return assets.pose(sprite, pose).img;
}

function controlsBox(ctx, x, y, w, touch, telegraphs) {
  const rows = touch
    ? [
        ['◀ ▶', '이동 (왼쪽 패드)'],
        ['숙이기', '빨강 ▲ 상단 공격 피하기'],
        ['물러서기', '파랑 ▶ 돌진 피하기'],
        ['박치기', '노랑 ● 잡기는 먼저 박아서 끊기'],
        ['Q W E', '기술 (레벨이 오르면)'],
      ]
    : [
        ['← →', '이동'],
        ['↓', '숙이기: 빨강 ▲ 상단 공격 피하기'],
        ['Shift', '물러서기: 파랑 ▶ 돌진 피하기'],
        ['Space', '박치기: 노랑 ● 잡기는 먼저 박아서 끊기'],
        ['Q W E', '기술 (레벨이 오르면)'],
      ];
  const h = 64 + rows.length * 40 + 46;
  ctx.save();
  roundRect(ctx, x, y, w, h, 14);
  ctx.fillStyle = 'rgba(20,33,61,0.88)';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = COLORS.gold;
  ctx.stroke();
  text(ctx, '조작', x + 24, y + 32, { font: titleFont(28), color: COLORS.gold });
  rows.forEach(([k, d], i) => {
    const yy = y + 76 + i * 40;
    ctx.font = bodyFont(18, 800);
    const kw = Math.max(54, ctx.measureText(k).width + 20);
    roundRect(ctx, x + 24, yy - 15, kw, 30, 6);
    ctx.fillStyle = COLORS.paper;
    ctx.fill();
    text(ctx, k, x + 24 + kw / 2, yy + 1, { font: bodyFont(18, 800), align: 'center', color: COLORS.ink });
    text(ctx, d, x + 24 + kw + 14, yy + 1, { font: bodyFont(19, 600) });
  });
  const yy = y + 76 + rows.length * 40 + 4;
  text(ctx, '피하면 상대에게 빈틈! 그때 박으면 2.5배', x + 24, yy, { font: bodyFont(20, 800), color: COLORS.gold });
  ctx.restore();
}

export function drawTitle(ctx, assets, T, opts) {
  const buttons = [];
  drawBackground(ctx, assets.bgs.dong_gym, 0.5);
  banner(ctx, 26, 58, '제1회 동네 이마 최강자전 · 동대회 예선', 30);
  // 아저씨
  const img = poseImg(assets, opts.playerDef.sprite, 'idle');
  if (img) {
    drawSprite(ctx, assets, { img, x: 250, screenFacing: 1, nativeFacing: 1, sx: 1.12, sy: 1.12 + Math.sin(T * 2.5) * 0.01, dy: 40 });
  }
  // 제목
  ctx.save();
  ctx.translate(780, 210);
  ctx.rotate(-0.04);
  text(ctx, '박치기', -6, -50, { font: titleFont(120), align: 'center', color: COLORS.red, stroke: COLORS.ink, sw: 18 });
  text(ctx, '박치기', -12, -56, { font: titleFont(120), align: 'center', color: COLORS.gold, stroke: COLORS.ink, sw: 10 });
  text(ctx, '챔피언', 40, 70, { font: titleFont(120), align: 'center', color: COLORS.red, stroke: COLORS.ink, sw: 18 });
  text(ctx, '챔피언', 34, 64, { font: titleFont(120), align: 'center', color: COLORS.paper, stroke: COLORS.ink, sw: 10 });
  ctx.restore();
  text(ctx, '회식은 끝났다. 이마는 아직 뜨겁다.', 780, 330, { font: bodyFont(26, 700), align: 'center', color: COLORS.paper, stroke: COLORS.ink, sw: 6 });
  controlsBox(ctx, 520, 360, 520, opts.touch, opts.telegraphs);
  const b = { x: 1060, y: 560, w: 190, h: 70, label: '경기 시작', action: 'start' };
  drawButton(ctx, b, T);
  buttons.push(b);
  if (Math.floor(T * 2) % 2 === 0) {
    text(ctx, opts.touch ? '화면을 눌러 시작' : 'Space / Enter 로 시작', 1155, 655, { font: bodyFont(18, 700), align: 'center', color: COLORS.paper, stroke: COLORS.ink, sw: 5 });
  }
  if (opts.debug) text(ctx, 'DEBUG 모드: 예고 3종 시험 상대, L 키로 레벨업', 20, 700, { font: bodyFont(16, 700), color: '#9fe8a0', stroke: COLORS.ink, sw: 4 });
  return buttons;
}

export function drawIntro(ctx, assets, T, opts) {
  const { playerDef, oppDef, telegraphs } = opts;
  const buttons = [];
  drawBackground(ctx, assets.bgs[oppDef.bg] || assets.bgs.dong_gym, 0.45);
  banner(ctx, 22, 56, `${oppDef.matchLabel} · ${oppDef.tournament}`, 32);
  const slide = Math.min(1, T / 0.4);
  const pimg = poseImg(assets, playerDef.sprite, 'idle');
  const oimg = poseImg(assets, oppDef.sprite, 'idle');
  if (pimg) drawSprite(ctx, assets, { img: pimg, x: 250 - (1 - slide) * 300, screenFacing: 1, nativeFacing: playerDef.spriteFacing === 'left' ? -1 : 1, dy: -40, sx: 0.95, sy: 0.95 });
  if (oimg) {
    drawSprite(ctx, assets, {
      img: oimg, x: 1030 + (1 - slide) * 300, screenFacing: -1, nativeFacing: oppDef.spriteFacing === 'left' ? -1 : 1, dy: -40, sx: 0.95, sy: 0.95,
      tint: oppDef.tint ? { color: oppDef.tint, alpha: 0.22 } : null,
    });
  }
  text(ctx, 'VS', W / 2, 200, { font: titleFont(120), align: 'center', color: COLORS.gold, stroke: COLORS.ink, sw: 14 });
  namePlate(ctx, 90, 520, playerDef.title, playerDef.name, false);
  namePlate(ctx, W - 90, 520, oppDef.title, oppDef.name, true);
  // 한마디 말풍선
  ctx.save();
  ctx.font = bodyFont(24, 700);
  const q = `“${oppDef.quote}”`;
  const qw = Math.min(560, ctx.measureText(q).width + 48);
  const bx = W / 2 - qw / 2 + 40;
  const by = 268;
  roundRect(ctx, bx, by, qw, 70, 16);
  ctx.fillStyle = COLORS.paper;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(bx + qw - 40, by + 70);
  ctx.lineTo(bx + qw + 20, by + 100);
  ctx.lineTo(bx + qw - 80, by + 70);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = COLORS.ink;
  roundRect(ctx, bx, by, qw, 70, 16);
  ctx.stroke();
  wrapText(ctx, q, bx + qw / 2, by + 35, qw - 40, 28, { font: bodyFont(22, 700), color: COLORS.ink });
  ctx.restore();

  // 예고 3종 안내
  const order = ['high', 'low', 'grab'];
  const keys = opts.touch ? { high: '숙이기', low: '물러서기', grab: '박치기' } : { high: '↓ 숙이기', low: 'Shift 물러서기', grab: 'Space 먼저 박기' };
  const desc = { high: '상단 공격', low: '돌진', grab: '잡기' };
  const cw = 250;
  const x0 = W / 2 - (cw * 3 + 20) / 2;
  ctx.save();
  roundRect(ctx, x0 - 16, 372, cw * 3 + 52, 128, 12);
  ctx.fillStyle = 'rgba(20,33,61,0.88)';
  ctx.fill();
  ctx.restore();
  order.forEach((id, i) => {
    const tg = telegraphs[id];
    const x = x0 + i * (cw + 10);
    drawTelegraphIcon(ctx, x + 30, 412, 20, tg, 0);
    text(ctx, desc[id], x + 62, 404, { font: titleFont(24), color: tg.color === COLORS.gold ? COLORS.gold : COLORS.paper });
    text(ctx, keys[id], x + 62, 436, { font: bodyFont(19, 800), color: COLORS.gold });
  });
  text(ctx, '피하면 0.8초 빈틈! 그때 박치기 = 2.5배. 마구 박으면 가드에 막힌다.', W / 2, 476, { font: bodyFont(19, 700), align: 'center', color: COLORS.gold });

  const b = { x: W / 2 - 110, y: 600, w: 220, h: 72, label: '경기 시작!', action: 'fight' };
  drawButton(ctx, b, T);
  buttons.push(b);
  if (Math.floor(T * 2) % 2 === 0) {
    text(ctx, opts.touch ? '버튼을 눌러 시작' : 'Space / Enter', W / 2, 690, { font: bodyFont(17, 700), align: 'center', color: COLORS.paper, stroke: COLORS.ink, sw: 4 });
  }
  return buttons;
}

function wrapText(ctx, str, cx, cy, maxW, lh, style) {
  ctx.font = style.font;
  const words = str.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? cur + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && cur) {
      lines.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) lines.push(cur);
  const y0 = cy - ((lines.length - 1) * lh) / 2;
  lines.forEach((l, i) => text(ctx, l, cx, y0 + i * lh, { ...style, align: 'center' }));
}

export function drawResult(ctx, assets, T, opts) {
  const { match: m, playerDef, oppDef } = opts;
  const { outcome, reason } = m.result;
  const buttons = [];
  drawBackground(ctx, assets.bgs[oppDef.bg] || assets.bgs.dong_gym, 0.6);
  const head = outcome === 'win' ? '승리!' : outcome === 'lose' ? '패배…' : '무승부';
  const sub =
    outcome === 'draw' ? '체력 비율 동률 · 재경기'
    : reason === 'ko' ? (outcome === 'win' ? 'KO 승' : 'KO 패')
    : outcome === 'win' ? '판정승 (남은 체력 비율)' : '판정패 (남은 체력 비율)';
  banner(ctx, 22, 56, `${oppDef.matchLabel} 결과`, 30);

  const pose = outcome === 'win' ? 'win' : outcome === 'lose' ? 'lose' : 'idle';
  const got = assets.pose(playerDef.sprite, pose);
  if (got.img) {
    const spec = { img: got.img, x: 260, screenFacing: 1, nativeFacing: playerDef.spriteFacing === 'left' ? -1 : 1, dy: -10 };
    if (got.fallback && pose === 'win') spec.dy -= Math.abs(Math.sin(T * 5)) * 20;
    if (got.fallback && pose === 'lose') {
      spec.rot = -0.14;
      spec.sy = 0.92;
    }
    drawSprite(ctx, assets, spec);
  }
  ctx.save();
  const s = 1 + Math.max(0, 0.4 - T) * 1.5;
  ctx.translate(800, 165);
  ctx.scale(s, s);
  text(ctx, head, 0, 0, { font: titleFont(130), align: 'center', color: outcome === 'win' ? COLORS.gold : outcome === 'lose' ? '#c9ced8' : COLORS.paper, stroke: COLORS.ink, sw: 16 });
  ctx.restore();
  text(ctx, sub, 800, 258, { font: bodyFont(30, 800), align: 'center', color: COLORS.paper, stroke: COLORS.ink, sw: 6 });

  // 상대 한마디
  const q = outcome === 'win' ? oppDef.loseQuote : outcome === 'lose' ? oppDef.winQuote : '한 판 더 하지!';
  ctx.save();
  roundRect(ctx, 520, 290, 560, 64, 12);
  ctx.fillStyle = COLORS.paper;
  ctx.fill();
  text(ctx, oppDef.name, 538, 306, { font: bodyFont(15, 800), color: COLORS.red });
  wrapText(ctx, `“${q}”`, 800, 332, 520, 24, { font: bodyFont(19, 700), color: COLORS.ink });
  ctx.restore();

  // 기록
  const st = m.stats;
  const rows = [
    ['회피 성공', `▲ ${st.evades.high}  ▶ ${st.evades.low}  ● ${st.evades.grab}`],
    ['반격(빈틈 박치기)', `${st.counters}회`],
    ['박치기 명중 / 가드에 막힘', `${st.headbuttHits} / ${st.blocks}`],
    ['남은 체력', `나 ${Math.ceil(m.player.hp)}/${m.player.maxHp}   상대 ${Math.ceil(m.opp.hp)}/${m.opp.maxHp}`],
    ['남은 시간', `${Math.ceil(m.timeLeft)}초`],
  ];
  ctx.save();
  roundRect(ctx, 520, 370, 560, 34 * rows.length + 24, 12);
  ctx.fillStyle = 'rgba(20,33,61,0.9)';
  ctx.fill();
  rows.forEach(([k, v], i) => {
    const y = 394 + i * 34;
    text(ctx, k, 544, y, { font: bodyFont(19, 700), color: COLORS.gold });
    text(ctx, v, 1056, y, { font: bodyFont(19, 800), align: 'right' });
  });
  ctx.restore();

  const b1 = { x: 560, y: 600, w: 230, h: 70, label: outcome === 'draw' ? '재경기' : '다시 하기', action: 'retry' };
  const b2 = { x: 820, y: 600, w: 200, h: 70, label: '타이틀로', action: 'title', size: 26 };
  drawButton(ctx, b1, T, true);
  drawButton(ctx, b2, T, false);
  buttons.push(b1, b2);
  text(ctx, opts.touch ? '' : 'Enter: 다시 하기   Esc: 타이틀', 790, 694, { font: bodyFont(16, 700), align: 'center', color: COLORS.paper, stroke: COLORS.ink, sw: 4 });
  return buttons;
}

export function drawLoading(ctx, k, msg) {
  ctx.fillStyle = COLORS.navy;
  ctx.fillRect(0, 0, W, H);
  text(ctx, '박치기 챔피언', W / 2, H / 2 - 60, { font: titleFont(72), align: 'center', color: COLORS.gold });
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(W / 2 - 240, H / 2 + 10, 480, 16);
  ctx.fillStyle = COLORS.red;
  ctx.fillRect(W / 2 - 240, H / 2 + 10, 480 * clamp(k, 0, 1), 16);
  text(ctx, msg || '이마 데우는 중…', W / 2, H / 2 + 60, { font: bodyFont(22, 700), align: 'center' });
}
