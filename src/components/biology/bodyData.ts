// Data for the human body module: organ positions, systems, and labels.
// Coordinates are in "body space" where the figure stands ~10 units tall,
// centred at the origin, facing +Z.

export interface OrganDef {
  id: string;
  name: string;
  system: OrganSystemId;
  // Position in body space (approximate, stylised).
  position: [number, number, number];
  // One of: 'ellipsoid' | 'sphere' | 'tube' | 'custom'
  shape: 'ellipsoid' | 'sphere' | 'tube' | 'torus';
  // For ellipsoid/sphere: [rx, ry, rz]; for tube: [radius, length]; for torus: [r, tube]
  size: [number, number] | [number, number, number];
  color: string;
  // Short description for the label popup.
  info: string;
  // Brief facts.
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

// Organ positions are stylised. The body model is ~10 units tall, centred at
// origin, head at y ≈ 4.5, feet at y ≈ -5.
export const ORGANS: OrganDef[] = [
  // --- Circulatory ---
  {
    id: 'heart',
    name: 'Heart',
    system: 'circulatory',
    position: [-0.3, 1.9, 0.4],
    shape: 'ellipsoid',
    size: [0.55, 0.7, 0.5],
    color: '#d62828',
    info: 'The heart is a muscular pump that beats about 100,000 times a day, pushing blood through your whole body. It has four chambers: two atria (top) and two ventricles (bottom).',
    facts: ['Beats ~100,000 times/day', '4 chambers', 'Pumps ~5 L of blood/min', 'About the size of your fist'],
  },
  {
    id: 'aorta',
    name: 'Aorta',
    system: 'circulatory',
    position: [0, 2.3, 0.3],
    shape: 'tube',
    size: [0.08, 1.2],
    color: '#b51717',
    info: 'The aorta is the largest artery in the body. It carries oxygen-rich blood from the left ventricle of the heart to the rest of the body.',
    facts: ['The largest artery', 'About 3 cm wide', 'Carries oxygen-rich blood', 'First blood vessel to leave the heart'],
  },
  // --- Respiratory ---
  {
    id: 'left_lung',
    name: 'Left Lung',
    system: 'respiratory',
    position: [-0.9, 2.2, 0.2],
    shape: 'ellipsoid',
    size: [0.5, 1.4, 0.5],
    color: '#f77f00',
    info: 'The left lung is slightly smaller than the right to make room for the heart. It has two lobes (the right has three). Lungs take in oxygen and release carbon dioxide.',
    facts: ['Two lobes (right has three)', 'Smaller to fit the heart', '~300 million alveoli inside', 'Expands when you breathe in'],
  },
  {
    id: 'right_lung',
    name: 'Right Lung',
    system: 'respiratory',
    position: [0.9, 2.2, 0.2],
    shape: 'ellipsoid',
    size: [0.5, 1.4, 0.5],
    color: '#f77f00',
    info: 'The right lung has three lobes and is slightly larger than the left. Together, the lungs exchange oxygen and carbon dioxide with the blood.',
    facts: ['Three lobes', 'Slightly larger than left', 'Connects to the trachea', 'Lined with tiny air sacs (alveoli)'],
  },
  {
    id: 'trachea',
    name: 'Trachea (Windpipe)',
    system: 'respiratory',
    position: [0, 3.0, 0.2],
    shape: 'tube',
    size: [0.1, 0.8],
    color: '#f4a261',
    info: 'The trachea, or windpipe, carries air from the nose and throat down into the lungs. It is kept open by rings of cartilage.',
    facts: ['About 10–12 cm long', 'Kept open by cartilage rings', 'Splits into two bronchi', 'Carries air to the lungs'],
  },
  // --- Digestive ---
  {
    id: 'stomach',
    name: 'Stomach',
    system: 'digestive',
    position: [0.3, 1.0, 0.4],
    shape: 'ellipsoid',
    size: [0.6, 0.5, 0.4],
    color: '#fcbf49',
    info: 'The stomach churns food and mixes it with acid and enzymes to start breaking it down. It can hold about 1 litre of food.',
    facts: ['Holds about 1 L of food', 'pH ~1.5 (very acidic)', 'Lined with protective mucus', 'Churns food for 2–4 hours'],
  },
  {
    id: 'liver',
    name: 'Liver',
    system: 'digestive',
    position: [-0.5, 1.1, 0.3],
    shape: 'ellipsoid',
    size: [0.7, 0.4, 0.4],
    color: '#e09f3e',
    info: 'The liver is the largest internal organ. It filters toxins from the blood, makes bile to digest fat, stores energy, and makes important proteins.',
    facts: ['Largest internal organ', 'Makes bile for fat digestion', 'Filters toxins from blood', 'Can regrow if part is removed'],
  },
  {
    id: 'small_intestine',
    name: 'Small Intestine',
    system: 'digestive',
    position: [0, 0.0, 0.5],
    shape: 'torus',
    size: [0.5, 0.06],
    color: '#fcbf49',
    info: 'The small intestine is where most nutrients are absorbed. Despite its name, it is about 6 metres long — but it is narrower than the large intestine.',
    facts: ['About 6 m long', 'Most nutrients absorbed here', 'Has tiny finger-like villi', 'Food stays here 3–5 hours'],
  },
  {
    id: 'large_intestine',
    name: 'Large Intestine',
    system: 'digestive',
    position: [0, -0.7, 0.4],
    shape: 'torus',
    size: [0.4, 0.08],
    color: '#d4912e',
    info: 'The large intestine (colon) absorbs water and salts from what is left of the food, and forms the solid waste (faeces).',
    facts: ['About 1.5 m long', 'Absorbs water and salts', 'Forms solid waste', 'Home to helpful gut bacteria'],
  },
  {
    id: 'pancreas',
    name: 'Pancreas',
    system: 'digestive',
    position: [-0.1, 0.5, 0.3],
    shape: 'ellipsoid',
    size: [0.4, 0.1, 0.1],
    color: '#e9c46a',
    info: 'The pancreas makes enzymes that digest food, and also makes insulin to control blood sugar. It is part of both the digestive and endocrine systems.',
    facts: ['Makes digestive enzymes', 'Makes insulin', 'Both digestive and endocrine', 'About 15 cm long'],
  },
  // --- Nervous ---
  {
    id: 'brain',
    name: 'Brain',
    system: 'nervous',
    position: [0, 4.2, 0],
    shape: 'ellipsoid',
    size: [0.7, 0.6, 0.7],
    color: '#7209b7',
    info: 'The brain is the control centre of the body. It has about 86 billion neurons and uses about 20% of your energy, even though it is only 2% of your body weight.',
    facts: ['~86 billion neurons', 'Uses 20% of your energy', '4 main lobes', 'Protected by the skull'],
  },
  {
    id: 'spinal_cord',
    name: 'Spinal Cord',
    system: 'nervous',
    position: [0, 1.8, -0.4],
    shape: 'tube',
    size: [0.07, 4.0],
    color: '#9d4edd',
    info: 'The spinal cord is a bundle of nerve fibres that runs from the brain down through the spine. It carries signals between the brain and the rest of the body.',
    facts: ['About 45 cm long', 'Carries signals to/from brain', 'Protected by the spine', '31 pairs of spinal nerves branch off'],
  },
  // --- Excretory ---
  {
    id: 'left_kidney',
    name: 'Left Kidney',
    system: 'excretory',
    position: [-0.5, 0.5, -0.3],
    shape: 'ellipsoid',
    size: [0.3, 0.5, 0.25],
    color: '#2a9d8f',
    info: 'The kidneys filter waste and extra water from the blood to make urine. Each kidney has about 1 million tiny filtering units called nephrons.',
    facts: ['~1 million nephrons each', 'Filters 180 L of blood/day', 'Bean-shaped', 'Sits at the back of the abdomen'],
  },
  {
    id: 'right_kidney',
    name: 'Right Kidney',
    system: 'excretory',
    position: [0.5, 0.5, -0.3],
    shape: 'ellipsoid',
    size: [0.3, 0.5, 0.25],
    color: '#2a9d8f',
    info: 'The right kidney sits slightly lower than the left (the liver pushes it down). Like the left, it filters blood and makes urine.',
    facts: ['Sits slightly lower than left', 'Filters blood continuously', 'Connects to a ureter', 'About 10 cm long'],
  },
  {
    id: 'bladder',
    name: 'Bladder',
    system: 'excretory',
    position: [0, -1.0, 0.4],
    shape: 'sphere',
    size: [0.35, 0.35, 0.35],
    color: '#52b788',
    info: 'The bladder stores urine from the kidneys until you go to the toilet. It can hold about 400–600 ml.',
    facts: ['Holds 400–600 ml of urine', 'Muscular, stretchy walls', 'Signals the brain when full', 'Empties through the urethra'],
  },
  // --- Endocrine ---
  {
    id: 'pituitary',
    name: 'Pituitary Gland',
    system: 'endocrine',
    position: [0, 3.9, 0.1],
    shape: 'sphere',
    size: [0.08, 0.08, 0.08],
    color: '#e76f51',
    info: 'The pituitary gland is the size of a pea but is called the "master gland" because its hormones control many other glands, including growth, thyroid, and reproductive organs.',
    facts: ['The size of a pea', 'Called the "master gland"', 'Hangs from the brain', 'Controls growth and other glands'],
  },
  {
    id: 'thyroid',
    name: 'Thyroid',
    system: 'endocrine',
    position: [0, 3.2, 0.3],
    shape: 'ellipsoid',
    size: [0.25, 0.1, 0.15],
    color: '#e76f51',
    info: 'The thyroid is a butterfly-shaped gland in the neck. Its hormones control how fast your body uses energy (metabolism).',
    facts: ['Butterfly-shaped', 'In the front of the neck', 'Controls metabolism', 'Needs iodine to work'],
  },
  {
    id: 'adrenal',
    name: 'Adrenal Glands',
    system: 'endocrine',
    position: [0.5, 0.7, -0.3],
    shape: 'sphere',
    size: [0.12, 0.12, 0.12],
    color: '#e76f51',
    info: 'The adrenal glands sit on top of the kidneys. They make adrenaline, the "fight or flight" hormone, and cortisol, which helps you handle stress.',
    facts: ['Sit on top of the kidneys', 'Make adrenaline', 'Help handle stress', 'Two small triangular glands'],
  },
];

export function getOrgansBySystem(system: OrganSystemId): OrganDef[] {
  return ORGANS.filter((o) => o.system === system);
}

export function getOrganById(id: string): OrganDef | undefined {
  return ORGANS.find((o) => o.id === id);
}
