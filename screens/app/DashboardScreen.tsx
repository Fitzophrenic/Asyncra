import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, Plus, Clock, BookOpen, Timer, Calculator, BarChart3 } from "lucide-react-native";
import type { Course } from "../../lib/types";
import { useAuth } from "../../lib/auth";
import { useAppStore } from "../../lib/store";
import { useTheme, tokens, useSidebar } from "../../lib/theme";
import { useIsWide } from "../../components/layout/AppShell";

import CourseCard from "../../components/domain/CourseCard";
import AlertBanner from "../../components/ui/AlertBanner";
import Appear, { useFocusKey } from "../../components/ui/Appear";
import { Logo } from "../../components/ui/Logo";
import TodayFocus from "../../components/domain/TodayFocus";
import WeeklyProgressRing from "../../components/domain/WeeklyProgressRing";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View className="rounded-2xl p-5" style={{ flex: 1, backgroundColor: "#4A9BB5" }}>
      <Text className="text-white/90 text-xs font-bold tracking-widest uppercase">{label}</Text>
      <Text className="text-white text-4xl font-bold mt-2">{value}</Text>
    </View>
  );
}

function dateParts(iso: string) {
  const d = new Date(iso);
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  const day = String(d.getDate()).padStart(2, "0");
  return { month, day };
}

function urgencyColor(daysLeft: number) {
  if (daysLeft <= 1) return "#E25C5C";
  if (daysLeft <= 3) return "#E0A23A";
  if (daysLeft <= 7) return "#5DBFD6";
  return "#3FBF7F";
}

function QuickAction({ label, Icon, color, onPress, mode }: { label: string; Icon: any; color: string; onPress: () => void; mode: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        flex: 1,
        backgroundColor: mode === "dark" ? "rgba(255,255,255,0.04)" : "#F8FAFC",
      }}
    >
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${color}18`, alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
        <Icon size={18} color={color} />
      </View>
      <Text style={{ fontSize: 11, fontWeight: "600", color: mode === "dark" ? "#B6C2D1" : "#475569", textAlign: "center" }}>{label}</Text>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const navigation = useNavigation<any>();
  const mode = useTheme((s) => s.mode);
  const t = tokens[mode];
  const isWide = useIsWide();
  const user = useAuth((s) => s.user);
  const courses = useAppStore((s) => s.courses);
  const dashboard = useAppStore((s) => s.dashboard);
  const firstName = (user?.name ?? "Student").split(" ")[0];

  // Only animate on first mount, not when returning from stack screens
  const [animKey] = React.useState(() => Date.now());
  const focusKey = animKey;

  const goToCourse = (course: Course) => {
    navigation.navigate("CourseDetail", { courseId: course.id });
  };

  const setSidebarPinned = useSidebar((s) => s.setPinned);
  useFocusEffect(
    React.useCallback(() => {
      setSidebarPinned(true);
      return () => setSidebarPinned(false);
    }, [setSidebarPinned])
  );

  return (
    <SafeAreaView className={`flex-1 ${t.bg}`} edges={["bottom"]}>
      <View
        style={{
          backgroundColor: "#1B3A6B",
          paddingHorizontal: isWide ? 40 : 24,
          paddingTop: isWide ? 28 : 70,
          paddingBottom: isWide ? 24 : 28,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ fontSize: isWide ? 32 : 28, fontWeight: "600", color: "#FFFFFF" }}>
            Welcome, {firstName} 👋
          </Text>
          {!isWide && <Logo size={36} />}
        </View>
      </View>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: isWide ? 40 : 20,
          paddingTop: 20,
          paddingBottom: 48,
        }}
      >
        <View style={{ width: "100%" }}>
          {/* Today's Focus + Alert side by side */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
            <Appear from="down" delay={40} duration={500} key={`focus-${focusKey}`} style={{ flex: 1 }}>
              <TodayFocus />
            </Appear>
            <Appear from="down" delay={100} duration={500} key={`alert-${focusKey}`} style={{ flex: 1 }}>
              <AlertBanner
                severity={dashboard.alerts[0].severity}
                title={dashboard.alerts[0].title}
                subtitle={dashboard.alerts[0].subtitle}
              />
            </Appear>
          </View>

          {/* Stat tiles */}
          <View style={{ flexDirection: "row", gap: 16, marginBottom: 16 }}>
            <Appear delay={140} duration={550} style={{ flex: 1 }} key={`credits-${focusKey}`}>
              <StatTile label="TOTAL CREDITS" value={String(dashboard.totalCredits)} />
            </Appear>
            <Appear delay={200} duration={550} style={{ flex: 1 }} key={`hours-${focusKey}`}>
              <StatTile label="WEEKLY HOURS" value="35–43" />
            </Appear>
          </View>

          {/* Weekly progress */}
          <Appear from="down" delay={260} duration={550} key={`progress-${focusKey}`}>
            <WeeklyProgressRing logged={14} target={20} />
          </Appear>

          {/* Quick actions */}
          <Appear from="down" delay={320} duration={500} key={`quick-${focusKey}`}>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 8, marginBottom: 16 }}>
              <QuickAction label="Calendar" Icon={Calendar} color="#1B3A6B" onPress={() => navigation.navigate("WeeklyCalendar")} mode={mode} />
              <QuickAction label="Timer" Icon={Timer} color="#5DBFD6" onPress={() => navigation.navigate("StudyTimer")} mode={mode} />
              <QuickAction label="GPA" Icon={Calculator} color="#3FBF7F" onPress={() => navigation.navigate("GpaCalculator")} mode={mode} />
              <QuickAction label="Compare" Icon={BarChart3} color="#E0A23A" onPress={() => navigation.navigate("CourseCompare")} mode={mode} />
            </View>
          </Appear>

          {/* Courses */}
          <Text className={`mt-6 mb-4 text-2xl font-bold ${t.text}`}>Your Courses</Text>
          <View className={isWide ? "flex-row flex-wrap -mx-2" : ""}>
            {courses.map((c, i) => (
              <Appear
                key={`${c.id}-${focusKey}`}
                from="down"
                delay={380 + i * 90}
                duration={550}
                className={isWide ? "px-2 mb-4" : "mb-4"}
                style={isWide ? { width: "33.3333%" } : undefined}
              >
                <CourseCard course={c} onPress={() => goToCourse(c)} />
              </Appear>
            ))}
            <View
              className={isWide ? "px-2 mb-4" : "mb-4"}
              style={isWide ? { width: "33.3333%" } : undefined}
            >
              <Pressable
                onPress={() => navigation.navigate("Upload")}
                className="border-2 border-dashed border-asy-accent rounded-2xl items-center justify-center p-5"
              >
                <View className="bg-asy-accent/15 p-4 rounded-full mb-2">
                  <Plus size={20} color="#6EC4DE" />
                </View>
                <Text className="text-asy-accent font-semibold">Upload More Courses</Text>
                <Text className={`text-xs mt-1 ${t.textMuted}`}>Upload one or more syllabi at a time</Text>
              </Pressable>
            </View>
          </View>

          {/* Upcoming Deadlines with urgency colors */}
          <View className="mt-10 flex-row items-center justify-between mb-4">
            <Text className={`text-2xl font-bold ${t.text}`}>Upcoming Deadlines</Text>
            <Pressable className="flex-row items-center gap-1">
              <Calendar size={14} color="#6EC4DE" />
              <Text className="text-xs font-bold text-asy-accent tracking-wider">EXPORT</Text>
            </Pressable>
          </View>

          <View className={`${t.bgCard} border ${t.border} rounded-2xl p-3`}>
            {dashboard.upcomingDeadlines.map((d, i) => {
              const { month, day } = dateParts(d.dueDate);
              const color = urgencyColor(d.daysLeft);
              return (
                <View
                  key={d.id}
                  className={`flex-row items-center py-3 px-2 ${i > 0 ? `border-t ${t.border}` : ""}`}
                >
                  <View style={{ width: 4, height: 36, borderRadius: 2, backgroundColor: color, marginRight: 12 }} />
                  <View className="flex-1">
                    <Text className={`text-sm font-semibold ${t.text}`}>{d.title}</Text>
                    <Text className={`text-xs mt-0.5 ${t.textMuted}`}>{d.courseTag}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <View style={{ backgroundColor: color, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                      <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "700", letterSpacing: 0.5 }}>
                        {month} {day}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 10, color, fontWeight: "600", marginTop: 2 }}>
                      {d.daysLeft === 0 ? "Today" : d.daysLeft === 1 ? "Tomorrow" : `${d.daysLeft}d left`}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
