---
title: Performance
description: Tune frame rate, model size, delegate and options for smooth, battery-friendly real-time pose detection in React Native.
---

Pose detection is one of the heavier things you can run on a phone. These settings have the biggest effect, roughly in order.

## 1. Use the lite model

`pose_landmarker_lite.task` is several times faster than `heavy` and is accurate enough for most live use. Save the bigger models for still images.

## 2. Limit the frame rate with `fpsMode`

Most use cases (rep counting, posture checks, skeleton overlays) look smooth at 10–15 detections per second. Processing every 30 or 60 fps frame mostly burns battery.

```ts
usePoseDetection(callbacks, RunningMode.LIVE_STREAM, 'pose_landmarker_lite.task', {
  fpsMode: 15, // or 'none' to process every frame (default)
});
```

This uses VisionCamera's `runAtTargetFps` under the hood, so skipped frames never reach MediaPipe.

:::note[Built-in throttling on iOS]
On iOS, the native module also caps result events to about 15 per second to keep memory stable during long sessions. Android delivers every result, so setting `fpsMode` matters more there.
:::

## 3. Detect only as many people as you need

`numPoses` defaults to `1`. Raising it makes each frame slower even when only one person is in view.

## 4. Leave segmentation masks off

`shouldOutputSegmentationMasks` defaults to `false`. Keep it that way unless you need the masks.

## 5. GPU vs CPU

`Delegate.GPU` is the default and the fastest on most devices. If you see crashes or memory warnings on older or low-end phones, try `Delegate.CPU`.

## 6. Keep work out of `onResults`

`onResults` runs on the JS thread. Heavy work there, or a `setState` that re-renders a large tree on every frame, will make the UI stutter. Do the minimum, and use shared values or refs for anything that updates every frame.

## Recommended starting point

```ts
{
  numPoses: 1,
  minPoseDetectionConfidence: 0.5,
  minPosePresenceConfidence: 0.5,
  minTrackingConfidence: 0.5,
  delegate: Delegate.GPU,
  fpsMode: 15,
}
```
