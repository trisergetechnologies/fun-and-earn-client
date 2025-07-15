import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';


export const useProtectedScreen = () => {
  const router = useRouter();
  const { isAuthenticated, isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated === false) {
      router.replace('/IntroScreen');
    }
  }, [isAuthLoading, isAuthenticated]);

  const ready = !isAuthLoading && isAuthenticated;

  return { ready };
};
