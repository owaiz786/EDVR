import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { LABEL_FONT, Safe } from './Safe';
import { curveOf, makeTube, merge, profile } from './anatomy';
import { heartSim } from './heartData';
import { dotTexture } from './dotTexture';

// Heart in its own local units (about 2.6 tall). Viewer's left = body's right.
// Blue = oxygen-poor (right side), red = oxygen-rich (left side).

const C_RV = '#3f63b8';
const C_RA = '#5b84d6';
const C_LV = '#b32a2a';
const C_LA = '#e0554a';

interface Chamber {
  key: string;
  part: string;
  radii: [number, number, number];
  pos: [number, number, number];
  rot: [number, number, number];
  color: string;
  kind: 'a' | 'v';
}

const CHAMBERS: Chamber[] = [
  { key: 'rv', part: 'rv', radii: [0.55, 0.78, 0.42], pos: [-0.32, -0.22, 0.3], rot: [0, 0, 0.25], color: C_RV, kind: 'v' },
  { key: 'lv', part: 'lv', radii: [0.62, 0.92, 0.55], pos: [0.28, -0.3, -0.05], rot: [0, 0, 0.45], color: C_LV, kind: 'v' },
  { key: 'ra', part: 'ra', radii: [0.4, 0.45, 0.38], pos: [-0.62, 0.48, -0.05], rot: [0, 0, 0], color: C_RA, kind: 'a' },
  { key: 'la', part: 'la', radii: [0.38, 0.34, 0.4], pos: [0.35, 0.62, -0.38], rot: [0, 0, 0], color: C_LA, kind: 'a' },
  { key: 'raa', part: 'ra', radii: [0.22, 0.24, 0.2], pos: [-0.42, 0.78, 0.3], rot: [0, 0, 0], color: C_RA, kind: 'a' },
  { key: 'laa', part: 'la', radii: [0.2, 0.22, 0.18], pos: [0.62, 0.55, 0.12], rot: [0, 0, 0], color: C_LA, kind: 'a' },
];

interface Vessel {
  part: string;
  color: string;
  geometry: THREE.BufferGeometry;
}

let vesselCache: Vessel[] | null = null;
function getVessels(): Vessel[] {
  if (vesselCache) return vesselCache;
  const aorta = merge([
    makeTube(
      curveOf([[0.08, 0.5, 0.0], [0.1, 1.0, 0.02], [0.24, 1.38, 0.0], [0.54, 1.42, -0.12], [0.78, 1.15, -0.22], [0.8, 0.7, -0.3], [0.8, 0.2, -0.35]]),
      profile([[0, 0.18], [0.6, 0.15], [1, 0.14]]),
      { seg: 40, radial: 14, round: 0.01 },
    ),
    makeTube(curveOf([[0.14, 1.38, 0.0], [0.1, 1.9, 0.0]]), 0.075, { seg: 8, radial: 8 }),
    makeTube(curveOf([[0.32, 1.44, -0.02], [0.36, 1.95, -0.02]]), 0.07, { seg: 8, radial: 8 }),
    makeTube(curveOf([[0.5, 1.42, -0.08], [0.72, 1.8, -0.1]]), 0.07, { seg: 8, radial: 8 }),
  ]);
  const pulm = merge([
    makeTube(curveOf([[-0.12, 0.42, 0.35], [-0.1, 0.9, 0.3], [-0.05, 1.18, 0.12]]), 0.16, { seg: 16, radial: 14, round: 0.01 }),
    makeTube(curveOf([[-0.05, 1.15, 0.1], [-0.5, 1.26, -0.15], [-1.05, 1.15, -0.2]]), profile([[0, 0.12], [1, 0.08]]), { seg: 16, radial: 10 }),
    makeTube(curveOf([[-0.05, 1.15, 0.1], [0.5, 1.28, -0.2], [1.1, 1.1, -0.25]]), profile([[0, 0.12], [1, 0.08]]), { seg: 16, radial: 10 }),
  ]);
  const vena = merge([
    makeTube(curveOf([[-0.62, 1.75, 0.0], [-0.62, 1.2, -0.01], [-0.62, 0.8, -0.02]]), 0.13, { seg: 12, radial: 12, round: 0.01 }),
    makeTube(curveOf([[-0.6, 0.15, -0.05], [-0.62, -0.4, -0.08], [-0.62, -0.85, -0.08]]), 0.14, { seg: 12, radial: 12, round: 0.01 }),
  ]);
  const pveins = merge([
    makeTube(curveOf([[-1.05, 0.95, -0.5], [-0.5, 0.78, -0.45], [0.05, 0.62, -0.4]]), 0.09, { seg: 12, radial: 8 }),
    makeTube(curveOf([[-0.95, 0.5, -0.55], [-0.45, 0.58, -0.45], [0.05, 0.55, -0.4]]), 0.09, { seg: 12, radial: 8 }),
    makeTube(curveOf([[1.1, 0.9, -0.5], [0.8, 0.8, -0.42], [0.55, 0.65, -0.38]]), 0.09, { seg: 12, radial: 8 }),
    makeTube(curveOf([[1.05, 0.45, -0.5], [0.8, 0.52, -0.42], [0.55, 0.55, -0.38]]), 0.09, { seg: 12, radial: 8 }),
  ]);
  vesselCache = [
    { part: 'aorta', color: '#c8372d', geometry: aorta },
    { part: 'pulm_artery', color: '#4a6fc9', geometry: pulm },
    { part: 'vena_cava', color: '#4a6fc9', geometry: vena },
    { part: 'pulm_vein', color: '#d9483b', geometry: pveins },
  ];
  return vesselCache;
}

const VALVES: { part: string; pos: [number, number, number]; rot: [number, number, number]; r: number }[] = [
  { part: 'tricuspid', pos: [-0.36, 0.2, 0.14], rot: [Math.PI / 2 - 0.25, 0, 0.3], r: 0.25 },
  { part: 'mitral', pos: [0.26, 0.22, -0.12], rot: [Math.PI / 2 - 0.2, 0, -0.3], r: 0.23 },
  { part: 'pulmonary_valve', pos: [-0.12, 0.45, 0.35], rot: [Math.PI / 2 - 0.1, 0, 0.1], r: 0.15 },
  { part: 'aortic_valve', pos: [0.08, 0.52, 0.0], rot: [Math.PI / 2 - 0.2, 0, -0.1], r: 0.15 },
];

// Particle circuits (blood flow)
const mk = (pts: [number, number, number][]) => curveOf(pts);
const DEOXY: THREE.CatmullRomCurve3[] = [
  mk([[-0.62, 1.7, 0], [-0.62, 1.0, 0], [-0.6, 0.5, 0], [-0.4, 0.2, 0.14], [-0.34, -0.2, 0.32], [-0.2, 0.15, 0.36], [-0.12, 0.5, 0.35], [-0.1, 0.95, 0.3], [-0.05, 1.15, 0.12], [-0.5, 1.26, -0.15], [-1.0, 1.15, -0.2]]),
  mk([[-0.6, -0.8, -0.08], [-0.6, -0.2, -0.05], [-0.6, 0.35, 0], [-0.4, 0.2, 0.14], [-0.34, -0.2, 0.32], [-0.2, 0.15, 0.36], [-0.12, 0.5, 0.35], [-0.1, 0.95, 0.3], [-0.05, 1.15, 0.12], [0.5, 1.28, -0.2], [1.05, 1.1, -0.25]]),
];
const OXY: THREE.CatmullRomCurve3[] = [
  mk([[-1.0, 0.95, -0.5], [-0.5, 0.78, -0.45], [0.05, 0.62, -0.38], [0.26, 0.3, -0.12], [0.3, -0.3, -0.05], [0.18, 0.2, 0.0], [0.08, 0.55, 0.0], [0.14, 1.0, 0.02], [0.3, 1.38, 0.0], [0.58, 1.38, -0.14], [0.78, 1.1, -0.24], [0.8, 0.4, -0.34]]),
  mk([[1.05, 0.9, -0.5], [0.8, 0.8, -0.42], [0.45, 0.62, -0.38], [0.26, 0.3, -0.12], [0.3, -0.3, -0.05], [0.18, 0.2, 0.0], [0.08, 0.55, 0.0], [0.1, 1.0, 0.02], [0.14, 1.5, 0.0], [0.12, 1.9, 0.0]]),
];

const PER_CURVE = 60;

function Flow({ speed }: { speed: number }) {
  const total = (DEOXY.length + OXY.length) * PER_CURVE;
  const refs = useMemo(() => {
    const phase = new Float32Array(total);
    const jitter = new Float32Array(total * 3);
    const curve: THREE.CatmullRomCurve3[] = [];
    const colors = new Float32Array(total * 3);
    const all = [...DEOXY, ...OXY];
    let k = 0;
    all.forEach((c, ci) => {
      for (let i = 0; i < PER_CURVE; i++, k++) {
        phase[k] = i / PER_CURVE;
        jitter[k * 3] = (Math.random() - 0.5) * 0.14;
        jitter[k * 3 + 1] = (Math.random() - 0.5) * 0.14;
        jitter[k * 3 + 2] = (Math.random() - 0.5) * 0.14;
        curve.push(c);
        const blue = ci < DEOXY.length;
        colors[k * 3] = blue ? 0.35 : 1.0;
        colors[k * 3 + 1] = blue ? 0.55 : 0.25;
        colors[k * 3 + 2] = blue ? 1.0 : 0.22;
      }
    });
    return { phase, jitter, curve, colors, positions: new Float32Array(total * 3) };
  }, [total]);
  const geoRef = useRef<THREE.BufferGeometry>(null);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame((_, dt) => {
    const g = geoRef.current;
    if (!g) return;
    const pos = g.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < total; i++) {
      refs.phase[i] = (refs.phase[i] + dt * speed) % 1;
      refs.curve[i].getPoint(refs.phase[i], tmp);
      pos.setXYZ(i, tmp.x + refs.jitter[i * 3], tmp.y + refs.jitter[i * 3 + 1], tmp.z + refs.jitter[i * 3 + 2]);
    }
    pos.needsUpdate = true;
  });
  return (
    <points frustumCulled={false}>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute attach="attributes-position" args={[refs.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[refs.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial map={dotTexture()} size={0.14} sizeAttenuation vertexColors transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

const LABELS: { text: string; pos: [number, number, number]; color: string }[] = [
  { text: 'Right atrium', pos: [-1.35, 0.55, 0.2], color: '#9db8ff' },
  { text: 'Right ventricle', pos: [-1.2, -0.55, 0.45], color: '#9db8ff' },
  { text: 'Left atrium', pos: [1.25, 0.8, -0.1], color: '#ff9a90' },
  { text: 'Left ventricle', pos: [1.35, -0.55, 0.3], color: '#ff9a90' },
  { text: 'Aorta', pos: [1.0, 1.6, -0.1], color: '#ff9a90' },
  { text: 'Pulmonary artery', pos: [-1.0, 1.55, 0.2], color: '#9db8ff' },
  { text: 'Vena cava', pos: [-1.2, 1.95, 0], color: '#9db8ff' },
];

interface HeartModelProps {
  bpm: number;
  exercise?: boolean;
  beat?: boolean;
  flow?: boolean;
  interactive?: boolean;
  selectedPart?: string | null;
  onSelectPart?: (id: string | null) => void;
  xray?: boolean;
  labels?: boolean;
  tint?: string; // multiplies the colours (used to dim the heart)
}

export function HeartModel({
  bpm,
  exercise = false,
  beat = true,
  flow = true,
  interactive = false,
  selectedPart = null,
  onSelectPart,
  xray = true,
  labels = false,
  tint = '#ffffff',
}: HeartModelProps) {
  const group = useRef<THREE.Group>(null);
  const chamberRefs = useRef<(THREE.Mesh | null)[]>([]);
  const phase = useRef(0);
  const vessels = useMemo(() => getVessels(), []);
  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;

  useFrame((_, dt) => {
    if (beat) phase.current = (phase.current + (dt * bpmRef.current) / 60) % 1;
    heartSim.phase = phase.current;
    const p = phase.current;
    let atrial = 0;
    let vent = 0;
    if (p < 0.14) atrial = Math.sin((p / 0.14) * Math.PI);
    else if (p < 0.4) vent = Math.sin(((p - 0.14) / 0.26) * Math.PI) ** 0.8;
    CHAMBERS.forEach((c, i) => {
      const m = chamberRefs.current[i];
      if (!m) return;
      const k = c.kind === 'a' ? atrial * 0.14 : vent * 0.16;
      m.scale.set(c.radii[0] * (1 - k), c.radii[1] * (1 - k * 1.1), c.radii[2] * (1 - k));
    });
    if (group.current && beat) {
      const s = 1 + vent * 0.025;
      group.current.scale.setScalar(s);
    }
  });

  const dimOthers = selectedPart !== null;
  const events = (part: string) =>
    interactive
      ? {
          onClick: (e: { stopPropagation: () => void }) => {
            e.stopPropagation();
            onSelectPart?.(selectedPart === part ? null : part);
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

  const mat = (color: string, part: string, opacity = 1) => {
    const sel = selectedPart === part;
    const o = (xray ? 0.62 : 1) * opacity * (dimOthers && !sel ? 0.55 : 1);
    return (
      <meshPhysicalMaterial
        color={new THREE.Color(color).multiply(new THREE.Color(tint))}
        emissive={sel ? color : '#000000'}
        emissiveIntensity={sel ? 0.55 : 0}
        roughness={0.42}
        clearcoat={0.35}
        clearcoatRoughness={0.4}
        transparent={o < 1}
        opacity={o}
        depthWrite={o >= 1}
      />
    );
  };

  return (
    <group>
      <group ref={group}>
        {CHAMBERS.map((c, i) => (
          <mesh
            key={c.key}
            ref={(m) => {
              chamberRefs.current[i] = m;
            }}
            position={c.pos}
            rotation={c.rot}
            scale={c.radii}
            renderOrder={2}
            {...events(c.part)}
          >
            <sphereGeometry args={[1, 40, 28]} />
            {mat(c.color, c.part)}
          </mesh>
        ))}
        {/* interventricular septum (visible in x-ray mode) */}
        {xray && (
          <mesh position={[0.0, -0.25, 0.12]} rotation={[0, 0, 0.35]} scale={[0.05, 0.8, 0.4]} renderOrder={1}>
            <sphereGeometry args={[1, 20, 16]} />
            <meshStandardMaterial color="#7a3b3b" roughness={0.7} />
          </mesh>
        )}
        {vessels.map((v) => (
          <mesh key={v.part} geometry={v.geometry} renderOrder={2} {...events(v.part)}>
            {mat(v.color, v.part, 1)}
          </mesh>
        ))}
        {VALVES.map((v) => (
          <mesh key={v.part} position={v.pos} rotation={v.rot} renderOrder={3} {...events(v.part)}>
            <torusGeometry args={[v.r, 0.035, 10, 32]} />
            <meshStandardMaterial
              color="#ffd966"
              emissive="#ffb300"
              emissiveIntensity={selectedPart === v.part ? 0.9 : 0.25}
              roughness={0.35}
              metalness={0.3}
            />
          </mesh>
        ))}
        {flow && <Flow speed={0.11 * (bpm / 70) * (exercise ? 1.2 : 1)} />}
      </group>
      {labels &&
        LABELS.map((l) => (
          <Safe key={l.text}><Billboard position={l.pos}><Text font={LABEL_FONT} fontSize={0.12} color={l.color} anchorX="center" anchorY="middle" outlineWidth={0.012} outlineColor="#000000">
              {l.text}
            </Text></Billboard></Safe>
        ))}
    </group>
  );
}
