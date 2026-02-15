# Expo React Native App

A React Native application built with [Expo](https://expo.dev/) and TypeScript, featuring bottom tab navigation and local SQLite storage.

## Features

- **Expo SDK 54** with TypeScript
- **React Navigation** bottom tab navigator with 4 tabs: Today, History, Add, Settings
- **expo-sqlite** for local on-device storage
- Clean folder structure ready for development

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Expo Go](https://expo.dev/go) app installed on your iOS or Android device (for testing on a physical device)
- Alternatively, an iOS Simulator (macOS only) or Android Emulator

## Setup

Install all dependencies:

```bash
npm install
```

## Running the App

Start the Expo development server:

```bash
npx expo start
```

### Run on iOS

1. Make sure you have the **Expo Go** app installed on your iPhone/iPad.
2. Start the dev server with `npx expo start`.
3. Scan the QR code shown in the terminal using the **Camera** app (iOS) — it will open in Expo Go.
4. Alternatively, if you're on macOS with Xcode installed, press **i** in the terminal to open the iOS Simulator.

### Run on Android

1. Make sure you have the **Expo Go** app installed on your Android device.
2. Start the dev server with `npx expo start`.
3. Scan the QR code shown in the terminal using the **Expo Go** app.
4. Alternatively, if you have Android Studio with an emulator configured, press **a** in the terminal to open the Android Emulator.

## Project Structure

```
├── App.tsx                  # Root component with NavigationContainer
├── index.ts                 # Entry point (registers App)
├── app.json                 # Expo configuration
├── src/
│   ├── components/          # Reusable UI components
│   ├── db/
│   │   └── database.ts      # expo-sqlite database helpers
│   ├── navigation/
│   │   └── BottomTabs.tsx    # Bottom tab navigator configuration
│   ├── screens/
│   │   ├── TodayScreen.tsx   # Today tab
│   │   ├── HistoryScreen.tsx # History tab
│   │   ├── AddScreen.tsx     # Add tab
│   │   └── SettingsScreen.tsx# Settings tab
│   ├── theme/
│   │   └── colors.ts        # Color palette / theming constants
│   └── utils/
│       └── helpers.ts        # Utility functions
├── assets/                  # App icons and splash images
├── package.json
└── tsconfig.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start the Expo dev server |
| `npm run android` | Start and open on Android |
| `npm run ios` | Start and open on iOS |
| `npm run web` | Start and open in web browser |
