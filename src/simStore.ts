// Tiny module-level mutable store for values that change very often
// (like the time-speed slider) so that useFrame can read them without
// triggering React re-renders on every slider tick.
export const sim = {
  timeSpeed: 1,
};
