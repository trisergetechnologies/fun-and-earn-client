// SignUpScreen.tsx
import Spinner from '@/components/Spinner';
import { Colors } from '@/constants/Colors';
import { getToken } from '@/helpers/authStorage';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import Constants from 'expo-constants';
import { router, Stack, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Toast from 'react-native-toast-message';

const { BASE_URL } = Constants.expoConfig?.extra || {};

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const SignUpScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [state_address, setStateAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginApp, setLoginApp] = useState('eCart');
  const [role, setRole] = useState('user');
  const [otpCode, setOtpCode] = useState('0000');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const rotateAnim = useRef(new Animated.Value(0)).current;

  const startRotation = () => {
    rotateAnim.setValue(0);
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  useEffect(() => {
    if (loading) {
      startRotation();
    } else {
      rotateAnim.stopAnimation(() => rotateAnim.setValue(0));
    }
  }, [loading]);

  const rotateY = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleGetOtp = async () => {
    try {
      const response = await axios.post('', { email });
      if (response.data.success) {
        setIsOtpSent(true);
        Toast.show({ type: 'success', text1: 'OTP Sent', text2: 'Check your Gmail inbox.' });
      } else {
        Toast.show({ type: 'error', text1: 'OTP Failed', text2: 'Could not send OTP.' });
      }
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to send OTP.' });
    }
  };

  useFocusEffect(
    useCallback(() => {
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setOtpCode('0000');
      setStateAddress('');
      setIsOtpSent(false);
    }, [])
  );

  const handleRegister = async () => {
    if (!name || !email || !state_address || !password || !confirmPassword || !otpCode) {
      Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please fill all fields.' });
      return;
    }

    if (!validateEmail(email)) {
      Toast.show({ type: 'error', text1: 'Invalid Email', text2: 'Please enter a valid Gmail.' });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Password Mismatch', text2: 'Passwords do not match.' });
      return;
    }

    const url = `${BASE_URL}/auth/register`;
    try {
      setLoading(true);
      const response = await axios.post(url, {
        name,
        email,
        state_address,
        password,
        confirmPassword,
        otpCode,
        role,
        loginApp,
      });

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Registered Successfuly!',
          text2: 'Welcome 🎉',
        });

        setTimeout(() => {
          router.replace('/signin');
        }, 1000);

      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: response.data.message || 'Registration failed.' });
      }
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Registration Error', text2: 'Something went wrong.' });
    } finally {
      setLoading(false);
    }
  };

  const SignUp = () => (
    <View style={styles.inputWrapper}>
      <TextInput placeholder="Full Name" placeholderTextColor="#666" style={styles.input} value={name} onChangeText={setName} />
      <TextInput placeholder="Email" placeholderTextColor="#666" style={styles.input} keyboardType="email-address" value={email} onChangeText={setEmail} />
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={state_address} onValueChange={setStateAddress} style={styles.picker} dropdownIconColor="#666">
          <Picker.Item label="Select State" value="" />
          {indianStates.map((s) => <Picker.Item key={s} label={s} value={s} />)}
        </Picker>
      </View>

      <View style={styles.inputContainer}>
        <TextInput placeholder="Password" placeholderTextColor="#666" secureTextEntry={!showPassword} style={styles.inputWithIcon} value={password} onChangeText={setPassword} />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput placeholder="Confirm Password" placeholderTextColor="#666" secureTextEntry={!showConfirmPassword} style={styles.inputWithIcon} value={confirmPassword} onChangeText={setConfirmPassword} />
        <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.otpRow}>
        <TextInput placeholder="Enter OTP" placeholderTextColor="#666" style={[styles.input, { flex: 1 }]} value={otpCode} onChangeText={setOtpCode} keyboardType="number-pad" />
        <TouchableOpacity onPress={handleGetOtp} style={styles.otpButton}>
          <Text style={styles.otpBtnTxt}>Get OTP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

      useEffect(() => {
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
  
      }, []);

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Sign Up' }} />
        {loading ? <Spinner/> : 
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollWrapper} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Register now to join and earn!</Text>
            {SignUp()}
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.btnTxt}>Register</Text>
            </TouchableOpacity>
            <Text style={styles.signinPrompt}>
              Already have an account? <Text onPress={() => router.push('/signin')} style={styles.signinLink}>Sign In</Text>
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
}
      <Toast />
    </>
  );
};

export default SignUpScreen;

// Keep your styles here (same as before)



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollWrapper: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.black,
    textAlign: 'center',
    marginBottom: 4,
    marginTop: 29,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 24,
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
  inputContainer: {
    position: 'relative',
  },
  inputWithIcon: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 18,
    paddingRight: 44,
    borderRadius: 14,
    fontSize: 15,
    color: Colors.black,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: '32%',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderColor: '#ddd',
    borderWidth: 1,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: Colors.black,
  },
  otpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  otpButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBtnTxt: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 2,
  },
  btnTxt: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  signinPrompt: {
    marginTop: 20,
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 14,
  },
  signinLink: {
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
