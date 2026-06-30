import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients, colors, elevation } from '../theme/colors';
import FormInput from '../components/FormInput';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password) {
      Alert.alert('Missing details', 'Please enter a username and password.');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    const result =
      mode === 'login' ? await login(username, password) : await register(username, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Error', result.message || 'Something went wrong.');
    }
  };

  return (
    <LinearGradient colors={gradients.background} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={[styles.logoCircle, elevation(8)]}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>AZONTO</Text>
          <Text style={styles.appTagline}>MANAGEMENT APP</Text>

          <View style={[styles.formCard, elevation(6)]}>
            <Text style={styles.formTitle}>
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </Text>
            <Text style={styles.formSubtitle}>
              {mode === 'login'
                ? 'Sign in to manage your stock and sales.'
                : 'Register to start tracking your business.'}
            </Text>

            <FormInput
              label="Username"
              placeholder="e.g. azonto_owner"
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
            />
            <FormInput
              label="Password"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {mode === 'register' && (
              <FormInput
                label="Confirm Password"
                placeholder="••••••••"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            )}

            {mode === 'login' && (
              <TouchableOpacity
                style={styles.forgotWrap}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            )}

            <PrimaryButton
              title={mode === 'login' ? 'SIGN IN' : 'REGISTER'}
              onPress={handleSubmit}
              loading={loading}
              style={{ marginTop: 8 }}
            />

            <TouchableOpacity
              style={styles.switchModeWrap}
              onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              <Text style={styles.switchModeText}>
                {mode === 'login'
                  ? "Don't have an account? "
                  : 'Already have an account? '}
                <Text style={styles.switchModeLink}>
                  {mode === 'login' ? 'Register' : 'Sign In'}
                </Text>
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerNote}>
            Your data is stored securely on this device.
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
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 4,
  },
  appTagline: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
    letterSpacing: 6,
    marginBottom: 32,
  },
  formCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  forgotWrap: {
    alignSelf: 'flex-end',
    marginBottom: 18,
    marginTop: -6,
  },
  forgotText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  switchModeWrap: {
    marginTop: 18,
    alignItems: 'center',
  },
  switchModeText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  switchModeLink: {
    color: colors.accent,
    fontWeight: '700',
  },
  footerNote: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 24,
    textAlign: 'center',
  },
});
