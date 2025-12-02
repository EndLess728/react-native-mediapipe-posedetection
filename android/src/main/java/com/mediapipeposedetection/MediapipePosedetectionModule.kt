package com.mediapipeposedetection

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.mediapipeposedetection.posedetection.PoseDetectorHelper
import com.mediapipeposedetection.posedetection.convertResultBundleToWritableMap
import com.mediapipeposedetection.shared.loadBitmapFromPath

/**
 * Global detector map to manage multiple detector instances
 */
object PoseDetectorMap {
  internal val detectorMap = mutableMapOf<Int, PoseDetectorHelper>()
}

@ReactModule(name = MediapipePosedetectionModule.NAME)
class MediapipePosedetectionModule(reactContext: ReactApplicationContext) :
  NativeMediapipePosedetectionSpec(reactContext) {

  private var nextId = 22 // just not zero

  override fun getName(): String {
    return NAME
  }

  /**
   * Listener for pose detection results and errors
   */
  private class PoseDetectorListener(
    private val module: MediapipePosedetectionModule,
    private val handle: Int
  ) : PoseDetectorHelper.DetectorListener {
    override fun onError(error: String, errorCode: Int) {
      module.sendErrorEvent(handle, error, errorCode)
    }

    override fun onResults(resultBundle: PoseDetectorHelper.ResultBundle) {
      module.sendResultsEvent(handle, resultBundle)
    }
  }

  @ReactMethod
  override fun createDetector(
    numPoses: Double,
    minPoseDetectionConfidence: Double,
    minPosePresenceConfidence: Double,
    minTrackingConfidence: Double,
    shouldOutputSegmentationMasks: Boolean,
    model: String,
    delegate: Double,
    runningMode: Double,
    promise: Promise
  ) {
    try {
      val id = nextId++
      val helper = PoseDetectorHelper(
        maxNumPoses = numPoses.toInt(),
        minPoseDetectionConfidence = minPoseDetectionConfidence.toFloat(),
        minPosePresenceConfidence = minPosePresenceConfidence.toFloat(),
        minPoseTrackingConfidence = minTrackingConfidence.toFloat(),
        shouldOutputSegmentationMasks = shouldOutputSegmentationMasks,
        currentDelegate = delegate.toInt(),
        currentModel = model,
        runningMode = enumValues<RunningMode>().first { it.ordinal == runningMode.toInt() },
        context = reactApplicationContext.applicationContext,
        poseDetectorListener = PoseDetectorListener(this, id)
      )
      PoseDetectorMap.detectorMap[id] = helper
      promise.resolve(id.toDouble())
    } catch (e: Exception) {
      promise.reject("CREATE_DETECTOR_ERROR", "Failed to create detector: ${e.message}", e)
    }
  }

  @ReactMethod
  override fun releaseDetector(handle: Double, promise: Promise) {
    try {
      val entry = PoseDetectorMap.detectorMap[handle.toInt()]
      if (entry != null) {
        entry.clearPoseLandmarker()
        PoseDetectorMap.detectorMap.remove(handle.toInt())
      }
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("RELEASE_DETECTOR_ERROR", "Failed to release detector: ${e.message}", e)
    }
  }

  @ReactMethod
  override fun detectOnImage(
    imagePath: String,
    numPoses: Double,
    minPoseDetectionConfidence: Double,
    minPosePresenceConfidence: Double,
    minTrackingConfidence: Double,
    shouldOutputSegmentationMasks: Boolean,
    model: String,
    delegate: Double,
    promise: Promise
  ) {
    try {
      val helper = PoseDetectorHelper(
        maxNumPoses = numPoses.toInt(),
        minPoseDetectionConfidence = minPoseDetectionConfidence.toFloat(),
        minPosePresenceConfidence = minPosePresenceConfidence.toFloat(),
        minPoseTrackingConfidence = minTrackingConfidence.toFloat(),
        shouldOutputSegmentationMasks = shouldOutputSegmentationMasks,
        currentDelegate = delegate.toInt(),
        currentModel = model,
        runningMode = RunningMode.IMAGE,
        context = reactApplicationContext.applicationContext,
        poseDetectorListener = PoseDetectorListener(this, 0)
      )
      val bundle = helper.detectImage(loadBitmapFromPath(imagePath))
      val resultArgs = convertResultBundleToWritableMap(bundle)

      promise.resolve(resultArgs)
    } catch (e: Exception) {
      promise.reject("DETECT_IMAGE_ERROR", "Failed to detect on image: ${e.message}", e)
    }
  }

  private fun sendErrorEvent(handle: Int, message: String, code: Int) {
    android.util.Log.d(TAG, "Sending error event: $message")
    val errorArgs = Arguments.createMap()
    errorArgs.putInt("handle", handle)
    errorArgs.putString("message", message)
    errorArgs.putInt("code", code)
    
    emitOnError(errorArgs)
  }

  private fun sendResultsEvent(handle: Int, bundle: PoseDetectorHelper.ResultBundle) {
    android.util.Log.d(TAG, "Sending results event for handle: $handle")
    val resultArgs = convertResultBundleToWritableMap(bundle)
    resultArgs.putInt("handle", handle)
    
    emitOnResults(resultArgs)
  }

  companion object {
    const val NAME = "MediapipePosedetection"
    private const val TAG = "MediapipePosedetectionModule"
  }
}
