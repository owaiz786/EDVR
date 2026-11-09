import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Text, Html, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import type { BodyData } from '../data/solarSystem';
import { sim } from '../simStore';
import {
  orbitalPosition,
  orbitalMeanMotionPerSecond,
  rotationSpeedPerSecond,
  deterministicPhase,
} from './orbitalMath';
import { SECONDS_PER_YEAR_AT_1X } from '../data/solarSystem';
import { Moon } from './Moon';
import { registerBody, unregisterBody } from './bodyRegistry';

interface PlanetProps {
  data: BodyData;
  scaleMode: 'visual' | 'true';
  showLabels: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
  onFlyTo: () => void;
}

export function Planet({
  data,
  scaleMode,
  showLabels,
  selected,
  onSelect,
  onFlyTo,
}: PlanetProps) {
  const orbitRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  // Deterministic starting phase per body so the layout is the same on every
  // load (better for teachers, and it keeps demo screenshots reproducible).
  const meanAnomalyRef = useRef<number>(deterministicPhase(data.id));
  const [hovered, setHovered] = useState(false);

  // Load textures.
  const texture = useTexture(`/textures/${data.texture}`);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  const bumpMap = data.bumpMap ? useTexture(`/textures/${data.bumpMap}`) : null;
  const cloudsTexture = data.hasClouds
    ? useTexture('/textures/earth_clouds.jpg')
    : null;
  if (cloudsTexture) cloudsTexture.colorSpace = THREE.SRGBColorSpace;
  const ringTexture = data.rings ? useTexture(`/textures/${data.rings.texture}`) : null;

  const radius = scaleMode === 'true' ? data.trueRadius : data.visualRadius;
  const semiMajor = scaleMode === 'true' ? data.trueDistance : data.visualDistance;

  const meanMotion = orbitalMeanMotionPerSecond(
    data.orbitalPeriodYears,
    SECONDS_PER_YEAR_AT_1X,
  );
  const spinSpeed = rotationSpeedPerSecond(
    data.rotationPeriodHours,
    SECONDS_PER_YEAR_AT_1X,
  );

  // Reusable vector for orbit position (avoid allocations in frame loop).
  const pos = useMemo(() => ({ x: 0, z: 0 }), []);

  // Register this planet's orbit group so the fly-to camera can find it.
  useEffect(() => {
    if (orbitRef.current) registerBody(data.id, orbitRef.current);
    return () => unregisterBody(data.id);
  }, [data.id]);

  useFrame((_state, delta) => {
    // Advance the mean anomaly and place the planet on its elliptical orbit.
    meanAnomalyRef.current += meanMotion * sim.timeSpeed * delta;
    if (orbitRef.current) {
      orbitalPosition(meanAnomalyRef.current, semiMajor, data.eccentricity, pos);
      orbitRef.current.position.set(pos.x, 0, pos.z);
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += spinSpeed * sim.timeSpeed * delta;
    }
    if (cloudsRef.current) {
      // Clouds drift a touch faster than the surface.
      cloudsRef.current.rotation.y += spinSpeed * sim.timeSpeed * delta * 1.15;
    }
  });

  const tiltRad = (data.axialTilt * Math.PI) / 180;

  return (
    <group ref={orbitRef}>
      <group rotation={[tiltRad, 0, 0]}>
        <mesh
          ref={meshRef}
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
          <sphereGeometry args={[radius, 64, 64]} />
          <meshStandardMaterial
            map={texture}
            bumpMap={bumpMap || undefined}
            bumpScale={data.bumpScale || 0.04}
            color={hovered ? '#ffffff' : '#ffffff'}
            emissive={data.emissive ? data.color : '#000000'}
            emissiveIntensity={data.emissive ? 1 : 0}
            roughness={data.type === 'dwarf' || data.id === 'mercury' || data.id === 'mars' ? 1 : 0.7}
            metalness={0.0}
          />
        </mesh>

        {/* Earth cloud layer */}
        {data.hasClouds && cloudsTexture && (
          <mesh ref={cloudsRef}>
            <sphereGeometry args={[radius * 1.015, 48, 48]} />
            <meshStandardMaterial
              map={cloudsTexture}
              transparent
              opacity={0.55}
              depthWrite={false}
              roughness={1}
            />
          </mesh>
        )}

        {/* Soft atmosphere glow */}
        {data.atmosphereColor && (
          <mesh scale={[1.05, 1.05, 1.05]}>
            <sphereGeometry args={[radius, 32, 32]} />
            <meshBasicMaterial
              color={data.atmosphereColor}
              transparent
              opacity={0.08}
              side={THREE.BackSide}
              depthWrite={false}
            />
          </mesh>
        )}

        {/* Rings (Saturn, Uranus) */}
        {data.rings && ringTexture && (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius * data.rings.inner, radius * data.rings.outer, 128]} />
            <meshStandardMaterial
              map={ringTexture}
              color="#ffffff"
              side={THREE.DoubleSide}
              transparent
              opacity={data.rings.opacity ?? 0.9}
              depthWrite={false}
              roughness={0.9}
            />
          </mesh>
        )}
      </group>

      {/* Moons orbit this planet */}
      {data.moons?.map((moon) => (
        <Moon
          key={moon.id}
          data={moon}
          scaleMode={scaleMode}
          selected={false}
          onSelect={onSelect}
          onFlyTo={onFlyTo}
        />
      ))}

      {/* Label */}
      {(showLabels || hovered || selected) && (
        <Billboard position={[0, radius + 0.4, 0]}>
          <Text
            fontSize={Math.max(0.32, radius * 0.45)}
            color={selected ? '#ffe08a' : '#ffffff'}
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {data.name}
          </Text>
          <Text
            position={[0, -0.05, 0]}
            fontSize={Math.max(0.16, radius * 0.22)}
            color="#9bb3ff"
            anchorX="center"
            anchorY="top"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {data.type === 'dwarf' ? 'dwarf planet' : data.type}
          </Text>
        </Billboard>
      )}

      {/* Info popup */}
      {selected && (
        <Html
          position={[0, radius + 1.2, 0]}
          center
          occlude={false}
          zIndexRange={[10, 0]}
        >
          <div
            style={{
              background: 'rgba(8, 12, 28, 0.94)',
              color: 'white',
              padding: '16px 18px',
              borderRadius: '12px',
              width: '260px',
              fontFamily: 'Inter, Arial, sans-serif',
              border: '1px solid #5b9eff',
              boxShadow: '0 0 24px rgba(74, 158, 255, 0.4)',
              pointerEvents: 'auto',
            }}
          >
            <h3 style={{ margin: '0 0 4px 0', color: '#5b9eff', fontSize: '19px' }}>
              {data.name}
            </h3>
            <div style={{ fontSize: '12px', color: '#9bb3ff', marginBottom: '10px', textTransform: 'capitalize' }}>
              {data.type}
              {data.type !== 'star' && (
                <>
                  {' · '}
                  {data.semiMajorAxisAU.toFixed(2)} AU from Sun
                  {' · '}
                  {data.orbitalPeriodYears < 1
                    ? `${(data.orbitalPeriodYears * 365.25).toFixed(0)} day year`
                    : `${data.orbitalPeriodYears.toFixed(2)} year orbit`}
                </>
              )}
            </div>
            <p style={{ margin: '0 0 10px 0', fontSize: '13px', lineHeight: '1.5' }}>
              {data.info}
            </p>
            <div style={{ fontSize: '11px', color: '#7fb0ff', fontWeight: 600, marginBottom: '4px' }}>
              Key facts
            </div>
            <ul style={{ margin: '0 0 8px 0', paddingLeft: '18px', fontSize: '12px', lineHeight: '1.5' }}>
              {data.facts.map((f, i) => (
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
                background: 'linear-gradient(135deg, #5b9eff 0%, #667eea 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 8,
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
