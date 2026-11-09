---
title: Drawing a skeleton overlay
description: Convert MediaPipe pose landmarks to screen coordinates and draw a body skeleton on top of the React Native camera preview.
---

Landmarks come back **normalized to the camera frame** (0 to 1), not to your view. The camera frame is usually a different size and orientation than the view showing it, and it may be cropped (`cover`) or letterboxed (`contain`) and mirrored on the front camera.

You don't need to work that out yourself. `onResults` receives a second argument, a `ViewCoordinator`, that does the conversion for you.

## Converting a point

```ts
const onResults = (result: PoseDetectionResultBundle, vc: ViewCoordinator) => {
  const frameDims = vc.getFrameDims(result);
  const person = result.results[0]?.landmarks[0];
  if (!person) return;

  const nose = vc.convertPoint(frameDims, person[KnownPoseLandmarks.nose]);
  // nose.x / nose.y are now in view pixels, ready to draw
};
```

- `getFrameDims(result)` returns the frame size, rotated to match how it's displayed.
- `convertPoint(frameDims, point)` takes a normalized landmark and returns view coordinates, handling rotation, `cover`/`contain` scaling and mirroring.

## Full example with react-native-svg

This draws every landmark connection as a line and every landmark as a dot. Install [`react-native-svg`](https://github.com/software-mansion/react-native-svg) first.

```tsx title="SkeletonScreen.tsx"
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import {
  KnownPoseLandmarkConnections,
  MediapipeCamera,
  RunningMode,
  usePoseDetection,
  type PoseDetectionResultBundle,
  type ViewCoordinator,
} from 'react-native-mediapipe-posedetection';

type Point = { x: number; y: number; visible: boolean };

export default function SkeletonScreen() {
  const [points, setPoints] = useState<Point[]>([]);

  const onResults = useCallback(
    (result: PoseDetectionResultBundle, vc: ViewCoordinator) => {
      const person = result.results[0]?.landmarks[0];
      if (!person) {
        setPoints([]);
        return;
      }
      const frameDims = vc.getFrameDims(result);
      setPoints(
        person.map((lm) => ({
          ...vc.convertPoint(frameDims, lm),
          visible: (lm.visibility ?? 1) > 0.5,
        }))
      );
    },
    []
  );

  const solution = usePoseDetection(
    { onResults, onError: (e) => console.warn(e.message) },
    RunningMode.LIVE_STREAM,
    'pose_landmarker_lite.task'
  );

  return (
    <View style={styles.container}>
      <MediapipeCamera style={styles.fill} solution={solution} activeCamera="front" />
      <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
        {points.length > 0 &&
          KnownPoseLandmarkConnections.map(([a, b]) => {
            const p1 = points[a];
            const p2 = points[b];
            if (!p1?.visible || !p2?.visible) return null;
            return (
              <Line
                key={`${a}-${b}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="#a9fef7"
                strokeWidth={3}
              />
            );
          })}
        {points.map((p, i) =>
          p.visible ? <Circle key={i} cx={p.x} cy={p.y} r={5} fill="#fe428e" /> : null
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  fill: { flex: 1 },
});
```

:::tip[Smoother drawing]
Calling `setState` on every frame re-renders the screen at the detection rate. For a smoother overlay, store the points in a Reanimated shared value or a Skia path and draw them without going through React state.
:::

## Mirroring

By default the front camera is mirrored on Android and not mirrored on iOS, matching what each platform's preview shows. Override it with the `mirrorMode` option if your overlay looks flipped:

```ts
usePoseDetection(callbacks, RunningMode.LIVE_STREAM, model, {
  mirrorMode: 'mirror-front-only', // 'no-mirror' | 'mirror' | 'mirror-front-only'
});
```
