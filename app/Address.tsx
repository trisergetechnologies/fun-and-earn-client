// import AddressList from '@/addressComponents/AddressList';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import AddressList from '../addressComponents/AddressList';

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

const Address: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      addressName: 'Home',
      slugName: 'home-1',
      fullName: 'John Doe',
      street: '123 Main Street',
      city: 'Ghaziabad',
      state: 'Uttar Pradesh',
      pincode: '201010',
      phone: '9876543210',
      isDefault: true,
    },
    {
      addressName: 'Work',
      slugName: 'work-1',
      fullName: 'John Doe',
      street: '456 Business Park',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201301',
      phone: '9876543211',
      isDefault: false,
    }
  ]);

  const handleUpdateAddress = (updatedAddress: Address) => {
    if (addresses.some(addr => addr.slugName === updatedAddress.slugName)) {
      // Update existing address
      setAddresses(addresses.map(addr => 
        addr.slugName === updatedAddress.slugName ? updatedAddress : addr
      ));
    } else {
      // Add new address
      setAddresses([...addresses, updatedAddress]);
    }
  };

  const handleDeleteAddress = (slugName: string) => {
    setAddresses(addresses.filter(addr => addr.slugName !== slugName));
  };

  const handleSetDefault = (slugName: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.slugName === slugName,
    })));
  };

  return (
    <View style={{ flex: 1 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', padding: 16, marginTop: 28}}>My Addresses</Text>
      <AddressList
        addresses={addresses}
        onUpdate={handleUpdateAddress}
        onDelete={handleDeleteAddress}
        onSetDefault={handleSetDefault}
      />
    </View>
  );
};

export default Address;