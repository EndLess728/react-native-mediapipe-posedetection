const path = require('path');
const {
  withDangerousMod,
  withXcodeProject,
  IOSConfig,
} = require('@expo/config-plugins');
const { copyFileSync, ensureDirSync, readdir } = require('fs-extra');

/**
 * Custom Expo config plugin to copy assets to:
 * - Android: android/app/src/main/assets/
 * - iOS: ios/ (root folder with Xcode project references)
 */

function withCustomAssetsAndroid(config, props) {
  const { assetsPaths, ignoredPattern } = props;

  return withDangerousMod(config, [
    'android',
    async (config) => {
      const { projectRoot } = config.modRequest;

      // Copy to android/app/src/main/assets/
      const assetsDir = path.join(
        projectRoot,
        'android',
        'app',
        'src',
        'main',
        'assets'
      );
      ensureDirSync(assetsDir);

      for (const assetSourceDir of assetsPaths) {
        const assetSourcePath = path.join(projectRoot, assetSourceDir);
        const files = await readdir(assetSourcePath, { withFileTypes: true });

        for (const file of files) {
          if (
            file.isFile() &&
            (!ignoredPattern || !file.name.match(new RegExp(ignoredPattern)))
          ) {
            const srcPath = path.join(assetSourcePath, file.name);
            const destPath = path.join(assetsDir, file.name);
            copyFileSync(srcPath, destPath);
            console.log(`✅ [Android] Copied ${file.name} to assets/`);
          }
        }
      }

      return config;
    },
  ]);
}

function withCustomAssetsIos(config, props) {
  const { assetsPaths, ignoredPattern } = props;

  return withXcodeProject(config, async (config) => {
    const { projectRoot, platformProjectRoot } = config.modRequest;
    const project = config.modResults;
    const projectName = config.modRequest.projectName;

    // Copy files directly to iOS root folder
    ensureDirSync(platformProjectRoot);

    for (const assetSourceDir of assetsPaths) {
      const assetSourcePath = path.join(projectRoot, assetSourceDir);
      const files = await readdir(assetSourcePath, { withFileTypes: true });

      for (const file of files) {
        if (
          file.isFile() &&
          (!ignoredPattern || !file.name.match(new RegExp(ignoredPattern)))
        ) {
          const srcPath = path.join(assetSourcePath, file.name);
          const destPath = path.join(platformProjectRoot, file.name);
          copyFileSync(srcPath, destPath);
          console.log(`✅ [iOS] Copied ${file.name} to ios/ root`);

          // Add the file to the Xcode project with proper reference
          IOSConfig.XcodeUtils.addResourceFileToGroup({
            filepath: file.name,
            groupName: projectName,
            project,
            isBuildFile: true,
            verbose: true,
          });
        }
      }
    }

    return config;
  });
}

/**
 * Main plugin export
 * @param {import('@expo/config-types').ExpoConfig} config
 * @param {object} options
 * @param {string[]} options.assetsPaths - Array of asset paths to copy
 * @param {string} [options.ignoredPattern] - Optional regex pattern to ignore files
 * @returns {import('@expo/config-types').ExpoConfig}
 */
module.exports = function withCustomAssets(config, options = {}) {
  const { assetsPaths = [], ignoredPattern } = options;

  config = withCustomAssetsAndroid(config, { assetsPaths, ignoredPattern });
  config = withCustomAssetsIos(config, {
    assetsPaths,
    ignoredPattern,
  });

  return config;
};
