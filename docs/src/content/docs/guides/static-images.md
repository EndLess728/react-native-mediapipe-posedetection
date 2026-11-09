---
title: Detecting poses in images
description: Run MediaPipe pose detection on a photo or image file in React Native with PoseDetectionOnImage.
---

Use `PoseDetectionOnImage` when you have a photo instead of a live camera feed, for example something the user picked from their gallery or a frame you saved with `camera.takePhoto()`.

```ts
import { Delegate, PoseDetectionOnImage } from 'react-native-mediapipe-posedetection';

async function analyzePhoto(path: string) {
  const result = await PoseDetectionOnImage(path, 'pose_landmarker_heavy.task', {
    numPoses: 2,
    minPoseDetectionConfidence: 0.5,
    delegate: Delegate.GPU,
  });

  const people = result.results[0]?.landmarks ?? [];
  console.log(`Found ${people.length} people in ${result.inferenceTime} ms`);
  console.log(`Image size: ${result.inputImageWidth}x${result.inputImageHeight}`);
  return people;
}
```

## With a VisionCamera photo

```tsx
const camera = useRef<Camera>(null);

const capture = async () => {
  const photo = await camera.current?.takePhoto();
  if (!photo) return;
  const people = await analyzePhoto(photo.path);
};
```

`MediapipeCamera` forwards its ref to the underlying `<Camera>` and has photo capture turned on, so you can pass `ref={camera}` to it directly.

## Tips

- There's no frame rate to keep up with, so the **heavy** model is a good choice for images.
- Landmarks are normalized to the image. Multiply `x` by `inputImageWidth` and `y` by `inputImageHeight` to get pixel positions in the original image.
- The detector is created and released for each call. If you process many images in a row, run them one after another rather than all at once.
