import { useState } from 'react';

interface ControlsProps {
  scaleMode: 'visual' | 'true';
  setScaleMode: (m: 'visual' | 'true') => void;
  timeSpeed: number;
  setTimeSpeed: (n: number) => void;
  showOrbits: boolean;
  setShowOrbits: (b: boolean) => void;
  showLabels: boolean;
  setShowLabels: (b: boolean) => void;
  onEnterVR: () => void;
  selectedId: string | null;
  onFlyToSelected: () => void;
  onResetView: () => void;
}

const SPEED_PRESETS: { label: string; value: number }[] = [
  { label: 'Pause', value: 0 },
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '10x', value: 10 },
  { label: '50x', value: 50 },
  { label: '100x', value: 100 },
];

// Friendly description of the current speed.
function speedDescription(speed: number): string {
  if (speed === 0) return 'Paused';
  // At 1x, 1 Earth year = 60 s.
  const secondsPerYear = 60 / speed;
  if (secondsPerYear >= 1) {
    return `1 Earth year = ${secondsPerYear.toFixed(secondsPerYear >= 10 ? 0 : 1)} s`;
  }
  return `1 Earth year = ${(secondsPerYear * 1000).toFixed(0)} ms`;
}

export function Controls({
  scaleMode,
  setScaleMode,
  timeSpeed,
  setTimeSpeed,
  showOrbits,
  setShowOrbits,
  showLabels,
  setShowLabels,
  onEnterVR,
  selectedId,
  onFlyToSelected,
  onResetView,
}: ControlsProps) {
  const [open, setOpen] = useState(true);

  return (
    <>
      {/* Top bar with title and VR button */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pointerEvents: 'none',
          fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
        }}
      >
        <div
          style={{
            background: 'rgba(8, 12, 28, 0.78)',
            border: '1px solid rgba(91, 158, 255, 0.35)',
            borderRadius: 12,
            padding: '10px 16px',
            color: 'white',
            pointerEvents: 'auto',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 0.3 }}>
            <span style={{ color: '#5b9eff' }}>Solar System</span> VR
          </div>
          <div style={{ fontSize: 11, color: '#9bb3ff', marginTop: 2 }}>
            Interactive exploration for students
          </div>
        </div>

        <button
          onClick={onEnterVR}
          style={{
            pointerEvents: 'auto',
            padding: '12px 22px',
            fontSize: 15,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
          }}
        >
          Enter VR
        </button>
      </div>

      {/* Main control panel */}
      <div
        style={{
          position: 'absolute',
          top: 80,
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
            overflow: 'hidden',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        >
          <button
            onClick={() => setOpen(!open)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              textAlign: 'left',
            }}
          >
            <span>Controls</span>
            <span style={{ fontSize: 12, color: '#9bb3ff' }}>
              {open ? 'hide ▲' : 'show ▼'}
            </span>
          </button>

          {open && (
            <div style={{ padding: '0 16px 16px 16px' }}>
              {/* Scale toggle */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#9bb3ff', fontWeight: 600, marginBottom: 6 }}>
                  SCALE
                </div>
                <div style={{ display: 'flex', gap: 6, background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: 4 }}>
                  {(['visual', 'true'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setScaleMode(m)}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        fontSize: 13,
                        fontWeight: 600,
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        background: scaleMode === m ? '#5b9eff' : 'transparent',
                        color: scaleMode === m ? '#08101f' : '#cfe0ff',
                        transition: 'all 0.15s',
                      }}
                    >
                      {m === 'visual' ? 'Visual' : 'True scale'}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: '#7a8db0', marginTop: 6, lineHeight: 1.4 }}>
                  {scaleMode === 'visual'
                    ? 'Sizes and distances are compressed so all planets are easy to see.'
                    : 'Distances are at the real ratio (1 AU = 8 units) — see how empty space really is! Planet sizes are also at their real relative ratios; the Sun is shown smaller than reality so it does not cover Mercury.'}
                </div>
              </div>

              {/* Time speed */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: '#9bb3ff', fontWeight: 600 }}>TIME SPEED</span>
                  <span style={{ fontSize: 11, color: '#ffe08a', fontFamily: 'monospace' }}>
                    {speedDescription(timeSpeed)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={0.5}
                  value={timeSpeed}
                  onChange={(e) => setTimeSpeed(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#5b9eff' }}
                />
                <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                  {SPEED_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => setTimeSpeed(p.value)}
                      style={{
                        flex: '1 1 30%',
                        padding: '5px 0',
                        fontSize: 11,
                        fontWeight: 600,
                        border: '1px solid rgba(91,158,255,0.4)',
                        borderRadius: 5,
                        cursor: 'pointer',
                        background: timeSpeed === p.value ? 'rgba(91,158,255,0.25)' : 'transparent',
                        color: timeSpeed === p.value ? '#ffe08a' : '#cfe0ff',
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: '#7a8db0', marginTop: 6, lineHeight: 1.4 }}>
                  Orbits use real periods and elliptical shapes (Kepler's laws). At 1x speed, one Earth year takes about 60 seconds.
                </div>
              </div>

              {/* Display toggles */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: '#9bb3ff', fontWeight: 600, marginBottom: 6 }}>DISPLAY</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#cfe0ff', cursor: 'pointer', marginBottom: 4 }}>
                  <input type="checkbox" checked={showOrbits} onChange={(e) => setShowOrbits(e.target.checked)} style={{ accentColor: '#5b9eff' }} />
                  Show orbit lines
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#cfe0ff', cursor: 'pointer' }}>
                  <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} style={{ accentColor: '#5b9eff' }} />
                  Show planet labels
                </label>
              </div>

              {/* Camera (fly-to + reset) */}
              <div style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 12, color: '#9bb3ff', fontWeight: 600, marginBottom: 6 }}>CAMERA</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={onFlyToSelected}
                    disabled={!selectedId}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      fontSize: 12,
                      fontWeight: 600,
                      border: '1px solid rgba(91,158,255,0.4)',
                      borderRadius: 6,
                      cursor: selectedId ? 'pointer' : 'not-allowed',
                      background: selectedId ? 'rgba(91,158,255,0.25)' : 'transparent',
                      color: selectedId ? '#ffe08a' : '#5a6a8a',
                      opacity: selectedId ? 1 : 0.6,
                    }}
                    title={selectedId ? 'Fly the camera to the selected body' : 'Select a body first'}
                  >
                    Fly to selected
                  </button>
                  <button
                    onClick={onResetView}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      fontSize: 12,
                      fontWeight: 600,
                      border: '1px solid rgba(91,158,255,0.4)',
                      borderRadius: 6,
                      cursor: 'pointer',
                      background: 'transparent',
                      color: '#cfe0ff',
                    }}
                  >
                    Reset view
                  </button>
                </div>
                <div style={{ fontSize: 11, color: '#7a8db0', marginTop: 6, lineHeight: 1.4 }}>
                  {selectedId
                    ? `Following the selected body. Click empty space or "Reset view" to release.`
                    : `Click any body to fly to it and lock the camera on it as it moves.`}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help panel (bottom-left) */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          zIndex: 1000,
          color: 'white',
          fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
          background: 'rgba(8, 12, 28, 0.78)',
          padding: '14px 16px',
          borderRadius: 12,
          maxWidth: 280,
          border: '1px solid rgba(91, 158, 255, 0.35)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 8, color: '#5b9eff', fontSize: 14 }}>
          How to explore
        </div>
        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: 12.5, lineHeight: 1.6, color: '#dfe8ff' }}>
          <li>Click any planet, moon, or the Sun to fly to it and see facts</li>
          <li>Click empty space (or <b>Reset view</b>) to release the camera</li>
          <li>Drag to orbit, scroll to zoom, right-drag to pan</li>
          <li>Switch between <b>Visual</b> and <b>True scale</b></li>
          <li>Use the time-speed slider to fast-forward orbits</li>
          <li>On a VR headset, press <b>Enter VR</b></li>
        </ul>
      </div>
    </>
  );
}
