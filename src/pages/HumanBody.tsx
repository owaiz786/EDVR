import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ModuleHeader } from '../components/ModuleHeader';
import { DEFAULT_LAYERS, type BodyLayers } from '../components/biology/HumanBodyModel';
import { DEFAULT_BPM } from '../components/biology/heartData';
import { STAGES } from '../components/biology/digestionData';
import type { OrganSystemId } from '../components/biology/bodyData';
import type { ScaleLevel } from '../components/biology/scaleData';
import {
  BrainScene,
  CameraRig,
  CrossSectionScene,
  DigestionScene,
  HeartScene,
  Lights,
  LungsScene,
  ScaleScene,
  SystemsScene,
  WholeBodyScene,
  type CamGoal,
  type SliceAxis,
} from '../components/biology/scenes';
import { ControlPanels, InfoPanels, accentFor, type BodyState, type SubView } from '../components/biology/panels';
import { BIO_CSS } from '../components/biology/ui';

interface Props {
  onBack: () => void;
}

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
  const [view, setView] = useState<SubView>('wholebody');
  const [resetN, setResetN] = useState(0);

  // whole body
  const [layers, setLayers] = useState<BodyLayers>(DEFAULT_LAYERS);
  const [skinOpacity, setSkinOpacity] = useState(0.3);
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
  // systems
  const [system, setSystem] = useState<OrganSystemId | null>(null);
  // heart
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [heartXray, setHeartXray] = useState(true);
  const [heartLabels, setHeartLabels] = useState(true);
  const [heartFlow, setHeartFlow] = useState(true);
  const [heartPart, setHeartPart] = useState<string | null>(null);
  // lungs
  const [lungMode, setLungMode] = useState<'lungs' | 'alveoli'>('lungs');
  const [breaths, setBreaths] = useState(14);
  const [lungLabels, setLungLabels] = useState(true);
  const [lungBronchi, setLungBronchi] = useState(true);
  const [lungXray, setLungXray] = useState(true);
  const [lungSel, setLungSel] = useState<string | null>(null);
  // brain
  const [brainMode, setBrainMode] = useState<'brain' | 'neuron'>('brain');
  const [lobe, setLobe] = useState<string | null>(null);
  const [brainLabels, setBrainLabels] = useState(true);
  const [neuronSpeed, setNeuronSpeed] = useState(1);
  // digestion
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [digSpeed, setDigSpeed] = useState(1);
  const [digLabels, setDigLabels] = useState(true);
  const [follow, setFollow] = useState(true);
  // cross-section
  const [axis, setAxis] = useState<SliceAxis>('y');
  const [slice, setSlice] = useState(0.62);
  // scale
  const [level, setLevel] = useState<ScaleLevel>('body');

  const s: BodyState = {
    view,
    layers, setLayers, skinOpacity, setSkinOpacity, selectedOrgan, setSelectedOrgan,
    system, setSystem,
    bpm, setBpm, heartXray, setHeartXray, heartLabels, setHeartLabels, heartFlow, setHeartFlow, heartPart, setHeartPart,
    lungMode, setLungMode, breaths, setBreaths, lungLabels, setLungLabels, lungBronchi, setLungBronchi, lungXray, setLungXray, lungSel, setLungSel,
    brainMode, setBrainMode, lobe, setLobe, brainLabels, setBrainLabels, neuronSpeed, setNeuronSpeed,
    stage, setStage, playing, setPlaying, digSpeed, setDigSpeed, digLabels, setDigLabels, follow, setFollow,
    axis, setAxis, slice, setSlice,
    level, setLevel,
  };

  // Where the camera should go for the current view.
  const goal: CamGoal = useMemo(() => {
    switch (view) {
      case 'heart':
        return { pos: [0, 0.6, 7.6], target: [0, 0.35, 0], min: 2.5, max: 16 };
      case 'lungs':
        return lungMode === 'alveoli'
          ? { pos: [0, -0.1, 9], target: [0, 0, 0], min: 3, max: 18 }
          : { pos: [0, 2.0, 8.2], target: [0, 2.0, 0], min: 3, max: 18 };
      case 'brain':
        return brainMode === 'neuron'
          ? { pos: [0, 0.6, 11], target: [0, 0, 0], min: 3, max: 22 }
          : { pos: [4.4, 0.4, 0.5], target: [0, -0.15, -0.1], min: 1.8, max: 12 };
      case 'digestion': {
        const st = STAGES[stage];
        return follow ? { pos: st.cam.pos, target: st.cam.target, min: 2, max: 20 } : { pos: [0, 1.5, 11], target: [0, 1.3, 0], min: 2, max: 20 };
      }
      case 'crosssection':
        return axis === 'y'
          ? { pos: [0, 6.5, 12], target: [0, 0.3, 0], min: 4, max: 30 }
          : axis === 'x'
            ? { pos: [13.5, 1, 2.5], target: [0, 0, 0], min: 4, max: 30 }
            : { pos: [0, 0.4, 14.5], target: [0, 0, 0], min: 4, max: 30 };
      case 'scalezoom':
        return { pos: [0, 0.3, 9.5], target: [0, 0, 0], min: 2.5, max: 24 };
      default:
        return { pos: [0, 1.0, 18.5], target: [0, 0.5, 0], min: 4, max: 34 };
    }
  }, [view, lungMode, brainMode, axis, stage, follow]);

  const goalKey = `${view}|${lungMode}|${brainMode}|${axis}|${view === 'digestion' && follow ? stage : '-'}|${resetN}`;

  const clearSelection = () => {
    setSelectedOrgan(null);
    setHeartPart(null);
    setLungSel(null);
    setLobe(null);
  };

  return (
    <div className="hb-root">
      <style>{BIO_CSS}</style>

      <div className="hb-canvas">
        <Canvas camera={{ position: [0, 1.0, 18.5], fov: 42, near: 0.1, far: 200 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} onPointerMissed={clearSelection}>
          <Lights />
          <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={goal.min} maxDistance={goal.max} autoRotate={view === 'wholebody' && !selectedOrgan} autoRotateSpeed={0.6} />
          <CameraRig goal={goal} goalKey={goalKey} />

          {view === 'wholebody' && (
            <WholeBodyScene layers={layers} skinOpacity={skinOpacity} selectedOrganId={selectedOrgan} onOrganClick={(o) => setSelectedOrgan(o.id === selectedOrgan ? null : o.id)} />
          )}
          {view === 'systems' && <SystemsScene system={system} />}
          {view === 'heart' && (
            <HeartScene bpm={bpm} exercise={bpm > 120} xray={heartXray} labels={heartLabels} flow={heartFlow} selectedPart={heartPart} onSelectPart={setHeartPart} />
          )}
          {view === 'lungs' && (
            <LungsScene mode={lungMode} rate={breaths} labels={lungLabels} bronchi={lungBronchi} xray={lungXray} selected={lungSel} onSelect={setLungSel} />
          )}
          {view === 'brain' && <BrainScene mode={brainMode} selectedLobe={lobe} onSelectLobe={setLobe} labels={brainLabels} speed={neuronSpeed} />}
          {view === 'digestion' && <DigestionScene stage={stage} playing={playing} speed={digSpeed} onStage={setStage} labels={digLabels} />}
          {view === 'crosssection' && <CrossSectionScene axis={axis} value={slice} />}
          {view === 'scalezoom' && <ScaleScene level={level} />}
        </Canvas>
      </div>

      <ModuleHeader title="Human Body Explorer" onBack={onBack} accentColor={accentFor(view)} />

      <div className="hb-ui">
        <nav className="hb-tabs" aria-label="Views">
          {SUB_VIEWS.map((v) => (
            <button
              key={v.id}
              className={`hb-tab ${view === v.id ? 'on' : ''}`}
              onClick={() => {
                setView(v.id);
                setResetN((n) => n + 1);
              }}
            >
              <span>{v.emoji}</span>
              {v.label}
            </button>
          ))}
          <button className="hb-tab" title="Reset camera" onClick={() => setResetN((n) => n + 1)}>
            ⟲
          </button>
        </nav>

        <div className="hb-dock">
          <div className="hb-col hb-left">
            <InfoPanels s={s} />
          </div>
          <div className="hb-col hb-right">
            <ControlPanels s={s} />
          </div>
        </div>

        <div className="hb-hint">Drag to rotate · scroll to zoom · right-drag to pan · click empty space to deselect</div>
      </div>
    </div>
  );
}
