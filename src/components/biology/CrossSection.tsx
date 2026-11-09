import { Suspense, useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { OrbitControls, Html, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

// We use Three.js clipping planes to "slice" the body. A single plane clips
// everything below a given height (y), and we move the plane up/down with the
// slider to reveal the cross-section at different levels.
//
// Because clipping planes are global, we create local clipping planes via
// the renderer's `clippingPlanes` property on each material.

interface CrossSectionProps {
  sliceY: number; // height of the slice (0 = bottom, 1 = top)
  axis: 'y' | 'x' | 'z';
}

function CrossSectionScene({ sliceY, axis }: CrossSectionProps) {
  const { gl } = useThree();
  useMemo(() => {
    gl.localClippingEnabled = true;
  }, [gl]);

  // The clipping plane moves based on the slider value.
  // sliceY: 0 → clip everything above y = -5 (feet), so nothing shows above.
  // sliceY: 1 → clip everything above y = +5 (head), so everything shows.
  // We invert so that increasing the slider reveals more of the body.
  const planeNormal = useMemo(() => {
    switch (axis) {
      case 'y': return new THREE.Vector3(0, -1, 0); // clips everything above y = constant
      case 'x': return new THREE.Vector3(-1, 0, 0);
      case 'z': return new THREE.Vector3(0, 0, -1);
    }
  }, [axis]);
  const planeConstant = useMemo(() => {
    // For Y axis: sliceY 0 → clip above -5 (show nothing), 1 → clip above 5 (show all)
    return -5 + sliceY * 10;
  }, [sliceY]);
  const clippingPlanes = useMemo(() => [new THREE.Plane(planeNormal, planeConstant)], [planeNormal, planeConstant]);

  // A material factory that applies clipping + a cross-section highlight colour.
  const organMat = (color: string) => (
    <meshStandardMaterial
      color={color}
      roughness={0.6}
      transparent
      opacity={0.9}
      side={THREE.DoubleSide}
      clippingPlanes={clippingPlanes}
      clipShadows
    />
  );

  // The slice indicator plane (visible ring at the cut)
  const slicePos: [number, number, number] =
    axis === 'y' ? [0, planeConstant, 0] :
    axis === 'x' ? [planeConstant, 0, 0] :
    [0, 0, planeConstant];
  const sliceRot: [number, number, number] =
    axis === 'y' ? [0, 0, 0] :
    axis === 'x' ? [0, 0, Math.PI / 2] :
    [Math.PI / 2, 0, 0];

  return (
    <group>
      {/* Slice indicator ring (shows where the cut is) */}
      <mesh position={slicePos} rotation={sliceRot}>
        <ringGeometry args={[0.9, 1.05, 64]} />
        <meshBasicMaterial color="#ff5a5a" side={THREE.DoubleSide} transparent opacity={0.7} />
      </mesh>
      {/* Slice plane (a faint disc filling the ring) */}
      <mesh position={slicePos} rotation={sliceRot}>
        <circleGeometry args={[0.9, 64]} />
        <meshBasicMaterial color="#ff5a5a" side={THREE.DoubleSide} transparent opacity={0.08} depthWrite={false} />
      </mesh>

      {/* Body parts — each clipped by the plane */}
      {/* Head */}
      <mesh position={[0, 4.2, 0]}>
        <sphereGeometry args={[0.75, 32, 32]} />
        {organMat('#e8c4a0')}
      </mesh>
      {/* Torso (capsule) */}
      <mesh position={[0, 1.5, 0]}>
        <capsuleGeometry args={[0.95, 2.2, 8, 16]} />
        {organMat('#e8c4a0')}
      </mesh>
      {/* Pelvis */}
      <mesh position={[0, -0.5, 0]}>
        <capsuleGeometry args={[0.85, 0.3, 8, 16]} />
        {organMat('#e8c4a0')}
      </mesh>
      {/* Heart */}
      <mesh position={[-0.3, 1.9, 0.4]}>
        <sphereGeometry args={[0.4, 24, 24]} />
        {organMat('#d62828')}
      </mesh>
      {/* Lungs */}
      <mesh position={[-0.9, 2.2, 0.2]} scale={[0.5, 1.4, 0.5]}>
        <sphereGeometry args={[1, 24, 24]} />
        {organMat('#f77f00')}
      </mesh>
      <mesh position={[0.9, 2.2, 0.2]} scale={[0.5, 1.4, 0.5]}>
        <sphereGeometry args={[1, 24, 24]} />
        {organMat('#f77f00')}
      </mesh>
      {/* Liver */}
      <mesh position={[-0.5, 1.1, 0.3]} scale={[0.7, 0.4, 0.4]}>
        <sphereGeometry args={[1, 24, 24]} />
        {organMat('#e09f3e')}
      </mesh>
      {/* Stomach */}
      <mesh position={[0.3, 1.0, 0.4]} scale={[0.6, 0.5, 0.4]}>
        <sphereGeometry args={[1, 24, 24]} />
        {organMat('#fcbf49')}
      </mesh>
      {/* Kidneys */}
      <mesh position={[-0.5, 0.5, -0.3]} scale={[0.3, 0.5, 0.25]}>
        <sphereGeometry args={[1, 24, 24]} />
        {organMat('#2a9d8f')}
      </mesh>
      <mesh position={[0.5, 0.5, -0.3]} scale={[0.3, 0.5, 0.25]}>
        <sphereGeometry args={[1, 24, 24]} />
        {organMat('#2a9d8f')}
      </mesh>
      {/* Intestines */}
      <mesh position={[0, 0.0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.5, 0.06, 16, 48]} />
        {organMat('#fcbf49')}
      </mesh>
      <mesh position={[0, -0.7, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.4, 0.08, 16, 48]} />
        {organMat('#d4912e')}
      </mesh>
      {/* Brain */}
      <mesh position={[0, 4.2, 0]} scale={[0.7, 0.6, 0.7]}>
        <sphereGeometry args={[1, 24, 24]} />
        {organMat('#7209b7')}
      </mesh>
      {/* Spine */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[0, 3.0 - i * 0.45, -0.3]}>
          <cylinderGeometry args={[0.1, 0.1, 0.15, 12]} />
          {organMat('#e0e0e0')}
        </mesh>
      ))}
      {/* Arms */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 1.15, 2.2, 0]} rotation={[0, 0, side * 0.15]}>
          <capsuleGeometry args={[0.18, 1.2, 8, 12]} />
          {organMat('#e8c4a0')}
        </mesh>
      ))}
      {/* Legs */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.45, -1.6, 0]}>
            <capsuleGeometry args={[0.28, 1.8, 8, 12]} />
            {organMat('#e8c4a0')}
          </mesh>
          <mesh position={[side * 0.45, -3.6, 0]}>
            <capsuleGeometry args={[0.22, 1.8, 8, 12]} />
            {organMat('#e8c4a0')}
          </mesh>
        </group>
      ))}

      {/* Slice label */}
      <Billboard position={[1.5, 4.5, 0]}>
        <Text fontSize={0.25} color="#ff5a5a" anchorX="center" anchorY="bottom" outlineWidth={0.015} outlineColor="#000000">
          {axis.toUpperCase()} slice: {(sliceY * 100).toFixed(0)}%
        </Text>
      </Billboard>
    </group>
  );
}

export default function CrossSection({ sliceY, axis }: CrossSectionProps) {
  return (
    <group>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 4]} intensity={0.8} />
        <CrossSectionScene sliceY={sliceY} axis={axis} />
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={3}
          maxDistance={30}
          target={[0, 1, 0]}
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
            border: '1px solid rgba(255, 90, 90, 0.5)',
            fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 700, color: '#ff5a5a' }}>
            Cross-section (MRI-style slice)
          </h3>
          <p style={{ margin: '0 0 10px 0', fontSize: 13, lineHeight: 1.5, color: '#dfe8ff' }}>
            Move the slider to slice through the body and see what is inside at each level — like an MRI scan. Drag the scene to rotate the view.
          </p>
          <div style={{ fontSize: 11, color: '#f093fb', fontWeight: 700, marginBottom: 4 }}>What you can see</div>
          <ul style={{ margin: '0 0 10px 0', paddingLeft: '18px', fontSize: 12.5, lineHeight: 1.5, color: '#c5d3f0' }}>
            <li><span style={{ color: '#d62828' }}>Red</span> — heart</li>
            <li><span style={{ color: '#f77f00' }}>Orange</span> — lungs</li>
            <li><span style={{ color: '#e09f3e' }}>Gold</span> — liver</li>
            <li><span style={{ color: '#fcbf49' }}>Yellow</span> — stomach / intestines</li>
            <li><span style={{ color: '#2a9d8f' }}>Green</span> — kidneys</li>
            <li><span style={{ color: '#7209b7' }}>Purple</span> — brain</li>
            <li><span style={{ color: '#e0e0e0' }}>White</span> — spine</li>
          </ul>
          <div style={{ fontSize: 11, color: '#9a7a9a', marginTop: 4, lineHeight: 1.4 }}>
            Real MRI scans use magnetic fields and radio waves — no actual cutting!
          </div>
        </div>
      </Html>
    </group>
  );
}
