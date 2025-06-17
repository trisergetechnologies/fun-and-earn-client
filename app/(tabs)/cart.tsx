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

const CartScreen = () => {
  const { cart, removeFromCart, clearCart, updateQty } = useCart(); // ✅ fixed call

  const increaseQty = (item) => updateQty(item.id, item.qty + 1);
  const decreaseQty = (item) => {
    if (item.qty > 1) {
      updateQty(item.id, item.qty - 1);
    } else {
      removeFromCart(item.id);
    }
  };

  return (
    <View style={styles.container}>
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
            keyExtractor={(item) => `${item.id}`}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={styles.details}>
                  <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.price}>₹{item.price.toFixed(2)}</Text>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity onPress={() => decreaseQty(item)} style={styles.qtyBtn}>
                      <Ionicons name="remove" size={18} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.qty}</Text>
                    <TouchableOpacity onPress={() => increaseQty(item)} style={styles.qtyBtn}>
                      <Ionicons name="add" size={18} color="#000" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                    <Text style={styles.remove}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              ₹{cart.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => router.push('/checkout')}
          >
            <Text style={styles.clearText}>Proceed to pay</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity
            style={styles.clearButton}
            onPress={() =>
              Alert.alert('Clear Cart', 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Yes', onPress: () => clearCart() },
              ])
            }
          >
            <Text style={styles.clearText}>Clear Cart</Text>
          </TouchableOpacity> */}
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