import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { getOrganById, type OrganSystemId, type OrganDef } from './bodyData';
import {
  HAIR_COLOR,
  SKIN_COLOR,
  curveOf,
  ellipsoid,
  getMuscleGeometry,
  getNerveGeometry,
  getSkeletonGeometry,
  getSkinGeometry,
  getVesselGeometry,
  makeEsophagusCurve,
  makeKidneyGeometry,
  makeLargeIntestineCurve,
  makeLiverGeometry,
  makePancreasGeometry,
  makeSmallIntestineCurve,
  makeStomachGeometry,
  makeThyroidGeometry,
  makeTube,
  merge,
  profile,
  spineZ,
} from './anatomy';
import { HeartModel } from './HeartModel';
import { LungsModel } from './LungsModel';
import { BrainModel } from './BrainModel';

export interface BodyLayers {
  skin: boolean;
  muscle: boolean;
  skeleton: boolean;
  organs: boolean;
  nerves: boolean;
  bloodVessels: boolean;
}

export const DEFAULT_LAYERS: BodyLayers = {
  skin: true,
  muscle: false,
  skeleton: false,
  organs: true,
  nerves: false,
  bloodVessels: false,
};

interface HumanBodyModelProps {
  layers: BodyLayers;
  // If set, organs of this system are shown in full colour; the rest are dimmed.
  highlightSystem?: OrganSystemId | null;
  // 0.05 (almost invisible) … 1 (solid skin)
  skinOpacity?: number;
  onOrganClick?: (organ: OrganDef) => void;
  selectedOrganId?: string | null;
  // render both faces (needed so cut-away views look solid)
  doubleSided?: boolean;
  beat?: boolean;
}

export function HumanBodyModel({
  layers,
  highlightSystem = null,
  skinOpacity = 0.3,
  onOrganClick,
  selectedOrganId = null,
  doubleSided = false,
  beat = true,
}: HumanBodyModelProps) {
  const side = doubleSided ? THREE.DoubleSide : THREE.FrontSide;
  return (
    <group>
      {layers.muscle && <MuscleLayer opaque={!layers.organs} side={side} />}
      {layers.skeleton && <SkeletonLayer dim={highlightSystem !== null && highlightSystem !== 'skeletal'} side={side} />}
      {layers.organs && (
        <OrgansLayer
          highlightSystem={highlightSystem}
          onOrganClick={onOrganClick}
          selectedOrganId={selectedOrganId}
          skipVessels={layers.bloodVessels}
          beat={beat}
          side={side}
        />
      )}
      {!layers.organs && layers.bloodVessels && <HeartOnly beat={beat} />}
      {layers.bloodVessels && <VesselsLayer side={side} />}
      {layers.nerves && <NervesLayer side={side} showBrain={!layers.organs} />}
      {layers.skin && <SkinLayer opacity={skinOpacity} side={side} />}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Skin (ghost shader: opaque at the edges, see-through in the middle)
// ---------------------------------------------------------------------------

const GHOST_VERT = /* glsl */ `
#include <common>
#include <clipping_planes_pars_vertex>
varying vec3 vNormalV;
varying vec3 vViewV;
void main() {
  vNormalV = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewV = -mvPosition.xyz;
  gl_Position = projectionMatrix * mvPosition;
  #include <clipping_planes_vertex>
}
`;
const GHOST_FRAG = /* glsl */ `
#include <common>
#include <clipping_planes_pars_fragment>
uniform vec3 uColor;
uniform vec3 uRim;
uniform float uBase;
varying vec3 vNormalV;
varying vec3 vViewV;
void main() {
  #include <clipping_planes_fragment>
  vec3 n = normalize(vNormalV) * (gl_FrontFacing ? 1.0 : -1.0);
  vec3 v = normalize(vViewV);
  float f = pow(1.0 - abs(dot(n, v)), 2.4);
  float light = 0.55 + 0.45 * max(dot(n, normalize(vec3(0.4, 0.7, 0.6))), 0.0);
  vec3 col = uColor * light + uRim * f * 0.6;
  float a = clamp(uBase + (0.92 - uBase) * f, 0.0, 1.0);
  gl_FragColor = vec4(col, a);
}
`;

function useGhostMaterial(opacity: number, side: THREE.Side) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: GHOST_VERT,
        fragmentShader: GHOST_FRAG,
        transparent: true,
        depthWrite: false,
        clipping: true,
        uniforms: {
          uColor: { value: new THREE.Color(SKIN_COLOR) },
          uRim: { value: new THREE.Color('#ffd9c0') },
          uBase: { value: 0.3 },
        },
      }),
    [],
  );
  mat.uniforms.uBase.value = opacity;
  mat.side = side;
  return mat;
}

function SkinLayer({ opacity, side }: { opacity: number; side: THREE.Side }) {
  const geo = useMemo(() => getSkinGeometry(), []);
  const ghost = useGhostMaterial(opacity, side);
  const solid = opacity >= 0.97;
  return (
    <group>
      <mesh geometry={geo} renderOrder={10}>
        {solid ? <meshPhysicalMaterial color={SKIN_COLOR} roughness={0.62} clearcoat={0.15} side={side} /> : <primitive object={ghost} attach="material" />}
      </mesh>
      <Face />
    </group>
  );
}

function Face() {
  const skin = '#d9a784';
  return (
    <group>
      {/* eyes */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.17, 4.0, 0.47]}>
          <mesh scale={[1, 0.7, 0.55]}>
            <sphereGeometry args={[0.062, 16, 12]} />
            <meshStandardMaterial color="#f7f5f0" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.026]}>
            <sphereGeometry args={[0.033, 14, 10]} />
            <meshStandardMaterial color="#3a2a1f" roughness={0.25} />
          </mesh>
          <mesh position={[s * 0.003, 0, 0.044]}>
            <sphereGeometry args={[0.014, 10, 8]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
          {/* eyebrow */}
          <mesh position={[0, 0.1, 0.0]} rotation={[0, 0, s * -0.12]} scale={[1, 0.22, 0.5]}>
            <sphereGeometry args={[0.09, 12, 8]} />
            <meshStandardMaterial color={HAIR_COLOR} roughness={0.8} />
          </mesh>
        </group>
      ))}
      {/* nose */}
      <mesh position={[0, 3.86, 0.55]} scale={[0.6, 1.3, 0.9]} rotation={[-0.25, 0, 0]}>
        <sphereGeometry args={[0.06, 14, 12]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>
      <mesh position={[0, 3.78, 0.58]}>
        <sphereGeometry args={[0.05, 12, 10]} />
        <meshStandardMaterial color={skin} roughness={0.6} />
      </mesh>
      {/* mouth */}
      <mesh position={[0, 3.62, 0.5]} scale={[1, 0.22, 0.4]}>
        <sphereGeometry args={[0.1, 16, 10]} />
        <meshStandardMaterial color="#b0575a" roughness={0.5} />
      </mesh>
      {/* ears */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.45, 3.9, 0.03]} scale={[0.4, 1, 0.7]}>
          <sphereGeometry args={[0.1, 12, 10]} />
          <meshStandardMaterial color={skin} roughness={0.6} />
        </mesh>
      ))}
      {/* hair: back and crown, leaving the face open */}
      <mesh position={[0, 3.95, 0.0]} scale={[0.47, 0.64, 0.57]}>
        <sphereGeometry args={[1, 40, 24, Math.PI / 2 + 0.95, Math.PI * 2 - 1.9, 0, 1.95]} />
        <meshStandardMaterial color={HAIR_COLOR} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 3.96, 0.01]} scale={[0.475, 0.64, 0.575]}>
        <sphereGeometry args={[1, 40, 16, 0, Math.PI * 2, 0, 0.78]} />
        <meshStandardMaterial color={HAIR_COLOR} roughness={0.85} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Muscles, skeleton, vessels, nerves
// ---------------------------------------------------------------------------

function MuscleLayer({ opaque, side }: { opaque: boolean; side: THREE.Side }) {
  const geo = useMemo(() => getMuscleGeometry(), []);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color="#b3433c" roughness={0.62} side={side} transparent={!opaque} opacity={opaque ? 1 : 0.6} depthWrite={opaque} />
    </mesh>
  );
}

function SkeletonLayer({ dim, side }: { dim: boolean; side: THREE.Side }) {
  const geo = useMemo(() => getSkeletonGeometry(), []);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={dim ? '#5a5666' : '#ece6d6'} roughness={0.6} side={side} />
    </mesh>
  );
}

function VesselsLayer({ side }: { side: THREE.Side }) {
  const { arteries, veins } = useMemo(() => getVesselGeometry(), []);
  return (
    <group>
      <mesh geometry={arteries}>
        <meshStandardMaterial color="#d62828" roughness={0.45} emissive="#5a0a0a" emissiveIntensity={0.4} side={side} />
      </mesh>
      <mesh geometry={veins}>
        <meshStandardMaterial color="#2b5fd9" roughness={0.45} emissive="#0a1a5a" emissiveIntensity={0.4} side={side} />
      </mesh>
      <mesh geometry={descendingAorta()}>
        <meshStandardMaterial color="#d62828" roughness={0.45} emissive="#5a0a0a" emissiveIntensity={0.4} side={side} />
      </mesh>
      <mesh geometry={venaCava()}>
        <meshStandardMaterial color="#2b5fd9" roughness={0.45} emissive="#0a1a5a" emissiveIntensity={0.4} side={side} />
      </mesh>
    </group>
  );
}

function NervesLayer({ side, showBrain }: { side: THREE.Side; showBrain: boolean }) {
  const geo = useMemo(() => getNerveGeometry(), []);
  return (
    <group>
      <mesh geometry={geo}>
        <meshStandardMaterial color="#ffd23f" emissive="#a87800" emissiveIntensity={0.55} roughness={0.4} side={side} />
      </mesh>
      {showBrain && (
        <group position={[0, 3.99, -0.04]} scale={0.6}>
          <BrainModel colorByLobe={false} />
        </group>
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Organs
// ---------------------------------------------------------------------------

const HEART_POS: [number, number, number] = [0.2, 1.9, 0.12];
const HEART_SCALE = 0.42;

let descCache: THREE.BufferGeometry | null = null;
function descendingAorta() {
  if (!descCache) {
    descCache = makeTube(
      curveOf([[0.43, 2.5, 0.07], [0.3, 2.38, -0.06], [0.2, 2.1, -0.12], [0.15, 1.5, -0.1], [0.15, 0.8, -0.05], [0.15, 0.25, -0.02]]),
      profile([[0, 0.07], [1, 0.055]]),
      { seg: 40, radial: 12, round: 0.01 },
    );
  }
  return descCache;
}
let venaCache: THREE.BufferGeometry | null = null;
function venaCava() {
  if (!venaCache) {
    venaCache = merge([
      makeTube(curveOf([[-0.06, 1.54, 0.09], [-0.14, 1.2, 0.0], [-0.14, 0.6, -0.05], [-0.1, 0.25, -0.05]]), 0.075, { seg: 24, radial: 10, round: 0.01 }),
      makeTube(curveOf([[-0.06, 2.64, 0.12], [-0.1, 2.95, 0.1]]), 0.06, { seg: 6, radial: 8, round: 0.01 }),
    ]);
  }
  return venaCache;
}

interface OrganGeoms {
  lKidney: THREE.BufferGeometry;
  rKidney: THREE.BufferGeometry;
  liver: THREE.BufferGeometry;
  stomach: THREE.BufferGeometry;
  small: THREE.BufferGeometry;
  large: THREE.BufferGeometry;
  esoph: THREE.BufferGeometry;
  pancreas: THREE.BufferGeometry;
  thyroid: THREE.BufferGeometry;
  spleen: THREE.BufferGeometry;
  gall: THREE.BufferGeometry;
  bladder: THREE.BufferGeometry;
  adrenal: THREE.BufferGeometry;
  pituitary: THREE.BufferGeometry;
  cord: THREE.BufferGeometry;
}
let geomCache: OrganGeoms | null = null;
export function organGeoms(): OrganGeoms {
  if (geomCache) return geomCache;
  const cord: [number, number, number][] = [];
  for (let y = 3.62; y >= 0.55; y -= 0.3) cord.push([0, y, spineZ(y) - 0.12]);
  geomCache = {
    lKidney: makeKidneyGeometry(1).translate(0.5, 1.1, -0.28),
    rKidney: makeKidneyGeometry(-1).translate(-0.5, 1.0, -0.28),
    liver: makeLiverGeometry().translate(-0.35, 1.3, 0.12),
    stomach: makeStomachGeometry(),
    small: makeTube(makeSmallIntestineCurve(), 0.07, { seg: 460, radial: 10, round: 0.01 }),
    large: makeTube(makeLargeIntestineCurve(), (t) => 0.105 + 0.016 * Math.sin(t * 160), { seg: 320, radial: 14, round: 0.02 }),
    esoph: makeTube(makeEsophagusCurve(), 0.065, { seg: 48, radial: 10, round: 0.01 }),
    pancreas: makePancreasGeometry(),
    thyroid: makeThyroidGeometry(),
    spleen: ellipsoid(0.16, 0.3, 0.12, [0.9, 1.3, -0.18], [0, 0, 0.15]),
    gall: ellipsoid(0.07, 0.14, 0.07, [-0.5, 0.98, 0.36], [0.4, 0, 0]),
    bladder: ellipsoid(0.2, 0.2, 0.2, [0, -0.12, 0.2]),
    adrenal: merge([ellipsoid(0.1, 0.06, 0.06, [-0.52, 1.5, -0.28], [0, 0, -0.4]), ellipsoid(0.1, 0.06, 0.06, [0.52, 1.55, -0.28], [0, 0, 0.4])]),
    pituitary: ellipsoid(0.04, 0.04, 0.04, [0, 3.76, 0.1]),
    cord: makeTube(curveOf(cord), 0.045, { seg: 40, radial: 10 }),
  };
  return geomCache;
}

const DIM = '#575263';

function OrgansLayer({
  highlightSystem,
  onOrganClick,
  selectedOrganId,
  skipVessels,
  beat,
  side,
}: {
  highlightSystem: OrganSystemId | null;
  onOrganClick?: (o: OrganDef) => void;
  selectedOrganId: string | null;
  skipVessels: boolean;
  beat: boolean;
  side: THREE.Side;
}) {
  const g = useMemo(() => organGeoms(), []);
  const isDim = (o: OrganDef) => highlightSystem !== null && o.system !== highlightSystem;
  const organ = (id: string) => getOrganById(id)!;

  const wrap = (o: OrganDef, children: ReactNode) => {
    const dim = isDim(o);
    return (
      <group
        key={o.id}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (!dim) onOrganClick?.(o);
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          if (!dim) document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {children}
      </group>
    );
  };

  const mat = (o: OrganDef, roughness = 0.5, colorOverride?: string) => {
    const dim = isDim(o);
    const sel = selectedOrganId === o.id;
    const c = colorOverride ?? o.color;
    return (
      <meshStandardMaterial color={dim ? DIM : c} roughness={roughness} emissive={sel ? c : '#000000'} emissiveIntensity={sel ? 0.5 : 0} side={side} />
    );
  };

  const tint = (o: OrganDef) => (isDim(o) ? '#6b6676' : '#ffffff');
  const lungDim = ['left_lung', 'right_lung', 'trachea'].map(organ).every(isDim);
  const aorta = organ('aorta');

  return (
    <group>
      <LungsModel
        rate={14}
        animate={beat}
        tint={lungDim ? '#6b6676' : '#ffffff'}
        selected={selectedOrganId}
        onSelect={(id) => {
          const o = id ? getOrganById(id) : null;
          if (o && !isDim(o)) onOrganClick?.(o);
        }}
      />

      {wrap(
        organ('heart'),
        <group position={HEART_POS} scale={HEART_SCALE}>
          <HeartModel bpm={70} beat={beat} flow={false} xray={false} tint={tint(organ('heart'))} />
        </group>,
      )}

      {wrap(
        organ('brain'),
        <group position={[0, 3.99, -0.04]} scale={0.6}>
          <BrainModel colorByLobe={false} tint={tint(organ('brain'))} />
        </group>,
      )}

      {wrap(organ('esophagus'), <mesh geometry={g.esoph}>{mat(organ('esophagus'))}</mesh>)}
      {wrap(organ('stomach'), <mesh geometry={g.stomach}>{mat(organ('stomach'), 0.4)}</mesh>)}
      {wrap(organ('liver'), <mesh geometry={g.liver}>{mat(organ('liver'), 0.4)}</mesh>)}
      {wrap(organ('gallbladder'), <mesh geometry={g.gall}>{mat(organ('gallbladder'), 0.3)}</mesh>)}
      {wrap(organ('pancreas'), <mesh geometry={g.pancreas}>{mat(organ('pancreas'), 0.6)}</mesh>)}
      {wrap(organ('small_intestine'), <mesh geometry={g.small}>{mat(organ('small_intestine'), 0.45)}</mesh>)}
      {wrap(organ('large_intestine'), <mesh geometry={g.large}>{mat(organ('large_intestine'), 0.55)}</mesh>)}
      {wrap(organ('spleen'), <mesh geometry={g.spleen}>{mat(organ('spleen'), 0.5)}</mesh>)}
      {wrap(organ('left_kidney'), <mesh geometry={g.lKidney}>{mat(organ('left_kidney'), 0.4)}</mesh>)}
      {wrap(organ('right_kidney'), <mesh geometry={g.rKidney}>{mat(organ('right_kidney'), 0.4)}</mesh>)}
      {wrap(organ('adrenal'), <mesh geometry={g.adrenal}>{mat(organ('adrenal'), 0.5)}</mesh>)}
      {wrap(organ('bladder'), <mesh geometry={g.bladder}>{mat(organ('bladder'), 0.3)}</mesh>)}
      {wrap(organ('thyroid'), <mesh geometry={g.thyroid}>{mat(organ('thyroid'), 0.5)}</mesh>)}
      {wrap(organ('pituitary'), <mesh geometry={g.pituitary}>{mat(organ('pituitary'), 0.5)}</mesh>)}
      {wrap(organ('spinal_cord'), <mesh geometry={g.cord}>{mat(organ('spinal_cord'), 0.5)}</mesh>)}
      {!skipVessels &&
        wrap(
          aorta,
          <group>
            <mesh geometry={descendingAorta()}>{mat(aorta, 0.45, '#d62828')}</mesh>
            <mesh geometry={venaCava()}>{mat(aorta, 0.45, '#2b5fd9')}</mesh>
          </group>,
        )}
    </group>
  );
}

// heart (+ great vessels) on its own, used when only the vessel layer is on
function HeartOnly({ beat }: { beat: boolean }) {
  return (
    <group position={HEART_POS} scale={HEART_SCALE}>
      <HeartModel bpm={70} beat={beat} flow={false} xray={false} />
    </group>
  );
}
