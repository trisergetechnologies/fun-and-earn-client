import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import Spinner from '@/components/Spinner';
import { useTheme } from '@/components/ThemeContext';
import { getThemedStackScreenOptions } from '@/components/ThemeSystemSync';

export default function OrderLayout() {
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
    <Stack
      screenOptions={{
        headerShown: false,
        ...getThemedStackScreenOptions(colors),
      }}
    />
  );
}
