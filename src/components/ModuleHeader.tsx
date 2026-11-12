interface ModuleHeaderProps {
  title: string;
  onBack: () => void;
  accentColor?: string;
}

// A consistent header bar shown on every module page: a back button on the
// left, the module title centred, on top of the 3D canvas.
export function ModuleHeader({ title, onBack, accentColor = '#5b9eff' }: ModuleHeaderProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        pointerEvents: 'auto',
        fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
      }}
    >
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          background: 'rgba(8, 12, 28, 0.85)',
          color: 'white',
          border: `1px solid ${accentColor}55`,
          borderRadius: 10,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 600,
          fontFamily: 'inherit',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        }}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }}>←</span>
        Home
      </button>
      <div
        style={{
          padding: '8px 16px',
          background: 'rgba(8, 12, 28, 0.85)',
          border: `1px solid ${accentColor}55`,
          borderRadius: 10,
          color: 'white',
          fontSize: 15,
          fontWeight: 700,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        {title}
      </div>
    </div>
  );
}
