import { useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

// A large inverted sphere with a Milky Way starfield texture, plus a
// generated field of bright point stars for depth.
export function Stars() {
  const starTexture = useTexture('/textures/starfield.png');
  starTexture.colorSpace = THREE.SRGBColorSpace;
  starTexture.mapping = THREE.EquirectangularReflectionMapping;

  const pointGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const starCount = 8000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const radius = 400 + Math.random() * 400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      // Slight colour variation: white, blue-white, yellow-white
      const t = Math.random();
      if (t < 0.7) {
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 1;
      } else if (t < 0.85) {
        colors[i * 3] = 0.7;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 1;
      } else {
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.95;
        colors[i * 3 + 2] = 0.7;
      }
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, []);

  return (
    <group>
      {/* Big sphere with the Milky Way background */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[900, 64, 64]} />
        <meshBasicMaterial map={starTexture} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      {/* Bright point stars */}
      <points geometry={pointGeometry}>
        <pointsMaterial
          vertexColors
          size={1.2}
          sizeAttenuation
          transparent
          depthWrite={false}
        />
      </points>
    </group>
  );
}
