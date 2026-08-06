import { Address } from '@/types/address';

export function formatAddressSummary(address: Pick<Address, 'street' | 'city' | 'state' | 'pincode'>) {
  return `${address.street}, ${address.city} – ${address.pincode}, ${address.state}`;
}

export function formatAddressOneLine(
  address: Pick<Address, 'fullName' | 'street' | 'city' | 'state' | 'pincode' | 'phone'>
) {
  return `${address.fullName}, ${address.street}, ${address.city}, ${address.state} - ${address.pincode}, Phone: ${address.phone}`;
}
