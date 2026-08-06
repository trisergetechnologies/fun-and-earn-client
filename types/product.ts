export interface ProductVariation {
  name: string;
  options: string[];
}

export interface Product {
  __v?: number;
  _id: string;
  categoryId: string;
  createdAt?: string;
  createdByRole?: string;
  description: string;
  discountPercent: number;
  finalPrice: number;
  images: string[];
  isActive?: boolean;
  price: number;
  sellerId: string | { _id?: string; name?: string; email?: string };
  stock: number;
  title: string;
  updatedAt?: string;
  variations?: ProductVariation[];
  isSpecial?: boolean;
}

export interface ExploreCategory {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
}
