import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Text, Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import type { MoonData } from '../data/solarSystem';
import { sim } from '../simStore';
import { moonMeanMotionPerSecond, rotationSpeedPerSecond, deterministicPhase } from './orbitalMath';
import { SECONDS_PER_YEAR_AT_1X } from '../data/solarSystem';
import { registerBody, unregisterBody } from './bodyRegistry';

interface MoonProps {
  data: MoonData;
  scaleMode: 'visual' | 'true';
  selected: boolean;
  onSelect: (id: string) => void;
  onFlyTo: () => void;
}

export function Moon({ data, scaleMode, selected, onSelect, onFlyTo }: MoonProps) {
  const orbitRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const meanAnomalyRef = useRef<number>(deterministicPhase(data.id));
  const [hovered, setHovered] = useState(false);

  const texture = useTexture(`/textures/${data.texture}`);
  texture.colorSpace = THREE.SRGBColorSpace;
  const bumpMap = data.bumpMap ? useTexture(`/textures/${data.bumpMap}`) : null;

  const radius = scaleMode === 'true' ? data.trueRadius : data.visualRadius;
  const orbitDistance = scaleMode === 'true' ? data.trueDistance : data.visualDistance;

  const meanMotion = moonMeanMotionPerSecond(
    data.orbitalPeriodDays,
    SECONDS_PER_YEAR_AT_1X,
  );
  const spinSpeed = rotationSpeedPerSecond(
    data.rotationPeriodHours,
    SECONDS_PER_YEAR_AT_1X,
  );

  // Register this moon's orbit group so the fly-to camera can find it.
  useEffect(() => {
    if (orbitRef.current) registerBody(data.id, orbitRef.current);
    return () => unregisterBody(data.id);
  }, [data.id]);

  useFrame((_state, delta) => {
    // Advance mean anomaly and place the moon on its (near-circular) orbit.
    meanAnomalyRef.current += meanMotion * sim.timeSpeed * delta;
    if (orbitRef.current) {
      const angle = meanAnomalyRef.current;
      orbitRef.current.position.set(
        Math.cos(angle) * orbitDistance,
        0,
        Math.sin(angle) * orbitDistance,
      );
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += spinSpeed * sim.timeSpeed * delta;
    }
  });

  return (
    <group ref={orbitRef}>
      <mesh
        ref={meshRef}
        rotation={[(data.axialTilt * Math.PI) / 180, 0, 0]}
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
          onSelect(data.id);
        }}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          map={texture}
          bumpMap={bumpMap || undefined}
          bumpScale={data.bumpScale || 0.03}
          color={hovered ? '#ffffff' : data.color}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {(selected || hovered) && (
        <Billboard position={[0, radius + 0.25, 0]}>
          <Text fontSize={0.28} color="#ffffff" anchorX="center" anchorY="bottom" outlineWidth={0.015} outlineColor="#000000">
            {data.name}
          </Text>
        </Billboard>
      )}

      {selected && (
        <Html position={[0, radius + 0.8, 0]} center occlude={false}>
          <div
            style={{
              background: 'rgba(8, 12, 28, 0.92)',
              color: 'white',
              padding: '14px 16px',
              borderRadius: '10px',
              width: '230px',
              fontFamily: 'Inter, Arial, sans-serif',
              border: '1px solid #5b9eff',
              boxShadow: '0 0 20px rgba(74, 158, 255, 0.35)',
              pointerEvents: 'auto',
            }}
          >
            <h3 style={{ margin: '0 0 6px 0', color: '#5b9eff', fontSize: '17px' }}>
              {data.name}
            </h3>
            <div style={{ fontSize: '11px', color: '#9bb3ff', marginBottom: '8px' }}>
              Moon
            </div>
            <p style={{ margin: '0 0 10px 0', fontSize: '13px', lineHeight: '1.5' }}>
              {data.info}
            </p>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', lineHeight: '1.5' }}>
              {data.facts.map((f, i) => (
                <li key={i} style={{ marginBottom: '3px' }}>{f}</li>
              ))}
            </ul>
            <button
              onClick={onFlyTo}
              style={{
                width: '100%',
                padding: '7px 0',
                marginTop: 10,
                fontSize: 12,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #5b9eff 0%, #667eea 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 7,
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(91, 158, 255, 0.4)',
              }}
            >
              Fly camera here
            </button>
            <p
              style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#7a8db0', cursor: 'pointer', textAlign: 'right' }}
              onClick={() => onSelect('__close__')}
            >
              Click empty space to close
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}
