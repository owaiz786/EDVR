// Text for the Scale Zoom view.
export type ScaleLevel = 'body' | 'organ' | 'tissue' | 'cell' | 'dna';

export const SCALE_LEVELS: { id: ScaleLevel; name: string; sizeLabel: string; description: string; facts: string[] }[] = [
  {
    id: 'body',
    name: 'Whole Body',
    sizeLabel: '~1.7 m tall',
    description: 'An adult human body is made of about 37 trillion cells, organised into tissues, organs, and systems. Zoom in to see how it is built.',
    facts: ['37 trillion cells', '206 bones', '78 organs', '~5 litres of blood'],
  },
  {
    id: 'organ',
    name: 'Organ (the heart)',
    sizeLabel: '~12 cm long',
    description: 'An organ is made of different tissues working together. The heart is mostly cardiac muscle, with blood vessels, nerves, and connective tissue.',
    facts: ['Made of tissues working together', 'Cardiac muscle pumps blood', 'About the size of your fist', 'Beats 100,000 times a day'],
  },
  {
    id: 'tissue',
    name: 'Tissue (muscle fibres)',
    sizeLabel: '~0.1 mm',
    description: 'A tissue is a group of similar cells doing the same job. Cardiac muscle tissue is made of long, branching muscle fibres that contract together.',
    facts: ['Group of similar cells', 'Cardiac muscle cells branch', 'Cells contract together', 'Connected by gap junctions'],
  },
  {
    id: 'cell',
    name: 'Cell (muscle cell)',
    sizeLabel: '~0.02 mm (20 μm)',
    description: 'The cell is the basic unit of life. Every cell has a membrane, cytoplasm, and a nucleus that contains DNA. Muscle cells are long and striped.',
    facts: ['Basic unit of life', 'Has a nucleus with DNA', 'Cytoplasm + membrane', 'Muscle cells are long and striped'],
  },
  {
    id: 'dna',
    name: 'DNA (the molecule of life)',
    sizeLabel: '~2 nm wide',
    description: 'DNA is the molecule that stores the genetic instructions for building and running a living thing. It is a twisted ladder (double helix) made of four chemical "letters": A, T, G, C.',
    facts: ['Double helix shape', 'Four bases: A, T, G, C', 'Stores genetic instructions', 'About 2 metres of DNA per cell'],
  },
];
