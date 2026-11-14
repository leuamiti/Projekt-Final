import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

const Ctx = createContext(null);
export const useAccount = () => useContext(Ctx);

export const START_CASH = 10000;
const emptyWallet = () => ({ cash: START_CASH, holdings: {}, transactions: [] });

const makeSalt = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const hashPassword = (salt, password) =>
  Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, salt + password);

async function readJson(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
async function writeJson(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function AccountProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(emptyWallet());

  // Restore the last logged-in user
  useEffect(() => {
    (async () => {
      const session = await readJson('session', null);
      if (session) {
        setWallet(await readJson(`wallet:${session}`, emptyWallet()));
        setUser(session);
      }
      setReady(true);
    })();
  }, []);

  const persist = (next) => {
    setWallet(next);
    writeJson(`wallet:${user}`, next);
  };

  const register = async (rawName, password) => {
    const name = rawName.trim().toLowerCase();
    if (name.length < 3) return { ok: false, error: 'Username must have at least 3 characters.' };
    if (password.length < 6) return { ok: false, error: 'Password must have at least 6 characters.' };
    const users = await readJson('users', {});
    if (users[name]) return { ok: false, error: 'That username is already taken.' };
    const salt = makeSalt();
    users[name] = { salt, hash: await hashPassword(salt, password) };
    await writeJson('users', users);
    const w = emptyWallet();
    await writeJson(`wallet:${name}`, w);
    await writeJson('session', name);
    setWallet(w);
    setUser(name);
    return { ok: true };
  };

  const login = async (rawName, password) => {
    const name = rawName.trim().toLowerCase();
    const users = await readJson('users', {});
    const account = users[name];
    if (!account || (await hashPassword(account.salt, password)) !== account.hash) {
      return { ok: false, error: 'Wrong username or password.' };
    }
    await writeJson('session', name);
    setWallet(await readJson(`wallet:${name}`, emptyWallet()));
    setUser(name);
    return { ok: true };
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('session');
    } catch {}
    setUser(null);
    setWallet(emptyWallet());
  };

  const addTx = (type, coin, qty, usd) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    coinId: coin.id,
    name: coin.name,
    symbol: coin.symbol,
    qty,
    price: coin.current_price,
    usd,
    time: Date.now(),
  });

  // Buy `usd` dollars worth of a coin at the current price
  const buy = (coin, usd) => {
    if (!(usd > 0)) return { ok: false, error: 'Enter an amount.' };
    if (usd > wallet.cash + 0.001) return { ok: false, error: 'Not enough cash.' };
    const qty = usd / coin.current_price;
    const old = wallet.holdings[coin.id];
    const amount = (old ? old.amount : 0) + qty;
    const avgCost = ((old ? old.amount * old.avgCost : 0) + usd) / amount;
    persist({
      cash: Math.max(0, wallet.cash - usd),
      holdings: {
        ...wallet.holdings,
        [coin.id]: { id: coin.id, name: coin.name, symbol: coin.symbol, image: coin.image, amount, avgCost },
      },
      transactions: [addTx('BUY', coin, qty, usd), ...wallet.transactions].slice(0, 200),
    });
    return { ok: true, message: `Bought ${qty.toPrecision(4)} ${coin.symbol.toUpperCase()}.` };
  };

  // Sell `usd` dollars worth of a coin at the current price
  const sell = (coin, usd) => {
    const old = wallet.holdings[coin.id];
    if (!old) return { ok: false, error: `You don't own any ${coin.name}.` };
    if (!(usd > 0)) return { ok: false, error: 'Enter an amount.' };
    const value = old.amount * coin.current_price;
    if (usd > value + 0.01) return { ok: false, error: 'You do not own that much.' };
    const sellAll = usd >= value - 0.01;
    const qty = sellAll ? old.amount : usd / coin.current_price;
    const proceeds = sellAll ? value : usd;
    const holdings = { ...wallet.holdings };
    if (sellAll) delete holdings[coin.id];
    else holdings[coin.id] = { ...old, amount: old.amount - qty };
    persist({
      cash: wallet.cash + proceeds,
      holdings,
      transactions: [addTx('SELL', coin, qty, proceeds), ...wallet.transactions].slice(0, 200),
    });
    return { ok: true, message: `Sold ${qty.toPrecision(4)} ${coin.symbol.toUpperCase()}.` };
  };

  const resetWallet = () => persist(emptyWallet());

  return (
    <Ctx.Provider value={{ ready, user, wallet, register, login, logout, buy, sell, resetWallet }}>
      {children}
    </Ctx.Provider>
  );
}
