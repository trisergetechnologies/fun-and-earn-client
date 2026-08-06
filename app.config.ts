import { ExpoConfig } from '@expo/config';

/**
 * Android AdMob App ID — baked into native build (Dream Mart / AdMob console).
 * Must match package com.mpdream.dreammart. Changing this requires a new native build.
 */
const ADMOB_ANDROID_APP_ID =
  process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID ??
  'ca-app-pub-4791707828479682~2192497143';

const config: ExpoConfig = {
  name: 'Dream Mart',
  slug: 'dream-mart',
  version: '1.2.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'dreammart',
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
    'expo-dev-client',
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
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: ADMOB_ANDROID_APP_ID,
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
  },

  extra: {
    EXPO_PUBLIC_BASE_URL: 'https://amp-api.mpdreams.in/api/v1',
    EXPO_PUBLIC_PAYMENT_GATEWAY: 'ccavenue',
    EXPO_PUBLIC_ADMOB_ANDROID_APP_ID: ADMOB_ANDROID_APP_ID,
    eas: {
      projectId: 'a0c44343-3b41-4fff-8e6f-0ae355509844',
      // projectId: 'e38c72b1-4f7f-49be-b01f-84687394837f',
      // projectId: '80d34574-db42-4327-9362-32592954cf16'
    },
  },
};

export default config;
