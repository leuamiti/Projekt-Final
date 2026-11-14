# Crypto Tracker v2 (Expo + React Native)

A crypto trading simulator. Prices are real (CoinGecko API, no key needed); the money and trades are practice only.

## Run it

Open PowerShell in this folder (the one that contains package.json), then:

```
npm install
npx expo install --fix
npx expo start
```

Scan the QR code with the Expo Go app (phone on the same Wi-Fi as the computer).

## Features
- **Accounts**: sign up / log in / log out. Passwords are salted and hashed (SHA-256). Data is stored on the device.
- **Practice money**: every new account starts with $10,000.
- **Buy and sell** any of the top 100 coins, by USD amount (25% / 50% / 75% / Max buttons).
- **Live prices**: refreshed every 20 seconds. Rows flash green (▲) when a price rises and red (▼) when it drops.
- **Portfolio**: total balance, cash, holdings, profit/loss per coin and overall.
- **Account tab**: transaction history, log out, reset account.
- Search, favorites, price chart (24H / 7D / 30D / 1Y), market stats.

## Structure
```
index.js                        app entry
App.js                          providers + navigation (login, tabs)
src/context/AccountContext.js   accounts, wallet, buy/sell logic
src/context/MarketContext.js    live price polling
src/services/coingecko.js       API calls
src/storage/favorites.js        favorites storage
src/components/LineChart.js     SVG line chart
src/screens/                    Auth, Home (Markets), Detail (+trade), Portfolio, Account
src/utils/format.js             number formatting
```

## Limits (good to mention in your report)
- Trading is simulated. Real buying/selling needs a licensed exchange/broker API (KYC, real money) and a secure backend.
- Accounts are local to the phone. A real app would use a backend such as Firebase Auth or Supabase so accounts work on any device.
- Prices update by polling every 20 seconds (free API limit), not by a streaming connection.
