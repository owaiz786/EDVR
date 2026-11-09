import { Suspense, useState } from 'react';
import { OrbitControls, Html } from '@react-three/drei';
import { HumanBodyModel, DEFAULT_LAYERS } from '../../components/biology/HumanBodyModel';
import { ORGAN_SYSTEMS, type OrganSystemId } from '../../components/biology/bodyData';

const SYSTEM_COLORS: Record<OrganSystemId, string> = {
  circulatory: '#d62828',
  respiratory: '#f77f00',
  digestive: '#fcbf49',
  nervous: '#7209b7',
  skeletal: '#e0e0e0',
  excretory: '#2a9d8f',
  endocrine: '#e76f51',
};

export default function OrganSystems() {
  const [selectedSystem, setSelectedSystem] = useState<OrganSystemId | null>('circulatory');
  const sys = ORGAN_SYSTEMS.find((s) => s.id === selectedSystem) || null;

  const layers = { ...DEFAULT_LAYERS, skin: false, organs: true, skeleton: true };

  return (
    <group>
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 8, 5]} intensity={0.7} />
        <HumanBodyModel layers={layers} skinOpacity={0.1} highlightSystem={selectedSystem} />
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={3}
          maxDistance={30}
          target={[0, 1, 0]}
          makeDefault
        />
      </Suspense>

      {/* System picker */}
      <Html position={[0, 0, 0]} center transform={false} style={{ pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: 80, right: 16, zIndex: 1000, pointerEvents: 'auto', width: 250, fontFamily: 'Inter, "Segoe UI", Arial, sans-serif' }}>
          <div
            style={{
              background: 'rgba(20, 8, 24, 0.85)',
              border: '1px solid rgba(240, 147, 251, 0.35)',
              borderRadius: 12,
              color: 'white',
              padding: 16,
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f093fb', marginBottom: 10, letterSpacing: 1 }}>
              ORGAN SYSTEMS
            </div>
            {ORGAN_SYSTEMS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSystem(s.id)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  marginBottom: 4,
                  fontSize: 12.5,
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: selectedSystem === s.id ? `${SYSTEM_COLORS[s.id]}33` : 'transparent',
                  color: selectedSystem === s.id ? '#ffe08a' : '#e8c8e8',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 3,
                    background: SYSTEM_COLORS[s.id],
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </Html>

      {/* System info panel */}
      {sys && (
        <Html position={[0, 0, 0]} center transform={false} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              zIndex: 1000,
              pointerEvents: 'auto',
              width: 320,
              background: 'rgba(20, 8, 24, 0.92)',
              color: 'white',
              padding: '16px 18px',
              borderRadius: 12,
              border: `1px solid ${SYSTEM_COLORS[sys.id]}66`,
              fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 700, color: '#ffe08a' }}>
              {sys.name}
            </h3>
            <p style={{ margin: '0 0 10px 0', fontSize: 13, lineHeight: 1.5, color: '#dfe8ff' }}>{sys.description}</p>
            <div style={{ fontSize: 11, color: '#f093fb', fontWeight: 700, marginBottom: 4 }}>Key facts</div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: 12.5, lineHeight: 1.5, color: '#c5d3f0' }}>
              {sys.facts.map((f, i) => (
                <li key={i} style={{ marginBottom: 3 }}>{f}</li>
              ))}
            </ul>
          </div>
        </Html>
      )}
    </group>
  );
}
