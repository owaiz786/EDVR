import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { XR, createXRStore, XROrigin } from '@react-three/xr';
import {
  SolarSystem,
  MAX_TRUE_DISTANCE,
  MAX_VISUAL_DISTANCE,
} from '../components/SolarSystem';
import { Stars } from '../components/Stars';
import { Controls } from '../components/Controls';
import { CameraRig } from '../components/CameraRig';
import { sim } from '../simStore';
import { ModuleHeader } from '../components/ModuleHeader';
import '../App.css';

const store = createXRStore();

interface Props {
  onBack: () => void;
}

function Scene({
  scaleMode,
  showOrbits,
  showLabels,
  selectedId,
  onSelect,
  flyToken,
  resetToken,
}: {
  scaleMode: 'visual' | 'true';
  showOrbits: boolean;
  showLabels: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  flyToken: number;
  resetToken: number;
}) {
  return (
    <>
      <ambientLight intensity={0.18} />
      <Stars />
      <SolarSystem
        scaleMode={scaleMode}
        showOrbits={showOrbits}
        showLabels={showLabels}
        selectedId={selectedId}
        onSelect={onSelect}
        onFlyTo={() => {}}
      />
      <CameraRig
        selectedId={selectedId}
        scaleMode={scaleMode}
        flyToken={flyToken}
        resetToken={resetToken}
      />
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minDistance={0.5}
        maxDistance={
          scaleMode === 'true' ? MAX_TRUE_DISTANCE * 1.5 : MAX_VISUAL_DISTANCE * 3
        }
        makeDefault
      />
    </>
  );
}

export default function SolarSystemModule({ onBack }: Props) {
  const [scaleMode, setScaleMode] = useState<'visual' | 'true'>('visual');
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [flyToken, setFlyToken] = useState(0);
  const [resetToken, setResetToken] = useState(0);

  // A wrapper to feed onFlyTo into SolarSystem (which forwards it into popups).
  // We re-create the Scene prop each render so the closure captures the latest.
  useEffect(() => {
    sim.timeSpeed = timeSpeed;
  }, [timeSpeed]);

  const handleSelect = (id: string) => {
    if (id === '__close__') setSelectedId(null);
    else setSelectedId((prev) => (prev === id ? null : id));
  };

  const triggerFlyToSelected = () => setFlyToken((n) => n + 1);
  const triggerResetView = () => {
    setSelectedId(null);
    setResetToken((n) => n + 1);
  };

  const handleBackgroundClick = () => setSelectedId(null);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <ModuleHeader title="Solar System Explorer" onBack={onBack} />
      <Controls
        scaleMode={scaleMode}
        setScaleMode={setScaleMode}
        timeSpeed={timeSpeed}
        setTimeSpeed={setTimeSpeed}
        showOrbits={showOrbits}
        setShowOrbits={setShowOrbits}
        showLabels={showLabels}
        setShowLabels={setShowLabels}
        onEnterVR={() => store.enterVR()}
        selectedId={selectedId}
        onFlyToSelected={triggerFlyToSelected}
        onResetView={triggerResetView}
      />
      <Canvas
        camera={{ position: [0, 25, 45], fov: 55, near: 0.01, far: 5000 }}
        style={{ background: '#000000' }}
        onPointerMissed={handleBackgroundClick}
        gl={{ antialias: true }}
      >
        <XR store={store}>
          <XROrigin position={[0, 0, 40]} />
          <Suspense fallback={null}>
            <Scene
              scaleMode={scaleMode}
              showOrbits={showOrbits}
              showLabels={showLabels}
              selectedId={selectedId}
              onSelect={handleSelect}
              flyToken={flyToken}
              resetToken={resetToken}
            />
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
}
