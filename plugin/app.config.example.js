/**
 * Example Expo app.config.js demonstrating how to use the
 * react-native-mediapipe-posedetection Expo Config Plugin
 */

export default {
  name: 'MyApp',
  slug: 'my-app',
  version: '1.0.0',
  expo: {
    name: 'MyApp',
    slug: 'my-app',
    version: '1.0.0',

    // Add the plugin here
    plugins: [
      [
        'react-native-mediapipe-posedetection',
        {
          // Specify paths containing assets to copy
          assetsPaths: [
            './assets/models/',
            // You can add custom asset paths from your project too
            // 'assets/mediapipe-models',
          ],
          // Optional: Ignore files matching this pattern (e.g., hidden files)
          ignoredPattern: '^\\.',
        },
      ],
    ],
  },
};
