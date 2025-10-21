// app/(private)/success.tsx
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { getToken } from '@/helpers/authStorage';

const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://api.yourdomain.com';

type StatusType = 'verifying' | 'success' | 'failed' | 'idle';

export default function SuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [status, setStatus] = useState<StatusType>('idle');
  const [message, setMessage] = useState<string>('Processing your payment...');

  const intent = params.intent as string | undefined;
  const razorpay_payment_id = params.razorpay_payment_id as string | undefined;
  const razorpay_order_id = params.razorpay_order_id as string | undefined;
  const razorpay_signature = params.razorpay_signature as string | undefined;

  const verifyPayment = async () => {
    try {
      setStatus('verifying');
      setMessage('Verifying payment with server...');

      const token = await getToken();
      const res = await axios.post(
        `${EXPO_PUBLIC_BASE_URL}/ecart/user/payment/verify`,
        {
          paymentIntentId: intent,
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        setStatus('success');
        setMessage('Your order was placed successfully 🎉');
        // Give user a few seconds before redirect
        setTimeout(() => {
          router.replace('/tabs/explore');
        }, 2500);
      } else {
        setStatus('failed');
        setMessage(res.data.message || 'Payment verification failed.');
      }
    } catch (error: any) {
      console.error('verifyPayment error:', error?.response?.data || error?.message);
      setStatus('failed');
      setMessage(error?.response?.data?.message || 'Unable to verify payment.');
    }
  };

  useEffect(() => {
    // CASE 1: Razorpay redirect (has params)
    if (intent && razorpay_payment_id && razorpay_order_id && razorpay_signature) {
      verifyPayment();
    } 
    // CASE 2: wallet-only order or direct navigation
    else {
      setStatus('success');
      setMessage('Your wallet-only order was placed successfully 🎉');
    }
  }, []);

  const handleRetry = () => {
    if (intent) verifyPayment();
    else router.replace('/tabs/explore');
  };

  return (
    <View style={styles.container}>
      {status === 'verifying' && (
        <>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.infoText}>{message}</Text>
        </>
      )}

      {status === 'success' && (
        <>
          <Text style={styles.title}>🎉 Order Placed!</Text>
          <Text style={styles.subtitle}>{message}</Text>
          <TouchableOpacity
            style={styles.homeButton}
            onPress={() => router.replace('/tabs/explore')}
          >
            <Text style={styles.homeText}>Go to Home</Text>
          </TouchableOpacity>
        </>
      )}

      {status === 'failed' && (
        <>
          <Text style={[styles.title, { color: '#ef4444' }]}>❌ Payment Failed</Text>
          <Text style={styles.subtitle}>{message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Retry Verification</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  infoText: {
    marginTop: 16,
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#10b981',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
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
  retryButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
