# Asyncra

AI-powered syllabus organizer for college students. Upload a PDF syllabus and get instant course analysis, deadline tracking, workload breakdowns, and program comparisons.

Built with React Native (Expo), Node/Express, Supabase, and Groq AI.

---

## Prerequisites

Make sure you have these installed before starting:

- **Node.js** (v18 or higher) — [download here](https://nodejs.org/)
- **Git** — [download here](https://git-scm.com/)
- **Expo Go app** (only if testing on your phone) — download from App Store / Google Play

---

## Quick Start

### 1. Clone the repo

```bash
git clone https://github.com/Fitzophrenic/Asyncra.git
cd Asyncra
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Set up the backend

```bash
cd server
npm install
```

Now create the environment file. Copy the example and fill in real values:

```bash
# Windows
copy ..\.env.example .env

# Mac/Linux
cp ../.env.example .env
```

Open `server/.env` and fill in your keys:

```env
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SECRET_KEY=your-service-role-key
JWT_SECRET=any-long-random-string
GROQ_API_KEY=your-groq-key
SCORECARD_API_KEY=your-scorecard-key
```

> **Where to get these:**
> - Supabase keys → [supabase.com](https://supabase.com) → your project → Settings → API
> - Groq API key → [console.groq.com](https://console.groq.com)
> - Scorecard API key → [api.data.gov/signup](https://api.data.gov/signup/) (free, instant)
> - JWT secret → make up any long random string

### 4. Start the backend

```bash
# still in the server/ folder
node index.js
```

You should see:

```
Server running on port 3001
```

Keep this terminal open.

### 5. Start the frontend

Open a **new terminal** and go back to the project root:

```bash
# from the project root (not server/)
npx expo start -c
```

This starts the Expo dev server. You'll see a menu with options.

---

## How to View the App

### Option A: Web Browser (easiest)

Press **`w`** in the Expo terminal. The app opens in your browser at `http://localhost:8081`.

**No config changes needed** — `localhost` works out of the box for web.

---

### Option B: Phone with Expo Go

This requires one extra step because your phone can't reach `localhost` (that points to the phone itself, not your computer).

#### Step 1: Find your computer's IP address

**Windows:**
```bash
ipconfig
```
Look for `Wireless LAN adapter Wi-Fi` → `IPv4 Address` (something like `192.168.1.42`)

**Mac:**
```bash
ifconfig | grep "inet "
```
Look for the `192.168.x.x` address (not `127.0.0.1`)

#### Step 2: Update the API URL

Open `lib/api.ts` and change line 15:

```ts
// change to your LAN IP for phone testing
const API_BASE_URL = "http://192.168.1.42:3001";  // ← your IP here
```

> **Important:** Your phone and computer must be on the **same Wi-Fi network**.

#### Step 3: Scan the QR code

In the Expo terminal, scan the QR code with:
- **iPhone:** Camera app
- **Android:** Expo Go app

The app will load on your phone.

#### Step 4: Change back before committing

Before you push any code, change the URL back to localhost:

```ts
const API_BASE_URL = "http://localhost:3001";
```

---

## Project Structure

```
Asyncra/
├── lib/              # API client, auth, state management, types
├── screens/          # All app screens (dashboard, upload, compare, etc.)
├── components/       # Reusable UI components
├── navigation/       # React Navigation setup
├── assets/           # Images and fonts
├── server/           # Backend (Express + Supabase + Groq)
│   ├── index.js      # Entry point
│   ├── ai.js         # Groq syllabus analysis
│   ├── supabase.js   # Database client
│   ├── routes/       # API routes (auth, courses, upload, user)
│   └── middleware/    # JWT auth middleware
├── .env.example      # Template for environment variables
└── App.tsx           # App entry point
```

---

## Common Issues

| Problem | Fix |
|---------|-----|
| `ECONNREFUSED` on phone | You're still using `localhost`. Change to your LAN IP in `lib/api.ts` |
| Backend won't start | Make sure `server/.env` exists and has all 7 variables filled in |
| `Cannot find module 'xyz'` | Run `npm install` in both the root folder AND the `server/` folder |
| Phone can't connect | Make sure phone and computer are on the same Wi-Fi network |
| Expo QR code won't scan | Try pressing `s` in Expo terminal to switch to Expo Go mode |
| PDF upload fails | Check that `GROQ_API_KEY` is set correctly in `server/.env` |

---

## Tech Stack

- **Frontend:** React Native, Expo, TypeScript, Zustand, React Navigation
- **Backend:** Node.js, Express
- **Database:** Supabase (PostgreSQL)
- **AI:** Groq (Llama 3.3 70B)
- **External API:** College Scorecard (program comparisons)
