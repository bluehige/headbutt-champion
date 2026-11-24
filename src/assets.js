// 이미지 로더.
// - 파일이 있으면 쓰고, 없으면 렌더러가 가까운 포즈 + 코드 변형(아이콘·배경은 코드로 그림)으로 대신한다.
// - 회색 단색 배경 이미지는 모서리 색 기준으로 투명 처리한다(이미 투명하면 그대로).
//   file:// 처럼 캔버스 픽셀을 읽을 수 없는 환경에서는 처리 없이 원본을 쓴다.
// - 없는 파일을 요청해 404 콘솔 오류가 나지 않도록, 먼저 폴더 목록을 확인한다.
//     로컬 개발(localhost, ?static=1 아님): serve.mjs 의 /__list?dir=…
//     정적 호스팅(GitHub Pages 등): assets/_list.json (폴더 → 파일 목록, tools/make-lists.mjs 로 생성)
//   목록에 없는 폴더는 비어 있는 것으로 본다(추측 요청을 하지 않음).
// - 처음에는 타이틀에 필요한 것만, 경기마다 그 상대·배경만 불러온다(lazy).

// 아저씨 포즈
export const POSE_NAMES = [
  'idle', 'walk', 'duck', 'backstep', 'headbutt_ready', 'headbutt_hit', 'hurt', 'win', 'lose', 'ranged',
  'telegraph_high', 'telegraph_low', 'attack', 'stun',
];
// 상대 포즈(곽두팔은 attack 하나만 있다)
export const OPP_POSE_NAMES = [
  'idle', 'telegraph_high', 'attack_high', 'telegraph_low', 'attack_low', 'telegraph_grab', 'attack_grab',
  'guard', 'stun', 'lose', 'retreat', 'attack', 'win',
];
// idle이 없을 때 쓸 기준 이미지
const BASE_FALLBACKS = ['idle', 'ref_sheet'];
const KNOWN_POSES = new Set([...POSE_NAMES, ...OPP_POSE_NAMES, ...BASE_FALLBACKS]);

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

const isLocalHost = () => ['localhost', '127.0.0.1', '[::1]', '::1'].includes(location.hostname);

export class Assets {
  constructor({ onlyBase = false, forceStatic = false } = {}) {
    this.onlyBase = onlyBase; // true면 idle·ref_sheet만 불러옴(대체 변형 확인용, ?nopose=1)
    this.devList = !forceStatic && isLocalHost() && location.protocol.startsWith('http');
    this.sprites = {}; // id → { pose → canvas }
    this.bgs = {}; // id → image | null
    this.images = {}; // 'ui/skill_double' → canvas | image | null
    this.silCache = new WeakMap();
    this.lists = {}; // dir → Promise<string[]>
    this.manifest = null; // 정적 목록(assets/_list.json)
    this.manifestTried = null;
    this.pending = {}; // 중복 요청 방지
  }

  async loadManifest() {
    if (!this.manifestTried) {
      this.manifestTried = (async () => {
        try {
          const res = await fetch('assets/_list.json', { cache: 'no-cache' });
          if (res.ok) {
            const j = await res.json();
            if (j && typeof j === 'object' && !Array.isArray(j)) this.manifest = j;
          }
        } catch {
          // 목록이 없으면 아래에서 폴더별 _list.json 을 본다
        }
      })();
    }
    return this.manifestTried;
  }

  // 폴더의 파일 목록(없으면 빈 배열)
  listDir(dir) {
    if (!this.lists[dir]) {
      this.lists[dir] = (async () => {
        if (this.devList) {
          try {
            const res = await fetch(`__list?dir=${encodeURIComponent(dir)}`, { cache: 'no-store' });
            if (res.ok) {
              const arr = await res.json();
              if (Array.isArray(arr)) return arr;
            }
          } catch {
            // 정적 목록으로 넘어간다
          }
        }
        await this.loadManifest();
        if (this.manifest) return Array.isArray(this.manifest[dir]) ? this.manifest[dir] : [];
        // 옛 배포: 폴더별 _list.json (bg, char/* 만 있었다)
        if (!(dir === 'assets/bg' || dir.startsWith('assets/char/'))) return [];
        try {
          const res = await fetch(`${dir}/_list.json`, { cache: 'no-cache' });
          if (!res.ok) return [];
          const arr = await res.json();
          return Array.isArray(arr) ? arr : [];
        } catch {
          return [];
        }
      })();
    }
    return this.lists[dir];
  }

  // 캐릭터 포즈 불러오기. poses를 주면 그 포즈만(예: ['idle']), 없으면 폴더에 있는 아는 포즈 전부.
  async loadSprite(id, { poses = null, onProgress = null } = {}) {
    const dir = `assets/char/${id}`;
    const listing = await this.listDir(dir);
    const set = this.sprites[id] || (this.sprites[id] = {});
    let names = listing
      .filter((f) => /\.png$/i.test(f) && !/_src\./i.test(f))
      .map((f) => f.replace(/\.png$/i, ''))
      .filter((n) => KNOWN_POSES.has(n));
    if (names.includes('idle')) names = names.filter((n) => n !== 'ref_sheet');
    if (this.onlyBase) names = names.filter((n) => BASE_FALLBACKS.includes(n));
    if (poses) names = names.filter((n) => poses.includes(n));
    const want = names.filter((n) => !set[n]);
    let done = 0;
    await Promise.all(
      want.map(async (pose) => {
        const key = `${id}/${pose}`;
        if (!this.pending[key]) {
          this.pending[key] = loadImage(`${dir}/${pose}.png`).then((img) => {
            if (img) set[pose] = toProcessedCanvas(img, SPRITE_TARGET_H);
            delete this.pending[key];
          });
        }
        await this.pending[key];
        done++;
        onProgress && onProgress(done / Math.max(1, want.length));
      })
    );
    if (!want.length && onProgress) onProgress(1);
    return set;
  }

  // 다른 상대의 큰 포즈 이미지는 내려 둔다(대진표용 idle만 남김)
  unloadSprite(id, keep = ['idle']) {
    const set = this.sprites[id];
    if (!set) return;
    for (const k of Object.keys(set)) if (!keep.includes(k)) delete set[k];
  }

  hasBase(id) {
    const set = this.sprites[id];
    return !!(set && BASE_FALLBACKS.some((b) => set[b]));
  }

  async loadBg(id) {
    if (id in this.bgs) return this.bgs[id];
    const listing = await this.listDir('assets/bg');
    let img = null;
    for (const ext of ['jpg', 'png', 'webp']) {
      if (!listing.includes(`${id}.${ext}`)) continue;
      img = await loadImage(`assets/bg/${id}.${ext}`);
      if (img) break;
    }
    this.bgs[id] = img;
    return img;
  }

  // assets/ui, assets/fx 의 이미지. process=true면 단색 배경을 지우고 targetH로 줄인 캔버스.
  async loadImageAsset(dir, name, { process = true, targetH = 512 } = {}) {
    const key = `${dir}/${name}`;
    if (key in this.images) return this.images[key];
    const listing = await this.listDir(`assets/${dir}`);
    let out = null;
    for (const ext of ['png', 'jpg', 'webp']) {
      if (!listing.includes(`${name}.${ext}`)) continue;
      const img = await loadImage(`assets/${dir}/${name}.${ext}`);
      if (img) {
        out = process ? toProcessedCanvas(img, targetH) : img;
        break;
      }
    }
    this.images[key] = out;
    return out;
  }

  image(dir, name) {
    return this.images[`${dir}/${name}`] || null;
  }

  // 포즈 조회: { img, fallback, name }.
  // pose는 문자열 또는 우선순위 배열. 첫 후보가 아니면 fallback=true(렌더러가 코드 변형을 크게 준다).
  pose(spriteId, pose, alt) {
    const set = this.sprites[spriteId] || {};
    const chain = Array.isArray(pose) ? [...pose] : [pose];
    if (alt) chain.push(...(Array.isArray(alt) ? alt : [alt]));
    for (let i = 0; i < chain.length; i++) {
      const n = chain[i];
      if (n && set[n]) return { img: set[n], fallback: i > 0, name: n };
    }
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
