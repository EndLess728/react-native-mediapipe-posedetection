//
//  PoseDetectionFrameProcessorPlugin.swift
//  react-native-mediapipe
//
//  Created by Charles Parker on 3/24/24.
//

import Foundation

#if canImport(VisionCamera)
import VisionCamera
import MediaPipeTasksVision

// Internal to avoid exposing it via bridging header
internal class PoseDetectionFrameProcessorPlugin: FrameProcessorPlugin {

  // Per‑detector throttling to keep CPU/memory under control
  private var lastProcessedTime: [Int: TimeInterval] = [:]
  private let minFrameInterval: TimeInterval = 0.066 // ~15 FPS
  private let throttleQueue = DispatchQueue(
    label: "com.mediapipe.frameprocessor.throttle"
  )

  internal override init(
    proxy: VisionCameraProxyHolder,
    options: [AnyHashable: Any]! = [:]
  ) {
    super.init(proxy: proxy, options: options)
  }

  internal override func callback(
    _ frame: Frame,
    withArguments arguments: [AnyHashable: Any]?
  ) -> Any {
    // Required arguments from JS
    guard let detectorHandleValue = arguments?["detectorHandle"] as? Double else {
      return false
    }
    guard let orientation = arguments?["orientation"] as? String else {
      return false
    }
    guard let uiOrientation = uiImageOrientation(from: orientation) else {
      return false
    }

    let handle = Int(detectorHandleValue)

    // Throttle per‑detector
    var shouldProcess = false
    throttleQueue.sync {
      let now = Date().timeIntervalSince1970
      let last = lastProcessedTime[handle] ?? 0
      if now - last >= minFrameInterval {
        lastProcessedTime[handle] = now
        shouldProcess = true
      }
    }
    guard shouldProcess else {
      // Skip silently: returning true means "handled" so JS doesn't retry
      return true
    }

    // Look up existing detector created via createDetector
    guard let detector = PoseDetectionModule.detectorMap[handle] else {
      return false
    }

    let buffer = frame.buffer
    detector.detectAsync(
      sampleBuffer: buffer,
      orientation: uiOrientation,
      timeStamps: Int(Date().timeIntervalSince1970 * 1000)
    )
    return true
  }
}

#endif
