import { Slot, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import AuthProvider, { useAuth } from '../../components/AuthContext';
import CustomBottomNav from '../../components/CustomBottomNav'; // ✅ Create this if not already
import Spinner from './../../components/Spinner';
import ProfileProvider from '@/components/ProfileContext';

export default function TabLayout() {

    const router = useRouter();
    const { isAuthenticated, user, logout } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isAuthenticated === false) {
          router.replace('/IntroScreen');
        }
        setLoading(false);

    }, [isAuthenticated]);

  return (
    <AuthProvider>
      <ProfileProvider>
          { loading ? <Spinner/> :
    <View style={styles.container}>
      <View style={styles.content}>
        <Slot />
      </View>
      <CustomBottomNav />
    </View> }
    </ProfileProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
