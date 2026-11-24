// 정적 호스팅용 폴더 목록을 만든다. 이미지를 추가하거나 지운 뒤 실행: node tools/make-lists.mjs
// - assets/_list.json : { "assets/bg": [...], "assets/char/gwak": [...], "assets/ui": [...], ... }
//   게임은 이 파일 하나로 어떤 이미지가 있는지 안다(없는 파일을 요청해 404가 나지 않게).
// - 각 폴더의 _list.json : 예전 배포와의 호환용(같은 내용).
// 게임에서 쓰지 않는 원본(ref_sheet, *_src)은 목록에서 빼서 내려받지 않게 한다.
// 아직 없는 폴더(assets/ui, assets/fx 등)는 만들지 않고 빈 목록으로만 기록한다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dirs = ['assets/bg', 'assets/ui', 'assets/fx'];
const charRoot = path.join(root, 'assets/char');
if (fs.existsSync(charRoot)) {
  for (const d of fs.readdirSync(charRoot, { withFileTypes: true })) {
    if (d.isDirectory()) dirs.push(`assets/char/${d.name}`);
  }
}
const manifest = {};
for (const dir of dirs) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) {
    manifest[dir] = [];
    console.log(dir, '(폴더 없음)');
    continue;
  }
  const all = fs.readdirSync(abs).filter((f) => /\.(png|jpg|jpeg|webp)$/i.test(f));
  const hasIdle = all.includes('idle.png');
  const files = all.filter((f) => !/_src\./.test(f) && !(hasIdle && f === 'ref_sheet.png')).sort();
  manifest[dir] = files;
  fs.writeFileSync(path.join(abs, '_list.json'), JSON.stringify(files) + '\n');
  console.log(dir, files.length);
}
fs.writeFileSync(path.join(root, 'assets/_list.json'), JSON.stringify(manifest, null, 1) + '\n');
console.log('assets/_list.json', Object.keys(manifest).length, '폴더');
