import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { gradients, colors, elevation } from '../theme/colors';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import { useStock } from '../context/StockContext';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString();
}

export default function CostScreen() {
  const { costItems, addCostItem, updateCostItem, deleteCostItem, getMonthlyCost } = useStock();

  const now = new Date();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const sortedCosts = useMemo(
    () => [...costItems].sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)),
    [costItems]
  );

  const monthly = useMemo(() => getMonthlyCost(now.getMonth(), now.getFullYear()), [getMonthlyCost]);

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setMonth(now.getMonth());
    setYear(now.getFullYear());
    setEditingId(null);
  };

  const handleSave = () => {
    if (!description.trim() || !amount) {
      Alert.alert('Missing details', 'Please fill in description and amount.');
      return;
    }
    if (isNaN(Number(amount))) {
      Alert.alert('Invalid input', 'Amount must be a number.');
      return;
    }

    if (editingId) {
      updateCostItem(editingId, { description, amount, month, year });
    } else {
      addCostItem({ description, amount, month, year, dateAdded: new Date().toISOString() });
    }
    resetForm();
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setDescription(item.description);
    setAmount(String(item.amount));
    setMonth(item.month);
    setYear(item.year);
  };

  const confirmDelete = (id, desc) => {
    Alert.alert('Remove cost', `Remove "${desc}" from your business costs?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          deleteCostItem(id);
          if (editingId === id) resetForm();
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.itemCard, elevation(3)]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.description || 'Cost'}</Text>
        <Text style={styles.itemMeta}>
          {MONTH_NAMES[item.month]} {item.year}
        </Text>
        <Text style={styles.itemMeta}>Added: {formatDate(item.dateAdded)}</Text>
      </View>
      <View style={styles.amountBadge}>
        <Text style={styles.amountText}>Tsh {item.amount.toFixed(0)}</Text>
      </View>
      <TouchableOpacity onPress={() => startEdit(item)} style={styles.editBtn}>
        <Ionicons name="create-outline" size={18} color={colors.accent} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => confirmDelete(item.id, item.description)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={18} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={gradients.background} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <FlatList
          data={sortedCosts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View>
              <Text style={styles.title}>Business Costs</Text>
              <Text style={styles.subtitle}>
                Track monthly expenses so we can deduct them from profit to show your real profit.
              </Text>

              <View style={[styles.summaryCard, elevation(5)]}>
                <Ionicons name="cash-outline" size={26} color={colors.warning} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.summaryLabel}>Total Cost This Month</Text>
                  <Text style={styles.summaryValue}>Tsh {monthly.totalCost.toFixed(0)}</Text>
                </View>
              </View>

              <View style={[styles.formCard, elevation(5)]}>
                <Text style={styles.formTitle}>{editingId ? 'Edit Cost' : 'Add a Cost'}</Text>
                <FormInput
                  label="Description"
                  placeholder="e.g. Shop rent, transport, wages"
                  value={description}
                  onChangeText={setDescription}
                />
                <FormInput
                  label="Amount (Tsh)"
                  placeholder="e.g. 50000"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                />

                <Text style={styles.label}>Month</Text>
                <TouchableOpacity style={styles.selectBox} onPress={() => setMonthPickerVisible(true)}>
                  <Text style={styles.selectText}>
                    {MONTH_NAMES[month]} {year}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
                </TouchableOpacity>

                <View style={{ flexDirection: 'row' }}>
                  <PrimaryButton
                    title={editingId ? 'SAVE CHANGES' : 'ADD COST'}
                    onPress={handleSave}
                    colorsOverride={gradients.cost}
                    style={{ flex: 1 }}
                  />
                </View>
                {editingId && (
                  <TouchableOpacity onPress={resetForm} style={styles.cancelEditWrap}>
                    <Text style={styles.cancelEditText}>Cancel edit</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.sectionLabel}>ALL COSTS ({costItems.length})</Text>
            </View>
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No costs recorded yet. Add your first business expense above.</Text>
          }
        />
      </KeyboardAvoidingView>

      <Modal
        visible={monthPickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setMonthPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, elevation(8)]}>
            <Text style={styles.modalTitle}>Select Month</Text>
            <FlatList
              data={MONTH_NAMES}
              keyExtractor={(m) => m}
              renderItem={({ item: m, index }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setMonth(index);
                    setMonthPickerVisible(false);
                  }}
                >
                  <Text style={styles.modalItemName}>
                    {m} {year}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <PrimaryButton title="CLOSE" onPress={() => setMonthPickerVisible(false)} style={{ marginTop: 12 }} />
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 20, paddingBottom: 50 },
  title: { color: colors.white, fontSize: 24, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginBottom: 18 },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryLabel: { color: colors.textSecondary, fontSize: 12 },
  summaryValue: { color: colors.white, fontSize: 20, fontWeight: '800', marginTop: 2 },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  formTitle: { color: colors.white, fontSize: 16, fontWeight: '800', marginBottom: 14 },
  label: { color: colors.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: '600' },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  selectText: { color: colors.textPrimary, fontSize: 15 },
  cancelEditWrap: { marginTop: 10, alignItems: 'center' },
  cancelEditText: { color: colors.textMuted, fontSize: 13 },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemName: { color: colors.white, fontSize: 16, fontWeight: '700' },
  itemMeta: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  amountBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amountText: { color: colors.warning, fontSize: 13, fontWeight: '800' },
  editBtn: { padding: 6, marginRight: 2 },
  deleteBtn: { padding: 6 },
  emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: 20, fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: { color: colors.white, fontSize: 18, fontWeight: '800', marginBottom: 12 },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemName: { color: colors.white, fontSize: 15, fontWeight: '600' },
});
