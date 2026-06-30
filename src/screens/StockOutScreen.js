import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
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

export default function StockOutScreen() {
  const { stockItems, salesRecords, sellStock, deleteSalesRecord } = useStock();

  const availableItems = useMemo(() => stockItems.filter((i) => i.quantity > 0), [stockItems]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);

  const onSelectItem = (item) => {
    setSelectedItem(item);
    setSalePrice(String(item.sellPrice));
    setPickerVisible(false);
  };

  const handleSell = () => {
    if (!selectedItem) {
      Alert.alert('Select a product', 'Please choose a product to record as sold.');
      return;
    }
    if (!quantity || isNaN(Number(quantity))) {
      Alert.alert('Invalid quantity', 'Please enter a valid quantity.');
      return;
    }
    if (!salePrice || isNaN(Number(salePrice))) {
      Alert.alert('Invalid price', 'Please enter a valid sale price.');
      return;
    }

    const result = sellStock({
      stockItemId: selectedItem.id,
      quantitySold: quantity,
      salePrice: salePrice,
      dateSold: new Date().toISOString(),
    });

    if (!result.success) {
      Alert.alert('Cannot complete sale', result.message);
      return;
    }

    setSelectedItem(null);
    setQuantity('');
    setSalePrice('');
  };

  const confirmDelete = (id) => {
    Alert.alert('Remove sale record', 'This will only remove the record (it will not restore stock). Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteSalesRecord(id) },
    ]);
  };

  const renderSale = ({ item }) => (
    <View style={[styles.itemCard, elevation(3)]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.productName}</Text>
        <Text style={styles.itemMeta}>
          Sold {item.quantitySold} unit(s) @ Tsh {item.salePrice.toFixed(2)}
        </Text>
        <Text style={styles.itemMeta}>Date: {formatDate(item.dateSold)}</Text>
      </View>
      <View style={styles.totalBadge}>
        <Text style={styles.totalText}>Tsh {(item.salePrice * item.quantitySold).toFixed(2)}</Text>
        <Text style={styles.qtyLabel}>total</Text>
      </View>
      <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={18} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={gradients.background} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <FlatList
          data={salesRecords}
          keyExtractor={(item) => item.id}
          renderItem={renderSale}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View>
              <Text style={styles.title}>Stock Out / Goods Out</Text>
              <Text style={styles.subtitle}>Record stock sold out of the business.</Text>

              <View style={[styles.formCard, elevation(5)]}>
                <Text style={styles.label}>Select Product</Text>
                <TouchableOpacity
                  style={styles.selectBox}
                  onPress={() => setPickerVisible(true)}
                  disabled={availableItems.length === 0}
                >
                  <Text style={selectedItem ? styles.selectText : styles.selectPlaceholder}>
                    {selectedItem
                      ? `${selectedItem.name} (${selectedItem.quantity} left)`
                      : availableItems.length === 0
                      ? 'No stock available'
                      : 'Tap to choose a product'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
                </TouchableOpacity>

                <FormInput
                  label="Quantity Out"
                  placeholder="e.g. 2"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
                <FormInput
                  label="Price of Sale (Tsh)"
                  placeholder="e.g. 320"
                  keyboardType="numeric"
                  value={salePrice}
                  onChangeText={setSalePrice}
                />
                <Text style={styles.dateNote}>Date out: {formatDate(new Date().toISOString())}</Text>

                <PrimaryButton title="RECORD SALE" onPress={handleSell} colorsOverride={gradients.stockOut} />
              </View>

              <Text style={styles.sectionLabel}>RECENT SALES ({salesRecords.length})</Text>
            </View>
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No sales recorded yet.</Text>
          }
        />
      </KeyboardAvoidingView>

      {/* Product picker modal */}
      <Modal visible={pickerVisible} animationType="slide" transparent onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, elevation(8)]}>
            <Text style={styles.modalTitle}>Select a Product</Text>
            <FlatList
              data={availableItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => onSelectItem(item)}>
                  <View>
                    <Text style={styles.modalItemName}>{item.name}</Text>
                    <Text style={styles.itemMeta}>
                      {item.quantity} in stock • Sells @ Tsh {item.sellPrice.toFixed(2)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No stock available.</Text>}
            />
            <PrimaryButton title="CLOSE" onPress={() => setPickerVisible(false)} style={{ marginTop: 12 }} />
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
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
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
    marginBottom: 14,
  },
  selectText: { color: colors.textPrimary, fontSize: 15 },
  selectPlaceholder: { color: colors.textMuted, fontSize: 15 },
  dateNote: { color: colors.textMuted, fontSize: 12, marginBottom: 14 },
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
  totalBadge: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  totalText: { color: colors.success, fontSize: 14, fontWeight: '800' },
  qtyLabel: { color: colors.textMuted, fontSize: 10 },
  deleteBtn: { padding: 6 },
  emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: 20, fontSize: 13 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemName: { color: colors.white, fontSize: 15, fontWeight: '700' },
});
