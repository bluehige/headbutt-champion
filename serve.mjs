// 의존성 없는 작은 정적 서버.
// 사용법: node serve.mjs [포트]   (기본 5173)
// 추가 기능: GET /__list?dir=<폴더> → 그 폴더의 파일 이름 JSON 배열(이미지 존재 확인용, 404 콘솔 오류 방지)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.argv[2]) || 5173;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.md': 'text/plain; charset=utf-8',
};

// ROOT 밖으로 나가는 경로를 막는다.
function safePath(rel) {
  const p = path.normalize(path.join(ROOT, rel));
  if (p !== ROOT && !p.startsWith(ROOT + path.sep)) return null;
  return p;
}

const server = http.createServer((req, res) => {
  let url;
  try {
    url = new URL(req.url, 'http://localhost');
  } catch {
    res.writeHead(400).end();
    return;
  }
  const headers = { 'Cache-Control': 'no-cache' };

  if (url.pathname === '/__list') {
    const dir = safePath(url.searchParams.get('dir') || '');
    let files = [];
    try {
      files = fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isFile()).map((d) => d.name);
    } catch {
      files = [];
    }
    res.writeHead(200, { ...headers, 'Content-Type': TYPES['.json'] });
    res.end(JSON.stringify(files));
    return;
  }

  let rel;
  try {
    rel = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400).end();
    return;
  }
  if (rel.endsWith('/')) rel += 'index.html';
  const file = safePath(rel);
  if (!file) {
    res.writeHead(403).end();
    return;
  }
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) {
      res.writeHead(404, { ...headers, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, {
      ...headers,
      'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Content-Length': st.size,
    });
    fs.createReadStream(file).pipe(res);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`박치기 챔피언: http://localhost:${PORT}/  (디버그: http://localhost:${PORT}/?debug=1)`);
});
