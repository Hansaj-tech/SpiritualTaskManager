# Aahanik — Spiritual Task Manager

A daily spiritual activity tracker for BAPS Swaminarayan devotees. Track your spiritual practices, earn **Rajipo** (devotion points), and maintain streaks of consistent daily sadhana.

---

## Features

- **Daily Task Tracking** — 10 predefined spiritual tasks per day
- **Rajipo Points System** — Earn 10 points per completed task (max 100/day)
- **Rajipo Wallet** — Cumulative balance of all earned points
- **Streak Counter** — Tracks consecutive days where all 10 tasks are completed
- **Profile Setup** — Set your name and Kshetra (K1–K12)
- **Google Sign-In** — One-click authentication via Firebase
- **Real-time Persistence** — Data synced to Firestore instantly

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (Radix UI) |
| Authentication | Firebase Auth (Google OAuth) |
| Database | Firebase Firestore |
| State Management | React Context API |
| Animations | Framer Motion |
| Icons | Lucide React |

---

## Code Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                        app/page.tsx                      │
│                    (Entry Point)                          │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│               app/layout.tsx                             │
│         Wraps app with <AuthProvider>                    │
│         Sets up global fonts (Poppins, Inter)            │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│            contexts/auth-context.tsx                     │
│  - Listens to Firebase onAuthStateChanged()              │
│  - Fetches / creates Firestore user document on login    │
│  - Exposes: user, userData, loading                      │
│  - Methods: loginWithGoogle, logout,                     │
│             refreshUserData, updateUserProfile           │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│           components/aahanik-app.tsx                     │
│              (Authentication Gate)                       │
│                                                          │
│   loading ──► Spinner / Loading Screen                   │
│   !user   ──► <LoginScreen />                            │
│    user   ──► <HomeScreen />                             │
└───────────┬───────────────────────────┬─────────────────┘
            │                           │
            ▼                           ▼
┌─────────────────────┐   ┌─────────────────────────────────┐
│ components/         │   │   components/home-screen.tsx     │
│ login-screen.tsx    │   │                                  │
│                     │   │  ┌─────────────────────────┐    │
│ - BAPS logo         │   │  │  components/navbar.tsx   │    │
│ - App description   │   │  │  Logo + Greeting +       │    │
│ - Google Sign-In    │   │  │  Logout button           │    │
│   button            │   │  └─────────────────────────┘    │
└─────────────────────┘   │                                  │
                          │  ┌─────────────────────────┐    │
                          │  │ components/dashboard.tsx │    │
                          │  │ Today's Rajipo           │    │
                          │  │ Rajipo Balance           │    │
                          │  │ Streak Count             │    │
                          │  └─────────────────────────┘    │
                          │                                  │
                          │  ┌─────────────────────────┐    │
                          │  │ components/task-list.tsx │    │
                          │  │ 10 daily spiritual tasks │    │
                          │  │ Submit → update Firestore│    │
                          │  │ → refreshUserData()      │    │
                          │  └─────────────────────────┘    │
                          └─────────────────────────────────┘
```

---

## Data Flow

```
User completes tasks
        │
        ▼
task-list.tsx calculates points (completed × 10)
        │
        ▼
Checks if all 10 tasks done → increment streak, else reset
        │
        ▼
Firestore updateDoc({ wallet, streak, lastUpdated })
        │
        ▼
refreshUserData() called → re-fetches user doc from Firestore
        │
        ▼
AuthContext updates userData state
        │
        ▼
Dashboard re-renders with new Rajipo & Streak values
```

---

## Firestore Data Model

```
users/
└── {uid}
    ├── displayName: string
    ├── kshetra: string         // K1 – K12
    ├── wallet: number          // total Rajipo earned
    ├── streak: number          // consecutive full-completion days
    └── lastUpdated: timestamp
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- Firebase project with Auth (Google provider) and Firestore enabled

### Setup

```bash
# Install dependencies
pnpm install

# Add your Firebase config
# Create .env.local with:
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with AuthProvider
│   ├── page.tsx            # Entry point
│   └── globals.css
├── components/
│   ├── aahanik-app.tsx     # Auth gate / app router
│   ├── login-screen.tsx    # Unauthenticated landing page
│   ├── home-screen.tsx     # Main authenticated view
│   ├── navbar.tsx          # Header with logout
│   ├── dashboard.tsx       # Stats cards
│   ├── task-list.tsx       # Daily tasks + submission
│   └── ui/                 # shadcn/ui primitives
├── contexts/
│   └── auth-context.tsx    # Firebase auth + Firestore state
├── lib/
│   ├── firebase.ts         # Firebase app initialization
│   └── utils.ts            # Utility helpers
└── hooks/
    ├── use-mobile.ts
    └── use-toast.ts
```

---

## License

MIT
