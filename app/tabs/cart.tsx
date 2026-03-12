import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useCart } from '../../components/CartContext';
import { useTheme } from '@/components/ThemeContext';

const CartScreen = () => {
  const { colors } = useTheme();
  const { cart, removeFromCart, refreshCart, updateQty } = useCart();

  const increaseQty = (item: any) => updateQty(item.productId._id, item.quantity + 1);
  const decreaseQty = (item: any) => {
    if (item.quantity > 1) {
      updateQty(item.productId._id, item.quantity - 1);
    } else {
      removeFromCart(item.productId._id);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const total = cart.reduce(
    (sum, item) => sum + item.productId.finalPrice * item.quantity,
    0
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Your Cart</Text>
        {cart.length > 0 && (
          <Text style={[styles.itemCount, { color: colors.textMuted }]}>
            {cart.length} item{cart.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconWrap, { backgroundColor: colors.card }]}>
            <Ionicons name="cart-outline" size={56} color={colors.textMuted} />
          </View>
          <Text style={[styles.emptyText, { color: colors.text }]}>Cart's feeling empty!</Text>
          <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
            Add items from Explore to get started
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => `${item.productId._id}`}
            renderItem={({ item }) => (
              <View style={[styles.cartItem, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                <View style={[styles.imageWrap, { backgroundColor: colors.backgroundSecondary }]}>
                  <Image
                    source={{ uri: item.productId.images[0] }}
                    style={styles.image}
                  />
                </View>
                <View style={styles.details}>
                  <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
                    {item.productId.title}
                  </Text>
                  {item.selectedVariation && item.selectedVariation.length > 0 && (
                    <Text style={[styles.variationText, { color: colors.textMuted }]}>
                      {item.selectedVariation
                        .map((v: any) => `${v.name}: ${v.value}`)
                        .join(' · ')}
                    </Text>
                  )}
                  <Text style={[styles.price, { color: colors.primary }]}>
                    ₹{(item.productId.finalPrice * item.quantity).toFixed(2)}
                  </Text>
                  <View style={styles.qtyRow}>
                    <TouchableOpacity
                      onPress={() => decreaseQty(item)}
                      style={[styles.qtyBtn, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                    >
                      <Ionicons name="remove" size={18} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => increaseQty(item)}
                      style={[styles.qtyBtn, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                    >
                      <Ionicons name="add" size={18} color={colors.text} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => removeFromCart(item.productId._id)}>
                    <Text style={[styles.remove, { color: colors.error }]}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          <View style={[styles.totalBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              ₹{total.toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.checkoutButton, { backgroundColor: colors.success }]}
            onPress={() => router.push('/private/checkout')}
            activeOpacity={0.9}
          >
            <Ionicons name="lock-closed" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.checkoutText}>Proceed to Pay</Text>
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
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  itemCount: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 14,
    textAlign: 'center',
  },
  cartItem: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  imageWrap: {
    width: 88,
    height: 88,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 14,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  details: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  variationText: {
    fontSize: 12,
    marginTop: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    marginVertical: 4,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  qtyBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 10,
  },
  qtyText: {
    marginHorizontal: 14,
    fontSize: 15,
    fontWeight: '600',
  },
  remove: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  listContent: {
    paddingBottom: 24,
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
