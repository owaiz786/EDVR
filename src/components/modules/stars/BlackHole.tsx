import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';

// A black hole with a glowing accretion disk and a bright photon ring.
// Distances/sizes are stylised — we prioritise a clear visual over realism.

const EVENT_HORIZON = 1.0;
const PHOTON_RING = 1.5;
const DISK_INNER = 1.7;
const DISK_OUTER = 5.5;
const PARTICLE_COUNT = 2500;

// Custom shader-ish material for the accretion disk: we use a vertex-coloured
// Points cloud so the inner part is hot blue/white and the outer part is cooler
// orange/red, simulating real accretion-disk temperature gradients.
function AccretionDisk() {
  const positions = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Place particles uniformly across an annulus, in the XZ plane with a
      // slight vertical scatter to give the disk some thickness.
      const t = Math.random();
      const r = DISK_INNER + (DISK_OUTER - DISK_INNER) * Math.pow(t, 0.5);
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 0.06 * (DISK_OUTER - r); // thinner outer
      arr[i * 3] = Math.cos(angle) * r;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = Math.sin(angle) * r;
    }
    return arr;
  }, []);

  const colors = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = positions[i * 3];
      const z = positions[i * 3 + 2];
      const r = Math.sqrt(x * x + z * z);
      const t = (r - DISK_INNER) / (DISK_OUTER - DISK_INNER); // 0 inner → 1 outer
      // Hot inner: white-blue; mid: orange-yellow; cool outer: deep red.
      if (t < 0.25) {
        arr[i * 3] = 1; arr[i * 3 + 1] = 0.9; arr[i * 3 + 2] = 1; // white-blue
      } else if (t < 0.6) {
        const k = (t - 0.25) / 0.35;
        arr[i * 3] = 1;
        arr[i * 3 + 1] = 0.9 - k * 0.4;
        arr[i * 3 + 2] = 1 - k * 0.95;
      } else {
        const k = (t - 0.6) / 0.4;
        arr[i * 3] = 1 - k * 0.3;
        arr[i * 3 + 1] = 0.5 - k * 0.35;
        arr[i * 3 + 2] = 0.05;
      }
    }
    return arr;
  }, [positions]);

  // Keplerian rotation speeds per particle, so the inner disk spins faster.
  const speeds = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = positions[i * 3];
      const z = positions[i * 3 + 2];
      const r = Math.sqrt(x * x + z * z);
      // omega = sqrt(GM/r^3); stylised constant.
      arr[i] = 1.2 / Math.pow(r, 1.5);
    }
    return arr;
  }, [positions]);

  const ref = useRef<THREE.Points>(null);
  const angles = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT));
  // Initialise angles from current positions so the disk starts looking right.
  useMemo(() => {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = positions[i * 3];
      const z = positions[i * 3 + 2];
      angles.current[i] = Math.atan2(z, x);
    }
  }, [positions]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const posAttr = ref.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const a = angles.current;
    const s = speeds;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      a[i] += s[i] * delta;
      const r = Math.sqrt(posAttr.getX(i) ** 2 + posAttr.getZ(i) ** 2);
      // The radius doesn't change (stable circular orbits); only the angle does.
      posAttr.setX(i, Math.cos(a[i]) * r);
      posAttr.setZ(i, Math.sin(a[i]) * r);
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.1} sizeAttenuation vertexColors transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// Photon ring — a thin bright ring at the photon sphere radius.
function PhotonRing() {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[PHOTON_RING - 0.05, PHOTON_RING + 0.05, 128]} />
      <meshBasicMaterial color="#ffe08a" side={THREE.DoubleSide} transparent opacity={0.85} toneMapped={false} />
    </mesh>
  );
}

// Event horizon — a black sphere.
function EventHorizon() {
  return (
    <mesh>
      <sphereGeometry args={[EVENT_HORIZON, 32, 32]} />
      <meshBasicMaterial color="#000000" />
    </mesh>
  );
}

// Background stars for context.
function BackgroundStars() {
  const positions = useMemo(() => {
    const count = 3000;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 80 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi);
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" size={0.35} sizeAttenuation transparent opacity={0.75} />
    </points>
  );
}

export default function BlackHole() {
  // Tilt the whole thing slightly so we look at the disk from above the plane.
  return (
    <group rotation={[Math.PI / 6, 0, 0]}>
      <BackgroundStars />
      <EventHorizon />
      <PhotonRing />
      <AccretionDisk />
      <pointLight position={[0, 0, 0]} intensity={0} />
      <Billboard position={[0, DISK_OUTER + 1.5, 0]}>
        <Text fontSize={0.9} color="#ffe08a" anchorX="center" anchorY="bottom" outlineWidth={0.05} outlineColor="#000000">
          Black Hole
        </Text>
      </Billboard>
    </group>
  );
}
