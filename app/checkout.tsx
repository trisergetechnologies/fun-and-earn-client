import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCart } from '.././components/CartContext';

const PaymentGateway = async () => {
  return new Promise<{ status: 'success' | 'failure' }>((resolve) => {
    setTimeout(() => {
      const isSuccess = Math.random() > 0.5; 
      resolve({ status: isSuccess ? 'success' : 'failure' });
    }, 2000); 
  });
};

const CheckoutScreen = () => {
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const [address, setAddress] = useState('');
  const [upiId, setUpiId] = useState('');
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handlePlaceOrder = async () => {
    if (!address.trim() || !upiId.trim()) {
      Alert.alert('Missing Info', 'Please enter address and UPI ID.');
      return;
    }

    setLoading(true);

    const paymentResult = await PaymentGateway();

    setLoading(false);

    if (paymentResult.status === 'success') {
      Alert.alert('Success', 'Your payment and order were successful!', [
        {
          text: 'OK',
          onPress: () => {
            clearCart();
            router.replace('/success');
          },
        },
      ]);
    } else {
      Alert.alert('Payment Failed', 'Your payment could not be completed. Please try again.');
    }
  };

      const { isAuthenticated, user, logout } = useAuth();
  
      useEffect(() => {
        console.log("is auth from index", isAuthenticated)
          if (isAuthenticated === false) {
            router.replace('/signin');
          }
      }, [isAuthenticated]);

  return (

    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Checkout</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Shipping Address</Text>
        <TextInput
          placeholder="Enter your full address"
          value={address}
          onChangeText={setAddress}
          style={styles.input}
          multiline
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>UPI Payment ID</Text>
        <TextInput
          placeholder="e.g. johndoe@upi"
          value={upiId}
          onChangeText={setUpiId}
          style={styles.input}
        />
      </View>

      <View style={styles.summary}>
        <Text style={styles.sectionLabel}>Order Summary</Text>
        {cart.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.name}>
              {item.name} × {item.qty}
            </Text>
            <Text style={styles.price}>₹{(item.price * item.qty).toFixed(2)}</Text>
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
