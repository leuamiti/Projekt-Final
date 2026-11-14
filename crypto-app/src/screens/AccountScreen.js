import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAccount, START_CASH } from '../context/AccountContext';
import { formatPrice, formatQty, formatUsd, GREEN, RED } from '../utils/format';

export default function AccountScreen() {
  const { user, wallet, logout, resetWallet } = useAccount();

  const confirmReset = () =>
    Alert.alert('Reset account?', `Your holdings and history will be deleted and you will get ${formatUsd(START_CASH)} again.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetWallet },
    ]);

  const header = (
    <View>
      <View style={styles.card}>
        <Text style={styles.label}>Logged in as</Text>
        <Text style={styles.username}>{user}</Text>
        <Text style={[styles.label, { marginTop: 10 }]}>Cash</Text>
        <Text style={styles.value}>{formatUsd(wallet.cash)}</Text>
      </View>
      <TouchableOpacity style={styles.btn} onPress={logout}>
        <Text style={styles.btnText}>Log out</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, { backgroundColor: '#2a1618' }]} onPress={confirmReset}>
        <Text style={[styles.btnText, { color: RED }]}>Reset account</Text>
      </TouchableOpacity>
      <Text style={styles.section}>Transaction history</Text>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={wallet.transactions}
      keyExtractor={(t) => t.id}
      ListHeaderComponent={header}
      ListEmptyComponent={<Text style={styles.empty}>No transactions yet.</Text>}
      renderItem={({ item }) => (
        <View style={styles.tx}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: item.type === 'BUY' ? GREEN : RED, fontWeight: '700' }}>
              {item.type} {item.symbol.toUpperCase()}
            </Text>
            <Text style={styles.small}>
              {formatQty(item.qty)} @ {formatPrice(item.price)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.valueSmall}>{formatUsd(item.usd)}</Text>
            <Text style={styles.small}>{new Date(item.time).toLocaleString()}</Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14', padding: 12 },
  card: { backgroundColor: '#11161d', borderRadius: 14, padding: 16, marginBottom: 12 },
  label: { color: '#9ca3af', fontSize: 12 },
  username: { color: '#fff', fontSize: 22, fontWeight: '700' },
  value: { color: '#fff', fontSize: 20, fontWeight: '600' },
  btn: { backgroundColor: '#1d2530', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  btnText: { color: '#fff', fontWeight: '700' },
  section: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 10, marginBottom: 6 },
  tx: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#222',
  },
  small: { color: '#888', fontSize: 12 },
  valueSmall: { color: '#fff', fontWeight: '600' },
  empty: { color: '#888', textAlign: 'center', marginTop: 20 },
});
