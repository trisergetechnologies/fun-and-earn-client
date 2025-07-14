import { useAuth } from '@/components/AuthContext';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useCart } from '.././components/CartContext';
import { getToken } from '@/helpers/authStorage';
import Constants from 'expo-constants';
import axios from 'axios';
const { BASE_URL } = Constants.expoConfig?.extra || {};

const PaymentGateway = async () => {
  return {status: 'success'}
};

const Payment = async () => {
  const paymentResult = await PaymentGateway();

  if (paymentResult.status === 'success') {
    const random11Digit = () => Math.floor(1e10 + Math.random() * 9e10);
    return { success: true, paymentId: random11Digit() };
  } else {
    return { success: false, paymentId: null }
  }
}

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

const CheckoutScreen = () => {
  const { cart, refreshCart } = useCart();
  const router = useRouter();

  const [address, setAddress] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);
  const [currBal, setCurrBal] = useState(0);
  const [useWallet, setUseWallet] = useState<boolean>(false);
  const [addresses, setAddresses] = useState<Address[] | null>([]);


  const fetchAddresses = async () => {
    const token = await getToken();
    const fetchUrl = `${BASE_URL}/ecart/user/address/addresses`;
    try {
      const response = await axios.get(fetchUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setAddresses(response.data.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch addresses:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch addresses');
    }
  };


  const getWallet = async () => {
    const token = await getToken();
    const getWalletUrl = `${BASE_URL}/ecart/user/wallet/getwallet`;
    try {
      const response = await axios.get(getWalletUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setCurrBal(response.data.data.eCartWallet);
      }
    } catch (error: any) {
      console.error('Failed to fetch Wallet:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch Wallet');
    }
  };



  const [selectedSlug, setSelectedSlug] = useState('');

  const handleSelectAddress = (slug: any) => {
    setSelectedSlug(slug);
    console.log(selectedSlug)
    const selected = addresses?.find(addr => addr.slugName === slug);
    if (selected) {
      // Create a single string from all fields
      const fullAddress = `${selected.fullName}, ${selected.street}, ${selected.city}, ${selected.state} - ${selected.pincode}, Phone: ${selected.phone}`;
      setAddress(fullAddress);
    } else {
      setAddress('');
    }
  };

  const total = cart.reduce((sum, item) => sum + item.productId.finalPrice * item.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      Alert.alert('Missing Info', 'Please Select address.');
      return;
    }
    setLoading(true);

    if (currBal >= total && useWallet === true) {
      const token = await getToken();
      const placeWalletOnlyOrderUrl = `${BASE_URL}/ecart/user/placeorder/walletonly`;
      try {
        const response = await axios.post(placeWalletOnlyOrderUrl, {
          deliverySlug: selectedSlug
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data.success) {
          setLoading(false);
          refreshCart();
          router.replace('/success');
        }
      } catch (error: any) {
        setLoading(false);
        console.error('Failed to fetch Wallet:', error.response?.data || error.message);
        throw new Error(error.response?.data?.message || 'Failed to fetch Wallet');
      }
    }
    else {
      const payRes = await Payment();
      if (payRes.success) {
        const token = await getToken();
        const placeOrderUrl = `${BASE_URL}/ecart/user/order/placeorder`;
        try {
          const response = await axios.post(placeOrderUrl, {
            paymentId: payRes.paymentId,
            deliverySlug: selectedSlug
          }, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (response.data.success) {
            setLoading(false);
            refreshCart();
            router.replace('/success');
          }
          setLoading(false);
        } catch (error: any) {
          setLoading(false);
          console.error('Failed to fetch Wallet:', error.response?.data || error.message);
          throw new Error(error.response?.data?.message || 'Failed to fetch Wallet');
        }
      }
    setLoading(false);
    }
    setLoading(false);
  };

  const fetchCart = async () => {
    const url = `${BASE_URL}/ecart/user/cart/getcart`
    const token = await getToken();

    try {
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data.success) {
        console.log("cart from checkout page", res.data.data.useWallet);
        setUseWallet(res.data.data.useWallet);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  };

  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    console.log("is auth from index", isAuthenticated)
    if (isAuthenticated === false) {
      router.replace('/signin');
    }
    else {
      fetchAddresses();
      getWallet();
      fetchCart();
    }
  }, [isAuthenticated]);


  const toggleUseWallet = async() => {
    const token = await getToken();
    const useWalletUrl = `${BASE_URL}/ecart/user/cart/usewallet`;
    try {
      const response = await axios.patch(useWalletUrl, { useWallet: !useWallet } ,{
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setUseWallet(response.data.data.useWallet);
      }
    } catch (error: any) {
      console.error('Failed to fetch Wallet:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch Wallet');
    }
  };

  return (

    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Checkout</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Shipping Address</Text>

        <Picker
          selectedValue={selectedSlug}
          onValueChange={handleSelectAddress}
          style={styles.input}
        >
          <Picker.Item label="Select Address" value="" />
          {addresses?.map(addr => (
            <Picker.Item
              key={addr.slugName}
              label={`${addr.addressName}: ${addr.street}, ${addr.city} - ${addr.pincode}`}
              value={addr.slugName}
            />
          ))}
        </Picker>
      </View>


      {/* Use Wallet Component */}
      <View style={useWalletStyles.wrapper}>
        <View style={useWalletStyles.container}>
          <Text style={useWalletStyles.label}>Use Wallet Balance</Text>
          <Switch
            trackColor={{ false: '#ccc', true: '#4CAF50' }}
            thumbColor={useWallet ? '#fff' : '#f4f3f4'}
            ios_backgroundColor="#ccc"
            onValueChange={toggleUseWallet}
            value={useWallet}
          />
        </View>
        <Text style={useWalletStyles.description}>
          Available Balance: ₹{currBal}
        </Text>
      </View>

      <View style={styles.summary}>
        <Text style={styles.sectionLabel}>Order Summary</Text>
        {cart?.map((item) => (
          <View key={item.productId._id} style={styles.row}>
            <Text style={styles.name}>
              {item.productId.title} × {item.quantity}
            </Text>
            {/* <Text style={styles.price}>₹{(item.price * item.qty).toFixed(2)}</Text> */}
          </View>
        ))}
        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.placeButton, loading && { opacity: 0.6 }]}
        onPress={handlePlaceOrder}
        disabled={loading}
      >
        <Text style={styles.placeText}>
          {loading ? 'Processing Payment...' : 'Place Order'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 30,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#f9f9f9',
    fontSize: 14,
  },
  summary: {
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingTop: 16,
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  name: {
    fontSize: 14,
  },
  price: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  placeButton: {
    marginTop: 24,
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 6,
  },
  placeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

const useWalletStyles = StyleSheet.create({
  wrapper: {
    margin: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
});
