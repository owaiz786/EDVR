// Data for the human body module: organs, systems, labels and info text.
// Coordinates are in "body space": the figure is 9 units tall (feet y = -4.5,
// top of head y = +4.5), centred on the origin and facing +Z. The body's RIGHT
// side is at -X (the viewer's left).
//
// The 3D shapes themselves are built in anatomy.ts / HumanBodyModel.tsx; this
// file only holds the descriptive data and a few helpers.

export interface OrganDef {
  id: string;
  name: string;
  system: OrganSystemId;
  // Where the floating label sits in body space.
  labelAt: [number, number, number];
  color: string;
  info: string;
  facts: string[];
}

export type OrganSystemId =
  | 'circulatory'
  | 'respiratory'
  | 'digestive'
  | 'nervous'
  | 'skeletal'
  | 'excretory'
  | 'endocrine';

export interface OrganSystemDef {
  id: OrganSystemId;
  name: string;
  color: string;
  description: string;
  facts: string[];
}

export const ORGAN_SYSTEMS: OrganSystemDef[] = [
  {
    id: 'circulatory',
    name: 'Circulatory System',
    color: '#d62828',
    description:
      'The circulatory (cardiovascular) system pumps blood around your body. The heart is the pump, and a vast network of arteries, veins, and capillaries carries oxygen, nutrients, and hormones to every cell — and carries waste away.',
    facts: [
      'Your heart beats about 100,000 times a day',
      'There are about 100,000 km of blood vessels in your body',
      'Arteries carry blood away from the heart; veins bring it back',
      'Red blood cells live for about 120 days',
    ],
  },
  {
    id: 'respiratory',
    name: 'Respiratory System',
    color: '#f77f00',
    description:
      'The respiratory system brings oxygen into the body and removes carbon dioxide. Air travels through the nose, trachea, and bronchi into the lungs, where tiny sacs called alveoli exchange gases with the blood.',
    facts: [
      'You breathe about 20,000 times a day',
      'The lungs have ~300 million alveoli for gas exchange',
      'The left lung is slightly smaller to make room for the heart',
      'You could live with one lung',
    ],
  },
  {
    id: 'digestive',
    name: 'Digestive System',
    color: '#fcbf49',
    description:
      'The digestive system breaks food down into nutrients your body can absorb. It runs from the mouth, through the esophagus, stomach, and intestines, helped along the way by the liver, gallbladder, and pancreas.',
    facts: [
      'The small intestine is about 6 m long',
      'The large intestine is about 1.5 m long',
      'Food takes 24–72 hours to pass all the way through',
      'The stomach can hold about 1 litre of food',
    ],
  },
  {
    id: 'nervous',
    name: 'Nervous System',
    color: '#7209b7',
    description:
      'The nervous system controls your body and processes information. The brain and spinal cord form the central nervous system; nerves branching out to the rest of the body form the peripheral nervous system.',
    facts: [
      'The brain has about 86 billion neurons',
      'Nerve signals travel up to 120 m/s',
      'The spinal cord is about 45 cm long',
      'The brain uses about 20% of your energy',
    ],
  },
  {
    id: 'skeletal',
    name: 'Skeletal System',
    color: '#e0e0e0',
    description:
      'The skeletal system is your body\'s framework — 206 bones in an adult. It supports you, protects your organs, makes blood cells (in the marrow), and stores minerals like calcium.',
    facts: [
      'Babies are born with about 270 bones; adults have 206',
      'The smallest bone is in the ear (the stapes)',
      'The longest bone is the femur (thigh)',
      'Bone marrow makes about 2 million red blood cells per second',
    ],
  },
  {
    id: 'excretory',
    name: 'Excretory System',
    color: '#2a9d8f',
    description:
      'The excretory system removes waste and keeps the body\'s fluids in balance. The kidneys filter blood to make urine; the skin sweats out water and salts; the lungs exhale carbon dioxide.',
    facts: [
      'The kidneys filter about 180 litres of blood per day',
      'Each kidney has about 1 million filtering units (nephrons)',
      'You sweat out about 0.5–1 litre per day',
      'Urine is about 95% water',
    ],
  },
  {
    id: 'endocrine',
    name: 'Endocrine System',
    color: '#e76f51',
    description:
      'The endocrine system is a network of glands that release hormones into the blood. Hormones are chemical messengers that control growth, metabolism, reproduction, mood, and many other processes.',
    facts: [
      'The pituitary gland is only the size of a pea but controls growth',
      'The thyroid controls how fast your body uses energy',
      'The pancreas makes insulin to control blood sugar',
      'Adrenal glands release adrenaline for the "fight or flight" response',
    ],
  },
];

export const ORGANS: OrganDef[] = [
  // --- Circulatory ---
  {
    id: 'heart',
    name: 'Heart',
    system: 'circulatory',
    labelAt: [1.2, 1.95, 0.5],
    color: '#c0392b',
    info: 'The heart is a muscular pump that beats about 100,000 times a day, pushing blood through your whole body. It has four chambers: two atria (top) and two ventricles (bottom).',
    facts: ['Beats ~100,000 times/day', '4 chambers', 'Pumps ~5 L of blood/min', 'About the size of your fist'],
  },
  {
    id: 'aorta',
    name: 'Aorta & vena cava',
    system: 'circulatory',
    labelAt: [0.8, 2.75, 0.1],
    color: '#d62828',
    info: 'The aorta is the largest artery. It carries oxygen-rich blood from the left ventricle to the rest of the body. The vena cava (blue) brings oxygen-poor blood back to the right atrium.',
    facts: ['The aorta is the largest artery', 'About 3 cm wide', 'Arteries (red) carry blood away from the heart', 'Veins (blue) carry it back'],
  },
  // --- Respiratory ---
  {
    id: 'left_lung',
    name: 'Left Lung',
    system: 'respiratory',
    labelAt: [1.5, 2.5, 0.3],
    color: '#ee9a8b',
    info: 'The left lung is slightly smaller than the right to make room for the heart. It has two lobes (the right has three). Lungs take in oxygen and release carbon dioxide.',
    facts: ['Two lobes (right has three)', 'Smaller to fit the heart', '~300 million alveoli inside', 'Expands when you breathe in'],
  },
  {
    id: 'right_lung',
    name: 'Right Lung',
    system: 'respiratory',
    labelAt: [-1.5, 2.5, 0.3],
    color: '#ee9a8b',
    info: 'The right lung has three lobes and is slightly larger than the left. Together, the lungs exchange oxygen and carbon dioxide with the blood.',
    facts: ['Three lobes', 'Slightly larger than left', 'Connects to the trachea', 'Lined with tiny air sacs (alveoli)'],
  },
  {
    id: 'trachea',
    name: 'Trachea (Windpipe)',
    system: 'respiratory',
    labelAt: [0.6, 3.1, 0.3],
    color: '#e8d5c4',
    info: 'The trachea, or windpipe, carries air from the nose and throat down into the lungs. It is kept open by rings of cartilage and splits into two bronchi.',
    facts: ['About 10–12 cm long', 'Kept open by cartilage rings', 'Splits into two bronchi', 'Carries air to the lungs'],
  },
  // --- Digestive ---
  {
    id: 'esophagus',
    name: 'Esophagus',
    system: 'digestive',
    labelAt: [-0.6, 3.3, 0.3],
    color: '#d98c7a',
    info: 'The esophagus is a muscular tube that pushes food from the throat to the stomach using wave-like muscle contractions called peristalsis.',
    facts: ['About 25 cm long', 'Moves food by peristalsis', 'Passes through the diaphragm', 'Takes about 6–8 seconds'],
  },
  {
    id: 'stomach',
    name: 'Stomach',
    system: 'digestive',
    labelAt: [1.3, 1.2, 0.5],
    color: '#e08a7a',
    info: 'The stomach churns food and mixes it with acid and enzymes to start breaking it down. It can hold about 1 litre of food.',
    facts: ['Holds about 1 L of food', 'pH ~1.5 (very acidic)', 'Lined with protective mucus', 'Churns food for 2–4 hours'],
  },
  {
    id: 'liver',
    name: 'Liver',
    system: 'digestive',
    labelAt: [-1.4, 1.4, 0.5],
    color: '#9c4030',
    info: 'The liver is the largest internal organ. It filters toxins from the blood, makes bile to digest fat, stores energy, and makes important proteins.',
    facts: ['Largest internal organ', 'Makes bile for fat digestion', 'Filters toxins from blood', 'Can regrow if part is removed'],
  },
  {
    id: 'gallbladder',
    name: 'Gallbladder',
    system: 'digestive',
    labelAt: [-1.0, 0.8, 0.5],
    color: '#4f8a3c',
    info: 'The gallbladder is a small pouch under the liver that stores bile and releases it into the small intestine when you eat fatty food.',
    facts: ['Stores bile from the liver', 'About 7–10 cm long', 'Releases bile after fatty meals', 'You can live without it'],
  },
  {
    id: 'pancreas',
    name: 'Pancreas',
    system: 'digestive',
    labelAt: [1.0, 0.7, 0.2],
    color: '#e6c27a',
    info: 'The pancreas makes enzymes that digest food, and also makes insulin to control blood sugar. It is part of both the digestive and endocrine systems.',
    facts: ['Makes digestive enzymes', 'Makes insulin', 'Both digestive and endocrine', 'About 15 cm long'],
  },
  {
    id: 'small_intestine',
    name: 'Small Intestine',
    system: 'digestive',
    labelAt: [-1.2, 0.2, 0.5],
    color: '#f0a58c',
    info: 'The small intestine is where most nutrients are absorbed. Despite its name, it is about 6 metres long — but it is narrower than the large intestine.',
    facts: ['About 6 m long', 'Most nutrients absorbed here', 'Has tiny finger-like villi', 'Food stays here 3–5 hours'],
  },
  {
    id: 'large_intestine',
    name: 'Large Intestine',
    system: 'digestive',
    labelAt: [1.3, 0.3, 0.4],
    color: '#c98a64',
    info: 'The large intestine (colon) absorbs water and salts from what is left of the food, and forms the solid waste (faeces).',
    facts: ['About 1.5 m long', 'Absorbs water and salts', 'Forms solid waste', 'Home to helpful gut bacteria'],
  },
  // --- Nervous ---
  {
    id: 'brain',
    name: 'Brain',
    system: 'nervous',
    labelAt: [1.0, 4.3, 0.3],
    color: '#d9a0a8',
    info: 'The brain is the control centre of the body. It has about 86 billion neurons and uses about 20% of your energy, even though it is only 2% of your body weight.',
    facts: ['~86 billion neurons', 'Uses 20% of your energy', '4 main lobes', 'Protected by the skull'],
  },
  {
    id: 'spinal_cord',
    name: 'Spinal Cord',
    system: 'nervous',
    labelAt: [-0.6, 2.6, -0.5],
    color: '#f2e2a0',
    info: 'The spinal cord is a bundle of nerve fibres that runs from the brain down through the spine. It carries signals between the brain and the rest of the body.',
    facts: ['About 45 cm long', 'Carries signals to/from brain', 'Protected by the spine', '31 pairs of spinal nerves branch off'],
  },
  // --- Excretory ---
  {
    id: 'left_kidney',
    name: 'Left Kidney',
    system: 'excretory',
    labelAt: [1.2, 1.0, -0.4],
    color: '#8e3b46',
    info: 'The kidneys filter waste and extra water from the blood to make urine. Each kidney has about 1 million tiny filtering units called nephrons.',
    facts: ['~1 million nephrons each', 'Filters 180 L of blood/day', 'Bean-shaped', 'Sits at the back of the abdomen'],
  },
  {
    id: 'right_kidney',
    name: 'Right Kidney',
    system: 'excretory',
    labelAt: [-1.2, 0.9, -0.4],
    color: '#8e3b46',
    info: 'The right kidney sits slightly lower than the left (the liver pushes it down). Like the left, it filters blood and makes urine.',
    facts: ['Sits slightly lower than left', 'Filters blood continuously', 'Connects to a ureter', 'About 10 cm long'],
  },
  {
    id: 'bladder',
    name: 'Bladder',
    system: 'excretory',
    labelAt: [0.8, -0.2, 0.4],
    color: '#e8c36a',
    info: 'The bladder stores urine from the kidneys until you go to the toilet. It can hold about 400–600 ml.',
    facts: ['Holds 400–600 ml of urine', 'Muscular, stretchy walls', 'Signals the brain when full', 'Empties through the urethra'],
  },
  // --- Endocrine ---
  {
    id: 'pituitary',
    name: 'Pituitary Gland',
    system: 'endocrine',
    labelAt: [0.7, 3.75, 0.4],
    color: '#e76f51',
    info: 'The pituitary gland is the size of a pea but is called the "master gland" because its hormones control many other glands, including growth, thyroid, and reproductive organs.',
    facts: ['The size of a pea', 'Called the "master gland"', 'Hangs from the brain', 'Controls growth and other glands'],
  },
  {
    id: 'thyroid',
    name: 'Thyroid',
    system: 'endocrine',
    labelAt: [0.6, 3.0, 0.4],
    color: '#c0603f',
    info: 'The thyroid is a butterfly-shaped gland in the neck. Its hormones control how fast your body uses energy (metabolism).',
    facts: ['Butterfly-shaped', 'In the front of the neck', 'Controls metabolism', 'Needs iodine to work'],
  },
  {
    id: 'adrenal',
    name: 'Adrenal Glands',
    system: 'endocrine',
    labelAt: [0.9, 1.5, -0.4],
    color: '#d9a441',
    info: 'The adrenal glands sit on top of the kidneys. They make adrenaline, the "fight or flight" hormone, and cortisol, which helps you handle stress.',
    facts: ['Sit on top of the kidneys', 'Make adrenaline', 'Help handle stress', 'Two small triangular glands'],
  },
  {
    id: 'spleen',
    name: 'Spleen',
    system: 'circulatory',
    labelAt: [1.4, 1.5, -0.2],
    color: '#6b2d4a',
    info: 'The spleen filters old red blood cells out of the blood and helps the immune system fight infection. It sits on the left side, behind the stomach.',
    facts: ['Filters old red blood cells', 'Stores white blood cells', 'About the size of your fist', 'Sits behind the stomach'],
  },
];

// Rough ellipsoid versions of the organs, used to draw the MRI-style slice
// image in the Cross-section view. [cx, cy, cz], [rx, ry, rz]
export interface SliceShape {
  id: string;
  name: string;
  color: string;
  c: [number, number, number];
  r: [number, number, number];
  tissue?: 'bone';
}

export const SLICE_SHAPES: SliceShape[] = [
  { id: 'brain', name: 'brain', color: '#d9a0a8', c: [0, 3.98, -0.04], r: [0.38, 0.3, 0.46] },
  { id: 'trachea', name: 'trachea', color: '#9fd3e6', c: [0, 2.9, 0.06], r: [0.085, 0.55, 0.085] },
  { id: 'right_lung', name: 'lung', color: '#ee9a8b', c: [-0.47, 2.05, -0.02], r: [0.42, 0.85, 0.4] },
  { id: 'left_lung', name: 'lung', color: '#ee9a8b', c: [0.47, 2.05, -0.02], r: [0.38, 0.85, 0.4] },
  { id: 'heart', name: 'heart', color: '#d64045', c: [0.18, 1.9, 0.12], r: [0.42, 0.52, 0.36] },
  { id: 'liver', name: 'liver', color: '#b5503a', c: [-0.32, 1.3, 0.12], r: [0.68, 0.38, 0.45] },
  { id: 'stomach', name: 'stomach', color: '#e08a7a', c: [0.45, 1.2, 0.14], r: [0.3, 0.42, 0.25] },
  { id: 'spleen', name: 'spleen', color: '#8a3a66', c: [0.9, 1.3, -0.18], r: [0.16, 0.3, 0.12] },
  { id: 'pancreas', name: 'pancreas', color: '#e6c27a', c: [0.15, 0.98, -0.05], r: [0.5, 0.08, 0.08] },
  { id: 'right_kidney', name: 'kidney', color: '#b04a5a', c: [-0.5, 1.0, -0.28], r: [0.17, 0.33, 0.14] },
  { id: 'left_kidney', name: 'kidney', color: '#b04a5a', c: [0.5, 1.1, -0.28], r: [0.17, 0.33, 0.14] },
  { id: 'small_intestine', name: 'small intestine', color: '#f0a58c', c: [0, 0.3, 0.2], r: [0.55, 0.5, 0.15] },
  { id: 'colon_a', name: 'colon', color: '#c98a64', c: [-0.64, 0.4, 0.2], r: [0.1, 0.55, 0.1] },
  { id: 'colon_d', name: 'colon', color: '#c98a64', c: [0.65, 0.45, 0.1], r: [0.1, 0.55, 0.1] },
  { id: 'colon_t', name: 'colon', color: '#c98a64', c: [0, 0.85, 0.3], r: [0.6, 0.1, 0.1] },
  { id: 'colon_s', name: 'colon', color: '#c98a64', c: [0.2, -0.15, 0.15], r: [0.32, 0.1, 0.1] },
  { id: 'bladder', name: 'bladder', color: '#e8c36a', c: [0, -0.12, 0.2], r: [0.2, 0.2, 0.2] },
  // bones & spine
  { id: 'spine_c', name: 'spine', color: '#f4f4ee', c: [0, 3.0, -0.22], r: [0.09, 0.55, 0.09], tissue: 'bone' },
  { id: 'spine_t', name: 'spine', color: '#f4f4ee', c: [0, 1.8, -0.33], r: [0.12, 0.8, 0.12], tissue: 'bone' },
  { id: 'spine_l', name: 'spine', color: '#f4f4ee', c: [0, 0.7, -0.25], r: [0.15, 0.55, 0.14], tissue: 'bone' },
  { id: 'sacrum', name: 'sacrum', color: '#f4f4ee', c: [0, -0.1, -0.28], r: [0.2, 0.3, 0.1], tissue: 'bone' },
  { id: 'skull', name: 'skull', color: '#f4f4ee', c: [0, 3.98, -0.04], r: [0.44, 0.52, 0.52], tissue: 'bone' },
  { id: 'femur_r', name: 'femur', color: '#f4f4ee', c: [-0.42, -1.0, 0.04], r: [0.075, 1.0, 0.075], tissue: 'bone' },
  { id: 'femur_l', name: 'femur', color: '#f4f4ee', c: [0.42, -1.0, 0.04], r: [0.075, 1.0, 0.075], tissue: 'bone' },
  { id: 'tibia_r', name: 'tibia', color: '#f4f4ee', c: [-0.39, -3.1, 0.02], r: [0.06, 1.0, 0.06], tissue: 'bone' },
  { id: 'tibia_l', name: 'tibia', color: '#f4f4ee', c: [0.39, -3.1, 0.02], r: [0.06, 1.0, 0.06], tissue: 'bone' },
  { id: 'humerus_r', name: 'humerus', color: '#f4f4ee', c: [-1.2, 1.85, -0.01], r: [0.06, 0.78, 0.06], tissue: 'bone' },
  { id: 'humerus_l', name: 'humerus', color: '#f4f4ee', c: [1.2, 1.85, -0.01], r: [0.06, 0.78, 0.06], tissue: 'bone' },
];

export function getOrgansBySystem(system: OrganSystemId): OrganDef[] {
  return ORGANS.filter((o) => o.system === system);
}

export function getOrganById(id: string): OrganDef | undefined {
  return ORGANS.find((o) => o.id === id);
}
