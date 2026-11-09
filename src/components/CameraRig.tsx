import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getBodyDisplayRadius } from '../data/solarSystem';
import { getBodyWorldPosition } from './bodyRegistry';

interface CameraRigProps {
  selectedId: string | null;
  scaleMode: 'visual' | 'true';
  // Increment to (re)trigger a fly-to the currently selected body.
  flyToken: number;
  // Increment to fly back to the default overview (and clear follow).
  resetToken: number;
}

// Default overview camera pose (matches the Canvas camera initial position).
const DEFAULT_CAMERA_POS = new THREE.Vector3(0, 25, 45);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);

// How hard to lerp while flying vs. while idling.
const FLY_LERP = 0.06;

export function CameraRig({ selectedId, scaleMode, flyToken, resetToken }: CameraRigProps) {
  const flyingRef = useRef(false);
  const resettingRef = useRef(false);
  const lastSelectedRef = useRef<string | null>(null);
  const lastBodyPos = useRef<THREE.Vector3 | null>(null);

  // Scratch vectors (avoid per-frame allocations).
  const bodyPos = useRef(new THREE.Vector3());
  const desiredTarget = useRef(new THREE.Vector3());
  const desiredCamPos = useRef(new THREE.Vector3());
  const dir = useRef(new THREE.Vector3());
  const delta = useRef(new THREE.Vector3());

  // (Re)start a fly-to when the selection actually changes, or when flyToken changes.
  useEffect(() => {
    if (selectedId && selectedId !== lastSelectedRef.current) {
      flyingRef.current = true;
      resettingRef.current = false;
    }
    if (!selectedId) {
      flyingRef.current = false;
      lastBodyPos.current = null;
    }
    lastSelectedRef.current = selectedId;
  }, [selectedId]);

  useEffect(() => {
    if (flyToken > 0 && selectedId) {
      flyingRef.current = true;
      resettingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyToken]);

  // Reset to the overview pose when the reset token changes.
  useEffect(() => {
    if (resetToken > 0) {
      resettingRef.current = true;
      flyingRef.current = false;
      lastBodyPos.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetToken]);

  useFrame((state) => {
    const oc = state.controls as
      | (THREE.EventDispatcher & { target: THREE.Vector3; update: () => void })
      | null;
    const camera = state.camera;
    if (!oc) return;

    // Reset takes priority: lerp camera and target back to the overview.
    if (resettingRef.current) {
      oc.target.lerp(DEFAULT_TARGET, FLY_LERP);
      camera.position.lerp(DEFAULT_CAMERA_POS, FLY_LERP);
      oc.update();
      if (camera.position.distanceTo(DEFAULT_CAMERA_POS) < 0.5) {
        resettingRef.current = false;
      }
      return;
    }

    if (!selectedId) {
      // Nothing to follow; leave the camera where it is so the user can
      // freely orbit/zoom/pan around the scene.
      lastBodyPos.current = null;
      return;
    }

    const found = getBodyWorldPosition(selectedId, bodyPos.current);
    if (!found) return;

    if (flyingRef.current) {
      // Compute a comfortable viewing distance from the body's display radius.
      const radius = getBodyDisplayRadius(selectedId, scaleMode);
      const distance = Math.max(radius * 8, radius + 3, 1.2);

      // Keep the user's current viewing direction so the arrival angle feels
      // natural; fall back to a slightly-elevated view if no direction is set.
      dir.current.copy(camera.position).sub(oc.target);
      if (dir.current.lengthSq() < 0.01) dir.current.set(0, 0.4, 1);
      dir.current.normalize();

      desiredTarget.current.copy(bodyPos.current);
      desiredCamPos.current.copy(bodyPos.current).add(dir.current.multiplyScalar(distance));

      oc.target.lerp(desiredTarget.current, FLY_LERP);
      camera.position.lerp(desiredCamPos.current, FLY_LERP);
      oc.update();

      // Snap the "last body position" so the follow handover is seamless.
      lastBodyPos.current = bodyPos.current.clone();

      // Stop flying once we are close enough; switch to follow mode.
      if (camera.position.distanceTo(desiredCamPos.current) < distance * 0.08) {
        flyingRef.current = false;
      }
    } else {
      // Follow mode: track the body's movement so it stays framed. The user
      // can still orbit, zoom, and pan; we only apply the body's delta.
      if (lastBodyPos.current) {
        delta.current.copy(bodyPos.current).sub(lastBodyPos.current);
        if (delta.current.lengthSq() > 0) {
          oc.target.add(delta.current);
          camera.position.add(delta.current);
          oc.update();
        }
      }
      lastBodyPos.current = bodyPos.current.clone();
    }
  });

  return null;
}
