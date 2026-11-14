import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMarket } from '../context/MarketContext';
import { loadFavorites, saveFavorites } from '../storage/favorites';
import { formatPrice, GREEN, RED } from '../utils/format';

export default function HomeScreen({ navigation }) {
  const { coins, flash, loading, error, updatedAt, refresh } = useMarket();
  const [favorites, setFavorites] = useState([]);
  const [query, setQuery] = useState('');
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFavorites().then(setFavorites);
  }, []);

  const toggleFavorite = (id) => {
    const next = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    setFavorites(next);
    saveFavorites(next);
  };

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    return coins.filter(
      (c) =>
        (!onlyFavs || favorites.includes(c.id)) &&
        (!q || c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q))
    );
  }, [coins, query, onlyFavs, favorites]);

  if (loading) return <ActivityIndicator style={styles.center} size="large" color={GREEN} />;

  const renderItem = ({ item }) => {
    const change = item.price_change_percentage_24h ?? 0;
    const f = flash[item.id];
    return (
      <TouchableOpacity
        style={[
          styles.row,
          f === 'up' && { backgroundColor: 'rgba(74,222,128,0.18)' },
          f === 'down' && { backgroundColor: 'rgba(248,113,113,0.18)' },
        ]}
        onPress={() => navigation.navigate('Detail', { coinId: item.id, name: item.name })}
      >
        <Image source={{ uri: item.image }} style={styles.icon} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.symbol}>{item.symbol.toUpperCase()}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
          <Text style={[styles.price, f === 'up' && { color: GREEN }, f === 'down' && { color: RED }]}>
            {f === 'up' ? '▲ ' : f === 'down' ? '▼ ' : ''}
            {formatPrice(item.current_price)}
          </Text>
          <Text style={{ color: change >= 0 ? GREEN : RED }}>
            {change >= 0 ? '+' : ''}
            {change.toFixed(2)}%
          </Text>
        </View>
        <TouchableOpacity onPress={() => toggleFavorite(item.id)} hitSlop={10}>
          <Text style={styles.star}>{favorites.includes(item.id) ? '★' : '☆'}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TextInput
          style={styles.search}
          placeholder="Search coins..."
          placeholderTextColor="#888"
          value={query}
          onChangeText={setQuery}
        />
        <TouchableOpacity onPress={() => setOnlyFavs(!onlyFavs)}>
          <Text style={[styles.star, { color: onlyFavs ? '#facc15' : '#555' }]}>★</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.live}>
        <Text style={{ color: error ? RED : GREEN }}>● </Text>
        {error ? error : `Live · updated ${updatedAt ? updatedAt.toLocaleTimeString() : '...'}`}
      </Text>
      <FlatList
        data={data}
        keyExtractor={(c) => c.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await refresh();
              setRefreshing(false);
            }}
            tintColor={GREEN}
          />
        }
        ListEmptyComponent={<Text style={styles.empty}>No coins found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14' },
  center: { flex: 1, backgroundColor: '#0b0f14' },
  toolbar: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  search: { flex: 1, backgroundColor: '#161c24', color: '#fff', padding: 10, borderRadius: 10 },
  live: { color: '#9ca3af', fontSize: 12, paddingHorizontal: 14, paddingBottom: 6 },
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
  price: { color: '#fff', fontSize: 16, fontWeight: '600' },
  star: { fontSize: 24, color: '#facc15' },
  empty: { color: '#888', textAlign: 'center', marginTop: 40 },
});
