import { Composition } from 'remotion';
import { SolarSystemVideo } from './SolarSystemVideo';

export const RemotionRoot = () => {
  return (
    <Composition
      id="SolarSystemVideo"
      component={SolarSystemVideo}
      durationInFrames={300}
      // 240 scene + 60 standalone outro (see SolarSystemVideo.tsx)
      fps={30}
      width={1280}
      height={720}
    />
  );
};
