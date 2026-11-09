import { Suspense, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

interface StageDef {
  id: string;
  name: string;
  position: [number, number, number];
  description: string;
  facts: string[];
}

const STAGES: StageDef[] = [
  {
    id: 'mouth',
    name: 'Mouth',
    position: [0, 4.0, 0.3],
    description: 'Digestion begins in the mouth. Teeth tear and grind food into small pieces, and saliva starts breaking down starches with an enzyme called amylase.',
    facts: ['Teeth grind food into small pieces', 'Saliva starts digesting starch', 'Food is shaped into a bolus', 'Takes about 30–60 seconds'],
  },
  {
    id: 'esophagus',
    name: 'Esophagus',
    position: [0, 3.0, 0.2],
    description: 'The esophagus is a muscular tube that pushes food from the mouth down to the stomach using wave-like muscle contractions called peristalsis.',
    facts: ['About 25 cm long', 'Uses wave-like muscle contractions', 'Called peristalsis', 'Takes about 6–8 seconds'],
  },
  {
    id: 'stomach',
    name: 'Stomach',
    position: [0.3, 1.9, 0.4],
    description: 'In the stomach, strong acid and enzymes break food down further. The stomach churns food into a liquid paste called chyme over 2–4 hours.',
    facts: ['pH ~1.5 (very acidic)', 'Churns food for 2–4 hours', 'Makes a liquid paste called chyme', 'Holds about 1 litre'],
  },
  {
    id: 'small_intestine',
    name: 'Small Intestine',
    position: [0, 0.5, 0.4],
    description: 'The small intestine is where most nutrients are absorbed. Enzymes from the pancreas and bile from the liver finish breaking food down. Tiny finger-like villi absorb nutrients into the blood.',
    facts: ['About 6 m long', 'Most nutrients absorbed here', 'Has tiny villi for absorption', 'Food stays here 3–5 hours'],
  },
  {
    id: 'large_intestine',
    name: 'Large Intestine',
    position: [0, -1.0, 0.4],
    description: 'The large intestine (colon) absorbs water and salts from what is left. Helpful bacteria here also make some vitamins. What is left becomes solid waste.',
    facts: ['About 1.5 m long', 'Absorbs water and salts', 'Home to helpful gut bacteria', 'Forms solid waste'],
  },
  {
    id: 'rectum',
    name: 'Rectum',
    position: [0, -1.8, 0.3],
    description: 'The rectum stores the solid waste until it leaves the body through the anus.',
    facts: ['Stores solid waste', 'Last stop in the digestive tract', 'Signals the brain when full', 'Waste leaves through the anus'],
  },
];

// Helper organs (liver, gallbladder, pancreas) that help digestion but aren't
// directly on the path.
const HELPER_ORGANS: { id: string; name: string; position: [number, number, number]; color: string }[] = [
  { id: 'liver', name: 'Liver', position: [-0.5, 1.6, 0.3], color: '#e09f3e' },
  { id: 'pancreas', name: 'Pancreas', position: [-0.2, 1.0, 0.3], color: '#e9c46a' },
];

// The food particle travels along the path positions.
const PATH: [number, number, number][] = STAGES.map((s) => s.position);

function DigestionScene({ stageIndex, autoPlay, setStageIndex }: { stageIndex: number; autoPlay: boolean; setStageIndex: (n: number) => void }) {
  const foodRef = useRef<THREE.Mesh>(null);
  const tRef = useRef(0);

  useFrame((_, delta) => {
    if (autoPlay) {
      tRef.current += delta * 0.25;
      if (tRef.current > PATH.length - 1) tRef.current = 0;
      const idx = Math.floor(tRef.current);
      setStageIndex(idx);
    }
    if (foodRef.current) {
      // Interpolate position smoothly along the path.
      const i = Math.floor(tRef.current) % PATH.length;
      const next = (i + 1) % PATH.length;
      const frac = autoPlay ? tRef.current - i : 0;
      const p1 = PATH[i];
      const p2 = PATH[next];
      const x = p1[0] + (p2[0] - p1[0]) * frac;
      const y = p1[1] + (p2[1] - p1[1]) * frac;
      const z = p1[2] + (p2[2] - p1[2]) * frac;
      foodRef.current.position.set(x, y, z);
    }
  });

  // When not auto-playing, snap the food to the selected stage.
  useMemo(() => {
    if (!autoPlay) tRef.current = stageIndex;
  }, [stageIndex, autoPlay]);

  return (
    <group>
      {/* Mouth (head) */}
      <mesh position={[0, 4.2, 0]}>
        <sphereGeometry args={[0.7, 24, 24]} />
        <meshStandardMaterial color="#e8c4a0" roughness={0.7} transparent opacity={0.6} />
      </mesh>
      {/* Esophagus */}
      <mesh position={[0, 3.2, 0.2]}>
        <cylinderGeometry args={[0.15, 0.15, 1.2, 16]} />
        <meshStandardMaterial color="#e9c46a" roughness={0.6} transparent opacity={0.85} />
      </mesh>
      {/* Stomach */}
      <mesh position={[0.3, 1.9, 0.4]} scale={[0.5, 0.45, 0.4]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color="#fcbf49" roughness={0.6} transparent opacity={0.85} />
      </mesh>
      {/* Small intestine (a coiled torus) */}
      <mesh position={[0, 0.5, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.45, 0.1, 16, 48]} />
        <meshStandardMaterial color="#fcbf49" roughness={0.6} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0.2, 0.5, 0.6]} rotation={[Math.PI / 2, 0.3, 0]}>
        <torusGeometry args={[0.3, 0.08, 16, 48]} />
        <meshStandardMaterial color="#fcbf49" roughness={0.6} transparent opacity={0.85} />
      </mesh>
      {/* Large intestine (frame shape) */}
      <mesh position={[0, -1.0, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.12, 16, 48]} />
        <meshStandardMaterial color="#d4912e" roughness={0.6} transparent opacity={0.85} />
      </mesh>
      {/* Rectum */}
      <mesh position={[0, -1.8, 0.3]}>
        <cylinderGeometry args={[0.18, 0.15, 0.4, 12]} />
        <meshStandardMaterial color="#a0672e" roughness={0.6} transparent opacity={0.85} />
      </mesh>
      {/* Helper organs */}
      {HELPER_ORGANS.map((o) => (
        <mesh key={o.id} position={o.position} scale={[0.4, 0.15, 0.3]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color={o.color} roughness={0.6} transparent opacity={0.85} />
        </mesh>
      ))}

      {/* Food particle (travels the path) */}
      <mesh ref={foodRef} position={PATH[0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#8b5a2b" emissive="#cc8844" emissiveIntensity={0.4} />
      </mesh>

      {/* Stage labels (only show current + neighbours) */}
      {STAGES.map((s, i) => {
        const isCurrent = i === stageIndex;
        if (!isCurrent) return null;
        return (
          <Billboard key={s.id} position={[s.position[0], s.position[1] + 0.5, s.position[2]]}>
            <Text fontSize={0.22} color="#ffe08a" anchorX="center" anchorY="bottom" outlineWidth={0.015} outlineColor="#000000">
              {s.name}
            </Text>
          </Billboard>
        );
      })}
      {/* Helper organ labels */}
      {HELPER_ORGANS.map((o) => (
        <Billboard key={o.id} position={[o.position[0], o.position[1] + 0.35, o.position[2]]}>
          <Text fontSize={0.14} color="#e09f3e" anchorX="center" anchorY="bottom" outlineWidth={0.01} outlineColor="#000000">
            {o.name}
          </Text>
        </Billboard>
      ))}
    </group>
  );
}

interface DigestionProps {
  stageIndex: number;
  setStageIndex: (n: number) => void;
  autoPlay: boolean;
  setAutoPlay: (b: boolean) => void;
}

export default function Digestion({ stageIndex, setStageIndex, autoPlay, setAutoPlay }: DigestionProps) {
  const stage = STAGES[stageIndex];

  return (
    <group>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 4]} intensity={0.8} />
        <DigestionScene stageIndex={stageIndex} autoPlay={autoPlay} setStageIndex={setStageIndex} />
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={3}
          maxDistance={25}
          target={[0, 1, 0.3]}
          makeDefault
        />
      </Suspense>

      {/* Info panel */}
      <Html position={[0, 0, 0]} center transform={false} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            zIndex: 1000,
            pointerEvents: 'auto',
            width: 330,
            background: 'rgba(20, 8, 24, 0.92)',
            color: 'white',
            padding: '16px 18px',
            borderRadius: 12,
            border: '1px solid rgba(252, 191, 73, 0.5)',
            fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ fontSize: 12, color: '#fcbf49', fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>
            DIGESTION JOURNEY
          </div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 20, fontWeight: 700, color: '#ffe08a' }}>
            {stageIndex + 1}. {stage.name}
          </h3>
          <p style={{ margin: '0 0 10px 0', fontSize: 13, lineHeight: 1.5, color: '#dfe8ff' }}>{stage.description}</p>
          <ul style={{ margin: '0 0 12px 0', paddingLeft: '18px', fontSize: 12.5, lineHeight: 1.5, color: '#c5d3f0' }}>
            {stage.facts.map((f, i) => (
              <li key={i} style={{ marginBottom: 3 }}>{f}</li>
            ))}
          </ul>
          <input
            type="range"
            min={0}
            max={STAGES.length - 1}
            step={1}
            value={stageIndex}
            onChange={(e) => setStageIndex(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#fcbf49', marginBottom: 8 }}
          />
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setStageIndex(Math.max(0, stageIndex - 1))}
              disabled={stageIndex === 0}
              style={{ flex: 1, padding: '6px 0', fontSize: 12, fontWeight: 600, border: '1px solid rgba(91,158,255,0.4)', borderRadius: 5, cursor: stageIndex === 0 ? 'not-allowed' : 'pointer', background: 'transparent', color: stageIndex === 0 ? '#5a6a8a' : '#cfe0ff', opacity: stageIndex === 0 ? 0.5 : 1, fontFamily: 'inherit' }}
            >
              ← Previous
            </button>
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              style={{ flex: 1, padding: '6px 0', fontSize: 12, fontWeight: 600, border: '1px solid rgba(91,158,255,0.4)', borderRadius: 5, cursor: 'pointer', background: autoPlay ? 'rgba(252,191,73,0.25)' : 'transparent', color: autoPlay ? '#ffe08a' : '#cfe0ff', fontFamily: 'inherit' }}
            >
              {autoPlay ? '⏸ Pause' : '▶ Play'}
            </button>
            <button
              onClick={() => setStageIndex(Math.min(STAGES.length - 1, stageIndex + 1))}
              disabled={stageIndex === STAGES.length - 1}
              style={{ flex: 1, padding: '6px 0', fontSize: 12, fontWeight: 600, border: '1px solid rgba(91,158,255,0.4)', borderRadius: 5, cursor: stageIndex === STAGES.length - 1 ? 'not-allowed' : 'pointer', background: 'transparent', color: stageIndex === STAGES.length - 1 ? '#5a6a8a' : '#cfe0ff', opacity: stageIndex === STAGES.length - 1 ? 0.5 : 1, fontFamily: 'inherit' }}
            >
              Next →
            </button>
          </div>
        </div>
      </Html>
    </group>
  );
}

export { STAGES };
