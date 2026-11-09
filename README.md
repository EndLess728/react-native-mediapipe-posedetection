# react-native-mediapipe-posedetection

<div style="display: flex; gap: 10px; align-items: center;">
  <img src="https://img.shields.io/npm/v/react-native-mediapipe-posedetection?color=orange&style=flat-square&logo=npm" alt="npm version"/>
  <img src="https://img.shields.io/npm/dt/react-native-mediapipe-posedetection?color=blue&style=flat-square&logo=npm" alt="npm total downloads"/>
  <img src="https://img.shields.io/npm/dw/react-native-mediapipe-posedetection?color=blue&style=flat-square&logo=npm" alt="npm weekly downloads"/>
</div>

High-performance pose detection for React Native using Google's MediaPipe models with optimized frame processing for smooth real-time tracking.

You can find the package on npm: [react-native-mediapipe-posedetection](https://www.npmjs.com/package/react-native-mediapipe-posedetection)

📖 **[Read the full documentation →](https://endless728.github.io/react-native-mediapipe-posedetection/)**

> **⚠️ New Architecture Required**
>
> This library **only supports** React Native's **New Architecture** (Turbo Modules). You must enable the New Architecture in your app to use this library.

## Features

- ✨ Real-time pose detection via `react-native-vision-camera`
- 🎯 33 pose landmarks per detected person
- 🚀 Optimized for performance (configurable FPS limit, built-in event throttling on iOS)
- 📱 iOS & Android support
- 🔥 GPU acceleration support
- 🎨 Static image detection support
- 🪝 Easy-to-use React hooks

## Requirements

- **React Native:** 0.74.0 or higher
- **New Architecture:** Must be enabled
- **iOS:** the minimum iOS version supported by your React Native version
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

### Expo Configuration

If you are using Expo, you can use the built-in config plugin to automatically copy your MediaPipe model files to the native Android and iOS projects during prebuild.

1. Add your model files (e.g., `pose_landmarker_lite.task`) to a directory in your project (e.g., `./assets/models/`).
2. Update your `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-mediapipe-posedetection",
        {
          "assetsPaths": ["./assets/models/"]
        }
      ]
    ]
  }
}
```

This plugin will copy all files from the specified `assetsPaths` to:

- **Android:** `android/app/src/main/assets/`
- **iOS:** The root of the Xcode project (and add them to the build resources).

> **Note:** The `assetsPaths` are relative to your project root. You can also pass `ignoredPattern` (a regex string) to skip files, e.g. `"\\.md$"`.

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
        // result.results[0].landmarks is an array of people, each with 33 landmarks
        const people = result.results[0]?.landmarks ?? [];
        console.log('Number of poses:', people.length);
        const firstPerson = people[0];
        if (firstPerson) {
          const nose = firstPerson[KnownPoseLandmarks.nose];
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
      pixelFormat="rgb"
      frameProcessor={poseDetection.frameProcessor}
      onLayout={poseDetection.cameraViewLayoutChangeHandler}
      onOutputOrientationChanged={poseDetection.cameraOrientationChangedHandler}
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

  console.log('Detected poses:', result.results[0]?.landmarks.length ?? 0);
  console.log('Inference time:', result.inferenceTime, 'ms');
}
```

### Using the MediapipeCamera Component

For a simpler setup, pass the result of `usePoseDetection` to the provided `MediapipeCamera` component. It wires up the frame processor, layout, orientation and camera device handlers for you:

```typescript
import {
  MediapipeCamera,
  usePoseDetection,
  RunningMode,
} from 'react-native-mediapipe-posedetection';

function App() {
  const solution = usePoseDetection(
    {
      onResults: (result) => {
        console.log('Pose detected:', result.results[0]?.landmarks);
      },
      onError: (error) => console.warn(error.message),
    },
    RunningMode.LIVE_STREAM,
    'pose_landmarker_lite.task',
    { numPoses: 1, minPoseDetectionConfidence: 0.5 }
  );

  return (
    <MediapipeCamera
      style={{ flex: 1 }}
      solution={solution}
      activeCamera="back" // 'front' (default) | 'back'
      resizeMode="cover" // 'cover' (default) | 'contain'
    />
  );
}
```

## API Reference

### `usePoseDetection(callbacks, runningMode, model, options)`

Hook for real-time pose detection.

**Parameters:**

- **`callbacks`**: `DetectionCallbacks<PoseDetectionResultBundle>`

  - `onResults: (result: PoseDetectionResultBundle, viewCoordinator: ViewCoordinator) => void` - Called when poses are detected. `viewCoordinator` converts normalized landmarks to screen coordinates
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
  - `delegate`: `Delegate.CPU | Delegate.GPU` - Processing delegate (default: GPU)
  - `mirrorMode`: `'no-mirror' | 'mirror' | 'mirror-front-only'` - Camera mirroring (default: `'mirror-front-only'` on Android, `'no-mirror'` on iOS)
  - `forceCameraOrientation` / `forceOutputOrientation`: `ImageOrientation` - Override detected orientations
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
  results: PoseLandmarkerResult[]; // One entry for live camera frames and single images
  inferenceTime: number; // Milliseconds
  inputImageWidth: number;
  inputImageHeight: number;
}

interface PoseLandmarkerResult {
  landmarks: Landmark[][]; // [person][landmarkIndex], 33 landmarks per person, normalized
  worldLandmarks: Landmark[][]; // [person][landmarkIndex], 3D world coordinates in meters
  segmentationMasks: Mask[];
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

const landmarks = result.results[0]?.landmarks[0]; // first person
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

### ⚡ Event Throttling on iOS

On iOS, the native module caps result events sent to JavaScript at ~15 per second to keep memory stable during long sessions. This needs no configuration. Android delivers every result, so setting `fpsMode` (below) matters more there.

### 🎯 FPS Control

Limit how many frames are sent to MediaPipe with the `fpsMode` option. 10–15 FPS is enough for smooth tracking in most apps and saves battery:

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

**Solution:**

1. Ensure you're on the latest version
2. Set `fpsMode: 15` (or lower)
3. Reduce `numPoses` to 1
4. Set `shouldOutputSegmentationMasks: false`
5. Use `Delegate.CPU` instead of `Delegate.GPU` if GPU memory is limited

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
