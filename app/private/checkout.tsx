import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import RazorpayCheckout from 'react-native-razorpay';
import {
  Alert,
  AppState,
  AppStateStatus,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useCart } from '../../components/CartContext';
import { getToken } from '@/helpers/authStorage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import uuid from 'react-native-uuid';
import { useProfile } from '@/components/ProfileContext';
import { useTheme } from '@/components/ThemeContext';
import { Screen } from '@/components/Screen';
import { Button, EmptyState } from '@/components/ui';
import { CheckoutAddressPicker } from '@/components/checkout/CheckoutAddressPicker';
import { CheckoutOrderSummary } from '@/components/checkout/CheckoutOrderSummary';
import { CheckoutWalletToggle } from '@/components/checkout/CheckoutWalletToggle';
import { borderRadius, spacing, typography } from '@/constants/DesignSystem';
import { Address } from '@/types/address';
import { getCartSubtotal, getEstimatedTotal } from '@/utils/cartLabels';
import { formatDreamCash } from '@/utils/walletFormat';
import Toast from 'react-native-toast-message';

const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';
const PAYMENT_GATEWAY = (process.env.EXPO_PUBLIC_PAYMENT_GATEWAY || 'razorpay').toLowerCase();

function logCcavenue(step: string, payload?: Record<string, unknown>) {
  const msg = payload ? `${step} ${JSON.stringify(payload)}` : step;
  console.log(`[CCAvenue Checkout] ${msg}`);
}

type VerifyStatusDecision = 'WAIT' | 'SUCCESS' | 'FAIL';

interface VerifyStatusResponse {
  success: boolean;
  decision: VerifyStatusDecision;
  reason?: string;
  orderStatus?: string;
}

type PaymentDecision = 'WAIT' | 'SUCCESS' | 'FAIL';

interface CcavenueVerifyResponse {
  success: boolean;
  decision: PaymentDecision;
  status?: string;
  orderId?: string;
  message?: string;
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

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [currBal, setCurrBal] = useState(0);
  const [useWallet, setUseWallet] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [walletToggling, setWalletToggling] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const { userProfile } = useProfile();

  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingAttemptsRef = useRef(0);
  const activePaymentIntentIdRef = useRef<string | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const hasLoadedOnceRef = useRef(false);

  const fetchAddresses = useCallback(async () => {
    const token = await getToken();
    const res = await axios.get(`${EXPO_PUBLIC_BASE_URL}/ecart/user/address/addresses`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.data.success) {
      const data: Address[] = res.data.data ?? [];
      setAddresses(data);
      setSelectedSlug((prev) => {
        if (prev && data.some((a) => a.slugName === prev)) return prev;
        const defaultAddress = data.find((a) => a.isDefault) ?? data[0];
        return defaultAddress?.slugName ?? '';
      });
    }
  }, []);

  const getWallet = useCallback(async () => {
    const token = await getToken();
    const res = await axios.get(`${EXPO_PUBLIC_BASE_URL}/ecart/user/wallet/getwallet`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.data.success) setCurrBal(res.data.data.eCartWallet);
  }, []);

  const fetchCartPrefs = useCallback(async () => {
    const token = await getToken();
    const res = await axios.get(`${EXPO_PUBLIC_BASE_URL}/ecart/user/cart/getcart`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.data.success) setUseWallet(res.data.data.useWallet);
  }, []);

  const loadCheckoutData = useCallback(async () => {
    await Promise.all([fetchAddresses(), getWallet(), fetchCartPrefs(), refreshCart()]);
  }, [fetchAddresses, getWallet, fetchCartPrefs, refreshCart]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const showInitialLoader = !hasLoadedOnceRef.current && cart.length === 0;

      (async () => {
        if (showInitialLoader) setPageLoading(true);
        try {
          await loadCheckoutData();
          if (active) {
            hasLoadedOnceRef.current = true;
            setInitialLoadDone(true);
          }
        } catch {
          if (active && showInitialLoader) {
            Toast.show({ type: 'error', text1: 'Could not load checkout', text2: 'Please try again.' });
          }
        } finally {
          if (active && showInitialLoader) setPageLoading(false);
        }
      })();

      return () => {
        active = false;
        stopPolling();
      };
    }, [loadCheckoutData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadCheckoutData();
    } catch {
      Toast.show({ type: 'error', text1: 'Could not refresh checkout' });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (activePaymentIntentIdRef.current) {
          checkCcavenuePaymentStatus(activePaymentIntentIdRef.current);
        }
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, []);

  const subtotal = getCartSubtotal(cart);
  const estimatedTotal = getEstimatedTotal(subtotal, totalGstAmount, deliveryCharge);
  const total = subtotal;

  function stopPolling() {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    pollingAttemptsRef.current = 0;
  }

  async function verifyCcavenuePayment(paymentIntentId: string): Promise<CcavenueVerifyResponse | null> {
    const token = await getToken();
    const url = `${EXPO_PUBLIC_BASE_URL}/ecart/user/payment/ccavenue/verify/${paymentIntentId}`;
    logCcavenue('verify_request', { paymentIntentId, url });
    try {
      const res = await axios.get<CcavenueVerifyResponse>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      logCcavenue('verify_response', {
        paymentIntentId,
        decision: res.data?.decision,
        status: res.data?.status,
        message: res.data?.message,
      });
      return res.data;
    } catch (err: any) {
      logCcavenue('verify_error', {
        paymentIntentId,
        error: err?.response?.data || err?.message,
      });
      return null;
    }
  }

  function handleCcavenueVerifyResult(result: CcavenueVerifyResponse) {
    logCcavenue('verify_handle', { decision: result.decision, message: result.message });

    if (result.decision === 'SUCCESS') {
      stopPolling();
      activePaymentIntentIdRef.current = null;
      setPaymentStatus('');
      setLoading(false);
      Alert.alert('Payment Successful', 'Your order has been placed!', [
        {
          text: 'OK',
          onPress: () => {
            refreshCart();
            router.replace('/private/success');
          },
        },
      ]);
      return;
    }

    if (result.decision === 'FAIL') {
      stopPolling();
      activePaymentIntentIdRef.current = null;
      setPaymentStatus('');
      setLoading(false);
      Alert.alert('Payment Failed', result.message || 'Payment was unsuccessful. Please try again.', [
        { text: 'OK', onPress: () => router.replace('/orders') },
      ]);
    }
  }

  async function markCcavenuePaymentFailed(paymentIntentId: string, reason: string) {
    const token = await getToken();
    logCcavenue('markfailed_request', { paymentIntentId, reason });
    try {
      const res = await axios.post(
        `${EXPO_PUBLIC_BASE_URL}/ecart/user/payment/markfailed`,
        { paymentIntentId, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      logCcavenue('markfailed_response', {
        paymentIntentId,
        success: res.data?.success,
        status: res.data?.status,
        message: res.data?.message,
      });
      return res.data;
    } catch (err: any) {
      logCcavenue('markfailed_error', {
        paymentIntentId,
        error: err?.response?.data || err?.message,
      });
      return null;
    }
  }

  function sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  async function abandonCcavenueIfStillPending(paymentIntentId: string, reason: string) {
    setPaymentStatus('Cancelling unpaid order...');
    // Short grace so a late CCAvenue callback can land before we refund
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      setPaymentStatus(`Confirming payment status… (${attempt}/3)`);
      await sleep(4000);
      const result = await verifyCcavenuePayment(paymentIntentId);
      if (result?.decision === 'SUCCESS' || result?.decision === 'FAIL') {
        handleCcavenueVerifyResult(result);
        return;
      }
    }

    await markCcavenuePaymentFailed(paymentIntentId, reason);
    stopPolling();
    activePaymentIntentIdRef.current = null;
    setPaymentStatus('');
    setLoading(false);
    Alert.alert(
      'Payment Cancelled',
      'Payment was not completed. Any wallet amount used for this order has been refunded.',
      [{ text: 'OK' }]
    );
  }

  async function checkCcavenuePaymentStatus(paymentIntentId: string) {
    setPaymentStatus('Checking payment status...');
    logCcavenue('check_status_start', { paymentIntentId });

    const result = await verifyCcavenuePayment(paymentIntentId);

    if (!result) {
      logCcavenue('check_status_null_response', { paymentIntentId });
      startCcavenuePolling(paymentIntentId);
      return;
    }

    if (result.decision === 'WAIT') {
      logCcavenue('check_status_wait_start_polling', {
        paymentIntentId,
        hint: 'Callback not processed yet — CCAvenue should POST to /public/ccavenue/callback',
      });
      startCcavenuePolling(paymentIntentId);
      return;
    }

    handleCcavenueVerifyResult(result);
  }

  function startCcavenuePolling(paymentIntentId: string) {
    stopPolling();
    pollingAttemptsRef.current = 0;
    activePaymentIntentIdRef.current = paymentIntentId;
    setPaymentStatus('Verifying payment...');
    logCcavenue('polling_start', { paymentIntentId, intervalSec: 6, maxAttempts: 20 });

    pollingIntervalRef.current = setInterval(async () => {
      pollingAttemptsRef.current += 1;
      logCcavenue('polling_tick', {
        paymentIntentId,
        attempt: pollingAttemptsRef.current,
      });
      const result = await verifyCcavenuePayment(paymentIntentId);

      if (!result) {
        if (pollingAttemptsRef.current >= 20) {
          stopPolling();
          await abandonCcavenueIfStillPending(paymentIntentId, 'verification_timeout');
        }
        return;
      }

      if (result.decision === 'SUCCESS' || result.decision === 'FAIL') {
        handleCcavenueVerifyResult(result);
        return;
      }

      setPaymentStatus(`Verifying payment... (${pollingAttemptsRef.current}/20)`);
      if (pollingAttemptsRef.current >= 20) {
        stopPolling();
        await abandonCcavenueIfStillPending(paymentIntentId, 'verification_timeout');
      }
    }, 6000);
  }

  async function createIntentAndPayCcavenue(deliverySlug: string) {
    logCcavenue('flow_start', {
      apiBase: EXPO_PUBLIC_BASE_URL,
      gateway: PAYMENT_GATEWAY,
      deliverySlug,
    });

    const token = await getToken();
    const idempotencyKey = `${Date.now()}-${uuid.v4()}`;
    const res = await axios.post(
      `${EXPO_PUBLIC_BASE_URL}/ecart/user/order/createorderintent`,
      { deliverySlug, useWallet, idempotencyKey, paymentGateway: PAYMENT_GATEWAY },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || 'Failed to create payment intent');
    }

    const { paymentIntentId, paymentPageUrl, amount, ccavenueOrderId } = res.data.data as {
      paymentIntentId: string;
      paymentPageUrl?: string;
      amount?: number;
      ccavenueOrderId?: string;
    };

    logCcavenue('intent_created', {
      paymentIntentId,
      ccavenueOrderId,
      amount,
      paymentPageHost: paymentPageUrl?.split('/')[2],
    });

    if (!amount || amount <= 0) {
      Alert.alert('Order placed', 'Order placed successfully using wallet only.');
      refreshCart();
      router.replace('/private/success');
      return;
    }

    if (!paymentPageUrl) {
      throw new Error('Payment page URL missing from server');
    }

    setPaymentStatus('Opening payment page...');
    activePaymentIntentIdRef.current = paymentIntentId;

    const browserResult = await WebBrowser.openBrowserAsync(paymentPageUrl, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      controlsColor: '#10b981',
    });

    const userDismissed = browserResult.type === 'cancel' || browserResult.type === 'dismiss';

    logCcavenue('browser_closed', {
      paymentIntentId,
      browserType: browserResult.type,
      userDismissed,
      hint: 'If dismissed while still pending, markfailed will refund wallet holds',
    });

    const immediate = await verifyCcavenuePayment(paymentIntentId);
    if (immediate?.decision === 'SUCCESS' || immediate?.decision === 'FAIL') {
      handleCcavenueVerifyResult(immediate);
      return;
    }

    if (userDismissed) {
      await abandonCcavenueIfStillPending(paymentIntentId, 'cancelled_by_user');
      return;
    }

    await checkCcavenuePaymentStatus(paymentIntentId);
  }

  async function createIntentAndPay(deliverySlug: string): Promise<CreateIntentResult> {
    const token = await getToken();
    const idempotencyKey = `${Date.now()}-${uuid.v4()}`;
    const url = `${EXPO_PUBLIC_BASE_URL}/ecart/user/order/createorderintent`;
    const payload = { deliverySlug, useWallet, idempotencyKey, paymentGateway: PAYMENT_GATEWAY };

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

      // Gateway payment
      if (PAYMENT_GATEWAY === 'ccavenue') {
        setPaymentStatus('Creating order...');
        await createIntentAndPayCcavenue(selectedSlug);
        return;
      }

      // Razorpay payment
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
      stopPolling();
      activePaymentIntentIdRef.current = null;
      setPaymentStatus('');
      console.error('Checkout error:', err?.response?.data || err?.message || err);
      Alert.alert('Payment Error', err?.response?.data?.message || err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };


  const toggleUseWallet = async () => {
    setWalletToggling(true);
    try {
      const token = await getToken();
      const res = await axios.patch(
        `${EXPO_PUBLIC_BASE_URL}/ecart/user/cart/usewallet`,
        { useWallet: !useWallet },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setUseWallet(res.data.data.useWallet);
      } else {
        Toast.show({ type: 'error', text1: 'Could not update wallet', text2: res.data.message });
      }
    } catch (err: any) {
      console.error('toggleUseWallet error', err?.message || err);
      Toast.show({ type: 'error', text1: 'Could not update wallet', text2: 'Please try again.' });
    } finally {
      setWalletToggling(false);
    }
  };

  if (pageLoading && cart.length === 0) {
    return (
      <Screen>
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (cart.length === 0 && initialLoadDone) {
    return (
      <Screen>
        <EmptyState
          icon="cart-outline"
          title="Your cart is empty"
          subtitle="Add items before checking out."
          action={
            <Button title="Back to cart" onPress={() => router.replace('/tabs/cart')} variant="primary" />
          }
        />
      </Screen>
    );
  }

  const canPlaceOrder = Boolean(selectedSlug) && !loading;

  return (
    <Screen style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.headerBlock}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Checkout</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
            Confirm address and payment
          </Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>DELIVERY ADDRESS</Text>
        <CheckoutAddressPicker
          addresses={addresses}
          selectedSlug={selectedSlug}
          onSelect={setSelectedSlug}
          onManagePress={() => router.push('/private/Address')}
        />

        <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: spacing.md }]}>
          WALLET
        </Text>
        <CheckoutWalletToggle
          balance={currBal}
          useWallet={useWallet}
          toggling={walletToggling}
          onToggle={toggleUseWallet}
          estimatedTotal={estimatedTotal}
        />

        <Text style={[styles.sectionLabel, { color: colors.textMuted, marginTop: spacing.md }]}>
          ORDER SUMMARY
        </Text>
        <CheckoutOrderSummary
          cart={cart}
          gstAmount={totalGstAmount}
          deliveryCharge={deliveryCharge}
        />

        {paymentStatus ? (
          <View
            style={[
              styles.statusContainer,
              { backgroundColor: colors.primaryTint, borderColor: colors.borderLight },
            ]}
          >
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.primary }]}>{paymentStatus}</Text>
          </View>
        ) : null}

        {PAYMENT_GATEWAY === 'ccavenue' ? (
          <View style={styles.infoContainer}>
            <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>Secured by CCAvenue</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { borderTopColor: colors.borderLight, backgroundColor: colors.background }]}>
        <View style={styles.footerTotalRow}>
          <Text style={[styles.footerTotalLabel, { color: colors.textSecondary }]}>Estimated total</Text>
          <Text style={[styles.footerTotalValue, { color: colors.primary }]}>
            {formatDreamCash(estimatedTotal)}
          </Text>
        </View>
        <Button
          title={loading ? 'Processing payment…' : 'Place order'}
          onPress={handlePlaceOrder}
          variant="primary"
          fullWidth
          loading={loading}
          disabled={!canPlaceOrder}
          leftIcon={!loading ? <Ionicons name="lock-closed" size={18} /> : undefined}
        />
      </View>
    </Screen>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centerLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  headerBlock: {
    marginBottom: spacing.lg,
  },
  pageTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: -0.5,
    marginBottom: spacing.xxs,
  },
  pageSubtitle: {
    fontSize: typography.fontSize.base,
  },
  sectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
    marginLeft: spacing.xxs,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  statusText: {
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    flex: 1,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  infoText: {
    marginLeft: spacing.xxs,
    fontSize: typography.fontSize.sm,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  footerTotalLabel: {
    fontSize: typography.fontSize.sm,
  },
  footerTotalValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
});