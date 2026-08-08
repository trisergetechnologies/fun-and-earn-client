import { getToken } from '@/helpers/authStorage';
import { WalletBalanceHero } from '@/components/WalletBalanceHero';
import { DreamCashAmount } from '@/components/DreamCashAmount';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/components/ThemeContext';
import { EmptyState } from '@/components/ui';
import { borderRadius, spacing, typography } from '@/constants/DesignSystem';
import { formatTransactionDate } from '@/utils/walletFormat';
import {
  getStatusLabel,
  getTransactionIcon,
  getTransactionTitle,
  isCreditTransaction,
  WalletTransactionItem,
} from '@/utils/transactionLabels';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const EXPO_PUBLIC_BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'https://amp-api.mpdreams.in/api/v1';
const PAGE_SIZE = 20;

interface PaginatedResponse {
  success: boolean;
  data: WalletTransactionItem[];
  hasMore?: boolean;
  total?: number;
  count?: number;
}

function isPaginatedResponse(data: PaginatedResponse) {
  return typeof data.hasMore === 'boolean' || typeof data.total === 'number';
}

export default function TransactionScreen() {
  const { colors } = useTheme();

  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTransactionItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const legacyAllRef = useRef<WalletTransactionItem[] | null>(null);
  const loadingMoreRef = useRef(false);

  const fetchWallet = useCallback(async () => {
    const token = await getToken();
    try {
      const response = await axios.get(`${EXPO_PUBLIC_BASE_URL}/ecart/user/wallet/getwallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setWalletBalance(response.data.data.eCartWallet);
      }
    } catch (error: any) {
      console.error('Failed to fetch wallet balance:', error.response?.data || error.message);
    }
  }, []);

  const applyPage = useCallback(
    (responseData: PaginatedResponse, pageNum: number, append: boolean) => {
      const batch = responseData.data ?? [];

      if (!isPaginatedResponse(responseData)) {
        if (pageNum === 1) legacyAllRef.current = batch;
        const all = legacyAllRef.current ?? batch;
        const start = (pageNum - 1) * PAGE_SIZE;
        const slice = all.slice(start, start + PAGE_SIZE);
        setHasMore(start + PAGE_SIZE < all.length);
        setTransactions((prev) => (append && pageNum > 1 ? [...prev, ...slice] : slice));
        return;
      }

      setHasMore(Boolean(responseData.hasMore));
      setTransactions((prev) => (append && pageNum > 1 ? [...prev, ...batch] : batch));
    },
    []
  );

  const fetchTransactions = useCallback(
    async (pageNum: number, append: boolean) => {
      const token = await getToken();
      const response = await axios.get(`${EXPO_PUBLIC_BASE_URL}/ecart/user/wallet/getwallettransactions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: pageNum, limit: PAGE_SIZE },
      });

      if (response.data.success) {
        applyPage(response.data, pageNum, append);
        setPage(pageNum);
      }
    },
    [applyPage]
  );

  const loadInitial = useCallback(async () => {
    setLoading(true);
    legacyAllRef.current = null;
    try {
      await Promise.all([fetchWallet(), fetchTransactions(1, false)]);
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [fetchWallet, fetchTransactions]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const onRefresh = async () => {
    setRefreshing(true);
    legacyAllRef.current = null;
    try {
      await Promise.all([fetchWallet(), fetchTransactions(1, false)]);
    } finally {
      setRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loadingMoreRef.current || loading) return;

    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      await fetchTransactions(page + 1, true);
    } catch (error: any) {
      console.error('Failed to load more transactions:', error.response?.data || error.message);
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  };

  const renderStatusBadge = (status: WalletTransactionItem['status']) => {
    const label = getStatusLabel(status);
    const bg =
      status === 'failed'
        ? colors.error + '18'
        : status === 'pending'
          ? colors.warning + '18'
          : colors.success + '18';
    const textColor =
      status === 'failed' ? colors.error : status === 'pending' ? colors.warning : colors.success;

    return (
      <View style={[styles.statusBadge, { backgroundColor: bg }]}>
        <Text style={[styles.statusBadgeText, { color: textColor }]}>{label}</Text>
      </View>
    );
  };

  const renderItem = ({ item }: { item: WalletTransactionItem }) => {
    const isCredit = isCreditTransaction(item.type, item.toWallet, item.fromWallet);
    const title = getTransactionTitle(
      item.type,
      item.source,
      item.toWallet,
      item.fromWallet
    );
    const icon = getTransactionIcon(
      item.type,
      item.source,
      item.toWallet,
      item.fromWallet
    );
    const isExpanded = expandedId === item._id;
    const amountColor =
      item.status === 'failed'
        ? colors.textMuted
        : isCredit
          ? colors.success
          : colors.text;

    return (
      <Pressable
        onPress={() => setExpandedId(isExpanded ? null : item._id)}
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: colors.card,
            borderColor: colors.borderLight,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <View style={[styles.rowIcon, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name={icon} size={20} color={colors.textSecondary} />
        </View>

        <View style={styles.rowBody}>
          <View style={styles.rowTop}>
            <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={1}>
              {title}
            </Text>
            <DreamCashAmount
              amount={item.amount}
              signed
              isCredit={isCredit}
              iconSize="sm"
              color={amountColor}
              textStyle={styles.rowAmount}
            />
          </View>

          <View style={styles.rowMeta}>
            <Text style={[styles.rowDate, { color: colors.textMuted }]}>
              {formatTransactionDate(item.createdAt)}
            </Text>
            {renderStatusBadge(item.status)}
          </View>

          {isExpanded ? (
            <View style={[styles.rowDetails, { borderTopColor: colors.borderLight }]}>
              {item.fromWallet ? (
                <Text style={[styles.detailLine, { color: colors.textMuted }]}>
                  From {item.fromWallet}
                  {item.toWallet ? ` → ${item.toWallet}` : ''}
                </Text>
              ) : null}
              {item.notes ? (
                <Text style={[styles.detailLine, { color: colors.textSecondary }]}>{item.notes}</Text>
              ) : null}
            </View>
          ) : null}
        </View>
      </Pressable>
    );
  };

  const ListHeader = () => (
    <View style={styles.headerBlock}>
      <Text style={[styles.pageTitle, { color: colors.text }]}>Coin history</Text>
      <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
        Track credits, payments, and withdrawals
      </Text>
      <WalletBalanceHero balance={walletBalance} />
      <Text style={[styles.sectionLabel, { color: colors.text }]}>Recent activity</Text>
    </View>
  );

  const ListFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }
    if (!hasMore && transactions.length > 0) {
      return (
        <Text style={[styles.endText, { color: colors.textMuted }]}>You&apos;ve reached the end</Text>
      );
    }
    return null;
  };

  return (
    <Screen>
      {loading ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <EmptyState
              icon="receipt-outline"
              title="No transactions yet"
              subtitle="Your activity will appear here once you earn or spend DreamMart Coin."
              style={styles.emptyState}
            />
          }
          ListFooterComponent={ListFooter}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.35}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  headerBlock: {
    paddingTop: spacing.xs,
  },
  pageTitle: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.extrabold,
    letterSpacing: -0.5,
    marginBottom: spacing.xxs,
  },
  pageSubtitle: {
    fontSize: typography.fontSize.base,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  rowBody: {
    flex: 1,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xxs,
  },
  rowTitle: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  rowAmount: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  rowDate: {
    flex: 1,
    fontSize: typography.fontSize.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  rowDetails: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  detailLine: {
    fontSize: typography.fontSize.sm,
    lineHeight: 18,
  },
  centerLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  endText: {
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    paddingVertical: spacing.lg,
  },
  emptyState: {
    paddingVertical: spacing.xxl,
  },
});
