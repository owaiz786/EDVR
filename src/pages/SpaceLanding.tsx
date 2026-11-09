import type { View } from '../App';

interface SpaceLandingProps {
  onBack: () => void;
  onSelect: (v: View) => void;
}

interface ModuleCard {
  id: 'solar' | 'daynight' | 'eclipses' | 'stars';
  title: string;
  subtitle: string;
  description: string;
  emoji: string;
  gradient: string;
  features: string[];
}

const MODULES: ModuleCard[] = [
  {
    id: 'solar',
    title: 'Solar System Explorer',
    subtitle: 'The full system, in VR',
    description:
      'Travel through the whole Solar System. Click any planet, moon, or the Sun to fly to it and read about it.',
    emoji: '🪐',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    features: ['8 planets + Pluto', 'Major moons', 'True vs visual scale', 'Real elliptical orbits'],
  },
  {
    id: 'daynight',
    title: 'Day, Night & Seasons',
    subtitle: 'Why does the Sun move?',
    description:
      'Tilt Earth, move it around the Sun, and watch the light change. See why we have day, night, and the four seasons.',
    emoji: '🌍',
    gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    features: ["Earth's 23.4° tilt", 'A year of seasons', 'Polar day & night', 'Day length at any latitude'],
  },
  {
    id: 'eclipses',
    title: 'Eclipses & Moon Phases',
    subtitle: 'Shadows in space',
    description:
      'Drag the Moon around Earth and watch the shadow geometry. See every Moon phase, and find out when eclipses happen.',
    emoji: '🌑',
    gradient: 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)',
    features: ['All 8 Moon phases', 'Solar & lunar eclipses', 'Umbra & penumbra', 'View of the Moon from Earth'],
  },
  {
    id: 'stars',
    title: 'Stars & Beyond',
    subtitle: 'Constellations, star life, black holes',
    description:
      'Find real constellations in the sky, watch the life cycle of a star from nebula to black hole, and see a black hole with a glowing accretion disk.',
    emoji: '✨',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    features: ['8 famous constellations', 'Star life cycle slider', 'Black hole + accretion disk', 'Real star positions'],
  },
];

export default function SpaceLanding({ onBack, onSelect }: SpaceLandingProps) {
  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse at center, #0a0e27 0%, #050714 60%, #000000 100%)',
        color: 'white',
        fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
        overflow: 'auto',
        position: 'relative',
      }}
    >
      {/* Back to categories button */}
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
          background: 'rgba(8, 12, 28, 0.85)',
          color: 'white',
          border: '1px solid rgba(91, 158, 255, 0.5)',
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
      {/* Decorative starfield using CSS */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage:
            'radial-gradient(2px 2px at 20% 30%, white, transparent), radial-gradient(1px 1px at 60% 70%, white, transparent), radial-gradient(1.5px 1.5px at 80% 20%, white, transparent), radial-gradient(1px 1px at 40% 80%, white, transparent), radial-gradient(2px 2px at 90% 50%, white, transparent), radial-gradient(1px 1px at 10% 60%, white, transparent), radial-gradient(1.5px 1.5px at 70% 90%, white, transparent), radial-gradient(1px 1px at 30% 10%, white, transparent), radial-gradient(2px 2px at 50% 50%, white, transparent), radial-gradient(1px 1px at 85% 75%, white, transparent)',
          backgroundSize: '600px 600px',
          opacity: 0.6,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 1200,
          margin: '0 auto',
          padding: '60px 24px 80px',
        }}
      >
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div
            style={{
              display: 'inline-block',
              fontSize: 64,
              lineHeight: 1,
              marginBottom: 16,
              filter: 'drop-shadow(0 0 20px rgba(91, 158, 255, 0.5))',
            }}
          >
            🌌
          </div>
          <h1
            style={{
              fontSize: 44,
              fontWeight: 800,
              margin: '0 0 12px 0',
              letterSpacing: -0.5,
              background: 'linear-gradient(135deg, #ffffff 0%, #9bb3ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Space Explorer VR
          </h1>
          <p
            style={{
              fontSize: 18,
              color: '#9bb3ff',
              maxWidth: 600,
              margin: '0 auto',
              lineHeight: 1.5,
            }}
          >
            Four interactive learning modules about space — built for school
            students. Pick a topic below to start exploring.
          </p>
        </div>

        {/* Module grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
          }}
        >
          {MODULES.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              style={{
                background: 'rgba(15, 20, 45, 0.75)',
                border: '1px solid rgba(91, 158, 255, 0.3)',
                borderRadius: 16,
                padding: 0,
                cursor: 'pointer',
                textAlign: 'left',
                color: 'white',
                fontFamily: 'inherit',
                overflow: 'hidden',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(91, 158, 255, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(91, 158, 255, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(91, 158, 255, 0.3)';
              }}
            >
              {/* Header strip with gradient + emoji */}
              <div
                style={{
                  background: m.gradient,
                  padding: '32px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 56,
                  lineHeight: 1,
                }}
              >
                <span style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}>
                  {m.emoji}
                </span>
              </div>
              {/* Body */}
              <div style={{ padding: '20px 24px 24px' }}>
                <div
                  style={{
                    fontSize: 11,
                    color: '#9bb3ff',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginBottom: 4,
                    fontWeight: 600,
                  }}
                >
                  {m.subtitle}
                </div>
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    margin: '0 0 8px 0',
                    color: 'white',
                  }}
                >
                  {m.title}
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    color: '#c5d3f0',
                    lineHeight: 1.5,
                    margin: '0 0 16px 0',
                  }}
                >
                  {m.description}
                </p>
                <ul
                  style={{
                    margin: '0 0 16px 0',
                    padding: 0,
                    listStyle: 'none',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 6,
                  }}
                >
                  {m.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        fontSize: 12,
                        color: '#9bb3ff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <span style={{ color: '#5b9eff' }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    background: 'rgba(91, 158, 255, 0.15)',
                    border: '1px solid rgba(91, 158, 255, 0.4)',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#9bb3ff',
                  }}
                >
                  Open module →
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            marginTop: 60,
            fontSize: 13,
            color: '#5a6a8a',
          }}
        >
          Built with React Three Fiber, Three.js & WebXR · Works on desktop and VR headsets
        </div>
      </div>
    </div>
  );
}
