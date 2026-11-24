// 정적 호스팅용 폴더 목록(_list.json)을 만든다. 이미지를 추가하거나 지운 뒤 실행: node tools/make-lists.mjs
// 게임에서 쓰지 않는 원본(ref_sheet, *_src)은 목록에서 빼서 내려받지 않게 한다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dirs = ['assets/bg'];
const charRoot = path.join(root, 'assets/char');
for (const d of fs.readdirSync(charRoot, { withFileTypes: true })) {
  if (d.isDirectory()) dirs.push(`assets/char/${d.name}`);
}
for (const dir of dirs) {
  const abs = path.join(root, dir);
  const all = fs.readdirSync(abs).filter((f) => /\.(png|jpg|webp)$/i.test(f));
  const hasIdle = all.includes('idle.png');
  const files = all.filter((f) => !/_src\./.test(f) && !(hasIdle && f === 'ref_sheet.png'));
  fs.writeFileSync(path.join(abs, '_list.json'), JSON.stringify(files) + '\n');
  console.log(dir, files.length);
}
