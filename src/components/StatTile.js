import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, elevation } from '../theme/colors';

// Small "3D" raised tile for showing a single statistic
// (e.g. Total Profit, Items in Stock, etc.)
export default function StatTile({ label, value, color = colors.accent }) {
  return (
    <View style={[styles.tile, elevation(4)]}>
      <Text style={[styles.value, { color }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
});
