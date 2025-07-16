import { getToken } from '@/helpers/authStorage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Alert, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import axios from 'axios';
import { useEffect, useState } from 'react';
const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'http://147.93.58.23:6005/api/v1';

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

type Orders = Order[] | null;

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Orders>([]);

  const fetchOrders = async () => {
    const token = await getToken();
    const getOrdersUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/order/getorders`;
    try {
      const response = await axios.get(getOrdersUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setOrders(response.data.data);
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

  useEffect(()=>{
    fetchOrders();
  },[])


  return (
    
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>My Orders</Text>
        <Ionicons name="cart-outline" size={24} />
      </View>

      {/* <TextInput
        style={styles.searchInput}
        placeholder="Search your order here"
      /> */}

      {/* <FlatList
        data={orders}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/orders/${item._id}`)}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.deliveryText}>Delivered on {item.date}</Text>
              <Text style={styles.productName} numberOfLines={1}>{item.product}</Text>
              <View style={styles.ratingRow}>
                {[...Array(5)].map((_, i) => (
                  <Ionicons key={i} name="star-outline" size={16} color="#999" />
                ))}
              </View>
              <Text style={styles.rateText}>Rate this product now</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#888" />
          </TouchableOpacity>
        )}
      /> */}

   <FlatList
      data={orders}
      keyExtractor={item => item._id}
      renderItem={({ item }) => {
        const firstItem = item.items[0];
        const thumbnail = firstItem?.productThumbnail || 'https://via.placeholder.com/80';
        const productTitle = firstItem?.productTitle || 'Product';

        return (
          <TouchableOpacity
            style={{
              backgroundColor: '#fff',
              padding: 14,
              marginVertical: 8,
              marginHorizontal: 16,
              borderRadius: 10,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowRadius: 5,
              elevation: 2,
            }}
            onPress={() => router.push(`/orders/${item._id}`)}
          >
            <Image
              source={{ uri: thumbnail }}
              style={{ width: 70, height: 70, borderRadius: 6, backgroundColor: '#eee' }}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text numberOfLines={1} style={{ fontWeight: 'bold', fontSize: 14 }}>{productTitle}</Text>
              <Text style={{ color: '#444', marginTop: 4 }}>₹{item.finalAmountPaid.toFixed(2)} • {item.items.length} item(s)</Text>
              <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={() => (
        <View style={{ alignItems: 'center', marginTop: 50 }}>
          <Text style={{ color: '#888' }}>No orders yet</Text>
        </View>
      )}
    />

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginTop: 28, },
  searchInput: {
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  // card: {
  //   flexDirection: 'row',
  //   backgroundColor: '#fff',
  //   borderRadius: 10,
  //   padding: 12,
  //   marginBottom: 12,
  //   elevation: 2,
  //   alignItems: 'center',
  //   marginTop:8,
  // },
  // image: { width: 60, height: 60, borderRadius: 8 },
  // deliveryText: { fontSize: 13, color: '#555' },
  // productName: { fontSize: 14, fontWeight: '600', marginTop: 2 },
  // ratingRow: { flexDirection: 'row', marginTop: 6 },
  // rateText: { fontSize: 12, color: '#888', marginTop: 6 },
   card: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  statusText: {
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
    color: '#444',
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  amountText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
  },
  dateText: {
    marginTop: 6,
    fontSize: 13,
    color: '#999',
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#aaa',
  },
});
