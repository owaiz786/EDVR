import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useTexture, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { ModuleHeader } from '../components/ModuleHeader';
import '../App.css';

interface Props {
  onBack: () => void;
}

// ------------------------- Constants -------------------------

const SUN_DIST = 22; // Sun is far to the +X side
const EARTH_R = 1.6;
const MOON_R = 0.43;
const MOON_ORBIT_R = 4.5; // distance from Earth to Moon (visual)
const ECLIPSE_TOL_DEG = 7; // angular tolerance for "eclipse possible"

// ------------------------- Astronomy helpers -------------------------

// Moon's orbital angle around Earth (theta_moon):
// 0 = Moon between Earth and Sun (New Moon)
// π/2 = Moon at first quarter (perpendicular)
// π = Moon opposite Sun (Full Moon)
// 3π/2 = Moon at third quarter
// The phase angle (from new) equals theta_moon in our setup.

function phaseName(theta: number): string {
  const deg = (theta * 180) / Math.PI;
  // Normalise to [0, 360)
  const d = ((deg % 360) + 360) % 360;
  if (d < 22.5 || d >= 337.5) return 'New Moon';
  if (d < 67.5) return 'Waxing Crescent';
  if (d < 112.5) return 'First Quarter';
  if (d < 157.5) return 'Waxing Gibbous';
  if (d < 202.5) return 'Full Moon';
  if (d < 247.5) return 'Waning Gibbous';
  if (d < 292.5) return 'Last Quarter';
  return 'Waning Crescent';
}

function illuminatedFraction(theta: number): number {
  return (1 - Math.cos(theta)) / 2;
}

// ------------------------- Scene -------------------------

function EclipsesScene({
  moonAngle,
  showShadows,
  setSolarEclipse,
  setLunarEclipse,
  onDragMoon,
}: {
  moonAngle: number;
  showShadows: boolean;
  setSolarEclipse: (b: boolean) => void;
  setLunarEclipse: (b: boolean) => void;
  onDragMoon: (angle: number) => void;
}) {
  const earthTexture = useTexture('/textures/earth.jpg');
  earthTexture.colorSpace = THREE.SRGBColorSpace;
  const moonTexture = useTexture('/textures/moon.jpg');
  moonTexture.colorSpace = THREE.SRGBColorSpace;
  const sunTexture = useTexture('/textures/sun.jpg');
  sunTexture.colorSpace = THREE.SRGBColorSpace;

  const moonGroupRef = useRef<THREE.Group>(null);
  const moonMeshRef = useRef<THREE.Mesh>(null);
  const sunMeshRef = useRef<THREE.Mesh>(null);
  const draggingRef = useRef(false);

  const { camera, gl, raycaster, pointer } = useThree();
  // Orbit-plane raycasting setup
  const orbitPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

  // Compute Moon position
  const moonPos: [number, number, number] = [
    Math.cos(moonAngle) * MOON_ORBIT_R,
    0,
    Math.sin(moonAngle) * MOON_ORBIT_R,
  ];

  // Detect eclipses
  useFrame(() => {
    const deg = ((moonAngle * 180) / Math.PI) % 360;
    const normDeg = ((deg % 360) + 360) % 360;
    const tol = ECLIPSE_TOL_DEG;
    setSolarEclipse(normDeg < tol || normDeg > 360 - tol);
    setLunarEclipse(Math.abs(normDeg - 180) < tol);

    // Slowly rotate Moon + Earth for visual life.
    if (moonMeshRef.current) {
      moonMeshRef.current.rotation.y += 0.001;
    }
    if (sunMeshRef.current) {
      sunMeshRef.current.rotation.y += 0.0005;
    }
  });

  // Drag handling for the Moon: when pointer is down on the Moon mesh,
  // cast a ray onto the orbit plane and convert to an angle around Earth.
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      // Only drag if the click started on the moon (handled by mesh events)
      if (!draggingRef.current) return;
      e.preventDefault();
    };
    const handlePointerMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const rect = gl.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = new THREE.Vector3();
      raycaster.ray.intersectPlane(orbitPlane.current, hit);
      // Convert hit (in world frame) to an angle around Earth (origin) in XZ plane.
      // Moon orbit is in the XZ plane; angle = atan2(z, x) so that:
      //   hit at (+R, 0, 0) → angle 0 (New Moon, between Sun and Earth)
      //   hit at (-R, 0, 0) → angle π (Full Moon, opposite Sun)
      //   hit at (0, 0, +R) → angle π/2 (first quarter)
      //   hit at (0, 0, -R) → angle -π/2 = 3π/2 (third quarter)
      const angle = Math.atan2(hit.z, hit.x);
      onDragMoon(angle);
    };
    const handlePointerUp = () => {
      draggingRef.current = false;
      document.body.style.cursor = 'auto';
    };
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [camera, gl, raycaster, pointer, onDragMoon]);

  return (
    <>
      <ambientLight intensity={0.1} />
      {/* Directional light from the Sun direction (so both Earth and Moon are
          lit from the same side). Sun is at +X far away. */}
      <directionalLight position={[SUN_DIST, 2, 0]} intensity={2.2} color="#fffaf0" />

      {/* Sun (visual only) */}
      <mesh ref={sunMeshRef} position={[SUN_DIST, 0, 0]}>
        <sphereGeometry args={[1.4, 48, 48]} />
        <meshBasicMaterial map={sunTexture} toneMapped={false} />
      </mesh>
      <mesh position={[SUN_DIST, 0, 0]}>
        <sphereGeometry args={[1.65, 32, 32]} />
        <meshBasicMaterial color="#FDB813" transparent opacity={0.2} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <Billboard position={[SUN_DIST, 1.9, 0]}>
        <Text fontSize={0.45} color="#ffe08a" anchorX="center" anchorY="bottom" outlineWidth={0.02} outlineColor="#000000">
          Sun
        </Text>
      </Billboard>

      {/* Earth (slight axial tilt for visual; not the focus of this scene) */}
      <mesh rotation={[0, 0, (23.44 * Math.PI) / 180]}>
        <sphereGeometry args={[EARTH_R, 64, 64]} />
        <meshStandardMaterial map={earthTexture} roughness={0.7} metalness={0} />
      </mesh>
      <Billboard position={[0, EARTH_R + 0.5, 0]}>
        <Text fontSize={0.4} color="#9bb3ff" anchorX="center" anchorY="bottom" outlineWidth={0.02} outlineColor="#000000">
          Earth
        </Text>
      </Billboard>

      {/* Moon orbit ring (a faint line) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[MOON_ORBIT_R - 0.02, MOON_ORBIT_R + 0.02, 128]} />
        <meshBasicMaterial color="#5b9eff" transparent opacity={0.18} side={THREE.DoubleSide} />
      </mesh>

      {/* Moon (draggable) */}
      <group ref={moonGroupRef} position={moonPos}>
        <mesh
          ref={moonMeshRef}
          onPointerDown={(e) => {
            e.stopPropagation();
            draggingRef.current = true;
            document.body.style.cursor = 'grabbing';
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = 'grab';
          }}
          onPointerOut={() => {
            if (!draggingRef.current) document.body.style.cursor = 'auto';
          }}
        >
          <sphereGeometry args={[MOON_R, 48, 48]} />
          <meshStandardMaterial map={moonTexture} roughness={1} metalness={0} />
        </mesh>
        <Billboard position={[0, MOON_R + 0.3, 0]}>
          <Text fontSize={0.3} color="#e0e0e0" anchorX="center" anchorY="bottom" outlineWidth={0.015} outlineColor="#000000">
            Moon (drag me)
          </Text>
        </Billboard>
      </group>

      {/* Shadow cones */}
      {showShadows && (
        <>
          {/* Moon's shadow cone: from Moon, extending away from the Sun (i.e., in -X direction). */}
          <MoonShadowCone moonPos={moonPos} />
          {/* Earth's shadow cone: from Earth, extending away from the Sun (i.e., in -X direction). */}
          <EarthShadowCone />
        </>
      )}
    </>
  );
}

// Cone from a position, extending in -X direction (away from the Sun at +X).
// Real shadow cones are extremely long and narrow; we use a stylised shape.
function MoonShadowCone({ moonPos }: { moonPos: [number, number, number] }) {
  const length = MOON_ORBIT_R + 6; // long enough to (visually) reach past Earth
  const r1 = MOON_R * 0.8; // near side of the cone (umbra)
  // We model the umbra (dark inner shadow) as a cone narrowing away from Sun.
  return (
    <mesh
      position={[moonPos[0] - length / 2, moonPos[1], moonPos[2]]}
      rotation={[0, 0, -Math.PI / 2]}
    >
      <coneGeometry args={[r1, length, 24, 1, true]} />
      <meshBasicMaterial color="#000000" transparent opacity={0.45} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

function EarthShadowCone() {
  const length = MOON_ORBIT_R + 6;
  const r1 = EARTH_R * 1.4; // Earth's umbra at the near side
  return (
    <mesh position={[-length / 2, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
      <coneGeometry args={[r1, length, 24, 1, true]} />
      <meshBasicMaterial color="#00003a" transparent opacity={0.45} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

// ------------------------- Moon phase canvas (2D) -------------------------

function MoonPhaseCanvas({ theta, size = 130 }: { theta: number; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);
    const cx = W / 2;
    const cy = H / 2;
    const R = Math.min(W, H) / 2 - 6;

    // Dark Moon base
    ctx.fillStyle = '#1a1a1f';
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();

    // Illuminated part
    const isWaxing = theta >= 0 && theta <= Math.PI;
    const w = R * Math.cos(theta); // signed horizontal semi-axis
    const absW = Math.abs(w);

    ctx.fillStyle = '#f0ecdc';
    ctx.beginPath();
    if (isWaxing) {
      // Right half-circle: from top to bottom, through right (anticlockwise=false = clockwise = increasing angle = -π/2 → 0 → π/2)
      ctx.arc(cx, cy, R, -Math.PI / 2, Math.PI / 2, false);
      // Terminator half-ellipse: from bottom to top, through (cx + w, cy)
      //   w > 0 (waxing crescent): pass through right → anticlockwise=true (decreasing angle = π/2 → 0 → -π/2)
      //   w < 0 (waxing gibbous): pass through left → anticlockwise=false (increasing angle = π/2 → π → 3π/2)
      ctx.ellipse(cx, cy, absW, R, 0, Math.PI / 2, -Math.PI / 2, w > 0);
    } else {
      // Waning: left half-circle, from top to bottom, through left (anticlockwise=true)
      ctx.arc(cx, cy, R, -Math.PI / 2, Math.PI / 2, true);
      // Terminator: from bottom to top
      //   w > 0 (waning gibbous): pass through right → anticlockwise=true
      //   w < 0 (waning crescent): pass through left → anticlockwise=false
      ctx.ellipse(cx, cy, absW, R, 0, Math.PI / 2, -Math.PI / 2, w > 0);
    }
    ctx.closePath();
    ctx.fill();

    // Outline
    ctx.strokeStyle = '#9bb3ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
  }, [theta]);

  return (
    <canvas
      ref={canvasRef}
      width={size * 2}
      height={size * 2}
      style={{ width: size, height: size, display: 'block' }}
    />
  );
}

// ------------------------- UI panels -------------------------

function PhaseInfoPanel({
  moonAngle,
  solarEclipse,
  lunarEclipse,
}: {
  moonAngle: number;
  solarEclipse: boolean;
  lunarEclipse: boolean;
}) {
  const name = phaseName(moonAngle);
  const frac = illuminatedFraction(moonAngle);
  const pct = Math.round(frac * 100);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        zIndex: 1000,
        width: 300,
        color: 'white',
        fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
        background: 'rgba(8, 12, 28, 0.88)',
        padding: '16px 18px',
        borderRadius: 12,
        border: '1px solid rgba(91, 158, 255, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ fontSize: 12, color: '#9bb3ff', fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>
        MOON PHASE (VIEW FROM EARTH)
      </div>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12 }}>
        <div
          style={{
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '50%',
            padding: 4,
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <MoonPhaseCanvas theta={moonAngle} size={120} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#ffe08a', marginBottom: 4 }}>{name}</div>
          <div style={{ fontSize: 13, color: '#c5d3f0' }}>
            Illuminated: <b>{pct}%</b>
          </div>
        </div>
      </div>

      {/* Eclipse warnings */}
      {solarEclipse && (
        <div
          style={{
            marginTop: 8,
            padding: '8px 12px',
            background: 'rgba(255, 90, 90, 0.15)',
            border: '1px solid rgba(255, 90, 90, 0.5)',
            borderRadius: 8,
            fontSize: 13,
            color: '#ffb0b0',
          }}
        >
          ⚠️ <b>Solar eclipse is possible!</b> The Moon's shadow can reach Earth.
        </div>
      )}
      {lunarEclipse && (
        <div
          style={{
            marginTop: 8,
            padding: '8px 12px',
            background: 'rgba(255, 130, 90, 0.15)',
            border: '1px solid rgba(255, 130, 90, 0.5)',
            borderRadius: 8,
            fontSize: 13,
            color: '#ffd0a0',
          }}
        >
          🌘 <b>Lunar eclipse is possible!</b> The Moon is inside Earth's shadow.
        </div>
      )}
      {!solarEclipse && !lunarEclipse && (
        <div style={{ fontSize: 12, color: '#7a8db0', marginTop: 8, lineHeight: 1.4 }}>
          Drag the Moon (or use the slider) to find eclipses. They only happen when the Moon is nearly
          lined up with the Sun and Earth.
        </div>
      )}
    </div>
  );
}

function ControlsPanel({
  moonAngle,
  setMoonAngle,
  showShadows,
  setShowShadows,
  autoRotate,
  setAutoRotate,
}: {
  moonAngle: number;
  setMoonAngle: (n: number) => void;
  showShadows: boolean;
  setShowShadows: (b: boolean) => void;
  autoRotate: boolean;
  setAutoRotate: (b: boolean) => void;
}) {
  const deg = (((moonAngle * 180) / Math.PI) % 360 + 360) % 360;
  return (
    <div
      style={{
        position: 'absolute',
        top: 70,
        right: 16,
        zIndex: 1000,
        width: 280,
        pointerEvents: 'auto',
        fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
      }}
    >
      <div
        style={{
          background: 'rgba(8, 12, 28, 0.85)',
          border: '1px solid rgba(91, 158, 255, 0.35)',
          borderRadius: 12,
          color: 'white',
          padding: 16,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: '#9bb3ff', marginBottom: 14, letterSpacing: 1 }}>
          ECLIPSES & MOON PHASES
        </div>

        {/* Moon orbital angle */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: '#9bb3ff', fontWeight: 600 }}>MOON POSITION</span>
            <span style={{ fontSize: 12, color: '#ffe08a', fontFamily: 'monospace' }}>
              {deg.toFixed(0)}°
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={deg}
            onChange={(e) => setMoonAngle((parseFloat(e.target.value) * Math.PI) / 180)}
            style={{ width: '100%', accentColor: '#5b9eff' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#7a8db0', marginTop: 2 }}>
            <span>New</span>
            <span>1st Q</span>
            <span>Full</span>
            <span>3rd Q</span>
            <span>New</span>
          </div>
        </div>

        {/* Quick phase jumps */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
          {[
            { label: 'New', val: 0 },
            { label: '1st Q', val: 90 },
            { label: 'Full', val: 180 },
            { label: '3rd Q', val: 270 },
          ].map((b) => (
            <button
              key={b.label}
              onClick={() => setMoonAngle((b.val * Math.PI) / 180)}
              style={{
                flex: '1 1 45%',
                padding: '5px 0',
                fontSize: 11,
                fontWeight: 600,
                border: '1px solid rgba(91,158,255,0.4)',
                borderRadius: 5,
                cursor: 'pointer',
                background:
                  Math.abs(deg - b.val) < 3 ? 'rgba(91,158,255,0.25)' : 'transparent',
                color: Math.abs(deg - b.val) < 3 ? '#ffe08a' : '#cfe0ff',
              }}
            >
              {b.label}
            </button>
          ))}
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: '#cfe0ff',
            cursor: 'pointer',
            marginBottom: 8,
          }}
        >
          <input
            type="checkbox"
            checked={showShadows}
            onChange={(e) => setShowShadows(e.target.checked)}
            style={{ accentColor: '#5b9eff' }}
          />
          Show shadow cones
        </label>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: '#cfe0ff',
            cursor: 'pointer',
            marginBottom: 8,
          }}
        >
          <input
            type="checkbox"
            checked={autoRotate}
            onChange={(e) => setAutoRotate(e.target.checked)}
            style={{ accentColor: '#5b9eff' }}
          />
          Orbit the Moon automatically
        </label>

        <div style={{ fontSize: 12, color: '#9bb3ff', marginTop: 8, lineHeight: 1.4 }}>
          Tip: you can also drag the Moon directly in the 3D scene to set its position.
        </div>
      </div>
    </div>
  );
}

// ------------------------- Page -------------------------

export default function EclipsesMoonPhases({ onBack }: Props) {
  const [moonAngle, setMoonAngle] = useState(Math.PI / 4); // waxing crescent
  const [showShadows, setShowShadows] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [solarEclipse, setSolarEclipse] = useState(false);
  const [lunarEclipse, setLunarEclipse] = useState(false);

  // Auto-rotate the Moon.
  useEffect(() => {
    if (!autoRotate) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setMoonAngle((a) => (a + dt * 0.4) % (Math.PI * 2));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoRotate]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      <ModuleHeader title="Eclipses & Moon Phases" onBack={onBack} />
      <ControlsPanel
        moonAngle={moonAngle}
        setMoonAngle={setMoonAngle}
        showShadows={showShadows}
        setShowShadows={setShowShadows}
        autoRotate={autoRotate}
        setAutoRotate={setAutoRotate}
      />
      <PhaseInfoPanel
        moonAngle={moonAngle}
        solarEclipse={solarEclipse}
        lunarEclipse={lunarEclipse}
      />
      <Canvas
        camera={{ position: [-2, 6, 12], fov: 50, near: 0.01, far: 5000 }}
        style={{ background: '#000000' }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <EclipsesScene
            moonAngle={moonAngle}
            showShadows={showShadows}
            setSolarEclipse={setSolarEclipse}
            setLunarEclipse={setLunarEclipse}
            onDragMoon={setMoonAngle}
          />
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            minDistance={3}
            maxDistance={40}
            target={[0, 0, 0]}
            makeDefault
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
