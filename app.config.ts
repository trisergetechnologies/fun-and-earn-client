import { ExpoConfig } from '@expo/config';

const config: ExpoConfig = {
  name: 'Dream Mart',
  slug: 'Dream Mart',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/splash-icon.png',
  scheme: 'Dream Mart',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
  },
  android: {
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
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    BASE_URL: 'http://147.93.58.23:6005/api/v1',
  },
};

export default config;
