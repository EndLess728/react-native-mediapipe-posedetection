---
title: Landmarks
description: All 33 MediaPipe pose landmark indices, the KnownPoseLandmarks map, skeleton connections, and an example of calculating joint angles.
---

Every detected person has 33 landmarks. Use `KnownPoseLandmarks` instead of raw numbers:

```ts
import { KnownPoseLandmarks } from 'react-native-mediapipe-posedetection';

const leftKnee = person[KnownPoseLandmarks.leftKnee];
```

## Index table

| Index | Name | Index | Name |
| --- | --- | --- | --- |
| 0 | `nose` | 17 | `leftPinky` |
| 1 | `leftEyeInner` | 18 | `rightPinky` |
| 2 | `leftEye` | 19 | `leftIndex` |
| 3 | `leftEyeOuter` | 20 | `rightIndex` |
| 4 | `rightEyeInner` | 21 | `leftThumb` |
| 5 | `rightEye` | 22 | `rightThumb` |
| 6 | `rightEyeOuter` | 23 | `leftHip` |
| 7 | `leftEar` | 24 | `rightHip` |
| 8 | `rightEar` | 25 | `leftKnee` |
| 9 | `mouthLeft` | 26 | `rightKnee` |
| 10 | `mouthRight` | 27 | `leftAnkle` |
| 11 | `leftShoulder` | 28 | `rightAnkle` |
| 12 | `rightShoulder` | 29 | `leftHeel` |
| 13 | `leftElbow` | 30 | `rightHeel` |
| 14 | `rightElbow` | 31 | `leftFootIndex` |
| 15 | `leftWrist` | 32 | `rightFootIndex` |
| 16 | `rightWrist` | | |

"Left" and "right" are the **person's** left and right, not the screen's.

## Skeleton connections

`KnownPoseLandmarkConnections` is an array of `[from, to]` index pairs. Draw a line for each pair to render a skeleton:

```ts
for (const [a, b] of KnownPoseLandmarkConnections) {
  drawLine(points[a], points[b]);
}
```

## Example: knee angle for a squat counter

Use `worldLandmarks` so the angle doesn't depend on distance from the camera:

```ts
import { KnownPoseLandmarks as L, type Landmark } from 'react-native-mediapipe-posedetection';

function angle(a: Landmark, b: Landmark, c: Landmark) {
  const ab = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
  const cb = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
  const dot = ab.x * cb.x + ab.y * cb.y + ab.z * cb.z;
  const mag = Math.hypot(ab.x, ab.y, ab.z) * Math.hypot(cb.x, cb.y, cb.z);
  return (Math.acos(Math.min(1, Math.max(-1, dot / mag))) * 180) / Math.PI;
}

const world = result.results[0]?.worldLandmarks[0];
if (world) {
  const kneeAngle = angle(world[L.leftHip], world[L.leftKnee], world[L.leftAnkle]);
  // ~170° standing, under ~90° at the bottom of a squat
}
```
