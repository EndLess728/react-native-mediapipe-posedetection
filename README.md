# react-native-mediapipe-posedetection

PoseDetection using Google's MediaPipe models with pose landmark detection.

> **⚠️ New Architecture Required**
>
> This library **only supports** React Native's **New Architecture** (Turbo Modules). You must enable the New Architecture in your app to use this library.

## Requirements

- **React Native:** 0.74.0 or higher
- **New Architecture:** Must be enabled
- **iOS:** iOS 12.0+
- **Android:** API 24+
- **Dependencies:**
  - `react-native-vision-camera` (for real-time detection)
  - `react-native-worklets-core` (for frame processing)

## Installation

```bash
npm install react-native-mediapipe-posedetection
# or
yarn add react-native-mediapipe-posedetection
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

Add the MediaPipe model to your iOS project:

1. Download the pose landmarker model
2. Add it to your Xcode project
3. Ensure it's included in "Copy Bundle Resources"

### Android Setup

The MediaPipe dependencies are automatically included. No additional setup required.

## Usage

### Real-time Pose Detection with Camera

```typescript
import {
  usePoseDetection,
  RunningMode,
  Delegate,
} from 'react-native-mediapipe-posedetection';
import { Camera, useCameraDevice } from 'react-native-vision-camera';

function PoseDetectionScreen() {
  const device = useCameraDevice('back');

  const poseDetection = usePoseDetection(
    {
      onResults: (result) => {
        console.log('Pose detected:', result.landmarks);
      },
      onError: (error) => {
        console.error('Detection error:', error);
      },
    },
    RunningMode.LIVE_STREAM,
    'pose_landmarker_lite.task',
    {
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      delegate: Delegate.GPU,
    }
  );

  if (!device) return null;

  return (
    <Camera
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
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      delegate: Delegate.GPU,
    }
  );

  console.log('Detected poses:', result.landmarks);
}
```

## API Reference

### `usePoseDetection(callbacks, runningMode, model, options)`

Hook for real-time pose detection.

**Parameters:**

- `callbacks`: Object with `onResults` and `onError` handlers
- `runningMode`: `RunningMode.LIVE_STREAM` or `RunningMode.VIDEO`
- `model`: Path to the MediaPipe model file
- `options`: Configuration options (optional)
  - `numPoses`: Maximum number of poses to detect (default: 1)
  - `minPoseDetectionConfidence`: Minimum confidence for detection (default: 0.5)
  - `minPosePresenceConfidence`: Minimum confidence for presence (default: 0.5)
  - `minTrackingConfidence`: Minimum confidence for tracking (default: 0.5)
  - `delegate`: `Delegate.CPU`, `Delegate.GPU`, or `Delegate.NNAPI` (Android)
  - `mirrorMode`: `'no-mirror'`, `'mirror'`, or `'mirror-front-only'`
  - `fpsMode`: `'none'` or number (target FPS)

**Returns:** Object with frame processor and camera handlers

### `PoseDetectionOnImage(imagePath, model, options)`

Detect poses in a static image.

**Returns:** Promise resolving to detection results

## Migration from Old Architecture

If you were using a previous version that supported the Old Architecture:

1. **Upgrade React Native** to 0.74.0 or higher
2. **Enable New Architecture** (see instructions above)
3. **Update your app configuration** to remove any Old Architecture compatibility layers
4. **Rebuild your app** completely:

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

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
