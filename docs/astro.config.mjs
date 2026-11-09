// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://endless728.github.io',
  base: '/react-native-mediapipe-posedetection',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'MediaPipe Pose Detection',
      description:
        'Real-time pose detection for React Native and Expo using Google MediaPipe. 33 body landmarks, GPU acceleration, VisionCamera frame processors, and an Expo config plugin.',
      logo: { src: './src/assets/logo.svg', replacesTitle: false },
      favicon: '/favicon.svg',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/EndLess728/react-native-mediapipe-posedetection',
        },
        {
          icon: 'npm',
          label: 'npm',
          href: 'https://www.npmjs.com/package/react-native-mediapipe-posedetection',
        },
      ],
      editLink: {
        baseUrl:
          'https://github.com/EndLess728/react-native-mediapipe-posedetection/edit/main/docs/',
      },
      lastUpdated: true,
      head: [
        {
          tag: 'meta',
          attrs: {
            name: 'keywords',
            content:
              'react native pose detection, expo pose detection, mediapipe react native, body tracking react native, vision camera pose, fitness app react native',
          },
        },
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          content: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareSourceCode',
            name: 'react-native-mediapipe-posedetection',
            description:
              'Real-time pose detection for React Native and Expo using Google MediaPipe.',
            codeRepository:
              'https://github.com/EndLess728/react-native-mediapipe-posedetection',
            programmingLanguage: ['TypeScript', 'Swift', 'Kotlin'],
            license: 'https://opensource.org/licenses/MIT',
            author: {
              '@type': 'Person',
              name: 'Mantu',
              url: 'https://github.com/EndLess728',
            },
          }),
        },
      ],
      sidebar: [
        {
          label: 'Getting started',
          items: [
            { label: 'Introduction', slug: 'getting-started/introduction' },
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Model files', slug: 'getting-started/model-files' },
            { label: 'Quick start', slug: 'getting-started/quick-start' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Drawing a skeleton overlay', slug: 'guides/skeleton-overlay' },
            { label: 'Detecting poses in images', slug: 'guides/static-images' },
            { label: 'Performance', slug: 'guides/performance' },
            { label: 'Troubleshooting', slug: 'guides/troubleshooting' },
          ],
        },
        {
          label: 'API reference',
          items: [
            { label: 'usePoseDetection', slug: 'api/use-pose-detection' },
            { label: 'PoseDetectionOnImage', slug: 'api/pose-detection-on-image' },
            { label: 'MediapipeCamera', slug: 'api/mediapipe-camera' },
            { label: 'Results & types', slug: 'api/types' },
            { label: 'Landmarks', slug: 'api/landmarks' },
            { label: 'Expo config plugin', slug: 'api/expo-plugin' },
          ],
        },
      ],
    }),
  ],
});
