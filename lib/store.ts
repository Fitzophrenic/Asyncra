// app data store - all the data screens need lives here
// currently uses mock data, swap fetch methods to real api calls later

import { create } from "zustand";
import type { Course, Deadline, Notification, ProgramComparison, DashboardData } from "./types";
import {
  mockCourses,
  mockDeadlines,
  mockNotifications,
  mockComparisons,
  mockDashboard,
} from "./mockData";

type AppStore = {
  courses: Course[];
  deadlines: Deadline[];
  notifications: Notification[];
  comparisons: ProgramComparison[];
  dashboard: DashboardData;
  isLoading: boolean;

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

  // data fetching - replace with api calls
  fetchDashboard: () => Promise<void>;
  fetchCourses: () => Promise<void>;
  fetchCourse: (id: string) => Course | undefined;
  fetchNotifications: () => Promise<void>;
  fetchComparisons: (query?: string) => Promise<void>;
  dismissNotification: (id: string) => void;
  addCourse: (course: Course) => void;
  removeCourse: (id: string) => void;
};

export const useAppStore = create<AppStore>((set, get) => ({
  courses: mockCourses,
  deadlines: mockDeadlines,
  notifications: mockNotifications,
  comparisons: mockComparisons,
  dashboard: mockDashboard,
  isLoading: false,
  studyLogs: [],

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
    // TODO: const data = await dashboardApi.get();
    // set({ dashboard: data, courses: data.courses });
  },

  fetchCourses: async () => {
    // TODO: const courses = await courseApi.list();
    // set({ courses });
  },

  fetchCourse: (id) => get().courses.find((c) => c.id === id),

  fetchNotifications: async () => {
    // TODO: const notifs = await notificationApi.list();
    // set({ notifications: notifs });
  },

  fetchComparisons: async (_query?: string) => {
    // TODO: const comps = await comparisonApi.list(query);
    // set({ comparisons: comps });
  },

  dismissNotification: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),

  addCourse: (course) =>
    set((s) => ({
      courses: [...s.courses, course],
      dashboard: {
        ...s.dashboard,
        courses: [...s.dashboard.courses, course],
        totalCredits: s.dashboard.totalCredits + course.credits,
      },
    })),

  removeCourse: (id) =>
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
    }),
}));
