import React from "react";
import { ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { RootStackParamList } from "../../navigation/RootNavigator";
import { mockCourses } from "../../lib/mockData";
import { useTheme, tokens } from "../../lib/theme";
import { useIsWide } from "../../components/layout/AppShell";

import HeaderBand from "../../components/ui/HeaderBand";
import Card from "../../components/ui/Card";
import Appear, { useFocusKey } from "../../components/ui/Appear";

type Props = NativeStackScreenProps<RootStackParamList, "WeeklyCalendar">;

type TimeBlock = { course: string; code: string; type: string; start: string; end: string; color: string };

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const schedule: Record<string, TimeBlock[]> = {
  Monday: [
    { course: "Data Science", code: "CS 301", type: "Lecture", start: "2:00 PM", end: "3:30 PM", color: "#1B3A6B" },
    { course: "Algorithms", code: "CS 402", type: "Lecture", start: "10:00 AM", end: "11:30 AM", color: "#E0A23A" },
  ],
  Tuesday: [
    { course: "Web Dev", code: "CS 250", type: "Lecture", start: "1:00 PM", end: "2:30 PM", color: "#3FBF7F" },
  ],
  Wednesday: [
    { course: "Data Science", code: "CS 301", type: "Lecture", start: "2:00 PM", end: "3:30 PM", color: "#1B3A6B" },
    { course: "Algorithms", code: "CS 402", type: "Lecture", start: "10:00 AM", end: "11:30 AM", color: "#E0A23A" },
  ],
  Thursday: [
    { course: "Web Dev", code: "CS 250", type: "Lab", start: "1:00 PM", end: "3:00 PM", color: "#3FBF7F" },
  ],
  Friday: [
    { course: "Data Science", code: "CS 301", type: "Lab", start: "1:00 PM", end: "3:00 PM", color: "#1B3A6B" },
    { course: "Algorithms", code: "CS 402", type: "Office Hours", start: "3:00 PM", end: "4:00 PM", color: "#E0A23A" },
  ],
};

// Upcoming deadlines this week
const weekDeadlines = mockCourses.flatMap((c) =>
  c.deadlines.slice(0, 2).map((d) => ({ ...d, courseTitle: c.title, color: c.id === "c1" ? "#1B3A6B" : c.id === "c2" ? "#E0A23A" : "#3FBF7F" }))
).slice(0, 4);

export default function WeeklyCalendarScreen({ navigation }: Props) {
  const mode = useTheme((s) => s.mode);
  const t = tokens[mode];
  const isWide = useIsWide();
  const focusKey = useFocusKey();

  return (
    <SafeAreaView className={`flex-1 ${t.bg}`} edges={["bottom"]}>
      <HeaderBand showBack onBack={() => navigation.goBack()} title="Weekly Schedule" subtitle="Your classes and deadlines at a glance" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: isWide ? 48 : 20, paddingTop: 20, paddingBottom: 110 }}>
        {/* Legend */}
        <Appear from="down" delay={50} duration={400} key={`legend-${focusKey}`}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
            {[{ label: "CS 301", color: "#1B3A6B" }, { label: "CS 402", color: "#E0A23A" }, { label: "CS 250", color: "#3FBF7F" }].map((c) => (
              <View key={c.label} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: c.color }} />
                <Text className={`text-xs font-semibold ${t.textMuted}`}>{c.label}</Text>
              </View>
            ))}
          </View>
        </Appear>

        {/* Day columns or rows */}
        <View style={isWide ? { flexDirection: "row", gap: 12 } : {}}>
          {DAYS.map((day, di) => (
            <Appear from="down" delay={100 + di * 80} duration={500} key={`${day}-${focusKey}`} style={isWide ? { flex: 1 } : { marginBottom: 12 }}>
              <Card className="p-4" elevated>
                <Text className={`text-sm font-bold mb-3 ${t.text}`}>{day}</Text>
                {(schedule[day] || []).length === 0 ? (
                  <Text className={`text-xs ${t.textMuted}`}>No classes</Text>
                ) : (
                  (schedule[day] || []).map((block, bi) => (
                    <View
                      key={bi}
                      style={{
                        flexDirection: "row",
                        marginBottom: 8,
                        borderLeftWidth: 3,
                        borderLeftColor: block.color,
                        paddingLeft: 10,
                        paddingVertical: 6,
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text className={`text-xs font-semibold ${t.text}`}>{block.course}</Text>
                        <Text className={`text-[10px] ${t.textMuted}`}>{block.type}</Text>
                      </View>
                      <Text className={`text-[10px] font-semibold ${t.textMuted}`}>{block.start}</Text>
                    </View>
                  ))
                )}
              </Card>
            </Appear>
          ))}
        </View>

        {/* Deadlines this week */}
        <Appear from="down" delay={600} duration={500} key={`deadlines-${focusKey}`}>
          <Text className={`text-lg font-bold mt-8 mb-3 ${t.text}`}>Deadlines This Week</Text>
          <Card className="p-4" elevated>
            {weekDeadlines.map((d, i) => {
              const dt = new Date(d.dueDate);
              const dayStr = dt.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
              return (
                <View
                  key={d.id}
                  style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8 }}
                  className={i > 0 ? `border-t ${t.border}` : ""}
                >
                  <View style={{ width: 4, height: 32, borderRadius: 2, backgroundColor: d.color, marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text className={`text-sm font-semibold ${t.text}`}>{d.title}</Text>
                    <Text className={`text-xs ${t.textMuted}`}>{d.courseTitle}</Text>
                  </View>
                  <Text className={`text-xs font-semibold ${t.textMuted}`}>{dayStr}</Text>
                </View>
              );
            })}
          </Card>
        </Appear>
      </ScrollView>
    </SafeAreaView>
  );
}
