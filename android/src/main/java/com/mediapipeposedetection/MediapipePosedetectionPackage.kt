package com.mediapipeposedetection

import android.util.Log
import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.mrousavy.camera.frameprocessors.FrameProcessorPluginRegistry
import com.mediapipeposedetection.posedetection.PoseDetectionFrameProcessorPlugin
import java.util.HashMap

class MediapipePosedetectionPackage : BaseReactPackage() {

  companion object {
    private const val TAG = "MediapipePosedetectionPackage"
    
    init {
      // Register frame processor plugin when package class is loaded
      Log.d(TAG, "🔌 Registering frame processor plugin: poseDetection")
      try {
        FrameProcessorPluginRegistry.addFrameProcessorPlugin("poseDetection") { proxy, options ->
          Log.d(TAG, "🎬 Creating PoseDetectionFrameProcessorPlugin instance")
          PoseDetectionFrameProcessorPlugin()
        }
        Log.d(TAG, "✅ Frame processor plugin registered successfully")
      } catch (e: Exception) {
        Log.e(TAG, "❌ Failed to register frame processor plugin: ${e.message}", e)
        e.printStackTrace()
      }
    }
  }

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return if (name == MediapipePosedetectionModule.NAME) {
      MediapipePosedetectionModule(reactContext)
    } else {
      null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      val moduleInfos: MutableMap<String, ReactModuleInfo> = HashMap()
      moduleInfos[MediapipePosedetectionModule.NAME] = ReactModuleInfo(
        MediapipePosedetectionModule.NAME,
        MediapipePosedetectionModule.NAME,
        false,  // canOverrideExistingModule
        false,  // needsEagerInit
        false,  // isCxxModule
        true // isTurboModule
      )
      moduleInfos
    }
  }
}
