import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useTexture, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { ModuleHeader } from '../components/ModuleHeader';
import '../App.css';

interface Props {
  onBack: () => void;
}

// ------------------------- Astronomy helpers -------------------------

const TILT = 23.44; // Earth's axial tilt in degrees
const TILT_RAD = (TILT * Math.PI) / 180;
const ORBIT_R = 6; // Earth's orbital radius in scene units
const EARTH_R = 1.5; // Earth's visual radius

// Day-of-year → orbital angle (alpha=0 → December solstice, Earth at +X)
function dayToAlpha(day: number): number {
  return (2 * Math.PI * (day - 355)) / 365;
}

// Subsolar latitude (declination of the Sun) for a given orbital angle.
function subsolarLatitude(day: number): number {
  const alpha = dayToAlpha(day);
  // sin(delta) = -sin(tilt) * cos(alpha)
  return (Math.asin(-Math.sin(TILT_RAD) * Math.cos(alpha)) * 180) / Math.PI;
}

// Earth's rotation angle (around its tilted axis) so that the prime meridian
// faces the Sun at noon local time at the given day & hour.
function earthSpinAngle(day: number, hour: number): number {
  const alpha = dayToAlpha(day);
  // Noon: prime meridian (body +X) points toward the Sun direction
  // (-cos(alpha), 0, -sin(alpha)) in world frame.
  // After tilt (around Z by +tilt), body +X is (cos(tilt), sin(tilt), 0) in world.
  // We need to spin (around body Y, the tilted axis) so that the post-tilt
  // position of body +X aligns with the Sun direction projected into the
  // equatorial plane.
  // Solving gives: spin_noon = atan2(sin(alpha), cos(alpha) * cos(tilt)).
  const spinNoon = Math.atan2(Math.sin(alpha), Math.cos(alpha) * Math.cos(TILT_RAD));
  return spinNoon + ((hour - 12) * Math.PI) / 12;
}

// Day length (in hours) at latitude phi given subsolar latitude delta.
function dayLengthHours(phiDeg: number, deltaDeg: number): number | null {
  const phi = (phiDeg * Math.PI) / 180;
  const delta = (deltaDeg * Math.PI) / 180;
  const x = -Math.tan(phi) * Math.tan(delta);
  if (x > 1) return 24; // polar day
  if (x < -1) return 0; // polar night
  return (2 * (Math.acos(x) * 12)) / Math.PI;
}

function seasonName(day: number): string {
  // Northern hemisphere seasons (approximate).
  if (day >= 355 || day < 80) return 'Winter (Northern Hemisphere)';
  if (day < 172) return 'Spring (Northern Hemisphere)';
  if (day < 266) return 'Summer (Northern Hemisphere)';
  return 'Autumn (Northern Hemisphere)';
}

function monthLabel(day: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  // Rough mapping: each month ~30.44 days, starting Jan 1 = day 0.
  const idx = Math.min(11, Math.floor(day / 30.44));
  const dom = Math.max(1, day - Math.floor(idx * 30.44) + 1);
  return `${months[idx]} ${dom}`;
}

// ------------------------- 3D scene -------------------------

function DayNightScene({
  day,
  hour,
  observerLatitude,
  showCircles,
}: {
  day: number;
  hour: number;
  observerLatitude: number;
  showCircles: boolean;
}) {
  const earthGroupRef = useRef<THREE.Group>(null);
  const tiltGroupRef = useRef<THREE.Group>(null);
  const spinGroupRef = useRef<THREE.Group>(null);
  const observerRef = useRef<THREE.Mesh>(null);
  const sunDirRef = useRef<THREE.ArrowHelper | null>(null);
  const sunLightRef = useRef<THREE.PointLight>(null);

  const earthTexture = useTexture('/textures/earth.jpg');
  earthTexture.colorSpace = THREE.SRGBColorSpace;
  const earthNightTexture = useTexture('/textures/earth_clouds.jpg');
  // Reuse clouds texture as a subtle "city lights" stand-in on the dark side.

  const alpha = dayToAlpha(day);
  const earthPos: [number, number, number] = [
    Math.cos(alpha) * ORBIT_R,
    0,
    Math.sin(alpha) * ORBIT_R,
  ];

  const spin = earthSpinAngle(day, hour);

  // Observer position in body frame (latitude phi, longitude 0).
  const phi = (observerLatitude * Math.PI) / 180;
  const obsBody = useMemo(
    () => new THREE.Vector3(Math.cos(phi), Math.sin(phi), 0),
    [phi],
  );

  useFrame(() => {
    if (sunLightRef.current) {
      // Sun light at origin, so it lights the side of Earth facing the Sun.
      sunLightRef.current.position.set(0, 0, 0);
    }
    if (spinGroupRef.current) {
      spinGroupRef.current.rotation.y = spin;
    }
    // Sun direction arrow from Earth toward Sun
    if (sunDirRef.current) {
      const dir = new THREE.Vector3(-earthPos[0], -earthPos[1], -earthPos[2]).normalize();
      sunDirRef.current.position.set(0, 0, 0);
      sunDirRef.current.setDirection(dir);
      sunDirRef.current.setLength(EARTH_R * 2.5, EARTH_R * 0.6, EARTH_R * 0.4);
    }
  });

  // Build the Sun-direction arrow once
  if (sunDirRef.current === null) {
    sunDirRef.current = new THREE.ArrowHelper(
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(0, 0, 0),
      EARTH_R * 2.5,
      0xffd966,
      EARTH_R * 0.6,
      EARTH_R * 0.4,
    );
  }

  return (
    <group ref={earthGroupRef} position={earthPos}>
      {/* Earth with axial tilt + spin */}
      <group ref={tiltGroupRef} rotation={[0, 0, TILT_RAD]}>
        <group ref={spinGroupRef}>
          <mesh>
            <sphereGeometry args={[EARTH_R, 64, 64]} />
            <meshStandardMaterial
              map={earthTexture}
              emissiveMap={earthNightTexture}
              emissive="#9bc3ff"
              emissiveIntensity={0.15}
              roughness={0.7}
              metalness={0}
            />
          </mesh>
          {/* Observer marker (small cone pointing outward from surface) */}
          <mesh
            ref={observerRef}
            position={obsBody.clone().multiplyScalar(EARTH_R * 1.04).toArray() as [number, number, number]}
            // Orient the cone so its tip points along the surface normal (radially out).
            rotation={[0, 0, 0]}
          >
            <coneGeometry args={[0.07, 0.22, 12]} />
            <meshStandardMaterial color="#ff4d4d" emissive="#ff4d4d" emissiveIntensity={0.6} />
          </mesh>
          {/* The cone needs to point outward. Cone default points +Y; rotate
              so +Y aligns with the observer's body position. */}
          <ObserverCone latitude={observerLatitude} />

          {/* Polar circles & equator lines */}
          {showCircles && <LatitudeLines />}
        </group>
      </group>

      {/* Sun-direction arrow (in world frame, from Earth's center toward Sun) */}
      <primitive object={sunDirRef.current!} />

      {/* Sun + light (Sun is at the origin of the world, not the Earth group) */}
    </group>
  );
}

// A small red cone placed at the observer's latitude, pointing radially
// outward, that follows Earth's spin.
function ObserverCone({ latitude }: { latitude: number }) {
  const phi = (latitude * Math.PI) / 180;
  const pos = new THREE.Vector3(Math.cos(phi), Math.sin(phi), 0).multiplyScalar(EARTH_R * 1.18);
  // Make the cone (default +Y) point along the radial direction.
  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    pos.clone().normalize(),
  );
  return (
    <mesh position={pos.toArray() as [number, number, number]} quaternion={quaternion}>
      <coneGeometry args={[0.08, 0.25, 12]} />
      <meshStandardMaterial color="#ff4d4d" emissive="#ff4d4d" emissiveIntensity={0.7} />
    </mesh>
  );
}

// Latitude reference rings: equator, tropics, polar circles.
function LatitudeLines() {
  const rings = [
    { lat: 0, color: '#ffffff', opacity: 0.5, label: 'Equator' },
    { lat: 23.44, color: '#ff9d3a', opacity: 0.55, label: 'Tropic of Cancer' },
    { lat: -23.44, color: '#ff9d3a', opacity: 0.55, label: 'Tropic of Capricorn' },
    { lat: 66.56, color: '#7fd3ff', opacity: 0.55, label: 'Arctic Circle' },
    { lat: -66.56, color: '#7fd3ff', opacity: 0.55, label: 'Antarctic Circle' },
  ];
  return (
    <>
      {rings.map((r) => {
        const lat = (r.lat * Math.PI) / 180;
        const radius = Math.cos(lat) * EARTH_R * 1.005;
        const y = Math.sin(lat) * EARTH_R * 1.005;
        return (
          <mesh key={r.label} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius, 0.012, 8, 96]} />
            <meshBasicMaterial color={r.color} transparent opacity={r.opacity} />
          </mesh>
        );
      })}
    </>
  );
}

// Sun + orbit ring, placed in the world frame (not under Earth's group).
function SunAndOrbit({ day }: { day: number }) {
  const alpha = dayToAlpha(day);
  const orbitPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * ORBIT_R, 0, Math.sin(a) * ORBIT_R));
    }
    return pts;
  }, []);

  const orbitGeom = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    return g;
  }, [orbitPoints]);

  const sunTexture = useTexture('/textures/sun.jpg');
  sunTexture.colorSpace = THREE.SRGBColorSpace;

  // Earth's current position marker on the orbit (a small dot)
  return (
    <>
      {/* Sun at origin */}
      <mesh>
        <sphereGeometry args={[1.0, 48, 48]} />
        <meshBasicMaterial map={sunTexture} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={3} distance={0} decay={0} color="#fffaf0" />
      <mesh>
        <sphereGeometry args={[1.18, 32, 32]} />
        <meshBasicMaterial color="#FDB813" transparent opacity={0.2} side={THREE.BackSide} depthWrite={false} />
      </mesh>

      {/* Orbit ring */}
      <primitive
        object={
          new THREE.LineLoop(
            orbitGeom,
            new THREE.LineBasicMaterial({ color: '#5b9eff', transparent: true, opacity: 0.4 }),
          )
        }
      />

      {/* Earth position dot on the orbit (so you can see where Earth is) */}
      <mesh position={[Math.cos(alpha) * ORBIT_R, 0, Math.sin(alpha) * ORBIT_R]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color="#5b9eff" />
      </mesh>

      {/* Sun label */}
      <Billboard position={[0, 1.6, 0]}>
        <Text fontSize={0.4} color="#ffe08a" anchorX="center" anchorY="bottom" outlineWidth={0.02} outlineColor="#000000">
          Sun
        </Text>
      </Billboard>
    </>
  );
}

// ------------------------- UI panel -------------------------

function InfoPanel({
  day,
  hour,
  observerLatitude,
}: {
  day: number;
  hour: number;
  observerLatitude: number;
}) {
  const delta = subsolarLatitude(day);
  const dayLen = dayLengthHours(observerLatitude, delta);
  const sunrise = dayLen !== null ? 12 - dayLen / 2 : null;
  const sunset = dayLen !== null ? 12 + dayLen / 2 : null;
  const isPolarDay = dayLen === 24;
  const isPolarNight = dayLen === 0;
  const observerInDaylight =
    sunrise !== null && sunset !== null
      ? hour >= sunrise && hour <= sunset
      : isPolarDay;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        zIndex: 1000,
        width: 290,
        color: 'white',
        fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
        background: 'rgba(8, 12, 28, 0.85)',
        padding: '16px 18px',
        borderRadius: 12,
        border: '1px solid rgba(255, 217, 102, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ fontSize: 12, color: '#ffd966', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
        WHAT YOU'RE SEEING
      </div>
      <div style={{ fontSize: 14, marginBottom: 4 }}>
        <b>Date:</b> {monthLabel(day)}
      </div>
      <div style={{ fontSize: 14, marginBottom: 4 }}>
        <b>Season:</b> {seasonName(day)}
      </div>
      <div style={{ fontSize: 14, marginBottom: 4 }}>
        <b>Sun is directly over:</b> {delta >= 0 ? `${delta.toFixed(1)}° N` : `${Math.abs(delta).toFixed(1)}° S`}{' '}
        <span style={{ color: '#9bb3ff', fontSize: 12 }}>
          ({Math.abs(delta) < 0.5 ? 'Equinox' : Math.abs(delta) > 23 ? 'Solstice' : ''})
        </span>
      </div>
      <div style={{ fontSize: 14, marginBottom: 4 }}>
        <b>Observer latitude:</b> {observerLatitude >= 0 ? `${observerLatitude}° N` : `${Math.abs(observerLatitude)}° S`}
      </div>
      <div style={{ fontSize: 14, marginBottom: 4 }}>
        <b>Day length at observer:</b>{' '}
        {isPolarDay ? (
          <span style={{ color: '#ffd966' }}>24 h — polar day</span>
        ) : isPolarNight ? (
          <span style={{ color: '#7fd3ff' }}>0 h — polar night</span>
        ) : (
          <span>{dayLen!.toFixed(2)} h</span>
        )}
      </div>
      {!isPolarDay && !isPolarNight && (
        <div style={{ fontSize: 14, marginBottom: 4 }}>
          <b>Sunrise / sunset:</b> {fmtHour(sunrise!)} / {fmtHour(sunset!)}
        </div>
      )}
      <div style={{ fontSize: 14, marginBottom: 4 }}>
        <b>Local time at observer:</b> {fmtHour(hour)}{' '}
        <span style={{ color: observerInDaylight ? '#ffd966' : '#7fd3ff', fontSize: 12 }}>
          ({observerInDaylight ? 'daylight' : 'night'})
        </span>
      </div>
      <div style={{ fontSize: 12, color: '#c5d3f0', marginTop: 10, lineHeight: 1.45 }}>
        Earth's axis always points the same way in space (toward Polaris). As Earth orbits, the north pole
        tilts toward the Sun in summer and away in winter — that's why we have seasons.
      </div>
    </div>
  );
}

function fmtHour(h: number): string {
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function ControlsPanel({
  day,
  setDay,
  hour,
  setHour,
  observerLatitude,
  setObserverLatitude,
  showCircles,
  setShowCircles,
  autoPlay,
  setAutoPlay,
}: {
  day: number;
  setDay: (n: number) => void;
  hour: number;
  setHour: (n: number) => void;
  observerLatitude: number;
  setObserverLatitude: (n: number) => void;
  showCircles: boolean;
  setShowCircles: (b: boolean) => void;
  autoPlay: boolean;
  setAutoPlay: (b: boolean) => void;
}) {
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
        <div style={{ fontSize: 13, fontWeight: 700, color: '#ffd966', marginBottom: 14, letterSpacing: 1 }}>
          DAY, NIGHT & SEASONS
        </div>

        {/* Day of year */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: '#9bb3ff', fontWeight: 600 }}>DAY OF YEAR</span>
            <span style={{ fontSize: 12, color: '#ffe08a', fontFamily: 'monospace' }}>
              {monthLabel(day)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={365}
            step={1}
            value={day}
            onChange={(e) => setDay(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#ffd966' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#7a8db0', marginTop: 2 }}>
            <span>Jan 1</span>
            <span>Dec 31</span>
          </div>
        </div>

        {/* Hour of day */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: '#9bb3ff', fontWeight: 600 }}>HOUR OF DAY</span>
            <span style={{ fontSize: 12, color: '#ffe08a', fontFamily: 'monospace' }}>
              {fmtHour(hour)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={24}
            step={0.25}
            value={hour}
            onChange={(e) => setHour(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: '#ffd966' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#7a8db0', marginTop: 2 }}>
            <span>00:00</span>
            <span>12:00</span>
            <span>24:00</span>
          </div>
        </div>

        {/* Observer latitude */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: '#9bb3ff', fontWeight: 600 }}>OBSERVER LATITUDE</span>
            <span style={{ fontSize: 12, color: '#ffe08a', fontFamily: 'monospace' }}>
              {observerLatitude >= 0 ? `${observerLatitude}° N` : `${Math.abs(observerLatitude)}° S`}
            </span>
          </div>
          <input
            type="range"
            min={-90}
            max={90}
            step={1}
            value={observerLatitude}
            onChange={(e) => setObserverLatitude(parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#ff4d4d' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#7a8db0', marginTop: 2 }}>
            <span>90°S</span>
            <span>0°</span>
            <span>90°N</span>
          </div>
        </div>

        {/* Quick latitude buttons */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
          {[
            { label: 'Eq', val: 0 },
            { label: 'Tropic', val: 23 },
            { label: 'Arctic', val: 67 },
            { label: 'Pole', val: 90 },
          ].map((b) => (
            <button
              key={b.label}
              onClick={() => setObserverLatitude(b.val)}
              style={{
                flex: 1,
                padding: '5px 0',
                fontSize: 11,
                fontWeight: 600,
                border: '1px solid rgba(91,158,255,0.4)',
                borderRadius: 5,
                cursor: 'pointer',
                background: observerLatitude === b.val ? 'rgba(91,158,255,0.25)' : 'transparent',
                color: '#cfe0ff',
              }}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Quick season buttons */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
          {[
            { label: 'Mar 21', val: 80 },
            { label: 'Jun 21', val: 172 },
            { label: 'Sep 23', val: 266 },
            { label: 'Dec 21', val: 355 },
          ].map((b) => (
            <button
              key={b.label}
              onClick={() => setDay(b.val)}
              style={{
                flex: 1,
                padding: '5px 0',
                fontSize: 11,
                fontWeight: 600,
                border: '1px solid rgba(255,217,102,0.4)',
                borderRadius: 5,
                cursor: 'pointer',
                background: day === b.val ? 'rgba(255,217,102,0.25)' : 'transparent',
                color: day === b.val ? '#ffe08a' : '#cfe0ff',
              }}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Auto-play */}
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
            checked={autoPlay}
            onChange={(e) => setAutoPlay(e.target.checked)}
            style={{ accentColor: '#ffd966' }}
          />
          Animate (orbit + spin)
        </label>

        {/* Latitude circles */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: '#cfe0ff',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={showCircles}
            onChange={(e) => setShowCircles(e.target.checked)}
            style={{ accentColor: '#ffd966' }}
          />
          Show equator, tropics & polar circles
        </label>
      </div>
    </div>
  );
}

// ------------------------- Page -------------------------

export default function DayNightSeasons({ onBack }: Props) {
  const [day, setDay] = useState(172); // June 21, summer solstice
  const [hour, setHour] = useState(12); // noon
  const [observerLatitude, setObserverLatitude] = useState(45);
  const [showCircles, setShowCircles] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);

  // Animation loop driven by requestAnimationFrame so the slider values can
  // be advanced smoothly without React re-rendering every frame.
  const stateRef = useRef({ day, hour, autoPlay });
  stateRef.current = { day, hour, autoPlay };

  useEffect(() => {
    if (!autoPlay) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const s = stateRef.current;
      if (s.autoPlay) {
        // 1 simulated second = 1 day; orbit at 24 days/sec looks good
        const newDay = (s.day + dt * 30) % 365;
        setDay(newDay);
        setHour(((s.hour + dt * 30 * 24) % 24));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoPlay]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      <ModuleHeader title="Day, Night & Seasons" onBack={onBack} accentColor="#ffd966" />
      <ControlsPanel
        day={day}
        setDay={setDay}
        hour={hour}
        setHour={setHour}
        observerLatitude={observerLatitude}
        setObserverLatitude={setObserverLatitude}
        showCircles={showCircles}
        setShowCircles={setShowCircles}
        autoPlay={autoPlay}
        setAutoPlay={setAutoPlay}
      />
      <InfoPanel day={day} hour={hour} observerLatitude={observerLatitude} />
      <Canvas
        camera={{ position: [0, 14, 16], fov: 50, near: 0.01, far: 5000 }}
        style={{ background: '#000000' }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <SunAndOrbit day={day} />
          <DayNightScene
            day={day}
            hour={hour}
            observerLatitude={observerLatitude}
            showCircles={showCircles}
          />
          <ambientLight intensity={0.12} />
          <OrbitControls
            enablePan
            enableZoom
            enableRotate
            minDistance={4}
            maxDistance={40}
            target={[0, 0, 0]}
            makeDefault
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
