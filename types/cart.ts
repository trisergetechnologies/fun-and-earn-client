import type { Product, SelectedVariation } from '@/components/CartContext';

export interface CartItem {
  productId: Product;
  quantity: number;
  selectedVariation?: SelectedVariation[];
}
