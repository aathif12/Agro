# ExpenseWise 

A modern mobile Expense Tracker built with **React Native + Expo + Supabase** for Agro Ventures Digital (Pvt) Ltd.

---

##  Features

| Feature | Description |
|---|---|
|  **Authentication** | Email/password sign-up and sign-in via Supabase Auth |
|  **Add Expenses** | Log expenses with title, amount (LKR), category, date, and optional description |
|  **Browse Expenses** | Full expense list with category filter tabs and per-category totals |
|  **Dashboard** | Monthly spending summary, category breakdown bars, and recent transactions |
|  *Profile** | View account details and sign out |
| **Delete** | Swipe-to-confirm delete for any expense |
|  **Pull-to-refresh** | Live data refresh on Dashboard and Expenses screens |

### Expense Categories

Food & Dining · Transportation · Housing · Entertainment · Healthcare · Shopping · Education · Travel · Utilities · Others

---

## 🛠 Tech Stack

- **Frontend**: React Native (Expo SDK 52, TypeScript)
- **Backend**: Supabase (PostgreSQL + Row Level Security + Auth)
- **Navigation**: React Navigation v7 (bottom tabs + native stack)
- **Icons**: `@expo/vector-icons` (Ionicons)
- **Date handling**: `date-fns`

---

## Prerequisites

- Node.js >= 18
- npm or yarn
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- [Expo Go](https://expo.dev/client) app on your phone (iOS or Android)
- A free [Supabase](https://supabase.com) account

---

##  Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd expensewise
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Navigate to **SQL Editor** in your Supabase dashboard.
3. Copy and run the entire contents of [`supabase/schema.sql`](./supabase/schema.sql).
   This creates the `expenses` table and enables Row Level Security (RLS) policies.
4. Go to **Project Settings → API** and copy:
   - **Project URL** (`SUPABASE_URL`)
   - **anon / public key** (`SUPABASE_ANON_KEY`)

### 4. Configure environment variables

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

>  **Never commit your `.env` file.** It is already listed in `.gitignore`.

### 5. Start the development server

```bash
npx expo start
```

Then scan the QR code with **Expo Go** (Android) or the Camera app (iOS).

---

##  Environment Variables

| Variable | Description | Required |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase project anon/public key | ✅ Yes |

---

##  Database Schema

The app uses a single `expenses` table in Supabase:

```sql
create table public.expenses (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  amount      numeric(12, 2) not null check (amount > 0),
  category    text not null,
  description text,
  date        date not null,
  created_at  timestamptz not null default now()
);
```

Row Level Security (RLS) is enabled — each user can only read, write, update, and delete their **own** records.

---

##  Project Structure

```
├── App.tsx                      # Root component, auth-gated navigation
├── app.json                     # Expo config
├── .env.example                 # Environment variable template
├── supabase/
│   └── schema.sql               # Database schema + RLS policies
└── src/
    ├── context/
    │   └── AuthContext.tsx       # Auth state provider
    ├── lib/
    │   └── supabase.ts           # Supabase client
    ├── navigation/
    │   ├── AuthNavigator.tsx     # Login/Register nav stack
    │   └── MainNavigator.tsx     # Bottom tab navigator
    ├── screens/
    │   ├── auth/
    │   │   ├── LoginScreen.tsx
    │   │   └── RegisterScreen.tsx
    │   └── main/
    │       ├── DashboardScreen.tsx
    │       ├── AddExpenseScreen.tsx
    │       ├── ExpensesScreen.tsx
    │       └── ProfileScreen.tsx
    ├── services/
    │   └── expenseService.ts     # Supabase CRUD abstraction
    └── types/
        └── index.ts              # Shared TypeScript types
```

---

##  Design Decisions & Assumptions

1. **Currency**: All amounts are displayed in **Sri Lankan Rupees (LKR)** as this is an Agro Ventures (Sri Lanka) project.
2. **Date input**: Date is entered as a text field (`YYYY-MM-DD`) to avoid platform-specific date picker complexity. A date picker library (e.g., `@react-native-community/datetimepicker`) could be integrated for a better UX.
3. **No edit endpoint**: Expenses can be added and deleted but not edited inline. This keeps the MVP scope clean; an edit screen could be added in a follow-up iteration.
4. **Supabase Auth**: Email confirmation is left to the Supabase project's default settings. For a production app, email confirmation should be enabled in the Supabase Auth settings.
5. **Category list**: 10 predefined categories cover the most common personal finance buckets. Custom categories were excluded from scope for simplicity.
6. **Pull-to-refresh**: Both Dashboard and Expenses screens support PTR for live data updates.
7. **Dark theme**: A consistent dark colour palette (`#0F172A` background, `#6366F1` accent) was applied throughout.

---

##  License

MIT — Agro Ventures Digital (Pvt) Ltd

---

*Built with  using React Native + Expo + Supabase*
