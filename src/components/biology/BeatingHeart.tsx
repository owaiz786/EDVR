import { Suspense, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

// Heart beat rate in beats per minute.
const DEFAULT_BPM = 70;

interface BeatingHeartProps {
  bpm: number;
  selectedPart: string | null;
  onSelectPart: (id: string | null) => void;
  exercise: boolean;
}

const PART_INFO: Record<string, { name: string; color: string; info: string; facts: string[] }> = {
  la: {
    name: 'Left Atrium',
    color: '#ff5a5a',
    info: 'The left atrium receives oxygen-rich blood from the lungs through the pulmonary veins and pumps it down into the left ventricle.',
    facts: ['Receives oxygenated blood from the lungs', 'Pumps blood to the left ventricle', 'One of the two upper chambers'],
  },
  ra: {
    name: 'Right Atrium',
    color: '#5a8aff',
    info: 'The right atrium receives oxygen-poor blood returning from the body through the vena cava and pumps it down into the right ventricle.',
    facts: ['Receives deoxygenated blood from the body', 'Pumps blood to the right ventricle', 'One of the two upper chambers'],
  },
  lv: {
    name: 'Left Ventricle',
    color: '#d62828',
    info: 'The left ventricle is the strongest chamber. It pumps oxygen-rich blood out through the aorta to the entire body. Its wall is the thickest.',
    facts: ['Thickest muscular wall', 'Pumps blood to the whole body', 'The strongest pump in the heart'],
  },
  rv: {
    name: 'Right Ventricle',
    color: '#1d3557',
    info: 'The right ventricle pumps oxygen-poor blood to the lungs through the pulmonary artery, where it picks up oxygen.',
    facts: ['Pumps blood to the lungs', 'Thinner wall than the left ventricle', 'Sends blood a short distance'],
  },
  valve: {
    name: 'Heart Valves',
    color: '#ffd966',
    info: 'Four valves keep blood flowing in one direction through the heart: the tricuspid, pulmonary, mitral, and aortic valves. They open and close with each beat.',
    facts: ['Four valves total', 'Prevent blood flowing backwards', 'Make the "lub-dub" sound of the heartbeat'],
  },
  aorta: {
    name: 'Aorta',
    color: '#b51717',
    info: 'The aorta is the largest artery. It carries oxygen-rich blood from the left ventricle to the rest of the body.',
    facts: ['Largest artery in the body', 'About 3 cm wide', 'Carries oxygen-rich blood'],
  },
  vena_cava: {
    name: 'Vena Cava',
    color: '#1d3557',
    info: 'The superior and inferior vena cava are the largest veins. They bring oxygen-poor blood from the body back into the right atrium.',
    facts: ['Largest veins in the body', 'Bring blood back to the heart', 'Empty into the right atrium'],
  },
};

function BeatingHeartScene({ bpm, selectedPart, onSelectPart, exercise }: BeatingHeartProps) {
  const groupRef = useRef<THREE.Group>(null);
  const laRef = useRef<THREE.Mesh>(null);
  const raRef = useRef<THREE.Mesh>(null);
  const lvRef = useRef<THREE.Mesh>(null);
  const rvRef = useRef<THREE.Mesh>(null);
  const tRef = useRef(0);

  // Blood flow particle system
  const particles = useRef<THREE.Points>(null);
  const PARTICLE_COUNT = 300;
  const positions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  const colors = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  const phaseRef = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT));
  const typeRef = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT)); // 0 = oxygenated (red), 1 = deoxygenated (blue)

  // Initialize particles
  useMemo(() => {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      phaseRef.current[i] = Math.random();
      typeRef.current[i] = i < PARTICLE_COUNT / 2 ? 0 : 1;
      if (typeRef.current[i] === 0) {
        colors[i * 3] = 1; colors[i * 3 + 1] = 0.2; colors[i * 3 + 2] = 0.2; // red
      } else {
        colors[i * 3] = 0.2; colors[i * 3 + 1] = 0.4; colors[i * 3 + 2] = 1; // blue
      }
    }
  }, [colors]);

  useFrame((_, delta) => {
    // Heartbeat: beat every (60/bpm) seconds.
    const beatDuration = 60 / bpm;
    tRef.current += delta;
    const cyclePos = (tRef.current % beatDuration) / beatDuration; // 0→1 each beat

    // Contraction: atria contract first (cyclePos 0→0.15), then ventricles (0.15→0.35), rest 0.35→1
    let atrialContraction = 0;
    let ventricularContraction = 0;
    if (cyclePos < 0.15) {
      atrialContraction = Math.sin((cyclePos / 0.15) * Math.PI); // 0→1→0
    } else if (cyclePos < 0.35) {
      ventricularContraction = Math.sin(((cyclePos - 0.15) / 0.2) * Math.PI);
    }

    if (laRef.current) {
      const s = 1 - atrialContraction * 0.15;
      laRef.current.scale.set(s, s, s);
    }
    if (raRef.current) {
      const s = 1 - atrialContraction * 0.15;
      raRef.current.scale.set(s, s, s);
    }
    if (lvRef.current) {
      const s = 1 - ventricularContraction * 0.2;
      lvRef.current.scale.set(s, s, s);
    }
    if (rvRef.current) {
      const s = 1 - ventricularContraction * 0.2;
      rvRef.current.scale.set(s, s, s);
    }

    // Update blood flow particles along a path:
    // Deoxygenated (blue): body → vena cava → RA → RV → lungs (top)
    // Oxygenated (red): lungs → LA → LV → aorta → body
    if (particles.current) {
      const posAttr = particles.current.geometry.getAttribute('position') as THREE.BufferAttribute;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        let p = phaseRef.current[i] + delta * 0.15 * (exercise ? 1.6 : 1);
        p = p % 1;
        phaseRef.current[i] = p;
        let x = 0, y = 0, z = 0;
        if (typeRef.current[i] === 1) {
          // Deoxygenated: vena cava (top) → RA → RV → lungs (right side, out)
          if (p < 0.25) {
            // Descending vena cava
            y = 2.0 - p * 4 * 1.2;
            x = -0.05;
            z = 0.5;
          } else if (p < 0.5) {
            // Through RA
            const t = (p - 0.25) / 0.25;
            y = 0.8 + t * 0.3;
            x = 0.6;
            z = 0.3;
          } else if (p < 0.75) {
            // Through RV
            const t = (p - 0.5) / 0.25;
            y = 0.3 - t * 0.5;
            x = 0.6;
            z = 0.3;
          } else {
            // Out to lungs (left and up)
            const t = (p - 0.75) / 0.25;
            y = -0.2 + t * 1.5;
            x = 0.6 - t * 0.8;
            z = 0.3 - t * 0.3;
          }
        } else {
          // Oxygenated: lungs → LA → LV → aorta (up) → body
          if (p < 0.25) {
            // From lungs to LA
            y = 1.3 + p * 4 * 0.5;
            x = -0.6 + p * 4 * 0.3;
            z = 0.0;
          } else if (p < 0.5) {
            // Through LA
            const t = (p - 0.25) / 0.25;
            y = 0.8 + t * 0.2;
            x = -0.6;
            z = 0.3;
          } else if (p < 0.75) {
            // Through LV
            const t = (p - 0.5) / 0.25;
            y = 0.3 - t * 0.4;
            x = -0.6;
            z = 0.3;
          } else {
            // Up aorta
            const t = (p - 0.75) / 0.25;
            y = -0.1 + t * 2.0;
            x = 0.0;
            z = 0.5;
          }
        }
        posAttr.setXYZ(i, x, y, z);
      }
      posAttr.needsUpdate = true;
    }
  });

  const chamberMat = (key: string, baseColor: string) => {
    const sel = selectedPart === key;
    return (
      <meshStandardMaterial
        color={sel ? '#ffffff' : baseColor}
        emissive={sel ? baseColor : baseColor}
        emissiveIntensity={sel ? 0.5 : 0.15}
        roughness={0.5}
        transparent
        opacity={0.9}
      />
    );
  };

  return (
    <group ref={groupRef}>
      {/* Left Atrium (top-left, oxygenated - red) */}
      <mesh
        ref={laRef}
        position={[-0.6, 0.9, 0.3]}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        onClick={(e) => { e.stopPropagation(); onSelectPart(selectedPart === 'la' ? null : 'la'); }}
      >
        <sphereGeometry args={[0.35, 24, 24]} />
        {chamberMat('la', '#ff5a5a')}
      </mesh>
      {/* Right Atrium (top-right, deoxygenated - blue) */}
      <mesh
        ref={raRef}
        position={[0.6, 0.9, 0.3]}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        onClick={(e) => { e.stopPropagation(); onSelectPart(selectedPart === 'ra' ? null : 'ra'); }}
      >
        <sphereGeometry args={[0.35, 24, 24]} />
        {chamberMat('ra', '#5a8aff')}
      </mesh>
      {/* Left Ventricle (bottom-left, oxygenated - dark red, thick wall) */}
      <mesh
        ref={lvRef}
        position={[-0.5, -0.2, 0.3]}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        onClick={(e) => { e.stopPropagation(); onSelectPart(selectedPart === 'lv' ? null : 'lv'); }}
      >
        <sphereGeometry args={[0.5, 24, 24]} />
        {chamberMat('lv', '#d62828')}
      </mesh>
      {/* Right Ventricle (bottom-right, deoxygenated - dark blue) */}
      <mesh
        ref={rvRef}
        position={[0.5, -0.2, 0.3]}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        onClick={(e) => { e.stopPropagation(); onSelectPart(selectedPart === 'rv' ? null : 'rv'); }}
      >
        <sphereGeometry args={[0.42, 24, 24]} />
        {chamberMat('rv', '#1d3557')}
      </mesh>

      {/* Septum (wall between left and right) */}
      <mesh position={[0, 0.3, 0.2]}>
        <boxGeometry args={[0.06, 1.6, 0.3]} />
        <meshStandardMaterial color="#8a5a3a" roughness={0.7} transparent opacity={0.5} />
      </mesh>

      {/* Valves (between atria and ventricles) */}
      {[-0.5, 0.5].map((x) => (
        <mesh
          key={x}
          position={[x, 0.35, 0.3]}
          onClick={(e) => { e.stopPropagation(); onSelectPart(selectedPart === 'valve' ? null : 'valve'); }}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
          <cylinderGeometry args={[0.15, 0.18, 0.06, 16]} />
          {chamberMat('valve', '#ffd966')}
        </mesh>
      ))}

      {/* Aorta (top, curving up) */}
      <mesh
        position={[0, 1.4, 0.5]}
        rotation={[0.2, 0, 0]}
        onClick={(e) => { e.stopPropagation(); onSelectPart(selectedPart === 'aorta' ? null : 'aorta'); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <cylinderGeometry args={[0.12, 0.12, 1.0, 16]} />
        {chamberMat('aorta', '#b51717')}
      </mesh>
      {/* Vena cava (top, on the right side) */}
      <mesh
        position={[0.6, 1.6, 0.4]}
        onClick={(e) => { e.stopPropagation(); onSelectPart(selectedPart === 'vena_cava' ? null : 'vena_cava'); }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { document.body.style.cursor = 'auto'; }}
      >
        <cylinderGeometry args={[0.1, 0.1, 0.8, 16]} />
        {chamberMat('vena_cava', '#1d3557')}
      </mesh>

      {/* Blood flow particles */}
      <points ref={particles}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.08} sizeAttenuation vertexColors transparent opacity={0.95} depthWrite={false} />
      </points>

      {/* Labels */}
      <Billboard position={[-0.6, 1.4, 0.3]}>
        <Text fontSize={0.18} color="#ffaaaa" anchorX="center" anchorY="bottom" outlineWidth={0.012} outlineColor="#000000">
          Left Atrium
        </Text>
      </Billboard>
      <Billboard position={[0.6, 1.4, 0.3]}>
        <Text fontSize={0.18} color="#aabbff" anchorX="center" anchorY="bottom" outlineWidth={0.012} outlineColor="#000000">
          Right Atrium
        </Text>
      </Billboard>
      <Billboard position={[-0.5, -0.95, 0.3]}>
        <Text fontSize={0.18} color="#ffaaaa" anchorX="center" anchorY="bottom" outlineWidth={0.012} outlineColor="#000000">
          Left Ventricle
        </Text>
      </Billboard>
      <Billboard position={[0.5, -0.85, 0.3]}>
        <Text fontSize={0.18} color="#aabbff" anchorX="center" anchorY="bottom" outlineWidth={0.012} outlineColor="#000000">
          Right Ventricle
        </Text>
      </Billboard>
      <Billboard position={[0, 2.1, 0.5]}>
        <Text fontSize={0.16} color="#ff9090" anchorX="center" anchorY="bottom" outlineWidth={0.01} outlineColor="#000000">
          To body (aorta)
        </Text>
      </Billboard>
      <Billboard position={[0.6, 2.2, 0.4]}>
        <Text fontSize={0.16} color="#a0a0ff" anchorX="center" anchorY="bottom" outlineWidth={0.01} outlineColor="#000000">
          From body
        </Text>
      </Billboard>
    </group>
  );
}

function BeatingHeart({ bpm, selectedPart, onSelectPart, exercise }: BeatingHeartProps) {
  return (
    <group>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 4]} intensity={0.8} />
        <directionalLight position={[-3, 2, -2]} intensity={0.3} color="#8899ff" />
        <BeatingHeartScene bpm={bpm} selectedPart={selectedPart} onSelectPart={onSelectPart} exercise={exercise} />
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={2}
          maxDistance={20}
          target={[0, 0.3, 0.3]}
          makeDefault
        />
      </Suspense>

      {/* Info popup */}
      {selectedPart && PART_INFO[selectedPart] && (
        <Html position={[0, 0, 0]} center transform={false} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              zIndex: 1000,
              pointerEvents: 'auto',
              width: 300,
              background: 'rgba(20, 8, 24, 0.92)',
              color: 'white',
              padding: '16px 18px',
              borderRadius: 12,
              border: `1px solid ${PART_INFO[selectedPart].color}66`,
              fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 700, color: PART_INFO[selectedPart].color }}>
              {PART_INFO[selectedPart].name}
            </h3>
            <p style={{ margin: '0 0 10px 0', fontSize: 13, lineHeight: 1.5, color: '#dfe8ff' }}>
              {PART_INFO[selectedPart].info}
            </p>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: 12.5, lineHeight: 1.5, color: '#c5d3f0' }}>
              {PART_INFO[selectedPart].facts.map((f, i) => (
                <li key={i} style={{ marginBottom: 3 }}>{f}</li>
              ))}
            </ul>
          </div>
        </Html>
      )}
    </group>
  );
}

export { BeatingHeart, DEFAULT_BPM, PART_INFO };
