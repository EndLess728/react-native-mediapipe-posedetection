# React Native MediaPipe Pose Detection - Expo Config Plugin

This package includes an Expo config plugin for automatically copying asset files to your Android and iOS projects.

## Usage

Add the plugin to your `app.json` or `app.config.js`:

### app.json

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-mediapipe-posedetection",
        {
          "assetsPaths": ["./assets/models/"],
          "ignoredPattern": "^\\."
        }
      ]
    ]
  }
}
```

### app.config.js

```javascript
export default {
  expo: {
    plugins: [
      [
        'react-native-mediapipe-posedetection',
        {
          assetsPaths: [
            'node_modules/react-native-mediapipe-posedetection/assets',
          ],
          ignoredPattern: '^\\.',
        },
      ],
    ],
  },
};
```

## Plugin Options

- **assetsPaths** (string[]): Array of paths containing assets to copy to native projects
- **ignoredPattern** (string, optional): Regex pattern to ignore certain files (e.g., hidden files starting with `.`)

## What It Does

### Android

Copies assets to `android/app/src/main/assets/` directory.

### iOS

Copies assets to the iOS project root and adds them to the Xcode project with proper references.

## Example

If you have model files in your package's `assets` directory, the plugin will automatically copy them to the appropriate locations in the native projects when you run `npx expo prebuild` or `eas build`.
