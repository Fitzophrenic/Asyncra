import React from "react";
import { ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { RootStackParamList } from "../../navigation/RootNavigator";
import { useAppStore } from "../../lib/store";
import { useTheme, tokens } from "../../lib/theme";
import { useIsWide } from "../../components/layout/AppShell";
import { parseIsoLocal } from "../../lib/dateUtils";
import type { MeetingType, Weekday } from "../../lib/types";

import HeaderBand from "../../components/ui/HeaderBand";
import Card from "../../components/ui/Card";
import Appear, { useFocusKey } from "../../components/ui/Appear";

type Props = NativeStackScreenProps<RootStackParamList, "WeeklyCalendar">;

const DAYS: Weekday[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const COURSE_COLORS = ["#1B3A6B", "#E0A23A", "#3FBF7F", "#8B5CF6", "#E25C5C", "#5DBFD6"];

type Block = {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  type: MeetingType;
  start: string;
  end: string;
  location?: string;
  color: string;
};

function formatType(type: MeetingType) {
  if (type === "office-hours") return "Office Hours";
  return type.charAt(0).toUpperCase() + type.slice(1);
}

function formatTime12h(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export default function WeeklyCalendarScreen({ navigation }: Props) {
  const mode = useTheme((s) => s.mode);
  const t = tokens[mode];
  const isWide = useIsWide();
  const focusKey = useFocusKey();
  const courses = useAppStore((s) => s.courses);

  const courseColor = (courseId: string) => {
    const idx = courses.findIndex((c) => c.id === courseId);
    return COURSE_COLORS[(idx >= 0 ? idx : 0) % COURSE_COLORS.length];
  };

  // group all meeting times by weekday
  const blocksByDay: Record<Weekday, Block[]> = {
    Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: [],
  };
  courses.forEach((c) => {
    (c.meetingTimes ?? []).forEach((m) => {
      blocksByDay[m.day].push({
        courseId: c.id,
        courseCode: c.code,
        courseTitle: c.title,
        type: m.type,
        start: m.start,
        end: m.end,
        location: m.location,
        color: courseColor(c.id),
      });
    });
  });
  DAYS.forEach((d) => blocksByDay[d].sort((a, b) => a.start.localeCompare(b.start)));

  // upcoming deadlines across all courses within the next 7 days
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekEnd = new Date(startOfToday);
  weekEnd.setDate(startOfToday.getDate() + 7);

  type EnrichedDeadline = {
    id: string;
    title: string;
    type: string;
    dueDate: string;
    courseCode: string;
    color: string;
  };
  const weekDeadlines: EnrichedDeadline[] = [];
  courses.forEach((c) => {
    c.deadlines.forEach((d) => {
      const dt = parseIsoLocal(d.dueDate);
      if (dt >= startOfToday && dt <= weekEnd) {
        weekDeadlines.push({
          id: d.id,
          title: d.title,
          type: d.type,
          dueDate: d.dueDate,
          courseCode: c.code,
          color: courseColor(c.id),
        });
      }
    });
  });
  weekDeadlines.sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const hasAnyMeetings = DAYS.some((d) => blocksByDay[d].length > 0);
  const daysToShow: Weekday[] = isWide
    ? DAYS
    : DAYS.filter((d) => blocksByDay[d].length > 0);

  return (
    <SafeAreaView className={`flex-1 ${t.bg}`} edges={["bottom"]}>
      <HeaderBand
        showBack
        onBack={() => navigation.goBack()}
        title="Weekly Schedule"
        subtitle="Your classes and deadlines at a glance"
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: isWide ? 48 : 20,
          paddingTop: 20,
          paddingBottom: 110,
        }}
      >
        {/* Legend from real courses */}
        {courses.length > 0 && (
          <Appear from="down" delay={50} duration={400} key={`legend-${focusKey}`}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
              {courses.map((c) => (
                <View key={c.id} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: courseColor(c.id) }} />
                  <Text className={`text-xs font-semibold ${t.textMuted}`}>{c.code}</Text>
                </View>
              ))}
            </View>
          </Appear>
        )}

        {!hasAnyMeetings && courses.length > 0 ? (
          <Appear from="down" delay={100} duration={500} key={`no-sched-${focusKey}`}>
            <Card className="p-6 mb-6" elevated>
              <Text className={`text-base font-semibold mb-1 ${t.text}`}>No class times to show</Text>
              <Text className={`text-sm ${t.textMuted}`}>
                Your syllabi didn't specify weekly meeting times (online courses, TBD, etc.). Upload a syllabus with set class times to see a schedule.
              </Text>
            </Card>
          </Appear>
        ) : courses.length === 0 ? (
          <Appear from="down" delay={100} duration={500} key={`empty-${focusKey}`}>
            <Card className="p-6 mb-6" elevated>
              <Text className={`text-base font-semibold mb-1 ${t.text}`}>No courses yet</Text>
              <Text className={`text-sm ${t.textMuted}`}>Upload a syllabus to see your schedule.</Text>
            </Card>
          </Appear>
        ) : (
          <View style={isWide ? { flexDirection: "row", gap: 12, flexWrap: "wrap" } : {}}>
            {daysToShow.map((day, di) => {
              const blocks = blocksByDay[day];
              return (
                <Appear
                  from="down"
                  delay={100 + di * 60}
                  duration={500}
                  key={`${day}-${focusKey}`}
                  style={isWide ? { flex: 1, minWidth: 140 } : { marginBottom: 12 }}
                >
                  <Card className="p-4" elevated>
                    <Text className={`text-sm font-bold mb-3 ${t.text}`}>{day}</Text>
                    {blocks.length === 0 ? (
                      <Text className={`text-xs ${t.textMuted}`}>No classes</Text>
                    ) : (
                      blocks.map((b, bi) => (
                        <View
                          key={bi}
                          style={{
                            flexDirection: "row",
                            marginBottom: 8,
                            borderLeftWidth: 3,
                            borderLeftColor: b.color,
                            paddingLeft: 10,
                            paddingVertical: 6,
                          }}
                        >
                          <View style={{ flex: 1 }}>
                            <Text className={`text-xs font-semibold ${t.text}`} numberOfLines={1}>
                              {b.courseCode}
                            </Text>
                            <Text className={`text-[10px] ${t.textMuted}`} numberOfLines={1}>
                              {formatType(b.type)}
                              {b.location ? ` · ${b.location}` : ""}
                            </Text>
                          </View>
                          <View style={{ alignItems: "flex-end" }}>
                            <Text className={`text-[10px] font-semibold ${t.textMuted}`}>
                              {formatTime12h(b.start)}
                            </Text>
                            <Text className={`text-[10px] ${t.textMuted}`}>
                              – {formatTime12h(b.end)}
                            </Text>
                          </View>
                        </View>
                      ))
                    )}
                  </Card>
                </Appear>
              );
            })}
          </View>
        )}

        {/* Deadlines this week */}
        <Appear from="down" delay={600} duration={500} key={`deadlines-${focusKey}`}>
          <Text className={`text-lg font-bold mt-8 mb-3 ${t.text}`}>Deadlines This Week</Text>
          <Card className="p-4" elevated>
            {weekDeadlines.length === 0 ? (
              <Text className={`text-sm ${t.textMuted}`}>Nothing due in the next 7 days.</Text>
            ) : (
              weekDeadlines.map((d, i) => {
                const dt = parseIsoLocal(d.dueDate);
                const dayStr = dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                return (
                  <View
                    key={d.id}
                    style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8 }}
                    className={i > 0 ? `border-t ${t.border}` : ""}
                  >
                    <View style={{ width: 4, height: 32, borderRadius: 2, backgroundColor: d.color, marginRight: 12 }} />
                    <View style={{ flex: 1 }}>
                      <Text className={`text-sm font-semibold ${t.text}`} numberOfLines={1}>{d.title}</Text>
                      <Text className={`text-xs ${t.textMuted}`}>{d.courseCode}</Text>
                    </View>
                    <Text className={`text-xs font-semibold ${t.textMuted}`}>{dayStr}</Text>
                  </View>
                );
              })
            )}
          </Card>
        </Appear>
      </ScrollView>
    </SafeAreaView>
  );
}
