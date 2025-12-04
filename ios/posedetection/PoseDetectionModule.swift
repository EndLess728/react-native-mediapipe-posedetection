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
  private static var nextId = 22              // Equivalent to Kotlin's starting point
   static var detectorMap = [Int: PoseDetectorHelper]()  // Maps to the Kotlin detectorMap

  @objc public weak var delegate: PoseDetectionModuleDelegate?

  @objc public static func requiresMainQueueSetup() -> Bool {
    return false
  }

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
      resolve(true)
    } else {
      resolve(false)
    }
  }
  
  @objc public func releaseAllDetectors() {
    let count = PoseDetectionModule.detectorMap.count
    PoseDetectionModule.detectorMap.removeAll()
    print("🗑️ Released all \(count) detectors")
  }

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

  // MARK: - Event Emission Helpers

  private func sendErrorEvent(handle: Int, message: String, code: Int) {
    delegate?.onError(
      handle: handle,
      body: ["handle": handle, "message": message, "code": code]
    )
  }

  private func sendResultsEvent(handle: Int, bundle: PoseDetectionResultBundle) {
    var resultArgs = convertPdResultBundleToDictionary(bundle)
    resultArgs["handle"] = handle
    delegate?.onResults(handle: handle, body: resultArgs)
  }
}

// MARK: - PoseDetectorHelperLiveStreamDelegate

extension PoseDetectionModule: PoseDetectorHelperLiveStreamDelegate {
   func poseDetectorHelper(
    _ PoseDetectorHelper: PoseDetectorHelper,
    onResults result: PoseDetectionResultBundle?,
    error: Error?
  ) {
    if let result = result {
      sendResultsEvent(handle: PoseDetectorHelper.handle, bundle: result)
    } else if let error = error as NSError? {
      sendErrorEvent(
        handle: PoseDetectorHelper.handle,
        message: error.localizedDescription,
        code: error.code
      )
    }
  }
}
