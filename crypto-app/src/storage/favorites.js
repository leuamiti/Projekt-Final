import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'favorites';

export async function loadFavorites() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveFavorites(ids) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(ids));
  } catch {}
}
