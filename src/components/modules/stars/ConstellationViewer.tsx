import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { CONSTELLATIONS, radecToVec3, type Constellation } from './constellationData';

interface Props {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const SPHERE_RADIUS = 100;

function radecToVec3Tuple(ra: number, dec: number): [number, number, number] {
  return radecToVec3(ra, dec, SPHERE_RADIUS);
}

// Background starfield: a dense scatter of small point stars.
function BackgroundStars() {
  const positions = useMemo(() => {
    const count = 3000;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = SPHERE_RADIUS * 0.99;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi);
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.4} sizeAttenuation transparent opacity={0.8} />
    </points>
  );
}

// One constellation's stars and lines.
function ConstellationMesh({
  data,
  selected,
  onSelect,
}: {
  data: Constellation;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const positions = useMemo(
    () => data.stars.map((s) => radecToVec3Tuple(s.ra, s.dec)),
    [data],
  );

  // Star sizes from magnitude: brighter stars (lower mag) are larger.
  const starSizes = useMemo(
    () => data.stars.map((s) => Math.max(0.6, 3.0 - s.mag * 0.7)),
    [data],
  );

  // Lines: build a single BufferGeometry with all the line segments.
  const lineGeometry = useMemo(() => {
    const pts: number[] = [];
    for (const [a, b] of data.lines) {
      const pa = positions[a];
      const pb = positions[b];
      pts.push(...pa, ...pb);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, [data, positions]);

  const lineColor = selected ? '#ffe08a' : '#9bb3ff';
  const lineOpacity = selected ? 0.95 : 0.4;

  return (
    <group>
      {/* Lines */}
      <primitive
        object={
          new THREE.LineSegments(
            lineGeometry,
            new THREE.LineBasicMaterial({
              color: lineColor,
              transparent: true,
              opacity: lineOpacity,
            }),
          )
        }
      />
      {/* Stars (small spheres) */}
      {positions.map((pos, i) => (
        <mesh
          key={i}
          position={pos}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(data.id);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          <sphereGeometry args={[starSizes[i] * 0.5, 12, 12]} />
          <meshBasicMaterial
            color={selected ? '#fff3c4' : '#ffffff'}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* Star names (only for the brightest when selected) */}
      {selected &&
        data.stars.map((s, i) =>
          s.mag < 2.5 ? (
            <Billboard key={`l-${i}`} position={positions[i]}>
              <Text
                position={[0, starSizes[i] * 0.5 + 0.8, 0]}
                fontSize={1.2}
                color="#cfe0ff"
                anchorX="center"
                anchorY="bottom"
                outlineWidth={0.08}
                outlineColor="#000000"
              >
                {s.name}
              </Text>
            </Billboard>
          ) : null,
        )}
      {/* Constellation name label at the centroid of its stars */}
      <ConstellationLabel data={data} positions={positions} selected={selected} />
    </group>
  );
}

function ConstellationLabel({
  data,
  positions,
  selected,
}: {
  data: Constellation;
  positions: [number, number, number][];
  selected: boolean;
}) {
  const centroid = useMemo(() => {
    const c: [number, number, number] = [0, 0, 0];
    for (const p of positions) {
      c[0] += p[0];
      c[1] += p[1];
      c[2] += p[2];
    }
    c[0] /= positions.length;
    c[1] /= positions.length;
    c[2] /= positions.length;
    // Push out to the sphere surface
    const len = Math.sqrt(c[0] ** 2 + c[1] ** 2 + c[2] ** 2);
    const f = (SPHERE_RADIUS * 1.06) / len;
    return [c[0] * f, c[1] * f, c[2] * f] as [number, number, number];
  }, [positions]);

  return (
    <Billboard position={centroid}>
      <Text
        fontSize={selected ? 3.5 : 2.2}
        color={selected ? '#ffe08a' : '#9bb3ff'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.15}
        outlineColor="#000000"
      >
        {data.name}
      </Text>
    </Billboard>
  );
}

export default function ConstellationViewer({ selectedId, onSelect }: Props) {
  // Slowly rotate the celestial sphere for a gentle "sky moving" feel.
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      <BackgroundStars />
      {CONSTELLATIONS.map((c) => (
        <ConstellationMesh
          key={c.id}
          data={c}
          selected={selectedId === c.id}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}
