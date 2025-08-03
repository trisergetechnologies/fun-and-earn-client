import { useLocalSearchParams } from 'expo-router';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import { getToken } from '@/helpers/authStorage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

interface OrderItem {
  productId: string;
  sellerId: string;
  quantity: number;
  priceAtPurchase: number;
  finalPriceAtPurchase: number;
  productTitle: string;
  productThumbnail?: string;
  returnPolicyDays: number;
}

interface Order {
  _id: string;
  buyerId: string;
  cancelRequested: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  deliveryAddress: {
    addressName: string;
    city: string;
    fullName: string;
    phone: string;
    pincode: string;
    state: string;
    street: string;
  };
  finalAmountPaid: number;
  totalAmount: number;
  usedWalletAmount: number;
  usedCouponCode: string | null;
  items: OrderItem[];
  paymentInfo: {
    gateway: string;
    paymentId: string;
  };
  paymentStatus: "paid" | "unpaid" | string;
  refundStatus: "not_applicable" | "pending" | "refunded" | string;
  returnReason: string | null;
  returnRequested: boolean;
  returnStatus: "none" | "requested" | "approved" | "rejected" | string;
  status: "placed" | "shipped" | "delivered" | "cancelled" | string;
  trackingUpdates: Array<any>; // You can replace with a proper type if needed
  __v: number;
}

const OrderDetails = () => {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);

    const fetchOrder = async () => {
    const token = await getToken();
    const getOrdersUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/order/getorders?id=${id}`;
    try {
      const response = await axios.get(getOrdersUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setOrder(response.data.data);
      }
      else {
        console.log(response.data);
      }
    } catch (error: any) {
      Alert.alert("Something went wrong ! Please try again.")
      console.error('Failed to fetch addresses:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to fetch addresses');
    }
  }

  useEffect(() => {
    fetchOrder()
  }, [id]);

  if (!order) return <Text>Loading...</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Order #{order._id}</Text>

      {/* Products */}
      {order.items.map((item, index) => (
        <View key={index} style={styles.row}>
          <Image source={{ uri: item.productThumbnail }} style={styles.image} />
          <View style={{ flex: 1 }}>
            <Text style={styles.productName}>{item.productTitle}</Text>
            <Text style={styles.price}>₹{item.finalPriceAtPurchase.toFixed(2)}</Text>
            <Text style={styles.seller}>Qty: {item.quantity}</Text>
          </View>
        </View>
      ))}

      {/* Order Status */}
      <View style={styles.statusBox}>
        <Text>✔ Status: {order.status}</Text>
        <Text>✔ Payment: {order.paymentStatus}</Text>
        <Text>✔ Ordered On: {new Date(order.createdAt).toLocaleDateString()}</Text>
      </View>

      {/* Shipping Details */}
      <Text style={styles.subTitle}>Shipping Details</Text>
      <View style={styles.detailBox}>
        <Text>{order.deliveryAddress.fullName}</Text>
        <Text>
          {order.deliveryAddress.street}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
        </Text>
        <Text>Phone: {order.deliveryAddress.phone}</Text>
      </View>

      {/* Price Summary */}
      <Text style={styles.subTitle}>Price Summary</Text>
      <View style={styles.detailBox}>
        <Text>Final Paid: ₹{order.finalAmountPaid.toFixed(2)}</Text>
        <Text>Total Before Wallet/Coupon: ₹{order.totalAmount.toFixed(2)}</Text>
        <Text>Used Wallet: - <Ionicons name="ribbon" size={16} color="#10b981" /> {order.usedWalletAmount.toFixed(2)}</Text>
        {order.usedCouponCode && <Text>Coupon: {order.usedCouponCode}</Text>}
        <Text style={styles.total}>Total Paid: ₹{order.finalAmountPaid.toFixed(2)}</Text>
      </View>
    </ScrollView>
  );
};

export default OrderDetails;

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', flex: 1 },
  header: { fontSize: 16, fontWeight: 'bold', marginTop: 28 },
  row: { flexDirection: 'row', marginTop: 25 },
  image: { width: 80, height: 80, borderRadius: 6, marginRight: 12 },
  productName: { fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  price: { fontSize: 16, color: '#3b82f6', fontWeight: 'bold' },
  seller: { fontSize: 12, color: '#555' },
  statusBox: {
    backgroundColor: '#f6f6f6',
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
  },
  subTitle: { fontSize: 16, fontWeight: '600', marginVertical: 10 },
  detailBox: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  total: { fontWeight: 'bold', marginTop: 8 },
});
