import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { fetchMarkets } from '../services/coingecko';

const Ctx = createContext(null);
export const useMarket = () => useContext(Ctx);

// How often prices are refreshed (the free CoinGecko API is rate limited, so don't go lower than ~15s)
const REFRESH_MS = 20000;

export function MarketProvider({ children }) {
  const [coins, setCoins] = useState([]);
  const [flash, setFlash] = useState({}); // coinId -> 'up' | 'down' (for a short moment after a price change)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const prev = useRef({});

  const refresh = useCallback(async () => {
    try {
      const data = await fetchMarkets(100);
      const changed = {};
      data.forEach((c) => {
        const before = prev.current[c.id];
        if (before !== undefined && c.current_price !== before) {
          changed[c.id] = c.current_price > before ? 'up' : 'down';
        }
        prev.current[c.id] = c.current_price;
      });
      setCoins(data);
      setFlash(changed);
      setError(null);
      setUpdatedAt(new Date());
      if (Object.keys(changed).length) setTimeout(() => setFlash({}), 1800);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  const byId = useMemo(() => {
    const map = {};
    coins.forEach((c) => (map[c.id] = c));
    return map;
  }, [coins]);

  return (
    <Ctx.Provider value={{ coins, byId, flash, loading, error, updatedAt, refresh }}>
      {children}
    </Ctx.Provider>
  );
}
