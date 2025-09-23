import { useLocalSearchParams } from 'expo-router';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { getToken } from '@/helpers/authStorage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import Constants from "expo-constants";
import InvoicePreview from '@/components/InvoicePreview';

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
  createdAt: string;
  updatedAt: string;
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
  totalGstAmount: number;
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
  trackingUpdates: Array<any>;
  __v: number;
}

const OrderDetails = () => {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState('');


  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleViewInvoice = async () => {

    const token = await getToken();
    const response = await axios.get(
      `${EXPO_PUBLIC_BASE_URL}/ecart/user/order/get-invoice/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = response.data;
    if (!data?.url) {
      Alert.alert("Error", "Invoice URL not found");
      return;
    }
    setInvoiceUrl(data?.url);
    setModalVisible(true);
    setTimeout(() => {
      handleCloseModal();
    }, 1000)
  };



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
      } else {
        console.log(response.data);
      }
    } catch (error: any) {
      Alert.alert("Something went wrong ! Please try again.")
      console.error('Failed to fetch order:', error.response?.data || error.message);
    }
  }


  const handleDownloadInvoice = async () => {
    try {
      const token = await getToken();

      // 🔹 Step 1: Fetch invoice URL
      const response = await axios.get(
        `${EXPO_PUBLIC_BASE_URL}/ecart/user/order/get-invoice/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      if (!data?.url) {
        Alert.alert("Error", "Invoice URL not found");
        return;
      }
      setInvoiceUrl(data?.url);
      const fileUri = FileSystem.documentDirectory + `invoice-${id}.pdf`;
      const { uri } = await FileSystem.downloadAsync(data.url, fileUri);

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("Download complete", "File saved at: " + uri);
      }

    } catch (error) {
      console.error("Invoice download error:", error);
      Alert.alert("Error", "Failed to download invoice");
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrder();
    }, [])
  );

  if (!order) return <Text style={{ textAlign: 'center', marginTop: 50 }}>Loading...</Text>;

  return (
    <ScrollView style={styles.container}>

      {/* Header */}
      <Text style={styles.header}></Text>
      <Text style={styles.sectionTitle}>Order Id: {order._id}</Text>
      {/* Products Section */}
      <View style={styles.card}>

        <Text style={styles.sectionTitle}>Products</Text>
        {order.items.map((item, index) => (
          <View key={index} style={styles.productRow}>
            <Image source={{ uri: item.productThumbnail }} style={styles.image} />
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{item.productTitle}</Text>
              <Text style={styles.seller}>Qty: {item.quantity}</Text>
              <Text style={styles.price}>₹{item.finalPriceAtPurchase.toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Order Status */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Order Status</Text>
        <Text>📦 Status: <Text style={styles.highlight}>{order.status}</Text></Text>
        <Text>💳 Payment: <Text style={styles.highlight}>{order.paymentStatus}</Text></Text>
        <Text>🗓 Ordered On: {new Date(order.createdAt).toLocaleDateString()}</Text>
      </View>

      {/* Shipping */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Shipping Details</Text>
        <Text style={styles.bold}>{order.deliveryAddress.fullName}</Text>
        <Text>{order.deliveryAddress.street}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}</Text>
        <Text>{order.deliveryAddress.state}</Text>
        <Text>📞 {order.deliveryAddress.phone}</Text>
      </View>

      {/* Price Summary */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Price Summary</Text>

        <View style={styles.rowBetween}>
          <Text>Items Total</Text>
          <Text>₹{order.totalAmount.toFixed(2)}</Text>
        </View>

        <View style={styles.rowBetween}>
          <Text>GST ({order ? Math.round((order?.totalGstAmount / order?.totalAmount) * 100) : 0}%)</Text>
          <Text>₹{order.totalGstAmount ? order.totalGstAmount.toFixed(2) : 0}</Text>
        </View>

        {order.usedWalletAmount > 0 && (
          <View style={styles.rowBetween}>
            <Text>Wallet Used</Text>
            <Text>- ₹{order.usedWalletAmount.toFixed(2)}</Text>
          </View>
        )}

        {order.usedCouponCode && (
          <View style={styles.rowBetween}>
            <Text>Coupon ({order.usedCouponCode})</Text>
            <Text>- applied</Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.rowBetween}>
          <Text style={styles.totalLabel}>Total Paid</Text>
          <Text style={styles.totalValue}>₹{order.finalAmountPaid.toFixed(2)}</Text>
        </View>
      </View>

      {/* Download Invoice Button */}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={handleViewInvoice}>
          <Ionicons name="download-outline" size={18} color="#fff" />
          <Text style={styles.buttonText}>Download Invoice</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleDownloadInvoice}>
          <Ionicons name="share-outline" size={18} color="#fff" />
          <Text style={styles.buttonText}>Share Invoice</Text>
        </TouchableOpacity>
      </View>

      {/* Return & Refund Policy */}

      <View style={[styles.card, { marginTop: 20, borderLeftWidth: 4, borderLeftColor: "#f87171" }]}>
        <Text style={[styles.sectionTitle, { color: "#dc2626" }]}>Return & Refund Policy</Text>
        <Text style={{ fontSize: 13, color: "#374151", lineHeight: 20 }}>
          You may request a return within{" "}
          <Text style={{ fontWeight: "600", color: "#dc2626" }}>2 days of delivery</Text>.
          To initiate, please email us at{" "}
          <Text style={{ fontWeight: "600", color: "#2563eb" }}>ampdreammart@gmail.com</Text>.
          Make sure your email has a{" "}
          <Text style={{ fontWeight: "600" }}>clear subject line mentioning "Return Request – [Your Order ID]"</Text>.
          In the message body, briefly describe the{" "}
          <Text style={{ fontWeight: "600" }}>reason for return</Text>.
          Our support team will review your request and get back to you with the next steps.
        </Text>
      </View>

      
      <InvoicePreview
        visible={isModalVisible}
        onClose={handleCloseModal}
        uri={invoiceUrl}
      />
    </ScrollView>
  );
};

export default OrderDetails;

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f9fafb', flex: 1 },
  header: { fontSize: 18, fontWeight: 'bold', marginVertical: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  productRow: { flexDirection: 'row', marginBottom: 12 },
  image: { width: 70, height: 70, borderRadius: 8, marginRight: 12 },
  productName: { fontSize: 14, fontWeight: '600' },
  price: { fontSize: 15, fontWeight: 'bold', color: '#3b82f6' },
  seller: { fontSize: 12, color: '#6b7280', marginBottom: 2 },
  bold: { fontWeight: '600' },
  highlight: { fontWeight: '600', color: '#2563eb' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 6 },
  divider: { borderBottomColor: '#e5e7eb', borderBottomWidth: 1, marginVertical: 8 },
  totalLabel: { fontWeight: 'bold', fontSize: 15 },
  totalValue: { fontWeight: 'bold', fontSize: 15, color: '#16a34a' },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10, // optional, for spacing if using React Native 0.71+
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 6,
  },
});
