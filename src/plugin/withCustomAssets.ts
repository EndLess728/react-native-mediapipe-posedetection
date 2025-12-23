import path from 'path';
import {
  withDangerousMod,
  withXcodeProject,
  IOSConfig,
  createRunOncePlugin,
  type ConfigPlugin,
} from '@expo/config-plugins';
import { copyFileSync, ensureDirSync, readdirSync } from 'fs-extra';

// Read package info for createRunOncePlugin
let pkg: { name: string; version?: string } = {
  name: 'react-native-mediapipe-posedetection',
};
try {
  pkg = require('react-native-mediapipe-posedetection/package.json');
} catch {
  // empty catch block
}

interface PluginOptions {
  assetsPaths?: string[];
  ignoredPattern?: string;
}

/**
 * Custom Expo config plugin to copy assets to:
 * - Android: android/app/src/main/assets/
 * - iOS: ios/ (root folder with Xcode project references)
 *
 * Usage in app.json:
 * [
 *   "react-native-mediapipe-posedetection",
 *   {
 *     "assetsPaths": ["./models/"],
 *     "ignoredPattern": "\\.txt$"  // optional regex pattern
 *   }
 * ]
 */

const withCustomAssetsAndroid: ConfigPlugin<PluginOptions> = (
  config,
  props
) => {
  const { assetsPaths = [], ignoredPattern } = props;

  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const { projectRoot } = cfg.modRequest;

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

        let files;
        try {
          files = readdirSync(assetSourcePath, { withFileTypes: true });
        } catch {
          console.warn(
            `⚠️ [Android] Could not read directory: ${assetSourcePath}`
          );
          continue;
        }

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

      return cfg;
    },
  ]);
};

const withCustomAssetsIos: ConfigPlugin<PluginOptions> = (config, props) => {
  const { assetsPaths = [], ignoredPattern } = props;

  return withXcodeProject(config, async (cfg) => {
    const { projectRoot, platformProjectRoot } = cfg.modRequest;
    const project = cfg.modResults;
    const projectName = cfg.modRequest.projectName || 'App';

    // Copy files directly to iOS root folder
    ensureDirSync(platformProjectRoot);

    for (const assetSourceDir of assetsPaths) {
      const assetSourcePath = path.join(projectRoot, assetSourceDir);

      let files;
      try {
        files = readdirSync(assetSourcePath, { withFileTypes: true });
      } catch {
        console.warn(`⚠️ [iOS] Could not read directory: ${assetSourcePath}`);
        continue;
      }

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

    return cfg;
  });
};

/**
 * Main config plugin entry point
 * @param config - Expo config
 * @param options - Plugin options
 * @param options.assetsPaths - Array of paths to asset directories (relative to project root)
 * @param options.ignoredPattern - Optional regex pattern to ignore files
 */
const withCustomAssets: ConfigPlugin<PluginOptions> = (
  config,
  options = {}
) => {
  const { assetsPaths = [], ignoredPattern } = options;

  if (assetsPaths.length === 0) {
    console.warn(
      '⚠️ [react-native-mediapipe-posedetection] No assetsPaths provided to config plugin'
    );
    return config;
  }

  let modifiedConfig = withCustomAssetsAndroid(config, {
    assetsPaths,
    ignoredPattern,
  });
  modifiedConfig = withCustomAssetsIos(modifiedConfig, {
    assetsPaths,
    ignoredPattern,
  });

  return modifiedConfig;
};

export default createRunOncePlugin(withCustomAssets, pkg.name, pkg.version);
