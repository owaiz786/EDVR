import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { LABEL_FONT, Safe } from './Safe';
import type { OrbitControls as OrbitControlsImpl } from 'three/examples/jsm/controls/OrbitControls.js';
import { HumanBodyModel, organGeoms, type BodyLayers } from './HumanBodyModel';
import { HeartModel } from './HeartModel';
import { LungsModel, AlveoliModel } from './LungsModel';
import { BrainModel, NeuronModel } from './BrainModel';
import { ORGANS, getOrganById, type OrganDef, type OrganSystemId } from './bodyData';
import { STAGES, foodPosition } from './digestionData';
import { makeTube, merge, rng, v3 } from './anatomy';
import type { ScaleLevel } from './scaleData';

// ---------------------------------------------------------------------------
// Camera
// ---------------------------------------------------------------------------

export interface CamGoal {
  pos: [number, number, number];
  target: [number, number, number];
  min: number;
  max: number;
}

export function CameraRig({ goal, goalKey }: { goal: CamGoal; goalKey: string }) {
  const controls = useThree((s) => s.controls) as unknown as OrbitControlsImpl | null;
  const camera = useThree((s) => s.camera);
  const animating = useRef(true);
  const goalRef = useRef(goal);
  goalRef.current = goal;
  const tmpA = useMemo(() => new THREE.Vector3(), []);
  const tmpB = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    animating.current = true;
  }, [goalKey]);

  useEffect(() => {
    if (!controls) return;
    const stop = () => {
      animating.current = false;
    };
    controls.addEventListener('start', stop);
    return () => controls.removeEventListener('start', stop);
  }, [controls]);

  useFrame((_, dt) => {
    if (!animating.current || !controls) return;
    const g = goalRef.current;
    const k = 1 - Math.exp(-4.5 * Math.min(dt, 0.05));
    tmpA.set(...g.pos);
    tmpB.set(...g.target);
    camera.position.lerp(tmpA, k);
    controls.target.lerp(tmpB, k);
    controls.update();
    if (camera.position.distanceTo(tmpA) < 0.02 && controls.target.distanceTo(tmpB) < 0.02) animating.current = false;
  });
  return null;
}

export function Lights() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#dfe6ff', '#2a1632', 0.55]} />
      <directionalLight position={[4, 7, 8]} intensity={1.1} />
      <directionalLight position={[-6, 2, -4]} intensity={0.35} color="#9db8ff" />
      <directionalLight position={[0, 4, -8]} intensity={0.5} color="#ff9bf0" />
    </>
  );
}

function Pedestal({ y = -4.52 }: { y?: number }) {
  return (
    <group position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <circleGeometry args={[2.6, 64]} />
        <meshBasicMaterial color="#2a1238" transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, 0, 0.005]}>
        <ringGeometry args={[2.5, 2.6, 96]} />
        <meshBasicMaterial color="#f093fb" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.004]}>
        <ringGeometry args={[1.4, 1.43, 96]} />
        <meshBasicMaterial color="#f093fb" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

function Tag({ pos, text, color = '#ffffff', size = 0.17 }: { pos: [number, number, number]; text: string; color?: string; size?: number }) {
  return (
    <Safe><Billboard position={pos}><Text font={LABEL_FONT} fontSize={size} color={color} anchorX="center" anchorY="middle" outlineWidth={size * 0.09} outlineColor="#000000">
        {text}
      </Text></Billboard></Safe>
  );
}

// ---------------------------------------------------------------------------
// Whole body + organ systems
// ---------------------------------------------------------------------------

export function WholeBodyScene({
  layers,
  skinOpacity,
  selectedOrganId,
  onOrganClick,
}: {
  layers: BodyLayers;
  skinOpacity: number;
  selectedOrganId: string | null;
  onOrganClick: (o: OrganDef) => void;
}) {
  const sel = selectedOrganId ? getOrganById(selectedOrganId) : null;
  return (
    <>
      <Pedestal />
      <HumanBodyModel layers={layers} skinOpacity={skinOpacity} selectedOrganId={selectedOrganId} onOrganClick={onOrganClick} />
      {sel && <Tag pos={sel.labelAt} text={sel.name} color="#ffe27a" size={0.3} />}
    </>
  );
}

const SKELETAL_TAGS: { text: string; pos: [number, number, number] }[] = [
  { text: 'Skull', pos: [0.95, 4.2, 0.3] },
  { text: 'Spine', pos: [-0.9, 1.4, -0.7] },
  { text: 'Ribcage', pos: [1.5, 2.0, 0.5] },
  { text: 'Pelvis', pos: [1.25, 0.3, 0.5] },
  { text: 'Femur', pos: [1.1, -1.2, 0.4] },
  { text: 'Tibia', pos: [1.0, -3.1, 0.4] },
];

export function SystemsScene({ system }: { system: OrganSystemId | null }) {
  const layers: BodyLayers = {
    skin: true,
    muscle: false,
    skeleton: true,
    organs: true,
    nerves: system === 'nervous',
    bloodVessels: system === 'circulatory',
  };
  const tags = system === 'skeletal' ? SKELETAL_TAGS : system ? ORGANS.filter((o) => o.system === system).map((o) => ({ text: o.name, pos: o.labelAt })) : [];
  return (
    <>
      <Pedestal />
      <HumanBodyModel layers={layers} skinOpacity={system ? 0.08 : 0.2} highlightSystem={system} />
      {tags.map((t) => (
        <Tag key={t.text} pos={t.pos} text={t.text} color="#ffffff" size={0.26} />
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Heart / lungs / brain
// ---------------------------------------------------------------------------

export function HeartScene({
  bpm,
  exercise,
  xray,
  labels,
  flow,
  selectedPart,
  onSelectPart,
}: {
  bpm: number;
  exercise: boolean;
  xray: boolean;
  labels: boolean;
  flow: boolean;
  selectedPart: string | null;
  onSelectPart: (id: string | null) => void;
}) {
  return (
    <group position={[0, -0.1, 0]}>
      <HeartModel bpm={bpm} exercise={exercise} xray={xray} labels={labels} flow={flow} interactive selectedPart={selectedPart} onSelectPart={onSelectPart} />
    </group>
  );
}

export function LungsScene({
  mode,
  rate,
  labels,
  bronchi,
  xray,
  selected,
  onSelect,
}: {
  mode: 'lungs' | 'alveoli';
  rate: number;
  labels: boolean;
  bronchi: boolean;
  xray: boolean;
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  if (mode === 'alveoli') return <AlveoliModel labels={labels} />;
  return <LungsModel rate={rate} opacity={xray ? 0.45 : 1} bronchi={bronchi} diaphragm labels={labels} selected={selected} onSelect={onSelect} />;
}

export function BrainScene({
  mode,
  selectedLobe,
  onSelectLobe,
  labels,
  speed,
}: {
  mode: 'brain' | 'neuron';
  selectedLobe: string | null;
  onSelectLobe: (id: string | null) => void;
  labels: boolean;
  speed: number;
}) {
  if (mode === 'neuron') return <NeuronModel speed={speed} />;
  return <BrainModel interactive colorByLobe labels={labels} selectedLobe={selectedLobe} onSelectLobe={onSelectLobe} />;
}

// ---------------------------------------------------------------------------
// Digestion
// ---------------------------------------------------------------------------

export function DigestionScene({
  stage,
  playing,
  speed,
  onStage,
  labels,
}: {
  stage: number;
  playing: boolean;
  speed: number;
  onStage: (i: number) => void;
  labels: boolean;
}) {
  const g = useMemo(() => organGeoms(), []);
  const food = useRef<THREE.Mesh>(null);
  const trail = useRef<(THREE.Mesh | null)[]>([]);
  const t = useRef(stage + 0.5);
  const lastStage = useRef(stage);
  const p = useMemo(() => new THREE.Vector3(), []);
  const mats = useRef<Record<string, THREE.MeshStandardMaterial | null>>({});

  useFrame((_, dt) => {
    if (playing) {
      t.current += dt * 0.2 * speed;
      if (t.current >= STAGES.length) t.current = 0;
      const idx = Math.floor(t.current);
      if (idx !== lastStage.current) {
        lastStage.current = idx;
        onStage(idx);
      }
    } else {
      const target = stage + 0.5;
      t.current += (target - t.current) * (1 - Math.exp(-4 * dt));
      lastStage.current = stage;
    }
    foodPosition(t.current, p);
    if (food.current) food.current.position.copy(p);
    trail.current.forEach((m, i) => {
      if (!m) return;
      foodPosition(Math.max(0, t.current - 0.02 * (i + 1)), p);
      m.position.copy(p);
    });
    // glow on the active organ
    const active = STAGES[Math.min(STAGES.length - 1, Math.max(0, playing ? Math.floor(t.current) : stage))].organId;
    for (const [id, m] of Object.entries(mats.current)) {
      if (m) m.emissiveIntensity = id === active ? 0.55 + 0.25 * Math.sin(performance.now() / 250) : 0;
    }
  });

  const organ = (id: string, geo: THREE.BufferGeometry, rough = 0.5) => {
    const o = getOrganById(id)!;
    return (
      <mesh geometry={geo}>
        <meshStandardMaterial
          ref={(m) => {
            mats.current[id] = m;
          }}
          color={o.color}
          emissive={o.color}
          emissiveIntensity={0}
          roughness={rough}
        />
      </mesh>
    );
  };

  return (
    <>
      <HumanBodyModel layers={{ skin: true, muscle: false, skeleton: false, organs: false, nerves: false, bloodVessels: false }} skinOpacity={0.1} />
      {organ('esophagus', g.esoph)}
      {organ('stomach', g.stomach, 0.4)}
      {organ('liver', g.liver, 0.4)}
      {organ('gallbladder', g.gall, 0.3)}
      {organ('pancreas', g.pancreas, 0.6)}
      {organ('small_intestine', g.small, 0.45)}
      {organ('large_intestine', g.large, 0.55)}
      {/* mouth marker + teeth glow when stage 0 */}
      <mesh position={[0, 3.63, 0.47]} scale={[1, 0.28, 0.4]}>
        <sphereGeometry args={[0.1, 16, 10]} />
        <meshStandardMaterial
          ref={(m) => {
            mats.current.mouth = m;
          }}
          color="#c0605e"
          emissive="#ff8a80"
          emissiveIntensity={0}
        />
      </mesh>
      {/* the food */}
      <mesh ref={food}>
        <sphereGeometry args={[0.1, 20, 16]} />
        <meshStandardMaterial color="#c98a3d" emissive="#ff9d2e" emissiveIntensity={0.9} roughness={0.5} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(m) => {
            trail.current[i] = m;
          }}
        >
          <sphereGeometry args={[0.07 - i * 0.015, 12, 10]} />
          <meshBasicMaterial color="#ffb347" transparent opacity={0.5 - i * 0.14} />
        </mesh>
      ))}
      {labels && (
        <>
          <Tag pos={[-1.5, 1.45, 0.4]} text="Liver" color="#ffb59e" size={0.15} />
          <Tag pos={[1.45, 1.2, 0.4]} text="Stomach" color="#ffc2b5" size={0.15} />
          <Tag pos={[1.3, 0.62, 0.3]} text="Pancreas" color="#f3dd9d" size={0.15} />
          <Tag pos={[-1.2, -0.1, 0.5]} text="Small intestine" color="#ffc9b3" size={0.15} />
          <Tag pos={[1.4, 0.05, 0.4]} text="Large intestine" color="#e6b490" size={0.15} />
          <Tag pos={[-0.7, 2.7, 0.4]} text="Esophagus" color="#f0b2a6" size={0.15} />
        </>
      )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Cross-section
// ---------------------------------------------------------------------------

export type SliceAxis = 'y' | 'x' | 'z';
export const SLICE_RANGE: Record<SliceAxis, [number, number]> = {
  y: [-4.6, 4.6],
  x: [-2.1, 2.1],
  z: [-0.95, 0.95],
};
export const sliceCoord = (axis: SliceAxis, value: number) => SLICE_RANGE[axis][0] + value * (SLICE_RANGE[axis][1] - SLICE_RANGE[axis][0]);

export function CrossSectionScene({ axis, value }: { axis: SliceAxis; value: number }) {
  const gl = useThree((s) => s.gl);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), []);
  const k = sliceCoord(axis, value);

  useEffect(() => {
    gl.clippingPlanes = [plane];
    return () => {
      gl.clippingPlanes = [];
    };
  }, [gl, plane]);

  useEffect(() => {
    if (axis === 'y') plane.set(new THREE.Vector3(0, -1, 0), k);
    else if (axis === 'x') plane.set(new THREE.Vector3(-1, 0, 0), k);
    else plane.set(new THREE.Vector3(0, 0, -1), k);
  }, [axis, k, plane]);

  const slab = useMemo(() => {
    if (axis === 'y') return { pos: [0, k - 0.01, 0] as [number, number, number], rot: [-Math.PI / 2, 0, 0] as [number, number, number], size: [4.6, 2.2] as [number, number] };
    if (axis === 'x') return { pos: [k - 0.01, 0, 0] as [number, number, number], rot: [0, Math.PI / 2, 0] as [number, number, number], size: [2.2, 9.6] as [number, number] };
    return { pos: [0, 0, k - 0.01] as [number, number, number], rot: [0, 0, 0] as [number, number, number], size: [4.6, 9.6] as [number, number] };
  }, [axis, k]);

  return (
    <>
      <Pedestal />
      <HumanBodyModel
        layers={{ skin: true, muscle: false, skeleton: true, organs: true, nerves: false, bloodVessels: false }}
        skinOpacity={0.35}
        doubleSided
        beat={false}
      />
      {/* the glowing scan plane */}
      <mesh position={slab.pos} rotation={slab.rot} renderOrder={20}>
        <planeGeometry args={slab.size} />
        <meshBasicMaterial color="#ff5a5a" transparent opacity={0.1} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <lineSegments position={slab.pos} rotation={slab.rot} renderOrder={21}>
        <edgesGeometry args={[new THREE.PlaneGeometry(slab.size[0], slab.size[1])]} />
        <lineBasicMaterial color="#ff6b6b" />
      </lineSegments>
    </>
  );
}

// ---------------------------------------------------------------------------
// Scale zoom
// ---------------------------------------------------------------------------

function ScaleIn({ from, children }: { from: number; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const s = useRef(from);
  useFrame((_, dt) => {
    s.current += (1 - s.current) * (1 - Math.exp(-5 * dt));
    ref.current?.scale.setScalar(s.current);
  });
  return (
    <group ref={ref} scale={from}>
      {children}
    </group>
  );
}

function Spin({ speed = 0.2, children }: { speed?: number; children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * speed;
  });
  return <group ref={ref}>{children}</group>;
}

function BodyLevel() {
  return (
    <group scale={0.5} position={[0, 0, 0]}>
      <HumanBodyModel
        layers={{ skin: true, muscle: false, skeleton: false, organs: true, nerves: false, bloodVessels: false }}
        skinOpacity={0.25}
      />
      <Tag pos={[2.2, 1.9, 0.6]} text="Heart" color="#ffb0a8" size={0.35} />
    </group>
  );
}

function OrganLevel() {
  return (
    <group scale={1.5}>
      <HeartModel bpm={70} flow xray />
    </group>
  );
}

function TissueLevel() {
  const geo = useMemo(() => {
    const r = rng(21);
    const fibres: THREE.BufferGeometry[] = [];
    const bands: THREE.BufferGeometry[] = [];
    const discs: THREE.BufferGeometry[] = [];
    const nuclei: THREE.BufferGeometry[] = [];
    const offsets: [number, number][] = [];
    for (let row = -1; row <= 1; row++) for (let col = -1; col <= 1; col++) offsets.push([col * 0.52 + (row % 2 ? 0.26 : 0), row * 0.46]);
    offsets.forEach(([oy, oz], idx) => {
      const len = 5 + r() * 0.6;
      const c = new THREE.CapsuleGeometry(0.22, len, 8, 18);
      c.deleteAttribute('uv');
      c.rotateZ(Math.PI / 2);
      c.translate(0, oy, oz);
      fibres.push(c);
      for (let x = -len / 2 + 0.1; x < len / 2; x += 0.22) {
        const t = new THREE.TorusGeometry(0.222, 0.012, 5, 18);
        t.deleteAttribute('uv');
        t.rotateY(Math.PI / 2);
        t.translate(x, oy, oz);
        bands.push(t);
      }
      const dx = -1 + ((idx * 0.83) % 2);
      const d = new THREE.CylinderGeometry(0.228, 0.228, 0.05, 18);
      d.deleteAttribute('uv');
      d.rotateZ(Math.PI / 2);
      d.translate(dx, oy, oz);
      discs.push(d);
      const n = new THREE.SphereGeometry(0.11, 12, 10);
      n.deleteAttribute('uv');
      n.scale(2, 0.8, 0.8);
      n.translate(-0.5 + r() * 1.2, oy, oz + 0.12);
      nuclei.push(n);
    });
    return { fibres: merge(fibres), bands: merge(bands), discs: merge(discs), nuclei: merge(nuclei) };
  }, []);
  return (
    <Spin speed={0.1}>
      <group rotation={[0.3, 0.2, 0.1]}>
        <mesh geometry={geo.fibres}>
          <meshStandardMaterial color="#c0453d" roughness={0.55} />
        </mesh>
        <mesh geometry={geo.bands}>
          <meshStandardMaterial color="#7a1f1c" roughness={0.6} />
        </mesh>
        <mesh geometry={geo.discs}>
          <meshStandardMaterial color="#f0b0a0" roughness={0.5} />
        </mesh>
        <mesh geometry={geo.nuclei}>
          <meshStandardMaterial color="#5a2a7a" roughness={0.5} />
        </mesh>
        <Tag pos={[0, 1.4, 0]} text="Cardiac muscle fibres" color="#ffb0a8" size={0.24} />
        <Tag pos={[-0.9, -1.35, 0.4]} text="Striations" color="#e8c0b8" size={0.2} />
      </group>
    </Spin>
  );
}

function CellLevel() {
  const geo = useMemo(() => {
    const r = rng(8);
    const mito: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 9; i++) {
      const m = new THREE.SphereGeometry(0.12, 12, 10);
      m.deleteAttribute('uv');
      m.scale(1.8, 0.8, 0.8);
      m.rotateZ((r() - 0.5) * 1.2);
      m.translate(-1.4 + r() * 2.8, (r() - 0.5) * 0.9, (r() - 0.5) * 0.9);
      mito.push(m);
    }
    const fib: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      fib.push(makeTube([v3(-2.2, Math.cos(a) * 0.5, Math.sin(a) * 0.5), v3(0, Math.cos(a) * 0.55, Math.sin(a) * 0.55), v3(2.2, Math.cos(a) * 0.5, Math.sin(a) * 0.5)], 0.05, { seg: 20, radial: 6 }));
    }
    return { mito: merge(mito), fib: merge(fib) };
  }, []);
  return (
    <Spin speed={0.12}>
      <mesh rotation={[0, 0, Math.PI / 2]} renderOrder={5}>
        <capsuleGeometry args={[1.0, 3.6, 12, 28]} />
        <meshPhysicalMaterial color="#ff9aa2" transparent opacity={0.22} roughness={0.2} depthWrite={false} side={THREE.DoubleSide} clearcoat={0.8} />
      </mesh>
      <mesh position={[-0.2, 0, 0]} scale={[1.4, 0.9, 0.9]}>
        <sphereGeometry args={[0.38, 28, 20]} />
        <meshStandardMaterial color="#5a2a7a" roughness={0.45} />
      </mesh>
      <mesh geometry={geo.mito}>
        <meshStandardMaterial color="#ff9d3a" roughness={0.4} emissive="#a04a00" emissiveIntensity={0.3} />
      </mesh>
      <mesh geometry={geo.fib}>
        <meshStandardMaterial color="#e8788a" roughness={0.5} />
      </mesh>
      <Tag pos={[0, 1.5, 0]} text="Cell membrane" color="#ffc0c6" size={0.22} />
      <Tag pos={[-0.2, -0.85, 0.5]} text="Nucleus (holds the DNA)" color="#d9a8f5" size={0.2} />
      <Tag pos={[1.4, -0.9, 0.5]} text="Mitochondria (make energy)" color="#ffbf80" size={0.2} />
      <Tag pos={[-1.8, 0.8, 0.6]} text="Myofibrils" color="#ff9aaa" size={0.2} />
    </Spin>
  );
}

function DnaLevel() {
  const geo = useMemo(() => {
    const N = 28;
    const H = 5.6;
    const R = 0.75;
    const twist = 0.55;
    const ptsA: THREE.Vector3[] = [];
    const ptsB: THREE.Vector3[] = [];
    const rungs: Record<string, THREE.BufferGeometry[]> = { A: [], T: [], G: [], C: [] };
    const r = rng(4);
    for (let i = 0; i < N; i++) {
      const y = -H / 2 + (i / (N - 1)) * H;
      const a = i * twist;
      const pa = v3(Math.cos(a) * R, y, Math.sin(a) * R);
      const pb = v3(-Math.cos(a) * R, y, -Math.sin(a) * R);
      ptsA.push(pa);
      ptsB.push(pb);
      const pair = r() > 0.5 ? ['A', 'T'] : ['G', 'C'];
      const flip = r() > 0.5;
      const [b1, b2] = flip ? [pair[1], pair[0]] : pair;
      const mid = pa.clone().lerp(pb, 0.5);
      rungs[b1].push(makeTube([pa, mid], 0.05, { seg: 3, radial: 6, round: 0 }));
      rungs[b2].push(makeTube([mid, pb], 0.05, { seg: 3, radial: 6, round: 0 }));
      for (const [b, p] of [[b1, pa.clone().lerp(mid, 0.55)], [b2, pb.clone().lerp(mid, 0.55)]] as [string, THREE.Vector3][]) {
        const s = new THREE.SphereGeometry(0.1, 10, 8);
        s.deleteAttribute('uv');
        s.translate(p.x, p.y, p.z);
        rungs[b].push(s);
      }
    }
    return {
      a: makeTube(ptsA, 0.09, { seg: 160, radial: 8 }),
      b: makeTube(ptsB, 0.09, { seg: 160, radial: 8 }),
      A: merge(rungs.A),
      T: merge(rungs.T),
      G: merge(rungs.G),
      C: merge(rungs.C),
    };
  }, []);
  return (
    <Spin speed={0.35}>
      <mesh geometry={geo.a}>
        <meshStandardMaterial color="#4da3ff" roughness={0.35} metalness={0.2} />
      </mesh>
      <mesh geometry={geo.b}>
        <meshStandardMaterial color="#ff8ad8" roughness={0.35} metalness={0.2} />
      </mesh>
      <mesh geometry={geo.A}>
        <meshStandardMaterial color="#5ce08a" roughness={0.4} />
      </mesh>
      <mesh geometry={geo.T}>
        <meshStandardMaterial color="#ff6b6b" roughness={0.4} />
      </mesh>
      <mesh geometry={geo.G}>
        <meshStandardMaterial color="#ffd23f" roughness={0.4} />
      </mesh>
      <mesh geometry={geo.C}>
        <meshStandardMaterial color="#4dd2ff" roughness={0.4} />
      </mesh>
    </Spin>
  );
}

const LEVEL_ORDER: ScaleLevel[] = ['body', 'organ', 'tissue', 'cell', 'dna'];

export function ScaleScene({ level }: { level: ScaleLevel }) {
  const index = LEVEL_ORDER.indexOf(level);
  const prev = useRef(index);
  const from = useMemo(() => {
    const f = index > prev.current ? 0.3 : index < prev.current ? 2.4 : 1;
    prev.current = index;
    return f;
  }, [index]);
  return (
    <ScaleIn key={level} from={from}>
      {level === 'body' && <BodyLevel />}
      {level === 'organ' && <OrganLevel />}
      {level === 'tissue' && <TissueLevel />}
      {level === 'cell' && <CellLevel />}
      {level === 'dna' && <DnaLevel />}
    </ScaleIn>
  );
}
