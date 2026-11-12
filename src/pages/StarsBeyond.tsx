import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ModuleHeader } from '../components/ModuleHeader';
import ConstellationViewer from '../components/modules/stars/ConstellationViewer';
import StarLifeCycle, { LIFE_STAGES } from '../components/modules/stars/StarLifeCycle';
import BlackHole from '../components/modules/stars/BlackHole';
import { CONSTELLATIONS } from '../components/modules/stars/constellationData';
import '../App.css';

interface Props {
  onBack: () => void;
}

type SubView = 'constellations' | 'lifecycle' | 'blackhole';

const SUB_VIEWS: { id: SubView; label: string; emoji: string }[] = [
  { id: 'constellations', label: 'Constellations', emoji: '⭐' },
  { id: 'lifecycle', label: 'Star Life Cycle', emoji: '🌟' },
  { id: 'blackhole', label: 'Black Hole', emoji: '🕳️' },
];

// ------------------------- Constellation info panel -------------------------

function ConstellationInfo({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string | null) => void }) {
  const selected = CONSTELLATIONS.find((c) => c.id === selectedId) || null;
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        zIndex: 1000,
        width: 320,
        maxHeight: '70vh',
        overflowY: 'auto',
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
        CONSTELLATIONS
      </div>
      {!selected && (
        <div style={{ fontSize: 13, color: '#c5d3f0', lineHeight: 1.5, marginBottom: 10 }}>
          Click on a constellation's name or its stars in the sky to learn about it. You can also drag to look around and scroll to zoom.
        </div>
      )}
      {selected && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#ffe08a', marginBottom: 2 }}>{selected.name}</div>
          <div style={{ fontSize: 11, color: '#9bb3ff', marginBottom: 8 }}>
            {selected.hemisphere === 'north' ? 'Northern hemisphere' : selected.hemisphere === 'south' ? 'Southern hemisphere' : 'Equatorial'} · Best seen: {selected.bestSeen}
          </div>
          <p style={{ margin: '0 0 8px 0', fontSize: 13, lineHeight: 1.5, color: '#dfe8ff' }}>{selected.description}</p>
          <button
            onClick={() => onSelect(null)}
            style={{
              marginTop: 4,
              padding: '5px 12px',
              fontSize: 12,
              background: 'transparent',
              color: '#9bb3ff',
              border: '1px solid rgba(91,158,255,0.4)',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Deselect
          </button>
        </div>
      )}
      <div style={{ fontSize: 11, color: '#9bb3ff', fontWeight: 700, marginBottom: 6 }}>ALL CONSTELLATIONS</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {CONSTELLATIONS.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            style={{
              padding: '6px 8px',
              fontSize: 12,
              fontWeight: 600,
              border: '1px solid rgba(91,158,255,0.3)',
              borderRadius: 5,
              cursor: 'pointer',
              background: selectedId === c.id ? 'rgba(255,217,102,0.18)' : 'transparent',
              color: selectedId === c.id ? '#ffe08a' : '#cfe0ff',
              textAlign: 'left',
              fontFamily: 'inherit',
            }}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ------------------------- Life cycle info panel -------------------------

function LifeCycleInfo({
  stageIndex,
  setStageIndex,
  autoPlay,
  setAutoPlay,
}: {
  stageIndex: number;
  setStageIndex: (n: number) => void;
  autoPlay: boolean;
  setAutoPlay: (b: boolean) => void;
}) {
  const stage = LIFE_STAGES[stageIndex];
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        zIndex: 1000,
        width: 340,
        color: 'white',
        fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
        background: 'rgba(8, 12, 28, 0.88)',
        padding: '16px 18px',
        borderRadius: 12,
        border: '1px solid rgba(255, 217, 102, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ fontSize: 12, color: '#ffd966', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
        STAR LIFE CYCLE
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#ffe08a', marginBottom: 2 }}>
        {stageIndex + 1}. {stage.name}
      </div>
      <div style={{ fontSize: 11, color: '#9bb3ff', marginBottom: 10 }}>Duration: {stage.durationLabel}</div>
      <p style={{ margin: '0 0 10px 0', fontSize: 13, lineHeight: 1.5, color: '#dfe8ff' }}>{stage.description}</p>
      <ul style={{ margin: '0 0 12px 0', paddingLeft: '18px', fontSize: 12.5, lineHeight: 1.55, color: '#cfe0ff' }}>
        {stage.facts.map((f, i) => (
          <li key={i} style={{ marginBottom: 3 }}>{f}</li>
        ))}
      </ul>
      <input
        type="range"
        min={0}
        max={LIFE_STAGES.length - 1}
        step={1}
        value={stageIndex}
        onChange={(e) => setStageIndex(parseInt(e.target.value))}
        style={{ width: '100%', accentColor: '#ffd966', marginBottom: 8 }}
      />
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        <button
          onClick={() => setStageIndex(Math.max(0, stageIndex - 1))}
          disabled={stageIndex === 0}
          style={navBtn(stageIndex === 0)}
        >
          ← Previous
        </button>
        <button
          onClick={() => setAutoPlay(!autoPlay)}
          style={{
            ...navBtn(false),
            flex: 1,
            background: autoPlay ? 'rgba(255,217,102,0.25)' : 'transparent',
            color: autoPlay ? '#ffe08a' : '#cfe0ff',
          }}
        >
          {autoPlay ? '⏸ Pause' : '▶ Play'}
        </button>
        <button
          onClick={() => setStageIndex(Math.min(LIFE_STAGES.length - 1, stageIndex + 1))}
          disabled={stageIndex === LIFE_STAGES.length - 1}
          style={navBtn(stageIndex === LIFE_STAGES.length - 1)}
        >
          Next →
        </button>
      </div>
      <div style={{ fontSize: 11, color: '#7a8db0', lineHeight: 1.4 }}>
        The first six stages show the life of a Sun-like star. The last two stages show what happens to a much more massive star instead.
      </div>
    </div>
  );
}

function navBtn(disabled: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: '6px 0',
    fontSize: 12,
    fontWeight: 600,
    border: '1px solid rgba(91,158,255,0.4)',
    borderRadius: 5,
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: 'transparent',
    color: disabled ? '#5a6a8a' : '#cfe0ff',
    opacity: disabled ? 0.5 : 1,
    fontFamily: 'inherit',
  };
}

// ------------------------- Black hole info panel -------------------------

function BlackHoleInfo() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        zIndex: 1000,
        width: 320,
        color: 'white',
        fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
        background: 'rgba(8, 12, 28, 0.88)',
        padding: '16px 18px',
        borderRadius: 12,
        border: '1px solid rgba(255, 130, 90, 0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ fontSize: 12, color: '#ffd0a0', fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>
        BLACK HOLE
      </div>
      <div style={{ fontSize: 16, marginBottom: 10, color: '#ffe08a' }}>
        The strangest object in space
      </div>
      <p style={{ margin: '0 0 10px 0', fontSize: 13, lineHeight: 1.5, color: '#dfe8ff' }}>
        A black hole is a region of space where gravity is so strong that nothing — not even light — can escape once it gets too close. The boundary is called the <b>event horizon</b>.
      </p>
      <p style={{ margin: '0 0 10px 0', fontSize: 13, lineHeight: 1.5, color: '#dfe8ff' }}>
        The bright glowing ring around it is the <b>accretion disk</b> — a flat ring of gas, dust, and shredded stars spiralling in at incredible speed. As the material falls in, friction heats it to millions of degrees, making it glow.
      </p>
      <div style={{ fontSize: 11, color: '#9bb3ff', fontWeight: 700, marginBottom: 4 }}>Key facts</div>
      <ul style={{ margin: 0, paddingLeft: '18px', fontSize: 12.5, lineHeight: 1.55, color: '#cfe0ff' }}>
        <li>The hot inner disk is blue-white; the cooler outer disk is red-orange</li>
        <li>Real black holes were photographed in 2019 (M87*) and 2022 (Sgr A* at our galaxy's centre)</li>
        <li>The bright thin ring around the event horizon is called the <b>photon ring</b></li>
        <li>Drag to orbit the camera; scroll to zoom</li>
      </ul>
    </div>
  );
}

// ------------------------- Sub-view selector (top of page) -------------------------

function SubViewTabs({ active, setActive }: { active: SubView; setActive: (v: SubView) => void }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 70,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        gap: 4,
        background: 'rgba(8, 12, 28, 0.85)',
        border: '1px solid rgba(91, 158, 255, 0.35)',
        borderRadius: 10,
        padding: 4,
        pointerEvents: 'auto',
        fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      {SUB_VIEWS.map((v) => (
        <button
          key={v.id}
          onClick={() => setActive(v.id)}
          style={{
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 600,
            border: 'none',
            borderRadius: 7,
            cursor: 'pointer',
            background: active === v.id ? '#5b9eff' : 'transparent',
            color: active === v.id ? '#08101f' : '#cfe0ff',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>{v.emoji}</span>
          {v.label}
        </button>
      ))}
    </div>
  );
}

// ------------------------- Page -------------------------

export default function StarsBeyond({ onBack }: Props) {
  const [subView, setSubView] = useState<SubView>('constellations');
  const [selectedConstellation, setSelectedConstellation] = useState<string | null>(null);
  const [stageIndex, setStageIndex] = useState(2); // main sequence by default
  const [autoPlay, setAutoPlay] = useState(false);

  // Auto-play for the life cycle
  if (autoPlay) {
    setTimeout(() => {
      setStageIndex((i) => (i + 1) % LIFE_STAGES.length);
    }, 3500);
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      <ModuleHeader title="Stars & Beyond" onBack={onBack} accentColor="#5b9eff" />
      <SubViewTabs active={subView} setActive={setSubView} />

      <Canvas
        camera={{ position: subView === 'blackhole' ? [0, 4, 14] : [0, 0, -0.1], fov: 70, near: 0.001, far: 5000 }}
        style={{ background: '#000000' }}
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          {subView === 'constellations' && (
            <>
              <ambientLight intensity={0.3} />
              <ConstellationViewer selectedId={selectedConstellation} onSelect={setSelectedConstellation} />
              <OrbitControls
                enablePan={false}
                enableZoom={false}
                enableRotate
                minDistance={0.05}
                maxDistance={0.05}
                rotateSpeed={-0.3}
                target={[0, 0, 0]}
                makeDefault
              />
            </>
          )}
          {subView === 'lifecycle' && (
            <>
              <ambientLight intensity={0.2} />
              <StarLifeCycle stageIndex={stageIndex} />
              <OrbitControls
                enablePan
                enableZoom
                enableRotate
                minDistance={3}
                maxDistance={40}
                target={[0, 0, 0]}
                makeDefault
              />
            </>
          )}
          {subView === 'blackhole' && (
            <>
              <ambientLight intensity={0.15} />
              <BlackHole />
              <OrbitControls
                enablePan
                enableZoom
                enableRotate
                minDistance={4}
                maxDistance={50}
                target={[0, 0, 0]}
                makeDefault
              />
            </>
          )}
        </Suspense>
      </Canvas>

      {/* Info panels per sub-view */}
      {subView === 'constellations' && (
        <ConstellationInfo selectedId={selectedConstellation} onSelect={setSelectedConstellation} />
      )}
      {subView === 'lifecycle' && (
        <LifeCycleInfo
          stageIndex={stageIndex}
          setStageIndex={setStageIndex}
          autoPlay={autoPlay}
          setAutoPlay={setAutoPlay}
        />
      )}
      {subView === 'blackhole' && <BlackHoleInfo />}
    </div>
  );
}
