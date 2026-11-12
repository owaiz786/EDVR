import * as THREE from 'three';
import { curveOf, makeEsophagusCurve, makeLargeIntestineCurve, makeSmallIntestineCurve, makeStomachCurve } from './anatomy';

export interface StageDef {
  id: string;
  name: string;
  organId: string; // which organ glows during this stage
  description: string;
  facts: string[];
  // part of a curve the food travels along during this stage
  curve: THREE.Curve<THREE.Vector3>;
  t0: number;
  t1: number;
  // camera when "follow the food" is on: position + target
  cam: { pos: [number, number, number]; target: [number, number, number] };
}

const mouth = curveOf([[0, 3.64, 0.52], [0, 3.63, 0.4], [0, 3.62, 0.3]]);
const esoph = makeEsophagusCurve();
const stomach = makeStomachCurve();
const small = makeSmallIntestineCurve();
const large = makeLargeIntestineCurve();

export const STAGES: StageDef[] = [
  {
    id: 'mouth',
    name: 'Mouth',
    organId: 'mouth',
    description:
      'Digestion begins in the mouth. Teeth tear and grind food into small pieces, and saliva starts breaking down starches with an enzyme called amylase.',
    facts: ['Teeth grind food into small pieces', 'Saliva starts digesting starch', 'Food is shaped into a bolus', 'Takes about 30–60 seconds'],
    curve: mouth,
    t0: 0,
    t1: 1,
    cam: { pos: [2.6, 3.9, 4.6], target: [0, 3.5, 0.2] },
  },
  {
    id: 'esophagus',
    name: 'Esophagus',
    organId: 'esophagus',
    description:
      'The esophagus is a muscular tube that pushes food from the mouth down to the stomach using wave-like muscle contractions called peristalsis.',
    facts: ['About 25 cm long', 'Uses wave-like muscle contractions', 'Called peristalsis', 'Takes about 6–8 seconds'],
    curve: esoph,
    t0: 0,
    t1: 1,
    cam: { pos: [3.2, 2.6, 6.5], target: [0, 2.5, 0] },
  },
  {
    id: 'stomach',
    name: 'Stomach',
    organId: 'stomach',
    description:
      'In the stomach, strong acid and enzymes break food down further. The stomach churns food into a liquid paste called chyme over 2–4 hours.',
    facts: ['pH ~1.5 (very acidic)', 'Churns food for 2–4 hours', 'Makes a liquid paste called chyme', 'Holds about 1 litre'],
    curve: stomach,
    t0: 0,
    t1: 1,
    cam: { pos: [2.4, 1.6, 5.2], target: [0.2, 1.2, 0.1] },
  },
  {
    id: 'small_intestine',
    name: 'Small Intestine',
    organId: 'small_intestine',
    description:
      'The small intestine is where most nutrients are absorbed. Enzymes from the pancreas and bile from the liver finish breaking food down. Tiny finger-like villi absorb nutrients into the blood.',
    facts: ['About 6 m long', 'Most nutrients absorbed here', 'Has tiny villi for absorption', 'Food stays here 3–5 hours'],
    curve: small,
    t0: 0,
    t1: 1,
    cam: { pos: [2.2, 0.8, 5.4], target: [0, 0.35, 0.1] },
  },
  {
    id: 'large_intestine',
    name: 'Large Intestine',
    organId: 'large_intestine',
    description:
      'The large intestine (colon) absorbs water and salts from what is left. Helpful bacteria here also make some vitamins. What is left becomes solid waste.',
    facts: ['About 1.5 m long', 'Absorbs water and salts', 'Home to helpful gut bacteria', 'Forms solid waste'],
    curve: large,
    t0: 0,
    t1: 0.86,
    cam: { pos: [2.2, 0.8, 5.8], target: [0, 0.4, 0.1] },
  },
  {
    id: 'rectum',
    name: 'Rectum',
    organId: 'large_intestine',
    description: 'The rectum stores the solid waste until it leaves the body through the anus.',
    facts: ['Stores solid waste', 'Last stop in the digestive tract', 'Signals the brain when full', 'Waste leaves through the anus'],
    curve: large,
    t0: 0.86,
    t1: 1,
    cam: { pos: [1.8, -0.1, 4.6], target: [0, -0.2, 0.05] },
  },
];

// Position of the food at "stage index + fraction"
export function foodPosition(t: number, out: THREE.Vector3): THREE.Vector3 {
  const i = Math.min(STAGES.length - 1, Math.max(0, Math.floor(t)));
  const f = Math.min(1, Math.max(0, t - i));
  const s = STAGES[i];
  const e = f * f * (3 - 2 * f) * 0.25 + f * 0.75; // gentle ease
  return s.curve.getPointAt(s.t0 + (s.t1 - s.t0) * e, out);
}
