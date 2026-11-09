import { useState } from 'react';
import CategoryLanding from './pages/CategoryLanding';
import SpaceLanding from './pages/SpaceLanding';
import BiologyLanding from './pages/BiologyLanding';
import SolarSystemModule from './pages/SolarSystemModule';
import DayNightSeasons from './pages/DayNightSeasons';
import EclipsesMoonPhases from './pages/EclipsesMoonPhases';
import StarsBeyond from './pages/StarsBeyond';
import HumanBody from './pages/HumanBody';

export type View =
  | 'category'
  | 'space'
  | 'biology'
  | 'solar'
  | 'daynight'
  | 'eclipses'
  | 'stars'
  | 'humanbody';

function App() {
  const [view, setView] = useState<View>('category');

  switch (view) {
    case 'space':
      return <SpaceLanding onBack={() => setView('category')} onSelect={setView} />;
    case 'biology':
      return <BiologyLanding onBack={() => setView('category')} onSelect={setView} />;
    case 'solar':
      return <SolarSystemModule onBack={() => setView('space')} />;
    case 'daynight':
      return <DayNightSeasons onBack={() => setView('space')} />;
    case 'eclipses':
      return <EclipsesMoonPhases onBack={() => setView('space')} />;
    case 'stars':
      return <StarsBeyond onBack={() => setView('space')} />;
    case 'humanbody':
      return <HumanBody onBack={() => setView('biology')} />;
    default:
      return <CategoryLanding onSelect={setView} />;
  }
}

export default App;
