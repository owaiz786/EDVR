import type { View } from '../App';

interface BiologyLandingProps {
  onBack: () => void;
  onSelect: (v: View) => void;
}

const MODULES = [
  {
    id: 'humanbody',
    title: 'Human Body Explorer',
    subtitle: '8 interactive views',
    description:
      'Take apart the human body layer by layer. Watch the heart beat and the lungs breathe, explore the brain, follow food through digestion, slice the body like an MRI, and zoom from the whole body all the way down to DNA.',
    emoji: '🧍',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    features: [
      'Layer toggles (skin → skeleton)',
      '7 organ systems',
      'Beating heart + lungs',
      'Brain + neuron zoom',
      'Digestion journey',
      'MRI-style cross-section',
      'Body → DNA scale zoom',
    ],
  },
];

export default function BiologyLanding({ onBack, onSelect }: BiologyLandingProps) {
  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse at center, #1a0820 0%, #0a0410 60%, #000000 100%)',
        color: 'white',
        fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <button
        onClick={onBack}
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          zIndex: 100,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 18px',
          background: 'rgba(20, 8, 24, 0.85)',
          color: 'white',
          border: '1px solid rgba(240, 147, 251, 0.5)',
          borderRadius: 10,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 600,
          fontFamily: 'inherit',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        ← Categories
      </button>

      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage:
            'radial-gradient(2px 2px at 20% 30%, white, transparent), radial-gradient(1px 1px at 60% 70%, white, transparent), radial-gradient(1.5px 1.5px at 80% 20%, white, transparent), radial-gradient(1px 1px at 40% 80%, white, transparent), radial-gradient(2px 2px at 90% 50%, white, transparent)',
          backgroundSize: '600px 600px',
          opacity: 0.3,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 800,
          margin: '0 auto',
          padding: '90px 24px 80px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-block', fontSize: 56, marginBottom: 12 }}>🧬</div>
          <h1
            style={{
              fontSize: 40,
              fontWeight: 800,
              margin: '0 0 10px 0',
              background: 'linear-gradient(135deg, #ffffff 0%, #f093fb 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Biology
          </h1>
          <p style={{ fontSize: 16, color: '#e8a0e8', maxWidth: 540, margin: '0 auto' }}>
            Interactive modules about the human body and life sciences.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 24 }}>
          {MODULES.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelect(m.id as View)}
              style={{
                background: 'rgba(20, 8, 24, 0.8)',
                border: '1px solid rgba(240, 147, 251, 0.3)',
                borderRadius: 16,
                padding: 0,
                cursor: 'pointer',
                textAlign: 'left',
                color: 'white',
                fontFamily: 'inherit',
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                backdropFilter: 'blur(8px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(240, 147, 251, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  background: m.gradient,
                  padding: '36px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 64,
                }}
              >
                <span style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}>{m.emoji}</span>
              </div>
              <div style={{ padding: '24px 28px 28px' }}>
                <div style={{ fontSize: 11, color: '#f093fb', textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 700, marginBottom: 6 }}>
                  {m.subtitle}
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 10px 0' }}>{m.title}</h2>
                <p style={{ fontSize: 14, color: '#e8c8e8', lineHeight: 1.55, margin: '0 0 18px 0' }}>{m.description}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 18 }}>
                  {m.features.map((f) => (
                    <div key={f} style={{ fontSize: 12, color: '#f093fb', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#f5576c' }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 20px',
                    background: 'rgba(240, 147, 251, 0.15)',
                    border: '1px solid rgba(240, 147, 251, 0.4)',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#f093fb',
                  }}
                >
                  Open module →
                </div>
              </div>
            </button>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48, fontSize: 13, color: '#7a5a7a' }}>
          More biology modules coming soon (plants, ecosystems, cells…)
        </div>
      </div>
    </div>
  );
}
