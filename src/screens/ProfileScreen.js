import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { gradients, colors, elevation } from '../theme/colors';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';

const PRIVACY_POLICY_URL =
  'https://www.termsfeed.com/live/101721c3-079b-4982-b751-7661b6bcd125';

export default function ProfileScreen() {
  const { user, updateProfile, changePassword, logout } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    const result = await updateProfile({ displayName, phone });
    setSavingProfile(false);
    if (result.success) {
      Alert.alert('Saved', 'Your personal details have been updated.');
    } else {
      Alert.alert('Error', result.message || 'Could not save details.');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert('Missing details', 'Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Password mismatch', 'New passwords do not match.');
      return;
    }
    setSavingPassword(true);
    const result = await changePassword(currentPassword, newPassword);
    setSavingPassword(false);
    if (result.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      Alert.alert('Password changed', 'Your password has been updated.');
    } else {
      Alert.alert('Error', result.message || 'Could not change password.');
    }
  };

  const confirmLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const openPrivacyPolicy = () => {
    Linking.openURL(PRIVACY_POLICY_URL).catch(() =>
      Alert.alert('Error', 'Could not open the privacy policy link.')
    );
  };

  return (
    <LinearGradient colors={gradients.background} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={[styles.avatarCircle, elevation(6)]}>
            <Ionicons name="person" size={40} color={colors.accent} />
          </View>
          <Text style={styles.username}>{user?.username?.toUpperCase()}</Text>
          <Text style={styles.subtitle}>Manage your personal details and account</Text>

          <View style={[styles.formCard, elevation(5)]}>
            <Text style={styles.formTitle}>Personal Details</Text>
            <FormInput
              label="Display Name"
              placeholder="e.g. John Mushi"
              value={displayName}
              onChangeText={setDisplayName}
            />
            <FormInput
              label="Phone Number"
              placeholder="e.g. 0712 345 678"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <PrimaryButton
              title="SAVE DETAILS"
              onPress={handleSaveProfile}
              loading={savingProfile}
            />
          </View>

          <View style={[styles.formCard, elevation(5)]}>
            <Text style={styles.formTitle}>Change Password</Text>
            <FormInput
              label="Current Password"
              placeholder="••••••••"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
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
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
            />
            <PrimaryButton
              title="UPDATE PASSWORD"
              onPress={handleChangePassword}
              loading={savingPassword}
              colorsOverride={gradients.cost}
            />
          </View>

          <TouchableOpacity style={[styles.linkRow, elevation(3)]} onPress={openPrivacyPolicy}>
            <Ionicons name="document-text-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.logoutRow, elevation(4)]} onPress={confirmLogout}>
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 30, paddingBottom: 50, alignItems: 'center' },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  username: { color: colors.white, fontSize: 20, fontWeight: '800', letterSpacing: 1 },
  subtitle: { color: colors.textSecondary, fontSize: 13, marginBottom: 22, marginTop: 4 },
  formCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
  },
  formTitle: { color: colors.white, fontSize: 16, fontWeight: '800', marginBottom: 14 },
  linkRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
  },
  linkText: { flex: 1, color: colors.textPrimary, fontSize: 14, fontWeight: '600', marginLeft: 12 },
  logoutRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  logoutText: { color: colors.danger, fontSize: 15, fontWeight: '700', marginLeft: 10 },
});
