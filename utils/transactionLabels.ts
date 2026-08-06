import { Ionicons } from '@expo/vector-icons';

export type TransactionType = 'earn' | 'spend' | 'transfer' | 'withdraw' | 'transferToBank';
export type TransactionSource =
  | 'watchTime'
  | 'purchase'
  | 'manual'
  | 'admin'
  | 'coupon'
  | 'system';
export type TransactionStatus = 'pending' | 'success' | 'failed';

export interface WalletTransactionItem {
  _id: string;
  type: TransactionType;
  source: TransactionSource;
  fromWallet: string;
  toWallet: string | null;
  amount: number;
  status: TransactionStatus;
  notes?: string;
  createdAt: string;
}

type IoniconName = keyof typeof Ionicons.glyphMap;

export function isCreditTransaction(type: TransactionType) {
  return type === 'earn';
}

export function getTransactionTitle(type: TransactionType, source: TransactionSource) {
  if (type === 'earn') {
    if (source === 'coupon') return 'Coupon redeemed';
    if (source === 'watchTime') return 'Reward earned';
    if (source === 'admin') return 'Balance credited';
    if (source === 'manual') return 'Manual credit';
    return 'Balance added';
  }
  if (type === 'spend') {
    if (source === 'purchase') return 'Order payment';
    return 'Balance used';
  }
  if (type === 'withdraw' || type === 'transferToBank') return 'Withdrawal';
  if (type === 'transfer') return 'Wallet transfer';
  return 'Transaction';
}

export function getTransactionIcon(type: TransactionType, source: TransactionSource): IoniconName {
  if (type === 'earn') {
    if (source === 'coupon') return 'pricetag-outline';
    if (source === 'watchTime') return 'play-circle-outline';
    return 'add-circle-outline';
  }
  if (type === 'spend') return 'bag-outline';
  if (type === 'withdraw' || type === 'transferToBank') return 'arrow-up-circle-outline';
  if (type === 'transfer') return 'swap-horizontal-outline';
  return 'receipt-outline';
}

export function getStatusLabel(status: TransactionStatus) {
  if (status === 'pending') return 'Pending';
  if (status === 'failed') return 'Failed';
  return 'Success';
}
