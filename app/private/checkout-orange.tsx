import { useAuth } from '@/components/AuthContext';
import { getToken } from '@/helpers/authStorage';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  AppStateStatus,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import uuid from 'react-native-uuid';
import { useCart } from '../../components/CartContext';

const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

interface Address {
  addressName: string;
  slugName: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

type PaymentDecision = 'WAIT' | 'SUCCESS' | 'FAIL';

interface OrangePGIntentResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    paymentIntentId: string;
    merchantTxnNo: string;
    amount: number;
    currency: string;
    expiresAt: string;
    gateway: string;
  };
}

interface OrangePGInitiateResponse {
  success: boolean;
  message: string;
  data: {
    paymentIntentId: string;
    redirectURL: string;
    tranCtx: string;
  };
}

interface OrangePGVerifyResponse {
  success: boolean;
  decision: PaymentDecision;
  status: string;
  orderId: string;
  message: string;
}

const CheckoutOrangePG = () => {
  const { cart, refreshCart, totalGstAmount, deliveryCharge } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [addressText, setAddressText] = useState('');
  const [currBal, setCurrBal] = useState(0);
  const [useWallet, setUseWallet] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('');

  // Polling control
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingAttemptsRef = useRef<number>(0);
  const activePaymentIntentIdRef = useRef<string | null>(null);

  // AppState listener for detecting when user returns to app
  const appState = useRef<AppStateStatus>(AppState.currentState);

  // Fetch helpers
  const fetchAddresses = async () => {
    const token = await getToken();
    try {
      const res = await axios.get(`${EXPO_PUBLIC_BASE_URL}/ecart/user/address/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setAddresses(res.data.data);
    } catch (err: any) {
      console.error('Failed to fetch addresses', err?.message || err);
    }
  };

  const getWallet = async () => {
    const token = await getToken();
    try {
      const res = await axios.get(`${EXPO_PUBLIC_BASE_URL}/ecart/user/wallet/getwallet`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setCurrBal(res.data.data.eCartWallet);
    } catch (err: any) {
      console.error('Failed to fetch wallet', err?.message || err);
    }
  };

  const fetchCart = async () => {
    const token = await getToken();
    try {
      const res = await axios.get(`${EXPO_PUBLIC_BASE_URL}/ecart/user/cart/getcart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setUseWallet(res.data.data.useWallet);
    } catch (err: any) {
      console.error('Failed to fetch cart', err?.message || err);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAddresses();
      getWallet();
      fetchCart();

      // Cleanup polling when screen loses focus
      return () => {
        stopPolling();
      };
    }, [])
  );

  // Handle deep link (optional - for better UX)
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      console.log('[Deep Link] Received:', url);

      // Parse deep link: dreammart://payment-result?status=success&orderId=xxx
      const parsed = Linking.parse(url);

      if (parsed.path === 'payment-result') {
        const status = parsed.queryParams?.status as string;
        const orderId = parsed.queryParams?.orderId as string;

        stopPolling(); // Stop polling immediately

        if (status === 'success') {
          Alert.alert('✅ Payment Successful', 'Your order has been placed!', [
            {
              text: 'OK',
              onPress: () => {
                refreshCart();
                router.replace('/private/success');
              }
            }
          ]);
        } else if (status === 'failed') {
          Alert.alert('❌ Payment Failed', 'Payment was unsuccessful. Please try again.', [
            { text: 'OK', onPress: () => router.replace('/') }
          ]);
        }
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened with a deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Handle app state changes (user returns from browser)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // User returned from background (browser) to foreground (app)
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('[AppState] User returned to app');

        // If we have an active payment, immediately check status
        if (activePaymentIntentIdRef.current) {
          console.log('[AppState] Checking payment status immediately...');
          checkPaymentStatusImmediately(activePaymentIntentIdRef.current);
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Show address snapshot
  useEffect(() => {
    const sel = addresses?.find((a) => a.slugName === selectedSlug);
    if (sel) {
      setAddressText(
        `${sel.fullName}, ${sel.street}, ${sel.city}, ${sel.state} - ${sel.pincode}, Phone: ${sel.phone}`
      );
    } else {
      setAddressText('');
    }
  }, [selectedSlug, addresses]);

  const total = cart.reduce((sum, item) => sum + item.productId.finalPrice * item.quantity, 0);

  // ============================================================
  // ORANGE PG PAYMENT FLOW
  // ============================================================

  /**
   * Step 1: Create Order Intent for Orange PG
   */
  async function createOrangePGIntent(deliverySlug: string): Promise<OrangePGIntentResponse | null> {
    const token = await getToken();
    const idempotencyKey = `${Date.now()}-${uuid.v4()}`;

    try {
      const res = await axios.post<OrangePGIntentResponse>(
        `${EXPO_PUBLIC_BASE_URL}/ecart/user/order/createorderintent/orangepg`,
        { deliverySlug, useWallet, idempotencyKey },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Failed to create order intent');
      }

      return res.data;
    } catch (err: any) {
      console.error('[createOrangePGIntent] error:', err?.response?.data || err?.message);
      throw err;
    }
  }

  /**
   * Step 2: Initiate Orange PG Sale (get redirect URL)
   */
  async function initiateOrangePGSale(paymentIntentId: string): Promise<OrangePGInitiateResponse | null> {
    const token = await getToken();

    try {
      const res = await axios.post<OrangePGInitiateResponse>(
        `${EXPO_PUBLIC_BASE_URL}/ecart/user/orange/initiate`,
        { paymentIntentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.data?.success) {
        throw new Error(res.data?.message || 'Failed to initiate Orange PG sale');
      }

      return res.data;
    } catch (err: any) {
      console.error('[initiateOrangePGSale] error:', err?.response?.data || err?.message);
      throw err;
    }
  }

  /**
   * Step 3: Verify Payment Status (polling)
   */
  async function verifyPaymentStatus(paymentIntentId: string): Promise<OrangePGVerifyResponse | null> {
    const token = await getToken();

    try {
      const res = await axios.get<OrangePGVerifyResponse>(
        `${EXPO_PUBLIC_BASE_URL}/ecart/user/orange/verify/${paymentIntentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      return res.data;
    } catch (err: any) {
      console.error('[verifyPaymentStatus] error:', err?.response?.data || err?.message);
      return null;
    }
  }

  /**
   * Immediately check payment status (when user returns from browser)
   */
  async function checkPaymentStatusImmediately(paymentIntentId: string) {
    setPaymentStatus('Checking payment status...');

    const result = await verifyPaymentStatus(paymentIntentId);

    if (!result) {
      // API error, start normal polling
      startPolling(paymentIntentId);
      return;
    }

    handleVerifyResult(result);
  }

  /**
   * Handle verify result
   */
  function handleVerifyResult(result: OrangePGVerifyResponse) {
    const { decision, orderId, message } = result;

    if (decision === 'SUCCESS') {
      stopPolling();
      activePaymentIntentIdRef.current = null;
      setPaymentStatus('');
      setLoading(false);
      
      Alert.alert('✅ Payment Successful', 'Your order has been placed!', [
        {
          text: 'OK',
          onPress: () => {
            refreshCart();
            router.replace('/private/success');
          }
        }
      ]);
    } else if (decision === 'FAIL') {
      stopPolling();
      activePaymentIntentIdRef.current = null;
      setPaymentStatus('');
      setLoading(false);
      
      Alert.alert('❌ Payment Failed', message || 'Payment was unsuccessful. Please try again.', [
        { text: 'OK', onPress: () => router.replace('/orders') }
      ]);
    }
    // If WAIT, polling continues
  }

  /**
   * Start polling for payment status
   */
  function startPolling(paymentIntentId: string) {
    stopPolling(); // Clear any existing polling
    pollingAttemptsRef.current = 0;
    activePaymentIntentIdRef.current = paymentIntentId;

    setPaymentStatus('Verifying payment...');

    pollingIntervalRef.current = setInterval(async () => {
      pollingAttemptsRef.current += 1;

      console.log(`[Polling] Attempt ${pollingAttemptsRef.current}/20`);

      const result = await verifyPaymentStatus(paymentIntentId);

      if (!result) {
        // API error, continue polling
        if (pollingAttemptsRef.current >= 20) {
          stopPolling();
          activePaymentIntentIdRef.current = null;
          setPaymentStatus('');
          setLoading(false);
          
          Alert.alert(
            'Verification Timeout',
            'Unable to verify payment. Please check your orders.',
            [{ text: 'OK', onPress: () => router.replace('/orders') }]
          );
        }
        return;
      }

      const { decision } = result;

      if (decision === 'SUCCESS' || decision === 'FAIL') {
        handleVerifyResult(result);
      } else {
        // WAIT - continue polling
        setPaymentStatus(`Verifying payment... (${pollingAttemptsRef.current}/20)`);

        if (pollingAttemptsRef.current >= 20) {
          // Timeout after 2 minutes
          stopPolling();
          activePaymentIntentIdRef.current = null;
          setPaymentStatus('');
          setLoading(false);
          
          Alert.alert(
            'Payment Pending',
            'Payment verification timed out. Please check your order status in Orders section.',
            [{ text: 'View Orders', onPress: () => router.replace('/orders') }]
          );
        }
      }
    }, 6000); // Poll every 6 seconds
  }

  /**
   * Stop polling
   */
  function stopPolling() {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    pollingAttemptsRef.current = 0;
  }

  /**
   * Main Place Order Handler
   */
  const handlePlaceOrder = async () => {
    if (!selectedSlug) {
      Alert.alert('Missing Info', 'Please select a delivery address.');
      return;
    }

    setLoading(true);
    setPaymentStatus('Creating order...');

    try {
      // Step 1: Create Order Intent
      const intentResponse = await createOrangePGIntent(selectedSlug);

      if (!intentResponse) {
        throw new Error('Failed to create order intent');
      }

      const { paymentIntentId, amount, orderId } = intentResponse.data;

      // Wallet-only flow (amount = 0)
      if (!amount || amount <= 0) {
        setPaymentStatus('');
        setLoading(false);
        
        Alert.alert('✅ Order Placed', 'Order placed successfully using wallet only.', [
          {
            text: 'OK',
            onPress: () => {
              refreshCart();
              router.replace('/private/success');
            }
          }
        ]);
        return;
      }

      // Step 2: Initiate Orange PG Sale
      setPaymentStatus('Initiating payment gateway...');
      const initiateResponse = await initiateOrangePGSale(paymentIntentId);

      if (!initiateResponse) {
        throw new Error('Failed to initiate payment gateway');
      }

      const { redirectURL } = initiateResponse.data;

      // Step 3: Open Orange PG in browser
      setPaymentStatus('Opening payment page...');
      activePaymentIntentIdRef.current = paymentIntentId; // Track active payment
      
      const result = await WebBrowser.openBrowserAsync(redirectURL, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: '#10b981'
      });

      console.log('[WebBrowser] Result:', result);

      // Step 4: Browser closed - check status immediately, then start polling
      console.log('[WebBrowser] Browser dismissed, checking status...');
      await checkPaymentStatusImmediately(paymentIntentId);

    } catch (err: any) {
      stopPolling();
      activePaymentIntentIdRef.current = null;
      setLoading(false);
      setPaymentStatus('');
      
      console.error('[handlePlaceOrder] error:', err?.response?.data || err?.message);
      Alert.alert(
        'Payment Error',
        err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.'
      );
    }
  };

  /**
   * Toggle Wallet Usage
   */
  const toggleUseWallet = async () => {
    try {
      const token = await getToken();
      const res = await axios.patch(
        `${EXPO_PUBLIC_BASE_URL}/ecart/user/cart/usewallet`,
        { useWallet: !useWallet },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) setUseWallet(res.data.data.useWallet);
    } catch (err: any) {
      console.error('toggleUseWallet error', err?.message || err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Checkout</Text>

      {/* Shipping Address */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Shipping Address</Text>
        <Picker selectedValue={selectedSlug} onValueChange={setSelectedSlug} style={styles.input}>
          <Picker.Item label="Select Address" value="" />
          {addresses?.map((a) => (
            <Picker.Item
              key={a.slugName}
              label={`${a.addressName}: ${a.street}, ${a.city} - ${a.pincode}`}
              value={a.slugName}
            />
          ))}
        </Picker>
        {addressText ? <Text style={{ marginTop: 8, color: '#444' }}>{addressText}</Text> : null}
      </View>

      {/* Use Wallet Toggle */}
      <View style={useWalletStyles.wrapper}>
        <View style={useWalletStyles.container}>
          <Text style={useWalletStyles.label}>Use Wallet Balance</Text>
          <Switch
            trackColor={{ false: '#ccc', true: '#10b981' }}
            thumbColor={useWallet ? '#fff' : '#f4f3f4'}
            onValueChange={toggleUseWallet}
            value={useWallet}
          />
        </View>
        <Text style={useWalletStyles.description}>
          Available Balance: <Ionicons name="ribbon" size={16} color="#10b981" /> ₹{currBal.toFixed(2)}
        </Text>
      </View>

      {/* Order Summary */}
      <View style={styles.summary}>
        <Text style={styles.sectionLabel}>Order Summary</Text>
        {cart?.map((item) => (
          <View key={item.productId._id} style={styles.row}>
            <Text style={styles.name}>
              {item.productId.title} × {item.quantity}
            </Text>
          </View>
        ))}

        <View style={styles.row}>
          <Text style={styles.totalLabel}>Amount:</Text>
          <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.totalLabel}>
            GST {total ? Math.round((totalGstAmount / total) * 100) : 0}%:
          </Text>
          <Text style={styles.totalValue}>₹{(totalGstAmount || 0).toFixed(2)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.totalLabel}>Delivery Charge:</Text>
          <Text style={styles.totalValue}>₹{(deliveryCharge || 0).toFixed(2)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>
            ₹{(total + (totalGstAmount || 0) + (deliveryCharge || 0)).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Payment Status */}
      {paymentStatus ? (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="small" color="#10b981" />
          <Text style={styles.statusText}>{paymentStatus}</Text>
        </View>
      ) : null}

      {/* Place Order Button */}
      <TouchableOpacity
        style={[styles.placeButton, loading && { opacity: 0.7 }]}
        onPress={handlePlaceOrder}
        disabled={loading}
      >
        {loading ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.placeText}>Processing...</Text>
          </View>
        ) : (
          <Text style={styles.placeText}>Place Order</Text>
        )}
      </TouchableOpacity>

      {/* Payment Gateway Info */}
      <View style={styles.infoContainer}>
        <Ionicons name="shield-checkmark" size={16} color="#10b981" />
        <Text style={styles.infoText}>Secured by Orange PG (ICICI Bank)</Text>
      </View>
    </ScrollView>
  );
};

export default CheckoutOrangePG;

// Styles (same as before)
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', flexGrow: 1 },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, marginTop: 30 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  summary: { borderTopWidth: 1, borderColor: '#ddd', paddingTop: 16, marginTop: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  name: { fontSize: 14 },
  totalLabel: { fontSize: 15, fontWeight: 'bold' },
  totalValue: { fontSize: 15, fontWeight: 'bold', color: '#3b82f6' },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  placeButton: {
    marginTop: 24,
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 6,
  },
  placeText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    padding: 8,
  },
  infoText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
  },
});

const useWalletStyles = StyleSheet.create({
  wrapper: { margin: 20, backgroundColor: '#f9f9f9', borderRadius: 12, padding: 16, elevation: 3 },
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 18, fontWeight: '600', color: '#333' },
  description: { marginTop: 8, fontSize: 14, color: '#666' },
});