import { useEffect, useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { LABEL_FONT, Safe } from './Safe';
import {
  LOBE_COLORS,
  curveOf,
  lobeAt,
  makeCerebellumGeometry,
  makeCerebrumGeometry,
  makeTube,
  merge,
  profile,
  rng,
  v3,
  type LobeId,
} from './anatomy';

interface BrainModelProps {
  selectedLobe?: string | null;
  onSelectLobe?: (id: string | null) => void;
  colorByLobe?: boolean;
  labels?: boolean;
  interactive?: boolean;
  tint?: string;
}

const LOBE_LABELS: { id: LobeId; text: string; pos: [number, number, number] }[] = [
  { id: 'frontal', text: 'Frontal', pos: [0.8, 0.32, 0.6] },
  { id: 'parietal', text: 'Parietal', pos: [0.8, 0.58, -0.1] },
  { id: 'temporal', text: 'Temporal', pos: [0.82, -0.24, 0.22] },
  { id: 'occipital', text: 'Occipital', pos: [0.72, 0.2, -0.78] },
  { id: 'cerebellum', text: 'Cerebellum', pos: [0.5, -0.52, -0.78] },
  { id: 'brainstem', text: 'Brainstem', pos: [0.25, -0.82, -0.3] },
];

export function BrainModel({ selectedLobe = null, onSelectLobe, colorByLobe = true, labels = false, interactive = false, tint = '#ffffff' }: BrainModelProps) {
  const cerebrum = useMemo(() => makeCerebrumGeometry(), []);
  const cerebellum = useMemo(() => makeCerebellumGeometry(), []);
  const stem = useMemo(
    () => makeTube(curveOf([[0, -0.15, -0.05], [0, -0.45, -0.22], [0, -0.95, -0.32]]), profile([[0, 0.11], [0.5, 0.095], [1, 0.075]]), { seg: 16, radial: 12 }),
    [],
  );
  const colorAttr = useMemo(() => new THREE.BufferAttribute(new Float32Array(cerebrum.geometry.getAttribute('position').count * 3), 3), [cerebrum]);

  useEffect(() => {
    const c = new THREE.Color();
    const neutral = new THREE.Color('#e3a9ae');
    for (let i = 0; i < cerebrum.lobes.length; i++) {
      const lobe = cerebrum.lobes[i];
      if (colorByLobe) {
        c.set(LOBE_COLORS[lobe]);
        if (selectedLobe && selectedLobe !== lobe) c.multiplyScalar(0.35);
        else if (selectedLobe === lobe) c.multiplyScalar(1.1);
      } else c.copy(neutral);
      c.multiplyScalar(cerebrum.shade[i]);
      colorAttr.setXYZ(i, c.r, c.g, c.b);
    }
    colorAttr.needsUpdate = true;
  }, [cerebrum, colorAttr, colorByLobe, selectedLobe]);

  useEffect(() => {
    cerebrum.geometry.setAttribute('color', colorAttr);
  }, [cerebrum, colorAttr]);

  const dimTo = (id: LobeId, color: string) => {
    const c = new THREE.Color(color);
    if (selectedLobe && selectedLobe !== id) c.multiplyScalar(0.35);
    return c.multiply(new THREE.Color(tint));
  };

  const pointer = interactive
    ? {
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        },
        onPointerOut: () => {
          document.body.style.cursor = 'auto';
        },
      }
    : {};

  return (
    <group>
      <mesh
        geometry={cerebrum.geometry}
        {...pointer}
        onClick={
          interactive
            ? (e) => {
                e.stopPropagation();
                const p = e.object.worldToLocal(e.point.clone());
                const id = lobeAt(p.x, p.y, p.z);
                onSelectLobe?.(selectedLobe === id ? null : id);
              }
            : undefined
        }
      >
        <meshStandardMaterial vertexColors color={tint} roughness={0.55} />
      </mesh>
      <mesh
        geometry={cerebellum}
        position={[0, -0.38, -0.56]}
        {...pointer}
        onClick={
          interactive
            ? (e) => {
                e.stopPropagation();
                onSelectLobe?.(selectedLobe === 'cerebellum' ? null : 'cerebellum');
              }
            : undefined
        }
      >
        <meshStandardMaterial color={colorByLobe ? dimTo('cerebellum', LOBE_COLORS.cerebellum) : new THREE.Color('#c99ca2').multiply(new THREE.Color(tint))} roughness={0.6} />
      </mesh>
      <mesh
        geometry={stem}
        {...pointer}
        onClick={
          interactive
            ? (e) => {
                e.stopPropagation();
                onSelectLobe?.(selectedLobe === 'brainstem' ? null : 'brainstem');
              }
            : undefined
        }
      >
        <meshStandardMaterial color={colorByLobe ? dimTo('brainstem', LOBE_COLORS.brainstem) : new THREE.Color('#d8c2b2').multiply(new THREE.Color(tint))} roughness={0.6} />
      </mesh>
      {labels &&
        LOBE_LABELS.map((l) => (
          <Safe key={l.id}><Billboard position={l.pos}><Text font={LABEL_FONT} fontSize={0.1} color={LOBE_COLORS[l.id]} anchorX="center" anchorY="middle" outlineWidth={0.012} outlineColor="#000000">
              {l.text}
            </Text></Billboard></Safe>
        ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Neuron
// ---------------------------------------------------------------------------

export const NEURON_LEN = 6;

export function NeuronModel({ speed = 1 }: { speed?: number }) {
  const pulse = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.PointLight>(null);
  const t = useRef(0);

  const geo = useMemo(() => {
    const r = rng(5);
    const soma = new THREE.SphereGeometry(0.5, 32, 24);
    soma.deleteAttribute('uv');
    soma.translate(-3, 0, 0);
    const dend: THREE.BufferGeometry[] = [];
    const branch = (start: THREE.Vector3, dir: THREE.Vector3, len: number, rad: number, depth: number) => {
      const end = start.clone().addScaledVector(dir, len);
      const mid = start.clone().lerp(end, 0.5).add(v3((r() - 0.5) * 0.15, (r() - 0.5) * 0.15, (r() - 0.5) * 0.15));
      dend.push(makeTube([start, mid, end], rad, { seg: 8, radial: 6, round: 0.2 }));
      if (depth >= 3) return;
      for (let k = 0; k < 2; k++) {
        const nd = dir.clone().add(v3((r() - 0.5) * 1.1, (r() - 0.5) * 1.1, (r() - 0.5) * 1.1)).normalize();
        branch(end, nd, len * 0.72, rad * 0.7, depth + 1);
      }
    };
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const d = v3(-0.8 - r() * 0.3, Math.cos(a), Math.sin(a)).normalize();
      branch(v3(-3, 0, 0).addScaledVector(d, 0.4), d, 0.65, 0.07, 0);
    }
    const hillock = makeTube([v3(-2.6, 0, 0), v3(-2.3, 0, 0)], profile([[0, 0.3], [1, 0.07]]), { seg: 8, radial: 12, round: 0 });
    const axon = makeTube([v3(-2.3, 0, 0), v3(0, 0, 0), v3(2.4, 0, 0)], 0.065, { seg: 40, radial: 10, round: 0.01 });
    const myelin: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 6; i++) {
      const c = new THREE.CapsuleGeometry(0.16, 0.42, 6, 14);
      c.deleteAttribute('uv');
      c.rotateZ(Math.PI / 2);
      c.translate(-1.95 + i * 0.8, 0, 0);
      myelin.push(c);
    }
    const term: THREE.BufferGeometry[] = [];
    for (let k = 0; k < 4; k++) {
      const y = (k - 1.5) * 0.28;
      const z = (k % 2 ? 1 : -1) * 0.15;
      term.push(makeTube([v3(2.4, 0, 0), v3(2.7, y * 0.6, z * 0.6), v3(3.0, y, z)], 0.04, { seg: 8, radial: 6, round: 0.1 }));
      const b = new THREE.SphereGeometry(0.11, 14, 12);
      b.deleteAttribute('uv');
      b.translate(3.05, y, z);
      term.push(b);
    }
    return { soma, dend: merge(dend), hillock, axon, myelin: merge(myelin), term: merge(term) };
  }, []);

  useFrame((_, dt) => {
    t.current += dt * speed;
    const u = (t.current % 3) / 3;
    const x = -2.3 + u * 5.4;
    if (pulse.current) {
      pulse.current.position.x = x;
      const m = pulse.current.material as THREE.MeshBasicMaterial;
      m.opacity = u < 0.03 || u > 0.97 ? 0 : 1;
    }
    if (glow.current) glow.current.position.x = x;
  });

  return (
    <group>
      <mesh geometry={geo.soma}>
        <meshStandardMaterial color="#a45bdb" roughness={0.45} emissive="#5b1f99" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[-3, 0, 0]}>
        <sphereGeometry args={[0.2, 20, 16]} />
        <meshStandardMaterial color="#4a1580" roughness={0.5} />
      </mesh>
      <mesh geometry={geo.dend}>
        <meshStandardMaterial color="#c88cf0" roughness={0.5} />
      </mesh>
      <mesh geometry={geo.hillock}>
        <meshStandardMaterial color="#a45bdb" roughness={0.45} />
      </mesh>
      <mesh geometry={geo.axon}>
        <meshStandardMaterial color="#e6c7fa" roughness={0.45} />
      </mesh>
      <mesh geometry={geo.myelin}>
        <meshStandardMaterial color="#ffd9a8" roughness={0.35} transparent opacity={0.92} />
      </mesh>
      <mesh geometry={geo.term}>
        <meshStandardMaterial color="#c88cf0" roughness={0.45} emissive="#6a2aa0" emissiveIntensity={0.2} />
      </mesh>
      <mesh ref={pulse} position={[-2.3, 0, 0]}>
        <sphereGeometry args={[0.2, 20, 16]} />
        <meshBasicMaterial color="#ffee33" transparent opacity={1} toneMapped={false} />
      </mesh>
      <pointLight ref={glow} color="#ffee66" intensity={3} distance={2.5} position={[-2.3, 0, 0]} />
      {[
        { text: 'Dendrites (input)', pos: [-3.9, 1.35, 0] as [number, number, number], color: '#d9a8f5' },
        { text: 'Soma (cell body)', pos: [-3.0, -0.95, 0.2] as [number, number, number], color: '#d9a8f5' },
        { text: 'Axon', pos: [-0.5, 0.55, 0] as [number, number, number], color: '#f1dcff' },
        { text: 'Myelin sheath', pos: [0.7, -0.55, 0] as [number, number, number], color: '#ffd9a8' },
        { text: 'Axon terminals → next neuron', pos: [3.1, 0.9, 0] as [number, number, number], color: '#d9a8f5' },
      ].map((l) => (
        <Safe key={l.text}><Billboard position={l.pos}><Text font={LABEL_FONT} fontSize={0.2} color={l.color} anchorX="center" anchorY="middle" outlineWidth={0.015} outlineColor="#000000">
            {l.text}
          </Text></Billboard></Safe>
      ))}
    </group>
  );
}
