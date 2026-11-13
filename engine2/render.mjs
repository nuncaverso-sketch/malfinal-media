// node render.mjs OUTDIR "0-99,150" [width] [port]   (serves ./web; RESUME=1 skips existing frames)
import puppeteer from 'puppeteer-core'; import http from 'http'; import fs from 'fs'; import path from 'path';
const [outDir, spec, width = '1080', port = '8793'] = process.argv.slice(2);
const root = path.resolve('web'); const ty = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream', '.png': 'image/png', '.jpg': 'image/jpeg' };
const srv = http.createServer((q, r) => { const p = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(p, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': ty[path.extname(p)] || 'application/octet-stream' }); r.end(d); }); }).listen(+port);
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const pg = await b.newPage(); const W = +width, H = Math.round(W * 16 / 9); await pg.setViewport({ width: W, height: H });
pg.on('pageerror', e => console.log('ERR', e.message)); pg.on('console', m => { const t = m.text(); if (!/GPU stall|GL Driver|WebGL/.test(t)) console.log('PAGE', t); });
await pg.goto(`http://localhost:${port}/index.html?w=${W}`); await pg.waitForFunction('window.ready===true', { timeout: 300000 });
const N = await pg.evaluate('window.FRAMES');
let frames = []; for (const part of spec.split(',')) { if (part.includes('-')) { const [a, bb] = part.split('-').map(Number); for (let i = a; i <= Math.min(bb, N - 1); i++) frames.push(i); } else frames.push(+part); }
fs.mkdirSync(outDir, { recursive: true });
const resume = process.env.RESUME === '1'; const t0 = Date.now(); let n = 0;
for (const f of frames) {
  const fn = `${outDir}/f${String(f).padStart(4, '0')}.jpg`;
  if (resume && fs.existsSync(fn)) continue;
  const d = await pg.evaluate(`window.renderFrame(${f})`); fs.writeFileSync(fn, Buffer.from(d.split(',')[1], 'base64')); n++;
  if (n % 60 === 0) console.log('frame', f, 'of', N, ((Date.now() - t0) / 1000 / n).toFixed(2), 's/f');
}
console.log('done', n, 'frames', ((Date.now() - t0) / 1000 / Math.max(1, n)).toFixed(2), 's/f, total', N);
await b.close(); srv.close();
