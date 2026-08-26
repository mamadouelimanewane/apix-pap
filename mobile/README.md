# APIX-PAP Mobile App (React Native)

## 📱 Structure

```
mobile/
├── app/
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── PAPListScreen.tsx
│   │   ├── NotificationsScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/
│   │   ├── NavigationBar.tsx
│   │   ├── PAP Card.tsx
│   │   ├── StatusBadge.tsx
│   │   └── LoadingSpinner.tsx
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   └── BottomTabNavigator.tsx
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── AppContext.tsx
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── storage.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   └── helpers.ts
│   └── App.tsx
├── app.json
├── package.json
└── README.md
```

## 🚀 Setup & Run

```bash
cd mobile

# Install dependencies
npm install
# or
yarn install

# Run on iOS
npx expo start --ios

# Run on Android
npx expo start --android

# Run on web
npx expo start --web
```

## 🏗️ Tech Stack

- **React Native** 0.73+
- **Expo** 50+
- **TypeScript**
- **React Navigation** 6+
- **AsyncStorage** for local data
- **Axios** for API calls
- **Context API** for state management

## 🎯 MVP Features

- ✅ Login/Authentication
- ✅ Dashboard with stats
- ✅ PAP List & Search
- ✅ Offline mode (sync when online)
- ✅ Notifications
- ✅ Settings

## 📋 Offline-First Strategy

1. **AsyncStorage** for local cache
2. **SQLite** for complex queries
3. **Background sync** for pending changes
4. **Conflict resolution** strategies

## 🔐 Security

- JWT token-based auth
- Encrypted storage for tokens
- Biometric login (iOS/Android)
- Session timeout

## 📊 Performance Targets

- **Bundle size**: < 50 MB
- **Startup time**: < 2 seconds
- **List scroll**: 60 FPS

## 🛣️ Roadmap

- [ ] v1.0: MVP features (Login, List, Search)
- [ ] v1.1: Offline sync, Push notifications
- [ ] v1.2: Camera integration (document upload)
- [ ] v1.3: Geolocation (field work tracking)
- [ ] v2.0: AR features (property assessment)
