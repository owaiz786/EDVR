import { Suspense, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

type View = 'brain' | 'neuron';

const LOBE_INFO: Record<string, { name: string; color: string; function: string; facts: string[] }> = {
  frontal: {
    name: 'Frontal Lobe',
    color: '#ef476f',
    function: 'Thinking, planning, decision-making, personality, and voluntary movement',
    facts: ['Largest lobe of the brain', 'Controls personality and emotions', 'Home to the motor cortex', 'Develops until about age 25'],
  },
  parietal: {
    name: 'Parietal Lobe',
    color: '#ffd166',
    function: 'Touch, temperature, pain, and spatial awareness',
    facts: ['Processes touch and temperature', 'Helps you know where your body is', 'Integrates senses', 'Contains the sensory cortex'],
  },
  temporal: {
    name: 'Temporal Lobe',
    color: '#06d6a0',
    function: 'Hearing, language, memory, and emotion',
    facts: ['Processes sound and hearing', 'Important for memory (hippocampus)', 'Helps understand language', 'Recognises faces'],
  },
  occipital: {
    name: 'Occipital Lobe',
    color: '#118ab2',
    function: 'Vision and visual processing',
    facts: ['Processes what you see', 'Recognises shapes and colours', 'Smallest lobe at the back of the brain', 'Connects to the eyes via the optic nerve'],
  },
  cerebellum: {
    name: 'Cerebellum',
    color: '#9d4edd',
    function: 'Balance, coordination, and fine movement',
    facts: ['Means "little brain" in Latin', 'Coordinates movement', 'Helps you keep your balance', 'Has more neurons than the rest of the brain'],
  },
  brainstem: {
    name: 'Brainstem',
    color: '#777777',
    function: 'Connects brain to spine; controls breathing, heartbeat, and other automatic functions',
    facts: ['Controls breathing and heartbeat', 'You cannot live without it', 'Connects brain to spinal cord', 'Controls sleep and wake cycles'],
  },
};

function BrainScene({ selectedLobe }: { selectedLobe: string | null }) {
  const lobeMat = (key: string, baseColor: string) => {
    const sel = selectedLobe === key;
    return (
      <meshStandardMaterial
        color={sel ? '#ffffff' : baseColor}
        emissive={sel ? baseColor : baseColor}
        emissiveIntensity={sel ? 0.5 : 0.15}
        roughness={0.6}
        transparent
        opacity={sel || selectedLobe === null ? 0.95 : 0.5}
      />
    );
  };

  return (
    <group>
      {/* Cerebrum: two hemispheres, divided into lobes */}
      {/* Right hemisphere (left from viewer's perspective) */}
      <mesh position={[0.45, 0.3, 0]}>
        <sphereGeometry args={[0.55, 32, 32, 0, Math.PI]} />
        {lobeMat('frontal', '#ef476f')}
      </mesh>
      <mesh position={[0.45, 0.3, -0.4]} rotation={[0, Math.PI / 2, 0]}>
        <sphereGeometry args={[0.55, 32, 32, 0, Math.PI]} />
        {lobeMat('parietal', '#ffd166')}
      </mesh>
      <mesh position={[0.45, -0.1, -0.3]} rotation={[0, Math.PI, 0]}>
        <sphereGeometry args={[0.5, 32, 32, 0, Math.PI]} />
        {lobeMat('temporal', '#06d6a0')}
      </mesh>
      <mesh position={[0.45, 0.3, -0.7]} rotation={[0, Math.PI / 2, 0]}>
        <sphereGeometry args={[0.5, 32, 32, 0, Math.PI]} />
        {lobeMat('occipital', '#118ab2')}
      </mesh>
      {/* Left hemisphere (mirror) */}
      <mesh position={[-0.45, 0.3, 0]}>
        <sphereGeometry args={[0.55, 32, 32, Math.PI, Math.PI]} />
        {lobeMat('frontal', '#ef476f')}
      </mesh>
      <mesh position={[-0.45, 0.3, -0.4]} rotation={[0, Math.PI / 2, 0]}>
        <sphereGeometry args={[0.55, 32, 32, Math.PI, Math.PI]} />
        {lobeMat('parietal', '#ffd166')}
      </mesh>
      <mesh position={[-0.45, -0.1, -0.3]} rotation={[0, Math.PI, 0]}>
        <sphereGeometry args={[0.5, 32, 32, Math.PI, Math.PI]} />
        {lobeMat('temporal', '#06d6a0')}
      </mesh>
      <mesh position={[-0.45, 0.3, -0.7]} rotation={[0, Math.PI / 2, 0]}>
        <sphereGeometry args={[0.5, 32, 32, Math.PI, Math.PI]} />
        {lobeMat('occipital', '#118ab2')}
      </mesh>

      {/* Cerebellum (back-bottom) */}
      <mesh position={[0, -0.3, -0.7]}>
        <sphereGeometry args={[0.3, 24, 24]} />
        {lobeMat('cerebellum', '#9d4edd')}
      </mesh>

      {/* Brainstem (extending down from cerebellum) */}
      <mesh position={[0, -0.7, -0.4]}>
        <cylinderGeometry args={[0.12, 0.15, 0.6, 12]} />
        {lobeMat('brainstem', '#777777')}
      </mesh>

      {/* Surface folds (decorative wrinkles) */}
      {Array.from({ length: 12 }).map((_, i) => {
        const theta = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(theta) * 0.55, 0.3 + Math.sin(theta * 2) * 0.2, Math.sin(theta) * 0.55 - 0.2]}>
            <torusGeometry args={[0.3, 0.015, 6, 16, Math.PI * 0.4]} />
            <meshBasicMaterial color="#aa5577" transparent opacity={0.3} />
          </mesh>
        );
      })}

      {/* Labels */}
      <Billboard position={[0.7, 0.6, 0.3]}>
        <Text fontSize={0.15} color="#ff8899" anchorX="center" anchorY="bottom" outlineWidth={0.01} outlineColor="#000000">
          Frontal
        </Text>
      </Billboard>
      <Billboard position={[0.7, 0.6, -0.7]}>
        <Text fontSize={0.15} color="#ffe08a" anchorX="center" anchorY="bottom" outlineWidth={0.01} outlineColor="#000000">
          Parietal
        </Text>
      </Billboard>
      <Billboard position={[0.5, -0.3, -0.2]}>
        <Text fontSize={0.15} color="#80e8c0" anchorX="center" anchorY="bottom" outlineWidth={0.01} outlineColor="#000000">
          Temporal
        </Text>
      </Billboard>
      <Billboard position={[0.6, 0.4, -1.1]}>
        <Text fontSize={0.15} color="#7fb8d0" anchorX="center" anchorY="bottom" outlineWidth={0.01} outlineColor="#000000">
          Occipital
        </Text>
      </Billboard>
      <Billboard position={[0, -0.5, -0.9]}>
        <Text fontSize={0.15} color="#c88aff" anchorX="center" anchorY="bottom" outlineWidth={0.01} outlineColor="#000000">
          Cerebellum
        </Text>
      </Billboard>
      <Billboard position={[0, -1.1, -0.4]}>
        <Text fontSize={0.15} color="#aaaaaa" anchorX="center" anchorY="bottom" outlineWidth={0.01} outlineColor="#000000">
          Brainstem
        </Text>
      </Billboard>
    </group>
  );
}

function NeuronScene() {
  const signalRef = useRef<THREE.Mesh>(null);
  const tRef = useRef(0);

  useFrame((_, delta) => {
    tRef.current += delta;
    if (signalRef.current) {
      // Signal travels along the axon from left to right, then resets.
      const t = (tRef.current % 2.5) / 2.5;
      signalRef.current.position.x = -2.5 + t * 5.0;
      const opacity = t < 0.05 || t > 0.95 ? 0 : 1;
      (signalRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
  });

  // Build dendrites as branching lines
  const dendrites = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const baseX = -2.5;
      const baseY = 0;
      const len = 0.8 + Math.random() * 0.3;
      const midX = baseX - Math.cos(angle) * len * 0.5;
      const midY = baseY + Math.sin(angle) * len * 0.5;
      const endX = baseX - Math.cos(angle) * len;
      const endY = baseY + Math.sin(angle) * len;
      lines.push([
        new THREE.Vector3(baseX, baseY, 0),
        new THREE.Vector3(midX, midY, 0),
        new THREE.Vector3(endX, endY, 0),
      ]);
      // Small branches off the mid
      for (let j = 0; j < 2; j++) {
        const bAngle = angle + (Math.random() - 0.5) * 1.0;
        lines.push([
          new THREE.Vector3(midX, midY, 0),
          new THREE.Vector3(midX - Math.cos(bAngle) * 0.3, midY + Math.sin(bAngle) * 0.3, 0),
        ]);
      }
    }
    return lines;
  }, []);

  return (
    <group>
      {/* Soma (cell body) */}
      <mesh position={[-2.5, 0, 0]}>
        <sphereGeometry args={[0.4, 24, 24]} />
        <meshStandardMaterial color="#9d4edd" roughness={0.5} emissive="#7209b7" emissiveIntensity={0.2} />
      </mesh>
      {/* Nucleus */}
      <mesh position={[-2.5, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#5a189a" roughness={0.5} />
      </mesh>
      {/* Dendrites (input branches) */}
      {dendrites.map((line, i) => (
        <primitive
          key={`d-${i}`}
          object={new THREE.Line(new THREE.BufferGeometry().setFromPoints(line), new THREE.LineBasicMaterial({ color: '#c77dff', linewidth: 2 }))}
        />
      ))}
      {/* Axon (long output fibre) */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 5.0, 12]} />
        <meshStandardMaterial color="#e0aaff" roughness={0.5} transparent opacity={0.9} />
      </mesh>
      {/* Myelin sheath (segmented insulating beads along the axon) */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-2.0 + i * 0.85, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.4, 12]} />
          <meshStandardMaterial color="#ffd6a5" roughness={0.4} transparent opacity={0.85} />
        </mesh>
      ))}
      {/* Axon terminals (output branches) */}
      {[-0.3, 0, 0.3].map((y) => (
        <mesh key={y} position={[2.7, y, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial color="#c77dff" roughness={0.5} />
        </mesh>
      ))}
      {/* Travelling signal pulse */}
      <mesh ref={signalRef} position={[-2.5, 0, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color="#ffea00" transparent opacity={1} toneMapped={false} />
      </mesh>

      {/* Labels */}
      <Billboard position={[-2.5, 0.7, 0]}>
        <Text fontSize={0.22} color="#c77dff" anchorX="center" anchorY="bottom" outlineWidth={0.015} outlineColor="#000000">
          Soma (cell body)
        </Text>
      </Billboard>
      <Billboard position={[-3.5, 0.8, 0]}>
        <Text fontSize={0.18} color="#c77dff" anchorX="center" anchorY="bottom" outlineWidth={0.012} outlineColor="#000000">
          Dendrites (input)
        </Text>
      </Billboard>
      <Billboard position={[0, 0.4, 0]}>
        <Text fontSize={0.2} color="#e0aaff" anchorX="center" anchorY="bottom" outlineWidth={0.012} outlineColor="#000000">
          Axon (output)
        </Text>
      </Billboard>
      <Billboard position={[-1.0, -0.5, 0]}>
        <Text fontSize={0.14} color="#ffd6a5" anchorX="center" anchorY="bottom" outlineWidth={0.01} outlineColor="#000000">
          Myelin sheath (insulation)
        </Text>
      </Billboard>
      <Billboard position={[3.0, 0.7, 0]}>
        <Text fontSize={0.16} color="#c77dff" anchorX="center" anchorY="bottom" outlineWidth={0.012} outlineColor="#000000">
          Terminals
        </Text>
      </Billboard>
      <Billboard position={[0, 1.2, 0]}>
        <Text fontSize={0.18} color="#ffea00" anchorX="center" anchorY="bottom" outlineWidth={0.012} outlineColor="#000000">
          → Signal pulse travelling along the axon
        </Text>
      </Billboard>
    </group>
  );
}

interface BrainProps {
  view: View;
  selectedLobe: string | null;
  onSelectLobe: (id: string | null) => void;
}

export default function Brain({ view, selectedLobe, onSelectLobe }: BrainProps) {
  return (
    <group>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 4]} intensity={0.8} />
        {view === 'brain' ? (
          <BrainScene selectedLobe={selectedLobe} />
        ) : (
          <NeuronScene />
        )}
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={2}
          maxDistance={20}
          target={[view === 'brain' ? 0 : 0, view === 'brain' ? 0 : 0, 0]}
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
            width: 320,
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
          {view === 'brain' ? (
            selectedLobe && LOBE_INFO[selectedLobe] ? (
              <>
                <h3 style={{ margin: '0 0 6px 0', fontSize: 18, fontWeight: 700, color: LOBE_INFO[selectedLobe].color }}>
                  {LOBE_INFO[selectedLobe].name}
                </h3>
                <p style={{ margin: '0 0 8px 0', fontSize: 13, lineHeight: 1.5, color: '#dfe8ff' }}>
                  <b>Function:</b> {LOBE_INFO[selectedLobe].function}
                </p>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: 12.5, lineHeight: 1.5, color: '#c5d3f0' }}>
                  {LOBE_INFO[selectedLobe].facts.map((f, i) => (
                    <li key={i} style={{ marginBottom: 3 }}>{f}</li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 700, color: '#9d4edd' }}>The Brain</h3>
                <p style={{ margin: '0 0 8px 0', fontSize: 13, lineHeight: 1.5, color: '#dfe8ff' }}>
                  The brain has different regions (lobes), each with specialised jobs. Use the colour key below to learn what each lobe does. Switch to "Neuron zoom" to see how brain cells send signals.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                  {Object.entries(LOBE_INFO).map(([id, l]) => (
                    <button
                      key={id}
                      onClick={() => onSelectLobe(selectedLobe === id ? null : id)}
                      style={{
                        padding: '4px 8px',
                        fontSize: 11,
                        fontWeight: 600,
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                        background: `${l.color}33`,
                        color: l.color,
                        fontFamily: 'inherit',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: l.color, marginRight: 4 }} />
                      {l.name}
                    </button>
                  ))}
                </div>
              </>
            )
          ) : (
            <>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 700, color: '#9d4edd' }}>A Neuron</h3>
              <p style={{ margin: '0 0 8px 0', fontSize: 13, lineHeight: 1.5, color: '#dfe8ff' }}>
                A neuron is a nerve cell. It receives signals through its <b>dendrites</b>, processes them in the <b>soma</b> (cell body), and sends them out along its <b>axon</b>. The yellow pulse shows a signal travelling along the axon.
              </p>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: 12.5, lineHeight: 1.5, color: '#c5d3f0' }}>
                <li>Signals can travel up to 120 m/s</li>
                <li>The myelin sheath acts like insulation, making signals faster</li>
                <li>Your brain has ~86 billion neurons</li>
                <li>Neurons connect to each other at synapses</li>
              </ul>
            </>
          )}
        </div>
      </Html>
    </group>
  );
}
