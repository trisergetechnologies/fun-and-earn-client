import { ThemeColors } from '@/constants/Theme';
import { Coupon } from '@/types/coupon';

export function isCouponExpired(coupon: Pick<Coupon, 'expiresAt'>) {
  if (!coupon.expiresAt) return false;
  return new Date(coupon.expiresAt).getTime() < Date.now();
}

export function getCouponStatus(coupon: Coupon) {
  if (coupon.isRedeemed) return 'redeemed' as const;
  if (isCouponExpired(coupon)) return 'expired' as const;
  if (!coupon.isActive) return 'inactive' as const;
  return 'active' as const;
}

export function getCouponStatusLabel(status: ReturnType<typeof getCouponStatus>) {
  switch (status) {
    case 'redeemed':
      return 'Redeemed';
    case 'expired':
      return 'Expired';
    case 'inactive':
      return 'Inactive';
    default:
      return 'Active';
  }
}

export function getCouponStatusColors(status: ReturnType<typeof getCouponStatus>, colors: ThemeColors) {
  switch (status) {
    case 'redeemed':
      return { bg: colors.backgroundSecondary, text: colors.textMuted };
    case 'expired':
      return { bg: colors.warning + '18', text: colors.warning };
    case 'inactive':
      return { bg: colors.errorMuted, text: colors.error };
    default:
      return { bg: colors.success + '18', text: colors.success };
  }
}

export function formatCouponExpiry(expiresAt?: Date | string) {
  if (!expiresAt) return null;
  return new Date(expiresAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getAvailableCouponsSummary(coupons: Coupon[]) {
  const available = coupons.filter((c) => !c.isRedeemed && c.isActive && !isCouponExpired(c));
  const totalValue = available.reduce((sum, c) => sum + (c.value || 0), 0);
  return { count: available.length, totalValue };
}

export function canCopyCoupon(coupon: Coupon) {
  return !coupon.isRedeemed && coupon.isActive && !isCouponExpired(coupon);
}
