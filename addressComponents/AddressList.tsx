import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AddressCard from './AddressCard';
import AddressForm from './AddressForm';

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

interface AddressListProps {
  addresses: Address[];
  onUpdate: (address: Address) => void;
  onDelete: (slugName: string) => void;
  onSetDefault: (slugName: string) => void;
}

const AddressList: React.FC<AddressListProps> = ({ 
  addresses, 
  onUpdate, 
  onDelete, 
  onSetDefault 
}) => {
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleSubmit = (addressData: Address) => {
    onUpdate(addressData);
    setShowForm(false);
    setEditingAddress(null);
  };

  return (
    <View style={styles.container}>
      {showForm ? (
        <AddressForm
          address={editingAddress}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingAddress(null);
          }}
        />
      ) : (
        <>
          <ScrollView>
            {addresses.map((address) => (
              <AddressCard
                key={address.slugName}
                address={address}
                onEdit={() => handleEdit(address)}
                onDelete={() => onDelete(address.slugName)}
                onSetDefault={() => onSetDefault(address.slugName)}
              />
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowForm(true)}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.addButtonText}>Add New Address</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};
export default AddressList;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

