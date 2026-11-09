import { Sun } from './Sun';
import { Planet } from './Planet';
import { OrbitLine } from './OrbitLine';
import { AsteroidBelt } from './AsteroidBelt';
import { PLANETS, SUN, AU_UNIT } from '../data/solarSystem';

interface SolarSystemProps {
  scaleMode: 'visual' | 'true';
  showOrbits: boolean;
  showLabels: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onFlyTo: () => void;
}

export function SolarSystem({
  scaleMode,
  showOrbits,
  showLabels,
  selectedId,
  onSelect,
  onFlyTo,
}: SolarSystemProps) {
  return (
    <group>
      <Sun
        scaleMode={scaleMode}
        selected={selectedId === SUN.id}
        onSelect={onSelect}
        onFlyTo={onFlyTo}
      />

      {PLANETS.map((body) => {
        const semiMajor =
          scaleMode === 'true' ? body.trueDistance : body.visualDistance;
        return (
          <group key={body.id}>
            {showOrbits && body.type !== 'star' && (
              <OrbitLine
                semiMajorAxis={semiMajor}
                eccentricity={body.eccentricity}
                color={body.id === selectedId ? '#ffd966' : '#9bb3ff'}
                opacity={body.id === selectedId ? 0.6 : 0.22}
              />
            )}
            <Planet
              data={body}
              scaleMode={scaleMode}
              showLabels={showLabels}
              selected={body.id === selectedId}
              onSelect={onSelect}
              onFlyTo={onFlyTo}
            />
          </group>
        );
      })}

      <AsteroidBelt scaleMode={scaleMode} />
    </group>
  );
}

// Exported so the camera/controls can compute reasonable max distances.
export const MAX_VISUAL_DISTANCE = 34; // Pluto's visual distance ~30 + margin
export const MAX_TRUE_DISTANCE = 39.482 * AU_UNIT + 40; // Pluto true + margin
