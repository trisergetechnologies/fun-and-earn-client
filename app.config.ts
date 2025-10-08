import { ExpoConfig } from '@expo/config';

const config: ExpoConfig = {
  name: 'Dream Mart',
  slug: 'dream-mart',
  version: '1.2.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'Dream Mart',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,

  ios: {
    supportsTablet: true,
  },

  android: {
    package: 'com.mpdream.dreammart',
    permissions: ['INTERNET'],
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
            { usesCleartextTraffic: 'true' },
          ],
          manifestAdditions: `
            <manifest xmlns:android="http://schemas.android.com/apk/res/android" 
                      xmlns:tools="http://schemas.android.com/tools">
              <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" tools:node="remove" />
              <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" tools:node="remove" />
            </manifest>
          `,
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
      projectId: 'e38c72b1-4f7f-49be-b01f-84687394837f',
    },
  },
};

export default config;
