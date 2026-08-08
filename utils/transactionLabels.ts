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

/** Credits into Dream Mart coin wallet (eCart). */
export function isCreditTransaction(
  type: TransactionType,
  toWallet?: string | null,
  _fromWallet?: string | null
) {
  if (type === 'earn') return true;
  // Inbound to Mart (incl. Fun & Enjoy auto-transfer logged as type "withdraw")
  if (toWallet === 'eCartWallet' && (type === 'transfer' || type === 'withdraw')) {
    return true;
  }
  return false;
}

export function getTransactionTitle(
  type: TransactionType,
  source: TransactionSource,
  toWallet?: string | null,
  fromWallet?: string | null
) {
  // Incoming coins to Mart (do not mention Fun & Enjoy / short video)
  if (
    toWallet === 'eCartWallet' &&
    (type === 'withdraw' || type === 'transfer') &&
    fromWallet &&
    fromWallet !== 'eCartWallet'
  ) {
    return 'Coins received';
  }

  if (type === 'earn') {
    if (source === 'coupon') return 'Coupon redeemed';
    if (source === 'watchTime') return 'Reward earned';
    if (source === 'admin') return 'Balance credited';
    if (source === 'manual') return 'Manual credit';
    return 'Coins received';
  }
  if (type === 'spend') {
    if (source === 'purchase') return 'Order payment';
    return 'Balance used';
  }
  // Real bank payout from Mart wallet
  if (type === 'transferToBank') return 'Withdrawal';
  if (type === 'withdraw' && fromWallet === 'eCartWallet') return 'Withdrawal';
  if (type === 'transfer') return 'Wallet transfer';
  if (type === 'withdraw') return 'Withdrawal';
  return 'Transaction';
}

export function getTransactionIcon(
  type: TransactionType,
  source: TransactionSource,
  toWallet?: string | null,
  fromWallet?: string | null
): IoniconName {
  if (
    toWallet === 'eCartWallet' &&
    (type === 'withdraw' || type === 'transfer') &&
    fromWallet &&
    fromWallet !== 'eCartWallet'
  ) {
    return 'arrow-down-circle-outline';
  }

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
