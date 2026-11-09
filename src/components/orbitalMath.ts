// Helpers for elliptical (Keplerian) orbital motion.
// The Sun sits at one focus of the ellipse (the origin in our scene).

// Deterministic pseudo-random phase for a body id, in [0, 2*pi).
// Using a hash of the id gives stable, well-spread starting positions so the
// layout is reproducible across reloads (good for teachers/screenshots).
export function deterministicPhase(id: string): number {
  let h = 2166136261 >>> 0; // FNV-1a 32-bit offset basis
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  // Mix once more for a smoother spread.
  h ^= h >>> 13;
  h = Math.imul(h, 2654435761) >>> 0;
  return (h / 0xffffffff) * Math.PI * 2;
}

// Solve Kepler's equation  M = E - e*sin(E)  for the eccentric anomaly E
// given the mean anomaly M and eccentricity e, using Newton's method.
export function solveKepler(M: number, e: number, iterations = 5): number {
  // Normalise M to [-pi, pi]
  let m = M % (2 * Math.PI);
  if (m > Math.PI) m -= 2 * Math.PI;
  if (m < -Math.PI) m += 2 * Math.PI;
  let E = m + e * Math.sin(m); // good initial guess for small e
  for (let i = 0; i < iterations; i++) {
    const dE = (E - e * Math.sin(E) - m) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-8) break;
  }
  return E;
}

// Given mean anomaly M, semi-major axis a and eccentricity e, return the
// orbital position in the orbital plane (x, z) with the focus at the origin.
export function orbitalPosition(
  M: number,
  a: number,
  e: number,
  out: { x: number; z: number },
): void {
  const E = solveKepler(M, e);
  const b = a * Math.sqrt(1 - e * e);
  out.x = a * (Math.cos(E) - e);
  out.z = b * Math.sin(E);
}

// Convert a rotation period in hours to an angular speed (radians per
// real second) at the given time speed scale.
// At 1x speed, one Earth year (8766 h) takes SECONDS_PER_YEAR_AT_1X seconds.
// So 1 simulated hour = SECONDS_PER_YEAR_AT_1X / 8766 real seconds.
// Angular speed = 2*pi / (rotationHours * secondsPerHour) per real second at 1x.
export function rotationSpeedPerSecond(rotationHours: number, secondsPerYear: number): number {
  const simulatedHoursPerRealSecond = 8766 / secondsPerYear; // at 1x
  const rotationSeconds = rotationHours / simulatedHoursPerRealSecond;
  return (2 * Math.PI) / rotationSeconds;
}

// Orbital angular speed (radians of mean motion per real second) at 1x.
export function orbitalMeanMotionPerSecond(orbitalPeriodYears: number, secondsPerYear: number): number {
  return (2 * Math.PI) / (orbitalPeriodYears * secondsPerYear);
}

// For a moon: convert orbital period (days) to mean motion (rad/real-second at 1x).
export function moonMeanMotionPerSecond(orbitalPeriodDays: number, secondsPerYear: number): number {
  const years = orbitalPeriodDays / 365.25;
  return (2 * Math.PI) / (years * secondsPerYear);
}
