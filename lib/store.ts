// app data store - all the data screens need lives here
// currently uses real api fetch methods

import { create } from "zustand";
import type { Course, Deadline, Notification, ProgramComparison, DashboardData, SyllabusAnalysis } from "./types";
import { dashboardApi, courseApi, notificationApi, comparisonApi } from "./api";

type AppStore = {
  courses: Course[];
  deadlines: Deadline[];
  notifications: Notification[];
  comparisons: ProgramComparison[];
  dashboard: DashboardData;
  isLoading: boolean;

  // holds preview analysis until signup saves it as a course
  pendingAnalysis: SyllabusAnalysis | null;
  setPendingAnalysis: (analysis: SyllabusAnalysis | null) => void;

  // study timer logs (stored locally for now)
  studyLogs: {
    id: string;
    courseCode: string;
    courseName: string;
    duration: number;
    timestamp: Date;
  }[];
  addStudyLog: (log: { courseCode: string; courseName: string; duration: number }) => void;
  removeStudyLog: (id: string) => void;

  // data fetching
  fetchDashboard: () => Promise<void>;
  fetchCourses: () => Promise<void>;
  fetchCourse: (id: string) => Course | undefined;
  fetchNotifications: () => Promise<void>;
  fetchComparisons: (query?: string) => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
  addCourse: (course: Course) => void;
  removeCourse: (id: string) => Promise<void>;
};

export const useAppStore = create<AppStore>((set, get) => ({
  courses: [],
  deadlines: [],
  notifications: [],
  comparisons: [],
  dashboard: {
    user: {
      id: "",
      name: "",
      email: "",
      initials: "",
      major: "",
      enrollment: "full-time",
      goal: "",
      weeklyHours: 0,
      role: "STUDENT",
    },
    totalCredits: 0,
    weeklyHours: [0, 0],
    alerts: [],
    courses: [],
    upcomingDeadlines: [],
  },
  isLoading: false,
  studyLogs: [],
  pendingAnalysis: null,

  setPendingAnalysis: (analysis) => set({ pendingAnalysis: analysis }),

  addStudyLog: (log) =>
    set((s) => ({
      studyLogs: [
        { ...log, id: `log-${Date.now()}`, timestamp: new Date() },
        ...s.studyLogs,
      ],
    })),

  removeStudyLog: (id) =>
    set((s) => ({ studyLogs: s.studyLogs.filter((l) => l.id !== id) })),

  fetchDashboard: async () => {
    set({ isLoading: true });
    try {
      const data = await dashboardApi.get();
      set({
        dashboard: data,
        courses: data.courses,
        deadlines: data.upcomingDeadlines,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCourses: async () => {
    set({ isLoading: true });
    try {
      const courses = await courseApi.list();
      set({ courses });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCourse: (id) => get().courses.find((c) => c.id === id),

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const notifications = await notificationApi.list();
      set({ notifications });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchComparisons: async (query?: string) => {
    set({ isLoading: true });
    try {
      const comparisons = await comparisonApi.list(query);
      set({ comparisons });
    } finally {
      set({ isLoading: false });
    }
  },

  dismissNotification: async (id) => {
    await notificationApi.dismiss(id);
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    }));
  },

  addCourse: (course) =>
    set((s) => ({
      courses: [...s.courses, course],
      dashboard: {
        ...s.dashboard,
        courses: [...s.dashboard.courses, course],
        totalCredits: s.dashboard.totalCredits + course.credits,
      },
    })),

  removeCourse: async (id) => {
    await courseApi.remove(id);
    set((s) => {
      const course = s.courses.find((c) => c.id === id);
      return {
        courses: s.courses.filter((c) => c.id !== id),
        dashboard: {
          ...s.dashboard,
          courses: s.dashboard.courses.filter((c) => c.id !== id),
          totalCredits: s.dashboard.totalCredits - (course?.credits ?? 0),
        },
      };
    });
  },
}));