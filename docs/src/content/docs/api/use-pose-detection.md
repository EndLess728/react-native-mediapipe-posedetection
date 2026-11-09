---
title: usePoseDetection
description: API reference for the usePoseDetection hook, its parameters, options, defaults and return value.
---

Creates a native pose detector and returns a VisionCamera frame processor plus the handlers needed to map results onto the screen.

```ts
function usePoseDetection(
  callbacks: DetectionCallbacks<PoseDetectionResultBundle>,
  runningMode: RunningMode,
  model: string,
  options?: Partial<PoseDetectionOptions>
): MediaPipeSolution;
```

## Parameters

### `callbacks`

| Field | Type | Description |
| --- | --- | --- |
| `onResults` | `(result: PoseDetectionResultBundle, vc: ViewCoordinator) => void` | Called with each detection result. `vc` converts landmarks to view coordinates, see [skeleton overlay](../../guides/skeleton-overlay/). |
| `onError` | `(error: DetectionError) => void` | Called when native detection fails. `error` has `code` and `message`. |

Wrap both in `useCallback` so they don't change on every render.

### `runningMode`

| Value | Use for |
| --- | --- |
| `RunningMode.LIVE_STREAM` | Camera frames. This is what you want with VisionCamera. |
| `RunningMode.VIDEO` | Decoded video frames processed in order. |
| `RunningMode.IMAGE` | Single images. Prefer [`PoseDetectionOnImage`](../pose-detection-on-image/) instead. |

### `model`

File name of a bundled MediaPipe pose landmarker model, for example `'pose_landmarker_lite.task'`. See [Model files](../../getting-started/model-files/).

### `options`

All fields are optional.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `numPoses` | `number` | `1` | Maximum number of people to detect. |
| `minPoseDetectionConfidence` | `number` | `0.5` | Minimum score (0–1) for a person to be detected. |
| `minPosePresenceConfidence` | `number` | `0.5` | Minimum presence score (0–1) for a detected pose. |
| `minTrackingConfidence` | `number` | `0.5` | Minimum score (0–1) to keep tracking between frames instead of re-detecting. |
| `shouldOutputSegmentationMasks` | `boolean` | `false` | Ask MediaPipe for segmentation masks. Slower. |
| `delegate` | `Delegate` | `Delegate.GPU` | `Delegate.GPU` or `Delegate.CPU`. |
| `fpsMode` | `'none' \| number` | `'none'` | Process at most this many frames per second. See [Performance](../../guides/performance/). |
| `mirrorMode` | `'no-mirror' \| 'mirror' \| 'mirror-front-only'` | `'mirror-front-only'` on Android, `'no-mirror'` on iOS | Whether converted points are mirrored horizontally. |
| `forceCameraOrientation` | `ImageOrientation` | — | Override the detected camera sensor orientation. |
| `forceOutputOrientation` | `ImageOrientation` | — | Override the output orientation sent to MediaPipe. |

Changing `model`, `runningMode`, `delegate`, `numPoses`, any confidence threshold or `shouldOutputSegmentationMasks` releases the current detector and creates a new one.

## Returns: `MediaPipeSolution`

| Field | Type | Description |
| --- | --- | --- |
| `frameProcessor` | `ReadonlyFrameProcessor` | Pass to `<Camera frameProcessor={...}>`. |
| `cameraViewLayoutChangeHandler` | `(e: LayoutChangeEvent) => void` | Pass to the camera's `onLayout`. |
| `cameraDeviceChangeHandler` | `(device?: CameraDevice) => void` | Call when the active camera device changes. |
| `cameraOrientationChangedHandler` | `(o: Orientation) => void` | Pass to `onOutputOrientationChanged`. |
| `resizeModeChangeHandler` | `(mode: 'cover' \| 'contain') => void` | Call with the camera's resize mode. |
| `cameraViewDimensions` | `{ width: number; height: number }` | Current size of the camera view. |

[`MediapipeCamera`](../mediapipe-camera/) wires all of these up for you.

## Example

```ts
const solution = usePoseDetection(
  { onResults, onError },
  RunningMode.LIVE_STREAM,
  'pose_landmarker_lite.task',
  { numPoses: 1, delegate: Delegate.GPU, fpsMode: 15 }
);
```
