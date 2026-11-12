import { Component, Suspense, type ReactNode } from 'react';

// 3D text labels need a font file. If it ever fails to load we simply skip the
// labels instead of letting the error take down the whole 3D scene.
export const LABEL_FONT = `${import.meta.env.BASE_URL}fonts/DejaVuSans.ttf`;

class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function Safe({ children }: { children: ReactNode }) {
  return (
    <Boundary>
      <Suspense fallback={null}>{children}</Suspense>
    </Boundary>
  );
}
