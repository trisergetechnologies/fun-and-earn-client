import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import RazorpayCheckout from 'react-native-razorpay';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { useCart } from '../../components/CartContext';
import { getToken } from '@/helpers/authStorage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import uuid from 'react-native-uuid';
import { useProfile } from '@/components/ProfileContext';
import { useTheme } from '@/components/ThemeContext';

const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1'; // public backend

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

type VerifyStatusDecision = 'WAIT' | 'SUCCESS' | 'FAIL';

interface VerifyStatusResponse {
  success: boolean;
  decision: VerifyStatusDecision;
  reason?: string;
  orderStatus?: string;
}

interface CreateIntentResult {
  walletOnly?: boolean;
  success?: boolean;
  paymentIntentId?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  message?: string;
}

const CheckoutScreen = () => {
  const { colors } = useTheme();
  const { cart, refreshCart, totalGstAmount, deliveryCharge } = useCart();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[] | null>([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [addressText, setAddressText] = useState('');
  const [currBal, setCurrBal] = useState(0);
  const [useWallet, setUseWallet] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const {userProfile} = useProfile();

  // fetch helpers
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

  useFocusEffect(useCallback(() => {
    fetchAddresses();
    getWallet();
    fetchCart();
  }, []));

  // show address snapshot
  useEffect(() => {
    const sel = addresses?.find(a => a.slugName === selectedSlug);
    if (sel) {
      setAddressText(`${sel.fullName}, ${sel.street}, ${sel.city}, ${sel.state} - ${sel.pincode}, Phone: ${sel.phone}`);
    } else {
      setAddressText('');
    }
  }, [selectedSlug, addresses]);

  const total = cart.reduce((sum, item) => sum + item.productId.finalPrice * item.quantity, 0);


  async function createIntentAndPay(deliverySlug: string): Promise<CreateIntentResult> {
    const token = await getToken();
    const idempotencyKey = `${Date.now()}-${uuid.v4()}`;
    const url = `${EXPO_PUBLIC_BASE_URL}/ecart/user/order/createorderintent`;
    const payload = { deliverySlug, useWallet, idempotencyKey };

    const res = await axios.post(url, payload, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.data?.success) throw new Error(res.data?.message || 'Failed to create payment intent');

    const {
      paymentIntentId,
      razorpayOrderId,
      razorpayKeyId,
      amount,
      currency,
      callbackUrl,
    } = res.data.data as {
      paymentIntentId: string;
      razorpayOrderId?: string;
      razorpayKeyId?: string;
      amount?: number;
      currency?: string;
      callbackUrl?: string;
    };

    // 🪙 Wallet-only flow
    if (!amount || amount <= 0) {
      return { walletOnly: true, paymentIntentId };
    }

    // 🧾 Razorpay options
    const options = {
      description: 'Dream Mart Order Payment',
      image: 'https://amp-api.mpdreams.in/static/logo.png',
      currency: currency || 'INR',
      key: razorpayKeyId || '',
      amount: Math.round((amount || 0) * 100),
      name: 'Dream Mart',
      order_id: razorpayOrderId,
      prefill: {
        email: userProfile?.email || 'default@dreammart.com',
        contact: userProfile?.phone || '9999999999',
        name: userProfile?.name || 'Dream Mart User',
      },
      theme: { color: '#10b981' },
    };

    // Helper → query backend for current order status
    async function verifyOrderStatus(): Promise<VerifyStatusResponse> {
      try {
        const resp = await axios.get<VerifyStatusResponse>(
          `${EXPO_PUBLIC_BASE_URL}/ecart/user/payment/verifystatus/${encodeURIComponent(razorpayOrderId as string)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return resp.data;
      } catch (err) {
        console.warn('verifyOrderStatus failed', (err as any)?.message || err);
        return { success: false, decision: 'WAIT' };
      }
    }

    // Wrap Razorpay call and timers
    return new Promise<CreateIntentResult>(async (resolve) => {
      let finished = false;

      // 90s soft timeout to auto-check backend
      const mainTimer = setTimeout(async () => {
        if (finished) return;
        const r1 = await verifyOrderStatus();

        if (r1.decision === 'WAIT') {
          console.log('⏳ Payment pending. Waiting extra 30s grace...');
          setTimeout(async () => {
            if (finished) return;
            const r2 = await verifyOrderStatus();
            finished = true;
            resolve({
              success: r2.decision === 'SUCCESS',
              paymentIntentId,
              razorpay_order_id: razorpayOrderId,
              message:
                r2.decision === 'SUCCESS'
                  ? 'Payment captured (after grace)'
                  : r2.decision === 'WAIT'
                    ? 'Payment still pending'
                    : 'Payment failed/timeout',
            });
          }, 30_000);
        } else {
          finished = true;
          resolve({
            success: r1.decision === 'SUCCESS',
            paymentIntentId,
            razorpay_order_id: razorpayOrderId,
            message:
              r1.decision === 'SUCCESS'
                ? 'Payment captured'
                : 'Payment failed/timeout',
          });
        }
      }, 90_000);

      // 🪄 Open Razorpay SDK checkout
      try {
        const rzpResult = await RazorpayCheckout.open(options as any);
        clearTimeout(mainTimer);
        if (finished) return;

        finished = true;
        return resolve({
          success: true,
          paymentIntentId,
          razorpay_payment_id: (rzpResult as any).razorpay_payment_id,
          razorpay_order_id: (rzpResult as any).razorpay_order_id,
          razorpay_signature: (rzpResult as any).razorpay_signature,
        });
      } catch (err: any) {
        clearTimeout(mainTimer);
        if (finished) return;
        finished = true;

        const isCancel =
          err?.code === 2 ||
          (typeof err?.description === 'string' &&
            err.description.toLowerCase().includes('cancel'));

        if (isCancel) {
          // Notify backend immediately — mark failed
          try {
            await axios.post(
              `${EXPO_PUBLIC_BASE_URL}/ecart/user/payment/markfailed`,
              { paymentIntentId, reason: 'cancelled_by_user' },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (markErr) {
            console.warn('markFailed best-effort failed:', (markErr as any)?.message);
          }

          return resolve({
            success: false,
            paymentIntentId,
            message: 'Payment Cancelled',
          });
        }

        return resolve({
          success: false,
          paymentIntentId,
          message: err?.description || err?.message || 'Razorpay error',
        });
      }
    });
  }




  const handlePlaceOrder = async () => {
    if (!selectedSlug) {
      Alert.alert('Missing Info', 'Please select a delivery address.');
      return;
    }

    setLoading(true);
    try {
      // 💰 Wallet-only path
      if (currBal >= total && useWallet) {
        const token = await getToken();
        const res = await axios.post(
          `${EXPO_PUBLIC_BASE_URL}/ecart/user/order/placeorder/walletonly`,
          { deliverySlug: selectedSlug },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          refreshCart();
          router.replace('/private/success');
          return;
        } else {
          throw new Error(res.data.message || 'Wallet-only order failed');
        }
      }

      // 🧾 Razorpay payment
      const paymentResult = await createIntentAndPay(selectedSlug);

      if (paymentResult.walletOnly) {
        Alert.alert('Order placed', 'Order placed successfully using wallet only.');
        refreshCart();
        router.replace('/private/success');
        return;
      }

      if (!paymentResult.success) {
        Alert.alert('Payment Info', paymentResult.message || 'Payment cancelled or timed out.');
        refreshCart();
        return;
      }

      // ✅ Verify Razorpay payment on backend
      const token = await getToken();
      const verifyRes = await axios.post(
        `${EXPO_PUBLIC_BASE_URL}/ecart/user/payment/verifypayment`,
        {
          paymentIntentId: paymentResult.paymentIntentId,
          razorpay_payment_id: paymentResult.razorpay_payment_id,
          razorpay_order_id: paymentResult.razorpay_order_id,
          razorpay_signature: paymentResult.razorpay_signature,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (verifyRes.data?.success) {
        Alert.alert('✅ Payment Successful', 'Your order has been placed!');
        refreshCart();
        router.replace('/private/success');
      } else {
        Alert.alert(
          'Verification Pending',
          verifyRes.data?.message || 'Payment pending, please check Orders.'
        );
      }
    } catch (err: any) {
      console.error('Checkout error:', err?.response?.data || err?.message || err);
      Alert.alert('Payment Error', err?.response?.data?.message || err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };


  const toggleUseWallet = async () => {
    try {
      const token = await getToken();
      const res = await axios.patch(`${EXPO_PUBLIC_BASE_URL}/ecart/user/cart/usewallet`, { useWallet: !useWallet }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setUseWallet(res.data.data.useWallet);
    } catch (err: any) {
      console.error('toggleUseWallet error', err?.message || err);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.heading, { color: colors.text }]}>Checkout</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Shipping Address</Text>
        <Picker
          selectedValue={selectedSlug}
          onValueChange={setSelectedSlug}
          style={[styles.input, { color: colors.text, backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Picker.Item label="Select Address" value="" />
          {addresses?.map((a) => (
            <Picker.Item
              key={a.slugName}
              label={`${a.addressName}: ${a.street}, ${a.city} - ${a.pincode}`}
              value={a.slugName}
            />
          ))}
        </Picker>
        {addressText ? (
          <Text style={[styles.addressText, { color: colors.textSecondary }]}>{addressText}</Text>
        ) : null}
      </View>

      <View style={[useWalletStyles.wrapper, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
        <View style={useWalletStyles.container}>
          <Text style={[useWalletStyles.label, { color: colors.text }]}>Use Wallet Balance</Text>
          <Switch
            trackColor={{ false: colors.border, true: colors.success }}
            thumbColor={useWallet ? '#fff' : colors.card}
            onValueChange={toggleUseWallet}
            value={useWallet}
          />
        </View>
        <Text style={[useWalletStyles.description, { color: colors.textSecondary }]}>
          Available: <Ionicons name="wallet" size={16} color={colors.success} /> ₹{currBal.toFixed(2)}
        </Text>
      </View>

      <View style={[styles.summary, { borderColor: colors.border }]}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Order Summary</Text>
        {cart?.map((item, idx) => (
          <View key={`${item.productId._id}-${idx}`} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.text }]}>
                {item.productId.title} × {item.quantity}
              </Text>
              {item.selectedVariation && item.selectedVariation.length > 0 && (
                <Text style={[styles.variationText, { color: colors.textMuted }]}>
                  {item.selectedVariation.map((v: any) => `${v.name}: ${v.value}`).join(' · ')}
                </Text>
              )}
            </View>
          </View>
        ))}

        <View style={styles.row}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Amount:</Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>₹{total.toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>
            GST {total ? Math.round((totalGstAmount / total) * 100) : 0}%:
          </Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>₹{(totalGstAmount || 0).toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Delivery:</Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>₹{(deliveryCharge || 0).toFixed(2)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total:</Text>
          <Text style={[styles.totalValue, { color: colors.primary }]}>
            ₹{(total + (totalGstAmount || 0) + (deliveryCharge || 0)).toFixed(2)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.placeButton, { backgroundColor: colors.success }, loading && { opacity: 0.7 }]}
        onPress={handlePlaceOrder}
        disabled={loading}
        activeOpacity={0.9}
      >
        {loading ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.placeText}>Processing Payment...</Text>
          </View>
        ) : (
          <Text style={styles.placeText}>Place Order</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: { padding: 16, flexGrow: 1, paddingBottom: 40 },
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 20, marginTop: 30 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14 },
  summary: { borderTopWidth: 1, paddingTop: 20, marginTop: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  name: { fontSize: 14 },
  variationText: { fontSize: 11, marginTop: 2 },
  addressText: { marginTop: 10 },
  totalLabel: { fontSize: 15, fontWeight: '600' },
  totalValue: { fontSize: 15, fontWeight: '700' },
  placeButton: {
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeText: { color: '#fff', fontWeight: '700', fontSize: 16, textAlign: 'center' },
});

const useWalletStyles = StyleSheet.create({
  wrapper: { marginHorizontal: 16, marginBottom: 20, borderRadius: 14, padding: 18, borderWidth: 1 },
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 16, fontWeight: '600' },
  description: { marginTop: 10, fontSize: 14 },
});