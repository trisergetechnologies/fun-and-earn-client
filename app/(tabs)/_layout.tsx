import { Slot, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import AuthProvider, { useAuth } from '../../components/AuthContext';
import CustomBottomNav from '../../components/CustomBottomNav'; // ✅ Create this if not already

export default function TabLayout() {

    const router = useRouter();
    const { isAuthenticated, user, logout } = useAuth();

    useEffect(() => {
      console.log("is auth from index", isAuthenticated)
        if (isAuthenticated === false) {
          router.replace('/signin');
        }
    }, [isAuthenticated]);

  return (
    <AuthProvider>
    <View style={styles.container}>
      <View style={styles.content}>
        <Slot />
      </View>
      <CustomBottomNav />
    </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
