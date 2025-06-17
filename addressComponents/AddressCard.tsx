import { Ionicons } from '@expo/vector-icons'; // Fixed import
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  landmark?: string;
  country?: string;
}

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  showActions?: boolean;
}

const AddressCard: React.FC<AddressCardProps> = ({ 
  address, 
  onEdit, 
  onDelete, 
  onSetDefault,
  showActions = true 
}) => {
  const handleCall = () => {
    if (address.phone) {
      Linking.openURL(`tel:${address.phone}`);
    }
  };

  return (
    <View style={[styles.card, address.isDefault && styles.defaultCard]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="location-outline" size={20} color="#10b981" />
          <Text style={styles.title}>{address.addressName}</Text>
          {address.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.name}>{address.fullName}</Text>
        <Text style={styles.addressLine}>{address.street}</Text>
        {address.landmark && (
          <Text style={styles.landmark}>Landmark: {address.landmark}</Text>
        )}
        <Text style={styles.addressLine}>
          {address.city}, {address.state} - {address.pincode}
        </Text>
        {address.country && (
          <Text style={styles.country}>{address.country}</Text>
        )}
        <Text style={styles.phone}>Phone: {address.phone}</Text>
      </View>

      {showActions && (
        <View style={styles.footer}>
          <TouchableOpacity 
            onPress={handleCall} 
            style={styles.callButton}
            disabled={!address.phone}
          >
            <Ionicons name="call-outline" size={16} color="#10b981" />
            <Text style={styles.callText}>Call</Text>
          </TouchableOpacity>

          <View style={styles.actionContainer}>
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <Ionicons name="pencil-outline" size={18} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <Ionicons name="trash-outline" size={18} color="#ef4444" />
            </TouchableOpacity>
            {!address.isDefault && (
              <TouchableOpacity onPress={onSetDefault} style={styles.actionButton}>
                <Ionicons name="star-outline" size={18} color="#f59e0b" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default AddressCard;
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  defaultCard: {
    borderWidth: 1,
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#1e293b',
  },
  defaultBadge: {
    backgroundColor: '#10b98120',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultBadgeText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '500',
  },
  details: {
    marginBottom: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#334155',
  },
  addressLine: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  landmark: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  country: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 2,
  },
  phone: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#ecfdf5',
  },
  callText: {
    color: '#10b981',
    marginLeft: 4,
    fontWeight: '500',
  },
  actionContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 12,
    padding: 4,
  },
});

