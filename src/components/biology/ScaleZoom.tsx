import { Suspense, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

export type ScaleLevel = 'body' | 'organ' | 'tissue' | 'cell' | 'dna';

export const SCALE_LEVELS: { id: ScaleLevel; name: string; sizeLabel: string; description: string; facts: string[] }[] = [
  {
    id: 'body',
    name: 'Whole Body',
    sizeLabel: '~1.7 m tall',
    description: 'An adult human body is made of about 37 trillion cells, organised into tissues, organs, and systems. Zoom in to see how it is built.',
    facts: ['37 trillion cells', '206 bones', '78 organs', '~5 litres of blood'],
  },
  {
    id: 'organ',
    name: 'Organ (the heart)',
    sizeLabel: '~12 cm long',
    description: 'An organ is made of different tissues working together. The heart is mostly cardiac muscle, with blood vessels, nerves, and connective tissue.',
    facts: ['Made of tissues working together', 'Cardiac muscle pumps blood', 'About the size of your fist', 'Beats 100,000 times a day'],
  },
  {
    id: 'tissue',
    name: 'Tissue (muscle fibres)',
    sizeLabel: '~0.1 mm',
    description: 'A tissue is a group of similar cells doing the same job. Cardiac muscle tissue is made of long, branching muscle fibres that contract together.',
    facts: ['Group of similar cells', 'Cardiac muscle cells branch', 'Cells contract together', 'Connected by gap junctions'],
  },
  {
    id: 'cell',
    name: 'Cell (muscle cell)',
    sizeLabel: '~0.02 mm (20 μm)',
    description: 'The cell is the basic unit of life. Every cell has a membrane, cytoplasm, and a nucleus that contains DNA. Muscle cells are long and striped.',
    facts: ['Basic unit of life', 'Has a nucleus with DNA', 'Cytoplasm + membrane', 'Muscle cells are long and striped'],
  },
  {
    id: 'dna',
    name: 'DNA (the molecule of life)',
    sizeLabel: '~2 nm wide',
    description: 'DNA is the molecule that stores the genetic instructions for building and running a living thing. It is a twisted ladder (double helix) made of four chemical "letters": A, T, G, C.',
    facts: ['Double helix shape', 'Four bases: A, T, G, C', 'Stores genetic instructions', 'About 2 metres of DNA per cell'],
  },
];

// ---------- Body level: whole human figure ----------

function BodyLevel() {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.7, 24, 24]} />
        <meshStandardMaterial color="#e8c4a0" roughness={0.7} />
      </mesh>
      <mesh position={[0, -1.4, 0]}>
        <capsuleGeometry args={[0.85, 2.2, 8, 16]} />
        <meshStandardMaterial color="#e8c4a0" roughness={0.7} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 1.15, -0.4, 0]} rotation={[0, 0, side * 0.15]}>
          <capsuleGeometry args={[0.18, 1.2, 8, 12]} />
          <meshStandardMaterial color="#e8c4a0" roughness={0.7} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.45, -3.4, 0]}>
          <capsuleGeometry args={[0.25, 1.8, 8, 12]} />
          <meshStandardMaterial color="#e8c4a0" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// ---------- Organ level: the heart ----------

function OrganLevel() {
  return (
    <group>
      {/* Heart (4 chambers) */}
      <mesh position={[-0.5, 0.5, 0]}>
        <sphereGeometry args={[0.4, 24, 24]} />
        <meshStandardMaterial color="#ff5a5a" roughness={0.5} />
      </mesh>
      <mesh position={[0.5, 0.5, 0]}>
        <sphereGeometry args={[0.4, 24, 24]} />
        <meshStandardMaterial color="#5a8aff" roughness={0.5} />
      </mesh>
      <mesh position={[-0.4, -0.3, 0]}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshStandardMaterial color="#d62828" roughness={0.5} />
      </mesh>
      <mesh position={[0.4, -0.3, 0]}>
        <sphereGeometry args={[0.45, 24, 24]} />
        <meshStandardMaterial color="#1d3557" roughness={0.5} />
      </mesh>
      {/* Aorta */}
      <mesh position={[0, 1.2, 0.2]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.8, 16]} />
        <meshStandardMaterial color="#b51717" roughness={0.5} />
      </mesh>
      {/* Blood vessel stubs */}
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, -0.8, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.5, 12]} />
          <meshStandardMaterial color={x < 0 ? '#d62828' : '#1d3557'} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// ---------- Tissue level: muscle fibres ----------

function TissueLevel() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.15;
  });
  return (
    <group ref={ref}>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, (i - 4) * 0.4, 0]} rotation={[0, 0, 0]}>
          <capsuleGeometry args={[0.08, 3.0, 8, 12]} />
          <meshStandardMaterial color="#c84545" roughness={0.7} />
        </mesh>
      ))}
      {/* Branching connectors between fibres */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={`b-${i}`} position={[0, (i - 3) * 0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.5, 8]} />
          <meshStandardMaterial color="#a83232" roughness={0.7} transparent opacity={0.7} />
        </mesh>
      ))}
      {/* Stripes (the "striped" look of muscle) */}
      {Array.from({ length: 30 }).map((_, i) => (
        <mesh key={`s-${i}`} position={[0, -1.5 + (i / 30) * 3, 0.09]}>
          <boxGeometry args={[0.18, 0.02, 0.01]} />
          <meshBasicMaterial color="#882222" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// ---------- Cell level: a muscle cell with nucleus ----------

function CellLevel() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.1;
  });
  return (
    <group>
      {/* Cell membrane (elongated capsule) */}
      <mesh ref={ref}>
        <capsuleGeometry args={[1.2, 3.0, 16, 32]} />
        <meshStandardMaterial color="#e8a0a0" roughness={0.5} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      {/* Nucleus (off-centre) */}
      <mesh position={[0.8, 0.5, 0]}>
        <sphereGeometry args={[0.35, 24, 24]} />
        <meshStandardMaterial color="#7209b7" roughness={0.5} emissive="#7209b7" emissiveIntensity={0.2} />
      </mesh>
      {/* Stripes (myofibrils) */}
      {Array.from({ length: 14 }).map((_, i) => (
        <mesh key={i} position={[0, -1.4 + (i / 14) * 2.8, 0.8]}>
          <boxGeometry args={[2.4, 0.05, 0.05]} />
          <meshBasicMaterial color="#aa3030" transparent opacity={0.4} />
        </mesh>
      ))}
      {/* Organelles (small spheres) */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh key={`o-${i}`} position={[Math.cos(a) * 0.7, Math.sin(a) * 1.2, Math.sin(a) * 0.4]}>
            <sphereGeometry args={[0.1, 12, 12]} />
            <meshStandardMaterial color="#9d4edd" roughness={0.5} />
          </mesh>
        );
      })}
    </group>
  );
}

// ---------- DNA level: a double helix ----------

function DnaLevel() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.4;
  });
  // Two helical strands (backbones) + rungs (base pairs)
  const helixPts1 = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * Math.PI * 6;
      pts.push(new THREE.Vector3(Math.cos(t) * 1.0, (i / 100) * 4 - 2, Math.sin(t) * 1.0));
    }
    return pts;
  }, []);
  const helixPts2 = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 100; i++) {
      const t = (i / 100) * Math.PI * 6 + Math.PI; // offset by half a turn
      pts.push(new THREE.Vector3(Math.cos(t) * 1.0, (i / 100) * 4 - 2, Math.sin(t) * 1.0));
    }
    return pts;
  }, []);

  const baseColors = ['#ef476f', '#ffd166', '#06d6a0', '#118ab2']; // A, T, G, C

  return (
    <group ref={ref}>
      {/* Strand 1 (red) */}
      <primitive
        object={new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(helixPts1),
          new THREE.LineBasicMaterial({ color: '#ff5a5a', linewidth: 3 }),
        )}
      />
      {/* Strand 2 (blue) */}
      <primitive
        object={new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(helixPts2),
          new THREE.LineBasicMaterial({ color: '#5a8aff', linewidth: 3 }),
        )}
      />
      {/* Base-pair rungs */}
      {Array.from({ length: 20 }).map((_, i) => {
        const t = (i / 20) * Math.PI * 6;
        const y = (i / 20) * 4 - 2;
        const p1 = new THREE.Vector3(Math.cos(t) * 1.0, y, Math.sin(t) * 1.0);
        const p2 = new THREE.Vector3(Math.cos(t + Math.PI) * 1.0, y, Math.sin(t + Math.PI) * 1.0);
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const color = baseColors[i % 4];
        return (
          <group key={i}>
            <primitive
              object={new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([p1, p2]),
                new THREE.LineBasicMaterial({ color, linewidth: 2 }),
              )}
            />
            <mesh position={mid.toArray() as [number, number, number]}>
              <sphereGeometry args={[0.08, 12, 12]} />
              <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} roughness={0.4} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function LevelRender({ level }: { level: ScaleLevel }) {
  switch (level) {
    case 'body': return <BodyLevel />;
    case 'organ': return <OrganLevel />;
    case 'tissue': return <TissueLevel />;
    case 'cell': return <CellLevel />;
    case 'dna': return <DnaLevel />;
    default: return null;
  }
}

interface ScaleZoomProps {
  levelIndex: number;
  setLevelIndex: (n: number) => void;
}

export default function ScaleZoom({ levelIndex, setLevelIndex }: ScaleZoomProps) {
  const level = SCALE_LEVELS[levelIndex];

  return (
    <group>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 4]} intensity={0.8} />
        <LevelRender level={level.id} />
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={2}
          maxDistance={30}
          target={[0, 0, 0]}
          makeDefault
        />
      </Suspense>

      {/* Scale indicator label */}
      <Billboard position={[0, 3.0, 0]}>
        <Text fontSize={0.3} color="#ffe08a" anchorX="center" anchorY="bottom" outlineWidth={0.02} outlineColor="#000000">
          {level.name} ({level.sizeLabel})
        </Text>
      </Billboard>

      {/* Info panel */}
      <Html position={[0, 0, 0]} center transform={false} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            zIndex: 1000,
            pointerEvents: 'auto',
            width: 340,
            background: 'rgba(20, 8, 24, 0.92)',
            color: 'white',
            padding: '16px 18px',
            borderRadius: 12,
            border: '1px solid rgba(157, 78, 221, 0.5)',
            fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ fontSize: 12, color: '#9d4edd', fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>
            SCALE ZOOM
          </div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: 20, fontWeight: 700, color: '#ffe08a' }}>
            {levelIndex + 1}. {level.name}
          </h3>
          <div style={{ fontSize: 12, color: '#9bb3ff', marginBottom: 8 }}>Size: {level.sizeLabel}</div>
          <p style={{ margin: '0 0 10px 0', fontSize: 13, lineHeight: 1.5, color: '#dfe8ff' }}>{level.description}</p>
          <ul style={{ margin: '0 0 12px 0', paddingLeft: '18px', fontSize: 12.5, lineHeight: 1.5, color: '#c5d3f0' }}>
            {level.facts.map((f, i) => (
              <li key={i} style={{ marginBottom: 3 }}>{f}</li>
            ))}
          </ul>
          <input
            type="range"
            min={0}
            max={SCALE_LEVELS.length - 1}
            step={1}
            value={levelIndex}
            onChange={(e) => setLevelIndex(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#9d4edd', marginBottom: 8 }}
          />
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              onClick={() => setLevelIndex(Math.max(0, levelIndex - 1))}
              disabled={levelIndex === 0}
              style={{ flex: 1, padding: '6px 0', fontSize: 12, fontWeight: 600, border: '1px solid rgba(91,158,255,0.4)', borderRadius: 5, cursor: levelIndex === 0 ? 'not-allowed' : 'pointer', background: 'transparent', color: levelIndex === 0 ? '#5a6a8a' : '#cfe0ff', opacity: levelIndex === 0 ? 0.5 : 1, fontFamily: 'inherit' }}
            >
              ← Zoom out
            </button>
            <button
              onClick={() => setLevelIndex(Math.min(SCALE_LEVELS.length - 1, levelIndex + 1))}
              disabled={levelIndex === SCALE_LEVELS.length - 1}
              style={{ flex: 1, padding: '6px 0', fontSize: 12, fontWeight: 600, border: '1px solid rgba(91,158,255,0.4)', borderRadius: 5, cursor: levelIndex === SCALE_LEVELS.length - 1 ? 'not-allowed' : 'pointer', background: 'transparent', color: levelIndex === SCALE_LEVELS.length - 1 ? '#5a6a8a' : '#cfe0ff', opacity: levelIndex === SCALE_LEVELS.length - 1 ? 0.5 : 1, fontFamily: 'inherit' }}
            >
              Zoom in →
            </button>
          </div>
          <div style={{ fontSize: 11, color: '#9a7a9a', marginTop: 8, lineHeight: 1.4 }}>
            From the whole body (~1.7 m) down to DNA (~2 nm) — a zoom of nearly a billion times!
          </div>
        </div>
      </Html>
    </group>
  );
}
