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
export function drawBackground(ctx, img, dim = 0) {
  if (img) {
    // 1920×1080 → 1280×720 꽉 채우기
    const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  } else {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#5b5a55');
    g.addColorStop(0.52, '#8a877c');
    g.addColorStop(0.53, '#2f5fb0');
    g.addColorStop(0.95, '#2a56a0');
    g.addColorStop(0.951, '#c2372c');
    g.addColorStop(1, '#a52c22');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }
  if (dim > 0) {
    ctx.fillStyle = `rgba(10,14,30,${dim})`;
    ctx.fillRect(0, 0, W, H);
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

function oppLook(o, m, T) {
  const r = { pose: 'idle', alt: null, mo: { dx: 0, dy: 0, rot: 0 }, sh: { rot: 0, sx: 1, sy: 1 }, keep: 0.15 };
  const { mo, sh } = r;
  switch (o.state) {
    case 'idle':
      if (o.moving) {
        mo.dy = -Math.abs(Math.sin(T * 9)) * 6;
        mo.rot = Math.sin(T * 9) * 0.03;
      } else {
        const b = Math.sin(T * 2.6 + 1) * 0.012;
        sh.sy = 1 + b;
      }
      if (o.guard) {
        sh.sy *= 0.96;
        sh.rot = 0.07;
      }
      break;
    case 'telegraph': {
      const tg = o.attack.telegraph;
      const k = clamp(o.t / o.dur, 0, 1);
      r.pose = o.attack.telegraphPose || 'idle';
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
        // 잡기: 전용 포즈가 없으므로 가장 가까운 포즈(하단 예고)를 옆으로 벌려 표현
        sh.sx = 1 + 0.2 * k;
        sh.sy = 1 - 0.06 * k;
        sh.rot = 0.1 * k;
        mo.dx = tremble;
        r.keep = 0.6;
      }
      break;
    }
    case 'recover':
    case 'grabHold':
      if (o.strikeT < 0.28 || o.state === 'grabHold') {
        r.pose = 'attack';
        r.alt = o.attack ? o.attack.telegraphPose : null;
        const k = o.state === 'grabHold' ? 0.5 : 1 - o.strikeT / 0.28;
        sh.rot = 0.36 * k;
        sh.sx = 1 + 0.14 * k;
        mo.dx = 22 * k;
      }
      break;
    case 'stun':
      if (o.strikeT < 0.2) {
        // 헛친 직후 잠깐은 공격 포즈
        r.pose = 'attack';
        r.alt = o.attack ? o.attack.telegraphPose : null;
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
          break;
        case 'hit':
          if (e.who === 'opp') {
            const big = e.counter || e.kind === 'kyuljae';
            this.impact(e.x, headY + 20, big);
            this.shake(big ? 18 : 8);
            this.flash.opp = { color: '#ffffff', t: 0, life: big ? 0.22 : 0.14 };
            this.pop(big ? '쾅!!' : '쾅!', e.x, headY - 40, { size: big ? 140 : 86, color: big ? COLORS.red : COLORS.gold, stroke: big ? COLORS.paper : COLORS.ink });
            this.pop(`-${e.damage}`, o.x + 40, headY + 60, { size: big ? 52 : 38, color: COLORS.paper, font: FONT_BODY, punch: false, life: 0.8, rot: 0 });
            if (e.counter) {
              this.say('counter', 5, 2.6);
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
          if (e.tg === 'high') this.say('evadeHigh', 2);
          else if (e.tg === 'low') this.say('evadeLow', 2);
          break;
        case 'ironBlock':
          this.impact(e.x + 40, headY + 30, true);
          this.shake(10);
          this.flash.player = { color: COLORS.gold, t: 0, life: 0.3 };
          this.pop('깡!', e.x + 30, headY - 40, { size: 100, color: COLORS.gold });
          this.say('ironBlock', 4);
          break;
        case 'block':
          this.pop(e.armor ? '안 먹힘!' : '막힘', e.x, headY - 20, { size: 44, color: '#c9ced8', stroke: COLORS.ink, life: 0.6 });
          this.shake(3);
          if (Math.random() < 0.5) this.say('guard', 1, 1.8);
          break;
        case 'guardBreak':
          this.pop('가드 파괴!', e.x, headY - 120, { size: 56, color: COLORS.red, stroke: COLORS.paper, life: 0.9 });
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
    for (const q of this.particles) q.t += dt;
    this.particles = this.particles.filter((q) => q.t < q.life);
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
  constructor(assets, match, playerDef, captions) {
    this.assets = assets;
    this.m = match;
    this.playerDef = playerDef;
    this.fx = new Effects(captions);
    this.px = match.player.x;
    this.ox = match.opp.x;
    this.T = 0;
  }

  update(dt) {
    this.T += dt;
    const m = this.m;
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
    drawBackground(ctx, a.bgs[m.oppDef.bg] || a.bgs.dong_gym, 0);

    shadow(ctx, this.ox, 1.05);
    shadow(ctx, this.px, 1);

    // 상대
    const o = m.opp;
    const ol = oppLook(o, m, T);
    const ospec = this.look(m.oppDef.sprite, m.oppDef.spriteFacing, ol);
    ospec.x = this.ox;
    ospec.screenFacing = -1;
    if (o.state === 'telegraph') {
      const tg = m.telegraphs[o.attack.telegraph];
      ospec.outline = { color: tg.color, width: 5 + Math.sin(T * 20) * 1.5 };
    } else if (o.state === 'stun' && o.strikeT >= 0.2) {
      ospec.outline = { color: COLORS.gold, width: 3 };
    }
    if (m.oppDef.tint) ospec.tint = { color: m.oppDef.tint, alpha: 0.22 };
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
    for (const pr of this.m.projectiles) {
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
      drawTelegraphIcon(ctx, x, y, 38 * pop, tg, k);
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
