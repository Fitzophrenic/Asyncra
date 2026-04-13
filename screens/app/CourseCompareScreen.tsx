import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check } from "lucide-react-native";

import { RootStackParamList } from "../../navigation/RootNavigator";
import type { Course } from "../../lib/types";
import { useAppStore } from "../../lib/store";
import { useTheme, tokens } from "../../lib/theme";
import { useIsWide } from "../../components/layout/AppShell";

import HeaderBand from "../../components/ui/HeaderBand";
import Card from "../../components/ui/Card";
import ProgressBar from "../../components/ui/ProgressBar";
import Appear, { useFocusKey } from "../../components/ui/Appear";

type Props = NativeStackScreenProps<RootStackParamList, "CourseCompare">;

const workloadColor = { light: "#3FBF7F", medium: "#E0A23A", heavy: "#E25C5C" };

function CompareColumn({ course, focusKey, delay }: { course: Course; focusKey: number; delay: number }) {
  const mode = useTheme((s) => s.mode);
  const t = tokens[mode];
  const total = course.hourBreakdown.lectures + course.hourBreakdown.lab + course.hourBreakdown.reading + course.hourBreakdown.assignments;

  return (
    <View style={{ flex: 1 }}>
      <Appear from="down" delay={delay} duration={500} key={`col-${course.id}-${focusKey}`}>
        <Card className="mb-4" elevated>
          <Text className={`text-lg font-bold ${t.text}`}>{course.title}</Text>
          <Text className={`text-xs mt-1 ${t.textMuted}`}>{course.code}</Text>

          <View className={`border-t ${t.border} mt-4 pt-4`}>
            <Row label="Credits" value={String(course.credits)} t={t} />
            <Row label="Weekly Hours" value={`${course.weeklyHours[0]}-${course.weeklyHours[1]}`} t={t} />
            <Row label="Workload" t={t}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: workloadColor[course.workload] }} />
                <Text style={{ fontSize: 14, fontWeight: "600", color: workloadColor[course.workload] }}>
                  {course.workload.charAt(0).toUpperCase() + course.workload.slice(1)}
                </Text>
              </View>
            </Row>
          </View>

          <View className={`border-t ${t.border} mt-3 pt-3`}>
            <Text className={`text-xs font-bold tracking-wider mb-3 ${t.textMuted}`}>GRADE WEIGHTS</Text>
            <BarRow label="Exams" value={course.gradeWeights.exams} focusKey={focusKey} delay={delay + 200} t={t} />
            <BarRow label="Projects" value={course.gradeWeights.projects} focusKey={focusKey} delay={delay + 300} t={t} />
            <BarRow label="Homework" value={course.gradeWeights.homework} focusKey={focusKey} delay={delay + 400} t={t} />
          </View>

          <View className={`border-t ${t.border} mt-3 pt-3`}>
            <Text className={`text-xs font-bold tracking-wider mb-3 ${t.textMuted}`}>HOUR BREAKDOWN</Text>
            <BarRow label="Lectures" value={course.hourBreakdown.lectures} max={10} focusKey={focusKey} delay={delay + 500} t={t} unit="hrs" />
            <BarRow label="Lab" value={course.hourBreakdown.lab} max={10} focusKey={focusKey} delay={delay + 600} t={t} unit="hrs" />
            <BarRow label="Reading" value={course.hourBreakdown.reading} max={10} focusKey={focusKey} delay={delay + 700} t={t} unit="hrs" />
            <BarRow label="Assignments" value={course.hourBreakdown.assignments} max={10} focusKey={focusKey} delay={delay + 800} t={t} unit="hrs" />
          </View>

          <View className={`border-t ${t.border} mt-3 pt-3`}>
            <Text className={`text-xs font-bold tracking-wider mb-2 ${t.textMuted}`}>DEADLINES</Text>
            <Text className={`text-2xl font-bold ${t.text}`}>{course.deadlines.length}</Text>
          </View>
        </Card>
      </Appear>
    </View>
  );
}

function Row({ label, value, t, children }: { label: string; value?: string; t: any; children?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <Text className={`text-sm ${t.textMuted}`}>{label}</Text>
      {children || <Text className={`text-sm font-semibold ${t.text}`}>{value}</Text>}
    </View>
  );
}

function BarRow({ label, value, max = 100, focusKey, delay, t, unit = "%" }: { label: string; value: number; max?: number; focusKey: number; delay: number; t: any; unit?: string }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
        <Text className={`text-xs ${t.textMuted}`}>{label}</Text>
        <Text className={`text-xs font-semibold ${t.text}`}>{value}{unit}</Text>
      </View>
      <ProgressBar value={value} max={max} color="info" height={5} animateDelay={delay} resetKey={focusKey} />
    </View>
  );
}

export default function CourseCompareScreen({ navigation }: Props) {
  const mode = useTheme((s) => s.mode);
  const t = tokens[mode];
  const isWide = useIsWide();
  const focusKey = useFocusKey();
  const courses = useAppStore((s) => s.courses);
  const [selected, setSelected] = useState<string[]>([]);

  const toggleCourse = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const selectedCourses = courses.filter((c) => selected.includes(c.id));

  return (
    <SafeAreaView className={`flex-1 ${t.bg}`} edges={["bottom"]}>
      <HeaderBand
        showBack
        onBack={() => navigation.goBack()}
        title="Compare Courses"
        subtitle="Select 2 courses to compare side-by-side"
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: isWide ? 48 : 20, paddingTop: 20, paddingBottom: 110 }}
      >
        {/* Course selector */}
        <Appear from="down" delay={50} duration={400} key={`sel-${focusKey}`}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 }}>
            {courses.map((c) => {
              const active = selected.includes(c.id);
              return (
                <Pressable
                  key={c.id}
                  onPress={() => toggleCourse(c.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: active ? "#5DBFD6" : mode === "dark" ? "#2A2D3A" : "#E2E8F1",
                    backgroundColor: active
                      ? mode === "dark" ? "rgba(93,191,214,0.15)" : "#E6F4F8"
                      : "transparent",
                  }}
                >
                  {active && <Check size={14} color="#5DBFD6" style={{ marginRight: 6 }} />}
                  <Text style={{ fontSize: 14, fontWeight: "600", color: active ? "#5DBFD6" : mode === "dark" ? "#E8EDF5" : "#13243A" }}>
                    {c.code}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Appear>

        {selectedCourses.length < 2 ? (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Text className={`text-base ${t.textMuted}`}>
              Select {2 - selectedCourses.length} more course{selectedCourses.length === 0 ? "s" : ""} to compare
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: isWide ? "row" : "column", gap: 16 }}>
            <CompareColumn course={selectedCourses[0]} focusKey={focusKey} delay={100} />
            <CompareColumn course={selectedCourses[1]} focusKey={focusKey} delay={200} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
