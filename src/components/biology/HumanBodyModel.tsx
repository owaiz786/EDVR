import { useMemo } from 'react';
import * as THREE from 'three';
import { ORGANS, type OrganSystemId, type OrganDef } from './bodyData';

export interface BodyLayers {
  skin: boolean;
  muscle: boolean;
  skeleton: boolean;
  organs: boolean;
  nerves: boolean;
  bloodVessels: boolean;
}

export const DEFAULT_LAYERS: BodyLayers = {
  skin: true,
  muscle: false,
  skeleton: false,
  organs: true,
  nerves: false,
  bloodVessels: false,
};

interface HumanBodyModelProps {
  layers: BodyLayers;
  // If set, organs belonging to this system are full colour; others are dimmed.
  highlightSystem?: OrganSystemId | null;
  // Opacity of the skin layer (default 0.25) — set higher for opaque skin.
  skinOpacity?: number;
  // Whether to register click handlers on organs.
  onOrganClick?: (organ: OrganDef) => void;
  selectedOrganId?: string | null;
}

// A stylised human figure built from primitives, with toggleable layers.
// The figure stands ~10 units tall, centred at origin, facing +Z.
export function HumanBodyModel({
  layers,
  highlightSystem = null,
  skinOpacity = 0.22,
  onOrganClick,
  selectedOrganId = null,
}: HumanBodyModelProps) {
  return (
    <group>
      {layers.skin && <SkinLayer opacity={skinOpacity} />}
      {layers.muscle && <MuscleLayer />}
      {layers.skeleton && <SkeletonLayer />}
      {layers.organs && (
        <OrgansLayer
          highlightSystem={highlightSystem}
          onOrganClick={onOrganClick}
          selectedOrganId={selectedOrganId}
        />
      )}
      {layers.nerves && <NervesLayer />}
      {layers.bloodVessels && <BloodVesselsLayer />}
    </group>
  );
}

// ---------- Skin (outer body surface) ----------

function SkinLayer({ opacity }: { opacity: number }) {
  return (
    <group>
      {/* Head */}
      <mesh position={[0, 4.2, 0]}>
        <sphereGeometry args={[0.75, 32, 32]} />
        <meshStandardMaterial color="#e8c4a0" transparent opacity={opacity} roughness={0.8} depthWrite={false} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 3.4, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 0.4, 16]} />
        <meshStandardMaterial color="#e8c4a0" transparent opacity={opacity} roughness={0.8} depthWrite={false} />
      </mesh>
      {/* Torso (chest + abdomen) */}
      <mesh position={[0, 1.5, 0]}>
        <capsuleGeometry args={[0.95, 2.2, 8, 16]} />
        <meshStandardMaterial color="#e8c4a0" transparent opacity={opacity} roughness={0.8} depthWrite={false} />
      </mesh>
      {/* Pelvis */}
      <mesh position={[0, -0.5, 0]}>
        <capsuleGeometry args={[0.85, 0.3, 8, 16]} />
        <meshStandardMaterial color="#e8c4a0" transparent opacity={opacity} roughness={0.8} depthWrite={false} />
      </mesh>
      {/* Arms (upper + lower) */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 1.15, 2.2, 0]} rotation={[0, 0, side * 0.15]}>
            <capsuleGeometry args={[0.18, 1.2, 8, 12]} />
            <meshStandardMaterial color="#e8c4a0" transparent opacity={opacity} roughness={0.8} depthWrite={false} />
          </mesh>
          <mesh position={[side * 1.45, 0.9, 0]} rotation={[0, 0, side * 0.05]}>
            <capsuleGeometry args={[0.15, 1.0, 8, 12]} />
            <meshStandardMaterial color="#e8c4a0" transparent opacity={opacity} roughness={0.8} depthWrite={false} />
          </mesh>
          <mesh position={[side * 1.5, 0.2, 0]}>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial color="#e8c4a0" transparent opacity={opacity} roughness={0.8} depthWrite={false} />
          </mesh>
        </group>
      ))}
      {/* Legs (thigh + shin) */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.45, -1.6, 0]}>
            <capsuleGeometry args={[0.28, 1.8, 8, 12]} />
            <meshStandardMaterial color="#e8c4a0" transparent opacity={opacity} roughness={0.8} depthWrite={false} />
          </mesh>
          <mesh position={[side * 0.45, -3.6, 0]}>
            <capsuleGeometry args={[0.22, 1.8, 8, 12]} />
            <meshStandardMaterial color="#e8c4a0" transparent opacity={opacity} roughness={0.8} depthWrite={false} />
          </mesh>
          <mesh position={[side * 0.45, -4.7, 0.1]}>
            <sphereGeometry args={[0.25, 12, 12]} />
            <meshStandardMaterial color="#e8c4a0" transparent opacity={opacity} roughness={0.8} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---------- Muscle layer (red tissue underneath the skin) ----------

function MuscleLayer() {
  return (
    <group>
      {/* Torso muscle mass */}
      <mesh position={[0, 1.5, 0]}>
        <capsuleGeometry args={[0.85, 2.0, 8, 16]} />
        <meshStandardMaterial color="#a83232" roughness={0.7} transparent opacity={0.85} />
      </mesh>
      {/* Limb muscles */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 1.15, 2.2, 0]} rotation={[0, 0, side * 0.15]}>
            <capsuleGeometry args={[0.14, 1.1, 8, 12]} />
            <meshStandardMaterial color="#a83232" roughness={0.7} transparent opacity={0.85} />
          </mesh>
          <mesh position={[side * 0.45, -1.6, 0]}>
            <capsuleGeometry args={[0.24, 1.7, 8, 12]} />
            <meshStandardMaterial color="#a83232" roughness={0.7} transparent opacity={0.85} />
          </mesh>
          <mesh position={[side * 0.45, -3.6, 0]}>
            <capsuleGeometry args={[0.18, 1.7, 8, 12]} />
            <meshStandardMaterial color="#a83232" roughness={0.7} transparent opacity={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---------- Skeleton ----------

function SkeletonLayer() {
  const boneMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#e8e8e0', roughness: 0.6 }),
    [],
  );
  return (
    <group>
      {/* Skull */}
      <mesh position={[0, 4.2, 0]} material={boneMat}>
        <sphereGeometry args={[0.7, 24, 24]} />
      </mesh>
      {/* Ribcage (curved front) */}
      {[-0.6, -0.3, 0, 0.3, 0.6].map((y, i) => (
        <mesh key={i} position={[0, 2.4 + y, 0.5]} material={boneMat}>
          <torusGeometry args={[0.55 - Math.abs(y) * 0.1, 0.04, 8, 32, Math.PI * 0.75]} />
        </mesh>
      ))}
      {/* Spine */}
      {Array.from({ length: 10 }).map((_, i) => (
        <mesh key={i} position={[0, 3.0 - i * 0.45, -0.3]} material={boneMat}>
          <cylinderGeometry args={[0.12, 0.12, 0.18, 12]} />
        </mesh>
      ))}
      {/* Pelvis */}
      <mesh position={[0, -0.5, 0]} material={boneMat}>
        <torusGeometry args={[0.6, 0.12, 8, 24]} />
      </mesh>
      {/* Arm bones */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 1.0, 2.4, 0]} rotation={[0, 0, side * 0.1]} material={boneMat}>
            <cylinderGeometry args={[0.06, 0.06, 1.4, 10]} />
          </mesh>
          <mesh position={[side * 1.3, 1.0, 0]} material={boneMat}>
            <cylinderGeometry args={[0.05, 0.05, 1.2, 10]} />
          </mesh>
        </group>
      ))}
      {/* Leg bones */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.4, -1.6, 0]} material={boneMat}>
            <cylinderGeometry args={[0.08, 0.08, 2.0, 10]} />
          </mesh>
          <mesh position={[side * 0.4, -3.6, 0]} material={boneMat}>
            <cylinderGeometry args={[0.07, 0.07, 2.0, 10]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---------- Organs ----------

function OrgansLayer({
  highlightSystem,
  onOrganClick,
  selectedOrganId,
}: {
  highlightSystem: OrganSystemId | null;
  onOrganClick?: (o: OrganDef) => void;
  selectedOrganId: string | null;
}) {
  return (
    <group>
      {ORGANS.map((o) => {
        const isHighlighted = highlightSystem === null || o.system === highlightSystem;
        const dimmed = !isHighlighted;
        const isSelected = selectedOrganId === o.id;
        return (
          <OrganMesh
            key={o.id}
            organ={o}
            dimmed={dimmed}
            selected={isSelected}
            onClick={onOrganClick}
          />
        );
      })}
    </group>
  );
}

function OrganMesh({
  organ,
  dimmed,
  selected,
  onClick,
}: {
  organ: OrganDef;
  dimmed: boolean;
  selected: boolean;
  onClick?: (o: OrganDef) => void;
}) {
  const color = dimmed ? '#444444' : organ.color;
  const opacity = dimmed ? 0.35 : selected ? 1.0 : 0.92;
  const emissive = selected ? organ.color : '#000000';
  const emissiveIntensity = selected ? 0.4 : 0;

  const common = {
    position: organ.position as [number, number, number],
    onPointerOver: (e: any) => {
      e.stopPropagation();
      if (!dimmed) document.body.style.cursor = 'pointer';
    },
    onPointerOut: () => {
      document.body.style.cursor = 'auto';
    },
    onClick: (e: any) => {
      e.stopPropagation();
      if (onClick && !dimmed) onClick(organ);
    },
  };

  const mat = (
    <meshStandardMaterial
      color={color}
      transparent={opacity < 1}
      opacity={opacity}
      roughness={0.6}
      metalness={0}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
    />
  );

  if (organ.shape === 'sphere') {
    return (
      <mesh {...common}>
        <sphereGeometry args={[organ.size[0], 24, 24]} />
        {mat}
      </mesh>
    );
  }
  if (organ.shape === 'ellipsoid') {
    const s = organ.size as [number, number, number];
    return (
      <mesh {...common} scale={[s[0], s[1], s[2]]}>
        <sphereGeometry args={[1, 24, 24]} />
        {mat}
      </mesh>
    );
  }
  if (organ.shape === 'tube') {
    return (
      <mesh {...common}>
        <cylinderGeometry args={[organ.size[0], organ.size[0], organ.size[1], 16]} />
        {mat}
      </mesh>
    );
  }
  if (organ.shape === 'torus') {
    return (
      <mesh {...common} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[organ.size[0], organ.size[1], 16, 48]} />
        {mat}
      </mesh>
    );
  }
  return null;
}

// ---------- Nerves (yellow lines from brain/spine to limbs) ----------

function NervesLayer() {
  const nerveColor = '#ffd700';
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    // Brain → spine
    pts.push(new THREE.Vector3(0, 4.2, 0), new THREE.Vector3(0, 3.0, -0.3));
    // Spine down
    for (let i = 0; i < 10; i++) {
      pts.push(new THREE.Vector3(0, 3.0 - i * 0.45, -0.3));
    }
    return pts;
  }, []);
  const spineGeom = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  // Arm nerves
  const armNerves = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    for (const side of [-1, 1]) {
      lines.push([
        new THREE.Vector3(0, 2.6, -0.2),
        new THREE.Vector3(side * 1.0, 2.4, 0),
        new THREE.Vector3(side * 1.3, 1.0, 0),
        new THREE.Vector3(side * 1.5, 0.2, 0),
      ]);
    }
    return lines;
  }, []);
  // Leg nerves
  const legNerves = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    for (const side of [-1, 1]) {
      lines.push([
        new THREE.Vector3(0, -0.5, -0.3),
        new THREE.Vector3(side * 0.4, -1.6, 0),
        new THREE.Vector3(side * 0.4, -3.6, 0),
      ]);
    }
    return lines;
  }, []);

  return (
    <group>
      <primitive object={new THREE.Line(spineGeom, new THREE.LineBasicMaterial({ color: nerveColor, linewidth: 2 }))} />
      {[...armNerves, ...legNerves].map((line, i) => (
        <primitive
          key={i}
          object={new THREE.Line(new THREE.BufferGeometry().setFromPoints(line), new THREE.LineBasicMaterial({ color: nerveColor, linewidth: 2 }))}
        />
      ))}
      {/* Brain glow */}
      <mesh position={[0, 4.2, 0]} scale={[0.7, 0.6, 0.7]}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial color="#7209b7" emissive="#7209b7" emissiveIntensity={0.3} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

// ---------- Blood vessels (arteries red + veins blue) ----------

function BloodVesselsLayer() {
  // Arteries (red) from heart outward; veins (blue) returning.
  const arteries = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    // Aorta up
    lines.push([new THREE.Vector3(-0.3, 1.9, 0.4), new THREE.Vector3(0, 2.4, 0.4), new THREE.Vector3(0, 3.0, 0.3)]);
    // To arms
    for (const side of [-1, 1]) {
      lines.push([new THREE.Vector3(0, 2.4, 0.4), new THREE.Vector3(side * 1.0, 2.2, 0.3), new THREE.Vector3(side * 1.3, 1.0, 0.2), new THREE.Vector3(side * 1.5, 0.2, 0.1)]);
    }
    // To legs
    for (const side of [-1, 1]) {
      lines.push([new THREE.Vector3(-0.3, 1.9, 0.4), new THREE.Vector3(side * 0.3, 0.5, 0.4), new THREE.Vector3(side * 0.4, -1.6, 0.3), new THREE.Vector3(side * 0.4, -3.6, 0.2)]);
    }
    return lines;
  }, []);

  const veins = useMemo(() => {
    // Veins run parallel, slightly offset, in blue.
    return arteries.map((line) => line.map((p) => new THREE.Vector3(p.x, p.y, p.z + 0.15)));
  }, [arteries]);

  return (
    <group>
      {arteries.map((line, i) => (
        <primitive
          key={`a-${i}`}
          object={new THREE.Line(new THREE.BufferGeometry().setFromPoints(line), new THREE.LineBasicMaterial({ color: '#d62828', linewidth: 3 }))}
        />
      ))}
      {veins.map((line, i) => (
        <primitive
          key={`v-${i}`}
          object={new THREE.Line(new THREE.BufferGeometry().setFromPoints(line), new THREE.LineBasicMaterial({ color: '#1d3557', linewidth: 3 }))}
        />
      ))}
    </group>
  );
}
