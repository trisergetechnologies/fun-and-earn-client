import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CustomerSupport() {
  const handleCall = () => {
    Linking.openURL('tel:1800123456');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:support@yourapp.com');
  };

  const handleChat = () => {
    Alert.alert('Chat Support', 'Chat support is coming soon!');
  };

  return (

    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Customer Support</Text>

      <View style={styles.card}>
        <Ionicons name="call-outline" size={24} color="#10b981" />
        <View style={styles.cardText}>
          <Text style={styles.title}>Call Us</Text>
          <Text style={styles.subtitle}>1800-123-456 (Toll-free)</Text>
        </View>
        <TouchableOpacity onPress={handleCall}>
          <Text style={styles.action}>Call</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <MaterialIcons name="email" size={24} color="#3b82f6" />
        <View style={styles.cardText}>
          <Text style={styles.title}>Email Us</Text>
          <Text style={styles.subtitle}>support@yourapp.com</Text>
        </View>
        <TouchableOpacity onPress={handleEmail}>
          <Text style={styles.action}>Email</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Ionicons name="chatbubbles-outline" size={24} color="#f59e0b" />
        <View style={styles.cardText}>
          <Text style={styles.title}>Live Chat</Text>
          <Text style={styles.subtitle}>Get real-time support</Text>
        </View>
        <TouchableOpacity onPress={handleChat}>
          <Text style={styles.action}>Start</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
      <View style={styles.faqBox}>
        <Text style={styles.faqQ}>• How do I track my order?</Text>
        <Text style={styles.faqA}>You can view your order status in the "My Orders" section.</Text>
        <Text style={styles.faqQ}>• Can I cancel my order?</Text>
        <Text style={styles.faqA}>Orders can be canceled before they are shipped.</Text>
        <Text style={styles.faqQ}>• How do I request a refund?</Text>
        <Text style={styles.faqA}>Go to your order and tap on "Return or Refund" option.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 20,
    marginTop:28,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  cardText: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  subtitle: {
    fontSize: 13,
    color: '#555',
  },
  action: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 14,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 12,
    color: '#333',
  },
  faqBox: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  faqQ: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
    marginTop: 10,
  },
  faqA: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
    marginTop: 4,
  },
});
