# react-native-mediapipe-posedetection

<div style="display: flex; gap: 10px; align-items: center;">
  <img src="https://img.shields.io/npm/v/react-native-mediapipe-posedetection?color=orange&style=flat-square&logo=npm" alt="npm version"/>
  <img src="https://img.shields.io/npm/dw/react-native-mediapipe-posedetection?color=blue&style=flat-square&logo=npm" alt="npm weekly downloads"/>
</div>


High-performance pose detection for React Native using Google's MediaPipe models with optimized frame processing for smooth real-time tracking.

You can find the package on npm: [react-native-mediapipe-posedetection](https://www.npmjs.com/package/react-native-mediapipe-posedetection)

> **⚠️ New Architecture Required**
>
> This library **only supports** React Native's **New Architecture** (Turbo Modules). You must enable the New Architecture in your app to use this library.

## Features

- ✨ Real-time pose detection via `react-native-vision-camera`
- 🎯 33 pose landmarks per detected person
- 🚀 Optimized for performance (~15 FPS throttling to prevent memory issues)
- 📱 iOS & Android support
- 🔥 GPU acceleration support
- 🎨 Static image detection support
- 🪝 Easy-to-use React hooks

## Requirements

- **React Native:** 0.74.0 or higher
- **New Architecture:** Must be enabled
- **iOS:** iOS 12.0+
- **Android:** API 24+
- **Dependencies:**
  - `react-native-vision-camera` ^4.0.0 (for real-time detection)
  - `react-native-worklets-core` ^1.0.0 (for frame processing)

## Installation

```bash
npm install react-native-mediapipe-posedetection react-native-vision-camera react-native-worklets-core
# or
yarn add react-native-mediapipe-posedetection react-native-vision-camera react-native-worklets-core
```

### Enable New Architecture

If you haven't already enabled the New Architecture in your React Native app:

#### Android

In your `android/gradle.properties`:

```properties
newArchEnabled=true
```

#### iOS

In your `ios/Podfile`:

```ruby
use_frameworks! :linkage => :static
$RNNewArchEnabled = true
```

Then reinstall pods:

```bash
cd ios && pod install
```

### iOS Setup

1. Download the MediaPipe pose landmarker model (e.g., `pose_landmarker_lite.task`)
2. Add it to your Xcode project
3. Ensure it's included in "Copy Bundle Resources" build phase

### Android Setup

The MediaPipe dependencies are automatically included. Place your model file in `android/app/src/main/assets/`.

## Usage

### Real-time Pose Detection with Camera

```typescript
import {
  usePoseDetection,
  RunningMode,
  Delegate,
  KnownPoseLandmarks,
} from 'react-native-mediapipe-posedetection';
import { Camera, useCameraDevice } from 'react-native-vision-camera';

function PoseDetectionScreen() {
  const device = useCameraDevice('back');

  const poseDetection = usePoseDetection(
    {
      onResults: (result) => {
        // result.landmarks contains detected pose keypoints
        console.log('Number of poses:', result.landmarks.length);
        if (result.landmarks[0]?.length > 0) {
          const nose = result.landmarks[0][KnownPoseLandmarks.nose];
          console.log('Nose position:', nose.x, nose.y);
        }
      },
      onError: (error) => {
        console.error('Detection error:', error.message);
      },
    },
    RunningMode.LIVE_STREAM,
    'pose_landmarker_lite.task',
    {
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      delegate: Delegate.GPU,
    }
  );

  if (!device) return null;

  return (
    <Camera
      style={{ flex: 1 }}
      device={device}
      isActive={true}
      frameProcessor={poseDetection.frameProcessor}
      onLayout={poseDetection.cameraViewLayoutChangeHandler}
    />
  );
}
```

### Static Image Detection

```typescript
import {
  PoseDetectionOnImage,
  Delegate,
} from 'react-native-mediapipe-posedetection';

async function detectPoseInImage(imagePath: string) {
  const result = await PoseDetectionOnImage(
    imagePath,
    'pose_landmarker_lite.task',
    {
      numPoses: 2, // Detect up to 2 people
      minPoseDetectionConfidence: 0.5,
      delegate: Delegate.GPU,
    }
  );

  console.log('Detected poses:', result.landmarks.length);
  console.log('Inference time:', result.inferenceTime, 'ms');
}
```

### Using the MediapipeCamera Component

For a simpler setup, use the provided `MediapipeCamera` component:

```typescript
import { MediapipeCamera } from 'react-native-mediapipe-posedetection';

function App() {
  return (
    <MediapipeCamera
      style={{ flex: 1 }}
      cameraPosition="back"
      onResults={(result) => {
        console.log('Pose detected:', result.landmarks);
      }}
      poseDetectionOptions={{
        numPoses: 1,
        minPoseDetectionConfidence: 0.5,
      }}
    />
  );
}
```

## API Reference

### `usePoseDetection(callbacks, runningMode, model, options)`

Hook for real-time pose detection.

**Parameters:**

- **`callbacks`**: `DetectionCallbacks<PoseDetectionResultBundle>`

  - `onResults: (result: PoseDetectionResultBundle) => void` - Called when poses are detected
  - `onError: (error: DetectionError) => void` - Called on detection errors

- **`runningMode`**: `RunningMode`

  - `RunningMode.LIVE_STREAM` - For camera/video input
  - `RunningMode.VIDEO` - For video file processing
  - `RunningMode.IMAGE` - For static images (use `PoseDetectionOnImage` instead)

- **`model`**: `string` - Path to MediaPipe model file (e.g., `'pose_landmarker_lite.task'`)

- **`options`**: `Partial<PoseDetectionOptions>` (optional)
  - `numPoses`: `number` - Maximum number of poses to detect (default: 1)
  - `minPoseDetectionConfidence`: `number` - min confidence threshold (default: 0.5)
  - `minPosePresenceConfidence`: `number` - min presence threshold (default: 0.5)
  - `minTrackingConfidence`: `number` - min tracking threshold (default: 0.5)
  - `shouldOutputSegmentationMasks`: `boolean` - Include segmentation masks (default: false)
  - `delegate`: `Delegate.CPU | Delegate.GPU | Delegate.NNAPI` - Processing delegate (default: GPU)
  - `mirrorMode`: `'no-mirror' | 'mirror' | 'mirror-front-only'` - Camera mirroring
  - `fpsMode`: `'none' | number` - Additional FPS throttling (default: 'none')

**Returns:** `MediaPipeSolution`

- `frameProcessor`: VisionCamera frame processor
- `cameraViewLayoutChangeHandler`: Layout change handler
- `cameraDeviceChangeHandler`: Camera device change handler
- `cameraOrientationChangedHandler`: Orientation change handler
- `resizeModeChangeHandler`: Resize mode handler
- `cameraViewDimensions`: Current camera view dimensions

### `PoseDetectionOnImage(imagePath, model, options)`

Detect poses in a static image.

**Parameters:**

- `imagePath`: `string` - Path to the image file
- `model`: `string` - Path to MediaPipe model file
- `options`: Same as `usePoseDetection` options

**Returns:** `Promise<PoseDetectionResultBundle>`

### Result Structure

```typescript
interface PoseDetectionResultBundle {
  inferenceTime: number; // Milliseconds
  size: { width: number; height: number };
  landmarks: Landmark[][]; // Array of poses, each with 33 landmarks
  worldLandmarks: Landmark[][]; // 3D world coordinates
  segmentationMasks?: Mask[]; // Optional segmentation masks
}

interface Landmark {
  x: number; // Normalized 0-1
  y: number; // Normalized 0-1
  z: number; // Depth (relative)
  visibility?: number; // Confidence 0-1
  presence?: number; // Presence confidence 0-1
}
```

### Landmark Indices

Use `KnownPoseLandmarks` for easy landmark access:

```typescript
import { KnownPoseLandmarks } from 'react-native-mediapipe-posedetection';

const landmarks = result.landmarks[0];
const nose = landmarks[KnownPoseLandmarks.nose];
const leftShoulder = landmarks[KnownPoseLandmarks.leftShoulder];
const rightWrist = landmarks[KnownPoseLandmarks.rightWrist];
```

**Available landmarks:**

- Face: `nose`, `leftEye`, `rightEye`, `leftEar`, `rightEar`, `mouthLeft`, `mouthRight`
- Upper body: `leftShoulder`, `rightShoulder`, `leftElbow`, `rightElbow`, `leftWrist`, `rightWrist`
- Hands: `leftPinky`, `rightPinky`, `leftIndex`, `rightIndex`, `leftThumb`, `rightThumb`
- Lower body: `leftHip`, `rightHip`, `leftKnee`, `rightKnee`, `leftAnkle`, `rightAnkle`
- Feet: `leftHeel`, `rightHeel`, `leftFootIndex`, `rightFootIndex`

## Performance Optimizations

This library includes critical performance optimizations for React Native's new architecture:

### ⚡ Automatic Frame Throttling

To prevent memory pressure and crashes, the library automatically throttles:

1. **Frame processing** to ~15 FPS (MediaPipe detection calls)
2. **Event emissions** to ~15 FPS (JavaScript callbacks)

This dual-layer throttling ensures:

- ✅ Stable memory usage
- ✅ No crashes during extended use
- ✅ Smooth pose detection experience
- ✅ Efficient battery usage

The throttling is transparent and requires no configuration. 15 FPS is sufficient for smooth pose tracking in most use cases.

### 🎯 Additional FPS Control

For even more control, use the `fpsMode` option:

```typescript
usePoseDetection(callbacks, RunningMode.LIVE_STREAM, 'model.task', {
  fpsMode: 10, // Process frames at 10 FPS
});
```

## Migration from Old Architecture

If you were using a previous version that supported the Bridge architecture:

1. **Upgrade React Native** to 0.74.0 or higher
2. **Enable New Architecture** (see installation instructions)
3. **Rebuild your app completely:**

   ```bash
   # iOS
   cd ios && pod install && cd ..

   # Android
   cd android && ./gradlew clean && cd ..
   ```

The API remains the same, so your application code shouldn't need changes.

## Troubleshooting

### "MediapipePosedetection TurboModule is not available"

**Cause:** New Architecture is not enabled or not properly configured.

**Solution:**

1. Verify `newArchEnabled=true` in `android/gradle.properties`
2. Verify `$RNNewArchEnabled = true` in `ios/Podfile`
3. Clean and rebuild your app
4. Ensure you're using React Native 0.74.0+

### "Failed to create detector"

**Cause:** Model file not found or invalid configuration.

**Solution:**

1. Verify the model file path is correct
2. Ensure the model file is included in your app bundle
3. Check that the model file is a valid MediaPipe pose landmarker model

### Memory Warnings / Crashes on iOS

**Solution:** The library automatically throttles to prevent this. If you still experience issues:

1. Ensure you're on the latest version
2. Reduce `numPoses` to 1
3. Set `shouldOutputSegmentationMasks: false`
4. Use `Delegate.CPU` instead of `Delegate.GPU` if GPU memory is limited

### Poor Performance

**Solutions:**

1. Use `pose_landmarker_lite.task` instead of `pose_landmarker_full.task`
2. Set `fpsMode: 10` for lower frame processing
3. Reduce `numPoses` if you don't need to detect multiple people
4. Enable GPU acceleration: `delegate: Delegate.GPU`

## Example App

Check out the [example](./example) directory for a complete working app demonstrating:

- Real-time pose detection
- Pose landmark visualization
- Camera controls
- Performance optimization

Run the example:

```bash
cd example
yarn install
yarn ios  # or yarn android
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## Credits

This library is based on the work from [react-native-mediapipe](https://github.com/cdiddy77/react-native-mediapipe) by [cdiddy77](https://github.com/cdiddy77). The pose detection module codes were taken from this repository and upgraded to support React Native's New Architecture (Turbo Modules).

## License

MIT © [EndLess728](https://github.com/EndLess728)

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
