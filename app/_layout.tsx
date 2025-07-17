import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import AuthProvider from '@/components/AuthContext';
import ProfileProvider from '@/components/ProfileContext';
import { CartProvider } from '@/components/CartContext';
import Toast from 'react-native-toast-message';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <ProfileProvider>
        <CartProvider>
          <Stack>
            <Stack.Screen name="(public)" options={{ headerShown: false }} />
            <Stack.Screen name="orders" options={{ headerShown: false }} />
            <Stack.Screen name="private" options={{ headerShown: false }} />
            <Stack.Screen name="tabs" options={{ headerShown: false }} />
          </Stack>
          <Toast />
        </CartProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}
