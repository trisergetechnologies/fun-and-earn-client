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
    EXPO_PUBLIC_BASE_URL: 'https://amp-api.mpdreams.in/api/v1',
    eas: {
      projectId: 'f2d35fba-8f60-4dfd-a990-a0a0b2550eb6',
    },
  },
};

export default config;

