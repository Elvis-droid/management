import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { gradients, colors, elevation } from '../theme/colors';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import { useStock } from '../context/StockContext';

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString();
}

export default function StockInScreen() {
  const { stockItems, addStockItem, updateStockItem, deleteStockItem } = useStock();

  const [name, setName] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [editingId, setEditingId] = useState(null);

  const resetForm = () => {
    setName('');
    setBuyPrice('');
    setSellPrice('');
    setQuantity('');
    setEditingId(null);
  };

  const handleAdd = () => {
    if (!name.trim() || !buyPrice || !sellPrice || !quantity) {
      Alert.alert('Missing details', 'Please fill in all fields.');
      return;
    }
    if (isNaN(Number(buyPrice)) || isNaN(Number(sellPrice)) || isNaN(Number(quantity))) {
      Alert.alert('Invalid input', 'Price and quantity fields must be numbers.');
      return;
    }

    if (editingId) {
      const result = updateStockItem(editingId, { name, buyPrice, sellPrice, quantity });
      if (!result.success) {
        Alert.alert('Error', result.message || 'Could not update stock item.');
        return;
      }
    } else {
      addStockItem({
        name,
        buyPrice,
        sellPrice,
        quantity,
        dateAdded: new Date().toISOString(),
      });
    }

    resetForm();
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setName(item.name);
    setBuyPrice(String(item.buyPrice));
    setSellPrice(String(item.sellPrice));
    setQuantity(String(item.quantity));
  };

  const confirmDelete = (id, itemName) => {
    Alert.alert('Remove product', `Remove "${itemName}" from stock records?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          deleteStockItem(id);
          if (editingId === id) resetForm();
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.itemCard, elevation(3)]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemMeta}>
          Bought @ Tsh {item.buyPrice.toFixed(2)} • Sells @ Tsh {item.sellPrice.toFixed(2)}
        </Text>
        <Text style={styles.itemMeta}>Added: {formatDate(item.dateAdded)}</Text>
      </View>
      <View style={styles.qtyBadge}>
        <Text style={styles.qtyText}>{item.quantity}</Text>
        <Text style={styles.qtyLabel}>in stock</Text>
      </View>
      <TouchableOpacity onPress={() => startEdit(item)} style={styles.editBtn}>
        <Ionicons name="create-outline" size={18} color={colors.accent} />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => confirmDelete(item.id, item.name)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={18} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={gradients.background} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <FlatList
          data={stockItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View>
              <Text style={styles.title}>Stock In / Goods In</Text>
              <Text style={styles.subtitle}>Record new stock entering the business.</Text>

              <View style={[styles.formCard, elevation(5)]}>
                <Text style={styles.formTitle}>{editingId ? 'Edit Stock Item' : 'Add New Stock'}</Text>
                <FormInput label="Product Name" placeholder="e.g. Bag of Rice" value={name} onChangeText={setName} />
                <FormInput
                  label="Price of Goods Bought (Tsh)"
                  placeholder="e.g. 250"
                  keyboardType="numeric"
                  value={buyPrice}
                  onChangeText={setBuyPrice}
                />
                <FormInput
                  label="Price to Sell (Tsh)"
                  placeholder="e.g. 320"
                  keyboardType="numeric"
                  value={sellPrice}
                  onChangeText={setSellPrice}
                />
                <FormInput
                  label="Quantity"
                  placeholder="e.g. 50"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
                <Text style={styles.dateNote}>Date of entry: {formatDate(new Date().toISOString())}</Text>
                <PrimaryButton
                  title={editingId ? 'SAVE CHANGES' : 'ADD TO STOCK'}
                  onPress={handleAdd}
                  colorsOverride={gradients.stockIn}
                />
                {editingId && (
                  <TouchableOpacity onPress={resetForm} style={styles.cancelEditWrap}>
                    <Text style={styles.cancelEditText}>Cancel edit</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.sectionLabel}>CURRENT STOCK ({stockItems.length})</Text>
            </View>
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No stock added yet. Use the form above to add your first product.</Text>
          }
        />
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 20, paddingBottom: 50 },
  title: { color: colors.white, fontSize: 24, fontWeight: '800', marginBottom: 4 },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginBottom: 18 },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  dateNote: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 14,
  },
  formTitle: { color: colors.white, fontSize: 16, fontWeight: '800', marginBottom: 14 },
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
  qtyBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qtyText: { color: colors.accent, fontSize: 18, fontWeight: '800' },
  qtyLabel: { color: colors.textMuted, fontSize: 10 },
  editBtn: { padding: 6, marginRight: 2 },
  deleteBtn: { padding: 6 },
  emptyText: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
  },
});
