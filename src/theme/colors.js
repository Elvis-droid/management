// Azonto Management App - Theme
// A dark-navy + gold/teal palette with strong gradients and shadows
// to create a "3D" elevated card feel.

export const colors = {
  background: '#0F1B3C',
  backgroundLight: '#1B2C5C',
  surface: '#1E2A4A',
  card: '#26315A',
  primary: '#3B82F6',
  primaryDark: '#1D4ED8',
  accent: '#FFB020',
  accentDark: '#E6940A',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
  textPrimary: '#FFFFFF',
  textSecondary: '#AEB8D6',
  textMuted: '#7C88AE',
  border: 'rgba(255,255,255,0.08)',
  white: '#FFFFFF',
};

export const gradients = {
  background: ['#0F1B3C', '#1B2C5C'],
  stockIn: ['#16A34A', '#0E7A38'],
  stockOut: ['#DC2626', '#9A1818'],
  cost: ['#F59E0B', '#B45309'],
  management: ['#2563EB', '#1E3A8A'],
  gold: ['#FFD55C', '#FFB020'],
  card: ['#2C3A66', '#1E2A4A'],
  button: ['#3B82F6', '#1D4ED8'],
  header: ['#1B2C5C', '#0F1B3C'],
};

// Shared "3D" elevation styles (works on iOS + Android)
export const elevation = (level = 4) => ({
  shadowColor: '#000',
  shadowOffset: { width: 0, height: level },
  shadowOpacity: 0.35,
  shadowRadius: level * 1.5,
  elevation: level * 2,
});

export default { colors, gradients, elevation };
