
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from './AuthContext';
import SimpleSpinner from './SimpleSpinner';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isAuthLoading) return;

    const isPublicRoute = ['(public)', '', 'signin', 'signup'].includes(segments[0] || '');

    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/(public)/signin');
    } else if (isAuthenticated && isPublicRoute) {
      router.replace('/tabs/explore');
    }
  }, [isAuthenticated, isAuthLoading, segments]);

  if (isAuthLoading) return <SimpleSpinner />;

  return <>{children}</>;
};