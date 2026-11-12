import { useMemo } from 'react';
import * as THREE from 'three';

interface OrbitLineProps {
  semiMajorAxis: number; // a
  eccentricity: number; // e
  color?: string;
  opacity?: number;
}

// Draws an elliptical orbit with the Sun at one focus (origin).
// Parametric form: x = a(cos E - e), z = b sin E, where b = a*sqrt(1 - e^2).
export function OrbitLine({
  semiMajorAxis,
  eccentricity,
  color = '#ffffff',
  opacity = 0.25,
}: OrbitLineProps) {
  const lineObject = useMemo(() => {
    const a = Math.max(0.001, semiMajorAxis);
    const e = Math.min(0.95, Math.max(0, eccentricity));
    const b = a * Math.sqrt(1 - e * e);
    const pts: THREE.Vector3[] = [];
    const segments = 256;
    for (let i = 0; i <= segments; i++) {
      const E = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(a * (Math.cos(E) - e), 0, b * Math.sin(E)));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(pts);
    const material = new THREE.LineBasicMaterial({
      color,
      opacity,
      transparent: true,
    });
    return new THREE.LineLoop(geometry, material);
  }, [semiMajorAxis, eccentricity, color, opacity]);

  return <primitive object={lineObject} />;
}
