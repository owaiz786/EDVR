import { Suspense, useState } from 'react';
import { OrbitControls, Html, Billboard, Text } from '@react-three/drei';
import { HumanBodyModel, DEFAULT_LAYERS, type BodyLayers } from '../../components/biology/HumanBodyModel';
import type { OrganDef } from '../../components/biology/bodyData';

const LAYER_INFO: { key: keyof BodyLayers; name: string; color: string }[] = [
  { key: 'skin', name: 'Skin', color: '#e8c4a0' },
  { key: 'muscle', name: 'Muscle', color: '#a83232' },
  { key: 'skeleton', name: 'Skeleton', color: '#e0e0e0' },
  { key: 'organs', name: 'Organs', color: '#fcbf49' },
  { key: 'nerves', name: 'Nerves', color: '#ffd700' },
  { key: 'bloodVessels', name: 'Blood vessels', color: '#d62828' },
];

export default function WholeBody() {
  const [layers, setLayers] = useState<BodyLayers>(DEFAULT_LAYERS);
  const [selectedOrgan, setSelectedOrgan] = useState<OrganDef | null>(null);

  const toggleLayer = (key: keyof BodyLayers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <group>
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={0.8} />
        <directionalLight position={[-5, 4, -3]} intensity={0.3} color="#8899ff" />
        <HumanBodyModel
          layers={layers}
          skinOpacity={layers.organs || layers.muscle || layers.skeleton ? 0.15 : 0.85}
          onOrganClick={setSelectedOrgan}
          selectedOrganId={selectedOrgan?.id ?? null}
        />
        {/* Selected organ label */}
        {selectedOrgan && (
          <Billboard position={[selectedOrgan.position[0], selectedOrgan.position[1] + 0.7, selectedOrgan.position[2]]}>
            <Text fontSize={0.25} color="#ffe08a" anchorX="center" anchorY="bottom" outlineWidth={0.02} outlineColor="#000000">
              {selectedOrgan.name}
            </Text>
          </Billboard>
        )}
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

      {/* Layer toggle panel */}
      <Html position={[0, 0, 0]} center transform={false} style={{ pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: 80, right: 16, zIndex: 1000, pointerEvents: 'auto', width: 240, fontFamily: 'Inter, "Segoe UI", Arial, sans-serif' }}>
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
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f093fb', marginBottom: 12, letterSpacing: 1 }}>
              BODY LAYERS
            </div>
            {LAYER_INFO.map((l) => (
              <label
                key={l.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 13,
                  color: '#e8c8e8',
                  cursor: 'pointer',
                  marginBottom: 8,
                  padding: '4px 0',
                }}
              >
                <input
                  type="checkbox"
                  checked={layers[l.key]}
                  onChange={() => toggleLayer(l.key)}
                  style={{ accentColor: l.color }}
                />
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 4,
                    background: l.color,
                    border: '1px solid rgba(255,255,255,0.3)',
                    display: 'inline-block',
                  }}
                />
                {l.name}
              </label>
            ))}
            <div style={{ fontSize: 11, color: '#9a7a9a', marginTop: 8, lineHeight: 1.4 }}>
              Toggle layers to peel the body apart. Click any organ to learn about it.
            </div>
          </div>
        </div>
      </Html>

      {/* Organ info popup */}
      {selectedOrgan && (
        <Html position={[0, 0, 0]} center transform={false} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              zIndex: 1000,
              pointerEvents: 'auto',
              width: 300,
              background: 'rgba(20, 8, 24, 0.92)',
              color: 'white',
              padding: '16px 18px',
              borderRadius: 12,
              border: `1px solid ${selectedOrgan.color}55`,
              fontFamily: 'Inter, "Segoe UI", Arial, sans-serif',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  background: selectedOrgan.color,
                  border: '1px solid rgba(255,255,255,0.3)',
                  display: 'inline-block',
                }}
              />
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#ffe08a' }}>{selectedOrgan.name}</h3>
            </div>
            <p style={{ margin: '0 0 10px 0', fontSize: 13, lineHeight: 1.5, color: '#dfe8ff' }}>{selectedOrgan.info}</p>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: 12.5, lineHeight: 1.5, color: '#c5d3f0' }}>
              {selectedOrgan.facts.map((f, i) => (
                <li key={i} style={{ marginBottom: 3 }}>{f}</li>
              ))}
            </ul>
            <p
              style={{ margin: '8px 0 0 0', fontSize: 11, color: '#9a7a9a', cursor: 'pointer', textAlign: 'right' }}
              onClick={() => setSelectedOrgan(null)}
            >
              Click empty space to close
            </p>
          </div>
        </Html>
      )}
    </group>
  );
}
