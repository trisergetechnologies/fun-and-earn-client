// app/(public)/_layout.tsx
import { Slot } from 'expo-router';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function PublicLayout() {
  
  return (
    <ProtectedRoute>
      <Slot />
    </ProtectedRoute>
  );
}
