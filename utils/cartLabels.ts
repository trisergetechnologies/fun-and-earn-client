import { CartItem } from '@/types/cart';
import { SelectedVariation } from '@/components/CartContext';
import { getProductSellerId } from '@/utils/productSeller';

export const SAME_SELLER_CART_MESSAGE =
  'You can only add products from the same seller in one cart';

export function getCartSellerId(cart: CartItem[]) {
  if (!cart.length) return null;
  return getProductSellerId(cart[0].productId.sellerId);
}

export function hasDifferentSeller(cart: CartItem[], productSellerId: string | null) {
  if (!cart.length || !productSellerId) return false;
  const cartSellerId = getCartSellerId(cart);
  return Boolean(cartSellerId && cartSellerId !== productSellerId);
}

export function getCartSubtotal(cart: CartItem[]) {
  return cart.reduce((sum, item) => sum + item.productId.finalPrice * item.quantity, 0);
}

export function getCartItemCount(cart: CartItem[]) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export function getLineTotal(item: CartItem) {
  return item.productId.finalPrice * item.quantity;
}

export function formatVariationLine(variations?: SelectedVariation[]) {
  if (!variations?.length) return null;
  return variations.map((v) => `${v.name}: ${v.value}`).join(' · ');
}

export function getEstimatedTotal(subtotal: number, gstAmount: number, deliveryCharge: number) {
  return subtotal + (gstAmount || 0) + (deliveryCharge || 0);
}

export function getGstPercentLabel(subtotal: number, gstAmount: number) {
  if (!subtotal || !gstAmount) return 'GST';
  return `GST (${Math.round((gstAmount / subtotal) * 100)}%)`;
}
