// Comprehensive Solar System data with real astronomical values.
// All text is in English for school children.
// Sources: NASA Planetary Fact Sheet, JPL Horizons, IAU.
// Textures are NASA-derived maps distributed by Solar System Scope (CC BY 4.0)
// and the threex.planets collection (jeromeetienne).

export type BodyType = 'star' | 'planet' | 'dwarf' | 'moon';

export interface MoonData {
  id: string;
  name: string;
  type: 'moon';
  // Real values
  radiusKm: number;
  // Distance from parent planet, in km
  parentDistanceKm: number;
  // Orbital period around parent, in days
  orbitalPeriodDays: number;
  // Sidereal rotation period in hours (negative = retrograde)
  rotationPeriodHours: number;
  axialTilt: number; // degrees
  // Visual mode (compressed)
  visualRadius: number;
  visualDistance: number; // from parent
  // True mode (real distance ratio; size is real ratio to Earth)
  trueRadius: number; // real ratio * earthTrueScale
  trueDistance: number; // from parent, in scene units (already scaled)
  texture: string;
  bumpMap?: string;
  bumpScale?: number;
  color: string;
  info: string;
  facts: string[];
}

export interface BodyData {
  id: string;
  name: string;
  type: BodyType;
  // Real physical data (for the info panel / education)
  radiusKm: number;
  // Semi-major axis in AU (distance from Sun)
  semiMajorAxisAU: number;
  eccentricity: number;
  // Orbital period in Earth years
  orbitalPeriodYears: number;
  // Sidereal rotation period in hours (negative = retrograde)
  rotationPeriodHours: number;
  // Axial tilt in degrees
  axialTilt: number;
  // Visual mode (compressed for nice viewing)
  visualRadius: number;
  visualDistance: number;
  // True mode: planet sizes use real ratio to Earth, Sun is capped for visibility
  trueRadius: number;
  trueDistance: number; // 1 AU = 8 scene units in true mode
  // Texture
  texture: string;
  bumpMap?: string;
  bumpScale?: number;
  // Rings
  rings?: {
    inner: number; // multiple of planet radius
    outer: number;
    texture: string;
    opacity?: number;
  };
  // Special: Earth cloud layer
  hasClouds?: boolean;
  // Atmosphere glow color (hex)
  atmosphereColor?: string;
  // Emissive (for sun)
  emissive?: boolean;
  // Moons
  moons?: MoonData[];
  // Info in English
  info: string;
  facts: string[];
  // Color used as fallback if texture missing
  color: string;
}

// True-mode scale: 1 AU = 8 scene units.
export const AU_UNIT = 8;
// At 1x time speed, one Earth year takes this many real seconds.
export const SECONDS_PER_YEAR_AT_1X = 60;

// Real radius ratios to Earth (Earth = 1).
const R = {
  sun: 109.2,
  mercury: 0.383,
  venus: 0.949,
  earth: 1,
  mars: 0.532,
  jupiter: 10.97,
  saturn: 9.14,
  uranus: 3.98,
  neptune: 3.86,
  pluto: 0.187,
  moon: 0.273,
  io: 0.286,
  europa: 0.245,
  ganymede: 0.413,
  titan: 0.404,
  // Small/irregular moons (kept tiny but enforced to a visible minimum in
  // the radius fields below so they can be seen and clicked).
  phobos: 0.00177, // 11.27 km
  deimos: 0.000973, // 6.2 km
  triton: 0.2124, // 1353.4 km
};

// Earth radius in true-mode scene units (controls how big planets are in true mode).
const EARTH_TRUE_RADIUS = 0.45;

// Minimum radius (in scene units) so that very tiny moons stay visible and clickable.
const MIN_MOON_RADIUS = 0.04;

export const SUN: BodyData = {
  id: 'sun',
  name: 'Sun',
  type: 'star',
  radiusKm: 696340,
  semiMajorAxisAU: 0,
  eccentricity: 0,
  orbitalPeriodYears: 0,
  rotationPeriodHours: 609.12,
  axialTilt: 7.25,
  visualRadius: 2.5,
  visualDistance: 0,
  // Sun is capped in true mode so it does not engulf the inner planets.
  // Real ratio would be 109x Earth (huge); we keep it readable (Mercury orbits
  // at 3.1 units in true mode, so the Sun must stay well under that) and we
  // note the real ratio in the info panel.
  trueRadius: 1.8,
  trueDistance: 0,
  texture: 'sun.jpg',
  emissive: true,
  color: '#FDB813',
  info: 'The Sun is the star at the center of our Solar System. It is a giant ball of hot, glowing gas (plasma) that makes up 99.86% of all the mass in the Solar System. Its energy comes from nuclear fusion: hydrogen is fused into helium in its core, releasing enormous amounts of light and heat. Without the Sun, life on Earth would not be possible.',
  facts: [
    'Diameter: about 1,392,700 km (109x wider than Earth)',
    'Surface temperature: about 5,500 C; core: about 15,000,000 C',
    'Light takes 8 minutes 20 seconds to reach Earth',
    'It is roughly 4.6 billion years old',
    'The Sun is actually a white star; it looks yellow because of our atmosphere',
  ],
};

export const PLANETS: BodyData[] = [
  {
    id: 'mercury',
    name: 'Mercury',
    type: 'planet',
    radiusKm: 2439.7,
    semiMajorAxisAU: 0.387,
    eccentricity: 0.2056,
    orbitalPeriodYears: 0.2408,
    rotationPeriodHours: 1407.6,
    axialTilt: 0.034,
    visualRadius: 0.28,
    visualDistance: 4,
    trueRadius: R.mercury * EARTH_TRUE_RADIUS,
    trueDistance: 0.387 * AU_UNIT,
    texture: 'mercury.jpg',
    bumpMap: 'mercury_bump.jpg',
    bumpScale: 0.04,
    color: '#8c8c8c',
    info: 'Mercury is the smallest planet in the Solar System and the closest to the Sun. It is a rocky world covered in craters, looking a lot like our Moon. Because it has almost no atmosphere, it cannot hold heat: the side facing the Sun roasts while the dark side freezes. A day on Mercury (sunrise to sunrise) lasts 176 Earth days.',
    facts: [
      'Diameter: 4,879 km (just bigger than our Moon)',
      'One year = 88 Earth days (fastest orbit of any planet)',
      'One day (sunrise to sunrise) = 176 Earth days',
      'Temperature: -180 C at night to 430 C in the day',
      'It has no moons and almost no atmosphere',
    ],
  },
  {
    id: 'venus',
    name: 'Venus',
    type: 'planet',
    radiusKm: 6051.8,
    semiMajorAxisAU: 0.723,
    eccentricity: 0.0068,
    orbitalPeriodYears: 0.6152,
    rotationPeriodHours: -5832.5, // retrograde
    axialTilt: 177.4,
    visualRadius: 0.45,
    visualDistance: 5.6,
    trueRadius: R.venus * EARTH_TRUE_RADIUS,
    trueDistance: 0.723 * AU_UNIT,
    texture: 'venus.jpg',
    bumpMap: 'venus_bump.jpg',
    bumpScale: 0.02,
    atmosphereColor: '#e6c87a',
    color: '#e6c87a',
    info: 'Venus is the hottest planet in the Solar System, even hotter than Mercury, because of a runaway greenhouse effect. Its thick atmosphere is mostly carbon dioxide with clouds of sulfuric acid. It rotates in the opposite direction to most planets, so on Venus the Sun rises in the west and sets in the east.',
    facts: [
      'Diameter: 12,104 km (almost the same size as Earth)',
      'Surface temperature: about 465 C (hot enough to melt lead)',
      'It spins backwards (retrograde rotation)',
      'A day on Venus (243 Earth days) is longer than its year (225 Earth days)',
      'Atmospheric pressure is 90x that of Earth',
    ],
  },
  {
    id: 'earth',
    name: 'Earth',
    type: 'planet',
    radiusKm: 6371,
    semiMajorAxisAU: 1.0,
    eccentricity: 0.0167,
    orbitalPeriodYears: 1.0,
    rotationPeriodHours: 23.93,
    axialTilt: 23.44,
    visualRadius: 0.5,
    visualDistance: 7.2,
    trueRadius: R.earth * EARTH_TRUE_RADIUS,
    trueDistance: 1.0 * AU_UNIT,
    texture: 'earth.jpg',
    bumpMap: 'earth_bump.jpg',
    bumpScale: 0.05,
    hasClouds: true,
    atmosphereColor: '#6b93d6',
    color: '#6b93d6',
    info: 'Earth is our home and the only planet known to have life. About 71% of its surface is covered in liquid water, and its atmosphere of nitrogen and oxygen protects us from harmful solar radiation. Earth has one natural satellite, the Moon, which causes our ocean tides and stabilises our climate.',
    facts: [
      'Diameter: 12,742 km',
      'One day = 23 hours 56 minutes; one year = 365.25 days',
      'Axial tilt of 23.4 degrees gives us our seasons',
      'The only planet with liquid water on its surface',
      'Distance from the Sun: about 150 million km (1 AU)',
    ],
    moons: [
      {
        id: 'moon',
        name: 'Moon',
        type: 'moon',
        radiusKm: 1737.4,
        parentDistanceKm: 384400,
        orbitalPeriodDays: 27.32,
        rotationPeriodHours: 655.7, // tidally locked
        axialTilt: 6.68,
        visualRadius: 0.14,
        visualDistance: 1.0,
        trueRadius: R.moon * EARTH_TRUE_RADIUS,
        trueDistance: 1.1,
        texture: 'moon.jpg',
        bumpMap: 'moon_bump.jpg',
        bumpScale: 0.05,
        color: '#cccccc',
        info: 'The Moon is Earth\'s only natural satellite. It is tidally locked, meaning it always shows the same face to Earth. The Moon\'s gravity causes ocean tides and its gentle pull slows Earth\'s rotation a tiny bit each century.',
        facts: [
          'Diameter: 3,475 km (about 1/4 of Earth)',
          'It is the 5th largest moon in the Solar System',
          'Gravity is only 1/6 as strong as on Earth',
          'It is moving away from Earth by about 3.8 cm per year',
          'The dark patches are called "maria" (seas) of old lava',
        ],
      },
    ],
  },
  {
    id: 'mars',
    name: 'Mars',
    type: 'planet',
    radiusKm: 3389.5,
    semiMajorAxisAU: 1.524,
    eccentricity: 0.0934,
    orbitalPeriodYears: 1.881,
    rotationPeriodHours: 24.62,
    axialTilt: 25.19,
    visualRadius: 0.32,
    visualDistance: 8.8,
    trueRadius: R.mars * EARTH_TRUE_RADIUS,
    trueDistance: 1.524 * AU_UNIT,
    texture: 'mars.jpg',
    bumpMap: 'mars_bump.jpg',
    bumpScale: 0.06,
    color: '#c1440e',
    info: 'Mars, the Red Planet, gets its colour from iron oxide (rust) in its soil. It is a cold, dusty world with the biggest volcano and the deepest canyon in the Solar System. Mars has two tiny, lumpy moons named Phobos and Deimos. Many robotic rovers have explored its surface.',
    facts: [
      'Diameter: 6,779 km (about half the size of Earth)',
      'Home to Olympus Mons, the tallest volcano (21 km high)',
      'Valles Marineris is a canyon 4,000 km long and 7 km deep',
      'One day (sol) = 24 hours 37 minutes, very close to Earth',
      'It has polar ice caps made of water and frozen carbon dioxide',
    ],
    moons: [
      {
        id: 'phobos',
        name: 'Phobos',
        type: 'moon',
        radiusKm: 11.27,
        parentDistanceKm: 9376,
        orbitalPeriodDays: 0.319,
        rotationPeriodHours: 7.66, // tidally locked
        axialTilt: 0,
        visualRadius: 0.06,
        visualDistance: 0.55,
        trueRadius: Math.max(R.phobos * EARTH_TRUE_RADIUS, MIN_MOON_RADIUS),
        trueDistance: 0.4,
        texture: 'moon.jpg',
        bumpMap: 'moon_bump.jpg',
        bumpScale: 0.08,
        color: '#8b7d6b',
        info: 'Phobos is the larger and innermost of Mars\'s two moons, and one of the smallest moons in the Solar System. It is a lumpy, battered rock shaped a bit like a potato. Phobos orbits Mars faster than Mars spins, so it rises in the west and sets in the east. It is spiralling inward and will eventually crash into Mars or break into a ring.',
        facts: [
          'Diameter: about 22.5 km across (the size of a small city)',
          'Orbits Mars every 7.66 hours — faster than Mars rotates',
          'It has a giant crater named Stickney, 9 km wide',
          'It is getting closer to Mars by about 2 cm per year',
          'It will crash into Mars or become a ring in ~50 million years',
        ],
      },
      {
        id: 'deimos',
        name: 'Deimos',
        type: 'moon',
        radiusKm: 6.2,
        parentDistanceKm: 23463,
        orbitalPeriodDays: 1.263,
        rotationPeriodHours: 30.3, // tidally locked
        axialTilt: 0,
        visualRadius: 0.045,
        visualDistance: 0.78,
        trueRadius: Math.max(R.deimos * EARTH_TRUE_RADIUS, MIN_MOON_RADIUS),
        trueDistance: 0.65,
        texture: 'moon.jpg',
        bumpMap: 'moon_bump.jpg',
        bumpScale: 0.06,
        color: '#9a8b7d',
        info: 'Deimos is the smaller and outermost of Mars\'s two moons. It is a smooth, lumpy rock only about 12 km across, covered in a layer of fine dust (regolith) that hides most of its craters. Like Phobos, it is probably a captured asteroid or a remnant of a larger body that broke apart.',
        facts: [
          'Diameter: about 12.4 km across',
          'Orbits Mars every 30.3 hours',
          'It is one of the smallest moons in the Solar System',
          'It looks smooth because dust fills in its craters',
          'Its surface gravity is only about 0.003% of Earth\'s',
        ],
      },
    ],
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'planet',
    radiusKm: 69911,
    semiMajorAxisAU: 5.203,
    eccentricity: 0.0489,
    orbitalPeriodYears: 11.862,
    rotationPeriodHours: 9.93,
    axialTilt: 3.13,
    visualRadius: 1.7,
    visualDistance: 12.5,
    trueRadius: R.jupiter * EARTH_TRUE_RADIUS,
    trueDistance: 5.203 * AU_UNIT,
    texture: 'jupiter.jpg',
    color: '#d8ca9d',
    info: 'Jupiter is the largest planet in the Solar System, so massive that all the other planets could fit inside it. It is a gas giant made mostly of hydrogen and helium with no solid surface. Its Great Red Spot is a giant storm bigger than Earth that has been raging for at least 400 years.',
    facts: [
      'Diameter: 139,820 km (11x wider than Earth)',
      'It has at least 95 known moons',
      'The Great Red Spot is a storm that has lasted over 400 years',
      'It has the shortest day of any planet: about 10 hours',
      'Jupiter has faint rings and a strong magnetic field',
    ],
    moons: [
      {
        id: 'io',
        name: 'Io',
        type: 'moon',
        radiusKm: 1821.6,
        parentDistanceKm: 421700,
        orbitalPeriodDays: 1.769,
        rotationPeriodHours: 42.46,
        axialTilt: 0,
        visualRadius: 0.12,
        visualDistance: 2.1,
        trueRadius: R.io * EARTH_TRUE_RADIUS,
        trueDistance: 2.1,
        texture: 'moon.jpg',
        color: '#e8d97a',
        info: 'Io is the most volcanically active body in the Solar System. It has hundreds of volcanoes that shoot plumes of sulfur and sulfur dioxide up to 500 km high. The volcanoes are powered by the powerful tides from Jupiter.',
        facts: [
          'Diameter: 3,643 km (slightly bigger than our Moon)',
          'It has over 400 active volcanoes',
          'Surface temperature: -130 C, but lava reaches 1,200 C',
          'Orbits Jupiter every 1.77 days',
          'Its yellow colour comes from sulfur compounds',
        ],
      },
      {
        id: 'europa',
        name: 'Europa',
        type: 'moon',
        radiusKm: 1560.8,
        parentDistanceKm: 671034,
        orbitalPeriodDays: 3.551,
        rotationPeriodHours: 85.22,
        axialTilt: 0.1,
        visualRadius: 0.11,
        visualDistance: 2.6,
        trueRadius: R.europa * EARTH_TRUE_RADIUS,
        trueDistance: 2.6,
        texture: 'moon.jpg',
        color: '#c9b88a',
        info: 'Europa has a smooth shell of water ice covering a giant ocean of liquid water beneath. Scientists think Europa may be one of the best places to look for alien life, because its ocean could contain more than twice as much water as all of Earth\'s oceans combined.',
        facts: [
          'Diameter: 3,121 km',
          'Its ice crust is one of the smoothest surfaces in the Solar System',
          'It may hide a saltwater ocean under the ice',
          'Orbits Jupiter every 3.55 days',
          'It is a target for future life-detection missions',
        ],
      },
      {
        id: 'ganymede',
        name: 'Ganymede',
        type: 'moon',
        radiusKm: 2634.1,
        parentDistanceKm: 1070412,
        orbitalPeriodDays: 7.155,
        rotationPeriodHours: 171.7,
        axialTilt: 0.33,
        visualRadius: 0.16,
        visualDistance: 3.2,
        trueRadius: R.ganymede * EARTH_TRUE_RADIUS,
        trueDistance: 3.2,
        texture: 'moon.jpg',
        color: '#9b8b78',
        info: 'Ganymede is the largest moon in the Solar System, even bigger than the planet Mercury. It is the only moon known to have its own magnetic field, which gives it faint auroras. Like Europa, it may hide an ocean of liquid water deep below its icy crust.',
        facts: [
          'Diameter: 5,268 km (bigger than the planet Mercury)',
          'It is the 9th largest object in the Solar System',
          'It has its own magnetic field',
          'Orbits Jupiter every 7.15 days',
          'It likely has a salty ocean under its ice',
        ],
      },
    ],
  },
  {
    id: 'saturn',
    name: 'Saturn',
    type: 'planet',
    radiusKm: 58232,
    semiMajorAxisAU: 9.537,
    eccentricity: 0.0565,
    orbitalPeriodYears: 29.457,
    rotationPeriodHours: 10.66,
    axialTilt: 26.73,
    visualRadius: 1.45,
    visualDistance: 17,
    trueRadius: R.saturn * EARTH_TRUE_RADIUS,
    trueDistance: 9.537 * AU_UNIT,
    texture: 'saturn.jpg',
    color: '#f4d59e',
    rings: {
      inner: 1.3,
      outer: 2.4,
      texture: 'saturn_ring.jpg',
      opacity: 0.9,
    },
    info: 'Saturn is famous for its spectacular rings, made of billions of chunks of ice and rock. It is a gas giant, so light that it would float in water if you had a bathtub big enough. Saturn has at least 146 moons, including Titan, the second-largest moon in the Solar System.',
    facts: [
      'Diameter: 116,460 km (9.4x wider than Earth)',
      'Its rings span up to 282,000 km but are only ~10 m thick',
      'It is the least dense planet, less dense than water',
      'It has 146 known moons, the most of any planet',
      'Strong winds reach 1,800 km/h at its equator',
    ],
    moons: [
      {
        id: 'titan',
        name: 'Titan',
        type: 'moon',
        radiusKm: 2574.7,
        parentDistanceKm: 1221870,
        orbitalPeriodDays: 15.945,
        rotationPeriodHours: 382.68,
        axialTilt: 0,
        visualRadius: 0.17,
        visualDistance: 2.4,
        trueRadius: R.titan * EARTH_TRUE_RADIUS,
        trueDistance: 2.4,
        texture: 'moon.jpg',
        color: '#e3a647',
        info: 'Titan is Saturn\'s largest moon and the second-largest moon in the Solar System. It is the only moon with a thick atmosphere and the only place besides Earth with liquid rivers, lakes and seas on its surface, but they are made of liquid methane and ethane, not water.',
        facts: [
          'Diameter: 5,150 km (bigger than the planet Mercury)',
          'It has a thick nitrogen atmosphere (denser than Earth\'s)',
          'It has liquid methane lakes and rivers',
          'It orbits Saturn every 16 days',
          'The Huygens probe landed on its surface in 2005',
        ],
      },
    ],
  },
  {
    id: 'uranus',
    name: 'Uranus',
    type: 'planet',
    radiusKm: 25362,
    semiMajorAxisAU: 19.191,
    eccentricity: 0.0457,
    orbitalPeriodYears: 84.011,
    rotationPeriodHours: -17.24,
    axialTilt: 97.77,
    visualRadius: 0.85,
    visualDistance: 22,
    trueRadius: R.uranus * EARTH_TRUE_RADIUS,
    trueDistance: 19.191 * AU_UNIT,
    texture: 'uranus.jpg',
    color: '#c9eeff',
    rings: {
      inner: 1.4,
      outer: 1.9,
      texture: 'uranus_ring.jpg',
      opacity: 0.5,
    },
    info: 'Uranus is an ice giant that rotates on its side: its axis is tilted nearly 98 degrees, so it appears to roll around the Sun like a ball. This means each pole gets 42 years of sunlight followed by 42 years of darkness. Its blue-green colour comes from methane in its atmosphere.',
    facts: [
      'Diameter: 50,724 km (4x wider than Earth)',
      'Axial tilt of 98 degrees: it rolls on its side',
      'It is the coldest planet, with clouds at -224 C',
      'It has 27 known moons named after Shakespeare characters',
      'It has 13 faint rings, discovered in 1977',
    ],
  },
  {
    id: 'neptune',
    name: 'Neptune',
    type: 'planet',
    radiusKm: 24622,
    semiMajorAxisAU: 30.07,
    eccentricity: 0.0113,
    orbitalPeriodYears: 164.79,
    rotationPeriodHours: 16.11,
    axialTilt: 28.32,
    visualRadius: 0.82,
    visualDistance: 26,
    trueRadius: R.neptune * EARTH_TRUE_RADIUS,
    trueDistance: 30.07 * AU_UNIT,
    texture: 'neptune.jpg',
    color: '#5b5ddf',
    info: 'Neptune is the most distant planet from the Sun and the windiest place in the Solar System. Its winds can reach 2,100 km/h. Neptune was the first planet discovered by mathematical prediction rather than by looking through a telescope, and it takes 165 Earth years to orbit the Sun once.',
    facts: [
      'Diameter: 49,244 km (nearly 4x wider than Earth)',
      'Winds reach 2,100 km/h, the fastest in the Solar System',
      'It was discovered in 1846 using maths before it was seen',
      'One Neptune year = 165 Earth years',
      'It has 14 known moons; the biggest is Triton',
    ],
    moons: [
      {
        id: 'triton',
        name: 'Triton',
        type: 'moon',
        radiusKm: 1353.4,
        parentDistanceKm: 354759,
        orbitalPeriodDays: 5.877,
        rotationPeriodHours: 141.05, // tidally locked, retrograde orbit
        axialTilt: 0,
        visualRadius: 0.13,
        visualDistance: 1.4,
        trueRadius: Math.max(R.triton * EARTH_TRUE_RADIUS, MIN_MOON_RADIUS),
        trueDistance: 2.6,
        texture: 'moon.jpg',
        bumpMap: 'moon_bump.jpg',
        bumpScale: 0.04,
        color: '#d4b8a0',
        info: 'Triton is Neptune\'s largest moon and one of the most unusual worlds in the Solar System. It orbits Neptune backwards (retrograde), which means it was almost certainly captured from the Kuiper Belt — it is probably a cousin of Pluto. Despite being far from the Sun, Triton is geologically active: it has nitrogen geysers and a thin atmosphere, and its surface is one of the coldest places we know (-235 C).',
        facts: [
          'Diameter: 2,707 km (78% the size of our Moon)',
          'It orbits Neptune backwards (retrograde)',
          'It is probably a captured Kuiper Belt object, like Pluto',
          'It has active nitrogen geysers that erupt like volcanoes',
          'It is the 7th largest moon in the Solar System',
        ],
      },
    ],
  },
  {
    id: 'pluto',
    name: 'Pluto',
    type: 'dwarf',
    radiusKm: 1188.3,
    semiMajorAxisAU: 39.482,
    eccentricity: 0.2488,
    orbitalPeriodYears: 248.0,
    rotationPeriodHours: 153.3,
    axialTilt: 122.53,
    visualRadius: 0.2,
    visualDistance: 29.5,
    trueRadius: R.pluto * EARTH_TRUE_RADIUS,
    trueDistance: 39.482 * AU_UNIT,
    texture: 'pluto.jpg',
    bumpMap: 'pluto_bump.jpg',
    bumpScale: 0.04,
    color: '#c9a86c',
    info: 'Pluto is a dwarf planet in the Kuiper Belt, a ring of icy worlds beyond Neptune. It was considered the ninth planet from its discovery in 1930 until 2006, when astronomers redefined what a planet is. Pluto has a heart-shaped icy plain and 5 known moons, including a big companion called Charon.',
    facts: [
      'Diameter: 2,377 km (smaller than Earth\'s Moon)',
      'It is now classified as a dwarf planet, not a planet',
      'Its orbit is tilted and very elliptical',
      'One Pluto year = 248 Earth years',
      'NASA\'s New Horizons spacecraft flew past it in 2015',
    ],
  },
];

// Asteroid belt configuration (between Mars and Jupiter).
export const ASTEROID_BELT = {
  count: 600,
  // In visual mode
  visualInner: 9.8,
  visualOuter: 11.6,
  // In true mode (AU * AU_UNIT)
  trueInner: 2.2 * AU_UNIT,
  trueOuter: 3.2 * AU_UNIT,
  minSize: 0.02,
  maxSize: 0.07,
};

export const ALL_BODIES: BodyData[] = [SUN, ...PLANETS];

// Look up any body (planet, dwarf, or moon) by id, plus its display radius
// in the current scale mode (used by the fly-to camera).
export function findBodyById(id: string): { data: BodyData | MoonData; isMoon: boolean; parent?: BodyData } | null {
  if (SUN.id === id) return { data: SUN, isMoon: false };
  for (const p of PLANETS) {
    if (p.id === id) return { data: p, isMoon: false };
    for (const m of p.moons ?? []) {
      if (m.id === id) return { data: m, isMoon: true, parent: p };
    }
  }
  return null;
}

export function getBodyDisplayRadius(id: string, scaleMode: 'visual' | 'true'): number {
  const found = findBodyById(id);
  if (!found) return 0.5;
  return scaleMode === 'true' ? found.data.trueRadius : found.data.visualRadius;
}
