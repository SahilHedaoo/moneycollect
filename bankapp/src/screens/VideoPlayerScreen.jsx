import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute } from '@react-navigation/native';

const VideoPlayerScreen = () => {
  const route = useRoute();
  const { video } = route.params;

  const videoUrl = `https://www.youtube.com/embed/${video.videoId}`;

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: videoUrl }}
        style={styles.webview}
        javaScriptEnabled
        allowsFullscreenVideo
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});

export default VideoPlayerScreen;
