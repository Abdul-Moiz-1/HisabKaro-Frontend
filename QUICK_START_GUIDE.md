# 🚀 HisabKaro Dashboard - Quick Start Guide

## ✅ What's Been Done

### 1. Global Mock Data Toggle
Created `src/constants/env.ts` with a **single toggle** to control mock vs real data across the entire app.

### 2. Updated All API Services
All 10 API service files now use the global configuration:
- ✅ reports.ts
- ✅ customers.ts
- ✅ suppliers.ts
- ✅ products.ts
- ✅ invoices.ts
- ✅ payments.ts
- ✅ accounting.ts
- ✅ company.ts
- ✅ notifications.ts
- ✅ ai.ts

### 3. Updated UI Components
- ✅ Bottom navigation tabs (Home, Reports, Docs, Settings)
- ✅ Professional green gradient theme
- ✅ Mock data values matching your design

---

## 🎮 How to Use

### Switch Between Mock and Real Data

**Option 1: Use Mock Data (Development)**
```typescript
// File: src/constants/env.ts
export const ENV_CONFIG = {
  USE_MOCK_DATA: true,  // ← Keep this true for development
  // ...
};
```

**Option 2: Use Real API (Production)**
```typescript
// File: src/constants/env.ts
export const ENV_CONFIG = {
  USE_MOCK_DATA: false,  // ← Change to false for production
  // ...
};
```

That's it! Change one line and the entire app switches!

---

## 📱 Current Dashboard Features

### Balance Cards
- **Cash in Hand**: PKR 45,000 (green gradient)
- **Bank Balance**: PKR 210,000 (light green)

### Quick Stats
- Today Sales: ₨5K
- Receivables: ₨125K
- Payables: ₨85K
- Low Stock: 120 items

### Recent Activity (Live)
1. Sale to Imran Bhai - PKR 5,000
2. Electric Bill - PKR 1,200
3. Sale to Rashid General - PKR 8,450
4. Restocked Cables - 120 units

### Quick Actions
- 🛒 New Sale (Naya Sale)
- 💵 Payment In (Wasooli)
- 📦 Purchase (Khareedari)
- 👤 Customer (Gahak)

### Bottom Navigation
- 🏠 Home
- 📊 Reports
- ➕ Add (FAB)
- 📄 Docs
- ⚙️ Settings

---

## 🎨 Theme Colors

Your professional green gradient theme is already configured:

```typescript
Primary: #00C853 (Bright Green)
Primary Dark: #00897B (Teal)
Cash Card Gradient: ['#00C853', '#00897B']
Bank Card Gradient: ['#E8F5E9', '#C8E6C9']
```

---

## 🔧 Next Steps

1. **Test Mock Data** (Current State)
   ```bash
   npm run android
   # or
   npm run ios
   ```
   Dashboard should load with mock data immediately!

2. **When Backend is Ready**
   - Change `USE_MOCK_DATA: false` in [env.ts](src/constants/env.ts#L13)
   - Update `BASE_URL` to your production API
   - Test all features

3. **Wire Up Navigation**
   - Connect Reports tab to ReportsScreen
   - Connect Docs tab to DocumentsScreen
   - Connect Settings tab to SettingsScreen

---

## 📁 Key Files to Know

| File | Purpose |
|------|---------|
| `src/constants/env.ts` | **⭐ Main config** - Toggle mock data here |
| `src/services/api/reports.ts` | Dashboard data API |
| `src/screens/Home/HomeScreen.tsx` | Main dashboard screen |
| `src/components/navigation/BottomTabBar.tsx` | Bottom navigation |
| `src/constants/theme.ts` | Color theme config |

---

## 🐛 Troubleshooting

### Dashboard shows old data?
- Check `ENV_CONFIG.USE_MOCK_DATA` is set to `true`
- Clear Metro bundler cache: `npm start -- --reset-cache`

### API calls failing?
- If `USE_MOCK_DATA: false`, ensure backend is running
- Check `BASE_URL` in env.ts matches your API
- Check network connection

### TypeScript errors?
- Run `npm install` to ensure dependencies are up to date
- Restart TypeScript server in your IDE

---

## 📊 Mock vs Real Data

| Feature | Mock Data | Real Data |
|---------|-----------|-----------|
| **Speed** | ⚡ Instant (300ms delay) | ⏱️ Depends on network |
| **Development** | ✅ Perfect for UI work | ⚠️ Need backend running |
| **Testing** | ✅ Consistent test data | ✅ Real-world scenarios |
| **Offline** | ✅ Works offline | ❌ Needs connection |

---

## 💡 Pro Tips

1. **Keep mock data ON during UI development**
   - Faster iterations
   - No backend dependency
   - Consistent data for screenshots

2. **Switch to real data for integration testing**
   - Test actual API responses
   - Verify error handling
   - Test performance

3. **Use feature flags**
   - `ENABLE_BIOMETRIC_AUTH`
   - `ENABLE_AI_ASSISTANT`
   - `ENABLE_PUSH_NOTIFICATIONS`
   - `ENABLE_DARK_MODE`

---

## 📚 Documentation

For complete details, see:
- [DASHBOARD_INTEGRATION_SUMMARY.md](DASHBOARD_INTEGRATION_SUMMARY.md) - Full implementation details
- [API_INTEGRATION_STATUS.md](src/API_INTEGRATION_STATUS.md) - API integration status

---

## ✨ Summary

You now have:
- ✅ **One-line toggle** for mock vs real data
- ✅ **Professional UI** matching your design
- ✅ **All APIs integrated** and ready to use
- ✅ **Clean code structure** easy to maintain
- ✅ **Comprehensive docs** for future reference

**Just change one line in `env.ts` to switch everything!**

---

**Happy Coding! 🚀**
