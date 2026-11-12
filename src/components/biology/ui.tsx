import { useState, type CSSProperties, type ReactNode } from 'react';

// All Human Body UI is plain HTML laid out with CSS on top of the canvas.
// (Previously the panels lived inside the 3D scene, so they drifted around with
// the camera and overlapped each other.)

export const BIO_CSS = `
.hb-root { position: relative; width: 100vw; height: 100vh; overflow: hidden; background: radial-gradient(ellipse at 50% 40%, #150a1f 0%, #07040c 60%, #020106 100%); font-family: Inter, "Segoe UI", Arial, sans-serif; color: #f4eaff; }
.hb-canvas { position: absolute; inset: 0; }
.hb-ui { position: absolute; inset: 0; pointer-events: none; z-index: 10; }
.hb-tabs { position: absolute; top: 70px; left: 50%; transform: translateX(-50%); display: flex; gap: 4px; padding: 5px; max-width: calc(100vw - 32px); overflow-x: auto; background: rgba(18, 8, 28, 0.88); border: 1px solid rgba(240, 147, 251, 0.35); border-radius: 14px; backdrop-filter: blur(10px); pointer-events: auto; scrollbar-width: none; }
.hb-tabs::-webkit-scrollbar { display: none; }
.hb-tab { flex: 0 0 auto; display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border: 0; border-radius: 10px; background: transparent; color: #d8c8ec; font: 600 13px/1 inherit; font-family: inherit; cursor: pointer; white-space: nowrap; transition: background .15s, color .15s; }
.hb-tab:hover { background: rgba(240, 147, 251, 0.14); color: #fff; }
.hb-tab.on { background: #f093fb; color: #1b0824; }
.hb-dock { position: absolute; top: 126px; left: 16px; right: 16px; bottom: 16px; display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; pointer-events: none; }
.hb-col { pointer-events: auto; display: flex; flex-direction: column; gap: 10px; max-height: 100%; overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(240,147,251,.4) transparent; }
.hb-left { width: 340px; max-width: 40vw; }
.hb-right { width: 290px; max-width: 36vw; }
.hb-panel { background: rgba(18, 8, 28, 0.9); border: 1px solid var(--accent, #f093fb); border-radius: 14px; padding: 14px 16px; backdrop-filter: blur(10px); box-shadow: 0 8px 30px rgba(0,0,0,.45); }
.hb-panel h2 { margin: 0 0 8px; font-size: 18px; line-height: 1.2; color: var(--accent, #f093fb); }
.hb-panel h3 { margin: 0 0 8px; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--accent, #f093fb); }
.hb-panel p { margin: 0 0 10px; font-size: 13.5px; line-height: 1.5; color: #eadcf7; }
.hb-panel ul { margin: 0; padding-left: 18px; font-size: 13px; line-height: 1.55; color: #d9c8ea; }
.hb-panel .hb-sub { font-size: 12px; color: #a893c0; margin: 8px 0 0; line-height: 1.45; }
.hb-phead { display: flex; align-items: center; justify-content: space-between; gap: 8px; cursor: pointer; user-select: none; }
.hb-phead .hb-x { background: transparent; border: 0; color: #a893c0; font-size: 18px; line-height: 1; cursor: pointer; padding: 0 2px; }
.hb-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 10px 0 4px; font-size: 12px; letter-spacing: .06em; text-transform: uppercase; color: #d6c3ea; font-weight: 600; }
.hb-row b { font-family: ui-monospace, Menlo, monospace; font-size: 13px; color: #ffe27a; letter-spacing: 0; }
.hb-range { width: 100%; accent-color: var(--accent, #f093fb); margin: 2px 0; }
.hb-ends { display: flex; justify-content: space-between; font-size: 11px; color: #9c88b3; }
.hb-seg { display: flex; gap: 4px; margin: 4px 0 6px; }
.hb-seg button, .hb-btn { flex: 1; padding: 8px 10px; border-radius: 9px; border: 1px solid rgba(255,255,255,.18); background: rgba(255,255,255,.05); color: #f2e8fb; font: 600 12.5px/1.2 inherit; font-family: inherit; cursor: pointer; transition: background .15s, border-color .15s; }
.hb-seg button:hover, .hb-btn:hover { background: rgba(255,255,255,.12); }
.hb-seg button.on, .hb-btn.on { background: var(--accent, #f093fb); border-color: var(--accent, #f093fb); color: #1b0824; }
.hb-btn:disabled { opacity: .35; cursor: default; }
.hb-check { display: flex; align-items: center; gap: 10px; padding: 7px 4px; font-size: 13.5px; cursor: pointer; border-radius: 8px; }
.hb-check:hover { background: rgba(255,255,255,.05); }
.hb-check input { width: 16px; height: 16px; accent-color: var(--accent, #f093fb); cursor: pointer; }
.hb-dot { width: 14px; height: 14px; border-radius: 4px; flex: 0 0 auto; border: 1px solid rgba(255,255,255,.3); }
.hb-list { display: flex; flex-direction: column; gap: 6px; }
.hb-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,.14); background: rgba(255,255,255,.04); color: #f2e8fb; font: 600 13.5px/1.2 inherit; font-family: inherit; cursor: pointer; text-align: left; transition: background .15s, border-color .15s; }
.hb-item:hover { background: rgba(255,255,255,.1); }
.hb-item.on { background: rgba(255,255,255,.14); border-color: var(--c, #f093fb); box-shadow: inset 3px 0 0 var(--c, #f093fb); }
.hb-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.hb-pill { display: inline-block; padding: 3px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; background: rgba(255,255,255,.1); margin-right: 6px; }
.hb-hint { position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%); font-size: 12px; color: #8f7ba8; pointer-events: none; text-shadow: 0 1px 4px #000; white-space: nowrap; }
.hb-canvas-box { width: 100%; border-radius: 10px; background: #05060a; display: block; border: 1px solid rgba(255,255,255,.12); }
.hb-bar { height: 10px; border-radius: 6px; background: rgba(255,255,255,.1); overflow: hidden; }
.hb-bar > div { height: 100%; background: var(--accent, #f093fb); transition: none; }
@media (max-width: 900px) {
  .hb-tabs { left: 8px; right: 8px; top: 64px; transform: none; max-width: none; }
  .hb-dock { top: auto; left: 8px; right: 8px; bottom: 8px; max-height: 50vh; flex-direction: column; align-items: stretch; overflow-y: auto; pointer-events: auto; gap: 8px; }
  .hb-col { width: auto; max-width: none; overflow: visible; max-height: none; }
  .hb-right { order: -1; }
  .hb-hint { display: none; }
}
`;

export function Panel({
  title,
  accent,
  children,
  collapsible = false,
  onClose,
  style,
}: {
  title?: string;
  accent?: string;
  children: ReactNode;
  collapsible?: boolean;
  onClose?: () => void;
  style?: CSSProperties;
}) {
  const [open, setOpen] = useState(true);
  return (
    <section className="hb-panel" style={{ ['--accent' as string]: accent, ...style }}>
      {title && (
        <div className="hb-phead" onClick={collapsible ? () => setOpen((o) => !o) : undefined}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          {onClose ? (
            <button className="hb-x" onClick={onClose} aria-label="Close">
              ×
            </button>
          ) : collapsible ? (
            <span className="hb-x">{open ? '–' : '+'}</span>
          ) : null}
        </div>
      )}
      {(!collapsible || open) && <div style={{ marginTop: title ? 10 : 0 }}>{children}</div>}
    </section>
  );
}

export function Facts({ items }: { items: string[] }) {
  return (
    <ul>
      {items.map((f) => (
        <li key={f}>{f}</li>
      ))}
    </ul>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  left,
  right,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  left?: string;
  right?: string;
}) {
  return (
    <div>
      <div className="hb-row">
        <span>{label}</span>
        <b>{format ? format(value) : value}</b>
      </div>
      <input className="hb-range" type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      {(left || right) && (
        <div className="hb-ends">
          <span>{left}</span>
          <span>{right}</span>
        </div>
      )}
    </div>
  );
}

export function Seg<T extends string>({ options, value, onChange }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="hb-seg">
      {options.map((o) => (
        <button key={o.id} className={o.id === value ? 'on' : ''} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Check({ label, checked, onChange, color }: { label: string; checked: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <label className="hb-check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {color && <span className="hb-dot" style={{ background: color }} />}
      <span>{label}</span>
    </label>
  );
}
