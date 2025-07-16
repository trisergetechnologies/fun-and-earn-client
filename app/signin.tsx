import Spinner from '@/components/Spinner';
import { Colors } from '@/constants/Colors';
import { getToken, saveToken } from '@/helpers/authStorage';
import axios from 'axios';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../components/AuthContext';

const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

const SignInScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, login } = useAuth();

  // Spinner animation
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const startRotation = () => {
    rotateAnim.setValue(0);
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  };

  useEffect(() => {
    if (loading) startRotation();
  }, [loading]);

  const rotateY = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useFocusEffect(
    useCallback(() => {
      setEmail('');
      setPassword('');
    }, [])
  );

  const handleSignIn = async () => {
    if(!email || !password) return Toast.show({type: 'error', text1: 'Missing Fields', text2: "Please fill all fields.", position: 'top' });
    
    setLoading(true);
    try {
      const url = `${EXPO_PUBLIC_BASE_URL}/auth/login`;

      const response = await axios.post(url, {
        email,
        password,
        loginApp: 'eCart',
      });

      const { success, message, data } = response.data;

      if (!success || !data?.token || !data?.user) {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: message || 'Unknown error occurred',
          position: 'top',
        });
        return;
      }

      await saveToken(data.token);
      await login(data.token, data.user);
      router.replace('/(tabs)'); // No success message shown
    } catch (error: any) {
      const msg = axios.isAxiosError(error)
        ? error.response?.data?.message || error.message
        : 'Unexpected Error';
      Toast.show({
        type: 'error',
        text1: 'Login Error',
        text2: msg,
        position: 'top',
      });
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
      console.log("is auth from index", isAuthenticated)
      setLoading(true);
      let token
      const getAuth=async()=>{
        token = await getToken();
      }
      getAuth();
        if (token) {
          router.replace('/(tabs)');
        }
        setLoading(false);

    }, [isAuthenticated]);

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Sign In' }} />
      {loading ? <Spinner/> : 
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollWrapper}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>
              Sign in to continue exploring and earning with Dream Mart
            </Text>

            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Email"
                placeholderTextColor="#666"
                style={styles.input}
                keyboardType="email-address"
                value={email}
                onChangeText={(e)=> setEmail(e.toLowerCase())}
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#666"
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text style={styles.btnTxt}>Sign In</Text>
            </TouchableOpacity>

            <Text style={styles.signupPrompt}>
              Don’t have an account?{' '}
              <Text
                onPress={() => router.push('/signup')}
                style={styles.signupLink}
              >
                Sign Up
              </Text>
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
}
      <Toast />
    </>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollWrapper: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 9,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputWrapper: {
    gap: 16,
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    fontSize: 15,
    color: Colors.black,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 3,
  },
  btnTxt: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  signupPrompt: {
    marginTop: 20,
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
  },
  signupLink: {
    color: Colors.black,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  spinner3d: {
    width: 80,
    height: 80,
    backfaceVisibility: 'hidden',
  },
});
