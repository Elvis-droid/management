import AsyncStorage from '@react-native-async-storage/async-storage';

// Generic helpers for reading/writing JSON data to AsyncStorage.
// Keeps all persistence logic for the Azonto Management App in one place.

export const STORAGE_KEYS = {
  USERS: '@azonto/users',
  CURRENT_USER: '@azonto/current_user',
  STOCK_ITEMS: '@azonto/stock_items',
  SALES_RECORDS: '@azonto/sales_records',
  COST_ITEMS: '@azonto/cost_items',
};

export async function getJSON(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('getJSON error for', key, e);
    return fallback;
  }
}

export async function setJSON(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn('setJSON error for', key, e);
    return false;
  }
}

export async function removeKey(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.warn('removeKey error for', key, e);
  }
}
