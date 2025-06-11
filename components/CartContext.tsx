// app/CartContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

type Product = {
  id: number;
  name: string;
  price: number;
  rating: number;
  image: string;
};

type CartItem = Product & { qty: number };

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'user_cart';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from storage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (stored) {
          setCart(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Failed to load cart from storage', err);
      }
    };
    loadCart();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart)).catch(err =>
      console.error('Failed to save cart', err)
    );
  }, [cart]);

  const addToCart = (product: Product) => {
     console.log('🛒 Adding to cart:', product);
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQty = (id: number, qty: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty } : item
      )
    );
  };

  const clearCart = async () => {
    try {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
      setCart([]);
    } catch (err) {
      console.error('Failed to clear cart', err);
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, updateQty }}
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
