import { useAuth } from '@/components/AuthContext';
import Spinner from '@/components/Spinner';
import { useTheme } from '@/components/ThemeContext';
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

const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

const SignInScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

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

      await login(data.token, data.user);
      router.push('/tabs/explore');
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
  

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Sign In' }} />
      {loading ? (
        <Spinner />
      ) : (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollWrapper}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back!</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign in to continue exploring and earning with Dream Mart
            </Text>

            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Email"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                keyboardType="email-address"
                value={email}
                onChangeText={(e)=> setEmail(e.toLowerCase())}
              />
              <TextInput
                placeholder="Password"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleSignIn}
              disabled={loading}
            >
              <Text style={styles.btnTxt}>Sign In</Text>
            </TouchableOpacity>

            <Text style={[styles.signupPrompt, { color: colors.textSecondary }]}>
              Don’t have an account?{' '}
              <Text
                onPress={() => router.push('/signup')}
                style={[styles.signupLink, { color: colors.primary }]}
              >
                Sign Up
              </Text>
            </Text>
            <Text style={[styles.signupPrompt, { color: colors.textSecondary }]}>
              Forgot Password?{' '}
              <Text
                onPress={() => router.push('/(public)/reset')}
                style={[styles.signupLink, { color: colors.primary }]}
              >
                Reset Password
              </Text>
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      )}
      <Toast />
    </>
  );
};

export default SignInScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
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
    textAlign: 'center',
    marginBottom: 9,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputWrapper: {
    gap: 16,
    marginBottom: 32,
  },
  input: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    fontSize: 15,
    borderWidth: 1,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  btnTxt: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  signupPrompt: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
  },
  signupLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
