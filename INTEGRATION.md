# Asyncra Integration Guide

how to connect the frontend to the backend and AI pipeline.

## overview

the frontend is fully built with mock data. all screens pull data from two zustand stores:
- `lib/auth.ts` — user session (login, signup, profile)
- `lib/store.ts` — app data (courses, deadlines, notifications, comparisons)

both stores currently load mock data on init. to connect to real backend, you just swap the TODO comments in those two files with real API calls.

the API client is already written in `lib/api.ts` — it handles auth tokens, error handling, and request formatting. all you need to do is build the endpoints it expects.

## stack

**frontend:** React Native 0.81, Expo SDK 54, TypeScript, Zustand, NativeWind  
**backend (Kendric):** Express.js, Supabase (PostgreSQL + Auth)  
**AI (Orange):** Groq API, pdf-parse for text extraction

---

## step 1: environment setup

copy `.env.example` to `.env` and fill in:

```
API_BASE_URL=http://localhost:3001/api
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
GROQ_API_KEY=your-groq-key
```

then set `API_BASE_URL` in `lib/api.ts` line 15 to match your server.

---

## step 2: backend (Kendric)

### endpoints to build

every endpoint below is already called by the frontend in `lib/api.ts`. your Express routes need to return JSON matching the types in `lib/types.ts`.

**auth:**
| method | path | request body | response |
|--------|------|-------------|----------|
| POST | /auth/register | `{ email, password, name }` | `{ user: User, token: string }` |
| POST | /auth/login | `{ email, password }` | `{ user: User, token: string }` |
| POST | /auth/logout | — | — |

**user:**
| method | path | request body | response |
|--------|------|-------------|----------|
| GET | /user/profile | — | `User` |
| PUT | /user/profile | partial `User` fields | `User` |
| PUT | /user/onboarding | `{ major, enrollment, goal, weeklyStudyHours }` | `User` |

**courses:**
| method | path | request body | response |
|--------|------|-------------|----------|
| GET | /courses | — | `Course[]` |
| GET | /courses/:id | — | `Course` |
| DELETE | /courses/:id | — | — |

**upload (connects to AI):**
| method | path | request body | response |
|--------|------|-------------|----------|
| POST | /upload/syllabus | FormData with PDF file | `SyllabusAnalysis` |
| POST | /upload/syllabus-url | `{ url }` | `SyllabusAnalysis` |

**other:**
| method | path | request body | response |
|--------|------|-------------|----------|
| GET | /dashboard | — | `DashboardData` |
| GET | /notifications | — | `Notification[]` |
| DELETE | /notifications/:id | — | — |
| GET | /comparisons?q=search | — | `ProgramComparison[]` |

### auth flow

the frontend sends a Bearer token in the Authorization header on every request after login. the token comes from your /auth/register or /auth/login response. use JWT or supabase session tokens.

### supabase tables

```sql
-- users
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  name text not null,
  initials text,
  major text default 'Undeclared',
  enrollment text default 'full-time',
  goal text default '',
  weekly_hours int default 20,
  role text default 'STUDENT',
  avatar_color text default '#5DBFD6',
  created_at timestamptz default now()
);

-- courses (created after AI analyzes a syllabus)
create table courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  title text not null,
  code text not null,
  term text,
  credits int,
  weekly_hours_min int,
  weekly_hours_max int,
  workload text check (workload in ('light', 'medium', 'heavy')),
  grade_weights jsonb,
  hour_breakdown jsonb,
  skills text[],
  ai_summary text,
  created_at timestamptz default now()
);

-- deadlines
create table deadlines (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  course_tag text,
  title text not null,
  type text check (type in ('project', 'exam', 'assignment', 'lab')),
  due_date date not null,
  days_left int
);

-- notifications (generated from deadlines approaching)
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  course_tag text,
  title text not null,
  date text,
  days_left int,
  severity text check (severity in ('danger', 'warning', 'info'))
);

-- program comparisons (can be seeded or fetched from external API)
create table comparisons (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  degree text,
  graduation_rate int,
  avg_starting_salary int,
  career_readiness int,
  workload_intensity int,
  strengths text[],
  weaknesses text[]
);
```

### how to connect

once your endpoints are returning real data, edit these two files:

**lib/auth.ts** — find the `signUp` and `signIn` methods. uncomment the API call lines and delete the mock logic:

```ts
// before (mock):
const user: User = { ...mockUser, id: `u_${Date.now()}`, email, name, ... };
set({ user, token: "mock-token", isAuthenticated: true });

// after (real):
const { authApi } = await import("./api");
const { user, token } = await authApi.register(email, password, name);
set({ user, token, isAuthenticated: true });
```

**lib/store.ts** — find each `fetchX` method. uncomment the API call and remove the mock init data:

```ts
// before:
courses: mockCourses,  // remove this init
fetchCourses: async () => {
  // TODO: const courses = await courseApi.list();
  // set({ courses });
},

// after:
courses: [],  // start empty
fetchCourses: async () => {
  const { courseApi } = await import("./api");
  const courses = await courseApi.list();
  set({ courses });
},
```

then call `fetchDashboard()` / `fetchCourses()` etc. in the relevant screens using `useEffect`.

---

## step 3: AI pipeline (Orange)

### what you need to build

a function that takes raw syllabus text and returns structured JSON.

### your pipeline

1. use `pdf-parse` to extract text from the uploaded PDF
2. send the text to Groq with a prompt that returns JSON
3. the JSON must match the `SyllabusAnalysis` type from `lib/types.ts`

### expected output format

```json
{
  "title": "Introduction to Data Science",
  "code": "CS 301",
  "term": "Fall 2026",
  "credits": 3,
  "weeklyHours": [12, 15],
  "workload": "medium",
  "gradeWeights": {
    "exams": 40,
    "projects": 30,
    "homework": 20,
    "participation": 10
  },
  "hourBreakdown": {
    "lectures": 4,
    "lab": 3,
    "reading": 3,
    "assignments": 5
  },
  "skills": ["Python", "R", "SQL", "Pandas", "NumPy"],
  "deadlines": [
    { "title": "Midterm Exam", "type": "exam", "dueDate": "2026-03-27" },
    { "title": "Final Project", "type": "project", "dueDate": "2026-04-24" }
  ],
  "aiSummary": "This course covers data science fundamentals with Python. Expect 12-15 hours per week with a project-heavy second half."
}
```

### field rules

- `workload`: must be `"light"`, `"medium"`, or `"heavy"`
- `deadlines[].type`: must be `"project"`, `"exam"`, `"assignment"`, or `"lab"`
- `deadlines[].dueDate`: ISO format `"YYYY-MM-DD"`
- `gradeWeights`: values should sum to 100
- `weeklyHours`: array of `[min, max]`
- `skills`: array of strings, tools and technologies mentioned in the syllabus

### where it connects

Kendric's backend receives the PDF at `POST /upload/syllabus`, extracts text with your pdf-parse code, sends it to your Groq function, and returns the result as `SyllabusAnalysis` JSON.

---

## step 4: testing the connection

1. start backend: `npm run dev` (in server folder)
2. set `API_BASE_URL` in `lib/api.ts`
3. run frontend: `npx expo start`
4. create an account through the app flow
5. upload a real syllabus PDF
6. verify the course shows up on the dashboard with real data

### what to check

- [ ] signup creates a user in supabase
- [ ] login returns a valid token
- [ ] uploading a PDF returns parsed course data
- [ ] dashboard shows the user's real courses
- [ ] course detail shows real grade weights, hours, skills, deadlines
- [ ] notifications are generated from upcoming deadlines
- [ ] profile shows and saves real user data
- [ ] sign out clears session and returns to welcome screen

---

## file reference

| file | what it does |
|------|-------------|
| `lib/types.ts` | all shared TypeScript types — your API responses must match these |
| `lib/api.ts` | fetch client with all endpoint calls — set API_BASE_URL here |
| `lib/auth.ts` | user session store — swap mock logic with real API calls |
| `lib/store.ts` | app data store — swap mock data with real API calls |
| `lib/mockData.ts` | mock data for development — delete when backend is fully connected |
