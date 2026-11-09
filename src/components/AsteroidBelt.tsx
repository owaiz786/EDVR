import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ASTEROID_BELT, SECONDS_PER_YEAR_AT_1X } from '../data/solarSystem';
import { sim } from '../simStore';
import { orbitalMeanMotionPerSecond } from './orbitalMath';

interface AsteroidBeltProps {
  scaleMode: 'visual' | 'true';
}

// A ring of ~600 instanced asteroids between Mars and Jupiter.
// We give each asteroid a slightly elliptical orbit at a random radius and
// random orbital phase, then advance them at the Keplerian rate for their
// (approximated circular) orbit. Period ≈ 4.5 years on average.
export function AsteroidBelt({ scaleMode }: AsteroidBeltProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const { inner, outer } =
    scaleMode === 'true'
      ? { inner: ASTEROID_BELT.trueInner, outer: ASTEROID_BELT.trueOuter }
      : { inner: ASTEROID_BELT.visualInner, outer: ASTEROID_BELT.visualOuter };

  // Generate stable per-asteroid parameters.
  const asteroids = useMemo(() => {
    const list: {
      a: number;
      e: number;
      phase: number;
      size: number;
      tilt: number;
      periodYears: number;
    }[] = [];
    // Spread the count out a bit more in true scale so the belt looks wide.
    const count = ASTEROID_BELT.count;
    for (let i = 0; i < count; i++) {
      const a = inner + Math.random() * (outer - inner);
      const e = Math.random() * 0.12;
      const phase = Math.random() * Math.PI * 2;
      const size = ASTEROID_BELT.minSize + Math.random() * (ASTEROID_BELT.maxSize - ASTEROID_BELT.minSize);
      const tilt = (Math.random() - 0.5) * 0.25;
      // Kepler's third law: T ∝ a^(3/2). Use AU-based period (a is in scene units;
      // convert back to AU via AU_UNIT=8 for the period calc).
      const aAU = a / 8;
      const periodYears = Math.pow(aAU, 1.5);
      list.push({ a, e, phase, size, tilt, periodYears });
    }
    return list;
    // Regenerate only when the scale changes (inner/outer change).
  }, [inner, outer]);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;
    for (let i = 0; i < asteroids.length; i++) {
      const ast = asteroids[i];
      ast.phase += orbitalMeanMotionPerSecond(ast.periodYears, SECONDS_PER_YEAR_AT_1X) * sim.timeSpeed * delta;
      const cosP = Math.cos(ast.phase);
      const sinP = Math.sin(ast.phase);
      const b = ast.a * Math.sqrt(1 - ast.e * ast.e);
      // Slight tilt for a 3D belt feel.
      const x = ast.a * (cosP - ast.e);
      const z = b * sinP;
      const y = Math.sin(ast.phase * 2.0) * ast.tilt;
      dummy.position.set(x, y, z);
      const rot = ast.phase * 0.5;
      dummy.rotation.set(rot * 0.3, rot, rot * 0.2);
      const s = ast.size * (scaleMode === 'true' ? 1.4 : 1.0);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, asteroids.length]}
      frustumCulled={false}
    >
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#8a7a66" roughness={1} metalness={0.05} flatShading />
    </instancedMesh>
  );
}
