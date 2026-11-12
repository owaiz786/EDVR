# Explore VR

An interactive education app built with React Three Fiber, Three.js and WebXR. Students pick a subject — **Space Science** or **Biology** — then explore interactive 3D learning modules.

## Landing flow
1. **Category landing** — choose Space Science or Biology
2. **Subject landing** — see the modules in that subject
3. **Module** — open a module and explore

## Space Science modules

### 1. Solar System Explorer
The original VR solar system, with:
- The **Sun** and all **8 planets** with real NASA-derived surface textures, plus **Pluto** (dwarf planet), the **Moon**, **Phobos**, **Deimos**, **Io**, **Europa**, **Ganymede**, **Titan**, **Triton**, and an **asteroid belt** of 600 instanced rocks
- **Bump maps** for Mercury, Venus, Earth, Mars, the Moon and Pluto
- **Earth's cloud layer**, **Saturn's rings** (with texture), and faint **Uranus** rings
- **Elliptical orbits** using real eccentricity (Kepler's equation), real **orbital periods** (Mercury 88 days → Neptune 165 years), real **axial tilts** (Uranus rolling on its side at 98°, Venus at 177°), and real **rotation periods**
- **Scale toggle** between *Visual* (compressed) and *True scale* (real distances, 1 AU = 8 units)
- **Time-speed slider** (0–100× with presets) and a **fly-to camera** that locks on any body as it orbits
- Click any body to fly to it and open an info panel with facts (all in English)

### 2. Day, Night & Seasons
- A tilted **Earth orbiting the Sun** with its real 23.4° axial tilt held fixed in space (toward Polaris)
- **Day-of-year slider** (Jan 1 → Dec 31) with quick buttons for the equinoxes and solstices
- **Hour-of-day slider** (00:00 → 24:00) controlling Earth's spin
- **Observer-latitude slider** (90°S → 90°N) with quick buttons for the equator, tropics, Arctic circle, and poles
- A live info panel showing: current date, season, subsolar latitude (declination), day length at the observer's latitude, sunrise/sunset, and whether the observer is in daylight or night — including **polar day/night** detection
- Toggleable **equator, tropics, and polar circles** drawn on Earth
- **Animate** mode that orbits Earth and spins it at the same time

### 3. Eclipses & Moon Phases
- The **Sun**, **Earth**, and a **draggable Moon** — drag the Moon directly in 3D or use the angle slider
- A live **"view of the Moon from Earth"** panel (rendered on a `<canvas>`) showing the correct illuminated fraction and phase name (New, Waxing Crescent, First Quarter, Waxing Gibbous, Full, Waning Gibbous, Last Quarter, Waning Crescent)
- **Shadow cones** for the Moon and Earth (umbra) that visually explain the eclipse geometry
- **Automatic eclipse detection**: red "Solar eclipse is possible!" warning when the Moon is between the Sun and Earth, orange "Lunar eclipse is possible!" warning when the Moon enters Earth's shadow
- Quick-jump buttons for the four principal phases

### 4. Stars & Beyond
Three sub-views, switchable with tabs at the top:

**Constellations** — A full-sky planetarium view with 8 famous constellations at their **real star positions** (RA/Dec from astronomy tables): Orion, Ursa Major (Big Dipper), Cassiopeia, Leo, Cygnus, Lyra, Scorpius, and Crux (Southern Cross). Click a constellation (in the sky or in the list) to highlight its lines and star names; the panel shows a description and the best season to see it.

**Star Life Cycle** — A slider that scrubs through 8 stages of a star's life with a 3D representation of each: **Nebula → Protostar → Main Sequence Star → Red Giant → Planetary Nebula → White Dwarf → Supernova → Neutron Star / Black Hole**. Each stage has a description, duration, and key facts. Auto-play button animates the full cycle.

**Black Hole** — A black hole with a true-black **event horizon**, a **glowing accretion disk** of 2,500 orbiting particles colored by temperature (blue-white inner → red-orange outer, orbiting at Keplerian speeds), and a bright **photon ring**. The panel explains event horizons, accretion disks, and references the real M87* and Sgr A* black hole photographs.

## Biology modules

### 5. Human Body Explorer
A 3D human figure built from primitives, with 8 sub-views switchable via tabs at the top:

**Whole Body** — A stylised human figure with **6 toggleable layers** (skin, muscle, skeleton, organs, nerves, blood vessels). Click any organ to open an info panel with a description and key facts (heart, lungs, liver, stomach, intestines, kidneys, brain, spinal cord, pituitary, thyroid, adrenal glands, etc.).

**Organ Systems** — Pick one of **7 organ systems** (circulatory, respiratory, digestive, nervous, skeletal, excretory, endocrine). The organs belonging to that system light up in full colour while the rest dim to grey, so students can see exactly which organs belong where.

**Beating Heart** — A 4-chamber heart that **beats in rhythm** (atria contract first, then ventricles). **Blood-flow particles** show oxygenated blood (red) travelling through the left side and deoxygenated blood (blue) through the right side. A **heart-rate slider** (40–180 bpm) with an **Exercise toggle** speeds up the beat. Click any chamber, valve, aorta, or vena cava to learn about it.

**Lungs** — Two lungs that **inflate and deflate** with the breathing cycle, controlled by a breaths-per-minute slider. Switch to **Alveoli zoom** to see a single air sac surrounded by a blood vessel, with **O₂ (green) and CO₂ (yellow) particles** exchanging between the air and the blood.

**Brain** — A brain with **6 colour-coded regions** (frontal, parietal, temporal, occipital, cerebellum, brainstem), each clickable for its function. Switch to **Neuron zoom** to see a neuron (soma, dendrites, axon, myelin sheath, terminals) with a **signal pulse travelling along the axon**.

**Digestion** — Follow a bite of food through **6 stages** (mouth → esophagus → stomach → small intestine → large intestine → rectum), with the food particle moving along the path. Each stage has a description, key facts, a slider, Previous/Next buttons, and an auto-play mode. Helper organs (liver, pancreas) are also shown.

**Cross-section** — An MRI-style slicing view. Use a slider to scan a clipping plane through the body from feet to head (or left-to-right, or front-to-back), revealing the organs inside at each level. A red ring shows the cut position.

**Scale Zoom** — Zoom from the **whole body (~1.7 m) → an organ (the heart) → muscle tissue → a single cell → DNA**, with a slider and zoom out/in buttons. Each level has a different 3D representation, a size label, and educational facts — spanning nearly a billion times in scale.

## Navigation
The app opens on a category landing page. Pick a subject (Space Science or Biology) to see its module cards. Each module has a "← Home" or "← Categories" button at the top-left to go back.

## Stack
- React 19, TypeScript, Vite
- `@react-three/fiber` + `@react-three/drei` + `@react-three/xr`
- Three.js

## Development

```bash
npm install
npm run dev        # Vite dev server (https://localhost:5173)
npm run build      # production build → dist/
npm run preview    # serve the production build
```

## Texture credits & licence

The planet surface textures are NASA-derived maps:

- **Solar System Scope** textures (Sun, Mercury, Venus, Earth day/normal/specular/clouds, Mars, Jupiter, Saturn, Saturn ring, Uranus, Uranus ring, Neptune, Pluto, Moon, starfield) — distributed under the **Creative Commons Attribution 4.0 International (CC BY 4.0)** licence. © INOVE / Solar System Scope — https://www.solarsystemscope.com/textures/
- Additional Earth maps from the **three.js** example textures (MIT licence) — https://github.com/mrdoob/three.js

These maps are based on NASA elevation and imagery data (Messenger, Viking, Cassini, Hubble, the Blue Marble collection, etc.). If you redistribute this project, please keep this attribution.

## Astronomical data sources
NASA Planetary Fact Sheet, JPL Horizons, the IAU, and standard star catalogues. Star positions for the constellations use real RA/Dec coordinates. Values are rounded for clarity in the info panels; the simulations use the real values for eccentricity, orbital period, axial tilt, rotation period, and day-length calculations.
