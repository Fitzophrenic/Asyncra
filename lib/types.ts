// all the shared types for the app
// backend responses need to match these shapes

export type Workload = "light" | "medium" | "heavy";
export type DeadlineType = "project" | "exam" | "assignment" | "lab";
export type MeetingType = "lecture" | "lab" | "section" | "office-hours" | "other";
export type Weekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

export type MeetingTime = {
  day: Weekday;
  type: MeetingType;
  start: string;   // 24h "HH:MM" like "14:00"
  end: string;     // 24h "HH:MM" like "15:30"
  location?: string;
};

export type GradeScaleRow = {
  letter: string;      // "A+", "A", "A-", "B+", etc.
  minPercent: number;  // inclusive lower bound
};

export type Instructor = {
  name: string;
  email?: string;
  office?: string;       // e.g. "MATH 239", "3272H - Patrick F. Taylor Hall"
  phone?: string;
  officeHours?: string;  // free-form, e.g. "MTWTh 1:00-2:00pm (Zoom)"
};

export type Textbook = {
  title: string;
  author?: string;
  edition?: string;
  isbn?: string;
  required?: boolean;    // true = required, false = recommended
};

export type Deadline = {
  id: string;
  courseId: string;
  courseTag: string;
  title: string;
  type: DeadlineType;
  dueDate: string; // ISO format like "2026-03-20"
  daysLeft: number;
};

export type GradeWeights = {
  exams: number;
  projects: number;
  homework: number;
  participation: number;
};

export type HourBreakdown = {
  lectures: number;
  lab: number;
  reading: number;
  assignments: number;
};

export type Course = {
  id: string;
  title: string;
  code: string;
  term: string;
  credits: number;
  weeklyHours: [number, number]; // [min, max]
  workload: Workload;
  gradeWeights: GradeWeights;
  hourBreakdown: HourBreakdown;
  skills: string[];
  deadlines: Deadline[];
  aiSummary?: string;
  description?: string;
  meetingTimes?: MeetingTime[];
  gradingScale?: GradeScaleRow[];
  instructor?: Instructor;
  textbook?: Textbook;
  prerequisites?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  initials: string;
  major: string;
  enrollment: "full-time" | "part-time";
  goal: string;
  weeklyHours: number;
  role: "STUDENT";
  avatarColor?: string;
};

export type Notification = {
  id: string;
  courseTag: string;
  title: string;
  date: string;
  daysLeft: number;
  severity: "danger" | "warning" | "info";
};

export type ProgramComparison = {
  id: string;
  institution: string;
  degree: string;
  graduationRate: number;
  avgStartingSalary: number;
  careerReadiness: number;
  workloadIntensity: number;
  strengths: string[];
  weaknesses: string[];
};

export type DashboardData = {
  user: User;
  totalCredits: number;
  weeklyHours: [number, number];
  alerts: { severity: "warning" | "danger" | "info" | "success"; title: string; subtitle: string }[];
  courses: Course[];
  upcomingDeadlines: Deadline[];
};

// what the AI returns after parsing a syllabus PDF
export type SyllabusAnalysis = {
  title: string;
  code: string;
  term: string;
  credits: number;
  weeklyHours: [number, number];
  workload: Workload;
  gradeWeights: GradeWeights;
  hourBreakdown: HourBreakdown;
  skills: string[];
  deadlines: {
    title: string;
    type: DeadlineType;
    dueDate: string;
  }[];
  aiSummary: string;
  description: string;
  meetingTimes: MeetingTime[];
  gradingScale: GradeScaleRow[];
  instructor: Instructor;
  textbook: Textbook;
  prerequisites: string;
};

// collected during onboarding steps
export type OnboardingData = {
  major: string;
  enrollment: "full-time" | "part-time";
  goal: string;
  weeklyStudyHours: number;
};
