export interface Address {
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

export type AddressFormData = Omit<Address, 'slugName'>;
