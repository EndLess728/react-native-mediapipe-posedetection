---
title: PoseDetectionOnImage
description: API reference for PoseDetectionOnImage, which detects body poses in a still image file.
---

Runs pose detection once on an image file.

```ts
function PoseDetectionOnImage(
  imagePath: string,
  model: string,
  options?: Partial<PoseDetectionOptions>
): Promise<PoseDetectionResultBundle>;
```

## Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `imagePath` | `string` | Path to the image on the device, for example from `camera.takePhoto()` or an image picker. |
| `model` | `string` | File name of a bundled pose landmarker model. |
| `options` | `Partial<PoseDetectionOptions>` | Same options as [`usePoseDetection`](../use-pose-detection/#options). Only `numPoses`, the confidence thresholds, `shouldOutputSegmentationMasks` and `delegate` apply here. |

## Returns

A promise for a [`PoseDetectionResultBundle`](../types/#posedetectionresultbundle). It rejects if the image or model can't be loaded.

## Example

```ts
const result = await PoseDetectionOnImage(photo.path, 'pose_landmarker_heavy.task', {
  numPoses: 2,
});

for (const person of result.results[0]?.landmarks ?? []) {
  const leftWrist = person[KnownPoseLandmarks.leftWrist];
  console.log(leftWrist.x * result.inputImageWidth, leftWrist.y * result.inputImageHeight);
}
```

See the [static images guide](../../guides/static-images/) for more.
