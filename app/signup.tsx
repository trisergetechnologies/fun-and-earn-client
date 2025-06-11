import { Colors } from '@/constants/Colors'
import { Picker } from '@react-native-picker/picker'
import axios from 'axios'
import Constants from 'expo-constants'
import { router, Stack, useFocusEffect } from 'expo-router'
import React, { useCallback, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'






const { BASE_URL } = Constants.expoConfig?.extra || {}

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
]

const SignUpScreen = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [state_address, setStateAddress] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loginApp, setLoginApp] = useState('eCart')
  const [role, setRole] = useState('user')
  const [otpCode, setOtpCode] = useState('0000')
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [index, setIndex] = useState(0)




  const handleGetOtp = async () => {
    try {
      const response = await axios.post('', { email })
      if (response.data.success) {
        setIsOtpSent(true)
        alert('OTP sent to Gmail')
      } else {
        alert('Failed to send OTP')
      }
    } catch (error) {
      console.error(error)
      alert('Error sending OTP')
    }
  }
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
  console.log("SignUp Screen rendered");
  const handleRegister = async () => {
    const url = `${BASE_URL}/auth/register`
    try {
      const response = await axios.post(url, {
        name,
        email,
        state_address,
        password,
        confirmPassword,
        otpCode,
        role,
        loginApp
      })

      if (response.data.success) {
        alert('Registration successful!')
      } else {
        alert(response.data.message || 'Registration failed.')
      }
    } catch (error) {
      console.error(error)
      alert('Error during registration')
    }
  }

  const normalSignUp = () => (
    <View style={styles.inputWrapper}>
      <TextInput
        placeholder="Full Name"
        placeholderTextColor="#666"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        placeholder="Gmail"
        placeholderTextColor="#666"
        style={styles.input}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={state_address}
          onValueChange={(itemValue) => setStateAddress(itemValue)}
          style={styles.picker}
          dropdownIconColor="#666"
        >
          <Picker.Item label="Select State" value="" />
          {indianStates.map((s) => (
            <Picker.Item key={s} label={s} value={s} />
          ))}
        </Picker>
      </View>

      <TextInput
        placeholder="Password"
        placeholderTextColor="#666"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        placeholder="Confirm Password"
        placeholderTextColor="#666"
        secureTextEntry
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <View style={styles.otpRow}>
        <TextInput
          placeholder="Enter OTP"
          placeholderTextColor="#666"
          style={[styles.input, { flex: 1, marginRight: 10 }]}
          value={otpCode}
          onChangeText={setOtpCode}
          keyboardType="number-pad"
        />
        <TouchableOpacity onPress={handleGetOtp} style={styles.otpButton}>
          <Text style={styles.otpBtnTxt}>Get OTP</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'Sign Up' }} />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollWrapper}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Register now to join and earn!</Text>

            {normalSignUp()}

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.btnTxt}>Register</Text>
            </TouchableOpacity>

            <Text style={styles.signinPrompt}>
              Already have an account?{' '}
              <Text onPress={() => router.push('/signin')} style={styles.signinLink}>
                Sign In
              </Text>
            </Text>

          </ScrollView>



        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  )
}

export default SignUpScreen

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
})