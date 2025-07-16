import { ExpoConfig } from '@expo/config';

const config: ExpoConfig = {
  name: 'Dream Mart',
  slug: 'dream-mart',
  version: '1.2.0',
  orientation: 'portrait',
  icon: './assets/images/splash-icon.png',
  scheme: 'Dream Mart',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
  },
  android: {
    package: 'com.mpdreams.dreammart',
    permissions: ["INTERNET"],
    adaptiveIcon: {
      foregroundImage: './assets/images/splash-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/splash-icon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
    [
      'expo-build-properties',
      {
        android: {
          manifestApplication: [
            {
              usesCleartextTraffic: 'true',
            },
          ],
        },
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
  },
  extra: {
    EXPO_PUBLIC_BASE_URL: 'http://147.93.58.23:6005/api/v1',
    eas: {
      projectId: '80d34574-db42-4327-9362-32592954cf16',
    },
  },
};

export default config;

