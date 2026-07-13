# Fortuna — Premium Gojek-Style Wealth & Expense Tracker

**Fortuna** is a high-fidelity, database-free personal wealth manager and expense tracker. It features a bold, light/dark-mode **Neo-Brutalist UI** inspired by the Gojek application, utilizing browser `localStorage` for fast, zero-server data persistence.

---

## 🎨 Visual Aesthetics & UI Design

Fortuna is designed around a modern **Neo-Brutalist** aesthetic with a premium Gojek theme:
- **Warm Light Theme:** Warm paper-white backgrounds (`#fcfbf7`), solid white cards with thick solid black borders (`3px`), and offset black flat drop shadows.
- **Saturated Dark Theme:** Deep black backgrounds (`#080808`), solid dark cards with solid white borders, and custom **neon yellow flat shadows**.
- **Tactile Transitions:** Interactive cards, inputs, and buttons that offset on hover and depress downward on click.
- **Signature Brand Accents:** Features Gojek Green (`#00a859`), GoPay Blue (`#00aed6`), and GoFood Pink (`#e91e63`) color indicators.

---

## 🚀 Core Features

- **Interactive Dashboard:** Dynamic financial summary including total balance distribution, monthly income vs. expense meters, and a custom category spending pie chart.
- **Accounts Manager:** Create, view, and delete accounts (checking, credit, cash wallets) with dynamically computed real-time balances.
- **Transactions Ledger:** Log expenses, incomes, and transfers with note details, payment methods, search, category filters, and CSV spreadsheet export.
- **Budgets Tracker:** Configure monthly category limits with visual progress meters and warning thresholds when spending exceeds 80% and 100%.
- **Reports & Analytics:** Visualize historical cash flows and spending distributions using interactive bar charts and tooltips.
- **Persistent Theme Switcher:** Instantly toggle between Light and Dark mode with persistence across browser restarts.
- **High-Fidelity Seed Data:** Pre-populated with starter accounts, budgets, and transactions on the first visit so the interface is immediately active.

---

## 🛠️ Technology Stack

- **Core Framework:** React 19, Next.js 16 (App Router)
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **Persistence:** Client-side HTML5 `localStorage` (Database-free)
- **Data Visualizations:** Recharts (responsive charts & tooltips)

---

## 💻 Local Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ARITRAKUNDU07/finance-manager-.git
   cd finance-manager-
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to **[http://localhost:3000](http://localhost:3000)**.

---

## 🌐 Production Deployment

Since Fortuna is **100% database-free** and does not require database instances or server-side connection strings:
- **Deploy to Vercel / Netlify / Render:** Import the repository, select the Next.js preset, and trigger the build.
- **Zero Env Variables Required:** No environment variables or configuration steps are required to launch the app!
