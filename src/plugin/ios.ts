import path from 'path';
import {
  withXcodeProject,
  IOSConfig,
  type ConfigPlugin,
} from '@expo/config-plugins';
import { copyFileSync, ensureDirSync, readdirSync } from 'fs-extra';

import type { MediapipePluginProps } from './PluginProps';

/**
 * iOS-specific config plugin to copy assets to iOS project with Xcode references
 */
export const withAssets: ConfigPlugin<MediapipePluginProps> = (
  config,
  props
) => {
  const { assetsPaths = [], ignoredPattern } = props || {};

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

export const ios = {
  withAssets,
};
