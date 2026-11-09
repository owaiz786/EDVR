// Real star positions (RA in degrees, Dec in degrees) for famous constellations.
// RA/Dec → 3D on a unit sphere:
//   x = cos(dec) * cos(ra)
//   y = sin(dec)
//   z = cos(dec) * sin(ra)

export interface ConstellationStar {
  name: string; // traditional name
  ra: number; // degrees
  dec: number; // degrees
  mag: number; // visual magnitude (lower = brighter)
}

export interface Constellation {
  id: string;
  name: string;
  // Short description shown when the constellation is selected.
  description: string;
  // Hemisphere for sorting in the UI.
  hemisphere: 'north' | 'south' | 'equatorial';
  // Best season to see it (text only, for the info panel).
  bestSeen: string;
  stars: ConstellationStar[];
  // Pairs of star indices (into stars[]) to connect with a line.
  lines: [number, number][];
}

export const CONSTELLATIONS: Constellation[] = [
  {
    id: 'orion',
    name: 'Orion',
    description:
      "Orion is one of the most recognisable constellations, visible all over the world. It represents a hunter from Greek mythology. Look for the three bright stars in a row — Orion's Belt — between the bright orange star Betelgeuse (top-left) and the blue-white star Rigel (bottom-right).",
    hemisphere: 'equatorial',
    bestSeen: 'Winter (Northern Hemisphere) / Summer (Southern)',
    stars: [
      { name: 'Betelgeuse', ra: 88.79, dec: 7.41, mag: 0.5 },
      { name: 'Rigel', ra: 78.63, dec: -8.20, mag: 0.13 },
      { name: 'Bellatrix', ra: 81.09, dec: 6.35, mag: 1.64 },
      { name: 'Saiph', ra: 86.94, dec: -9.67, mag: 2.07 },
      { name: 'Mintaka', ra: 83.00, dec: -0.30, mag: 2.23 },
      { name: 'Alnilam', ra: 84.05, dec: -1.20, mag: 1.69 },
      { name: 'Alnitak', ra: 85.19, dec: -1.94, mag: 1.77 },
      { name: 'Meissa', ra: 83.78, dec: 9.93, mag: 3.39 },
    ],
    lines: [
      [0, 2], // Betelgeuse - Bellatrix (shoulders)
      [1, 3], // Rigel - Saiph (legs)
      [2, 4], // Bellatrix - Mintaka (left side of body)
      [3, 6], // Saiph - Alnitak (right side of body)
      [4, 5], // Belt
      [5, 6], // Belt
      [0, 7], // Betelgeuse - Meissa (head)
      [2, 7], // Bellatrix - Meissa
    ],
  },
  {
    id: 'ursa_major',
    name: 'Ursa Major (Big Dipper)',
    description:
      "The Big Dipper is an asterism (a star pattern) inside the constellation Ursa Major — the Great Bear. It looks like a long-handled cup or saucepan. The two stars at the front of the cup, Merak and Dubhe, are the 'Pointer Stars' — draw a line through them and you'll find Polaris, the North Star.",
    hemisphere: 'north',
    bestSeen: 'Spring evenings (Northern Hemisphere)',
    stars: [
      { name: 'Dubhe', ra: 165.93, dec: 61.75, mag: 1.79 },
      { name: 'Merak', ra: 165.46, dec: 56.38, mag: 2.37 },
      { name: 'Phecda', ra: 178.46, dec: 53.69, mag: 2.44 },
      { name: 'Megrez', ra: 183.86, dec: 57.03, mag: 3.31 },
      { name: 'Alioth', ra: 193.51, dec: 55.96, mag: 1.77 },
      { name: 'Mizar', ra: 200.98, dec: 54.93, mag: 2.27 },
      { name: 'Alkaid', ra: 206.89, dec: 49.31, mag: 1.86 },
    ],
    lines: [
      [0, 1], [1, 2], [2, 3], [3, 0], // the cup
      [3, 4], [4, 5], [5, 6], // the handle
    ],
  },
  {
    id: 'cassiopeia',
    name: 'Cassiopeia',
    description:
      "Cassiopeia is a W-shaped constellation representing a queen from Greek mythology. It's visible in the northern sky all year round. It's almost opposite the Big Dipper in the sky, so when one is high, the other is low.",
    hemisphere: 'north',
    bestSeen: 'Autumn evenings (Northern Hemisphere)',
    stars: [
      { name: 'Caph', ra: 2.29, dec: 59.15, mag: 2.27 },
      { name: 'Schedar', ra: 10.13, dec: 56.54, mag: 2.23 },
      { name: 'Gamma Cas', ra: 13.74, dec: 60.72, mag: 2.47 },
      { name: 'Ruchbah', ra: 21.45, dec: 60.24, mag: 2.68 },
      { name: 'Segin', ra: 28.60, dec: 63.67, mag: 3.38 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4]],
  },
  {
    id: 'leo',
    name: 'Leo',
    description:
      "Leo represents a lion. The 'sickle' (backwards-question-mark) pattern on the right is the lion's head and mane, with the bright star Regulus at the bottom. The triangle of stars on the left is the lion's hindquarters.",
    hemisphere: 'equatorial',
    bestSeen: 'Spring (Northern Hemisphere)',
    stars: [
      { name: 'Regulus', ra: 152.09, dec: 11.97, mag: 1.40 },
      { name: 'Algieba', ra: 154.99, dec: 19.84, mag: 2.61 },
      { name: 'Zosma', ra: 168.53, dec: 20.52, mag: 2.56 },
      { name: 'Chort', ra: 168.56, dec: 15.43, mag: 2.62 },
      { name: 'Denebola', ra: 177.26, dec: 14.57, mag: 2.14 },
      { name: 'Eta Leo', ra: 151.85, dec: 16.76, mag: 3.48 },
    ],
    lines: [
      [0, 5], [5, 1], // sickle (head)
      [1, 2], [2, 3], [3, 4], [4, 1], // body triangle
    ],
  },
  {
    id: 'cygnus',
    name: 'Cygnus (Northern Cross)',
    description:
      "Cygnus represents a swan flying along the Milky Way. It's also called the Northern Cross because of its cross shape. The bright star at the tail, Deneb, is one of the three stars of the Summer Triangle.",
    hemisphere: 'north',
    bestSeen: 'Summer evenings (Northern Hemisphere)',
    stars: [
      { name: 'Deneb', ra: 310.36, dec: 45.28, mag: 1.25 },
      { name: 'Sadr', ra: 305.55, dec: 40.26, mag: 2.23 },
      { name: 'Albireo', ra: 292.68, dec: 27.96, mag: 3.05 },
      { name: 'Gienah', ra: 299.08, dec: 33.97, mag: 2.48 },
      { name: 'Aljanah', ra: 296.24, dec: 45.13, mag: 2.87 },
    ],
    lines: [
      [0, 1], [1, 2], // vertical of the cross (Deneb - Sadr - Albireo)
      [3, 1], [1, 4], // horizontal of the cross (wings)
    ],
  },
  {
    id: 'lyra',
    name: 'Lyra',
    description:
      "Lyra represents a lyre (a small harp). Its brightest star, Vega, is the fifth-brightest star in the night sky and one of the three stars of the Summer Triangle. Vega was the Pole Star around 12,000 BC and will be again around 13,700 AD due to Earth's precession.",
    hemisphere: 'north',
    bestSeen: 'Summer (Northern Hemisphere)',
    stars: [
      { name: 'Vega', ra: 279.23, dec: 38.78, mag: 0.03 },
      { name: 'Sheliak', ra: 282.52, dec: 33.36, mag: 3.52 },
      { name: 'Sulafat', ra: 284.74, dec: 32.69, mag: 3.25 },
      { name: 'Delta Lyr', ra: 283.63, dec: 36.90, mag: 4.30 },
      { name: 'Zeta Lyr', ra: 282.98, dec: 35.65, mag: 4.36 },
    ],
    lines: [
      [0, 3], [0, 4], // Vega to the small triangle
      [3, 4], // top of the small parallelogram
      [3, 1], [4, 2], // sides
      [1, 2], // bottom
    ],
  },
  {
    id: 'scorpius',
    name: 'Scorpius',
    description:
      "Scorpius represents a scorpion. The bright red star Antares is the heart of the scorpion; its name means 'rival of Mars' because of its red colour. The long curve of stars forms the scorpion's body and tail, ending in the stinger stars Shaula and Sargas.",
    hemisphere: 'south',
    bestSeen: 'Summer (Southern Hemisphere) / Mid-summer (Northern)',
    stars: [
      { name: 'Antares', ra: 247.35, dec: -26.43, mag: 1.06 },
      { name: 'Dschubba', ra: 240.08, dec: -22.62, mag: 2.29 },
      { name: 'Acrab', ra: 241.36, dec: -19.81, mag: 2.62 },
      { name: 'Sargas', ra: 264.33, dec: -42.99, mag: 1.86 },
      { name: 'Shaula', ra: 263.40, dec: -37.10, mag: 1.62 },
    ],
    lines: [
      [1, 2], // claws
      [1, 0], // head to heart
      [0, 4], // body curve (heart to Shaula)
      [4, 3], // tail (Shaula to Sargas)
    ],
  },
  {
    id: 'crux',
    name: 'Crux (Southern Cross)',
    description:
      "Crux is the smallest of the 88 constellations but one of the most famous. It's used in navigation in the Southern Hemisphere — a line through the long axis of the cross points toward the South Celestial Pole. It appears on the flags of Australia, New Zealand, Brazil, and several other countries.",
    hemisphere: 'south',
    bestSeen: 'Year-round (Southern Hemisphere)',
    stars: [
      { name: 'Acrux', ra: 187.79, dec: -63.10, mag: 0.77 },
      { name: 'Becrux (Mimosa)', ra: 191.93, dec: -59.69, mag: 1.25 },
      { name: 'Gacrux', ra: 187.32, dec: -57.11, mag: 1.59 },
      { name: 'Decrux', ra: 183.97, dec: -58.75, mag: 2.79 },
    ],
    lines: [
      [0, 2], // vertical (Acrux - Gacrux)
      [1, 3], // horizontal (Becrux - Decrux)
    ],
  },
];

// Convert RA/Dec (in degrees) to a 3D position on a sphere of given radius.
export function radecToVec3(raDeg: number, decDeg: number, radius: number): [number, number, number] {
  const ra = (raDeg * Math.PI) / 180;
  const dec = (decDeg * Math.PI) / 180;
  return [
    radius * Math.cos(dec) * Math.cos(ra),
    radius * Math.sin(dec),
    radius * Math.cos(dec) * Math.sin(ra),
  ];
}
