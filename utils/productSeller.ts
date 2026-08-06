/** Seller display name when API populates sellerId; null if absent or not populated. */
export function getProductSellerName(
  sellerId: string | { _id?: string; name?: string; email?: string } | null | undefined
): string | null {
  if (!sellerId || typeof sellerId === 'string') return null;
  const name = sellerId.name?.trim();
  return name || null;
}

export function getProductSellerId(
  sellerId: string | { _id?: string; name?: string; email?: string } | null | undefined
): string | null {
  if (!sellerId) return null;
  if (typeof sellerId === 'string') return sellerId;
  return sellerId._id ?? null;
}
