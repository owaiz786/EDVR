import * as THREE from 'three';

// A module-level registry that maps body id -> an object whose world
// position equals the body's current world position. Bodies (Planet, Moon,
// Sun) register themselves on mount and unregister on unmount. The fly-to
// camera reads positions from here each frame.
//
// We accept any Object3D-like object (Group, Mesh, ...) that exposes
// getWorldPosition — hence the structural type rather than the strict class.
type AnyObject3D = { getWorldPosition(target: THREE.Vector3): THREE.Vector3 };

const registry = new Map<string, AnyObject3D>();

export function registerBody(id: string, obj: AnyObject3D): void {
  registry.set(id, obj);
}

export function unregisterBody(id: string): void {
  registry.delete(id);
}

// Fill `out` with the body's current world position. Returns false if the
// body is not currently registered.
export function getBodyWorldPosition(id: string, out: THREE.Vector3): boolean {
  const obj = registry.get(id);
  if (!obj) return false;
  obj.getWorldPosition(out);
  return true;
}

export function isBodyRegistered(id: string): boolean {
  return registry.has(id);
}
