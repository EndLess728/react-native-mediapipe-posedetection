---
title: Quick start
description: A complete, copy-paste React Native screen that runs live pose detection on the camera feed.
---

This is a full screen you can drop into your app. It asks for camera permission, runs pose detection on the back camera and logs the nose position.

```tsx title="PoseScreen.tsx"
import { useCallback, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useCameraPermission } from 'react-native-vision-camera';
import {
  Delegate,
  KnownPoseLandmarks,
  MediapipeCamera,
  RunningMode,
  usePoseDetection,
  type DetectionError,
  type PoseDetectionResultBundle,
} from 'react-native-mediapipe-posedetection';

export default function PoseScreen() {
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  const onResults = useCallback((result: PoseDetectionResultBundle) => {
    // One entry per processed frame; each holds every detected person.
    const poses = result.results[0]?.landmarks ?? [];
    const firstPerson = poses[0];
    if (!firstPerson) return;

    const nose = firstPerson[KnownPoseLandmarks.nose];
    console.log(
      `nose at x=${nose.x.toFixed(2)} y=${nose.y.toFixed(2)} (${result.inferenceTime} ms)`
    );
  }, []);

  const onError = useCallback((error: DetectionError) => {
    console.warn('Pose detection error:', error.message);
  }, []);

  const solution = usePoseDetection(
    { onResults, onError },
    RunningMode.LIVE_STREAM,
    'pose_landmarker_lite.task',
    {
      numPoses: 1,
      delegate: Delegate.GPU,
    }
  );

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text>Waiting for camera permission…</Text>
      </View>
    );
  }

  return (
    <MediapipeCamera
      style={styles.camera}
      solution={solution}
      activeCamera="back"
      resizeMode="cover"
    />
  );
}

const styles = StyleSheet.create({
  camera: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
```

## What's going on

- **`usePoseDetection`** creates a native detector for the model and options you pass, and releases it when the component unmounts or the options change.
- **`onResults`** gets a `PoseDetectionResultBundle`. Landmarks live at `result.results[0].landmarks[personIndex][landmarkIndex]`, with `x` and `y` normalized from 0 to 1. See [Results & types](../../api/types/).
- **`MediapipeCamera`** is a thin wrapper around VisionCamera's `<Camera>` that wires up the frame processor, layout, orientation and device handlers for you. You can use your own `<Camera>` instead, see [MediapipeCamera](../../api/mediapipe-camera/#using-your-own-camera).

:::note
Keep `onResults` and `onError` stable with `useCallback`. The hook re-registers them whenever they change.
:::

## Next steps

- [Draw a skeleton on top of the camera](../../guides/skeleton-overlay/)
- [Detect poses in a photo](../../guides/static-images/)
- [Tune performance](../../guides/performance/)
