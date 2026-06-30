import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { gradients, colors, elevation } from '../theme/colors';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';

export default function ForgotPasswordScreen({ navigation }) {
  const { resetPassword } = useAuth();
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!username.trim() || !newPassword || !confirmPassword) {
      Alert.alert('Missing details', 'Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Password mismatch', 'New passwords do not match.');
      return;
    }
    if (newPassword.length < 4) {
      Alert.alert('Weak password', 'Use at least 4 characters for your new password.');
      return;
    }

    setLoading(true);
    const result = await resetPassword(username, newPassword);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Error', result.message || 'Something went wrong.');
      return;
    }

    Alert.alert('Password updated', 'Your password has been reset. You can now sign in.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <LinearGradient colors={gradients.background} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={[styles.iconCircle, elevation(8)]}>
            <Ionicons name="key" size={40} color={colors.accent} />
          </View>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your username and choose a new password for your account.
          </Text>

          <View style={[styles.formCard, elevation(6)]}>
            <FormInput
              label="Username"
              placeholder="e.g. azonto_owner"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
            <FormInput
              label="New Password"
              placeholder="••••••••"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <FormInput
              label="Confirm New Password"
              placeholder="••••••••"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <PrimaryButton
              title="RESET PASSWORD"
              onPress={handleReset}
              loading={loading}
              style={{ marginTop: 8 }}
            />
          </View>

          <Text style={styles.footerNote}>
            Since your data is stored only on this device, resetting here updates the
            password saved locally.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  formCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footerNote: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 24,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
});
