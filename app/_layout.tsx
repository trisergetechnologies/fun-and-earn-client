import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AuthProvider from '@/components/AuthContext';
import ProfileProvider from '@/components/ProfileContext';
import { CartProvider } from '@/components/CartContext';
import { ThemeProvider, useTheme } from '@/components/ThemeContext';
import {
  getThemedStackScreenOptions,
  ThemeSystemSync,
} from '@/components/ThemeSystemSync';
import Toast from 'react-native-toast-message';
import { toastConfig } from '@/components/ToastConfig';
import { setupApiClient } from '@/helpers/apiClient';

setupApiClient();

SplashScreen.preventAutoHideAsync();

function RootNavigation() {
  const { colors } = useTheme();

  return (
    <>
      <ThemeSystemSync />
      <Stack screenOptions={getThemedStackScreenOptions(colors)}>
        <Stack.Screen name="(public)" options={{ headerShown: false }} />
        <Stack.Screen name="orders" options={{ headerShown: false }} />
        <Stack.Screen name="private" options={{ headerShown: false }} />
        <Stack.Screen name="tabs" options={{ headerShown: false }} />
      </Stack>
      <Toast config={toastConfig} />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <ProfileProvider>
            <CartProvider>
              <RootNavigation />
            </CartProvider>
          </ProfileProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
