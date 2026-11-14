import React, { useMemo } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAccount, START_CASH } from '../context/AccountContext';
import { useMarket } from '../context/MarketContext';
import { formatPrice, formatQty, formatUsd, GREEN, RED } from '../utils/format';

export default function PortfolioScreen({ navigation }) {
  const { wallet } = useAccount();
  const { byId, flash } = useMarket();

  const { rows, holdingsValue } = useMemo(() => {
    const list = Object.values(wallet.holdings).map((h) => {
      const price = byId[h.id]?.current_price ?? h.avgCost;
      const value = h.amount * price;
      const cost = h.amount * h.avgCost;
      return { ...h, price, value, pl: value - cost, plPct: cost ? ((value - cost) / cost) * 100 : 0 };
    });
    list.sort((a, b) => b.value - a.value);
    return { rows: list, holdingsValue: list.reduce((s, r) => s + r.value, 0) };
  }, [wallet.holdings, byId]);

  const total = wallet.cash + holdingsValue;
  const totalPL = total - START_CASH;

  const header = (
    <View style={styles.summary}>
      <Text style={styles.label}>Total balance</Text>
      <Text style={styles.total}>{formatUsd(total)}</Text>
      <Text style={{ color: totalPL >= 0 ? GREEN : RED, marginBottom: 12 }}>
        {totalPL >= 0 ? '+' : ''}
        {formatUsd(totalPL)} since start
      </Text>
      <View style={styles.split}>
        <View>
          <Text style={styles.label}>Cash</Text>
          <Text style={styles.value}>{formatUsd(wallet.cash)}</Text>
        </View>
        <View>
          <Text style={styles.label}>In crypto</Text>
          <Text style={styles.value}>{formatUsd(holdingsValue)}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <FlatList
      style={styles.container}
      data={rows}
      keyExtractor={(r) => r.id}
      ListHeaderComponent={header}
      ListEmptyComponent={<Text style={styles.empty}>You don't own any crypto yet.{'\n'}Open a coin in Markets and tap Buy.</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[
            styles.row,
            flash[item.id] === 'up' && { backgroundColor: 'rgba(74,222,128,0.18)' },
            flash[item.id] === 'down' && { backgroundColor: 'rgba(248,113,113,0.18)' },
          ]}
          onPress={() => navigation.navigate('Detail', { coinId: item.id, name: item.name })}
        >
          <Image source={{ uri: item.image }} style={styles.icon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.symbol}>
              {formatQty(item.amount)} {item.symbol.toUpperCase()} · {formatPrice(item.price)}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.name}>{formatUsd(item.value)}</Text>
            <Text style={{ color: item.pl >= 0 ? GREEN : RED }}>
              {item.pl >= 0 ? '+' : ''}
              {item.plPct.toFixed(2)}%
            </Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14' },
  summary: { padding: 16, margin: 12, backgroundColor: '#11161d', borderRadius: 14 },
  label: { color: '#9ca3af', fontSize: 12 },
  total: { color: '#fff', fontSize: 32, fontWeight: '800' },
  split: { flexDirection: 'row', justifyContent: 'space-between' },
  value: { color: '#fff', fontSize: 18, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#222',
  },
  icon: { width: 36, height: 36, marginRight: 12, borderRadius: 18 },
  name: { color: '#fff', fontSize: 16, fontWeight: '600' },
  symbol: { color: '#888', fontSize: 12 },
  empty: { color: '#888', textAlign: 'center', marginTop: 40, lineHeight: 22 },
});
