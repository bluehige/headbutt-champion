// 이미지 로더.
// - 포즈 파일이 있으면 쓰고, 없으면 렌더러가 idle(아저씨는 ref_sheet까지)로 대체해 코드 변형을 준다.
// - 회색 단색 배경 이미지는 모서리 색 기준으로 투명 처리한다(이미 투명하면 그대로).
//   file:// 처럼 캔버스 픽셀을 읽을 수 없는 환경에서는 처리 없이 원본을 쓴다.
// - serve.mjs의 /__list 로 폴더 목록을 먼저 확인해 없는 파일 요청(404)을 피한다.

export const POSE_NAMES = [
  'idle', 'walk', 'duck', 'backstep', 'headbutt_ready', 'headbutt_hit', 'hurt', 'win', 'lose', 'ranged',
  'telegraph_high', 'telegraph_low', 'attack', 'stun',
];
// idle이 없을 때 쓸 기준 이미지
const BASE_FALLBACKS = ['idle', 'ref_sheet'];

const SPRITE_TARGET_H = 768; // 원본 1536 → 절반으로 줄여 보관(화면에는 약 460px로 그림)

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

async function listDir(dir) {
  try {
    const res = await fetch(`__list?dir=${encodeURIComponent(dir)}`, { cache: 'no-store' });
    if (res.ok) {
      const arr = await res.json();
      if (Array.isArray(arr)) return arr;
    }
  } catch {
    // 아래 정적 목록으로 넘어간다
  }
  // GitHub Pages 같은 정적 호스팅에는 /__list 가 없으므로 폴더 안의 _list.json 을 쓴다
  // (tools/make-lists.mjs 로 생성).
  try {
    const res = await fetch(`${dir}/_list.json`, { cache: 'no-cache' });
    if (!res.ok) return null;
    const arr = await res.json();
    return Array.isArray(arr) ? arr : null;
  } catch {
    return null;
  }
}

function colorDist2(d, i, r, g, b) {
  const dr = d[i] - r;
  const dg = d[i + 1] - g;
  const db = d[i + 2] - b;
  return dr * dr + dg * dg + db * db;
}

// 모서리 색과 비슷하고 테두리에서 이어진 영역만 지운다(인물 안쪽의 회색은 건드리지 않음).
export function removeSolidBackground(ctx, w, h, tol = 30, soft = 58) {
  const img = ctx.getImageData(0, 0, w, h); // file://에서는 여기서 SecurityError
  const d = img.data;
  const S = 6;
  const corners = [
    [0, 0], [w - S, 0], [0, h - S], [w - S, h - S],
  ].map(([cx, cy]) => {
    let r = 0, g = 0, b = 0, a = 0;
    for (let y = cy; y < cy + S; y++) {
      for (let x = cx; x < cx + S; x++) {
        const i = (y * w + x) * 4;
        r += d[i]; g += d[i + 1]; b += d[i + 2]; a += d[i + 3];
      }
    }
    const n = S * S;
    return [r / n, g / n, b / n, a / n];
  });
  // 이미 투명한 이미지는 건드리지 않는다
  if (corners.some((c) => c[3] < 250)) return false;
  const ref = [0, 1, 2].map((k) => corners.reduce((s, c) => s + c[k], 0) / 4);
  const spread = Math.max(...corners.map((c) => Math.hypot(c[0] - ref[0], c[1] - ref[1], c[2] - ref[2])));
  if (spread > 40) return false; // 단색 배경이 아니다

  const [r, g, b] = ref;
  const tol2 = tol * tol;
  const n = w * h;
  const seen = new Uint8Array(n);
  const queue = new Int32Array(n);
  let qh = 0, qt = 0;
  const trySeed = (p) => {
    if (seen[p]) return;
    if (colorDist2(d, p * 4, r, g, b) <= tol2) {
      seen[p] = 1;
      queue[qt++] = p;
    }
  };
  for (let x = 0; x < w; x++) { trySeed(x); trySeed((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { trySeed(y * w); trySeed(y * w + w - 1); }
  while (qh < qt) {
    const p = queue[qh++];
    d[p * 4 + 3] = 0;
    const x = p % w;
    if (x > 0) trySeed(p - 1);
    if (x < w - 1) trySeed(p + 1);
    if (p >= w) trySeed(p - w);
    if (p < n - w) trySeed(p + w);
  }
  // 경계 부드럽게: 지운 영역에 닿은 픽셀 중 배경색에 가까운 것은 반투명으로
  for (let p = 0; p < n; p++) {
    if (seen[p]) continue;
    const x = p % w;
    const nb = (x > 0 && seen[p - 1]) || (x < w - 1 && seen[p + 1]) || (p >= w && seen[p - w]) || (p < n - w && seen[p + w]);
    if (!nb) continue;
    const dist = Math.sqrt(colorDist2(d, p * 4, r, g, b));
    if (dist < soft) d[p * 4 + 3] = Math.round(255 * Math.max(0.15, (dist - tol) / (soft - tol)));
  }
  ctx.putImageData(img, 0, 0);
  return true;
}

function toProcessedCanvas(img, targetH) {
  const scale = Math.min(1, targetH / img.naturalHeight);
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);
  let keyed = false;
  try {
    keyed = removeSolidBackground(ctx, w, h);
  } catch (e) {
    // file:// 등에서 캔버스가 오염되어 픽셀을 못 읽음 → 원본 그대로 사용
    console.info('[assets] 배경 투명 처리 생략:', e && e.name);
  }
  c.keyed = keyed;
  return c;
}

export class Assets {
  constructor({ onlyBase = false } = {}) {
    this.onlyBase = onlyBase; // true면 idle·ref_sheet만 불러옴(대체 변형 확인용, ?nopose=1)
    this.sprites = {}; // id → { pose → canvas }
    this.bgs = {}; // id → image
    this.silCache = new WeakMap();
    this.listingAvailable = false;
  }

  async loadSprite(id, onProgress) {
    const dir = `assets/char/${id}`;
    const listing = await listDir(dir);
    if (listing) this.listingAvailable = true;
    const names = this.onlyBase ? BASE_FALLBACKS : [...new Set([...POSE_NAMES, ...BASE_FALLBACKS])];
    const want = listing ? names.filter((n) => listing.includes(`${n}.png`)) : names;
    const out = {};
    await Promise.all(
      want.map(async (pose) => {
        const img = await loadImage(`${dir}/${pose}.png`);
        if (img) out[pose] = toProcessedCanvas(img, SPRITE_TARGET_H);
        onProgress && onProgress();
      })
    );
    this.sprites[id] = out;
    return out;
  }

  async loadBg(id) {
    const dir = 'assets/bg';
    const listing = await listDir(dir);
    let img = null;
    for (const ext of ['jpg', 'png', 'webp']) {
      if (listing && !listing.includes(`${id}.${ext}`)) continue;
      img = await loadImage(`${dir}/${id}.${ext}`);
      if (img) break;
    }
    this.bgs[id] = img;
    return img;
  }

  // 포즈 조회: { img, fallback }. 없으면 idle → ref_sheet 순으로 대체(fallback=true).
  pose(spriteId, pose, alt) {
    const set = this.sprites[spriteId] || {};
    if (set[pose]) return { img: set[pose], fallback: false, name: pose };
    if (alt && set[alt]) return { img: set[alt], fallback: true, name: alt };
    for (const b of BASE_FALLBACKS) if (set[b]) return { img: set[b], fallback: true, name: b };
    return { img: null, fallback: true, name: null };
  }

  hasPose(spriteId, pose) {
    return !!(this.sprites[spriteId] && this.sprites[spriteId][pose]);
  }

  // 단색 실루엣(윤곽선·번쩍임용). 캔버스가 오염돼도 합성은 가능하다.
  silhouette(canvas, color) {
    let m = this.silCache.get(canvas);
    if (!m) {
      m = new Map();
      this.silCache.set(canvas, m);
    }
    let s = m.get(color);
    if (!s) {
      s = document.createElement('canvas');
      s.width = canvas.width;
      s.height = canvas.height;
      const c = s.getContext('2d');
      c.drawImage(canvas, 0, 0);
      c.globalCompositeOperation = 'source-in';
      c.fillStyle = color;
      c.fillRect(0, 0, s.width, s.height);
      m.set(color, s);
    }
    return s;
  }
}
