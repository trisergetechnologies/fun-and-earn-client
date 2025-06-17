import AuthProvider from '@/components/AuthContext';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { CartProvider } from '.././components/CartContext';
// import { AuthProvider } from '../components/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    // <ThemeProvider value={'light'}>
    
    <AuthProvider>
    <CartProvider>
      <>
      <Stack>
      
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="signin" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="signup" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name ="checkout" options={{headerShown: false}}/>
        <Stack.Screen name ="success" options={{headerShown: false}}/>
        <Stack.Screen name ="CustomerSupport" options={{headerShown: false}}/>
        <Stack.Screen name ="setting" options={{headerShown: false}}/>
        <Stack.Screen name ="UpdateProfile" options={{headerShown: false}}/>
        <Stack.Screen name ="transactions" options={{headerShown: false}}/>
        <Stack.Screen name="orders" options={{ headerShown: false }} />
        <Stack.Screen name="category" options={{ headerShown: false }} />
        <Stack.Screen name="Address" options={{ headerShown: false }} />
        
      </Stack>
      <Toast/>
      
      </>
      </CartProvider>
      </AuthProvider>
      
     
  );
}
