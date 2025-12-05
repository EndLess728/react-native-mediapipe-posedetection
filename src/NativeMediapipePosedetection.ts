// NativeMediapipePosedetection.ts
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type { EventEmitter } from 'react-native/Libraries/Types/CodegenTypes';

/**
 * Coordinate point in 3D space
 */
interface PoseLandmarkPoint {
  x: number;
  y: number;
  z: number;
}

/**
 * Payload for pose detection results event
 */
interface OnResultsPayload {
  handle: number;
  inferenceTime: number;
  size: { width: number; height: number };
  landmarks: Array<Array<PoseLandmarkPoint>>;
  worldLandmarks: Array<Array<PoseLandmarkPoint>>;
  segmentationMasks: Array<{}>;
}

/**
 * Payload for pose detection error event
 */
interface OnErrorPayload {
  handle: number;
  message: string;
  code: number;
}

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
  readonly onResults: EventEmitter<OnResultsPayload>;

  /**
   * Event emitter for pose detection errors
   */
  readonly onError: EventEmitter<OnErrorPayload>;
}

// Name MUST match native TurboModule registration
export default TurboModuleRegistry.getEnforcing<Spec>('MediapipePosedetection');
