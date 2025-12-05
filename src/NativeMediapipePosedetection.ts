// NativeMediapipePosedetection.ts
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type { CodegenTypes } from 'react-native';

/**
 * TurboModule specification for MediaPipe Pose Detection
 * This module provides pose detection capabilities using Google's MediaPipe models
 *
 * @requires New Architecture - This module only works with React Native's New Architecture
 */
export interface Spec extends TurboModule {
  /**
   * Creates a new pose detector instance
   * @returns Promise resolving to a detector handle (number)
   */
  createDetector(
    numPoses: number,
    minPoseDetectionConfidence: number,
    minPosePresenceConfidence: number,
    minTrackingConfidence: number,
    shouldOutputSegmentationMasks: boolean,
    model: string,
    delegate: number,
    runningMode: number
  ): Promise<number>;

  /**
   * Releases a pose detector instance
   * @param handle - The detector handle to release
   * @returns Promise resolving to true if successful
   */
  releaseDetector(handle: number): Promise<boolean>;

  /**
   * Detects poses in a static image
   * @param imagePath - Path to the image file
   * @returns Promise resolving to pose detection results
   */
  detectOnImage(
    imagePath: string,
    numPoses: number,
    minPoseDetectionConfidence: number,
    minPosePresenceConfidence: number,
    minTrackingConfidence: number,
    shouldOutputSegmentationMasks: boolean,
    model: string,
    delegate: number
  ): Promise<Object>;

  /**
   * Event emitter for pose detection results
   */
  readonly onResults: CodegenTypes.EventEmitter<{
    handle: number;
    inferenceTime: number;
    size: { width: number; height: number };
    landmarks: Array<Array<{ x: number; y: number; z: number }>>;
    worldLandmarks: Array<Array<{ x: number; y: number; z: number }>>;
    segmentationMasks: Array<{}>;
  }>;

  /**
   * Event emitter for pose detection errors
   */
  readonly onError: CodegenTypes.EventEmitter<{
    handle: number;
    message: string;
    code: number;
  }>;
}

// Name MUST match native TurboModule registration
export default TurboModuleRegistry.getEnforcing<Spec>('MediapipePosedetection');
