import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { LABEL_FONT, Safe } from './Safe';
import { dotTexture } from './dotTexture';
import { curveOf, makeBronchialTree, makeLungGeometry, makeTube, merge, rng, v3 } from './anatomy';

// Shared, mutable breathing state (0 = fully out, 1 = fully in) so the HTML panel
// can draw a live volume bar without re-rendering React every frame.
export const lungSim = { volume: 0 };

interface LungsModelProps {
  rate: number; // breaths per minute
  animate?: boolean;
  opacity?: number;
  bronchi?: boolean;
  diaphragm?: boolean;
  labels?: boolean;
  tint?: string;
  selected?: string | null;
  onSelect?: (id: string | null) => void;
}

export function LungsModel({ rate, animate = true, opacity = 1, bronchi = true, diaphragm = false, labels = false, tint = '#ffffff', selected = null, onSelect }: LungsModelProps) {
  const left = useRef<THREE.Mesh>(null);
  const right = useRef<THREE.Mesh>(null);
  const dia = useRef<THREE.Mesh>(null);
  const phase = useRef(0);
  const rateRef = useRef(rate);
  rateRef.current = rate;
  const gL = useMemo(() => makeLungGeometry(1), []);
  const gR = useMemo(() => makeLungGeometry(-1), []);
  const tree = useMemo(() => makeBronchialTree(), []);

  useFrame((_, dt) => {
    if (animate) phase.current = (phase.current + (dt * rateRef.current) / 60) % 1;
    // smooth inhale (45%) / exhale (55%)
    const p = phase.current;
    const v = p < 0.45 ? 0.5 - 0.5 * Math.cos((p / 0.45) * Math.PI) : 0.5 + 0.5 * Math.cos(((p - 0.45) / 0.55) * Math.PI);
    lungSim.volume = v;
    const s = animate ? v : 0.35;
    if (left.current) left.current.scale.set(1 + 0.07 * s, 1 + 0.09 * s, 1 + 0.1 * s);
    if (right.current) right.current.scale.set(1 + 0.07 * s, 1 + 0.09 * s, 1 + 0.1 * s);
    if (dia.current) {
      dia.current.position.y = 1.3 - 0.17 * s;
      dia.current.scale.set(0.98, 0.34 - 0.14 * s, 0.56);
    }
  });

  const transparent = opacity < 1;
  const events = (id: string) =>
    onSelect
      ? {
          onClick: (e: { stopPropagation: () => void }) => {
            e.stopPropagation();
            onSelect(selected === id ? null : id);
          },
          onPointerOver: (e: { stopPropagation: () => void }) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          },
          onPointerOut: () => {
            document.body.style.cursor = 'auto';
          },
        }
      : {};
  const lungMat = (id: string) => (
    <meshPhysicalMaterial
      vertexColors
      color={tint}
      roughness={0.55}
      clearcoat={0.25}
      transparent={transparent}
      opacity={opacity}
      depthWrite={!transparent}
      emissive={selected === id ? '#ff8a70' : '#000000'}
      emissiveIntensity={selected === id ? 0.35 : 0}
      side={transparent ? THREE.DoubleSide : THREE.FrontSide}
    />
  );

  return (
    <group>
      <mesh ref={right} geometry={gR} position={[-0.47, 2.05, -0.02]} renderOrder={2} {...events('right_lung')}>
        {lungMat('right_lung')}
      </mesh>
      <mesh ref={left} geometry={gL} position={[0.47, 2.05, -0.02]} renderOrder={2} {...events('left_lung')}>
        {lungMat('left_lung')}
      </mesh>
      {bronchi && (
        <mesh geometry={tree} {...events('trachea')}>
          <meshStandardMaterial color={selected === 'trachea' ? '#fff3df' : tint === '#ffffff' ? '#e9d8c6' : tint} roughness={0.5} emissive={selected === 'trachea' ? '#ffd9a0' : '#000000'} emissiveIntensity={0.3} />
        </mesh>
      )}
      {bronchi && <TracheaRings />}
      {diaphragm && (
        <mesh ref={dia} position={[0, 1.3, -0.02]} scale={[0.98, 0.34, 0.56]}>
          <sphereGeometry args={[1, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#a8453f" roughness={0.7} side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}
      {labels && (
        <>
          <Label pos={[-1.35, 2.6, 0.2]} text="Right lung (3 lobes)" color="#ffcab8" />
          <Label pos={[1.35, 2.6, 0.2]} text="Left lung (2 lobes)" color="#ffcab8" />
          <Label pos={[0.55, 3.2, 0.1]} text="Trachea" color="#fff0dc" />
          <Label pos={[0.0, 1.5, 0.4]} text="Bronchi" color="#fff0dc" />
          {diaphragm && <Label pos={[0, 0.85, 0.4]} text="Diaphragm" color="#ff9d94" />}
        </>
      )}
    </group>
  );
}

function Label({ pos, text, color }: { pos: [number, number, number]; text: string; color: string }) {
  return (
    <Safe><Billboard position={pos}><Text font={LABEL_FONT} fontSize={0.13} color={color} anchorX="center" anchorY="middle" outlineWidth={0.012} outlineColor="#000000">
        {text}
      </Text></Billboard></Safe>
  );
}

// cartilage rings on the trachea
function TracheaRings() {
  const g = useMemo(() => {
    const parts: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 12; i++) {
      const y = 3.3 - i * 0.075;
      const t = new THREE.TorusGeometry(0.095, 0.014, 6, 20);
      t.deleteAttribute('uv');
      t.rotateX(Math.PI / 2);
      t.translate(0, y, 0.1 - (3.3 - y) * 0.08);
      parts.push(t);
    }
    return merge(parts);
  }, []);
  return (
    <mesh geometry={g}>
      <meshStandardMaterial color="#f6ead9" roughness={0.45} />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Alveoli close-up: a cluster of air sacs on a bronchiole, wrapped in capillaries.
// ---------------------------------------------------------------------------

const SAC_R = 0.55;
const SAC_CENTERS: THREE.Vector3[] = (() => {
  const r = rng(11);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    pts.push(v3(Math.cos(a) * 0.9, 0.0 + (r() - 0.5) * 0.35, Math.sin(a) * 0.9));
  }
  pts.push(v3(0, 0.75, 0));
  pts.push(v3(0.1, -0.7, 0.05));
  return pts;
})();

interface AlveoliProps {
  labels?: boolean;
}

export function AlveoliModel({ labels = true }: AlveoliProps) {
  const geo = useMemo(() => {
    const duct: THREE.BufferGeometry[] = [makeTube(curveOf([[0, 2.6, 0], [0, 1.8, 0], [0, 0.9, 0]]), 0.17, { seg: 16, radial: 14, round: 0.01 })];
    const caps: THREE.BufferGeometry[] = [];
    SAC_CENTERS.forEach((c, i) => {
      duct.push(makeTube([v3(0, 0.95, 0), c.clone().multiplyScalar(0.5).add(v3(0, 0.45, 0)), c], 0.07, { seg: 10, radial: 8 }));
      // capillary helix wrapped around the sac
      const pts: THREE.Vector3[] = [];
      const tilt = i * 0.9;
      for (let k = 0; k <= 60; k++) {
        const t = k / 60;
        const phi = 0.18 * Math.PI + t * 0.64 * Math.PI;
        const th = t * Math.PI * 5 + tilt;
        const R = SAC_R * 1.06;
        pts.push(v3(c.x + R * Math.sin(phi) * Math.cos(th), c.y + R * Math.cos(phi), c.z + R * Math.sin(phi) * Math.sin(th)));
      }
      caps.push(makeTube(pts, 0.03, { seg: 80, radial: 6, round: 0.02 }));
    });
    const artery = makeTube(curveOf([[-0.9, -2.8, 0], [-0.85, -1.8, 0.1], [-0.6, -0.9, 0.3]]), 0.12, { seg: 12, radial: 10, round: 0.01 });
    const vein = makeTube(curveOf([[0.9, -2.8, 0], [0.85, -1.8, -0.1], [0.6, -0.9, -0.3]]), 0.12, { seg: 12, radial: 10, round: 0.01 });
    return { duct: merge(duct), caps: merge(caps), artery, vein };
  }, []);

  // O2 / CO2 particles
  const N = 90;
  const state = useMemo(() => {
    const r = rng(3);
    return {
      phase: Float32Array.from({ length: N }, (_, i) => i / N),
      sac: Int32Array.from({ length: N }, () => Math.floor(r() * SAC_CENTERS.length)),
      dir: Float32Array.from({ length: N }, (_, i) => dirAt(i)),
      jit: Float32Array.from({ length: N * 3 }, () => (r() - 0.5) * 0.12),
      pos: new Float32Array(N * 3),
      col: Float32Array.from({ length: N * 3 }, (_, i) => {
        const o2 = dirAt(Math.floor(i / 3)) === 0;
        const c = i % 3;
        return o2 ? [0.3, 1.0, 0.4][c] : [1.0, 0.8, 0.15][c];
      }),
    };
  }, []);
  const geoRef = useRef<THREE.BufferGeometry>(null);
  useFrame((_, dt) => {
    const g = geoRef.current;
    if (!g) return;
    const pos = g.getAttribute('position') as THREE.BufferAttribute;
    const top = v3(0, 2.6, 0);
    const junction = v3(0, 0.9, 0);
    const bottomVein = v3(0.6, -0.9, -0.3);
    const bottomArt = v3(-0.6, -0.9, 0.3);
    const p = new THREE.Vector3();
    for (let i = 0; i < N; i++) {
      state.phase[i] = (state.phase[i] + dt * 0.12) % 1;
      const u = state.phase[i];
      const c = SAC_CENTERS[state.sac[i]];
      const out = c.clone().sub(v3(0, 0.1, 0)).normalize();
      const wall = c.clone().addScaledVector(out, SAC_R);
      if (state.dir[i] === 0) {
        // O2: airway → sac → wall → vein
        if (u < 0.25) p.lerpVectors(top, junction, u / 0.25);
        else if (u < 0.5) p.lerpVectors(junction, c, (u - 0.25) / 0.25);
        else if (u < 0.65) p.lerpVectors(c, wall, (u - 0.5) / 0.15);
        else p.lerpVectors(wall, bottomVein, (u - 0.65) / 0.35);
      } else {
        // CO2: artery → wall → sac → airway
        if (u < 0.35) p.lerpVectors(bottomArt, wall, u / 0.35);
        else if (u < 0.5) p.lerpVectors(wall, c, (u - 0.35) / 0.15);
        else if (u < 0.75) p.lerpVectors(c, junction, (u - 0.5) / 0.25);
        else p.lerpVectors(junction, top, (u - 0.75) / 0.25);
      }
      pos.setXYZ(i, p.x + state.jit[i * 3], p.y + state.jit[i * 3 + 1], p.z + state.jit[i * 3 + 2]);
    }
    pos.needsUpdate = true;
  });

  return (
    <group>
      <mesh geometry={geo.duct}>
        <meshStandardMaterial color="#e9c9a8" roughness={0.5} transparent opacity={0.75} />
      </mesh>
      {SAC_CENTERS.map((c, i) => (
        <mesh key={i} position={c} renderOrder={1}>
          <sphereGeometry args={[SAC_R, 36, 26]} />
          <meshPhysicalMaterial color="#f4a79a" roughness={0.35} transparent opacity={0.3} depthWrite={false} clearcoat={0.6} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh geometry={geo.caps}>
        <meshStandardMaterial color="#d6403a" roughness={0.4} emissive="#7a1410" emissiveIntensity={0.4} />
      </mesh>
      <mesh geometry={geo.artery}>
        <meshStandardMaterial color="#4a6fc9" roughness={0.45} />
      </mesh>
      <mesh geometry={geo.vein}>
        <meshStandardMaterial color="#d9483b" roughness={0.45} />
      </mesh>
      <points frustumCulled={false}>
        <bufferGeometry ref={geoRef}>
          <bufferAttribute attach="attributes-position" args={[state.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[state.col, 3]} />
        </bufferGeometry>
        <pointsMaterial map={dotTexture()} size={0.2} sizeAttenuation vertexColors transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      {labels && (
        <>
          <Label pos={[0.7, 2.5, 0]} text="Bronchiole (air in / out)" color="#ffe3c0" />
          <Label pos={[1.55, 0.7, 0.8]} text="Alveoli (air sacs)" color="#ffd0c6" />
          <Label pos={[-1.7, -2.2, 0.3]} text="Blood from the body (low O₂)" color="#9db8ff" />
          <Label pos={[1.7, -2.2, -0.3]} text="Blood to the heart (high O₂)" color="#ff9a90" />
          <Label pos={[0.0, 1.5, 0.9]} text="Capillaries" color="#ff8f86" />
        </>
      )}
    </group>
  );
}

function dirAt(i: number): number {
  return i % 2;
}
