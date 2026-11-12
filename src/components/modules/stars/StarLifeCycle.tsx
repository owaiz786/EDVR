import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';

export interface LifeStage {
  id: string;
  name: string;
  durationLabel: string; // for the info panel
  description: string;
  facts: string[];
}

export const LIFE_STAGES: LifeStage[] = [
  {
    id: 'nebula',
    name: 'Nebula',
    durationLabel: 'Millions of years',
    description:
      'A nebula is a giant cloud of gas (mostly hydrogen) and dust in space. Stars are born inside nebulae. Gravity slowly pulls the gas together until it gets hot and dense enough to start glowing.',
    facts: [
      'Made of about 75% hydrogen and 25% helium',
      'The Orion Nebula is visible to the naked eye',
      'Some nebulae glow, others are dark and block starlight',
      'A typical nebula is 10–100 light-years across',
    ],
  },
  {
    id: 'protostar',
    name: 'Protostar',
    durationLabel: '100,000 to 10 million years',
    description:
      'A protostar is what a star becomes before it starts fusing hydrogen. The cloud collapses under gravity, heats up, and glows red. When the core gets hot enough for nuclear fusion, a true star is born.',
    facts: [
      'Powered by gravity, not yet by nuclear fusion',
      'Surrounded by a disk of dust that may form planets',
      'Often shoots out jets of gas along its poles',
      'A protostar can take millions of years to ignite',
    ],
  },
  {
    id: 'main_sequence',
    name: 'Main Sequence Star',
    durationLabel: 'Billions of years (Sun: ~10 billion)',
    description:
      'A main sequence star fuses hydrogen into helium in its core. This is the longest, most stable stage of a star\'s life. Our Sun is a main sequence star right now, and will be for about 5 billion more years.',
    facts: [
      '90% of a star\'s life is spent in this stage',
      'The Sun fuses 600 million tons of hydrogen every second',
      'Hotter stars are blue, cooler stars are red',
      'Red dwarfs can live for trillions of years',
    ],
  },
  {
    id: 'red_giant',
    name: 'Red Giant',
    durationLabel: '~1 billion years',
    description:
      'When a Sun-like star runs out of hydrogen in its core, the core shrinks and heats up while the outer layers puff out and cool. The star becomes a huge, red giant — large enough to swallow the inner planets.',
    facts: [
      'Can be 100–1000× the size of the original star',
      'The surface is cooler (hence red), but the core is hotter',
      'Begins fusing helium into carbon and oxygen',
      'When the Sun becomes a red giant, it will engulf Mercury and Venus',
    ],
  },
  {
    id: 'planetary_nebula',
    name: 'Planetary Nebula',
    durationLabel: 'Tens of thousands of years',
    description:
      'A red giant sheds its outer layers into space, leaving a beautiful glowing shell around the hot, exposed core. (The name has nothing to do with planets — early astronomers thought the round shapes looked like planets.)',
    facts: [
      'Has nothing to do with planets despite the name',
      'Returns hydrogen and helium to space for new stars',
      'Often looks like rings, butterflies, or hourglasses',
      'The Ring Nebula (M57) is the most famous example',
    ],
  },
  {
    id: 'white_dwarf',
    name: 'White Dwarf',
    durationLabel: 'Billions of years (cools forever)',
    description:
      'After the planetary nebula fades, the exposed stellar core remains as a white dwarf — a hot, dense Earth-sized ball that no longer fuses anything. It slowly cools and fades over billions of years.',
    facts: [
      'About the size of Earth but as heavy as the Sun',
      'A teaspoon of white dwarf material weighs ~15 tons',
      'No longer does nuclear fusion',
      'Will eventually cool into a black dwarf (none exist yet)',
    ],
  },
  {
    id: 'supernova',
    name: 'Supernova',
    durationLabel: 'Seconds to months (visible)',
    description:
      'A star much more massive than the Sun ends its life in a colossal explosion called a supernova. The core collapses in seconds, and the outer layers are blasted into space — briefly outshining an entire galaxy.',
    facts: [
      'Can outshine an entire galaxy of 100 billion stars',
      'Creates most of the heavy elements (gold, uranium, etc.)',
      'Last one seen in our galaxy was in 1604',
      'The Crab Nebula is the remnant of a 1054 supernova',
    ],
  },
  {
    id: 'neutron_star',
    name: 'Neutron Star / Black Hole',
    durationLabel: 'Black hole: forever',
    description:
      'After a supernova, the collapsed core becomes either a neutron star (an ultra-dense ball of neutrons) or, if the original star was massive enough, a black hole whose gravity is so strong that not even light can escape.',
    facts: [
      'A neutron star is ~20 km wide but as heavy as the Sun',
      'A sugar cube of neutron star material weighs ~1 billion tons',
      'Some neutron stars spin hundreds of times per second (pulsars)',
      'A black hole is the densest object in the universe',
    ],
  },
];

// ------------------------- 3D representations -------------------------

function Nebula3D() {
  // A diffuse cloud of particles in bluish/pinkish tones.
  const positions = useMemo(() => {
    const count = 2500;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Two overlapping gaussian blobs for that classic two-tone nebula look
      const which = Math.random();
      const cx = which < 0.5 ? -2 : 2;
      const cy = which < 0.5 ? 1 : -1;
      const cz = which < 0.5 ? 0.5 : -0.5;
      const spread = 3.5;
      arr[i * 3] = cx + (Math.random() - 0.5) * spread;
      arr[i * 3 + 1] = cy + (Math.random() - 0.5) * spread;
      arr[i * 3 + 2] = cz + (Math.random() - 0.5) * spread;
    }
    return arr;
  }, []);
  const colors = useMemo(() => {
    const arr = new Float32Array(positions.length);
    for (let i = 0; i < positions.length / 3; i++) {
      const x = positions[i * 3];
      if (x < 0) {
        arr[i * 3] = 0.4; arr[i * 3 + 1] = 0.3; arr[i * 3 + 2] = 0.9; // blue
      } else {
        arr[i * 3] = 1.0; arr[i * 3 + 1] = 0.4; arr[i * 3 + 2] = 0.6; // pink
      }
    }
    return arr;
  }, [positions]);

  const ref = useRef<THREE.Points>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.18} sizeAttenuation vertexColors transparent opacity={0.55} depthWrite={false} />
    </points>
  );
}

function Protostar3D() {
  const coreRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (coreRef.current) coreRef.current.rotation.y += delta * 0.3;
    if (haloRef.current) haloRef.current.scale.setScalar(1 + Math.sin(performance.now() * 0.001) * 0.05);
  });
  return (
    <group>
      <mesh ref={haloRef}>
        <sphereGeometry args={[1.8, 32, 32]} />
        <meshBasicMaterial color="#ff7a4a" transparent opacity={0.2} depthWrite={false} />
      </mesh>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshBasicMaterial color="#ffae5a" toneMapped={false} />
      </mesh>
      {/* Accretion disk hint */}
      <mesh rotation={[Math.PI / 2.5, 0, 0]}>
        <ringGeometry args={[2.0, 3.5, 64]} />
        <meshBasicMaterial color="#ff9050" transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function MainSequence3D() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.1;
  });
  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[1.6, 48, 48]} />
        <meshBasicMaterial color="#fff3c4" toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[2.0, 32, 32]} />
        <meshBasicMaterial color="#ffd966" transparent opacity={0.2} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={2} distance={0} decay={0} color="#fff3c4" />
    </group>
  );
}

function RedGiant3D() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.05;
  });
  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[3.5, 48, 48]} />
        <meshBasicMaterial color="#ff5a3a" toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[4.2, 32, 32]} />
        <meshBasicMaterial color="#cc3300" transparent opacity={0.15} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function PlanetaryNebula3D() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.1;
  });
  // A glowing shell around a small core.
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshBasicMaterial color="#cfe0ff" toneMapped={false} />
      </mesh>
      <mesh>
        <torusGeometry args={[2.5, 0.6, 24, 64]} />
        <meshBasicMaterial color="#5b9eff" transparent opacity={0.55} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.6, 24, 64]} />
        <meshBasicMaterial color="#7fd3ff" transparent opacity={0.45} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={1.5} distance={0} decay={0} color="#cfe0ff" />
    </group>
  );
}

function WhiteDwarf3D() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.4;
  });
  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshBasicMaterial color="#e8efff" toneMapped={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.1, 24, 24]} />
        <meshBasicMaterial color="#9bb3ff" transparent opacity={0.2} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={1.2} distance={0} decay={0} color="#e8efff" />
    </group>
  );
}

function Supernova3D() {
  const ref = useRef<THREE.Mesh>(null);
  const flashRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.5;
      const t = (performance.now() % 2500) / 2500;
      const scale = 1 + t * 4;
      ref.current.scale.setScalar(scale);
      (ref.current.material as THREE.MeshBasicMaterial).opacity = 1 - t;
    }
    if (flashRef.current) {
      const t = (performance.now() % 2500) / 2500;
      flashRef.current.scale.setScalar(0.5 + t * 6);
      (flashRef.current.material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - t);
    }
  });
  return (
    <group>
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh ref={flashRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#ffe08a" transparent opacity={0.5} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      {/* Expanding shell */}
      <mesh ref={ref}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial color="#ff9050" transparent opacity={0.5} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={3} distance={0} decay={0} color="#ffe08a" />
    </group>
  );
}

function NeutronStarBlackHole3D() {
  // Combines both outcomes: a tiny bright neutron-star-like core with two
  // beams, plus a small accretion-disk hint suggesting the black-hole path.
  const ref = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 2; // pulsar spinning
    if (beamRef.current) beamRef.current.rotation.z += delta * 2;
  });
  return (
    <group>
      {/* Tiny dense core */}
      <mesh ref={ref}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshBasicMaterial color="#cfe0ff" toneMapped={false} />
      </mesh>
      {/* Pulsar beams */}
      <mesh ref={beamRef}>
        <cylinderGeometry args={[0.05, 0.05, 6, 8]} />
        <meshBasicMaterial color="#7fd3ff" transparent opacity={0.7} toneMapped={false} />
      </mesh>
      {/* Thin accretion-disk hint */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 2.2, 64]} />
        <meshBasicMaterial color="#ff9050" transparent opacity={0.4} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={1} distance={0} decay={0} color="#cfe0ff" />
    </group>
  );
}

function StageRender({ stageId }: { stageId: string }) {
  switch (stageId) {
    case 'nebula': return <Nebula3D />;
    case 'protostar': return <Protostar3D />;
    case 'main_sequence': return <MainSequence3D />;
    case 'red_giant': return <RedGiant3D />;
    case 'planetary_nebula': return <PlanetaryNebula3D />;
    case 'white_dwarf': return <WhiteDwarf3D />;
    case 'supernova': return <Supernova3D />;
    case 'neutron_star': return <NeutronStarBlackHole3D />;
    default: return null;
  }
}

// ------------------------- Background stars -------------------------

function BackgroundStars() {
  const positions = useMemo(() => {
    const count = 2000;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 80 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi);
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.3} sizeAttenuation transparent opacity={0.7} />
    </points>
  );
}

interface Props {
  stageIndex: number;
}

export default function StarLifeCycle({ stageIndex }: Props) {
  const stage = LIFE_STAGES[stageIndex];
  return (
    <group>
      <BackgroundStars />
      <StageRender stageId={stage.id} />
      <Billboard position={[0, 4, 0]}>
        <Text fontSize={1.4} color="#ffe08a" anchorX="center" anchorY="bottom" outlineWidth={0.08} outlineColor="#000000">
          {stage.name}
        </Text>
      </Billboard>
    </group>
  );
}
