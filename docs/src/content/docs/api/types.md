---
title: Results & types
description: The shape of pose detection results and every type and enum exported by react-native-mediapipe-posedetection.
---

## PoseDetectionResultBundle

What `onResults` and `PoseDetectionOnImage` give you.

```ts
interface PoseDetectionResultBundle {
  results: PoseLandmarkerResult[];
  inferenceTime: number; // milliseconds
  inputImageWidth: number;
  inputImageHeight: number;
}

interface PoseLandmarkerResult {
  landmarks: Landmark[][];      // [person][landmarkIndex], normalized
  worldLandmarks: Landmark[][]; // [person][landmarkIndex], meters
  segmentationMasks: Mask[];
}
```

For live camera and single images, `results` has one entry. So the usual way in is:

```ts
const people = result.results[0]?.landmarks ?? [];
const firstPerson = people[0]; // 33 landmarks, or undefined if nobody is in frame
```

## Landmark

```ts
interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number; // 0–1, how likely the point is visible (not hidden)
  presence?: number;   // 0–1, how likely the point is in the frame at all
}
```

- In `landmarks`, `x` and `y` are **normalized** to the input image (0 to 1). `z` is depth relative to the hips; smaller is closer to the camera.
- In `worldLandmarks`, `x`, `y` and `z` are real-world 3D coordinates in **meters**, with the origin between the hips. Use these for angles and distances that shouldn't change with how far someone stands from the camera.

## ViewCoordinator

Passed as the second argument to `onResults`.

```ts
interface ViewCoordinator {
  getFrameDims(info: { inputImageWidth: number; inputImageHeight: number }): { width: number; height: number };
  convertPoint(frame: { width: number; height: number }, p: { x: number; y: number }): { x: number; y: number };
}
```

See [Drawing a skeleton overlay](../../guides/skeleton-overlay/).

## DetectionError

```ts
interface DetectionError {
  code: number;
  message: string;
}
```

## Enums

```ts
enum Delegate {
  CPU = 0,
  GPU = 1,
}

enum RunningMode {
  IMAGE = 0,
  VIDEO = 1,
  LIVE_STREAM = 2,
}
```

## Other exports

| Export | Description |
| --- | --- |
| `KnownPoseLandmarks` | Landmark name → index map. See [Landmarks](../landmarks/). |
| `KnownPoseLandmarkConnections` | Pairs of landmark indices that form the skeleton. |
| `BaseViewCoordinator` | The class behind `ViewCoordinator`, if you need to build one yourself. |
| `MediaPipeSolution`, `DetectionCallbacks`, `Mask`, `ResizeMode`, `ImageOrientation` | Supporting types. |
