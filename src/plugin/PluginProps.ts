/**
 * Plugin options for react-native-mediapipe-posedetection config plugin
 */
export interface MediapipePluginProps {
  /**
   * Array of paths to asset directories (relative to project root)
   * These assets will be copied to Android assets and iOS project
   * @example ["./models/"]
   */
  assetsPaths?: string[];

  /**
   * Optional regex pattern to ignore files during copy
   * @example "\\.txt$" to ignore .txt files
   */
  ignoredPattern?: string;
}
