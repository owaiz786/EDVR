import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { ModuleHeader } from '../components/ModuleHeader';
import WholeBody from '../components/biology/WholeBody';
import OrganSystems from '../components/biology/OrganSystems';
import { BeatingHeart, DEFAULT_BPM } from '../components/biology/BeatingHeart';
import Lungs from '../components/biology/Lungs';
import Brain from '../components/biology/Brain';
import Digestion from '../components/biology/Digestion';
import CrossSection from '../components/biology/CrossSection';
import ScaleZoom from '../components/biology/ScaleZoom';
import '../App.css';

interface Props {
  onBack: () => void;
}

type SubView = 'wholebody' | 'systems' | 'heart' | 'lungs' | 'brain' | 'digestion' | 'crosssection' | 'scalezoom';

const SUB_VIEWS: { id: SubView; label: string; emoji: string }[] = [
  { id: 'wholebody', label: 'Whole Body', emoji: '🧍' },
  { id: 'systems', label: 'Organ Systems', emoji: '🫀' },
  { id: 'heart', label: 'Heart', emoji: '❤️' },
  { id: 'lungs', label: 'Lungs', emoji: '🫁' },
  { id: 'brain', label: 'Brain', emoji: '🧠' },
  { id: 'digestion', label: 'Digestion', emoji: '🍽️' },
  { id: 'crosssection', label: 'Cross-section', emoji: '🔬' },
  { id: 'scalezoom', label: 'Scale Zoom', emoji: '🔍' },
];

export default function HumanBody({ onBack }: Props) {
  const [subView, setSubView] = useState<SubView>('wholebody');

  // Whole Body
  // (state is inside the component)

  // Heart
  const [heartBpm, setHeartBpm] = useState(DEFAULT_BPM);
  const [exercise, setExercise] = useState(false);
  const [selectedHeartPart, setSelectedHeartPart] = useState<string | null>(null);

  // Lungs
  const [breathingRate, setBreathingRate] = useState(14);
  const [lungView, setLungView] = useState<'lungs' | 'alveoli'>('lungs');

  // Brain
  const [brainView, setBrainView] = useState<'brain' | 'neuron'>('brain');
  const [selectedLobe, setSelectedLobe] = useState<string | null>(null);

  // Digestion
  const [digestionStage, setDigestionStage] = useState(0);
  const [digestionPlay, setDigestionPlay] = useState(false);

  // Cross-section
  const [sliceY, setSliceY] = useState(0.5);
  const [axis, setAxis] = useState<'y' | 'x' | 'z'>('y');

  // Scale zoom
  const [scaleLevel, setScaleLevel] = useState(0);

  // Exercise bumps heart rate
  useEffect(() => {
    setHeartBpm(exercise ? 140 : DEFAULT_BPM);
  }, [exercise]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', position: 'relative' }}>
      <ModuleHeader title="Human Body Explorer" onBack={onBack} accentColor="#f093fb" />

      {/* Sub-view tabs at top */}
      <div
        style={{
          position: 'absolute',
          top: 70,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          display: 'flex',
          gap: 3,
          background: 'rgba(20, 8, 24, 0.85)',
          border: '1px solid rgba(240, 147, 251, 0.35)',
          borderRadius: 10,
          padding: 3,
          pointerEvents: 'auto',
          fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '90vw',
        }}
      >
        {SUB_VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => setSubView(v.id)}
            style={{
              padding: '7px 12px',
              fontSize: 12,
              fontWeight: 600,
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              background: subView === v.id ? '#f093fb' : 'transparent',
              color: subView === v.id ? '#1a0820' : '#e8c8e8',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              whiteSpace: 'nowrap',
            }}
          >
            <span>{v.emoji}</span>
            {v.label}
          </button>
        ))}
      </div>

      {/* Per-sub-view controls (top-right) */}
      {subView === 'heart' && (
        <div
          style={{
            position: 'absolute',
            top: 130,
            right: 16,
            zIndex: 1000,
            width: 240,
            pointerEvents: 'auto',
            fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
          }}
        >
          <div
            style={{
              background: 'rgba(20, 8, 24, 0.85)',
              border: '1px solid rgba(214, 40, 40, 0.4)',
              borderRadius: 12,
              color: 'white',
              padding: 16,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#d62828', marginBottom: 12, letterSpacing: 1 }}>
              HEART
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: '#e8a0a0', fontWeight: 600 }}>HEART RATE</span>
                <span style={{ fontSize: 12, color: '#ffe08a', fontFamily: 'monospace' }}>{heartBpm} bpm</span>
              </div>
              <input
                type="range"
                min={40}
                max={180}
                step={1}
                value={heartBpm}
                onChange={(e) => { setHeartBpm(parseInt(e.target.value)); setExercise(parseInt(e.target.value) > 100); }}
                style={{ width: '100%', accentColor: '#d62828' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9a7a9a', marginTop: 2 }}>
                <span>Rest</span>
                <span>Exercise</span>
              </div>
            </div>
            <button
              onClick={() => setExercise(!exercise)}
              style={{
                width: '100%',
                padding: '7px 0',
                fontSize: 12,
                fontWeight: 700,
                border: '1px solid rgba(214, 40, 40, 0.4)',
                borderRadius: 6,
                cursor: 'pointer',
                background: exercise ? 'rgba(214,40,40,0.3)' : 'transparent',
                color: exercise ? '#ffe08a' : '#e8a0a0',
                fontFamily: 'inherit',
              }}
            >
              {exercise ? '🏃 Exercising (140 bpm)' : '😴 Resting (70 bpm)'}
            </button>
            <div style={{ fontSize: 11, color: '#9a7a9a', marginTop: 8, lineHeight: 1.4 }}>
              Click any chamber, valve, or blood vessel to learn about it. Red = oxygenated, blue = deoxygenated.
            </div>
          </div>
        </div>
      )}

      {subView === 'lungs' && (
        <div
          style={{
            position: 'absolute',
            top: 130,
            right: 16,
            zIndex: 1000,
            width: 240,
            pointerEvents: 'auto',
            fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
          }}
        >
          <div
            style={{
              background: 'rgba(20, 8, 24, 0.85)',
              border: '1px solid rgba(247, 127, 0, 0.4)',
              borderRadius: 12,
              color: 'white',
              padding: 16,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f77f00', marginBottom: 12, letterSpacing: 1 }}>
              LUNGS
            </div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
              {(['lungs', 'alveoli'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setLungView(v)}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    fontSize: 11,
                    fontWeight: 600,
                    border: '1px solid rgba(247, 127, 0, 0.4)',
                    borderRadius: 5,
                    cursor: 'pointer',
                    background: lungView === v ? 'rgba(247,127,0,0.25)' : 'transparent',
                    color: lungView === v ? '#ffe08a' : '#e8c8e8',
                    fontFamily: 'inherit',
                  }}
                >
                  {v === 'lungs' ? 'Whole lungs' : 'Alveoli zoom'}
                </button>
              ))}
            </div>
            {lungView === 'lungs' && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#f4a261', fontWeight: 600 }}>BREATHS / MIN</span>
                  <span style={{ fontSize: 12, color: '#ffe08a', fontFamily: 'monospace' }}>{breathingRate}</span>
                </div>
                <input
                  type="range"
                  min={6}
                  max={40}
                  step={1}
                  value={breathingRate}
                  onChange={(e) => setBreathingRate(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#f77f00' }}
                />
                <div style={{ fontSize: 11, color: '#9a7a9a', marginTop: 2 }}>
                  Resting is about 12–16; exercise can push it to 40.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {subView === 'brain' && (
        <div
          style={{
            position: 'absolute',
            top: 130,
            right: 16,
            zIndex: 1000,
            width: 240,
            pointerEvents: 'auto',
            fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
          }}
        >
          <div
            style={{
              background: 'rgba(20, 8, 24, 0.85)',
              border: '1px solid rgba(157, 78, 221, 0.4)',
              borderRadius: 12,
              color: 'white',
              padding: 16,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#9d4edd', marginBottom: 12, letterSpacing: 1 }}>
              BRAIN
            </div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
              {(['brain', 'neuron'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => { setBrainView(v); setSelectedLobe(null); }}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    fontSize: 11,
                    fontWeight: 600,
                    border: '1px solid rgba(157, 78, 221, 0.4)',
                    borderRadius: 5,
                    cursor: 'pointer',
                    background: brainView === v ? 'rgba(157,78,221,0.25)' : 'transparent',
                    color: brainView === v ? '#ffe08a' : '#e8c8e8',
                    fontFamily: 'inherit',
                  }}
                >
                  {v === 'brain' ? 'Whole brain' : 'Neuron zoom'}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 11, color: '#9a7a9a', lineHeight: 1.4 }}>
              {brainView === 'brain'
                ? 'Click a lobe in the info panel to highlight it and learn its function.'
                : 'Watch the yellow signal pulse travel along the axon from the cell body to the terminals.'}
            </div>
          </div>
        </div>
      )}

      {subView === 'crosssection' && (
        <div
          style={{
            position: 'absolute',
            top: 130,
            right: 16,
            zIndex: 1000,
            width: 240,
            pointerEvents: 'auto',
            fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
          }}
        >
          <div
            style={{
              background: 'rgba(20, 8, 24, 0.85)',
              border: '1px solid rgba(255, 90, 90, 0.4)',
              borderRadius: 12,
              color: 'white',
              padding: 16,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ff5a5a', marginBottom: 12, letterSpacing: 1 }}>
              CROSS-SECTION
            </div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
              {(['y', 'x', 'z'] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAxis(a)}
                  style={{
                    flex: 1,
                    padding: '6px 0',
                    fontSize: 11,
                    fontWeight: 600,
                    border: '1px solid rgba(255, 90, 90, 0.4)',
                    borderRadius: 5,
                    cursor: 'pointer',
                    background: axis === a ? 'rgba(255,90,90,0.25)' : 'transparent',
                    color: axis === a ? '#ffe08a' : '#e8c8e8',
                    fontFamily: 'inherit',
                  }}
                >
                  {a === 'y' ? '↑↓ Top' : a === 'x' ? '←→ Side' : 'InOut Front'}
                </button>
              ))}
            </div>
            <div style={{ marginBottom: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: '#ff9090', fontWeight: 600 }}>SLICE</span>
                <span style={{ fontSize: 12, color: '#ffe08a', fontFamily: 'monospace' }}>{(sliceY * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={sliceY}
                onChange={(e) => setSliceY(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#ff5a5a' }}
              />
              <div style={{ fontSize: 11, color: '#9a7a9a', marginTop: 2 }}>
                Drag the slider to scan from {axis === 'y' ? 'feet to head' : axis === 'x' ? 'left to right' : 'front to back'}.
              </div>
            </div>
          </div>
        </div>
      )}

      <Canvas
        camera={{ position: [0, 1, 12], fov: 50, near: 0.001, far: 5000 }}
        style={{ background: '#000000' }}
        gl={{ antialias: true, localClippingEnabled: true }}
      >
        {subView === 'wholebody' && <WholeBody />}
        {subView === 'systems' && <OrganSystems />}
        {subView === 'heart' && (
          <BeatingHeart
            bpm={heartBpm}
            selectedPart={selectedHeartPart}
            onSelectPart={setSelectedHeartPart}
            exercise={exercise}
          />
        )}
        {subView === 'lungs' && <Lungs breathingRate={breathingRate} view={lungView} />}
        {subView === 'brain' && (
          <Brain view={brainView} selectedLobe={selectedLobe} onSelectLobe={setSelectedLobe} />
        )}
        {subView === 'digestion' && (
          <Digestion
            stageIndex={digestionStage}
            setStageIndex={setDigestionStage}
            autoPlay={digestionPlay}
            setAutoPlay={setDigestionPlay}
          />
        )}
        {subView === 'crosssection' && <CrossSection sliceY={sliceY} axis={axis} />}
        {subView === 'scalezoom' && <ScaleZoom levelIndex={scaleLevel} setLevelIndex={setScaleLevel} />}
      </Canvas>
    </div>
  );
}
