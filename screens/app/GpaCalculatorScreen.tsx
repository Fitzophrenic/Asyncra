import React, { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

import { RootStackParamList } from "../../navigation/RootNavigator";
import { useAppStore } from "../../lib/store";
import { useTheme, tokens } from "../../lib/theme";
import { useIsWide } from "../../components/layout/AppShell";

import HeaderBand from "../../components/ui/HeaderBand";
import Card from "../../components/ui/Card";
import Appear, { useFocusKey } from "../../components/ui/Appear";

type Props = NativeStackScreenProps<RootStackParamList, "GpaCalculator">;

const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0, A: 4.0, "A-": 3.7,
  "B+": 3.3, B: 3.0, "B-": 2.7,
  "C+": 2.3, C: 2.0, "C-": 1.7,
  "D+": 1.3, D: 1.0, "D-": 0.7,
  F: 0.0,
};

const GRADE_OPTIONS = Object.keys(GRADE_POINTS);

function GradeSelector({ value, onChange, mode }: { value: string; onChange: (v: string) => void; mode: string }) {
  const isDark = mode === "dark";
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
      {GRADE_OPTIONS.map((g) => {
        const active = value === g;
        return (
          <Text
            key={g}
            onPress={() => onChange(g)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 8,
              fontSize: 12,
              fontWeight: "600",
              overflow: "hidden",
              backgroundColor: active
                ? "#5DBFD6"
                : isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9",
              color: active ? "#FFFFFF" : isDark ? "#E8EDF5" : "#13243A",
            }}
          >
            {g}
          </Text>
        );
      })}
    </View>
  );
}

export default function GpaCalculatorScreen({ navigation }: Props) {
  const mode = useTheme((s) => s.mode);
  const t = tokens[mode];
  const isWide = useIsWide();
  const focusKey = useFocusKey();
  const courses = useAppStore((s) => s.courses);

  const [grades, setGrades] = useState<Record<string, string>>(
    Object.fromEntries(courses.map((c) => [c.id, "B+"]))
  );

  const setGrade = (courseId: string, grade: string) => {
    setGrades((prev) => ({ ...prev, [courseId]: grade }));
  };

  // Calculate GPA
  let totalPoints = 0;
  let totalCredits = 0;
  courses.forEach((c) => {
    const grade = grades[c.id];
    if (grade && GRADE_POINTS[grade] !== undefined) {
      totalPoints += GRADE_POINTS[grade] * c.credits;
      totalCredits += c.credits;
    }
  });
  const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";

  const gpaNum = parseFloat(gpa);
  const gpaColor = gpaNum >= 3.5 ? "#3FBF7F" : gpaNum >= 2.5 ? "#E0A23A" : "#E25C5C";

  return (
    <SafeAreaView className={`flex-1 ${t.bg}`} edges={["bottom"]}>
      <HeaderBand showBack onBack={() => navigation.goBack()} title="GPA Calculator" subtitle="Estimate your semester GPA" />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: isWide ? 48 : 20, paddingTop: 20, paddingBottom: 110 }}>
        {/* GPA display */}
        <Appear from="down" delay={50} duration={500} key={`gpa-${focusKey}`}>
          <Card className="mb-6 items-center p-8" elevated>
            <Text className={`text-xs font-bold tracking-widest ${t.textMuted}`}>PROJECTED GPA</Text>
            <Text style={{ fontSize: 64, fontWeight: "800", color: gpaColor, marginTop: 8 }}>{gpa}</Text>
            <Text className={`text-sm ${t.textMuted}`}>{totalCredits} credits</Text>
            <View style={{ width: "100%", height: 6, borderRadius: 3, backgroundColor: mode === "dark" ? "rgba(255,255,255,0.06)" : "#F1F5F9", marginTop: 16 }}>
              <View style={{ width: `${Math.min(100, (gpaNum / 4.0) * 100)}%`, height: 6, borderRadius: 3, backgroundColor: gpaColor }} />
            </View>
          </Card>
        </Appear>

        {/* Course grades */}
        <View style={isWide ? { flexDirection: "row", flexWrap: "wrap", gap: 16 } : {}}>
          {courses.map((c, i) => (
            <Appear from="down" delay={150 + i * 100} duration={500} key={`${c.id}-${focusKey}`} style={isWide ? { width: "48%" } : { marginBottom: 12 }}>
              <Card elevated>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flex: 1 }}>
                    <Text className={`text-base font-bold ${t.text}`}>{c.title}</Text>
                    <Text className={`text-xs mt-1 ${t.textMuted}`}>{c.code} · {c.credits} credits</Text>
                  </View>
                  <View style={{
                    backgroundColor: grades[c.id] && GRADE_POINTS[grades[c.id]] >= 3.0 ? "rgba(63,191,127,0.15)" : grades[c.id] && GRADE_POINTS[grades[c.id]] >= 2.0 ? "rgba(224,162,58,0.15)" : "rgba(226,92,92,0.15)",
                    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8,
                  }}>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: GRADE_POINTS[grades[c.id]] >= 3.0 ? "#3FBF7F" : GRADE_POINTS[grades[c.id]] >= 2.0 ? "#E0A23A" : "#E25C5C" }}>
                      {grades[c.id] || "—"}
                    </Text>
                  </View>
                </View>
                <GradeSelector value={grades[c.id]} onChange={(g) => setGrade(c.id, g)} mode={mode} />
              </Card>
            </Appear>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
