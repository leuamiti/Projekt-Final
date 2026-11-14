import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAccount } from '../context/AccountContext';
import { GREEN, RED } from '../utils/format';

export default function AuthScreen() {
  const { login, register } = useAccount();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError('');
    const res = mode === 'login' ? await login(username, password) : await register(username, password);
    if (!res.ok) {
      setError(res.error);
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.logo}>₿ Crypto Tracker</Text>
      <Text style={styles.sub}>
        {mode === 'login' ? 'Log in to your account' : 'Create an account and get $10,000 of practice money'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#888"
        autoCapitalize="none"
        autoCorrect={false}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        autoCapitalize="none"
        value={password}
        onChangeText={setPassword}
      />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity style={styles.button} onPress={submit} disabled={busy}>
        {busy ? (
          <ActivityIndicator color="#0b0f14" />
        ) : (
          <Text style={styles.buttonText}>{mode === 'login' ? 'Log in' : 'Sign up'}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          setMode(mode === 'login' ? 'register' : 'login');
          setError('');
        }}
      >
        <Text style={styles.link}>
          {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Demo app: accounts and trades are simulated and stored only on this device. No real money is used.
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14', justifyContent: 'center', padding: 24 },
  logo: { color: '#fff', fontSize: 32, fontWeight: '800', textAlign: 'center' },
  sub: { color: '#9ca3af', textAlign: 'center', marginTop: 8, marginBottom: 28 },
  input: { backgroundColor: '#161c24', color: '#fff', padding: 14, borderRadius: 10, marginBottom: 12, fontSize: 16 },
  button: { backgroundColor: GREEN, padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#0b0f14', fontWeight: '700', fontSize: 16 },
  link: { color: GREEN, textAlign: 'center', marginTop: 18 },
  error: { color: RED, marginBottom: 8, textAlign: 'center' },
  note: { color: '#6b7280', fontSize: 12, textAlign: 'center', marginTop: 32 },
});
