import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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

interface AddressFormProps {
  address?: Address | null;
  onSubmit: (addressData: Address) => void;
  onCancel: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ address, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Omit<Address, 'slugName'>>({
    addressName: address?.addressName || '',
    // slugName: address?.slugName || '',
    fullName: address?.fullName || '',
    street: address?.street || '',
    city: address?.city || '',
    state: address?.state || '',
    pincode: address?.pincode || '',
    phone: address?.phone || '',
    isDefault: address?.isDefault || false,
  });

  const handleChange = <T extends keyof typeof formData>(name: T, value: typeof formData[T]) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    const addressData: Address = {
      ...formData,
      slugName: address?.slugName || ''
    };
    onSubmit(addressData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.formTitle}>
        {address ? 'Edit Address' : 'Add New Address'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Address Name (e.g., Home, Work)"
        value={formData.addressName}
        onChangeText={(text) => handleChange('addressName', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={formData.fullName}
        onChangeText={(text) => handleChange('fullName', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Street Address"
        value={formData.street}
        onChangeText={(text) => handleChange('street', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="City"
        value={formData.city}
        onChangeText={(text) => handleChange('city', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="State"
        value={formData.state}
        onChangeText={(text) => handleChange('state', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Pincode"
        keyboardType="numeric"
        value={formData.pincode}
        onChangeText={(text) => handleChange('pincode', text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={formData.phone}
        onChangeText={(text) => handleChange('phone', text)}
        maxLength={10}
      />

      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => handleChange('isDefault', !formData.isDefault)}
        >
          {formData.isDefault ? (
            <Ionicons name="checkbox-outline" size={24} color="#10b981" />
          ) : (
            <Ionicons name="square-outline" size={24} color="#64748b" />
          )}
        </TouchableOpacity>
        <Text style={styles.checkboxLabel}>Set as default address</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            {address ? 'Update' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default AddressForm;
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1e293b',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxLabel: {
    color: '#64748b',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 14,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748b',
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#10b981',
    padding: 14,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

