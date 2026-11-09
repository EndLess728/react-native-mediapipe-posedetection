---
title: Introduction
description: What react-native-mediapipe-posedetection does, how it works, and what you need before installing it.
---

`react-native-mediapipe-posedetection` brings Google's [MediaPipe Pose Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker) to React Native. It detects people in a camera feed or an image and returns 33 landmarks for each person: points on the face, arms, hands, torso, legs and feet.

## How it works

1. You create a detector with `usePoseDetection`, giving it a MediaPipe model file and some options.
2. The hook returns a VisionCamera **frame processor**. You attach it to a `<Camera>` (or use the bundled `<MediapipeCamera>`).
3. Every camera frame is passed straight to MediaPipe in native code (Swift on iOS, Kotlin on Android).
4. Results come back to JavaScript through your `onResults` callback, along with a helper that converts landmark coordinates into screen coordinates for drawing.

For photos you don't need a camera at all: call `PoseDetectionOnImage(path, model)` and await the result.

## Requirements

| | |
| --- | --- |
| React Native | 0.74 or newer |
| Architecture | **New Architecture only** (TurboModules) |
| iOS | The minimum iOS version of your React Native version |
| Android | API 24+ |
| Expo | SDK with New Architecture enabled, using a development build (not Expo Go) |
| Peer dependencies | `react-native-vision-camera` v4, `react-native-worklets-core` |

:::caution[New Architecture required]
This library is a TurboModule and does not work on the old bridge architecture. New Architecture is on by default in React Native 0.76+ and Expo SDK 52+.
:::

## Credits

The pose detection code is based on [react-native-mediapipe](https://github.com/cdiddy77/react-native-mediapipe) by cdiddy77, rewritten as a TurboModule for the New Architecture.

## Next

Head to [Installation](../installation/).
