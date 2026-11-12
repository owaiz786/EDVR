import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// ---------------------------------------------------------------------------
// Anatomy toolkit
//
// Body space: adult figure, 9 units tall (feet y = -4.5, top of head y = +4.5),
// centred on the origin and facing +Z. The body's RIGHT side is at -X (so it
// appears on the viewer's left when you look at the figure from the front).
//
// Landmarks (y): chin 3.33 · shoulders 2.88 · nipples 1.98 · navel 0.9 ·
// crotch -0.27 · knee -1.98 · ankle -4.1
// ---------------------------------------------------------------------------

export const v3 = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export const BODY_TOP = 4.5;
export const BODY_BOTTOM = -4.5;

// ---------- small maths helpers ----------

export function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

// Catmull-Rom interpolation of column `col` of `keys` (column 0 = x).
export function interp(keys: number[][], x: number, col = 1): number {
  const n = keys.length;
  if (x <= keys[0][0]) return keys[0][col];
  if (x >= keys[n - 1][0]) return keys[n - 1][col];
  let i = 0;
  while (i < n - 2 && x > keys[i + 1][0]) i++;
  const p0 = keys[Math.max(0, i - 1)][col];
  const p1 = keys[i][col];
  const p2 = keys[i + 1][col];
  const p3 = keys[Math.min(n - 1, i + 2)][col];
  const t = (x - keys[i][0]) / (keys[i + 1][0] - keys[i][0]);
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- geometry helpers ----------

// Strip attributes that would stop geometries from being merged.
export function bare<T extends THREE.BufferGeometry>(g: T): T {
  g.deleteAttribute('uv');
  if (g.hasAttribute('uv1')) g.deleteAttribute('uv1');
  return g;
}

export function xf(
  g: THREE.BufferGeometry,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] = [1, 1, 1],
): THREE.BufferGeometry {
  const m = new THREE.Matrix4().compose(
    new THREE.Vector3(...pos),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot)),
    new THREE.Vector3(...scale),
  );
  g.applyMatrix4(m);
  return g;
}

export function ellipsoid(
  rx: number,
  ry: number,
  rz: number,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0],
  w = 28,
  h = 18,
): THREE.BufferGeometry {
  return xf(bare(new THREE.SphereGeometry(1, w, h)), pos, rot, [rx, ry, rz]);
}

export function merge(parts: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const g = mergeGeometries(parts.map((p) => bare(p)), false);
  if (!g) throw new Error('merge failed');
  return g;
}

export type RadiusFn = (t: number) => number;
export const profile = (keys: number[][]): RadiusFn => (t) => interp(keys, t, 1);

export interface TubeOpts {
  seg?: number;
  radial?: number;
  round?: number; // fraction of the length used to round off each end
}

// Variable-radius tube along a curve (or through a list of points).
export function makeTube(
  src: THREE.Vector3[] | THREE.Curve<THREE.Vector3>,
  radius: number | RadiusFn,
  o: TubeOpts = {},
): THREE.BufferGeometry {
  const curve = Array.isArray(src) ? new THREE.CatmullRomCurve3(src, false, 'centripetal') : src;
  const seg = o.seg ?? 48;
  const radial = o.radial ?? 12;
  const round = o.round ?? 0.04;
  const frames = curve.computeFrenetFrames(seg, false);
  const pos: number[] = [];
  const idx: number[] = [];
  const P = new THREE.Vector3();
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    curve.getPointAt(t, P);
    let r = typeof radius === 'number' ? radius : radius(t);
    if (round > 0) {
      const e = Math.min(t, 1 - t);
      if (e < round) r *= Math.sqrt(Math.max(0, 1 - ((round - e) / round) ** 2));
    }
    const N = frames.normals[i];
    const B = frames.binormals[i];
    for (let j = 0; j < radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const c = Math.cos(a);
      const s = Math.sin(a);
      pos.push(P.x + (N.x * c + B.x * s) * r, P.y + (N.y * c + B.y * s) * r, P.z + (N.z * c + B.z * s) * r);
    }
  }
  for (let i = 0; i < seg; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * radial + j;
      const b = i * radial + ((j + 1) % radial);
      const c = (i + 1) * radial + j;
      const d = (i + 1) * radial + ((j + 1) % radial);
      idx.push(a, b, c, b, d, c);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// A sub-section of a curve as a new curve.
export function subCurve(curve: THREE.Curve<THREE.Vector3>, t0: number, t1: number, n = 12, off = new THREE.Vector3()): THREE.CatmullRomCurve3 {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= n; i++) pts.push(curve.getPointAt(t0 + ((t1 - t0) * i) / n).add(off));
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal');
}

export function curveOf(points: [number, number, number][]): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(points.map((p) => v3(...p)), false, 'centripetal');
}

// Elliptical loft (used for the torso).
function loft(keys: number[][], rings = 72, radial = 44, power = 2.3): THREE.BufferGeometry {
  const y0 = keys[0][0];
  const y1 = keys[keys.length - 1][0];
  const pos: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= rings; i++) {
    const y = y0 + ((y1 - y0) * i) / rings;
    const rx = interp(keys, y, 1);
    const rz = interp(keys, y, 2);
    const cz = interp(keys, y, 3);
    for (let j = 0; j < radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const e = 2 / power;
      pos.push(rx * Math.sign(s) * Math.abs(s) ** e, y, cz + rz * Math.sign(c) * Math.abs(c) ** e);
    }
  }
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * radial + j;
      const b = i * radial + ((j + 1) % radial);
      const c = (i + 1) * radial + j;
      const d = (i + 1) * radial + ((j + 1) % radial);
      idx.push(a, c, b, b, c, d);
    }
  }
  // caps
  const bc = pos.length / 3;
  pos.push(0, y0, interp(keys, y0, 3));
  const tc = bc + 1;
  pos.push(0, y1, interp(keys, y1, 3));
  for (let j = 0; j < radial; j++) {
    const b = (j + 1) % radial;
    idx.push(bc, j, b);
    idx.push(tc, rings * radial + b, rings * radial + j);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// ---------------------------------------------------------------------------
// Body proportions
// ---------------------------------------------------------------------------

// y, half-width (rx), half-depth (rz), centre z
export const TORSO_KEYS: number[][] = [
  [-0.5, 0.5, 0.34, 0],
  [-0.35, 0.76, 0.44, 0],
  [-0.1, 0.86, 0.47, -0.01],
  [0.3, 0.85, 0.46, 0],
  [0.9, 0.74, 0.42, 0],
  [1.4, 0.8, 0.45, 0.01],
  [1.95, 0.9, 0.5, 0.03],
  [2.4, 0.94, 0.45, 0],
  [2.75, 0.88, 0.36, -0.03],
  [2.95, 0.55, 0.28, -0.03],
  [3.12, 0.27, 0.24, 0],
];

export const torsoAt = (y: number) => ({
  rx: interp(TORSO_KEYS, y, 1),
  rz: interp(TORSO_KEYS, y, 2),
  cz: interp(TORSO_KEYS, y, 3),
});

// Centre line of the vertebral column (z for a given height)
const SPINE_Z: number[][] = [
  [-0.4, -0.3],
  [0.0, -0.26],
  [0.5, -0.2],
  [1.0, -0.26],
  [1.5, -0.32],
  [2.0, -0.34],
  [2.6, -0.3],
  [3.0, -0.22],
  [3.55, -0.16],
];
export const spineZ = (y: number) => interp(SPINE_Z, y, 1);

export const armCurve = (side: number) =>
  curveOf([
    [side * 1.08, 2.62, 0],
    [side * 1.32, 1.1, -0.02],
    [side * 1.5, -0.18, 0.05],
  ]);
export const legCurve = (side: number) =>
  curveOf([
    [side * 0.4, 0.05, 0],
    [side * 0.4, -1.98, 0.05],
    [side * 0.38, -4.1, -0.02],
  ]);

export const ARM_R = profile([
  [0, 0.3],
  [0.1, 0.29],
  [0.3, 0.24],
  [0.5, 0.21],
  [0.6, 0.2],
  [0.8, 0.15],
  [1, 0.11],
]);
export const LEG_R = profile([
  [0, 0.47],
  [0.15, 0.46],
  [0.35, 0.36],
  [0.49, 0.27],
  [0.57, 0.28],
  [0.65, 0.29],
  [0.8, 0.2],
  [1, 0.14],
]);

// ---------------------------------------------------------------------------
// Skin
// ---------------------------------------------------------------------------

function headGeometry(): THREE.BufferGeometry {
  const g = bare(new THREE.SphereGeometry(1, 48, 36));
  g.deleteAttribute('normal');
  const merged = mergeVertices(g, 1e-4);
  const p = merged.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i);
    let y = p.getY(i);
    let z = p.getZ(i);
    // tapered jaw: narrower and slightly pushed forward below the middle
    if (y < 0) {
      const k = -y;
      x *= 1 - 0.28 * k * k;
      z *= 1 - 0.1 * k * k;
    }
    // flatten the face a little
    if (z > 0) z *= 0.92 + 0.08 * (1 - Math.abs(x));
    p.setXYZ(i, x * 0.45, 3.92 + y * 0.6, 0.03 + z * 0.54);
  }
  merged.computeVertexNormals();
  return merged;
}

export interface SkinGeometry {
  all: THREE.BufferGeometry;
}

let skinCache: THREE.BufferGeometry | null = null;
export function getSkinGeometry(): THREE.BufferGeometry {
  if (skinCache) return skinCache;
  const parts: THREE.BufferGeometry[] = [];
  parts.push(loft(TORSO_KEYS));
  parts.push(makeTube([v3(0, 3.0, -0.02), v3(0, 3.3, 0.02), v3(0, 3.6, 0.05)], 0.22, { round: 0.02 }));
  parts.push(headGeometry());
  for (const s of [-1, 1]) {
    parts.push(makeTube(armCurve(s), ARM_R, { seg: 40, radial: 16, round: 0.12 }));
    parts.push(ellipsoid(0.3, 0.3, 0.28, [s * 1.08, 2.6, 0]));
    // hand + thumb
    parts.push(ellipsoid(0.1, 0.42, 0.18, [s * 1.54, -0.58, 0.06], [0, 0, s * 0.06]));
    parts.push(ellipsoid(0.05, 0.2, 0.06, [s * 1.43, -0.38, 0.2], [0.3, 0, s * -0.35]));
    parts.push(makeTube(legCurve(s), LEG_R, { seg: 56, radial: 18, round: 0.05 }));
    parts.push(ellipsoid(0.46, 0.46, 0.44, [s * 0.4, 0.02, -0.02]));
    // foot
    parts.push(ellipsoid(0.17, 0.12, 0.43, [s * 0.4, -4.36, 0.2]));
    parts.push(ellipsoid(0.15, 0.17, 0.16, [s * 0.38, -4.18, -0.06]));
  }
  skinCache = merge(parts);
  return skinCache;
}

// Face details (eyes, nose, ears, mouth, hair) — small separate meshes.
export const HAIR_COLOR = '#2a1b12';
export const SKIN_COLOR = '#e3b48f';

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

let skeletonCache: { bones: THREE.BufferGeometry; teeth: THREE.BufferGeometry } | null = null;

export function ribCurve(i: number, side: number): THREE.CatmullRomCurve3 | null {
  // i = 0..11
  const yb = 3.05 - i * 0.165;
  const t = torsoAt(yb - 0.2);
  const a = t.rx * 0.9;
  const b = t.rz * 0.9;
  const zc = t.cz;
  const drop = 0.5 - i * 0.012;
  const pts: THREE.Vector3[] = [];
  const front = i < 10 ? 0.16 : 0.9; // floating ribs stop early
  const n = 12;
  for (let k = 0; k <= n; k++) {
    const th = Math.PI - 0.12 - ((Math.PI - 0.12 - front) * k) / n; // posterior → anterior
    const u = (k / n) * 1;
    const x = side * Math.max(0.1, a * Math.sin(th));
    const z = Math.max(spineZ(yb) + 0.05, zc + b * Math.cos(th));
    pts.push(v3(x, yb - drop * u * (i < 10 ? 1 : 0.6), z));
  }
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal');
}

export function getSkeletonGeometry(): THREE.BufferGeometry {
  if (skeletonCache) return skeletonCache.bones;
  const parts: THREE.BufferGeometry[] = [];

  // skull
  parts.push(ellipsoid(0.42, 0.5, 0.5, [0, 4.0, -0.02], [0, 0, 0], 28, 20));
  parts.push(ellipsoid(0.3, 0.24, 0.32, [0, 3.62, 0.28]));
  // jaw
  parts.push(makeTube([v3(-0.34, 3.7, -0.02), v3(-0.3, 3.45, 0.1), v3(-0.14, 3.36, 0.32), v3(0, 3.33, 0.38), v3(0.14, 3.36, 0.32), v3(0.3, 3.45, 0.1), v3(0.34, 3.7, -0.02)], 0.045, { seg: 40, radial: 8 }));

  // vertebrae
  const ys: { y: number; r: number }[] = [];
  for (let i = 0; i < 7; i++) ys.push({ y: 3.45 - i * 0.15, r: 0.075 + i * 0.004 });
  for (let i = 0; i < 12; i++) ys.push({ y: 2.4 - i * 0.165, r: 0.105 + i * 0.003 });
  for (let i = 0; i < 5; i++) ys.push({ y: 0.4 - i * 0.2 + 0.2, r: 0.14 + i * 0.006 });
  ys.forEach((v, i) => {
    const z = spineZ(v.y);
    parts.push(xf(bare(new THREE.CylinderGeometry(v.r, v.r, 0.1, 14)), [0, v.y, z]));
    // spinous process (points back and down)
    parts.push(xf(bare(new THREE.ConeGeometry(0.03, 0.17, 6)), [0, v.y - 0.02, z - v.r - 0.06], [-Math.PI / 2 - 0.4, 0, 0]));
    // transverse processes
    if (i > 6 && i < 19) {
      parts.push(xf(bare(new THREE.CylinderGeometry(0.018, 0.018, v.r * 2 + 0.28, 6)), [0, v.y, z - v.r * 0.5], [0, 0, Math.PI / 2]));
    }
  });
  // sacrum + coccyx
  parts.push(ellipsoid(0.2, 0.34, 0.09, [0, -0.28 + 0.12, spineZ(-0.1) - 0.02], [0.35, 0, 0]));

  // ribs
  for (let i = 0; i < 12; i++) {
    for (const s of [-1, 1]) {
      const c = ribCurve(i, s);
      if (c) parts.push(makeTube(c, 0.03, { seg: 20, radial: 6, round: 0.08 }));
    }
  }
  // sternum
  const fz = (y: number) => torsoAt(y).cz + torsoAt(y).rz * 0.9 * Math.cos(0.15) + 0.0;
  parts.push(ellipsoid(0.13, 0.12, 0.035, [0, 2.88 - 0.12, fz(2.7)], [-0.1, 0, 0]));
  parts.push(ellipsoid(0.09, 0.42, 0.035, [0, 2.05, fz(2.05)], [-0.04, 0, 0]));
  parts.push(ellipsoid(0.04, 0.09, 0.03, [0, 1.58, fz(1.6)]));

  // clavicles + scapulae + arm bones + pelvis + legs (symmetrical)
  for (const s of [-1, 1]) {
    parts.push(makeTube([v3(s * 0.08, 2.8, 0.4), v3(s * 0.5, 2.9, 0.38), v3(s * 0.95, 2.78, 0.2)], 0.035, { seg: 18, radial: 6 }));
    parts.push(ellipsoid(0.3, 0.38, 0.045, [s * 0.68, 2.28, -0.4], [0.15, s * 0.5, s * 0.15]));
    const arm = armCurve(s);
    const sh = arm.getPointAt(0);
    const el = arm.getPointAt(0.5);
    const wr = arm.getPointAt(1);
    parts.push(makeTube([sh, el], 0.058, { seg: 10, radial: 8, round: 0.02 }));
    parts.push(ellipsoid(0.1, 0.1, 0.1, sh.toArray() as [number, number, number]));
    parts.push(ellipsoid(0.085, 0.07, 0.07, el.toArray() as [number, number, number]));
    parts.push(makeTube([el.clone().add(v3(s * -0.03, 0, 0.04)), wr.clone().add(v3(s * -0.02, 0, 0.03))], 0.035, { seg: 10, radial: 6 }));
    parts.push(makeTube([el.clone().add(v3(s * 0.03, 0, -0.03)), wr.clone().add(v3(s * 0.03, 0, -0.03))], 0.032, { seg: 10, radial: 6 }));
    // hand: metacarpals + fingers
    for (let f = 0; f < 5; f++) {
      const spread = (f - 2) * 0.045;
      const len = [0.5, 0.78, 0.86, 0.8, 0.62][f] * 0.95;
      const base = wr.clone().add(v3(0, -0.04, 0.05));
      parts.push(makeTube([base, base.clone().add(v3(s * (spread + 0.02 * s * 0), -len * 0.5, 0.01)), base.clone().add(v3(s * (spread * 1.4), -len, 0.02))], 0.016, { seg: 8, radial: 5 }));
    }
    // pelvis (ilium wing, ischium ring, pubis)
    parts.push(ellipsoid(0.36, 0.38, 0.1, [s * 0.56, 0.62, -0.02], [0, s * 0.55, s * 0.12], 20, 14));
    parts.push(makeTube([v3(s * 0.1, -0.18, 0.34), v3(s * 0.3, -0.26, 0.18), v3(s * 0.5, -0.2, 0.0), v3(s * 0.55, 0.15, -0.05)], 0.05, { seg: 20, radial: 6 }));
    // femur
    const leg = legCurve(s);
    const hipP = leg.getPointAt(0);
    parts.push(ellipsoid(0.13, 0.13, 0.13, [s * 0.3, 0.12, 0]));
    parts.push(makeTube([v3(s * 0.3, 0.12, 0), v3(s * 0.4, 0.02, 0), v3(s * 0.46, -0.1, 0)], 0.06, { seg: 8, radial: 6 }));
    parts.push(ellipsoid(0.1, 0.08, 0.1, [s * 0.54, 0.0, 0]));
    parts.push(makeTube([v3(s * 0.46, -0.1, 0), v3(s * 0.43, -1.0, 0.04), v3(s * 0.4, -1.95, 0.04)], 0.07, { seg: 24, radial: 8, round: 0.01 }));
    parts.push(ellipsoid(0.15, 0.12, 0.13, [s * 0.4, -2.0, 0.03]));
    parts.push(ellipsoid(0.07, 0.08, 0.04, [s * 0.4, -2.02, 0.19]));
    // tibia + fibula
    parts.push(makeTube([v3(s * 0.4, -2.1, 0.04), v3(s * 0.39, -3.1, 0.02), v3(s * 0.38, -4.05, 0)], 0.055, { seg: 24, radial: 8, round: 0.01 }));
    parts.push(makeTube([v3(s * 0.5, -2.2, 0.0), v3(s * 0.48, -3.1, -0.01), v3(s * 0.46, -4.05, -0.02)], 0.03, { seg: 20, radial: 6 }));
    // foot
    parts.push(ellipsoid(0.1, 0.05, 0.34, [s * 0.4, -4.3, 0.2]));
    parts.push(ellipsoid(0.08, 0.08, 0.1, [s * 0.38, -4.2, -0.08]));
    void hipP;
  }
  // pubic symphysis
  parts.push(ellipsoid(0.11, 0.05, 0.04, [0, -0.2, 0.36]));

  const bones = merge(parts);
  skeletonCache = { bones, teeth: new THREE.BufferGeometry() };
  return bones;
}

// ---------------------------------------------------------------------------
// Muscles
// ---------------------------------------------------------------------------

let muscleCache: THREE.BufferGeometry | null = null;
export function getMuscleGeometry(): THREE.BufferGeometry {
  if (muscleCache) return muscleCache;
  const parts: THREE.BufferGeometry[] = [];
  for (const s of [-1, 1]) {
    // pectorals, deltoids, lats
    parts.push(ellipsoid(0.46, 0.3, 0.1, [s * 0.43, 2.2, 0.43], [0, 0, s * -0.25]));
    parts.push(ellipsoid(0.22, 0.34, 0.22, [s * 1.1, 2.5, 0.02]));
    parts.push(ellipsoid(0.42, 0.75, 0.09, [s * 0.58, 1.55, -0.4], [0, 0, s * 0.12]));
    parts.push(ellipsoid(0.55, 0.35, 0.08, [s * 0.35, 2.75, -0.38], [0.1, 0, s * -0.3]));
    // obliques
    parts.push(ellipsoid(0.22, 0.52, 0.12, [s * 0.58, 0.95, 0.24], [0, 0, s * 0.05]));
    // abs (rectus abdominis, 3 rows of blocks)
    for (let r = 0; r < 4; r++) parts.push(ellipsoid(0.12, 0.1, 0.06, [s * 0.14, 1.45 - r * 0.22, 0.44 - r * 0.01]));
    // arm muscles
    const arm = armCurve(s);
    parts.push(makeTube(subCurve(arm, 0.08, 0.46, 10, v3(0, 0, 0.07)), profile([[0, 0.13], [0.45, 0.18], [1, 0.12]]), { seg: 16, radial: 12, round: 0.2 }));
    parts.push(makeTube(subCurve(arm, 0.08, 0.46, 10, v3(0, 0, -0.07)), profile([[0, 0.12], [0.5, 0.17], [1, 0.12]]), { seg: 16, radial: 12, round: 0.2 }));
    parts.push(makeTube(subCurve(arm, 0.52, 0.86, 10), profile([[0, 0.17], [0.3, 0.19], [1, 0.08]]), { seg: 16, radial: 12, round: 0.1 }));
    // glutes, thigh muscles, calves
    parts.push(ellipsoid(0.42, 0.42, 0.26, [s * 0.4, 0.1, -0.35]));
    const leg = legCurve(s);
    parts.push(makeTube(subCurve(leg, 0.05, 0.46, 10, v3(0, 0, 0.1)), profile([[0, 0.34], [0.4, 0.38], [1, 0.22]]), { seg: 20, radial: 14, round: 0.15 }));
    parts.push(makeTube(subCurve(leg, 0.05, 0.46, 10, v3(0, 0, -0.1)), profile([[0, 0.3], [0.4, 0.32], [1, 0.2]]), { seg: 20, radial: 14, round: 0.15 }));
    parts.push(makeTube(subCurve(leg, 0.52, 0.8, 10, v3(0, 0, -0.05)), profile([[0, 0.2], [0.3, 0.26], [1, 0.1]]), { seg: 16, radial: 12, round: 0.15 }));
    parts.push(makeTube(subCurve(leg, 0.52, 0.8, 10, v3(0, 0, 0.07)), profile([[0, 0.15], [0.3, 0.17], [1, 0.08]]), { seg: 16, radial: 12, round: 0.15 }));
  }
  // neck muscles
  parts.push(makeTube([v3(0, 3.0, 0), v3(0, 3.45, 0.02)], 0.2, { round: 0.1 }));
  muscleCache = merge(parts);
  return muscleCache;
}

// ---------------------------------------------------------------------------
// Blood vessels & nerves (each returns arteries/veins or nerves as merged geometry)
// ---------------------------------------------------------------------------

let vesselCache: { arteries: THREE.BufferGeometry; veins: THREE.BufferGeometry } | null = null;
export function getVesselGeometry() {
  if (vesselCache) return vesselCache;
  const A: THREE.BufferGeometry[] = [];
  const Vn: THREE.BufferGeometry[] = [];

  // aorta: arch + descending
  A.push(
    makeTube(
      curveOf([
        [0.1, 2.1, 0.1],
        [0.1, 2.5, 0.06],
        [0.28, 2.72, -0.06],
        [0.42, 2.55, -0.22],
        [0.4, 2.0, -0.3],
        [0.34, 1.0, -0.28],
        [0.25, 0.3, -0.24],
      ]),
      profile([[0, 0.1], [0.5, 0.085], [1, 0.06]]),
      { seg: 60, radial: 10 },
    ),
  );
  // vena cava (SVC + IVC)
  Vn.push(makeTube(curveOf([[-0.12, 1.85, 0.08], [-0.14, 2.4, 0.04], [-0.12, 2.9, 0.0]]), 0.07, { seg: 16, radial: 8 }));
  Vn.push(makeTube(curveOf([[-0.14, 1.75, -0.05], [-0.18, 1.0, -0.2], [-0.2, 0.3, -0.22]]), 0.08, { seg: 24, radial: 8 }));
  // neck / head
  for (const s of [-1, 1]) {
    const x = s * 0.15;
    A.push(makeTube(curveOf([[s * 0.15 + (s > 0 ? -0.05 : 0.0), 2.7, 0.05], [x, 3.2, 0.08], [x, 3.6, 0.16], [s * 0.2, 3.95, 0.3]]), 0.04, { seg: 24, radial: 8 }));
    Vn.push(makeTube(curveOf([[x * 1.6, 2.8, 0.1], [x * 1.8, 3.2, 0.14], [x * 1.7, 3.6, 0.2], [s * 0.3, 3.9, 0.3]]), 0.05, { seg: 24, radial: 8 }));
    // arms
    const arm = armCurve(s);
    A.push(makeTube(subCurve(arm, 0.0, 1.0, 14, v3(-s * 0.1, 0, 0.06)), profile([[0, 0.05], [1, 0.025]]), { seg: 36, radial: 8 }));
    Vn.push(makeTube(subCurve(arm, 0.0, 1.0, 14, v3(s * 0.1, 0, 0.1)), profile([[0, 0.055], [1, 0.03]]), { seg: 36, radial: 8 }));
    // hand
    for (const f of [-1, 0, 1]) {
      const w = arm.getPointAt(1);
      A.push(makeTube([w.clone().add(v3(-s * 0.02, 0, 0.1)), w.clone().add(v3(s * f * 0.05, -0.5, 0.12)), w.clone().add(v3(s * f * 0.08, -0.85, 0.12))], 0.014, { seg: 8, radial: 5 }));
    }
    // legs
    const leg = legCurve(s);
    A.push(makeTube(subCurve(leg, 0.0, 1.0, 14, v3(-s * 0.1, 0, 0.12)), profile([[0, 0.055], [0.5, 0.04], [1, 0.025]]), { seg: 48, radial: 8 }));
    Vn.push(makeTube(subCurve(leg, 0.0, 1.0, 14, v3(s * 0.12, 0, -0.1)), profile([[0, 0.065], [0.5, 0.05], [1, 0.03]]), { seg: 48, radial: 8 }));
    // iliac branches
    A.push(makeTube(curveOf([[0.2, 0.25, -0.22], [s * 0.3 + 0.1, 0.0, -0.1], [s * 0.3, 0.05, 0.12]]), 0.05, { seg: 12, radial: 8 }));
    Vn.push(makeTube(curveOf([[-0.2, 0.25, -0.24], [s * 0.3 - 0.1, 0.0, -0.12], [s * 0.5, 0.0, -0.1]]), 0.06, { seg: 12, radial: 8 }));
    // subclavian / brachiocephalic
    A.push(makeTube(curveOf([[0.2, 2.7, 0.0], [s * 0.55, 2.8, 0.1], [s * 1.0, 2.62, 0.06]]), 0.045, { seg: 16, radial: 8 }));
    Vn.push(makeTube(curveOf([[-0.1, 2.85, 0.05], [s * 0.55, 2.84, 0.14], [s * 1.0, 2.62, 0.1]]), 0.05, { seg: 16, radial: 8 }));
  }
  // renal & mesenteric branches
  for (const s of [-1, 1]) {
    A.push(makeTube(curveOf([[0.3, 1.1, -0.28], [s * 0.2 + 0.1, 1.1, -0.3], [s * 0.45, 1.1, -0.3]]), 0.025, { seg: 10, radial: 6 }));
    Vn.push(makeTube(curveOf([[-0.18, 1.0, -0.2], [s * 0.2, 1.05, -0.28], [s * 0.45, 1.1, -0.3]]), 0.03, { seg: 10, radial: 6 }));
  }
  vesselCache = { arteries: merge(A), veins: merge(Vn) };
  return vesselCache;
}

let nerveCache: THREE.BufferGeometry | null = null;
export function getNerveGeometry(): THREE.BufferGeometry {
  if (nerveCache) return nerveCache;
  const parts: THREE.BufferGeometry[] = [];
  // spinal cord
  const cord: [number, number, number][] = [];
  for (let y = 3.7; y >= 0.6; y -= 0.3) cord.push([0, y, spineZ(y) - 0.12]);
  parts.push(makeTube(curveOf(cord), 0.05, { seg: 40, radial: 10 }));
  // cauda equina
  for (let k = -2; k <= 2; k++) {
    parts.push(makeTube(curveOf([[0, 0.7, spineZ(0.7)], [k * 0.03, 0.2, spineZ(0.2)], [k * 0.04, -0.2, spineZ(-0.2)]]), 0.012, { seg: 10, radial: 5 }));
  }
  for (const s of [-1, 1]) {
    // brachial plexus + arm nerves
    const arm = armCurve(s);
    for (let k = 0; k < 3; k++) {
      const off = v3(-s * 0.04 * k, 0, -0.06 - 0.02 * k);
      const pts = [v3(s * 0.05, 2.95 - k * 0.1, spineZ(2.9)), v3(s * 0.55, 2.8 - k * 0.04, 0.0), arm.getPointAt(0.08).add(off), arm.getPointAt(0.5).add(off), arm.getPointAt(1).add(off)];
      parts.push(makeTube(pts, 0.017, { seg: 40, radial: 6 }));
    }
    // sciatic / femoral
    const leg = legCurve(s);
    parts.push(makeTube([v3(0, 0.3, spineZ(0.3)), v3(s * 0.3, 0.0, -0.3), ...[0.1, 0.3, 0.5, 0.75, 1].map((t) => leg.getPointAt(t).add(v3(0, 0, -0.12)))], 0.026, { seg: 60, radial: 6 }));
    parts.push(makeTube([v3(s * 0.05, 0.6, spineZ(0.6)), v3(s * 0.25, 0.4, 0.1), ...[0.05, 0.25, 0.45].map((t) => leg.getPointAt(t).add(v3(-s * 0.02, 0, 0.14)))], 0.02, { seg: 40, radial: 6 }));
    // vagus
    parts.push(makeTube(curveOf([[s * 0.2, 3.7, 0.15], [s * 0.14, 3.2, 0.1], [s * 0.1, 2.5, 0.06], [s * 0.06, 1.7, 0.0]]), 0.012, { seg: 30, radial: 5 }));
    // intercostal nerves
    for (let i = 1; i < 10; i += 1) {
      const c = ribCurve(i, s);
      if (c) parts.push(makeTube(subCurve(c, 0.0, 0.8, 10, v3(0, -0.04, 0)), 0.008, { seg: 16, radial: 4, round: 0.1 }));
    }
    // optic nerve
    parts.push(makeTube(curveOf([[s * 0.17, 3.84, 0.4], [s * 0.1, 3.84, 0.15], [0, 3.78, 0.08]]), 0.012, { seg: 8, radial: 5 }));
  }
  nerveCache = merge(parts);
  return nerveCache;
}

// ---------------------------------------------------------------------------
// Organs (body scale)
// ---------------------------------------------------------------------------

export interface LobeInfo {
  id: string;
  name: string;
}

// Lung geometry; `side` = -1 for the right lung (appears on the viewer's left), +1 for the left lung.
export function makeLungGeometry(side: -1 | 1, rxBase = 0.42): THREE.BufferGeometry {
  const base = bare(new THREE.SphereGeometry(1, 56, 40));
  base.deleteAttribute('normal');
  const g = mergeVertices(base, 1e-4);
  const p = g.getAttribute('position') as THREE.BufferAttribute;
  const colors = new Float32Array(p.count * 3);
  const rx = side === -1 ? rxBase : rxBase * 0.9;
  const ry = 0.85;
  const rz = 0.4;
  const col = new THREE.Color();
  const upper = new THREE.Color('#ee9a8b');
  const middle = new THREE.Color('#e5877f');
  const lower = new THREE.Color('#f3b3a2');
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const f = y > 0 ? 1 - 0.62 * y * y : 1;
    let px = x * rx * f;
    let pz = z * rz * f;
    let py = y * ry;
    const med = -side * x; // >0 on the side facing the midline
    px *= 1 - 0.42 * smoothstep(0, 0.7, med);
    py += 0.26 * smoothstep(-0.35, -1, y) * (1 - Math.min(1, x * x + z * z));
    if (side === 1) {
      const d = Math.exp(-(((y + 0.35) / 0.42) ** 2)) * Math.exp(-(((z - 0.7) / 0.5) ** 2)) * smoothstep(0.05, 0.6, med);
      px += side * 0.45 * d * rx;
      pz -= 0.18 * d;
    }
    p.setXYZ(i, px, py, pz);
    // lobes
    const dLower = y + 0.5 * z + 0.15;
    let lobe: THREE.Color;
    let dark = 1;
    if (dLower < 0) lobe = lower;
    else if (side === -1 && y < 0.22 && z > 0) {
      lobe = middle;
      dark = Math.min(dark, 1 - 0.32 * (1 - smoothstep(0, 0.05, Math.abs(y - 0.22))));
    } else lobe = upper;
    dark = Math.min(dark, 1 - 0.34 * (1 - smoothstep(0, 0.06, Math.abs(dLower))));
    // mottled surface
    const n = 0.94 + 0.06 * Math.sin(x * 18 + z * 11) * Math.sin(y * 15 - z * 9);
    col.copy(lobe).multiplyScalar(dark * n);
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}

export function makeBronchialTree(): THREE.BufferGeometry {
  const rand = rng(7);
  const parts: THREE.BufferGeometry[] = [];
  // trachea
  parts.push(makeTube(curveOf([[0, 3.35, 0.1], [0, 2.9, 0.07], [0, 2.4, 0.02]]), 0.085, { seg: 16, radial: 12, round: 0.01 }));
  const lungC = [v3(-0.47, 2.05, -0.02), v3(0.47, 2.05, -0.02)];
  const lungR = [v3(0.4, 0.8, 0.36), v3(0.36, 0.8, 0.34)];
  const inside = (p: THREE.Vector3) => {
    return lungC.some((c, i) => ((p.x - c.x) / lungR[i].x) ** 2 + ((p.y - c.y) / lungR[i].y) ** 2 + ((p.z - c.z) / lungR[i].z) ** 2 < 0.8);
  };
  const branch = (start: THREE.Vector3, dir: THREE.Vector3, len: number, r: number, depth: number) => {
    const end = start.clone().addScaledVector(dir, len);
    if (depth > 0 && !inside(end)) return;
    const mid = start.clone().lerp(end, 0.5).add(v3((rand() - 0.5) * 0.04, (rand() - 0.5) * 0.04, (rand() - 0.5) * 0.04));
    parts.push(makeTube([start, mid, end], r, { seg: 5, radial: 6, round: 0.15 }));
    if (r < 0.009) return;
    for (let k = 0; k < 2; k++) {
      const axis = v3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize();
      const nd = dir.clone().applyAxisAngle(axis, (k === 0 ? 1 : -1) * (0.45 + rand() * 0.35));
      nd.y -= 0.1;
      nd.normalize();
      branch(end, nd, len * 0.78, r * 0.74, depth + 1);
    }
  };
  // main bronchi
  for (const s of [-1, 1]) {
    const d = v3(s * 0.55, -0.7, 0.0).normalize();
    const carina = v3(0, 2.4, 0.02);
    const e = carina.clone().addScaledVector(d, 0.45);
    parts.push(makeTube([carina, carina.clone().lerp(e, 0.5), e], 0.062, { seg: 6, radial: 10, round: 0.1 }));
    for (let k = 0; k < 3; k++) {
      const nd = d.clone().applyAxisAngle(v3(0, 0, 1), s * (0.15 + k * 0.55)).applyAxisAngle(v3(1, 0, 0), (k - 1) * 0.4);
      nd.y = nd.y * (k === 0 ? -0.2 : 1);
      branch(e, nd.normalize(), 0.42, 0.04, 1);
    }
  }
  return merge(parts);
}

export function makeKidneyGeometry(side: -1 | 1): THREE.BufferGeometry {
  const base = bare(new THREE.SphereGeometry(1, 32, 24));
  base.deleteAttribute('normal');
  const g = mergeVertices(base, 1e-4);
  const p = g.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const med = -side * x;
    if (med > 0) x += side * 0.55 * Math.exp(-((y / 0.45) ** 2)) * med * 1.1;
    p.setXYZ(i, x * 0.17, y * 0.33, z * 0.14);
  }
  g.computeVertexNormals();
  return g;
}

export function makeLiverGeometry(): THREE.BufferGeometry {
  const base = bare(new THREE.SphereGeometry(1, 40, 28));
  base.deleteAttribute('normal');
  const g = mergeVertices(base, 1e-4);
  const p = g.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    let y = p.getY(i);
    let z = p.getZ(i);
    // wedge: thin on the left lobe side (x > 0 means toward the body's left)
    const thin = 1 - 0.65 * smoothstep(0.1, 1, x);
    if (y < 0) y *= 0.55;
    z *= 0.9 * (1 - 0.3 * smoothstep(0.3, 1, x));
    p.setXYZ(i, x * 0.98, y * 0.4 * thin, z * 0.5);
  }
  g.computeVertexNormals();
  return g;
}

export function makeStomachCurve(): THREE.CatmullRomCurve3 {
  return curveOf([
    [0.22, 1.62, 0.04],
    [0.5, 1.5, 0.1],
    [0.62, 1.2, 0.13],
    [0.45, 0.88, 0.15],
    [0.15, 0.8, 0.15],
    [-0.12, 0.9, 0.12],
  ]);
}

export function makeStomachGeometry(): THREE.BufferGeometry {
  const curve = makeStomachCurve();
  const tube = makeTube(curve, profile([[0, 0.1], [0.15, 0.24], [0.4, 0.33], [0.7, 0.26], [0.9, 0.13], [1, 0.1]]), { seg: 48, radial: 20, round: 0.06 });
  const fundus = ellipsoid(0.26, 0.24, 0.22, [0.45, 1.6, 0.06]);
  return merge([tube, fundus]);
}

export function makeSmallIntestineCurve(): THREE.CatmullRomCurve3 {
  const pts: THREE.Vector3[] = [
    v3(-0.12, 0.9, 0.12), // pylorus
    v3(-0.3, 0.82, 0.05),
    v3(-0.3, 0.6, 0.02), // duodenum C-loop
    v3(-0.1, 0.55, 0.05),
  ];
  const rows = 6;
  for (let r = 0; r < rows; r++) {
    const y = 0.5 - r * 0.13;
    const dir = r % 2 === 0 ? 1 : -1;
    for (let k = 0; k <= 5; k++) {
      const x = dir * (-0.5 + (k / 5) * 1.0);
      pts.push(v3(x, y + Math.sin(k * 1.7 + r) * 0.035, 0.18 + Math.sin(k * 1.3 + r * 2) * 0.05));
    }
  }
  pts.push(v3(-0.4, -0.2, 0.2), v3(-0.58, 0.0, 0.2)); // ileocecal junction
  return new THREE.CatmullRomCurve3(pts, false, 'centripetal');
}

export function makeLargeIntestineCurve(): THREE.CatmullRomCurve3 {
  return curveOf([
    [-0.6, -0.05, 0.2],
    [-0.64, 0.3, 0.2],
    [-0.64, 0.75, 0.18],
    [-0.5, 0.95, 0.22],
    [-0.25, 0.86, 0.3],
    [0.0, 0.76, 0.32],
    [0.3, 0.86, 0.28],
    [0.58, 1.0, 0.15],
    [0.68, 0.7, 0.1],
    [0.66, 0.3, 0.1],
    [0.6, 0.0, 0.1],
    [0.45, -0.18, 0.15],
    [0.25, -0.12, 0.2],
    [0.12, -0.28, 0.1],
    [0.0, -0.42, -0.05],
  ]);
}

export function makeEsophagusCurve(): THREE.CatmullRomCurve3 {
  return curveOf([
    [0, 3.62, 0.3],
    [0, 3.5, 0.12],
    [0, 3.2, 0.0],
    [0, 2.6, -0.1],
    [0.02, 2.0, -0.12],
    [0.1, 1.72, -0.03],
    [0.22, 1.62, 0.04],
  ]);
}

export function makePancreasGeometry(): THREE.BufferGeometry {
  return makeTube(curveOf([[-0.35, 0.85, 0.02], [-0.1, 0.96, -0.02], [0.3, 1.03, -0.08], [0.7, 1.2, -0.15]]), profile([[0, 0.12], [0.3, 0.085], [1, 0.055]]), { seg: 24, radial: 12, round: 0.1 });
}

export function makeThyroidGeometry(): THREE.BufferGeometry {
  return merge([ellipsoid(0.065, 0.15, 0.06, [-0.09, 3.1, 0.15]), ellipsoid(0.065, 0.15, 0.06, [0.09, 3.1, 0.15]), ellipsoid(0.06, 0.03, 0.04, [0, 3.04, 0.17])]);
}

// ---------------------------------------------------------------------------
// Brain
// ---------------------------------------------------------------------------

export type LobeId = 'frontal' | 'parietal' | 'temporal' | 'occipital' | 'cerebellum' | 'brainstem';

// Classify a point in brain-local coordinates (z+ = front, y+ = up).
export function lobeAt(x: number, y: number, z: number): LobeId {
  const u = z / 0.82;
  const v = y / 0.52;
  const ax = Math.abs(x);
  if (v < -0.12 - 0.18 * u && u > -0.6 && u < 0.7 && ax > 0.16) return 'temporal';
  if (u > 0.12 + 0.18 * (v - 0.5)) return 'frontal';
  if (u < -0.5) return 'occipital';
  return 'parietal';
}

export const LOBE_COLORS: Record<LobeId, string> = {
  frontal: '#ef476f',
  parietal: '#ffd166',
  temporal: '#06d6a0',
  occipital: '#118ab2',
  cerebellum: '#9d4edd',
  brainstem: '#8d8d99',
};

export function makeCerebrumGeometry(): { geometry: THREE.BufferGeometry; lobes: LobeId[]; shade: Float32Array } {
  const base = bare(new THREE.SphereGeometry(1, 96, 64));
  base.deleteAttribute('normal');
  const g = mergeVertices(base, 1e-4);
  const p = g.getAttribute('position') as THREE.BufferAttribute;
  const lobes: LobeId[] = [];
  const shade = new Float32Array(p.count);
  const n3 = (x: number, y: number, z: number) =>
    Math.sin(x * 14 + Math.sin(y * 9)) * Math.sin(y * 13 + Math.sin(z * 8)) * Math.sin(z * 12 + Math.sin(x * 7)) +
    0.5 * Math.sin(x * 26 + y * 5) * Math.sin(z * 24 - y * 9);
  for (let i = 0; i < p.count; i++) {
    const ux = p.getX(i);
    const uy = p.getY(i);
    const uz = p.getZ(i);
    let x = ux * 0.62;
    let y = uy * 0.58;
    let z = uz * 0.82;
    // flatter base, fuller top
    if (uy < 0) y *= 0.7;
    // temporal bulge
    const tb = Math.exp(-(((uy + 0.45) / 0.3) ** 2)) * Math.exp(-(((uz - 0.1) / 0.5) ** 2));
    x *= 1 + 0.12 * tb;
    // occipital / frontal poles
    if (uz < -0.4) y *= 0.92;
    // sulci / gyri
    const n = n3(ux, uy, uz);
    const disp = 1 + 0.04 * n;
    x *= disp;
    y *= disp;
    z *= disp;
    // longitudinal fissure
    const fiss = Math.exp(-((ux / 0.05) ** 2)) * smoothstep(0.1, 0.6, uy);
    y -= 0.1 * fiss;
    p.setXYZ(i, x, y, z);
    lobes.push(lobeAt(x, y, z));
    shade[i] = 0.78 + 0.22 * (0.5 + 0.5 * n) - 0.3 * fiss;
  }
  g.computeVertexNormals();
  return { geometry: g, lobes, shade };
}

export function makeCerebellumGeometry(): THREE.BufferGeometry {
  const base = bare(new THREE.SphereGeometry(1, 48, 32));
  base.deleteAttribute('normal');
  const g = mergeVertices(base, 1e-4);
  const p = g.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const ridge = 1 + 0.045 * Math.sin(y * 34);
    p.setXYZ(i, x * 0.4 * ridge, y * 0.2 * ridge, z * 0.3 * ridge);
  }
  g.computeVertexNormals();
  return g;
}
