# Asyncra Backend
Built by Kendric Washington — Backend Lead

---

## Setup

**1. Navigate to the server folder**
```bash
cd server
```

**2. Install dependencies**
```bash
npm install
```

**3. Create your .env file**
Create a file called `.env` inside the `server` folder and paste the contents I shared in the private Discord channel.
> ⚠️ Never commit this file to GitHub — it is already in .gitignore.

**4. Start the server**
```bash
node index.js
```
You should see: `Server running on port 3001`

**5. Set the API base URL**
In `lib/api.ts` line 15 set:
```ts
const API_BASE_URL = "http://localhost:3001";
```

---

## For Orange (AI)
Your Groq function goes in `server/ai.js`. Replace the placeholder with your real implementation. The function receives raw syllabus text and must return a `SyllabusAnalysis` object matching `lib/types.ts`.

---

## For Ethan (Frontend)
Update `lib/auth.ts` and `lib/store.ts` to use real API calls instead of mock data. Full instructions in `INTEGRATION.md`.

---

## Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Create account |
| POST | /auth/login | Log in |
| POST | /auth/logout | Log out |
| GET | /user/profile | Get user |
| PUT | /user/profile | Update profile |
| PUT | /user/onboarding | Save onboarding |
| GET | /courses | Get all courses |
| GET | /courses/:id | Get one course |
| DELETE | /courses/:id | Delete course |
| POST | /upload/syllabus | Upload PDF |
| POST | /upload/syllabus-url | Analyze PDF from URL |
| GET | /dashboard | Dashboard data |
| GET | /notifications | Get notifications |
| DELETE | /notifications/:id | Dismiss notification |
| GET | /comparisons | Program comparisons |

---

## Questions?
Message Kendric in Discord.