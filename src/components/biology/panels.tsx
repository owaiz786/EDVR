import { useEffect, useRef, useState } from 'react';
import { ORGAN_SYSTEMS, SLICE_SHAPES, getOrganById, type OrganSystemId } from './bodyData';
import type { BodyLayers } from './HumanBodyModel';
import { PART_INFO, heartSim } from './heartData';
import { lungSim } from './LungsModel';
import { STAGES } from './digestionData';
import { SCALE_LEVELS, type ScaleLevel } from './scaleData';
import { LOBE_COLORS, ARM_R, LEG_R, armCurve, legCurve, torsoAt, type LobeId } from './anatomy';
import { SLICE_RANGE, sliceCoord, type SliceAxis } from './scenes';
import { Check, Facts, Panel, Seg, Slider } from './ui';

export type SubView = 'wholebody' | 'systems' | 'heart' | 'lungs' | 'brain' | 'digestion' | 'crosssection' | 'scalezoom';

export interface BodyState {
  view: SubView;
  // whole body
  layers: BodyLayers;
  setLayers: (l: BodyLayers) => void;
  skinOpacity: number;
  setSkinOpacity: (v: number) => void;
  selectedOrgan: string | null;
  setSelectedOrgan: (id: string | null) => void;
  // systems
  system: OrganSystemId | null;
  setSystem: (s: OrganSystemId | null) => void;
  // heart
  bpm: number;
  setBpm: (v: number) => void;
  heartXray: boolean;
  setHeartXray: (v: boolean) => void;
  heartLabels: boolean;
  setHeartLabels: (v: boolean) => void;
  heartFlow: boolean;
  setHeartFlow: (v: boolean) => void;
  heartPart: string | null;
  setHeartPart: (id: string | null) => void;
  // lungs
  lungMode: 'lungs' | 'alveoli';
  setLungMode: (m: 'lungs' | 'alveoli') => void;
  breaths: number;
  setBreaths: (v: number) => void;
  lungLabels: boolean;
  setLungLabels: (v: boolean) => void;
  lungBronchi: boolean;
  setLungBronchi: (v: boolean) => void;
  lungXray: boolean;
  setLungXray: (v: boolean) => void;
  lungSel: string | null;
  setLungSel: (id: string | null) => void;
  // brain
  brainMode: 'brain' | 'neuron';
  setBrainMode: (m: 'brain' | 'neuron') => void;
  lobe: string | null;
  setLobe: (id: string | null) => void;
  brainLabels: boolean;
  setBrainLabels: (v: boolean) => void;
  neuronSpeed: number;
  setNeuronSpeed: (v: number) => void;
  // digestion
  stage: number;
  setStage: (i: number) => void;
  playing: boolean;
  setPlaying: (v: boolean) => void;
  digSpeed: number;
  setDigSpeed: (v: number) => void;
  digLabels: boolean;
  setDigLabels: (v: boolean) => void;
  follow: boolean;
  setFollow: (v: boolean) => void;
  // cross-section
  axis: SliceAxis;
  setAxis: (a: SliceAxis) => void;
  slice: number;
  setSlice: (v: number) => void;
  // scale zoom
  level: ScaleLevel;
  setLevel: (l: ScaleLevel) => void;
}

const ACCENT: Record<SubView, string> = {
  wholebody: '#f093fb',
  systems: '#f093fb',
  heart: '#e63946',
  lungs: '#ff8c1a',
  brain: '#b04bf0',
  digestion: '#ffc247',
  crosssection: '#ff5a5a',
  scalezoom: '#4dd2ff',
};
export const accentFor = (v: SubView) => ACCENT[v];

// ---------------------------------------------------------------------------
// LEFT column: explanations
// ---------------------------------------------------------------------------

const LOBE_INFO: Record<string, { name: string; info: string; facts: string[] }> = {
  frontal: {
    name: 'Frontal Lobe',
    info: 'The frontal lobe sits behind your forehead. It is the brain\u2019s planner: it helps you think, make decisions, control movement and speak.',
    facts: ['Planning and decision-making', 'Controls voluntary movement', 'Helps with speech and personality', 'Largest lobe'],
  },
  parietal: {
    name: 'Parietal Lobe',
    info: 'The parietal lobe sits on top and towards the back. It processes touch, temperature and pain, and helps you know where your body is in space.',
    facts: ['Touch, pain and temperature', 'Spatial awareness', 'Helps with reading and maths', 'Combines senses'],
  },
  temporal: {
    name: 'Temporal Lobe',
    info: 'The temporal lobes sit above your ears. They process sound, help you understand language, and are important for forming memories.',
    facts: ['Hearing and sound', 'Understanding language', 'Forms and stores memories', 'Recognises faces'],
  },
  occipital: {
    name: 'Occipital Lobe',
    info: 'The occipital lobe is at the very back of the brain. It is the main visual centre: it turns signals from your eyes into the pictures you see.',
    facts: ['Main vision centre', 'Recognises colour and shape', 'Smallest lobe', 'Damage can cause blindness'],
  },
  cerebellum: {
    name: 'Cerebellum',
    info: 'The cerebellum (\u201clittle brain\u201d) sits under the back of the brain. It fine-tunes movement, balance and coordination.',
    facts: ['Balance and posture', 'Smooth, coordinated movement', 'Holds over half of all neurons', 'Learns skills like riding a bike'],
  },
  brainstem: {
    name: 'Brainstem',
    info: 'The brainstem connects the brain to the spinal cord and controls automatic life-support functions that you never think about.',
    facts: ['Controls breathing', 'Controls heart rate', 'Sleep and wake cycles', 'Relays all signals to the body'],
  },
};

export function InfoPanels({ s }: { s: BodyState }) {
  const accent = ACCENT[s.view];
  switch (s.view) {
    case 'wholebody': {
      const o = s.selectedOrgan ? getOrganById(s.selectedOrgan) : null;
      if (o)
        return (
          <Panel accent={o.color} onClose={() => s.setSelectedOrgan(null)} title={`${ORGAN_SYSTEMS.find((x) => x.id === o.system)?.name ?? ''}`}>
            <h2 style={{ color: o.color }}>{o.name}</h2>
            <p>{o.info}</p>
            <Facts items={o.facts} />
          </Panel>
        );
      return (
        <Panel accent={accent} title="Human Body Explorer">
          <p>An adult human body, built from layers. Drag to rotate, scroll to zoom, and tap any organ to learn about it.</p>
          <p className="hb-sub">Use the <b>Body layers</b> panel to peel away the skin and see the muscles, skeleton, blood vessels and nerves.</p>
        </Panel>
      );
    }
    case 'systems': {
      const sys = ORGAN_SYSTEMS.find((x) => x.id === s.system);
      if (!sys)
        return (
          <Panel accent={accent} title="Organ systems">
            <p>Organs work together in groups called <b>systems</b>. Choose a system on the right to light up its organs.</p>
          </Panel>
        );
      return (
        <Panel accent={sys.color} title="Organ system">
          <h2 style={{ color: sys.color }}>{sys.name}</h2>
          <p>{sys.description}</p>
          <h3 style={{ marginTop: 12 }}>Key facts</h3>
          <Facts items={sys.facts} />
        </Panel>
      );
    }
    case 'heart': {
      const part = s.heartPart ? PART_INFO[s.heartPart] : null;
      if (part)
        return (
          <Panel accent={part.color} onClose={() => s.setHeartPart(null)} title="Heart">
            <h2 style={{ color: part.color }}>{part.name}</h2>
            <p>{part.info}</p>
            <Facts items={part.facts} />
          </Panel>
        );
      return (
        <Panel accent={accent} title="The Heart">
          <p>The heart is a muscular pump with four chambers. Click any chamber, valve or blood vessel to learn about it.</p>
          <p>
            <span className="hb-pill" style={{ color: '#9db8ff' }}>■ blue</span> oxygen-poor blood (right side)
            <br />
            <span className="hb-pill" style={{ color: '#ff8a80', marginTop: 6 }}>■ red</span> oxygen-rich blood (left side)
          </p>
          <p className="hb-sub">The glowing particles show blood flowing through the heart. Change the heart rate to see it speed up.</p>
        </Panel>
      );
    }
    case 'lungs': {
      if (s.lungMode === 'alveoli')
        return (
          <Panel accent={accent} title="Alveoli — gas exchange">
            <h2>Where oxygen gets in</h2>
            <p>Each breath carries air down tiny tubes into clusters of air sacs called alveoli. Their walls are wrapped in capillaries, so oxygen passes into the blood while carbon dioxide passes out.</p>
            <ul>
              <li><span style={{ color: '#5cff8a' }}>●</span> green = oxygen moving into the blood</li>
              <li><span style={{ color: '#ffd23f' }}>●</span> yellow = carbon dioxide leaving</li>
            </ul>
            <p className="hb-sub">You have about 300 million alveoli — their total surface area is roughly the size of a tennis court.</p>
          </Panel>
        );
      const o = s.lungSel ? getOrganById(s.lungSel) : null;
      if (o)
        return (
          <Panel accent={accent} onClose={() => s.setLungSel(null)} title="Respiratory system">
            <h2>{o.name}</h2>
            <p>{o.info}</p>
            <Facts items={o.facts} />
          </Panel>
        );
      return (
        <Panel accent={accent} title="The Lungs">
          <p>When you breathe in, the diaphragm moves down and your lungs expand with air. When you breathe out they deflate. Air travels through the trachea and bronchi into tiny sacs called alveoli.</p>
          <Facts items={['The right lung has 3 lobes, the left has 2', 'The left lung is smaller to make room for the heart', 'About 300 million alveoli in total', 'Click a lung or the trachea for details']} />
        </Panel>
      );
    }
    case 'brain': {
      if (s.brainMode === 'neuron')
        return (
          <Panel accent={accent} title="The Neuron">
            <h2>How brain cells send signals</h2>
            <p>A neuron collects signals with its dendrites, adds them up in the cell body, and, if the total is strong enough, fires an electrical pulse down its axon to the next cell.</p>
            <Facts items={['Dendrites receive signals', 'The axon carries the pulse (the yellow glow)', 'Myelin insulates the axon and speeds the signal up', 'Signals cross a tiny gap called a synapse']} />
          </Panel>
        );
      const info = s.lobe ? LOBE_INFO[s.lobe] : null;
      if (info && s.lobe)
        return (
          <Panel accent={LOBE_COLORS[s.lobe as LobeId]} onClose={() => s.setLobe(null)} title="Brain region">
            <h2 style={{ color: LOBE_COLORS[s.lobe as LobeId] }}>{info.name}</h2>
            <p>{info.info}</p>
            <Facts items={info.facts} />
          </Panel>
        );
      return (
        <Panel accent={accent} title="The Brain">
          <p>The brain has different regions, each with a specialised job. Click a region on the brain, or pick one from the list on the right.</p>
          <Facts items={['About 86 billion neurons', 'Uses ~20% of your energy', 'Left and right halves are joined in the middle']} />
        </Panel>
      );
    }
    case 'digestion': {
      const st = STAGES[s.stage];
      return (
        <Panel accent={accent} title={`Digestion journey · step ${s.stage + 1} of ${STAGES.length}`}>
          <h2>{`${s.stage + 1}. ${st.name}`}</h2>
          <p>{st.description}</p>
          <Facts items={st.facts} />
        </Panel>
      );
    }
    case 'crosssection':
      return (
        <Panel accent={accent} title="Cross-section (MRI-style slice)">
          <p>Slide the plane through the body to see what is inside at each level — a bit like an MRI or CT scan. The image on the right shows the slice itself.</p>
          <p className="hb-sub">Real MRI scans use magnetic fields and radio waves — no actual cutting!</p>
        </Panel>
      );
    case 'scalezoom': {
      const lv = SCALE_LEVELS.find((l) => l.id === s.level)!;
      return (
        <Panel accent={accent} title={`Scale · ${lv.sizeLabel}`}>
          <h2>{lv.name}</h2>
          <p>{lv.description}</p>
          <Facts items={lv.facts} />
        </Panel>
      );
    }
  }
}

// ---------------------------------------------------------------------------
// RIGHT column: controls
// ---------------------------------------------------------------------------

const LAYER_DEFS: { key: keyof BodyLayers; label: string; color: string }[] = [
  { key: 'skin', label: 'Skin', color: '#e3b48f' },
  { key: 'muscle', label: 'Muscles', color: '#b3433c' },
  { key: 'skeleton', label: 'Skeleton', color: '#ece6d6' },
  { key: 'organs', label: 'Organs', color: '#f0a58c' },
  { key: 'nerves', label: 'Nerves', color: '#ffd23f' },
  { key: 'bloodVessels', label: 'Blood vessels', color: '#d62828' },
];

const PRESETS: { label: string; layers: BodyLayers; skin: number }[] = [
  { label: 'Outside', layers: { skin: true, muscle: false, skeleton: false, organs: false, nerves: false, bloodVessels: false }, skin: 1 },
  { label: 'Organs', layers: { skin: true, muscle: false, skeleton: false, organs: true, nerves: false, bloodVessels: false }, skin: 0.25 },
  { label: 'Muscles', layers: { skin: false, muscle: true, skeleton: false, organs: false, nerves: false, bloodVessels: false }, skin: 0.3 },
  { label: 'Skeleton', layers: { skin: true, muscle: false, skeleton: true, organs: false, nerves: false, bloodVessels: false }, skin: 0.12 },
  { label: 'Vessels', layers: { skin: true, muscle: false, skeleton: false, organs: false, nerves: false, bloodVessels: true }, skin: 0.12 },
  { label: 'Nerves', layers: { skin: true, muscle: false, skeleton: false, organs: false, nerves: true, bloodVessels: false }, skin: 0.12 },
];

export function ControlPanels({ s }: { s: BodyState }) {
  const accent = ACCENT[s.view];
  switch (s.view) {
    case 'wholebody':
      return (
        <>
          <Panel accent={accent} title="Body layers" collapsible>
            {LAYER_DEFS.map((l) => (
              <Check key={l.key} label={l.label} color={l.color} checked={s.layers[l.key]} onChange={(v) => s.setLayers({ ...s.layers, [l.key]: v })} />
            ))}
            {s.layers.skin && <Slider label="Skin transparency" value={Math.round((1 - s.skinOpacity) * 100)} min={0} max={95} step={5} onChange={(v) => s.setSkinOpacity(1 - v / 100)} format={(v) => `${v}%`} />}
          </Panel>
          <Panel accent={accent} title="Quick views" collapsible>
            <div className="hb-grid2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  className="hb-btn"
                  onClick={() => {
                    s.setLayers(p.layers);
                    s.setSkinOpacity(p.skin);
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </Panel>
        </>
      );
    case 'systems':
      return (
        <Panel accent={accent} title="Organ systems">
          <div className="hb-list">
            <button className={`hb-item ${s.system === null ? 'on' : ''}`} onClick={() => s.setSystem(null)}>
              <span className="hb-dot" style={{ background: 'linear-gradient(135deg,#f55,#fc4,#4c8,#58f)' }} />
              All systems
            </button>
            {ORGAN_SYSTEMS.map((x) => (
              <button key={x.id} className={`hb-item ${s.system === x.id ? 'on' : ''}`} style={{ ['--c' as string]: x.color }} onClick={() => s.setSystem(x.id)}>
                <span className="hb-dot" style={{ background: x.color }} />
                {x.name}
              </button>
            ))}
          </div>
        </Panel>
      );
    case 'heart':
      return (
        <>
          <Panel accent={accent} title="Heart rate">
            <div className="hb-row" style={{ marginTop: 0 }}>
              <span>Beats per minute</span>
              <b>{s.bpm} bpm</b>
            </div>
            <input className="hb-range" type="range" min={40} max={180} value={s.bpm} onChange={(e) => s.setBpm(Number(e.target.value))} />
            <div className="hb-ends">
              <span>Rest</span>
              <span>Exercise</span>
            </div>
            <div className="hb-seg" style={{ marginTop: 10 }}>
              <button className={s.bpm < 85 ? 'on' : ''} onClick={() => s.setBpm(70)}>😴 Rest</button>
              <button className={s.bpm >= 85 && s.bpm < 130 ? 'on' : ''} onClick={() => s.setBpm(105)}>🚶 Walk</button>
              <button className={s.bpm >= 130 ? 'on' : ''} onClick={() => s.setBpm(160)}>🏃 Run</button>
            </div>
            <Ecg bpm={s.bpm} />
          </Panel>
          <Panel accent={accent} title="Display" collapsible>
            <Check label="X-ray (see inside the chambers)" checked={s.heartXray} onChange={s.setHeartXray} />
            <Check label="Blood flow particles" checked={s.heartFlow} onChange={s.setHeartFlow} />
            <Check label="Labels" checked={s.heartLabels} onChange={s.setHeartLabels} />
          </Panel>
        </>
      );
    case 'lungs':
      return (
        <>
          <Panel accent={accent} title="Lungs">
            <Seg
              options={[
                { id: 'lungs', label: 'Whole lungs' },
                { id: 'alveoli', label: 'Alveoli zoom' },
              ]}
              value={s.lungMode}
              onChange={s.setLungMode}
            />
            {s.lungMode === 'lungs' && (
              <>
                <Slider label="Breaths / min" value={s.breaths} min={6} max={40} onChange={s.setBreaths} left="Resting ≈ 12–16" right="Exercise" />
                <LungBar />
              </>
            )}
          </Panel>
          <Panel accent={accent} title="Display" collapsible>
            {s.lungMode === 'lungs' && (
              <>
                <Check label="See-through lungs" checked={s.lungXray} onChange={s.setLungXray} />
                <Check label="Bronchial tree" checked={s.lungBronchi} onChange={s.setLungBronchi} />
              </>
            )}
            <Check label="Labels" checked={s.lungLabels} onChange={s.setLungLabels} />
          </Panel>
        </>
      );
    case 'brain':
      return (
        <>
          <Panel accent={accent} title="Brain">
            <Seg
              options={[
                { id: 'brain', label: 'Whole brain' },
                { id: 'neuron', label: 'Neuron zoom' },
              ]}
              value={s.brainMode}
              onChange={s.setBrainMode}
            />
            {s.brainMode === 'neuron' && <Slider label="Signal speed" value={s.neuronSpeed} min={0.3} max={3} step={0.1} onChange={s.setNeuronSpeed} format={(v) => `${v.toFixed(1)}×`} />}
          </Panel>
          {s.brainMode === 'brain' && (
            <Panel accent={accent} title="Regions">
              <div className="hb-list">
                {(Object.keys(LOBE_INFO) as LobeId[]).map((id) => (
                  <button key={id} className={`hb-item ${s.lobe === id ? 'on' : ''}`} style={{ ['--c' as string]: LOBE_COLORS[id] }} onClick={() => s.setLobe(s.lobe === id ? null : id)}>
                    <span className="hb-dot" style={{ background: LOBE_COLORS[id] }} />
                    {LOBE_INFO[id].name}
                  </button>
                ))}
              </div>
              <Check label="Labels" checked={s.brainLabels} onChange={s.setBrainLabels} />
            </Panel>
          )}
        </>
      );
    case 'digestion':
      return (
        <>
          <Panel accent={accent} title="Food journey">
            <input
              className="hb-range"
              type="range"
              min={0}
              max={STAGES.length - 1}
              step={1}
              value={s.stage}
              onChange={(e) => {
                s.setPlaying(false);
                s.setStage(Number(e.target.value));
              }}
            />
            <div className="hb-ends">
              <span>Mouth</span>
              <span>Rectum</span>
            </div>
            <div className="hb-seg" style={{ marginTop: 10 }}>
              <button
                disabled={s.stage === 0}
                onClick={() => {
                  s.setPlaying(false);
                  s.setStage(Math.max(0, s.stage - 1));
                }}
              >
                ← Prev
              </button>
              <button className={s.playing ? 'on' : ''} onClick={() => s.setPlaying(!s.playing)}>
                {s.playing ? '❚❚ Pause' : '▶ Play'}
              </button>
              <button
                disabled={s.stage === STAGES.length - 1}
                onClick={() => {
                  s.setPlaying(false);
                  s.setStage(Math.min(STAGES.length - 1, s.stage + 1));
                }}
              >
                Next →
              </button>
            </div>
            <Slider label="Speed" value={s.digSpeed} min={0.3} max={3} step={0.1} onChange={s.setDigSpeed} format={(v) => `${v.toFixed(1)}×`} />
          </Panel>
          <Panel accent={accent} title="Steps" collapsible>
            <div className="hb-list">
              {STAGES.map((st, i) => (
                <button
                  key={st.id}
                  className={`hb-item ${s.stage === i ? 'on' : ''}`}
                  style={{ ['--c' as string]: accent }}
                  onClick={() => {
                    s.setPlaying(false);
                    s.setStage(i);
                  }}
                >
                  <b style={{ color: accent }}>{i + 1}</b> {st.name}
                </button>
              ))}
            </div>
            <Check label="Camera follows the food" checked={s.follow} onChange={s.setFollow} />
            <Check label="Labels" checked={s.digLabels} onChange={s.setDigLabels} />
          </Panel>
        </>
      );
    case 'crosssection':
      return (
        <>
          <Panel accent={accent} title="Cross-section">
            <Seg
              options={[
                { id: 'y', label: 'Top' },
                { id: 'x', label: 'Side' },
                { id: 'z', label: 'Front' },
              ]}
              value={s.axis}
              onChange={s.setAxis}
            />
            <Slider
              label="Slice"
              value={Math.round(s.slice * 100)}
              min={0}
              max={100}
              onChange={(v) => s.setSlice(v / 100)}
              format={(v) => `${v}%`}
              left={s.axis === 'y' ? 'Feet' : s.axis === 'x' ? 'Right side' : 'Back'}
              right={s.axis === 'y' ? 'Head' : s.axis === 'x' ? 'Left side' : 'Front'}
            />
          </Panel>
          <Panel accent={accent} title="Scan image">
            <SliceImage axis={s.axis} value={s.slice} />
          </Panel>
        </>
      );
    case 'scalezoom': {
      const idx = SCALE_LEVELS.findIndex((l) => l.id === s.level);
      return (
        <Panel accent={accent} title="Zoom level">
          <div className="hb-seg">
            <button disabled={idx === 0} onClick={() => s.setLevel(SCALE_LEVELS[idx - 1].id)}>➖ Zoom out</button>
            <button disabled={idx === SCALE_LEVELS.length - 1} onClick={() => s.setLevel(SCALE_LEVELS[idx + 1].id)}>➕ Zoom in</button>
          </div>
          <div className="hb-list" style={{ marginTop: 6 }}>
            {SCALE_LEVELS.map((l) => (
              <button key={l.id} className={`hb-item ${s.level === l.id ? 'on' : ''}`} style={{ ['--c' as string]: accent }} onClick={() => s.setLevel(l.id)}>
                <span style={{ flex: 1 }}>{l.name}</span>
                <span style={{ fontSize: 11, color: '#9c88b3', fontWeight: 500 }}>{l.sizeLabel}</span>
              </button>
            ))}
          </div>
        </Panel>
      );
    }
  }
}

// ---------------------------------------------------------------------------
// ECG trace (stays in sync with the 3D heart through heartSim)
// ---------------------------------------------------------------------------

const g = (p: number, c: number, w: number) => Math.exp(-(((p - c) / w) ** 2));
const ecg = (p: number) => 0.14 * g(p, 0.05, 0.03) - 0.18 * g(p, 0.12, 0.012) + 1.0 * g(p, 0.145, 0.014) - 0.28 * g(p, 0.17, 0.012) + 0.3 * g(p, 0.36, 0.045);

function Ecg({ bpm }: { bpm: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const W = c.width;
    const H = c.height;
    const buf = new Float32Array(W).fill(0);
    let raf = 0;
    let acc = 0;
    let ph = heartSim.phase;
    let last = performance.now();
    const draw = () => {
      const now = performance.now();
      const dt = Math.min(0.25, (now - last) / 1000);
      last = now;
      acc += dt * 90; // 90 px per second of trace
      while (acc >= 1) {
        acc -= 1;
        buf.copyWithin(0, 1);
        ph = (ph + bpmRef.current / 60 / 90) % 1; // one pixel = 1/90 s
        buf[W - 1] = ecg(ph);
      }
      ctx.fillStyle = '#05060a';
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = 'rgba(80,255,150,0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      ctx.strokeStyle = '#4dff9b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < W; x++) {
        const y = H * 0.72 - buf[x] * H * 0.55;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div style={{ marginTop: 12 }}>
      <div className="hb-row" style={{ marginTop: 0 }}>
        <span>Heartbeat (ECG)</span>
      </div>
      <canvas ref={ref} width={258} height={70} className="hb-canvas-box" />
    </div>
  );
}

function LungBar() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (ref.current) ref.current.style.width = `${Math.round(lungSim.volume * 100)}%`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div style={{ marginTop: 12 }}>
      <div className="hb-row" style={{ marginTop: 0 }}>
        <span>Lung volume</span>
      </div>
      <div className="hb-bar">
        <div ref={ref} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MRI-style slice image
// ---------------------------------------------------------------------------

interface Chain {
  p: [number, number, number][];
  r: number[];
}
let chains: Chain[] | null = null;
function getChains(): Chain[] {
  if (chains) return chains;
  const mk = (curve: ReturnType<typeof armCurve>, rf: (t: number) => number): Chain => {
    const p: [number, number, number][] = [];
    const r: number[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const q = curve.getPointAt(t);
      p.push([q.x, q.y, q.z]);
      r.push(rf(t));
    }
    return { p, r };
  };
  chains = [mk(armCurve(-1), ARM_R), mk(armCurve(1), ARM_R), mk(legCurve(-1), LEG_R), mk(legCurve(1), LEG_R)];
  return chains;
}

function insideBody(x: number, y: number, z: number): boolean {
  if (y > -0.5 && y < 3.12) {
    const t = torsoAt(y);
    const nx = Math.abs(x / t.rx);
    const nz = Math.abs((z - t.cz) / t.rz);
    if (nx ** 2.3 + nz ** 2.3 < 1) return true;
  }
  if (y >= 3.0 && y <= 3.62 && x * x + (z - 0.03) ** 2 < 0.05) return true;
  if (((x / 0.45) ** 2 + ((y - 3.92) / 0.6) ** 2 + ((z - 0.03) / 0.54) ** 2) < 1) return true;
  for (const c of getChains()) {
    for (let i = 0; i < c.p.length; i++) {
      const q = c.p[i];
      if (Math.abs(q[1] - y) > 0.3) continue;
      const dx = x - q[0];
      const dy = y - q[1];
      const dz = z - q[2];
      if (dx * dx + dy * dy + dz * dz < c.r[i] * c.r[i]) return true;
    }
  }
  return false;
}

const hex = (h: string): [number, number, number] => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const SHAPE_RGB = SLICE_SHAPES.map((sh) => hex(sh.color));

const DIMS: Record<SliceAxis, { W: number; H: number }> = {
  y: { W: 235, H: 106 },
  z: { W: 109, H: 239 },
  x: { W: 50, H: 239 },
};

function SliceImage({ axis, value }: { axis: SliceAxis; value: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [found, setFound] = useState<string[]>([]);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const { W, H } = DIMS[axis];
    const k = sliceCoord(axis, value);
    const img = ctx.createImageData(W, H);
    const inside = new Uint8Array(W * H);
    const names = new Set<string>();
    const [x0, x1] = SLICE_RANGE.x;
    const [y0, y1] = SLICE_RANGE.y;
    const [z0, z1] = SLICE_RANGE.z;
    for (let j = 0; j < H; j++) {
      for (let i = 0; i < W; i++) {
        let x: number, y: number, z: number;
        if (axis === 'y') {
          x = x0 + ((i + 0.5) / W) * (x1 - x0);
          z = z1 - ((j + 0.5) / H) * (z1 - z0);
          y = k;
        } else if (axis === 'z') {
          x = x0 + ((i + 0.5) / W) * (x1 - x0);
          y = y1 - ((j + 0.5) / H) * (y1 - y0);
          z = k;
        } else {
          z = z1 - ((i + 0.5) / W) * (z1 - z0);
          y = y1 - ((j + 0.5) / H) * (y1 - y0);
          x = k;
        }
        const o = (j * W + i) * 4;
        if (!insideBody(x, y, z)) {
          img.data[o + 3] = 0;
          continue;
        }
        inside[j * W + i] = 1;
        let rgb: [number, number, number] = [62, 68, 84];
        let hit = -1;
        for (let n = 0; n < SLICE_SHAPES.length; n++) {
          const sh = SLICE_SHAPES[n];
          const dx = (x - sh.c[0]) / sh.r[0];
          const dy = (y - sh.c[1]) / sh.r[1];
          const dz = (z - sh.c[2]) / sh.r[2];
          if (dx * dx + dy * dy + dz * dz < 1) hit = n;
        }
        if (hit >= 0) {
          const sh = SLICE_SHAPES[hit];
          const shade = 0.9 + 0.1 * (((i * 73856093) ^ (j * 19349663)) & 255) / 255;
          rgb = [SHAPE_RGB[hit][0] * shade, SHAPE_RGB[hit][1] * shade, SHAPE_RGB[hit][2] * shade];
          names.add(sh.name);
        }
        img.data[o] = rgb[0];
        img.data[o + 1] = rgb[1];
        img.data[o + 2] = rgb[2];
        img.data[o + 3] = 255;
      }
    }
    // outline
    for (let j = 1; j < H - 1; j++)
      for (let i = 1; i < W - 1; i++) {
        if (!inside[j * W + i]) continue;
        if (!inside[j * W + i - 1] || !inside[j * W + i + 1] || !inside[(j - 1) * W + i] || !inside[(j + 1) * W + i]) {
          const o = (j * W + i) * 4;
          img.data[o] = 230;
          img.data[o + 1] = 190;
          img.data[o + 2] = 160;
        }
      }
    ctx.fillStyle = '#05060a';
    ctx.fillRect(0, 0, W, H);
    ctx.putImageData(img, 0, 0);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '600 11px sans-serif';
    if (axis === 'x') {
      ctx.fillText('A', 3, 12);
      ctx.fillText('P', W - 10, 12);
    } else {
      ctx.fillText('R', 4, 14);
      ctx.fillText('L', W - 11, 14);
      if (axis === 'y') {
        ctx.fillText('front', W / 2 - 14, 12);
      }
    }
    setFound(Array.from(names));
  }, [axis, value]);

  const { W, H } = DIMS[axis];
  return (
    <div>
      <canvas ref={ref} width={W} height={H} className="hb-canvas-box" style={{ maxHeight: 330, objectFit: 'contain' }} />
      <p className="hb-sub">{found.length ? `In this slice: ${found.join(', ')}.` : 'Nothing but muscle and fat at this level.'}</p>
    </div>
  );
}
