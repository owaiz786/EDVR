// Text for the clickable parts of the heart.
export const DEFAULT_BPM = 70;

// Shared, mutable beat phase (0..1) so the ECG trace in the HTML panel can stay
// in sync with the 3D heart without re-rendering React every frame.
export const heartSim = { phase: 0 };

export interface PartInfo {
  name: string;
  color: string;
  info: string;
  facts: string[];
}

export const PART_INFO: Record<string, PartInfo> = {
  ra: {
    name: 'Right Atrium',
    color: '#7da2ff',
    info: 'The right atrium receives oxygen-poor blood returning from the body through the vena cava and pumps it down into the right ventricle.',
    facts: ['Receives deoxygenated blood from the body', 'Pumps blood to the right ventricle', 'One of the two upper chambers'],
  },
  la: {
    name: 'Left Atrium',
    color: '#ff7b6e',
    info: 'The left atrium receives oxygen-rich blood from the lungs through the pulmonary veins and pumps it down into the left ventricle.',
    facts: ['Receives oxygenated blood from the lungs', 'Pumps blood to the left ventricle', 'One of the two upper chambers'],
  },
  rv: {
    name: 'Right Ventricle',
    color: '#6f93f0',
    info: 'The right ventricle pumps oxygen-poor blood to the lungs through the pulmonary artery, where it picks up oxygen.',
    facts: ['Pumps blood to the lungs', 'Thinner wall than the left ventricle', 'Sends blood a short distance'],
  },
  lv: {
    name: 'Left Ventricle',
    color: '#ff5a5a',
    info: 'The left ventricle is the strongest chamber. It pumps oxygen-rich blood out through the aorta to the entire body. Its wall is the thickest.',
    facts: ['Thickest muscular wall', 'Pumps blood to the whole body', 'The strongest pump in the heart'],
  },
  tricuspid: {
    name: 'Tricuspid Valve',
    color: '#ffd966',
    info: 'The tricuspid valve sits between the right atrium and right ventricle. It has three flaps and stops blood flowing backwards into the atrium.',
    facts: ['Three flaps (cusps)', 'Between right atrium and right ventricle', 'Closes when the ventricle squeezes'],
  },
  mitral: {
    name: 'Mitral Valve',
    color: '#ffd966',
    info: 'The mitral valve sits between the left atrium and left ventricle. It has two flaps and keeps oxygen-rich blood moving forwards.',
    facts: ['Two flaps (cusps)', 'Between left atrium and left ventricle', 'Also called the bicuspid valve'],
  },
  pulmonary_valve: {
    name: 'Pulmonary Valve',
    color: '#ffd966',
    info: 'The pulmonary valve guards the exit of the right ventricle and stops blood falling back after it has been pumped towards the lungs.',
    facts: ['Exit of the right ventricle', 'Leads into the pulmonary artery', 'Helps make the "dub" heart sound'],
  },
  aortic_valve: {
    name: 'Aortic Valve',
    color: '#ffd966',
    info: 'The aortic valve guards the exit of the left ventricle. It opens to let blood into the aorta and closes to stop it flowing back.',
    facts: ['Exit of the left ventricle', 'Leads into the aorta', 'Helps make the "dub" heart sound'],
  },
  aorta: {
    name: 'Aorta',
    color: '#ff6b5e',
    info: 'The aorta is the largest artery. It arches over the heart and carries oxygen-rich blood from the left ventricle to the rest of the body.',
    facts: ['Largest artery in the body', 'About 3 cm wide', 'Carries oxygen-rich blood'],
  },
  pulm_artery: {
    name: 'Pulmonary Artery',
    color: '#7da2ff',
    info: 'The pulmonary artery splits into a left and right branch and carries oxygen-poor blood from the right ventricle to the lungs. It is the only artery that carries deoxygenated blood.',
    facts: ['Carries blood to the lungs', 'The only artery with oxygen-poor blood', 'Splits into left and right branches'],
  },
  pulm_vein: {
    name: 'Pulmonary Veins',
    color: '#ff7b6e',
    info: 'Four pulmonary veins bring freshly oxygenated blood from the lungs into the left atrium. They are the only veins that carry oxygen-rich blood.',
    facts: ['Four veins (two per lung)', 'Carry oxygen-rich blood', 'Enter the left atrium'],
  },
  vena_cava: {
    name: 'Vena Cava',
    color: '#7da2ff',
    info: 'The superior and inferior vena cava are the largest veins. They bring oxygen-poor blood from the body back into the right atrium.',
    facts: ['Largest veins in the body', 'Bring blood back to the heart', 'Empty into the right atrium'],
  },
};
