import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCart } from '../../components/CartContext';
import { useEffect } from 'react';
const CartScreen = () => {
  const { cart, removeFromCart, refreshCart, updateQty } = useCart(); // ✅ fixed call

  const increaseQty = (item: any) => updateQty(item.productId._id, item.quantity + 1);
  const decreaseQty = (item: any) => {
    if (item.quantity > 1) {
      updateQty(item.productId._id, item.quantity - 1);
    } else {
      removeFromCart(item.productId._id);
    }
  };

  useEffect(()=>{
    refreshCart();
  },[])


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>
      {cart.length === 0 ? (
        // <Text style={styles.emptyText}>Your cart is empty.</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🛒😢</Text>
          <Text style={styles.emptyText}>Cart's feeling empty!</Text>
          <Text style={styles.emptyHint}>Pro tip: Add stuff to make it happy</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => `${item.productId._id}`}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Image source={{ uri: item.productId.images[0] }} style={styles.image} />
                <View style={styles.details}>
                  <Text style={styles.name} numberOfLines={2}>{item.productId.title}</Text>
                  <Text style={styles.price}>₹{(item.productId.finalPrice * item.quantity).toFixed(2)}</Text>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity onPress={() => decreaseQty(item)} style={styles.qtyBtn}>
                      <Ionicons name="remove" size={18} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity onPress={() => increaseQty(item)} style={styles.qtyBtn}>
                      <Ionicons name="add" size={18} color="#000" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => removeFromCart(item.productId._id)}>
                    <Text style={styles.remove}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              ₹{cart.reduce((sum, item) => sum + item.productId.finalPrice * item.quantity, 0).toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => router.push('/private/checkout')}
          >
            <Text style={styles.clearText}>Proceed to pay</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
   backgroundColor: '#f9f9f9'
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
    color: 'gray',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 5,
    color: '#111',
    marginTop: 30, 
  },
  cartItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginTop: 40,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  details: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
  },
  price: {
    fontSize: 14,
    color: '#3b82f6',
    marginVertical: 4,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  qtyText: {
    marginHorizontal: 10,
    fontSize: 14,
  },
  remove: {
    color: '#ef4444',
    fontSize: 13,
    marginTop: 4,
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#ddd',
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  clearButton: {
    marginTop: 12,
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 6,
  },
  checkoutButton: {
    marginTop: 12,
    backgroundColor: '#157a1d',
    paddingVertical: 12,
    borderRadius: 6,
  },
  clearText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
    emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
    emptyHint: {
    color: '#888',
    fontStyle: 'italic',
    marginTop: 8,
  },
});