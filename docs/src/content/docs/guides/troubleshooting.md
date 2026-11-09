---
title: Troubleshooting
description: Fixes for common react-native-mediapipe-posedetection errors like TurboModule not available, failed to create detector, no results, and memory crashes.
---

## "MediapipePosedetection TurboModule is not available"

The native module isn't in your build, or the New Architecture is off.

1. Confirm the New Architecture is enabled (`newArchEnabled=true` on Android; default on React Native 0.76+ and Expo SDK 52+).
2. If you're on Expo, make sure you're running a **development build**, not Expo Go.
3. Do a clean native rebuild: `npx expo prebuild --clean` on Expo, or `cd ios && pod install` plus `cd android && ./gradlew clean` on bare React Native.

## "Failed to initialize posedetection plugin"

The VisionCamera frame processor plugin couldn't be registered. Usually one of:

- `react-native-worklets-core` isn't installed, or its Babel plugin is missing from `babel.config.js`.
- Metro is serving an old bundle. Restart with `npx expo start --clear` or `npx react-native start --reset-cache`.

## "Failed to create detector"

MediaPipe couldn't load the model.

1. Check the file name you pass matches the bundled file exactly, including `.task`.
2. Check the file is actually in the build. See [Model files](../../getting-started/model-files/).
3. On Expo, re-run `npx expo prebuild --clean` after adding a model.
4. Make sure it's a **pose landmarker** model, not a different MediaPipe task.

## Camera shows but `onResults` never fires

- Did you attach the frame processor? With your own `<Camera>`, pass `frameProcessor={solution.frameProcessor}`.
- If you use your own `<Camera>`, set `pixelFormat="rgb"`, which is what `MediapipeCamera` uses and what the library is tested with.
- Check that camera permission was granted.
- Add an `onError` callback and log what it receives.

## Landmarks are offset or flipped

You're probably drawing normalized coordinates directly. Convert them with the `ViewCoordinator` passed to `onResults`, and wire up all the camera handlers. See [Drawing a skeleton overlay](../skeleton-overlay/).

## Memory warnings or crashes during long sessions

1. Update to the latest version.
2. Set `fpsMode` to 10–15.
3. Keep `numPoses: 1` and `shouldOutputSegmentationMasks: false`.
4. Try `Delegate.CPU` on devices with limited GPU memory.

## Upgrading from an old-architecture version

The JavaScript API is the same. Upgrade React Native to 0.74+, enable the New Architecture, and do a full clean rebuild of both platforms.

## Still stuck?

[Open an issue](https://github.com/EndLess728/react-native-mediapipe-posedetection/issues) with your React Native / Expo version, platform, device and the full error.
