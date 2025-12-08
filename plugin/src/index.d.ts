import { ConfigPlugin } from '@expo/config-plugins';

export interface CustomAssetsPluginOptions {
  /**
   * Array of paths containing assets to copy to native projects
   * @example ['node_modules/react-native-mediapipe-posedetection/assets']
   */
  assetsPaths: string[];

  /**
   * Optional regex pattern to ignore certain files
   * @example '^\\.' (to ignore hidden files starting with .)
   */
  ignoredPattern?: string;
}

/**
 * Expo Config Plugin for copying custom assets to Android and iOS projects
 */
declare const withCustomAssets: ConfigPlugin<CustomAssetsPluginOptions>;

export default withCustomAssets;
