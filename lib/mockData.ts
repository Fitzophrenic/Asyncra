export type Workload = "light" | "medium" | "heavy";
export type DeadlineType = "project" | "exam" | "assignment" | "lab";

export type Deadline = {
  id: string;
  courseId: string;
  courseTag: string;
  title: string;
  type: DeadlineType;
  dueDate: string;
  daysLeft: number;
};

export type Course = {
  id: string;
  title: string;
  code: string;
  term: string;
  credits: number;
  weeklyHours: [number, number];
  workload: Workload;
  gradeWeights: { exams: number; projects: number; homework: number; participation: number };
  hourBreakdown: { lectures: number; lab: number; reading: number; assignments: number };
  skills: string[];
  deadlines: Deadline[];
  aiSummary?: string;
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

export const mockUser: User = {
  id: "u_1",
  name: "John Doe",
  email: "john@university.edu",
  initials: "JD",
  major: "Computer Science",
  enrollment: "full-time",
  goal: "Graduate with honors",
  weeklyHours: 20,
  role: "STUDENT",
};

export const mockDeadlines: Deadline[] = [
  { id: "d1", courseId: "c1", courseTag: "Data Science", title: "Project Proposal", type: "project", dueDate: "2026-03-20", daysLeft: 1 },
  { id: "d2", courseId: "c1", courseTag: "Data Science", title: "Midterm Exam", type: "exam", dueDate: "2026-03-27", daysLeft: 8 },
  { id: "d3", courseId: "c1", courseTag: "Data Science", title: "Homework 5", type: "assignment", dueDate: "2026-04-03", daysLeft: 15 },
  { id: "d4", courseId: "c1", courseTag: "Data Science", title: "Lab Report", type: "lab", dueDate: "2026-04-10", daysLeft: 22 },
  { id: "d5", courseId: "c1", courseTag: "Data Science", title: "Final Project", type: "project", dueDate: "2026-04-24", daysLeft: 36 },
  { id: "d6", courseId: "c2", courseTag: "Algorithms", title: "Midterm Exam", type: "exam", dueDate: "2026-03-22", daysLeft: 5 },
  { id: "d7", courseId: "c3", courseTag: "Web Dev", title: "Lab Assignment", type: "assignment", dueDate: "2026-03-20", daysLeft: 2 },
];

export const mockCourses: Course[] = [
  {
    id: "c1",
    title: "Introduction to Data Science",
    code: "CS 301",
    term: "Fall 2026",
    credits: 3,
    weeklyHours: [12, 15],
    workload: "medium",
    gradeWeights: { exams: 40, projects: 30, homework: 20, participation: 10 },
    hourBreakdown: { lectures: 4, lab: 3, reading: 3, assignments: 5 },
    skills: ["Python", "R", "SQL", "Pandas", "NumPy", "Matplotlib", "Statistical Analysis", "Machine Learning", "Data Visualization"],
    deadlines: mockDeadlines.filter((d) => d.courseId === "c1"),
    aiSummary: "This course covers the fundamentals of data science with a heavy focus on Python and statistical analysis. Expect 12-15 hours of work per week with a project-heavy second half of the semester.",
  },
  {
    id: "c2",
    title: "Advanced Algorithms",
    code: "CS 402",
    term: "Fall 2026",
    credits: 4,
    weeklyHours: [15, 18],
    workload: "heavy",
    gradeWeights: { exams: 50, projects: 25, homework: 20, participation: 5 },
    hourBreakdown: { lectures: 5, lab: 2, reading: 5, assignments: 6 },
    skills: ["C++", "Graph Theory", "Dynamic Programming", "Complexity Analysis", "Data Structures"],
    deadlines: mockDeadlines.filter((d) => d.courseId === "c2"),
    aiSummary: "A demanding theoretical course. Heavy reading load and exam-weighted grading. Plan for 15-18 hours weekly and start problem sets early.",
  },
  {
    id: "c3",
    title: "Web Development",
    code: "CS 250",
    term: "Fall 2026",
    credits: 3,
    weeklyHours: [8, 10],
    workload: "light",
    gradeWeights: { exams: 20, projects: 50, homework: 20, participation: 10 },
    hourBreakdown: { lectures: 3, lab: 2, reading: 1, assignments: 4 },
    skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "REST APIs"],
    deadlines: mockDeadlines.filter((d) => d.courseId === "c3"),
    aiSummary: "Project-based and practical. Lighter workload than other CS courses. Most learning happens through hands-on labs and a final web app project.",
  },
];

export const mockNotifications: Notification[] = [
  { id: "n1", courseTag: "DATA SCIENCE", title: "Project Proposal due tomorrow", date: "Mar 19", daysLeft: 1, severity: "danger" },
  { id: "n2", courseTag: "ALGORITHMS", title: "Midterm exam in 5 days", date: "Mar 22", daysLeft: 5, severity: "warning" },
  { id: "n3", courseTag: "WEB DEVELOPMENT", title: "Lab assignment due in 2 days", date: "Mar 20", daysLeft: 2, severity: "danger" },
  { id: "n4", courseTag: "DATA SCIENCE", title: "Reading assignment posted", date: "Mar 18", daysLeft: 7, severity: "info" },
];

export const mockComparisons: ProgramComparison[] = [
  {
    id: "p1",
    institution: "University of California, Berkeley",
    degree: "Computer Science, B.S.",
    graduationRate: 92,
    avgStartingSalary: 98,
    careerReadiness: 85,
    workloadIntensity: 78,
    strengths: ["Strong industry connections", "Excellent research opportunities", "Diverse course offerings"],
    weaknesses: ["High cost of living", "Large class sizes"],
  },
  {
    id: "p2",
    institution: "Massachusetts Institute of Technology",
    degree: "Computer Science, B.S.",
    graduationRate: 95,
    avgStartingSalary: 115,
    careerReadiness: 95,
    workloadIntensity: 92,
    strengths: ["World-class faculty", "Cutting-edge curriculum", "High job placement rate"],
    weaknesses: ["Extremely competitive", "Very high workload intensity"],
  },
];

export const mockDashboard = {
  user: mockUser,
  totalCredits: 10,
  weeklyHours: [35, 43] as [number, number],
  alerts: [{ severity: "warning" as const, title: "Heavy week detected", subtitle: "Week of March 18-24 has 3 major deadlines" }],
  courses: mockCourses,
  upcomingDeadlines: mockDeadlines.slice(0, 5),
};
