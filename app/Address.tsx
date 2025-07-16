// import AddressList from '@/addressComponents/AddressList';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import AddressList from '../addressComponents/AddressList';
import { getToken } from '@/helpers/authStorage';
import axios from 'axios';
const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

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
  const [addresses, setAddresses] = useState<Address[]>([]);

const fetchAddresses = async () => {
  const token = await getToken();
  const fetchUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/address/addresses`;

  try {
    const response = await axios.get(fetchUrl, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if(response.data.success){
      console.log("fetching addresses..............", response.data);
      setAddresses(response.data.data);
    }
  } catch (error: any) {
    // Handle any errors (e.g., network issues, API errors)
    console.error('Failed to fetch addresses:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to fetch addresses');
  }
};

  const handleUpdateAddress = async (updatedAddress: Address) => {
    if (addresses.some(addr => addr.slugName === updatedAddress.slugName)) {

      const updateurl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/address/updateaddress/${updatedAddress.slugName}`
      const token = await getToken();
      try {
        const res = await axios.patch(updateurl, updatedAddress, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.data.success) {
          await fetchAddresses();
        }
      } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to update address');
      }
    } else {

      const addUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/address/addaddress`;
      const token = await getToken();
      try {
        const res = await axios.post(addUrl, updatedAddress, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if(res.data.success){
          await fetchAddresses();
        }
      } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Failed to add new address');
      }
    }
  };

  const handleDeleteAddress = async (slugName: string) => {
    console.log("here in delete", slugName)
    const deleteUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/address/deleteaddress/${slugName}`;
    const token = await getToken();
    try {
      const res = await axios.delete(deleteUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if(res.data.success){
        await fetchAddresses();
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add new address');
    }
  };

  const handleSetDefault = (slugName: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.slugName === slugName,
    })));
  };

  useEffect(()=>{
    fetchAddresses();
  },[])

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