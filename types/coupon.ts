export interface Coupon {
  _id?: string;
  code: string;
  title?: string;
  description?: string;
  earnedBy: string;
  earnedFromOrder?: string;
  isActive: boolean;
  isRedeemed: boolean;
  value: number;
  expiresAt?: Date | string;
  createdAt?: Date | string;
}
