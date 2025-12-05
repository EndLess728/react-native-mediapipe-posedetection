//
//  PoseDetectionModule.swift
//  react-native-mediapipe
//
//  Created by Charles Parker on 3/24/24.
//

import Foundation
import MediaPipeTasksVision
import React

@objc public protocol PoseDetectionModuleDelegate: AnyObject {
  func onResults(handle: Int, body: [String: Any])
  func onError(handle: Int, body: [String: Any])
}

@objc(PoseDetectionModule)
public class PoseDetectionModule: NSObject {
  private static var nextId = 22 // Starting handle
  // Internal map: handle -> native helper
  static var detectorMap = [Int: PoseDetectorHelper]()

  @objc public weak var delegate: PoseDetectionModuleDelegate?

  // Event throttling for live stream
  private let eventQueue = DispatchQueue(
    label: "com.mediapipe.posedetection.events",
    qos: .userInitiated
  )
  private var lastEventTime: [Int: TimeInterval] = [:]  // per‑detector
  private let minEventInterval: TimeInterval = 0.066    // ~15 FPS
  private var droppedFrameCount: [Int: Int] = [:]

  @objc public static func requiresMainQueueSetup() -> Bool {
    return false
  }

  // MARK: - Detector lifecycle

  @objc public func createDetector(
    _ numPoses: NSInteger,
    withMinPoseDetectionConfidence minPoseDetectionConfidence: NSNumber,
    withMinPosePresenceConfidence minPosePresenceConfidence: NSNumber,
    withMinTrackingConfidence minTrackingConfidence: NSNumber,
    withShouldOutputSegmentationMasks shouldOutputSegmentationMasks: Bool,
    withModel model: String,
    withDelegate delegate: NSInteger,
    withRunningMode runningMode: NSInteger,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let id = PoseDetectionModule.nextId
    PoseDetectionModule.nextId += 1

    guard let mode = RunningMode(rawValue: UInt(runningMode)) else {
      reject("E_MODE_ERROR", "Invalid running mode", nil)
      return
    }

    do {
      let helper = try PoseDetectorHelper(
        handle: id,
        numPoses: numPoses,
        minPoseDetectionConfidence: minPoseDetectionConfidence.floatValue,
        minPosePresenceConfidence: minPosePresenceConfidence.floatValue,
        minTrackingConfidence: minTrackingConfidence.floatValue,
        shouldOutputSegmentationMasks: shouldOutputSegmentationMasks,
        modelName: model,
        delegate: delegate,
        runningMode: mode
      )

      helper.liveStreamDelegate = self
      PoseDetectionModule.detectorMap[id] = helper
      resolve(id)
    } catch let error as NSError {
      reject("ERROR_CODE", "An error occurred: \(error.localizedDescription)", error)
    }
  }

  @objc public func releaseDetector(
    _ handle: NSInteger,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    if PoseDetectionModule.detectorMap.removeValue(forKey: handle) != nil {
      lastEventTime.removeValue(forKey: handle)
      droppedFrameCount.removeValue(forKey: handle)
      resolve(true)
    } else {
      resolve(false)
    }
  }

  @objc public func releaseAllDetectors() {
    let count = PoseDetectionModule.detectorMap.count
    PoseDetectionModule.detectorMap.removeAll()
    lastEventTime.removeAll()
    droppedFrameCount.removeAll()
    print("🗑️ Released all \(count) detectors")
  }

  // MARK: - One‑shot image detection (DO NOT USE FOR LIVE STREAM)

  @objc public func detectOnImage(
    _ imagePath: String,
    withNumPoses numPoses: NSInteger,
    withMinPoseDetectionConfidence minPoseDetectionConfidence: NSNumber,
    withMinPosePresenceConfidence minPosePresenceConfidence: NSNumber,
    withMinTrackingConfidence minTrackingConfidence: NSNumber,
    withShouldOutputSegmentationMasks shouldOutputSegmentationMasks: Bool,
    withModel model: String,
    withDelegate delegate: NSInteger,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    // Single‑use helper – do NOT store it in detectorMap
    do {
      let helper = try PoseDetectorHelper(
        handle: 0,
        numPoses: numPoses,
        minPoseDetectionConfidence: minPoseDetectionConfidence.floatValue,
        minPosePresenceConfidence: minPosePresenceConfidence.floatValue,
        minTrackingConfidence: minTrackingConfidence.floatValue,
        shouldOutputSegmentationMasks: shouldOutputSegmentationMasks,
        modelName: model,
        delegate: delegate,
        runningMode: RunningMode.image
      )

      helper.liveStreamDelegate = self

      let image = try loadImageFromPath(from: imagePath)
      if let result = helper.detect(image: image) {
        let resultArgs = convertPdResultBundleToDictionary(result)
        resolve(resultArgs)
      } else {
        throw NSError(
          domain: "com.PoseDetection.error",
          code: 1001,
          userInfo: [NSLocalizedDescriptionKey: "Detection failed."]
        )
      }
    } catch let error as NSError {
      reject("ERROR_CODE", "An error occurred: \(error.localizedDescription)", error)
    }
  }

  @objc public func detectOnVideo(
    _ videoPath: String,
    withNumPoses numPoses: NSInteger,
    withMinPoseDetectionConfidence minPoseDetectionConfidence: NSNumber,
    withMinPosePresenceConfidence minPosePresenceConfidence: NSNumber,
    withMinTrackingConfidence minTrackingConfidence: NSNumber,
    withShouldOutputSegmentationMasks shouldOutputSegmentationMasks: Bool,
    withModel model: String,
    withDelegate delegate: NSInteger,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    do {
      throw NSError(
        domain: "com.PoseDetection.error",
        code: 1004,
        userInfo: [NSLocalizedDescriptionKey: "Not implemented."]
      )
    } catch let error as NSError {
      reject("ERROR_CODE", "An error occurred: \(error.localizedDescription)", error)
    }
  }

  // MARK: - Event helpers

  private func sendErrorEvent(handle: Int, message: String, code: Int) {
    // Errors are rare: just forward to JS
    eventQueue.async { [weak self] in
      guard let self = self else { return }
      DispatchQueue.main.async {
        self.delegate?.onError(
          handle: handle,
          body: ["handle": handle, "message": message, "code": code]
        )
      }
    }
  }

  private func sendResultsEvent(handle: Int, bundle: PoseDetectionResultBundle) {
    eventQueue.async { [weak self] in
      guard let self = self else { return }

      let now = Date().timeIntervalSince1970
      let last = self.lastEventTime[handle] ?? 0
      let dt = now - last

      if dt >= self.minEventInterval {
        var resultArgs = convertPdResultBundleToDictionary(bundle)
        resultArgs["handle"] = handle

        DispatchQueue.main.async {
          self.delegate?.onResults(handle: handle, body: resultArgs)
        }

        self.lastEventTime[handle] = now
        if let dropped = self.droppedFrameCount[handle], dropped > 0 {
          if dropped % 100 == 0 {
            print("📊 [PoseDetection] Dropped \(dropped) frames for handle \(handle) (throttled to ~15fps)")
          }
          self.droppedFrameCount[handle] = 0
        }
      } else {
        self.droppedFrameCount[handle, default: 0] += 1
      }
    }
  }
}

// MARK: - PoseDetectorHelperLiveStreamDelegate

extension PoseDetectionModule: PoseDetectorHelperLiveStreamDelegate {
  func poseDetectorHelper(
    _ poseDetectorHelper: PoseDetectorHelper,
    onResults result: PoseDetectionResultBundle?,
    error: Error?
  ) {
    if let result = result {
      sendResultsEvent(handle: poseDetectorHelper.handle, bundle: result)
    } else if let error = error as NSError? {
      sendErrorEvent(
        handle: poseDetectorHelper.handle,
        message: error.localizedDescription,
        code: error.code
      )
    }
  }
}
