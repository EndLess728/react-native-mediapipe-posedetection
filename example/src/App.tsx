import { useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useCameraPermission } from 'react-native-vision-camera';
import {
  MediapipeCamera,
  usePoseDetection,
  RunningMode,
  Delegate,
  type PoseDetectionResultBundle,
  type DetectionError,
} from 'react-native-mediapipe-posedetection';

export default function App() {
  const { hasPermission, requestPermission } = useCameraPermission();

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  const handleResults = useCallback((result: PoseDetectionResultBundle) => {
    console.log('Pose detected!', result.results);
    console.log('Number of poses:', result.results?.length);
    if (result.results?.[0]?.landmarks) {
      console.log('Landmarks count:', result.results[0].landmarks.length);
    }
    // Access landmarks: result.results[0]?.landmarks
  }, []);

  const handleError = useCallback((error: DetectionError) => {
    console.error('Pose detection error:', error.message);
  }, []);

  console.log('Initializing pose detection...');

  const poseDetection = usePoseDetection(
    {
      onResults: handleResults,
      onError: handleError,
    },
    RunningMode.LIVE_STREAM,
    'pose_landmarker_lite.task', // Make sure this model file exists in your assets
    {
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      delegate: Delegate.GPU,
      fpsMode: 'none',
    }
  );

  console.log('Pose detection initialized:', poseDetection);

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission not requested.</Text>
        <TouchableOpacity
          onPress={handleRequestPermission}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Request Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera permission denied</Text>
        <TouchableOpacity
          onPress={handleRequestPermission}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Grant Camera Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <MediapipeCamera
        style={styles.camera}
        solution={poseDetection}
        activeCamera="back"
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
