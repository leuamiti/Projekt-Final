import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LineChart from '../components/LineChart';
import { fetchChart } from '../services/coingecko';
import { useMarket } from '../context/MarketContext';
import { useAccount } from '../context/AccountContext';
import { compact, formatPrice, formatQty, formatUsd, GREEN, RED } from '../utils/format';

const RANGES = [
  { label: '24H', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '1Y', days: 365 },
];

export default function DetailScreen({ route }) {
  const { coinId } = route.params;
  const { byId, flash } = useMarket();
  const { wallet, buy, sell } = useAccount();
  const coin = byId[coinId];

  const [days, setDays] = useState(7);
  const [series, setSeries] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState(null);
  const [mode, setMode] = useState('buy');
  const [input, setInput] = useState('');

  useEffect(() => {
    let cancelled = false;
    setChartLoading(true);
    setChartError(null);
    fetchChart(coinId, days)
      .then((d) => !cancelled && setSeries(d))
      .catch((e) => !cancelled && setChartError(e.message))
      .finally(() => !cancelled && setChartLoading(false));
    return () => {
      cancelled = true;
    };
  }, [coinId, days]);

  if (!coin) return <ActivityIndicator style={{ flex: 1, backgroundColor: '#0b0f14' }} color={GREEN} />;

  const change = coin.price_change_percentage_24h ?? 0;
  const f = flash[coinId];
  const up = series.length > 1 ? series[series.length - 1].price >= series[0].price : change >= 0;

  const holding = wallet.holdings[coinId];
  const holdingValue = holding ? holding.amount * coin.current_price : 0;
  const holdingPL = holding ? holdingValue - holding.amount * holding.avgCost : 0;
  const base = mode === 'buy' ? wallet.cash : holdingValue;
  const usd = parseFloat(input.replace(',', '.')) || 0;

  const quick = (p) => setInput((Math.floor(base * p * 100) / 100).toFixed(2));

  const submit = () => {
    const res = mode === 'buy' ? buy(coin, usd) : sell(coin, usd);
    if (res.ok) {
      setInput('');
      Alert.alert('Done', res.message);
    } else {
      Alert.alert('Could not complete', res.error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Image source={{ uri: coin.image }} style={styles.icon} />
        <View>
          <Text style={[styles.price, f === 'up' && { color: GREEN }, f === 'down' && { color: RED }]}>
            {formatPrice(coin.current_price)}
          </Text>
          <Text style={{ color: change >= 0 ? GREEN : RED }}>
            {change >= 0 ? '+' : ''}
            {change.toFixed(2)}% (24h)
          </Text>
        </View>
      </View>

      <View style={styles.rangeRow}>
        {RANGES.map((r) => (
          <TouchableOpacity
            key={r.label}
            style={[styles.rangeBtn, days === r.days && styles.rangeActive]}
            onPress={() => setDays(r.days)}
          >
            <Text style={{ color: days === r.days ? '#0b0f14' : '#fff', fontWeight: '600' }}>{r.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.chartBox}>
        {chartLoading ? (
          <ActivityIndicator color={GREEN} />
        ) : chartError ? (
          <Text style={{ color: RED }}>{chartError}</Text>
        ) : (
          <LineChart data={series} width={Dimensions.get('window').width - 32} color={up ? GREEN : RED} />
        )}
      </View>

      {/* ---------- Trade panel ---------- */}
      <View style={styles.card}>
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'buy' && { backgroundColor: GREEN }]}
            onPress={() => {
              setMode('buy');
              setInput('');
            }}
          >
            <Text style={[styles.modeText, mode === 'buy' && { color: '#0b0f14' }]}>Buy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'sell' && { backgroundColor: RED }]}
            onPress={() => {
              setMode('sell');
              setInput('');
            }}
          >
            <Text style={[styles.modeText, mode === 'sell' && { color: '#0b0f14' }]}>Sell</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          {mode === 'buy'
            ? `Available cash: ${formatUsd(wallet.cash)}`
            : holding
            ? `You own ${formatQty(holding.amount)} ${coin.symbol.toUpperCase()} (${formatUsd(holdingValue)})`
            : `You don't own any ${coin.name}`}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Amount in USD"
          placeholderTextColor="#888"
          keyboardType="decimal-pad"
          value={input}
          onChangeText={setInput}
        />

        <View style={styles.quickRow}>
          {[0.25, 0.5, 0.75, 1].map((p) => (
            <TouchableOpacity key={p} style={styles.quickBtn} onPress={() => quick(p)}>
              <Text style={styles.quickText}>{p === 1 ? 'Max' : `${p * 100}%`}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {usd > 0 && (
          <Text style={styles.hint}>
            ≈ {formatQty(usd / coin.current_price)} {coin.symbol.toUpperCase()} at {formatPrice(coin.current_price)}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.confirm, { backgroundColor: mode === 'buy' ? GREEN : RED }]}
          onPress={submit}
        >
          <Text style={styles.confirmText}>
            {mode === 'buy' ? 'Buy' : 'Sell'} {coin.symbol.toUpperCase()}
          </Text>
        </TouchableOpacity>
      </View>

      {holding && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your position</Text>
          <Row label="Amount" value={`${formatQty(holding.amount)} ${coin.symbol.toUpperCase()}`} />
          <Row label="Value now" value={formatUsd(holdingValue)} />
          <Row label="Avg. buy price" value={formatPrice(holding.avgCost)} />
          <Row
            label="Profit / loss"
            value={`${holdingPL >= 0 ? '+' : ''}${formatUsd(holdingPL)}`}
            color={holdingPL >= 0 ? GREEN : RED}
          />
        </View>
      )}

      <View style={styles.stats}>
        <Stat label="Market cap" value={`$${compact(coin.market_cap)}`} />
        <Stat label="24h volume" value={`$${compact(coin.total_volume)}`} />
        <Stat label="24h high" value={formatPrice(coin.high_24h)} />
        <Stat label="24h low" value={formatPrice(coin.low_24h)} />
        <Stat label="Rank" value={`#${coin.market_cap_rank}`} />
        <Stat label="All-time high" value={formatPrice(coin.ath)} />
      </View>
    </ScrollView>
  );
}

const Row = ({ label, value, color }) => (
  <View style={styles.rowLine}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, color && { color }]}>{value}</Text>
  </View>
);

const Stat = ({ label, value }) => (
  <View style={styles.stat}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  icon: { width: 48, height: 48, borderRadius: 24 },
  price: { color: '#fff', fontSize: 28, fontWeight: '700' },
  rangeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  rangeBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#161c24' },
  rangeActive: { backgroundColor: GREEN },
  chartBox: {
    height: 190,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#11161d',
    borderRadius: 12,
    marginBottom: 16,
  },
  card: { backgroundColor: '#11161d', borderRadius: 12, padding: 14, marginBottom: 16 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  modeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  modeBtn: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#1d2530', alignItems: 'center' },
  modeText: { color: '#fff', fontWeight: '700' },
  hint: { color: '#9ca3af', marginBottom: 8 },
  input: { backgroundColor: '#161c24', color: '#fff', padding: 12, borderRadius: 10, fontSize: 18, marginBottom: 10 },
  quickRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  quickBtn: { flex: 1, padding: 8, borderRadius: 8, backgroundColor: '#1d2530', alignItems: 'center' },
  quickText: { color: '#fff' },
  confirm: { padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  confirmText: { color: '#0b0f14', fontWeight: '800', fontSize: 16 },
  rowLine: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: { width: '48%', backgroundColor: '#161c24', padding: 12, borderRadius: 10 },
  statLabel: { color: '#888', fontSize: 12 },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '600', marginTop: 2 },
});
