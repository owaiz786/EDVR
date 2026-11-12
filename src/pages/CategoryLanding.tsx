import type { View } from '../App';

interface CategoryLandingProps {
  onSelect: (v: View) => void;
}

const CATEGORIES = [
  {
    id: 'space',
    title: 'Space Science',
    subtitle: 'Explore the cosmos',
    description:
      'Travel through the Solar System, watch day and night, find eclipses, and discover constellations, star life cycles, and black holes.',
    emoji: '🌌',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    modules: ['Solar System', 'Day & Night', 'Eclipses', 'Stars & Beyond'],
  },
  {
    id: 'biology',
    title: 'Biology',
    subtitle: 'Explore the human body',
    description:
      'Take apart the human body layer by layer, watch the heart beat and the lungs breathe, follow food through digestion, and zoom from the whole body down to DNA.',
    emoji: '🧬',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    modules: ['Whole Body', 'Organ Systems', 'Heart', 'Lungs', 'Brain', 'Digestion', 'Cross-section', 'Scale Zoom'],
  },
];

export default function CategoryLanding({ onSelect }: CategoryLandingProps) {
  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse at top, #0a0e27 0%, #050714 60%, #000000 100%)',
        color: 'white',
        fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'auto',
        padding: 24,
      }}
    >
      {/* Starfield */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage:
            'radial-gradient(2px 2px at 20% 30%, white, transparent), radial-gradient(1px 1px at 60% 70%, white, transparent), radial-gradient(1.5px 1.5px at 80% 20%, white, transparent), radial-gradient(1px 1px at 40% 80%, white, transparent), radial-gradient(2px 2px at 90% 50%, white, transparent), radial-gradient(1px 1px at 10% 60%, white, transparent)',
          backgroundSize: '600px 600px',
          opacity: 0.5,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1000, width: '100%', textAlign: 'center' }}>
        <h1
          style={{
            fontSize: 48,
            fontWeight: 800,
            margin: '0 0 12px 0',
            letterSpacing: -0.5,
            background: 'linear-gradient(135deg, #ffffff 0%, #9bb3ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Explore VR
        </h1>
        <p style={{ fontSize: 18, color: '#9bb3ff', marginBottom: 48, maxWidth: 600, margin: '0 auto 48px' }}>
          Interactive learning modules for school students. Pick a subject to begin.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelect(c.id as View)}
              style={{
                background: 'rgba(15, 20, 45, 0.75)',
                border: '1px solid rgba(91, 158, 255, 0.3)',
                borderRadius: 20,
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
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 16px 50px rgba(91, 158, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  background: c.gradient,
                  padding: '40px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 80,
                }}
              >
                <span style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>{c.emoji}</span>
              </div>
              <div style={{ padding: '24px 28px 28px' }}>
                <div style={{ fontSize: 11, color: '#9bb3ff', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 700, marginBottom: 6 }}>
                  {c.subtitle}
                </div>
                <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 10px 0' }}>{c.title}</h2>
                <p style={{ fontSize: 14, color: '#c5d3f0', lineHeight: 1.55, margin: '0 0 18px 0' }}>
                  {c.description}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                  {c.modules.map((m) => (
                    <span
                      key={m}
                      style={{
                        fontSize: 11,
                        color: '#9bb3ff',
                        padding: '4px 10px',
                        background: 'rgba(91, 158, 255, 0.12)',
                        border: '1px solid rgba(91, 158, 255, 0.3)',
                        borderRadius: 12,
                      }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 20px',
                    background: 'rgba(91, 158, 255, 0.15)',
                    border: '1px solid rgba(91, 158, 255, 0.4)',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#9bb3ff',
                  }}
                >
                  Choose {c.title} →
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
