# 📦 Azonto Management App

A mobile app (Android/iOS) for small business owners to track **stock in (goods received)**,
**stock out (goods sold)**, and **management reports** (remaining stock, days in stock, and
monthly profit) — built with **React Native + Expo**.

---

## ✨ Features

- 🔐 **Sign In / Register** – local account system, data stored securely on the device.
- 📥 **Stock In / Goods In**
  - Add new stock with: product name, price bought, price to sell, quantity, date of entry.
- 📤 **Stock Out / Goods Out**
  - Record stock sold with: date, quantity out, price of sale.
  - Automatically reduces remaining quantity of the product.
- 📊 **Management**
  - See remaining stock for each product.
  - See how many days each product has been in stock.
  - Track total profit for the current month (revenue − cost).
  - Overview of stock value & potential revenue.
- 🎨 **3D-style UI** – gradient cards, layered shadows, and elevation for a modern, tactile look.

---

## 🗂️ Repository Structure

```
azonto-management-app/
├── App.js                     # App entry point (providers + navigation)
├── app.json                   # Expo app configuration (name, icons, package id)
├── eas.json                   # EAS Build configuration (for generating APK)
├── babel.config.js
├── package.json
├── .gitignore
│
├── assets/                     # App icons & splash screen
│   ├── icon.png
│   ├── adaptive-icon.png
│   ├── splash.png
│   └── favicon.png
│
├── src/
│   ├── theme/
│   │   └── colors.js           # Color palette, gradients, shadow/elevation styles
│   │
│   ├── utils/
│   │   └── storage.js          # AsyncStorage helper functions
│   │
│   ├── context/
│   │   ├── AuthContext.js      # Sign in / Register / Logout logic
│   │   └── StockContext.js     # Stock In, Stock Out, profit & inventory logic
│   │
│   ├── components/
│   │   ├── GradientCard.js     # 3D gradient navigation cards (Home screen)
│   │   ├── StatTile.js         # Small stat tiles (dashboard numbers)
│   │   ├── PrimaryButton.js     # Gradient action button
│   │   └── FormInput.js         # Styled text input
│   │
│   ├── navigation/
│   │   └── AppNavigator.js      # Stack navigator (Login -> Home -> Stock In/Out/Management)
│   │
│   └── screens/
│       ├── LoginScreen.js
│       ├── HomeScreen.js
│       ├── StockInScreen.js
│       ├── StockOutScreen.js
│       └── ManagementScreen.js
│
└── .github/
    └── workflows/
        └── build-apk.yml        # GitHub Action that builds the APK in the cloud
```

---

## 🚀 Getting Started (Run on your phone for testing)

1. **Install Node.js** (v18 or newer) from https://nodejs.org

2. **Install project dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on your phone**
   - Install the **Expo Go** app from the Play Store / App Store.
   - Scan the QR code shown in your terminal/browser with Expo Go.
   - The app will open on your phone instantly — no APK needed for testing.

---

## 📱 Building the APK File

You have two options:

### Option A — Build automatically with GitHub Actions (recommended)

This repo already includes `.github/workflows/build-apk.yml`, which uses **EAS Build**
(Expo's free cloud build service) to produce a real `.apk` file.

1. Create a free Expo account: https://expo.dev/signup
2. Create an access token: https://expo.dev/accounts/[your-username]/settings/access-tokens
3. In your GitHub repo, go to **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `EXPO_TOKEN`
   - Value: (paste the token you generated)
4. Push this code to GitHub.
5. Go to the **Actions** tab → select **Build Android APK** → **Run workflow**.
6. When the build finishes, the `.apk` link will be available on your Expo dashboard
   under **Builds** (https://expo.dev) — download and install it on any Android phone.

### Option B — Build locally / manually with EAS CLI

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```

This will produce a downloadable `.apk` link once the cloud build completes.

> ℹ️ **Why not build the APK directly on this computer?**
> Building a native Android APK requires the full Android SDK, Java, and Gradle toolchain
> (several GB of tooling). EAS Build runs all of that for you in the cloud for free, and
> gives you a ready-to-install `.apk` — no local Android Studio setup required.

---

## 🔧 Customization Tips

- **App name / package name**: edit `app.json` (`expo.name`, `expo.android.package`).
- **Colors / theme**: edit `src/theme/colors.js`.
- **Currency**: the app currently displays amounts as `GHS` (Ghanaian Cedi). To change,
  search for `GHS` across the `src/screens` folder and replace with your currency symbol.
- **Add more fields** (e.g. supplier name, category): extend `addStockItem` in
  `src/context/StockContext.js` and the form in `StockInScreen.js`.

---

## 🧠 How the Data Works

- All data (accounts, stock, sales) is stored locally on the device using `AsyncStorage`.
- **Stock In** creates a stock item: `{ name, buyPrice, sellPrice, quantity, dateAdded }`.
- **Stock Out** reduces the `quantity` of the matching stock item and creates a sales
  record: `{ productName, quantitySold, salePrice, buyPrice, dateSold }`.
- **Management** screen computes:
  - `daysInStock` = today − `dateAdded`
  - `stockValue` = `quantity × buyPrice`
  - **Monthly profit** = sum over this month's sales of `(salePrice − buyPrice) × quantitySold`

---

## 📄 License

This project is provided as a starting point for your business app — feel free to modify
and use it as you like.
