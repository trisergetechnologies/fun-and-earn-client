import { ThemeColors } from '@/constants/Theme';

export type OrderStatus = 'placed' | 'shipped' | 'delivered' | 'cancelled' | 'processing' | string;
export type PaymentStatus = 'paid' | 'unpaid' | string;

export interface OrderListItem {
  _id: string;
  publicOrderId?: string | null;
  finalAmountPaid: number;
  createdAt: string;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  items: Array<{
    productTitle?: string;
    productThumbnail?: string;
  }>;
}

export function formatOrderDisplayId(order: Pick<OrderListItem, '_id' | 'publicOrderId'>) {
  if (order.publicOrderId) return `#${order.publicOrderId}`;
  return `#${order._id.slice(-6).toUpperCase()}`;
}

export function getOrderStatusLabel(status: OrderStatus) {
  const normalized = status?.toLowerCase() ?? '';
  switch (normalized) {
    case 'placed':
      return 'Placed';
    case 'processing':
      return 'Processing';
    case 'shipped':
      return 'Shipped';
    case 'delivered':
      return 'Delivered';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
  }
}

export function getOrderStatusColors(status: OrderStatus, colors: ThemeColors) {
  const normalized = status?.toLowerCase() ?? '';
  switch (normalized) {
    case 'delivered':
      return { bg: colors.success + '18', text: colors.success };
    case 'shipped':
      return { bg: colors.warning + '18', text: colors.warning };
    case 'cancelled':
      return { bg: colors.errorMuted, text: colors.error };
    case 'processing':
      return { bg: colors.primaryTint, text: colors.primary };
    case 'placed':
    default:
      return { bg: colors.primaryTint, text: colors.primary };
  }
}

export function getPaymentStatusColors(paymentStatus: PaymentStatus, colors: ThemeColors) {
  if (paymentStatus?.toLowerCase() === 'paid') {
    return null;
  }
  return { bg: colors.warning + '18', text: colors.warning, label: 'Unpaid' };
}

export function getOrderSummaryLine(order: Pick<OrderListItem, 'items' | 'finalAmountPaid'>) {
  const count = order.items?.length ?? 0;
  const itemLabel = count === 1 ? '1 item' : `${count} items`;
  const amount = order.finalAmountPaid.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${itemLabel} · ₹${amount}`;
}

export function getMoreItemsLabel(itemCount: number) {
  if (itemCount <= 1) return null;
  return `+${itemCount - 1} more item${itemCount - 1 > 1 ? 's' : ''}`;
}
