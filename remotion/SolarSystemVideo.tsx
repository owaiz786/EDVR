import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';

const SCENE_FRAMES = 240; // 8s of scene
const OUTRO_FRAMES = 60;  // 2s standalone outro card

const PLANETS = [
  { name: 'Mercurio', radius: 0.2, color: '#8c8c8c', distance: 4, orbitSpeed: 0.8 },
  { name: 'Venus',    radius: 0.35, color: '#e6c87a', distance: 6, orbitSpeed: 0.6 },
  { name: 'Tierra',   radius: 0.4, color: '#6b93d6', distance: 8, orbitSpeed: 0.5 },
  { name: 'Marte',    radius: 0.3, color: '#c1440e', distance: 10, orbitSpeed: 0.4 },
  { name: 'Jupiter',  radius: 1.0, color: '#d8ca9d', distance: 14, orbitSpeed: 0.2 },
  { name: 'Saturno',  radius: 0.9, color: '#f4d59e', distance: 18, orbitSpeed: 0.15, rings: true },
  { name: 'Urano',    radius: 0.5, color: '#c9eeff', distance: 22, orbitSpeed: 0.1 },
  { name: 'Neptuno',  radius: 0.5, color: '#5b5ddf', distance: 26, orbitSpeed: 0.08 },
];

const OrbitLine = ({ radius }: { radius: number }) => {
  const points: THREE.Vector3[] = [];
  const segments = 128;
  for (let i = 0; i <= segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return (
    <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: '#334155', transparent: true, opacity: 0.6 }))} />
  );
};

const Sun = ({ frame }: { frame: number }) => {
  const rotation = frame * 0.01;
  return (
    <mesh rotation={[0, rotation, 0]}>
      <sphereGeometry args={[1.8, 48, 48]} />
      <meshStandardMaterial color="#ffcc33" emissive="#ffaa00" emissiveIntensity={1.4} />
    </mesh>
  );
};

const Planet = ({ p, frame }: { p: (typeof PLANETS)[number]; frame: number }) => {
  const t = frame / 30;
  const angle = p.orbitSpeed * t * 1.2;
  const x = Math.cos(angle) * p.distance;
  const z = Math.sin(angle) * p.distance;
  return (
    <group position={[x, 0, z]}>
      <mesh rotation={[0, frame * 0.03, 0]}>
        <sphereGeometry args={[p.radius, 32, 32]} />
        <meshStandardMaterial color={p.color} emissive={p.color} emissiveIntensity={0.2} />
      </mesh>
      {p.rings && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[p.radius * 1.4, p.radius * 2, 64]} />
          <meshBasicMaterial color="#c9a86c" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
};

const Stars = () => {
  const positions: number[] = [];
  for (let i = 0; i < 800; i++) {
    const r = 80;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi),
    );
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return (
    <primitive object={new THREE.Points(geometry, new THREE.PointsMaterial({ color: '#ffffff', size: 0.15, sizeAttenuation: true }))} />
  );
};

const Scene = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const cameraRotation = interpolate(frame, [0, SCENE_FRAMES], [0, Math.PI * 0.6], {
    easing: Easing.inOut(Easing.ease),
  });
  const camDistance = 38;
  const camX = Math.sin(cameraRotation) * camDistance;
  const camZ = Math.cos(cameraRotation) * camDistance;
  const camY = interpolate(frame, [0, SCENE_FRAMES], [18, 10], {
    easing: Easing.inOut(Easing.ease),
  });

  const titleOpacity = interpolate(frame, [0, 20, 80, 100], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  const subtitleOpacity = interpolate(frame, [10, 30, 80, 100], [0, 1, 1, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: [camX, camY, camZ], fov: 55 }}
      >
        <ambientLight intensity={0.15} />
        <pointLight position={[0, 0, 0]} intensity={3} distance={100} color="#ffddaa" />
        <Stars />
        <Sun frame={frame} />
        {PLANETS.map((p) => (
          <group key={p.name}>
            <OrbitLine radius={p.distance} />
            <Planet p={p} frame={frame} />
          </group>
        ))}
      </ThreeCanvas>

      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          padding: 60,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: 'white',
        }}
      >
        <div
          style={{
            opacity: titleOpacity,
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: -2,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Solar System VR
        </div>
        <div style={{ opacity: subtitleOpacity, fontSize: 28, marginTop: 12, color: '#cbd5e1' }}>
          Explora el sistema solar en realidad virtual · React Three Fiber + WebXR
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const OutroCard = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const lift = interpolate(frame, [0, 25], [16, 0], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill
      style={{
        background: 'linear-gradient(160deg, #0a0a1a 0%, #050510 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'white',
        gap: 18,
      }}
    >
      <div
        style={{
          opacity: fadeIn,
          transform: `translateY(${lift}px)`,
          fontSize: 22,
          letterSpacing: 4,
          textTransform: 'uppercase',
          color: '#94a3b8',
        }}
      >
        Explóralo en vivo
      </div>
      <div
        style={{
          opacity: fadeIn,
          transform: `translateY(${lift}px)`,
          fontSize: 56,
          fontWeight: 800,
          letterSpacing: -1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        solar-system.victorgalvez.dev
      </div>
    </AbsoluteFill>
  );
};

export const SolarSystemVideo = () => {
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <Sequence from={0} durationInFrames={SCENE_FRAMES}>
        <Scene />
      </Sequence>
      <Sequence from={SCENE_FRAMES} durationInFrames={OUTRO_FRAMES}>
        <OutroCard />
      </Sequence>
    </AbsoluteFill>
  );
};
