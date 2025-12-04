// MediapipePosedetection.mm

#import "MediapipePosedetection.h"
#import "MediapipePosedetection-Swift.h"
#import "MediapipePosedetectionSpec.h"

#import <React/RCTLog.h>
#import <objc/runtime.h>
#import <MediaPipeTasksVision/MediaPipeTasksVision.h>

// VisionCamera (optional)
#if __has_include(<VisionCamera/FrameProcessorPlugin.h>)
  #import <VisionCamera/FrameProcessorPlugin.h>
  #import <VisionCamera/FrameProcessorPluginRegistry.h>
  #import <VisionCamera/Frame.h>
  #define VISION_CAMERA_AVAILABLE 1
#else
  #define VISION_CAMERA_AVAILABLE 0
#endif

@interface MediapipePosedetection () <
  NativeMediapipePosedetectionSpec,   // from codegen
  PoseDetectionModuleDelegate         // from Swift
>
@end

@implementation MediapipePosedetection {
  PoseDetectionModule *_swiftModule;
}

RCT_EXPORT_MODULE(MediapipePosedetection)

- (instancetype)init
{
  if (self = [super init]) {
    _swiftModule = [[PoseDetectionModule alloc] init];
    _swiftModule.delegate = self;
  }
  return self;
}

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

#pragma mark - Spec methods

- (void)createDetector:(double)numPoses
minPoseDetectionConfidence:(double)minPoseDetectionConfidence
minPosePresenceConfidence:(double)minPosePresenceConfidence
 minTrackingConfidence:(double)minTrackingConfidence
shouldOutputSegmentationMasks:(BOOL)shouldOutputSegmentationMasks
                model:(NSString *)model
             delegate:(double)delegate
          runningMode:(double)runningMode
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject
{
  [_swiftModule createDetector:(NSInteger)numPoses
 withMinPoseDetectionConfidence:@(minPoseDetectionConfidence)
 withMinPosePresenceConfidence:@(minPosePresenceConfidence)
  withMinTrackingConfidence:@(minTrackingConfidence)
 withShouldOutputSegmentationMasks:shouldOutputSegmentationMasks
                     withModel:model
                  withDelegate:(NSInteger)delegate
               withRunningMode:(NSInteger)runningMode
                      resolver:resolve
                      rejecter:reject];
}

- (void)releaseDetector:(double)handle
                resolve:(RCTPromiseResolveBlock)resolve
                 reject:(RCTPromiseRejectBlock)reject
{
  [_swiftModule releaseDetector:(NSInteger)handle
                       resolver:resolve
                       rejecter:reject];
}

- (void)detectOnImage:(NSString *)imagePath
             numPoses:(double)numPoses
minPoseDetectionConfidence:(double)minPoseDetectionConfidence
minPosePresenceConfidence:(double)minPosePresenceConfidence
 minTrackingConfidence:(double)minTrackingConfidence
shouldOutputSegmentationMasks:(BOOL)shouldOutputSegmentationMasks
                model:(NSString *)model
             delegate:(double)delegate
              resolve:(RCTPromiseResolveBlock)resolve
               reject:(RCTPromiseRejectBlock)reject
{
  [_swiftModule detectOnImage:imagePath
                 withNumPoses:(NSInteger)numPoses
 withMinPoseDetectionConfidence:@(minPoseDetectionConfidence)
 withMinPosePresenceConfidence:@(minPosePresenceConfidence)
  withMinTrackingConfidence:@(minTrackingConfidence)
 withShouldOutputSegmentationMasks:shouldOutputSegmentationMasks
                     withModel:model
                  withDelegate:(NSInteger)delegate
                      resolver:resolve
                      rejecter:reject];
}

#pragma mark - PoseDetectionModuleDelegate (Swift -> JS events)

- (void)onResultsWithHandle:(NSInteger)handle
                       body:(NSDictionary<NSString *, id> *)body
{
  [self emitOnResults:body];
}

- (void)onErrorWithHandle:(NSInteger)handle
                     body:(NSDictionary<NSString *, id> *)body
{
  [self emitOnError:body];
}

#pragma mark - RCTInvalidating

- (void)invalidate
{
  // Clean up all detectors when the module is being torn down
  RCTLogInfo(@"🔄 Invalidating MediapipePosedetection module, cleaning up all detectors");
  [_swiftModule releaseAllDetectors];
}

#pragma mark - TurboModule hook

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeMediapipePosedetectionSpecJSI>(params);
}

@end

// MARK: - Frame Processor Registration
#if VISION_CAMERA_AVAILABLE

@interface MediapipePosedetectionFrameProcessorLoader : NSObject
@end

@implementation MediapipePosedetectionFrameProcessorLoader

+ (void)load
{
  RCTLogInfo(@"🔌 Registering frame processor plugin: poseDetection");
  
  // Use runtime class lookup to avoid bridging header issues
  Class pluginClass = NSClassFromString(@"MediapipePosedetection.PoseDetectionFrameProcessorPlugin");
  
  if (pluginClass) {
    [FrameProcessorPluginRegistry addFrameProcessorPlugin:@"poseDetection"
                                         withInitializer:^FrameProcessorPlugin *(
                                             VisionCameraProxyHolder *proxy,
                                             NSDictionary *options) {
      return [[pluginClass alloc] initWithProxy:proxy withOptions:options];
    }];
  } else {
    RCTLogWarn(@"⚠️ PoseDetectionFrameProcessorPlugin class not found");
  }
}

@end

#endif
