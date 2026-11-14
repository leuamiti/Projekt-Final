const BASE = 'https://api.coingecko.com/api/v3';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    throw new Error(
      res.status === 429
        ? 'Too many requests. Wait a minute and pull to refresh.'
        : `Request failed (${res.status})`
    );
  }
  return res.json();
}

// Top coins by market cap
export function fetchMarkets(perPage = 50) {
  return get(
    `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=false&price_change_percentage=24h`
  );
}

// Price history for the chart (days: 1, 7, 30, 365)
export async function fetchChart(id, days = 7) {
  const data = await get(`/coins/${id}/market_chart?vs_currency=usd&days=${days}`);
  return data.prices.map(([time, price]) => ({ time, price }));
}
