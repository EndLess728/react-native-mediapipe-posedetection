import { type ConfigPlugin, createRunOncePlugin } from '@expo/config-plugins';

import type { MediapipePluginProps } from './PluginProps';
import { android } from './android';
import { ios } from './ios';

let pkg: { name: string; version?: string } = {
  name: 'react-native-mediapipe-posedetection',
};
try {
  pkg = require('react-native-mediapipe-posedetection/package.json');
} catch {
  // empty catch block
}

/**
 * Main config plugin entry point for react-native-mediapipe-posedetection
 *
 * Copies model assets to:
 * - Android: android/app/src/main/assets/
 * - iOS: ios/ (root folder with Xcode project references)
 *
 * Usage in app.json:
 * ```json
 * [
 *   "react-native-mediapipe-posedetection",
 *   {
 *     "assetsPaths": ["./models/"],
 *     "ignoredPattern": "\\.txt$"  // optional regex pattern
 *   }
 * ]
 * ```
 */
const withMediapipePosedetection: ConfigPlugin<MediapipePluginProps> = (
  config,
  props
) => {
  const { assetsPaths = [] } = props || {};

  if (assetsPaths.length === 0) {
    console.warn(
      '⚠️ [react-native-mediapipe-posedetection] No assetsPaths provided to config plugin'
    );
    return config;
  }

  // Android
  config = android.withAssets(config, props);

  // iOS
  config = ios.withAssets(config, props);

  return config;
};

export default createRunOncePlugin(
  withMediapipePosedetection,
  pkg.name,
  pkg.version
);
