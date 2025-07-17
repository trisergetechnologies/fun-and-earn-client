import { getToken } from '@/helpers/authStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';

export type Product = {
  __v: number;
  _id: string;
  categoryId: string;
  createdAt: string;
  createdByRole: string;
  description: string;
  discountPercent: number;
  finalPrice: number;
  images: string[];
  isActive: boolean;
  price: number;
  sellerId: string;
  stock: number;
  title: string;
  updatedAt: string;
};

type CartItem = {
  productId: Product;
  quantity: number;
};

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  refreshCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'user_cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const {isAuthenticated, isAuthLoading} = useAuth();


    const fetchCart = async () => {
    const url = `${EXPO_PUBLIC_BASE_URL}/ecart/user/cart/getcart`
    const token = await getToken();
 
    try {
      const res = await axios.get(url, {headers:{
        Authorization: `Bearer ${token}`
      }});

      if (res.data.success) {
        setCart(res.data.data.items);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  };

  useEffect(() => {
    if(isAuthLoading && !isAuthenticated) return
    fetchCart();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)).catch(err =>
      console.error('Failed to save cart', err)
    );
  }, [cart]);

  const addToCart = async (product: Product) => {

    const url = `${EXPO_PUBLIC_BASE_URL}/ecart/user/cart/getcart`
    const addUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/cart/addcart`
    const token = await getToken();
    
      try {
    // Fetch existing cart
    const cartRes = await axios.get(url, {headers: {Authorization: `Bearer ${token}`}});
    const currentCart = cartRes.data.cart || [];

    
    // Check if this product already exists in the cart
    const existingItem = currentCart.find(
      (item: any) => item.productId === product._id || item.product._id === product._id
    );

    const newQuantity = existingItem ? existingItem.quantity + 1 : 1;

    // Send API call to /cart/add
    const res = await axios.post(addUrl, {
      productId: product._id,
      quantity: newQuantity,
    },{
      headers: {Authorization: `Bearer ${token}`}
    });

    if (res.data.success) {
      console.log('✅ Product added/updated in cart');
      fetchCart();
    } else {
      console.warn('⚠️ Failed to add to cart:', res.data.message);
    }
  } catch (err) {
    console.error('❌ Error adding to cart:', err);
  }
  };

  const removeFromCart = async (id: string) => {
    const removeItemUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/cart/removeitem`
    const token = await getToken();

    try {
      const productId = id;
      const res = await axios.delete(`${removeItemUrl}/${productId}`,{
        headers:{
          Authorization: `Bearer ${token}`
        },
        params: {
          productId: id
        }
      })

      if (res.data.success) {
        console.log('✅ Product Removed From cart');
        fetchCart(); // Refresh cart state
      } else {
        console.warn('⚠️ Failed to remove item:', res.data.message);
      }
    } catch (err) {
      console.error('❌ Error removing the item:', err);
      fetchCart();
    }
  };

  const updateQty = async (id: string, qty: number) => {

    const updateUrl = `${EXPO_PUBLIC_BASE_URL}/ecart/user/cart/updatecart`
    const token = await getToken();

    try {
    const res = await axios.patch(updateUrl, {
      productId: id,
      quantity: qty,
    },{
      headers: {Authorization: `Bearer ${token}`}
    });

    if (res.data.success) {
      console.log('✅ Product updated in cart');
      fetchCart(); // Refresh cart state
    } else {
      console.warn('⚠️ Failed to update cart:', res.data.message);
    }
  } catch (err) {
    console.error('❌ Error updating the cart:', err);
  }
  };

  const clearCart = async () => {
    try {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
      setCart([]);
    } catch (err) {
      console.error('Failed to clear cart', err);
    }
  };

  const refreshCart=()=>{
      fetchCart();
  }

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, updateQty, refreshCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};