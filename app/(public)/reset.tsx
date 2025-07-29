import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

const ResetPasswordScreen = () => {
  const router = useRouter();

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendOtp = async () => {
    setLoading(true);
    setOtpError('');
    try {
      const res = await axios.post(`${EXPO_PUBLIC_BASE_URL}/auth/send-reset-otp`, { email });

      if (res.data.success) {
        console.log(res.data.message);
        setStep('otp');
      } else {
        console.log("the response", res.data)
        setOtpError(res.data.message || 'Failed to send OTP');
      }
    } catch (err: any) {
        console.log(err)
      setOtpError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${EXPO_PUBLIC_BASE_URL}/auth/reset-password`, {
        email,
        otp,
        newPassword,
      });

      if (res.data.success) {
        Alert.alert('Success', 'Password reset successfully');
        router.replace('/(public)/signin');
      } else {
        Alert.alert('Error', res.data.message || 'Failed to reset password');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>Reset Your Password</Text>
        <Text style={styles.subtitle}>
          {step === 'email'
            ? 'Enter your registered email to receive an OTP'
            : 'Enter the OTP and your new password below'}
        </Text>

        {step === 'email' && (
          <>
            <TextInput
              placeholder="Enter your email"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {loading ? (
              <ActivityIndicator color="#10b981" />
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
                <Text style={styles.buttonText}>Get OTP</Text>
              </TouchableOpacity>
            )}

            {otpError ? (
              <TouchableOpacity onPress={handleSendOtp}>
                <Text style={styles.errorText}>{otpError}. Tap to retry.</Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}

        {step === 'otp' && (
          <>
            <TextInput
              placeholder="Enter OTP"
              style={styles.input}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
            />

            <TextInput
              placeholder="New Password"
              style={styles.input}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <TextInput
              placeholder="Confirm Password"
              style={styles.input}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            {loading ? (
              <ActivityIndicator color="#10b981" />
            ) : (
              <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
                <Text style={styles.buttonText}>Reset Password</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 60,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 15,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 10,
  },
});
