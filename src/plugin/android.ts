import path from 'path';
import { withDangerousMod, type ConfigPlugin } from '@expo/config-plugins';
import { copyFileSync, ensureDirSync, readdirSync } from 'fs-extra';

import type { MediapipePluginProps } from './PluginProps';

/**
 * Android-specific config plugin to copy assets to android/app/src/main/assets/
 */
export const withAssets: ConfigPlugin<MediapipePluginProps> = (
  config,
  props
) => {
  const { assetsPaths = [], ignoredPattern } = props || {};

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

export const android = {
  withAssets,
};
