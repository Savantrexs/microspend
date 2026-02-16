# MicroSpend

A super-fast micro expense logger for small daily spending — coffee, snacks, parking. Offline-first, no login required.

> A Savantrexs utility

## Features

- **Today** — see today's total spending and a list of all expenses logged today
- **Add** — quickly log an expense with amount, optional note, and category (Food / Transport / Other)
- **History** — browse all expenses grouped by date, filter by category, and delete entries
- **Settings** — change default currency (CAD / USD / NPR / GBP), export all data as CSV, about info
- **Offline-first** — all data stored locally with SQLite, no internet required
- **Monetization-ready** — mock rewarded-ad gate on CSV export (no real AdMob yet)

## Tech Stack

- **Expo SDK 54** with TypeScript
- **React Navigation v7** — bottom tab navigator
- **expo-sqlite** — local on-device SQLite database
- **expo-file-system** + **expo-sharing** — CSV export
- **expo-crypto** — UUID generation

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [Expo Go](https://expo.dev/go) app on your phone (for testing on a physical device)
- Alternatively, Xcode (macOS only) for iOS Simulator or Android Studio for Android Emulator

## Setup

```bash
npm install
```

## Running the App

Start the Expo development server:

```bash
npx expo start
```

If you see a runtime crash or stale behaviour after pulling changes, clear the Metro cache:

```bash
npx expo start -c
```

### Run on iOS

1. Install the **Expo Go** app on your iPhone/iPad.
2. Run `npx expo start`.
3. Scan the QR code with the **Camera** app — it opens in Expo Go.
4. Or press **i** in the terminal to launch the iOS Simulator (requires Xcode on macOS).

### Run on Android

1. Install the **Expo Go** app on your Android device.
2. Run `npx expo start`.
3. Scan the QR code with the **Expo Go** app.
4. Or press **a** in the terminal to launch the Android Emulator (requires Android Studio).

## Project Structure

```
├── App.tsx                       # Root: AppProvider + NavigationContainer
├── index.ts                      # Entry point
├── app.json                      # Expo config
├── src/
│   ├── context/
│   │   └── AppContext.tsx         # Shared state: expenses, currency, CRUD
│   ├── db/
│   │   └── database.ts           # SQLite schema, CRUD, settings
│   ├── types/
│   │   └── index.ts              # Expense, Category, Currency types
│   ├── navigation/
│   │   └── BottomTabs.tsx         # Bottom tab navigator (4 tabs)
│   ├── screens/
│   │   ├── TodayScreen.tsx        # Today's total + expense list + FAB
│   │   ├── AddScreen.tsx          # Amount input, note, category picker
│   │   ├── HistoryScreen.tsx      # Grouped by date, filter, delete
│   │   └── SettingsScreen.tsx     # Currency, CSV export, about
│   ├── components/
│   │   └── EmptyState.tsx         # Empty state placeholder
│   ├── theme/
│   │   └── colors.ts             # iOS-like color palette
│   └── utils/
│       └── helpers.ts            # Date formatting, CSV generation, grouping
└── assets/                       # App icons and splash images
```

## Export CSV & Mock Ad Gate

MicroSpend includes a CSV export feature gated behind a mock rewarded-ad flow (no real AdMob SDK required).

**How it works:**

1. Go to **Settings** tab and tap **Export CSV**.
2. A modal appears: *"Watch a short ad to export"* with **Cancel** and **Watch Ad** buttons.
3. Tap **Watch Ad** — a simulated ad plays for ~2.5 seconds (spinner + "Playing ad…").
4. The modal shows **"Ad completed ✅"** for 1 second.
5. The modal closes and the OS share sheet opens with the generated `microspend_expenses.csv` file.
6. You can save to Files, AirDrop, email, etc.

**Offline:** The entire flow is offline — CSV is generated from local SQLite data and written to the device cache directory. No network required.

**Replacing the mock ad with real AdMob:** Swap the `handleWatchAd` function in `src/screens/SettingsScreen.tsx` with a real rewarded-ad SDK call (e.g. `expo-ads-admob` or `react-native-google-mobile-ads`). The three-phase state machine (`idle` → `playing` → `completed`) maps directly to real ad lifecycle callbacks.

## Data Model

**expenses** table (SQLite):

| Column    | Type | Notes                          |
|-----------|------|--------------------------------|
| id        | TEXT | Primary key (UUID v4)          |
| amount    | REAL | Required                       |
| currency  | TEXT | Default 'CAD'                  |
| note      | TEXT | Optional                       |
| category  | TEXT | Food / Transport / Other       |
| createdAt | TEXT | ISO 8601 datetime string       |

## App Icon

The `assets/` folder contains Expo's default placeholder icons. To use a custom app icon:

1. Replace `assets/icon.png` with a **1024x1024** PNG (no transparency for iOS).
2. Replace `assets/adaptive-icon.png` with a **1024x1024** PNG for Android adaptive icon.
3. Replace `assets/splash-icon.png` with your splash/loading image.
4. Run `npx expo prebuild` if using a development build, or the icons will be picked up automatically by Expo Go.

## Scripts

| Command           | Description                     |
|-------------------|---------------------------------|
| `npm start`       | Start the Expo dev server       |
| `npm run android` | Start and open on Android       |
| `npm run ios`     | Start and open on iOS           |
| `npm run web`     | Start and open in web browser   |
