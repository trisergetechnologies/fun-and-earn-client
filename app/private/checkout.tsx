// import { useAuth } from '@/components/AuthContext';
// import { Picker } from '@react-native-picker/picker';
// import { useRouter } from 'expo-router';
// import { useCallback, useEffect, useState } from 'react';
// import {
//   Alert,
//   ScrollView,
//   StyleSheet,
//   Switch,
//   Text,
//   TouchableOpacity,
//   View
// } from 'react-native';
// import { useCart } from '../../components/CartContext';
// import { getToken } from '@/helpers/authStorage';
// import axios from 'axios';
// import { Ionicons } from '@expo/vector-icons';
// import { useFocusEffect } from '@react-navigation/native';

// import * as WebBrowser from 'expo-web-browser';
// import * as Linking from 'expo-linking';

// const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

// const PaymentGateway = async () => {
//   return {status: 'success'}
// };

// const Payment = async (deliverySlug: string) => {
//   const token = await getToken();

//   // Step 1: Create Razorpay order intent from backend
//   const createIntentUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/order/createorderintent`;

//   const { data } = await axios.post(createIntentUrl, {
//     deliverySlug,
//     useWallet: true // or pass useWallet state
//   }, {
//     headers: { Authorization: `Bearer ${token}` }
//   });

//   if (!data.success) {
//     throw new Error(data.message || 'Failed to create payment intent');
//   }

//   const {
//     razorpayKeyId,
//     razorpayOrderId,
//     paymentIntentId,
//     amount,
//     currency
//   } = data.data;

//   // Step 2: Construct Razorpay Checkout URL
//   const redirectUrl = Linking.createURL(`/private/success?intent=${paymentIntentId}`);
//   const checkoutUrl = `https://api.razorpay.com/v1/checkout/embedded?key_id=${razorpayKeyId}&order_id=${razorpayOrderId}&amount=${amount * 100}&currency=${currency}&callback_url=${encodeURIComponent(redirectUrl)}`;

//   // Step 3: Open Razorpay hosted checkout
//   const result = await WebBrowser.openBrowserAsync(checkoutUrl, {
//     enableBarCollapsing: true,
//     dismissButtonStyle: "close",
//   });

//   if (result.type === "cancel") {
//     return { success: false, paymentId: null };
//   }

//   // Razorpay redirects to your app via deep link
//   return { success: true, paymentId: razorpayOrderId };
// };

// interface Address {
//   addressName: string;
//   slugName: string;
//   fullName: string;
//   street: string;
//   city: string;
//   state: string;
//   pincode: string;
//   phone: string;
//   isDefault: boolean;
// }

// const CheckoutScreen = () => {
 
//   const { cart, refreshCart, totalGstAmount } = useCart();
//   const router = useRouter();

//   const [address, setAddress] = useState('');
//   const [upiId, setUpiId] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [currBal, setCurrBal] = useState(0);
//   const [useWallet, setUseWallet] = useState<boolean>(false);
//   const [addresses, setAddresses] = useState<Address[] | null>([]);


//   const fetchAddresses = async () => {
//     const token = await getToken();
//     const fetchUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/address/addresses`;
//     try {
//       const response = await axios.get(fetchUrl, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       if (response.data.success) {
//         setAddresses(response.data.data);
//       }
//     } catch (error: any) {
//       console.error('Failed to fetch addresses:', error.response?.data || error.message);
//       throw new Error(error.response?.data?.message || 'Failed to fetch addresses');
//     }
//   };


//   const getWallet = async () => {
//     const token = await getToken();
//     const getWalletUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/wallet/getwallet`;
//     try {
//       const response = await axios.get(getWalletUrl, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       if (response.data.success) {
//         setCurrBal(response.data.data.eCartWallet);
//       }
//     } catch (error: any) {
//       console.error('Failed to fetch Wallet:', error.response?.data || error.message);
//       throw new Error(error.response?.data?.message || 'Failed to fetch Wallet');
//     }
//   };



//   const [selectedSlug, setSelectedSlug] = useState('');

//   const handleSelectAddress = (slug: any) => {
//     setSelectedSlug(slug);
//     console.log(selectedSlug)
//     const selected = addresses?.find(addr => addr.slugName === slug);
//     if (selected) {
//       // Create a single string from all fields
//       const fullAddress = `${selected.fullName}, ${selected.street}, ${selected.city}, ${selected.state} - ${selected.pincode}, Phone: ${selected.phone}`;
//       setAddress(fullAddress);
//     } else {
//       setAddress('');
//     }
//   };

//   const total = cart.reduce((sum, item) => sum + item.productId.finalPrice * item.quantity, 0);

//   const handlePlaceOrder = async () => {
//     if (!address.trim()) {
//       Alert.alert('Missing Info', 'Please Select address.');
//       return;
//     }
//     setLoading(true);

//     if (currBal >= total && useWallet === true) {
//       const token = await getToken();
//       const placeWalletOnlyOrderUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/order/placeorder/walletonly`;
//       try {
//         const response = await axios.post(placeWalletOnlyOrderUrl, {
//           deliverySlug: selectedSlug
//         }, {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         });
//         if (response.data.success) {
//           setLoading(false);
//           refreshCart();
//           router.replace('/private/success');
//         }
//       } catch (error: any) {
//         setLoading(false);
//         console.log(error);
//         console.error('Failed to Place Order Wallet Only:', error.response?.data || error.message);
//         throw new Error(error.response?.data?.message || 'Failed to fetch Wallet');
//       }
//     }
//     else {
//       const payRes = await Payment(selectedSlug);
//       if (payRes.success) {
//         const token = await getToken();
//         const placeOrderUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/order/placeorder`;
//         try {
//           const response = await axios.post(placeOrderUrl, {
//             paymentId: payRes.paymentId,
//             deliverySlug: selectedSlug
//           }, {
//             headers: {
//               Authorization: `Bearer ${token}`
//             }
//           });
//           if (response.data.success) {
//             setLoading(false);
//             refreshCart();
//             router.push('/private/success');
//           }
//           setLoading(false);
//         } catch (error: any) {
//           setLoading(false);
//           console.error('Failed to fetch Wallet:', error.response?.data || error.message);
//           throw new Error(error.response?.data?.message || 'Failed to fetch Wallet');
//         }
//       }
//     setLoading(false);
//     }
//     setLoading(false);
//   };

//   const fetchCart = async () => {
//     const url = `${EXPO_PUBLIC_BASE_URL}/ecart/user/cart/getcart`
//     const token = await getToken();

//     try {
//       const res = await axios.get(url, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       if (res.data.success) {
//         console.log("cart from checkout page", res.data.data);
//         setUseWallet(res.data.data.useWallet);
//       }
//     } catch (err) {
//       console.error('Failed to fetch cart:', err);
//     }
//   };


// useFocusEffect(
//   useCallback(() => {
//     fetchAddresses();
//     getWallet();
//     fetchCart();
//     console.log("cart from ling", cart)
//   }, [])
// );


//   const toggleUseWallet = async() => {
//     const token = await getToken();
//     const useWalletUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/cart/usewallet`;
//     try {
//       const response = await axios.patch(useWalletUrl, { useWallet: !useWallet } ,{
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       });
//       if (response.data.success) {
//         setUseWallet(response.data.data.useWallet);
//       }
//     } catch (error: any) {
//       console.error('Failed to fetch Wallet:', error.response?.data || error.message);
//       throw new Error(error.response?.data?.message || 'Failed to fetch Wallet');
//     }
//   };

//   return (

//     <ScrollView contentContainerStyle={styles.container}>
//       <Text style={styles.heading}>Checkout</Text>

//       <View style={styles.section}>
//         <Text style={styles.sectionLabel}>Shipping Address</Text>

//         <Picker
//           selectedValue={selectedSlug}
//           onValueChange={handleSelectAddress}
//           style={styles.input}
//         >
//           <Picker.Item label="Select Address" value="" />
//           {addresses?.map(addr => (
//             <Picker.Item
//               key={addr.slugName}
//               label={`${addr.addressName}: ${addr.street}, ${addr.city} - ${addr.pincode}`}
//               value={addr.slugName}
//             />
//           ))}
//         </Picker>
//       </View>


//       {/* Use Wallet Component */}
//       <View style={useWalletStyles.wrapper}>
//         <View style={useWalletStyles.container}>
//           <Text style={useWalletStyles.label}>Use Wallet Balance</Text>
//           <Switch
//             trackColor={{ false: '#ccc', true: '#4CAF50' }}
//             thumbColor={useWallet ? '#fff' : '#f4f3f4'}
//             ios_backgroundColor="#ccc"
//             onValueChange={toggleUseWallet}
//             value={useWallet}
//           />
//         </View>
//         <Text style={useWalletStyles.description}>
//           Available Balance:  <Ionicons name="ribbon" size={16} color="#10b981" /> {currBal.toFixed(2)}
//         </Text>
//       </View>

//       <View style={styles.summary}>
//         <Text style={styles.sectionLabel}>Order Summary</Text>
//         {cart?.map((item) => (
//           <View key={item.productId._id} style={styles.row}>
//             <Text style={styles.name}>
//               {item.productId.title} × {item.quantity}
//             </Text>
//             {/* <Text style={styles.price}>₹{(item.price * item.qty).toFixed(2)}</Text> */}
//           </View>
//         ))}
//         {/* 🔹 Amount */}
//         <View style={styles.row}>
//           <Text style={styles.totalLabel}>Amount:</Text>
//           <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
//         </View>

//         {/* 🔹 GST */}
//         <View style={styles.row}>
//           <Text style={styles.totalLabel}>GST {Math.round((totalGstAmount / total) * 100)}%:</Text>
//           <Text style={styles.totalValue}>₹{totalGstAmount?.toFixed(2)}</Text>
//         </View>

//         {/* 🔹 Final Total */}
//         <View style={styles.row}>
//           <Text style={styles.totalLabel}>Total:</Text>
//           <Text style={styles.totalValue}>₹{(total + totalGstAmount)?.toFixed(2)}</Text>
//         </View>
//       </View>

//       <TouchableOpacity
//         style={[styles.placeButton, loading && { opacity: 0.6 }]}
//         onPress={handlePlaceOrder}
//         disabled={loading}
//       >
//         <Text style={styles.placeText}>
//           {loading ? 'Processing Payment...' : 'Place Order'}
//         </Text>
//       </TouchableOpacity>
//     </ScrollView>
//   );
// };

// export default CheckoutScreen;

// const styles = StyleSheet.create({
//   container: {
//     padding: 16,
//     backgroundColor: '#fff',
//     flexGrow: 1,
//   },
//   heading: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     marginTop: 30,
//   },
//   section: {
//     marginBottom: 20,
//   },
//   sectionLabel: {
//     fontSize: 15,
//     fontWeight: '600',
//     marginBottom: 8,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 6,
//     padding: 12,
//     backgroundColor: '#f9f9f9',
//     fontSize: 14,
//   },
//   summary: {
//     borderTopWidth: 1,
//     borderColor: '#ddd',
//     paddingTop: 16,
//     marginTop: 10,
//   },
//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   rowanother: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginVertical: 4,
//   },
//   name: {
//     fontSize: 14,
//   },
//   price: {
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   totalLabel: {
//     fontSize: 15,
//     fontWeight: 'bold',
//   },
//   totalValue: {
//     fontSize: 15,
//     fontWeight: 'bold',
//     color: '#3b82f6',
//   },
//   placeButton: {
//     marginTop: 24,
//     backgroundColor: '#10b981',
//     paddingVertical: 14,
//     borderRadius: 6,
//   },
//   placeText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 16,
//     textAlign: 'center',
//   },
// });

// const useWalletStyles = StyleSheet.create({
//   wrapper: {
//     margin: 20,
//     backgroundColor: '#f9f9f9',
//     borderRadius: 12,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 6,
//     elevation: 3,
//   },
//   container: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   label: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#333',
//   },
//   description: {
//     marginTop: 8,
//     fontSize: 14,
//     color: '#666',
//   },
// });



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
  ActivityIndicator
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
  const { cart, refreshCart, totalGstAmount } = useCart();
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
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
    } catch (err) {
      console.error('toggleUseWallet error', err?.message || err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Checkout</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Shipping Address</Text>
        <Picker selectedValue={selectedSlug} onValueChange={setSelectedSlug} style={styles.input}>
          <Picker.Item label="Select Address" value="" />
          {addresses?.map(a => (
            <Picker.Item key={a.slugName} label={`${a.addressName}: ${a.street}, ${a.city} - ${a.pincode}`} value={a.slugName} />
          ))}
        </Picker>
        {addressText ? <Text style={{ marginTop: 8, color: '#444' }}>{addressText}</Text> : null}
      </View>

      <View style={useWalletStyles.wrapper}>
        <View style={useWalletStyles.container}>
          <Text style={useWalletStyles.label}>Use Wallet Balance</Text>
          <Switch trackColor={{ false: '#ccc', true: '#10b981' }} thumbColor={useWallet ? '#fff' : '#f4f3f4'} onValueChange={toggleUseWallet} value={useWallet} />
        </View>
        <Text style={useWalletStyles.description}>
          Available Balance: <Ionicons name="ribbon" size={16} color="#10b981" /> {currBal.toFixed(2)}
        </Text>
      </View>

      <View style={styles.summary}>
        <Text style={styles.sectionLabel}>Order Summary</Text>
        {cart?.map(item => (
          <View key={item.productId._id} style={styles.row}>
            <Text style={styles.name}>{item.productId.title} × {item.quantity}</Text>
          </View>
        ))}

        <View style={styles.row}>
          <Text style={styles.totalLabel}>Amount:</Text>
          <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.totalLabel}>GST {total ? Math.round((totalGstAmount / total) * 100) : 0}%:</Text>
          <Text style={styles.totalValue}>₹{(totalGstAmount || 0).toFixed(2)}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>₹{(total + (totalGstAmount || 0)).toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.placeButton, loading && { opacity: 0.7 }]} onPress={handlePlaceOrder} disabled={loading}>
        {loading ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.placeText}>Processing Payment... Please wait</Text>
          </View>
        ) : (
          <Text style={styles.placeText}>Place Order</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CheckoutScreen;

// keep your styles same as before (slightly improved)
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', flexGrow: 1 },
  heading: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, marginTop: 30 },
  section: { marginBottom: 20 },
  sectionLabel: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, backgroundColor: '#f9f9f9' },
  summary: { borderTopWidth: 1, borderColor: '#ddd', paddingTop: 16, marginTop: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  name: { fontSize: 14 },
  totalLabel: { fontSize: 15, fontWeight: 'bold' },
  totalValue: { fontSize: 15, fontWeight: 'bold', color: '#3b82f6' },
  placeButton: { marginTop: 24, backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 6 },
  placeText: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' },
});

const useWalletStyles = StyleSheet.create({
  wrapper: { margin: 20, backgroundColor: '#f9f9f9', borderRadius: 12, padding: 16, elevation: 3 },
  container: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 18, fontWeight: '600', color: '#333' },
  description: { marginTop: 8, fontSize: 14, color: '#666' },
});