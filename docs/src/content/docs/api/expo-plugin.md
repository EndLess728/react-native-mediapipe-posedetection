---
title: Expo config plugin
description: Options for the react-native-mediapipe-posedetection Expo config plugin that copies MediaPipe model files into iOS and Android during prebuild.
---

The package includes a config plugin that copies model files (or any other assets) into the native projects when you run `npx expo prebuild`.

```json title="app.json"
{
  "expo": {
    "plugins": [
      [
        "react-native-mediapipe-posedetection",
        {
          "assetsPaths": ["./assets/models/"],
          "ignoredPattern": "\\.md$"
        }
      ]
    ]
  }
}
```

## Options

| Option | Type | Description |
| --- | --- | --- |
| `assetsPaths` | `string[]` | Folders, relative to the project root, whose files are copied. Subfolders are not copied. |
| `ignoredPattern` | `string` | Optional regular expression. Files whose name matches are skipped. |

## Where files go

| Platform | Destination |
| --- | --- |
| Android | `android/app/src/main/assets/` |
| iOS | The `ios/` project root, added to the app target's **Copy Bundle Resources** |

If a folder can't be read, the plugin logs a warning and carries on.

:::note
Plugins only run during prebuild. After adding or replacing a model, run `npx expo prebuild --clean` (or start a new EAS build).
:::
