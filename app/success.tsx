import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SuccessScreen = () => {
  const router = useRouter();
      const { isAuthenticated, user, logout } = useAuth();
  
      useEffect(() => {
        console.log("is auth from index", isAuthenticated)
          if (isAuthenticated === false) {
            router.replace('/signin');
          }
      }, [isAuthenticated]);

  return (
  
    <View style={styles.container}>
      <Text style={styles.title}>🎉 Order Placed!</Text>
      <Text style={styles.subtitle}>Thank you for shopping with us.</Text>
      <TouchableOpacity style={styles.homeButton} onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.homeText}>Go to Home</Text>
      </TouchableOpacity>
    </View>

  );
};

export default SuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#10b981',
  },
  subtitle: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 32,
  },
  homeButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  homeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});