import { Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

type View = 'lungs' | 'alveoli';

function LungsScene({ breathingRate }: { breathingRate: number }) {
  const leftLungRef = useRef<THREE.Mesh>(null);
  const rightLungRef = useRef<THREE.Mesh>(null);
  const tracheaRef = useRef<THREE.Mesh>(null);
  const tRef = useRef(0);

  useFrame((_, delta) => {
    // Breathing cycle: one breath every (60/rate) seconds.
    const breathDuration = 60 / breathingRate;
    tRef.current += delta;
    const cyclePos = (tRef.current % breathDuration) / breathDuration;
    // Inhale: 0 → 0.5 (scale up); exhale: 0.5 → 1 (scale down).
    let scale = 1.0;
    if (cyclePos < 0.5) {
      scale = 1.0 + Math.sin((cyclePos / 0.5) * Math.PI) * 0.25; // 1 → 1.25 → 1
    } else {
      scale = 1.0 + Math.sin(((cyclePos - 0.5) / 0.5) * Math.PI) * 0.0; // hold briefly
      scale = 1.0 - Math.sin(((cyclePos - 0.5) / 0.5) * Math.PI) * 0.0;
      // Smooth: use a sine that goes 1.25 → 0.85 → 1
      scale = 1.0 + Math.cos(((cyclePos - 0.5) / 0.5) * Math.PI) * 0.25;
    }
    // Simpler: scale = 1 + 0.2 * sin(2π * cyclePos) → continuous breathing
    scale = 1.0 + 0.2 * Math.sin(cyclePos * Math.PI * 2);

    if (leftLungRef.current) leftLungRef.current.scale.set(1, scale, 1);
    if (rightLungRef.current) rightLungRef.current.scale.set(1, scale, 1);
    // Trachea stays fixed
  });

  return (
    <group>
      {/* Trachea */}
      <mesh ref={tracheaRef} position={[0, 2.0, 0]}>
        <cylinderGeometry args={[0.18, 0.2, 1.0, 16]} />
        <meshStandardMaterial color="#f4a261" roughness={0.5} />
      </mesh>
      {/* Cartilage rings on trachea */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[0, 2.4 - i * 0.18, 0]}>
          <torusGeometry args={[0.2, 0.025, 8, 16]} />
          <meshStandardMaterial color="#e9c46a" roughness={0.6} />
        </mesh>
      ))}
      {/* Bronchi (split) */}
      {[-0.3, 0.3].map((x) => (
        <mesh key={x} position={[x, 1.3, 0]} rotation={[0, 0, x > 0 ? 0.4 : -0.4]}>
          <cylinderGeometry args={[0.12, 0.1, 0.6, 12]} />
          <meshStandardMaterial color="#f4a261" roughness={0.5} />
        </mesh>
      ))}
      {/* Left lung */}
      <mesh ref={leftLungRef} position={[-0.85, 0.4, 0]} scale={[1, 1, 1]}>
        <sphereGeometry args={[0.6, 32, 32]} />
        <meshStandardMaterial color="#f77f00" roughness={0.7} transparent opacity={0.9} />
      </mesh>
      {/* Right lung (larger, 3 lobes) */}
      <mesh ref={rightLungRef} position={[0.85, 0.4, 0]} scale={[1, 1, 1]}>
        <sphereGeometry args={[0.65, 32, 32]} />
        <meshStandardMaterial color="#f77f00" roughness={0.7} transparent opacity={0.9} />
      </mesh>
      {/* Lobe divisions (visual lines) */}
      {[-0.85, 0.85].map((x) => (
        <mesh key={x} position={[x, 0.4, 0.61]}>
          <torusGeometry args={[0.4, 0.015, 8, 32, Math.PI]} />
          <meshBasicMaterial color="#c0561a" transparent opacity={0.5} />
        </mesh>
      ))}
      {/* Nose/mouth (top) */}
      <mesh position={[0, 3.0, 0.3]}>
        <coneGeometry args={[0.15, 0.3, 12]} />
        <meshStandardMaterial color="#e8c4a0" roughness={0.7} />
      </mesh>
      <Billboard position={[0, 2.7, 0]}>
        <Text fontSize={0.18} color="#ffe08a" anchorX="center" anchorY="bottom" outlineWidth={0.012} outlineColor="#000000">
          Nose / mouth (air in)
        </Text>
      </Billboard>
      <Billboard position={[0, 2.1, 0.25]}>
        <Text fontSize={0.16} color="#fff" anchorX="center" anchorY="bottom" outlineWidth={0.01} outlineColor="#000000">
          Trachea
        </Text>
      </Billboard>
      <Billboard position={[-0.85, -0.3, 0]}>
        <Text fontSize={0.18} color="#ffd966" anchorX="center" anchorY="bottom" outlineWidth={0.012} outlineColor="#000000">
          Left lung
        </Text>
      </Billboard>
      <Billboard position={[0.85, -0.3, 0]}>
        <Text fontSize={0.18} color="#ffd966" anchorX="center" anchorY="bottom" outlineWidth={0.012} outlineColor="#000000">
          Right lung
        </Text>
      </Billboard>
    </group>
  );
}

function AlveoliScene() {
  const tRef = useRef(0);
  const particlesRef = useRef<THREE.Points>(null);
  const COUNT = 200;
  const positions = useRef(new Float32Array(COUNT * 3));
  const colors = useRef(new Float32Array(COUNT * 3));
  const phase = useRef(new Float32Array(COUNT));
  const type = useRef(new Float32Array(COUNT)); // 0 = O2 (green), 1 = CO2 (yellow)

  // Initialize
  for (let i = 0; i < COUNT; i++) {
    phase.current[i] = Math.random();
    type.current[i] = i < COUNT / 2 ? 0 : 1;
    if (type.current[i] === 0) {
      colors.current[i * 3] = 0.2; colors.current[i * 3 + 1] = 0.9; colors.current[i * 3 + 2] = 0.3; // green O2
    } else {
      colors.current[i * 3] = 0.9; colors.current[i * 3 + 1] = 0.7; colors.current[i * 3 + 2] = 0.1; // yellow CO2
    }
  }

  useFrame((_, delta) => {
    tRef.current += delta;
    if (!particlesRef.current) return;
    const posAttr = particlesRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < COUNT; i++) {
      let p = phase.current[i] + delta * 0.3;
      p = p % 1;
      phase.current[i] = p;
      let x = 0, y = 0, z = 0;
      if (type.current[i] === 0) {
        // O2: comes in from the airway (top), enters the alveolus, moves into the blood vessel (bottom)
        if (p < 0.4) {
          y = 3.0 - p * 4 * 2.5;
          x = 0.1 * Math.sin(p * 20);
          z = 0;
        } else if (p < 0.7) {
          // Inside alveolus, drifting down
          const t = (p - 0.4) / 0.3;
          y = 0.5 - t * 1.0;
          x = 0.3 * Math.sin(t * Math.PI) + (Math.random() - 0.5) * 0.1;
          z = 0;
        } else {
          // Into blood vessel (bottom)
          const t = (p - 0.7) / 0.3;
          y = -0.5 - t * 1.5;
          x = -0.3 + t * 0.3;
          z = 0;
        }
      } else {
        // CO2: from blood (bottom) → alveolus → out through airway (top)
        if (p < 0.4) {
          y = -2.0 + p * 4 * 2.0;
          x = -0.1 * Math.sin(p * 15);
          z = 0;
        } else if (p < 0.7) {
          const t = (p - 0.4) / 0.3;
          y = -0.2 + t * 1.0;
          x = 0.3 * Math.sin(t * Math.PI) * -1;
          z = 0;
        } else {
          const t = (p - 0.7) / 0.3;
          y = 0.8 + t * 2.0;
          x = 0.1;
          z = 0;
        }
      }
      posAttr.setXYZ(i, x, y, z);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <group>
      {/* Alveolus (large sac) */}
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial color="#f77f00" roughness={0.6} transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* Inner surface texture (small bumps) */}
      {Array.from({ length: 20 }).map((_, i) => {
        const theta = (i / 20) * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        return (
          <mesh
            key={i}
            position={[
              1.15 * Math.sin(phi) * Math.cos(theta),
              1.15 * Math.cos(phi),
              1.15 * Math.sin(phi) * Math.sin(theta),
            ]}
          >
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#e9c46a" roughness={0.6} />
          </mesh>
        );
      })}
      {/* Airway tube (top) */}
      <mesh position={[0, 2.0, 0]}>
        <cylinderGeometry args={[0.25, 0.4, 1.8, 16]} />
        <meshStandardMaterial color="#f4a261" roughness={0.5} transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* Blood vessel (bottom) */}
      <mesh position={[0, -2.0, 0]} rotation={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.3, 0.3, 1.8, 16]} />
        <meshStandardMaterial color="#d62828" roughness={0.5} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Gas exchange particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions.current, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors.current, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.12} sizeAttenuation vertexColors transparent opacity={0.95} depthWrite={false} />
      </points>

      {/* Labels */}
      <Billboard position={[0, 2.7, 0]}>
        <Text fontSize={0.3} color="#ffe08a" anchorX="center" anchorY="bottom" outlineWidth={0.02} outlineColor="#000000">
          Airway (in/out)
        </Text>
      </Billboard>
      <Billboard position={[0, 0, 1.3]}>
        <Text fontSize={0.4} color="#fff" anchorX="center" anchorY="bottom" outlineWidth={0.025} outlineColor="#000000">
          Alveolus
        </Text>
      </Billboard>
      <Billboard position={[0, -2.7, 0]}>
        <Text fontSize={0.3} color="#ff8888" anchorX="center" anchorY="bottom" outlineWidth={0.02} outlineColor="#000000">
          Blood vessel
        </Text>
      </Billboard>
    </group>
  );
}

interface LungsProps {
  breathingRate: number;
  view: View;
}

export default function Lungs({ breathingRate, view }: LungsProps) {
  return (
    <group>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 4]} intensity={0.8} />
        {view === 'lungs' ? (
          <LungsScene breathingRate={breathingRate} />
        ) : (
          <AlveoliScene />
        )}
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={view === 'lungs' ? 3 : 2}
          maxDistance={view === 'lungs' ? 20 : 15}
          target={[0, view === 'lungs' ? 1 : 0, 0]}
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
            border: '1px solid rgba(247, 127, 0, 0.5)',
            fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          {view === 'lungs' ? (
            <>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 700, color: '#f77f00' }}>The Lungs</h3>
              <p style={{ margin: '0 0 8px 0', fontSize: 13, lineHeight: 1.5, color: '#dfe8ff' }}>
                When you breathe in, your lungs expand (inflate) and fill with air. When you breathe out, they deflate. Air travels through the nose, trachea, and bronchi into tiny sacs called alveoli.
              </p>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: 12.5, lineHeight: 1.5, color: '#c5d3f0' }}>
                <li>You breathe about {breathingRate} times per minute</li>
                <li>~300 million alveoli in your lungs</li>
                <li>The left lung is smaller to fit the heart</li>
                <li>Drag to rotate; switch to "Alveoli zoom" to see gas exchange</li>
              </ul>
            </>
          ) : (
            <>
              <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 700, color: '#f77f00' }}>Alveoli — Gas Exchange</h3>
              <p style={{ margin: '0 0 8px 0', fontSize: 13, lineHeight: 1.5, color: '#dfe8ff' }}>
                Each alveolus is a tiny air sac surrounded by blood vessels. Oxygen (O₂, green) moves from the air into the blood, and carbon dioxide (CO₂, yellow) moves from the blood into the air to be breathed out.
              </p>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: 12.5, lineHeight: 1.5, color: '#c5d3f0' }}>
                <li><span style={{ color: '#33cc33' }}>Green</span> = oxygen (O₂) entering blood</li>
                <li><span style={{ color: '#e6c200' }}>Yellow</span> = carbon dioxide (CO₂) leaving blood</li>
                <li>Walls are only 1 cell thick for fast exchange</li>
                <li>~300 million alveoli give a huge surface area</li>
              </ul>
            </>
          )}
        </div>
      </Html>
    </group>
  );
}
