import { useAuth } from '@/components/AuthContext';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function OrderLayout() {

      const router = useRouter();
      const { isAuthenticated, user, logout } = useAuth();
  
      useEffect(() => {
          if (isAuthenticated === false) {
            router.replace('/signin');
          }
      }, [isAuthenticated]);

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
