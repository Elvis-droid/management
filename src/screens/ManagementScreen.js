import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { gradients, colors, elevation } from '../theme/colors';
import StatTile from '../components/StatTile';
import { useStock } from '../context/StockContext';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function ManagementScreen() {
  const { getInventorySummary, getMonthlyProfit, getOverallTotals } = useStock();

  const inventory = useMemo(() => getInventorySummary(), [getInventorySummary]);
  const now = new Date();
  const monthly = useMemo(() => getMonthlyProfit(now.getMonth(), now.getFullYear()), [getMonthlyProfit]);
  const overall = useMemo(() => getOverallTotals(), [getOverallTotals]);

  const renderItem = ({ item }) => (
    <View style={[styles.itemCard, elevation(3)]}>
      <View style={styles.itemHeaderRow}>
        <Text style={styles.itemName}>{item.name}</Text>
        <View
          style={[
            styles.stockBadge,
            { backgroundColor: item.quantity > 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' },
          ]}
        >
          <Text style={[styles.stockBadgeText, { color: item.quantity > 0 ? colors.success : colors.danger }]}>
            {item.quantity} left
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.metaLabel}>Buy Price</Text>
          <Text style={styles.metaValue}>Tsh {item.buyPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.metaLabel}>Sell Price</Text>
          <Text style={styles.metaValue}>Tsh {item.sellPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.metaLabel}>Days in Stock</Text>
          <Text style={styles.metaValue}>{item.daysInStock}d</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.metaLabel}>Stock Value</Text>
          <Text style={styles.metaValue}>Tsh {item.stockValue.toFixed(2)}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.metaLabel}>Potential Revenue</Text>
          <Text style={styles.metaValue}>Tsh {item.potentialRevenue.toFixed(2)}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.metaLabel}>Initial Qty</Text>
          <Text style={styles.metaValue}>{item.initialQuantity}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={gradients.background} style={styles.container}>
      <FlatList
        data={inventory}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Management</Text>
            <Text style={styles.subtitle}>
              Profit summary for {MONTH_NAMES[now.getMonth()]} {now.getFullYear()}
            </Text>

            <View style={[styles.profitCard, elevation(6)]}>
              <View style={styles.profitIconWrap}>
                <Ionicons name="trending-up" size={28} color={colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.profitLabel}>Real Profit This Month</Text>
                <Text style={styles.profitValue}>Tsh {monthly.realProfit.toFixed(2)}</Text>
                <Text style={styles.profitHint}>
                  Gross profit Tsh {monthly.totalProfit.toFixed(0)} − costs Tsh {monthly.totalExpenses.toFixed(0)}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <StatTile label="Revenue (Month)" value={`Tsh ${monthly.totalRevenue.toFixed(0)}`} color={colors.primary} />
              <StatTile label="Cost of Goods" value={`Tsh ${monthly.totalCost.toFixed(0)}`} color={colors.warning} />
              <StatTile label="Items Sold" value={`${monthly.itemsSold}`} color={colors.accent} />
            </View>

            <View style={styles.statsRow}>
              <StatTile label="Business Costs" value={`Tsh ${monthly.totalExpenses.toFixed(0)}`} color={colors.danger} />
              <StatTile label="Gross Profit" value={`Tsh ${monthly.totalProfit.toFixed(0)}`} color={colors.success} />
              <StatTile label="Real Profit" value={`Tsh ${monthly.realProfit.toFixed(0)}`} color={colors.success} />
            </View>

            <Text style={styles.sectionLabel}>OVERALL BUSINESS DATA (ALL TIME)</Text>
            <View style={[styles.overallCard, elevation(5)]}>
              <View style={styles.overallRow}>
                <Text style={styles.overallLabel}>Products Tracked</Text>
                <Text style={styles.overallValue}>{overall.totalProductsTracked}</Text>
              </View>
              <View style={styles.overallRow}>
                <Text style={styles.overallLabel}>Total Units in Stock</Text>
                <Text style={styles.overallValue}>{overall.totalUnitsInStock}</Text>
              </View>
              <View style={styles.overallRow}>
                <Text style={styles.overallLabel}>Total Units Sold</Text>
                <Text style={styles.overallValue}>{overall.totalUnitsSold}</Text>
              </View>
              <View style={styles.overallRow}>
                <Text style={styles.overallLabel}>Sales Recorded</Text>
                <Text style={styles.overallValue}>{overall.totalSalesRecords}</Text>
              </View>
              <View style={styles.overallRow}>
                <Text style={styles.overallLabel}>Cost Entries Recorded</Text>
                <Text style={styles.overallValue}>{overall.totalCostRecords}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.overallRow}>
                <Text style={styles.overallLabel}>Total Stock Value</Text>
                <Text style={styles.overallValue}>Tsh {overall.totalStockValue.toFixed(0)}</Text>
              </View>
              <View style={styles.overallRow}>
                <Text style={styles.overallLabel}>Total Revenue</Text>
                <Text style={styles.overallValue}>Tsh {overall.totalRevenue.toFixed(0)}</Text>
              </View>
              <View style={styles.overallRow}>
                <Text style={styles.overallLabel}>Total Cost of Goods Sold</Text>
                <Text style={styles.overallValue}>Tsh {overall.totalCost.toFixed(0)}</Text>
              </View>
              <View style={styles.overallRow}>
                <Text style={styles.overallLabel}>Total Business Costs</Text>
                <Text style={styles.overallValue}>Tsh {overall.totalExpenses.toFixed(0)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.overallRow}>
                <Text style={[styles.overallLabel, { fontWeight: '800', color: colors.white }]}>
                  Total Real Profit (All Time)
                </Text>
                <Text style={[styles.overallValue, { color: colors.success, fontSize: 16 }]}>
                  Tsh {overall.realProfit.toFixed(0)}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionLabel}>INVENTORY OVERVIEW ({inventory.length})</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.emptyText}>No products in stock yet.</Text>}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 20, paddingBottom: 50 },
  title: { color: colors.white, fontSize: 24, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginBottom: 18 },
  profitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profitIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(34,197,94,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  profitLabel: { color: colors.textSecondary, fontSize: 12 },
  profitValue: { color: colors.white, fontSize: 24, fontWeight: '900', marginTop: 2 },
  profitHint: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 18,
    marginHorizontal: -6,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
    marginTop: 8,
  },
  overallCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 26,
  },
  overallRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
  },
  overallLabel: { color: colors.textSecondary, fontSize: 13 },
  overallValue: { color: colors.textPrimary, fontSize: 13, fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 6 },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemName: { color: colors.white, fontSize: 16, fontWeight: '700' },
  stockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  stockBadgeText: { fontSize: 12, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  col: { flex: 1 },
  metaLabel: { color: colors.textMuted, fontSize: 11 },
  metaValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '700', marginTop: 2 },
  emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: 20, fontSize: 13 },
});
