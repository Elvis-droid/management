import React, { createContext, useContext, useEffect, useState } from 'react';
import { getJSON, setJSON, STORAGE_KEYS } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const current = await getJSON(STORAGE_KEYS.CURRENT_USER, null);
      setUser(current);
      setLoading(false);
    })();
  }, []);

  // Register a new user account (stored locally on the device)
  async function register(username, password) {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed || !password) {
      return { success: false, message: 'Username and password are required.' };
    }
    const users = await getJSON(STORAGE_KEYS.USERS, {});
    if (users[trimmed]) {
      return { success: false, message: 'An account with this username already exists.' };
    }
    users[trimmed] = { password, displayName: '', phone: '' };
    await setJSON(STORAGE_KEYS.USERS, users);
    const sessionUser = { username: trimmed, displayName: '', phone: '' };
    await setJSON(STORAGE_KEYS.CURRENT_USER, sessionUser);
    setUser(sessionUser);
    return { success: true };
  }

  // Sign in an existing user
  async function login(username, password) {
    const trimmed = username.trim().toLowerCase();
    const users = await getJSON(STORAGE_KEYS.USERS, {});
    const account = users[trimmed];
    if (!account || account.password !== password) {
      return { success: false, message: 'Invalid username or password.' };
    }
    const sessionUser = {
      username: trimmed,
      displayName: account.displayName || '',
      phone: account.phone || '',
    };
    await setJSON(STORAGE_KEYS.CURRENT_USER, sessionUser);
    setUser(sessionUser);
    return { success: true };
  }

  async function logout() {
    await setJSON(STORAGE_KEYS.CURRENT_USER, null);
    setUser(null);
  }

  // Reset password for an existing account. Since this app stores everything
  // locally on the device (no email/SMS backend), the "reset" simply lets the
  // device owner set a brand new password for a known username.
  async function resetPassword(username, newPassword) {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed || !newPassword) {
      return { success: false, message: 'Username and new password are required.' };
    }
    const users = await getJSON(STORAGE_KEYS.USERS, {});
    if (!users[trimmed]) {
      return { success: false, message: 'No account found with that username.' };
    }
    users[trimmed] = { ...users[trimmed], password: newPassword };
    await setJSON(STORAGE_KEYS.USERS, users);
    return { success: true };
  }

  // Update personal details (display name / phone number) for the signed-in user
  async function updateProfile({ displayName, phone }) {
    if (!user) return { success: false, message: 'Not signed in.' };
    const users = await getJSON(STORAGE_KEYS.USERS, {});
    const account = users[user.username] || { password: '' };
    const updatedAccount = {
      ...account,
      displayName: displayName ?? account.displayName ?? '',
      phone: phone ?? account.phone ?? '',
    };
    users[user.username] = updatedAccount;
    await setJSON(STORAGE_KEYS.USERS, users);

    const updatedUser = {
      ...user,
      displayName: updatedAccount.displayName,
      phone: updatedAccount.phone,
    };
    await setJSON(STORAGE_KEYS.CURRENT_USER, updatedUser);
    setUser(updatedUser);
    return { success: true };
  }

  // Change password while signed in (requires current password)
  async function changePassword(currentPassword, newPassword) {
    if (!user) return { success: false, message: 'Not signed in.' };
    const users = await getJSON(STORAGE_KEYS.USERS, {});
    const account = users[user.username];
    if (!account || account.password !== currentPassword) {
      return { success: false, message: 'Current password is incorrect.' };
    }
    users[user.username] = { ...account, password: newPassword };
    await setJSON(STORAGE_KEYS.USERS, users);
    return { success: true };
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        resetPassword,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
