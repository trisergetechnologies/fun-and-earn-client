import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useAuth } from '@/components/AuthContext';
import CustomBottomNav from '@/components/CustomBottomNav';
import Spinner from '@/components/Spinner';
import { useTheme } from '@/components/ThemeContext';
import { getThemedLayoutStyle } from '@/components/ThemeSystemSync';

export default function PrivateLayout() {
  const { colors } = useTheme();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated) {
        router.push('/(public)/signin');
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, isAuthLoading]);

  if (isAuthLoading || loading) return <Spinner />;

  return (
    <View style={getThemedLayoutStyle(colors)}>
      <View style={styles.content}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="activate" options={{ headerShown: false }} />
          <Stack.Screen name="Address" options={{ headerShown: false }} />
          <Stack.Screen name="category" options={{ headerShown: false }} />
          <Stack.Screen name="checkout" options={{ headerShown: false }} />
          <Stack.Screen name="CustomerSupport" options={{ headerShown: false }} />
          <Stack.Screen name="setting" options={{ headerShown: false }} />
          <Stack.Screen name="success" options={{ headerShown: false }} />
          <Stack.Screen name="transactions" options={{ headerShown: false }} />
          <Stack.Screen name="UpdateProfile" options={{ headerShown: false }} />
        </Stack>
      </View>
      <CustomBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
});
