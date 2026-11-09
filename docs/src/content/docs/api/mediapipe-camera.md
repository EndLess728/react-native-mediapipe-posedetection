---
title: MediapipeCamera
description: API reference for the MediapipeCamera component, a VisionCamera wrapper pre-wired for pose detection.
---

A VisionCamera `<Camera>` with everything from `usePoseDetection` already connected: frame processor, layout, orientation, device and resize mode.

```tsx
<MediapipeCamera
  style={{ flex: 1 }}
  solution={solution}
  activeCamera="back"
  resizeMode="cover"
/>
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `style` | `ViewStyle` | — | **Required.** Style for the camera view. |
| `solution` | `MediaPipeSolution` | — | **Required.** The value returned by `usePoseDetection`. |
| `activeCamera` | `'front' \| 'back' \| 'external'` | `'front'` | Which camera to use. |
| `resizeMode` | `'cover' \| 'contain'` | `'cover'` | How the preview fills the view. |

It also forwards a `ref` to the underlying VisionCamera `Camera`, so you can call `takePhoto()` and other camera methods. Photo capture is enabled.

While the camera device is loading it renders a plain "Loading..." text.

## Using your own Camera

If you need full control over VisionCamera props, render `<Camera>` yourself and connect the handlers:

```tsx
import { useEffect } from 'react';
import { Camera, useCameraDevice } from 'react-native-vision-camera';

function MyCamera({ solution }: { solution: MediaPipeSolution }) {
  const device = useCameraDevice('back');

  useEffect(() => {
    solution.cameraDeviceChangeHandler(device);
  }, [device, solution]);

  useEffect(() => {
    solution.resizeModeChangeHandler('cover');
  }, [solution]);

  if (!device) return null;

  return (
    <Camera
      style={{ flex: 1 }}
      device={device}
      isActive
      pixelFormat="rgb"
      resizeMode="cover"
      frameProcessor={solution.frameProcessor}
      onLayout={solution.cameraViewLayoutChangeHandler}
      onOutputOrientationChanged={solution.cameraOrientationChangedHandler}
    />
  );
}
```

If you skip the device, layout or orientation handlers, detection still runs, but points converted with the `ViewCoordinator` will be in the wrong place.
