// Painted canvas textures: flat colours with dark seams, slight noise.
import * as THREE from 'three';
const R = (s) => { let x = Math.sin(s * 9301 + 49297) * 233280; return x - Math.floor(x); };
const tex = (w, h, fn, rep = [1, 1]) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); fn(g, w, h);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
};
const noise = (g, w, h, a = 0.05, n = 900) => { for (let i = 0; i < n; i++) { g.fillStyle = `rgba(0,0,0,${a * R(i)})`; g.fillRect(R(i * 3) * w, R(i * 7) * h, 2 + R(i) * 6, 2 + R(i * 5) * 3); } };
export const brick = (base = '#a8553f', mortar = '#5a3a32', rep) => tex(256, 256, (g, w, h) => {
  g.fillStyle = mortar; g.fillRect(0, 0, w, h);
  const bh = 32, bw = 64;
  for (let r = 0; r < h / bh; r++) for (let c = -1; c < w / bw + 1; c++) {
    const x = c * bw + (r % 2) * bw / 2, k = 0.85 + 0.25 * R(r * 31 + c * 7);
    const col = new THREE.Color(base).multiplyScalar(k); g.fillStyle = '#' + col.getHexString();
    g.fillRect(x + 3, r * bh + 3, bw - 6, bh - 6);
  }
  noise(g, w, h, 0.08);
}, rep);
export const planks = (base = '#8a5a34', rep) => tex(256, 256, (g, w, h) => {
  const n = 6, pw = w / n;
  for (let i = 0; i < n; i++) {
    const col = new THREE.Color(base).multiplyScalar(0.85 + 0.25 * R(i * 13)); g.fillStyle = '#' + col.getHexString(); g.fillRect(i * pw, 0, pw, h);
    g.fillStyle = 'rgba(30,15,8,0.8)'; g.fillRect(i * pw, 0, 4, h);
    g.strokeStyle = 'rgba(40,20,10,0.25)'; g.lineWidth = 2;
    for (let k = 0; k < 4; k++) { g.beginPath(); const x = i * pw + 10 + R(i * 9 + k) * (pw - 20); g.moveTo(x, 0); g.bezierCurveTo(x + 8, h * 0.3, x - 8, h * 0.6, x + 4, h); g.stroke(); }
  }
  noise(g, w, h, 0.06);
}, rep);
export const cobble = (rep) => tex(256, 256, (g, w, h) => {
  g.fillStyle = '#4a4440'; g.fillRect(0, 0, w, h);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const col = new THREE.Color('#8d857a').multiplyScalar(0.8 + 0.35 * R(r * 17 + c)); g.fillStyle = '#' + col.getHexString();
    const x = c * 32 + (r % 2) * 16, y = r * 32; g.beginPath(); g.ellipse(x + 16, y + 16, 13, 12, 0, 0, 7); g.fill();
  }
  noise(g, w, h, 0.05);
}, rep);
export const plaster = (base = '#e9dcc0', rep) => tex(256, 256, (g, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h); noise(g, w, h, 0.05, 1400);
  g.strokeStyle = 'rgba(60,40,30,0.25)'; g.lineWidth = 2; g.beginPath(); g.moveTo(40, 0); g.lineTo(60, 50); g.lineTo(52, 90); g.stroke();
}, rep);
export const roof = (base = '#4b4f63', rep) => tex(256, 256, (g, w, h) => {
  g.fillStyle = '#20222c'; g.fillRect(0, 0, w, h);
  for (let r = 0; r < 8; r++) for (let c = -1; c < 9; c++) {
    const col = new THREE.Color(base).multiplyScalar(0.85 + 0.25 * R(r * 7 + c * 3)); g.fillStyle = '#' + col.getHexString();
    g.fillRect(c * 32 + (r % 2) * 16 + 2, r * 32 + 2, 28, 28);
  }
}, rep);
export const sign = (text, bg = '#2d1b10', fg = '#f2c14e') => tex(1024, 256, (g, w, h) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h); g.strokeStyle = fg; g.lineWidth = 12; g.strokeRect(14, 14, w - 28, h - 28);
  g.fillStyle = fg; g.font = 'bold 120px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 6);
});
export const wallpaper = (rep) => tex(256, 256, (g, w, h) => {
  g.fillStyle = '#6f8f7a'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,240,200,0.18)';
  for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) { g.beginPath(); g.ellipse(x + 32, y + 32, 8, 14, 0, 0, 7); g.fill(); }
  noise(g, w, h, 0.05);
}, rep);
