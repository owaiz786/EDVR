import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Text, Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { SUN, SECONDS_PER_YEAR_AT_1X } from '../data/solarSystem';
import { sim } from '../simStore';
import { registerBody, unregisterBody } from './bodyRegistry';

interface SunProps {
  scaleMode: 'visual' | 'true';
  selected: boolean;
  onSelect: (id: string) => void;
  onFlyTo: () => void;
}

export function Sun({ scaleMode, selected, onSelect, onFlyTo }: SunProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const texture = useTexture('/textures/sun.jpg');
  texture.colorSpace = THREE.SRGBColorSpace;

  // The Sun sits at the origin; register it so the fly-to camera can target it.
  useEffect(() => {
    if (groupRef.current) registerBody(SUN.id, groupRef.current);
    return () => unregisterBody(SUN.id);
  }, []);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      const hoursPerSecond = 8766 / SECONDS_PER_YEAR_AT_1X;
      const rotationPerSecond =
        (2 * Math.PI) / (SUN.rotationPeriodHours * hoursPerSecond);
      meshRef.current.rotation.y += rotationPerSecond * sim.timeSpeed * delta;
    }
  });

  const radius = scaleMode === 'true' ? SUN.trueRadius : SUN.visualRadius;

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        rotation={[0, 0, (SUN.axialTilt * Math.PI) / 180]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(SUN.id);
        }}
      >
        <sphereGeometry args={[radius, 64, 64]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={3} distance={0} decay={0} color="#fffaf0" />
      {/* Soft glow halos */}
      <mesh>
        <sphereGeometry args={[radius * 1.15, 32, 32]} />
        <meshBasicMaterial
          color="#FDB813"
          transparent
          opacity={0.25}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius * 1.4, 32, 32]} />
        <meshBasicMaterial
          color="#FFA500"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* Label */}
      {(selected || hovered) && (
        <Billboard position={[0, radius + 0.5, 0]}>
          <Text fontSize={0.42} color="#ffe08a" anchorX="center" anchorY="bottom" outlineWidth={0.02} outlineColor="#000000">
            Sun
          </Text>
        </Billboard>
      )}

      {/* Info popup */}
      {selected && (
        <Html position={[0, radius + 1.2, 0]} center occlude={false} zIndexRange={[10, 0]}>
          <div
            style={{
              background: 'rgba(8, 12, 28, 0.94)',
              color: 'white',
              padding: '16px 18px',
              borderRadius: '12px',
              width: '260px',
              fontFamily: 'Inter, Arial, sans-serif',
              border: '1px solid #ffd966',
              boxShadow: '0 0 24px rgba(255, 217, 102, 0.4)',
              pointerEvents: 'auto',
            }}
          >
            <h3 style={{ margin: '0 0 4px 0', color: '#ffe08a', fontSize: '19px' }}>Sun</h3>
            <div style={{ fontSize: '12px', color: '#ffb74d', marginBottom: '10px' }}>Star · center of the Solar System</div>
            <p style={{ margin: '0 0 10px 0', fontSize: '13px', lineHeight: '1.5' }}>{SUN.info}</p>
            <div style={{ fontSize: '11px', color: '#ffb74d', fontWeight: 600, marginBottom: '4px' }}>Key facts</div>
            <ul style={{ margin: '0 0 8px 0', paddingLeft: '18px', fontSize: '12px', lineHeight: '1.5' }}>
              {SUN.facts.map((f, i) => (
                <li key={i} style={{ marginBottom: '3px' }}>{f}</li>
              ))}
            </ul>
            <button
              onClick={onFlyTo}
              style={{
                width: '100%',
                padding: '8px 0',
                marginTop: 4,
                fontSize: 13,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #ffb74d 0%, #ff9800 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(255, 152, 0, 0.4)',
              }}
            >
              Fly camera here
            </button>
            <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#7a8db0', cursor: 'pointer', textAlign: 'right' }} onClick={() => onSelect('__close__')}>
              Click empty space to close
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}
