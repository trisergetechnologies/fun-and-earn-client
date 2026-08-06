import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AdMobSessionController } from '@/components/AdMobSessionController';
import { useAuth } from '@/components/AuthContext';
import CustomBottomNav from '@/components/CustomBottomNav';
import Spinner from '@/components/Spinner';
import { useTheme } from '@/components/ThemeContext';
import { getThemedLayoutStyle } from '@/components/ThemeSystemSync';

export default function TabLayout() {
  const { colors } = useTheme();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!isAuthenticated) {
        router.replace('/(public)/signin');
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, isAuthLoading]);

  if (isAuthLoading || loading) return <Spinner />;

  return (
    <View style={getThemedLayoutStyle(colors)}>
      <AdMobSessionController />
      <View style={styles.content}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="explore" options={{ headerShown: false }} />
          <Stack.Screen name="BankScreen" options={{ headerShown: false }} />
          <Stack.Screen name="cart" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="rewards" options={{ headerShown: false }} />
          <Stack.Screen name="wallet" options={{ headerShown: false }} />
        </Stack>
      </View>
      <CustomBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1 },
});
