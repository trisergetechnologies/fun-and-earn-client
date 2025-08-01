// SignUpScreen.tsx
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal';
import Spinner from '@/components/Spinner';
import TermsAndConditionsModal from '@/components/TermsAndConditionsModal';
import { Colors } from '@/constants/Colors';
import { getToken } from '@/helpers/authStorage';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
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

const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

const indianStates = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam",
  "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala",
  "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"];

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
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState<string>('');
  const [showPolicy, setShowPolicy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);


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

    if (!name || !email || !state_address || !password || !confirmPassword || !gender) {
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



    const otpUrl = `${EXPO_PUBLIC_BASE_URL}/auth/sendotp`;
    try {
      setIsOtpSent(true);
      const response = await axios.post(otpUrl, { email });
      if (response.data.success) {

        setTimeout(() => {
          setIsOtpSent(false);
        }, 90000);

        Toast.show({ type: 'success', text1: 'OTP Sent', text2: 'Check your Gmail inbox.' });
      } else {
        setIsOtpSent(false);
        Toast.show({ type: 'error', text1: 'OTP Failed', text2: 'Could not send OTP.' });
      }
    } catch (error) {
      setIsOtpSent(false);
      console.error(error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to send OTP.' });
    }
  };

  useFocusEffect(
    useCallback(() => {
      setName('');
      setEmail('');
      setGender('');
      setPassword('');
      setConfirmPassword('');
      setOtp('');
      setStateAddress('');
      setIsOtpSent(false);
    }, [])
  );

  const handleRegister = async () => {
    if (!name || !email || !state_address || !password || !confirmPassword || !gender || !otp) {
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

    if (!otp) {
      Toast.show({ type: 'error', text1: 'Enter otp', text2: 'Otp is required' });
      return;
    }

    const url = `${EXPO_PUBLIC_BASE_URL}/auth/register`;
    try {
      setLoading(true);
      const response = await axios.post(url, {
        name,
        email,
        gender,
        state_address,
        password,
        otp,
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
          router.replace('/(public)/signin');
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
  const otpBtnColor = isOtpSent ? 'grey' : '';
  const SignUp = () => (
    <View style={styles.inputWrapper}>
      <TextInput placeholder="Full Name" placeholderTextColor="#666" style={styles.input} value={name} onChangeText={setName} />
      <TextInput placeholder="Email" placeholderTextColor="#666" style={styles.input} keyboardType="email-address" value={email} onChangeText={(e) => setEmail(e.toLowerCase())} />

      <View style={styles.pickerWrapper}>
        <Picker selectedValue={state_address} onValueChange={setGender} style={styles.picker} dropdownIconColor="#666">
          <Picker.Item label="Select Gender" value="" />
          {['male', 'female', 'other'].map((s) => <Picker.Item key={s} label={s} value={s} />)}
        </Picker>
      </View>

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
        <TextInput placeholder="Enter OTP" placeholderTextColor="#666" style={[styles.input, { flex: 1 }]} value={otp} onChangeText={setOtp} keyboardType="number-pad" />
        <TouchableOpacity disabled={isOtpSent} onPress={handleGetOtp} style={[styles.otpButton, {backgroundColor: otpBtnColor}]}>
          <Text style={styles.otpBtnTxt}>Get OTP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Sign Up' }} />
      {loading ? <Spinner /> :
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollWrapper} showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Register now to join and earn!</Text>
              {SignUp()}
              <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.btnTxt}>Register</Text>
              </TouchableOpacity>

              {/* 👇 Terms & Privacy Links */}
              <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 12 }}>
                By signing up, you agree to our{' '}
                <Text
                  onPress={() => setShowTerms(true)}
                  style={{ textDecorationLine: 'underline', color: Colors.primary }}
                >
                  T&C
                </Text>{' '}
                and{' '}
                <Text
                  onPress={() => setShowPolicy(true)}
                  style={{ textDecorationLine: 'underline', color: Colors.primary }}
                >
                  Privacy Policy
                </Text>
                .
              </Text>

              <Text style={styles.signinPrompt}>
                Already have an account?{' '}
                <Text onPress={() => router.push('/signin')} style={styles.signinLink}>
                  Sign In
                </Text>
              </Text>
            </ScrollView>


          </KeyboardAvoidingView>
        </SafeAreaView>

      }

      <PrivacyPolicyModal visible={showPolicy} onClose={() => setShowPolicy(false)} />
        <TermsAndConditionsModal visible={showTerms} onClose={() => setShowTerms(false)} />
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
    // backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBtnTxt: {
    color: 'black',
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
