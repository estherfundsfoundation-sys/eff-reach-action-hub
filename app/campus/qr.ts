/* A small QR code encoder (byte mode, error correction level M, versions
   1–10, up to 213 bytes). Written here so the project keeps its no-new-
   dependencies rule. Returns a square grid of booleans (true = dark). */

type Spec = { total: number; blocks: number; ecc: number };
const SPECS: Spec[] = [
  { total: 26, blocks: 1, ecc: 10 }, { total: 44, blocks: 1, ecc: 16 }, { total: 70, blocks: 1, ecc: 26 },
  { total: 100, blocks: 2, ecc: 18 }, { total: 134, blocks: 2, ecc: 24 }, { total: 172, blocks: 4, ecc: 16 },
  { total: 196, blocks: 4, ecc: 18 }, { total: 242, blocks: 4, ecc: 22 }, { total: 292, blocks: 5, ecc: 22 },
  { total: 346, blocks: 5, ecc: 26 },
];
const ALIGN: number[][] = [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50]];

function gfMul(x: number, y: number) {
  let z = 0;
  for (let i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11d); z ^= ((y >>> i) & 1) * x; }
  return z & 0xff;
}
function rsDivisor(degree: number) {
  const r = new Array<number>(degree).fill(0); r[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < r.length; j++) { r[j] = gfMul(r[j], root); if (j + 1 < r.length) r[j] ^= r[j + 1]; }
    root = gfMul(root, 0x02);
  }
  return r;
}
function rsRemainder(data: number[], div: number[]) {
  const r = div.map(() => 0);
  for (const b of data) {
    const f = b ^ (r.shift() as number); r.push(0);
    div.forEach((c, i) => { r[i] ^= gfMul(c, f); });
  }
  return r;
}

export function qrMatrix(text: string): boolean[][] {
  const bytes = Array.from(new TextEncoder().encode(text));
  let version = 0;
  for (let v = 1; v <= 10; v++) {
    const s = SPECS[v - 1]; const dataCap = s.total - s.blocks * s.ecc;
    const bits = 4 + (v < 10 ? 8 : 16) + bytes.length * 8;
    if (bits <= dataCap * 8) { version = v; break; }
  }
  if (!version) throw new Error("Text too long for this QR code.");
  const spec = SPECS[version - 1];
  const dataCap = spec.total - spec.blocks * spec.ecc;

  // data bits
  const bb: number[] = [];
  const put = (val: number, len: number) => { for (let i = len - 1; i >= 0; i--) bb.push((val >>> i) & 1); };
  put(0b0100, 4); put(bytes.length, version < 10 ? 8 : 16); bytes.forEach((b) => put(b, 8));
  put(0, Math.min(4, dataCap * 8 - bb.length));
  put(0, (8 - (bb.length % 8)) % 8);
  for (let pad = 0xec; bb.length < dataCap * 8; pad ^= 0xec ^ 0x11) put(pad, 8);
  const data: number[] = [];
  for (let i = 0; i < bb.length; i += 8) data.push(bb.slice(i, i + 8).reduce((a, b) => (a << 1) | b, 0));

  // blocks, error correction, interleave
  const numShort = spec.blocks - (spec.total % spec.blocks);
  const shortLen = Math.floor(spec.total / spec.blocks);
  const div = rsDivisor(spec.ecc);
  const blocks: number[][] = [];
  for (let i = 0, k = 0; i < spec.blocks; i++) {
    const dat = data.slice(k, k + shortLen - spec.ecc + (i < numShort ? 0 : 1));
    k += dat.length;
    const ecc = rsRemainder(dat, div);
    if (i < numShort) dat.push(0);
    blocks.push(dat.concat(ecc));
  }
  const cw: number[] = [];
  for (let i = 0; i < blocks[0].length; i++) {
    blocks.forEach((b, j) => { if (i !== shortLen - spec.ecc || j >= numShort) cw.push(b[i]); });
  }

  // function patterns
  const size = version * 4 + 17;
  const m: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const fn: boolean[][] = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const setF = (x: number, y: number, d: boolean) => { m[y][x] = d; fn[y][x] = true; };
  for (let i = 0; i < size; i++) { setF(6, i, i % 2 === 0); setF(i, 6, i % 2 === 0); }
  const finder = (cx: number, cy: number) => {
    for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
      const x = cx + dx, y = cy + dy; if (x < 0 || y < 0 || x >= size || y >= size) continue;
      const d = Math.max(Math.abs(dx), Math.abs(dy)); setF(x, y, d !== 2 && d !== 4);
    }
  };
  finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
  const al = ALIGN[version - 1]; const last = al.length - 1;
  al.forEach((ay, i) => al.forEach((ax, j) => {
    if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) return;
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) setF(ax + dx, ay + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
  }));
  const drawFormat = (mask: number) => {
    const d = (0 << 3) | mask; // level M = 00
    let rem = d; for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((d << 10) | rem) ^ 0x5412;
    const bit = (i: number) => ((bits >>> i) & 1) !== 0;
    for (let i = 0; i <= 5; i++) setF(8, i, bit(i));
    setF(8, 7, bit(6)); setF(8, 8, bit(7)); setF(7, 8, bit(8));
    for (let i = 9; i < 15; i++) setF(14 - i, 8, bit(i));
    for (let i = 0; i < 8; i++) setF(size - 1 - i, 8, bit(i));
    for (let i = 8; i < 15; i++) setF(8, size - 15 + i, bit(i));
    setF(8, size - 8, true);
  };
  drawFormat(0);
  if (version >= 7) {
    let rem = version; for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const bits = (version << 12) | rem;
    for (let i = 0; i < 18; i++) {
      const b = ((bits >>> i) & 1) !== 0; const a = size - 11 + (i % 3), c = Math.floor(i / 3);
      setF(a, c, b); setF(c, a, b);
    }
  }

  // data placement
  let bi = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert++) for (let j = 0; j < 2; j++) {
      const x = right - j; const up = ((right + 1) & 2) === 0; const y = up ? size - 1 - vert : vert;
      if (!fn[y][x] && bi < cw.length * 8) { m[y][x] = ((cw[bi >>> 3] >>> (7 - (bi & 7))) & 1) !== 0; bi++; }
    }
  }

  // choose the mask with the lowest penalty
  const maskFn = (k: number, x: number, y: number) => [
    (x + y) % 2 === 0, y % 2 === 0, x % 3 === 0, (x + y) % 3 === 0, (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
    ((x * y) % 2) + ((x * y) % 3) === 0, (((x * y) % 2) + ((x * y) % 3)) % 2 === 0, (((x + y) % 2) + ((x * y) % 3)) % 2 === 0][k];
  const apply = (k: number) => { for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) if (!fn[y][x] && maskFn(k, x, y)) m[y][x] = !m[y][x]; };
  const penalty = () => {
    let p = 0, dark = 0;
    for (let y = 0; y < size; y++) {
      let runX = 1, runY = 1;
      for (let x = 0; x < size; x++) {
        if (m[y][x]) dark++;
        if (x > 0) { if (m[y][x] === m[y][x - 1]) { runX++; if (runX === 5) p += 3; else if (runX > 5) p++; } else runX = 1; }
        if (x > 0) { if (m[x][y] === m[x - 1][y]) { runY++; if (runY === 5) p += 3; else if (runY > 5) p++; } else runY = 1; }
        if (x < size - 1 && y < size - 1 && m[y][x] === m[y][x + 1] && m[y][x] === m[y + 1][x] && m[y][x] === m[y + 1][x + 1]) p += 3;
      }
    }
    const total = size * size;
    p += Math.floor(Math.abs(dark * 20 - total * 10) / total) * 10;
    return p;
  };
  let best = 0, bestP = Infinity;
  for (let k = 0; k < 8; k++) {
    apply(k); drawFormat(k);
    const p = penalty(); if (p < bestP) { bestP = p; best = k; }
    apply(k);
  }
  apply(best); drawFormat(best);
  return m;
}

/* SVG markup for a QR code with a quiet zone, crisp at any size. */
export function qrSvg(text: string, dark = "#1A1226", light = "#FFFFFF") {
  const m = qrMatrix(text); const q = 4; const n = m.length + q * 2;
  let path = "";
  m.forEach((row, y) => row.forEach((on, x) => { if (on) path += `M${x + q} ${y + q}h1v1h-1z`; }));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><rect width="${n}" height="${n}" fill="${light}"/><path d="${path}" fill="${dark}"/></svg>`;
}
