import React, { useState, useRef, useEffect } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pause, Play, RotateCcw, Coffee, Flame, Clock, BookOpen, Trash2, SkipForward } from "lucide-react-native";

import { RootStackParamList } from "../../navigation/RootNavigator";
import { mockCourses } from "../../lib/mockData";
import { useTheme, tokens } from "../../lib/theme";
import { useIsWide } from "../../components/layout/AppShell";

import HeaderBand from "../../components/ui/HeaderBand";
import Card from "../../components/ui/Card";
import Appear, { useFocusKey } from "../../components/ui/Appear";

type Props = NativeStackScreenProps<RootStackParamList, "StudyTimer">;

type LogEntry = {
  id: string;
  courseCode: string;
  courseName: string;
  duration: number; // minutes
  timestamp: Date;
};

const WORK_MINS = 25;
const BREAK_MINS = 5;

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatTimestamp(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export default function StudyTimerScreen({ navigation }: Props) {
  const mode = useTheme((s) => s.mode);
  const t = tokens[mode];
  const isWide = useIsWide();
  const focusKey = useFocusKey();
  const isDark = mode === "dark";

  const [selectedCourse, setSelectedCourse] = useState(mockCourses[0].id);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(WORK_MINS * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = isBreak ? BREAK_MINS * 60 : WORK_MINS * 60;
  const progress = (totalSeconds - timeLeft) / totalSeconds;
  const course = mockCourses.find((c) => c.id === selectedCourse) || mockCourses[0];
  const accentColor = isBreak ? "#3FBF7F" : "#5DBFD6";

  const totalMinutes = log.reduce((sum, e) => sum + e.duration, 0);
  const courseLogs = mockCourses.map((c) => ({
    code: c.code,
    minutes: log.filter((e) => e.courseCode === c.code).reduce((s, e) => s + e.duration, 0),
  }));

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (running && timeLeft === 0) {
      setRunning(false);
      if (!isBreak) {
        // Log the completed session
        setSessions((s) => s + 1);
        setLog((prev) => [
          {
            id: `log-${Date.now()}`,
            courseCode: course.code,
            courseName: course.title,
            duration: WORK_MINS,
            timestamp: new Date(),
          },
          ...prev,
        ]);
        setIsBreak(true);
        setTimeLeft(BREAK_MINS * 60);
        // Auto-start break
        setTimeout(() => setRunning(true), 500);
      } else {
        setIsBreak(false);
        setTimeLeft(WORK_MINS * 60);
      }
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, timeLeft, isBreak]);

  const reset = () => {
    setRunning(false);
    setIsBreak(false);
    setTimeLeft(WORK_MINS * 60);
  };

  const skip = () => {
    setRunning(false);
    if (!isBreak) {
      // Log partial session
      const elapsed = WORK_MINS * 60 - timeLeft;
      if (elapsed >= 60) {
        setSessions((s) => s + 1);
        setLog((prev) => [
          {
            id: `log-${Date.now()}`,
            courseCode: course.code,
            courseName: course.title,
            duration: Math.round(elapsed / 60),
            timestamp: new Date(),
          },
          ...prev,
        ]);
      }
      setIsBreak(true);
      setTimeLeft(BREAK_MINS * 60);
    } else {
      setIsBreak(false);
      setTimeLeft(WORK_MINS * 60);
    }
  };

  const removeLog = (id: string) => setLog((prev) => prev.filter((e) => e.id !== id));

  // Timer + stats side by side on web
  const timerSection = (
    <View style={{ alignItems: "center", flex: isWide ? undefined : undefined }}>
      {/* Course selector */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 28, justifyContent: "center" }}>
        {mockCourses.map((c) => {
          const active = selectedCourse === c.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => { if (!running) { setSelectedCourse(c.id); reset(); } }}
              style={{
                paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12,
                borderWidth: 1.5,
                opacity: running && !active ? 0.4 : 1,
                borderColor: active ? accentColor : isDark ? "#2A2D3A" : "#E2E8F1",
                backgroundColor: active ? (isDark ? "rgba(93,191,214,0.15)" : "#E6F4F8") : "transparent",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "600", color: active ? accentColor : isDark ? "#E8EDF5" : "#13243A" }}>
                {c.code}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Timer ring */}
      <View style={{ alignItems: "center", marginBottom: 28 }}>
        <View style={{ width: 220, height: 220, alignItems: "center", justifyContent: "center" }}>
          <View style={{
            position: "absolute", width: 220, height: 220, borderRadius: 110,
            borderWidth: 6, borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F1",
          }} />
          {/* Progress segments */}
          {Array.from({ length: 60 }).map((_, i) => {
            const angle = (i / 60) * 360 - 90;
            const filled = i / 60 <= progress;
            const rad = (angle * Math.PI) / 180;
            const r = 104;
            return (
              <View
                key={i}
                style={{
                  position: "absolute",
                  width: 3,
                  height: i % 5 === 0 ? 10 : 6,
                  borderRadius: 1.5,
                  backgroundColor: filled ? accentColor : isDark ? "rgba(255,255,255,0.1)" : "#D1D5DB",
                  left: 110 + r * Math.cos(rad) - 1.5,
                  top: 110 + r * Math.sin(rad) - (i % 5 === 0 ? 5 : 3),
                  transform: [{ rotate: `${angle + 90}deg` }],
                }}
              />
            );
          })}
          <View style={{ alignItems: "center" }}>
            {isBreak && <Coffee size={20} color={accentColor} style={{ marginBottom: 4 }} />}
            <Text style={{
              fontSize: 48, fontWeight: "700", fontVariant: ["tabular-nums"],
              color: isDark ? "#E8EDF5" : "#13243A",
            }}>
              {formatTime(timeLeft)}
            </Text>
            <Text style={{ fontSize: 11, fontWeight: "700", color: accentColor, letterSpacing: 2, marginTop: 2 }}>
              {isBreak ? "BREAK" : "FOCUS"}
            </Text>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <Pressable
          onPress={reset}
          style={{
            width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center",
            borderWidth: 1.5, borderColor: isDark ? "#2A2D3A" : "#E2E8F1",
          }}
        >
          <RotateCcw size={18} color={isDark ? "#8A9BB5" : "#64748B"} />
        </Pressable>
        <Pressable
          onPress={() => setRunning(!running)}
          style={{
            width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center",
            backgroundColor: accentColor,
            shadowColor: accentColor, shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
          }}
        >
          {running ? <Pause size={24} color="#FFF" /> : <Play size={24} color="#FFF" style={{ marginLeft: 2 }} />}
        </Pressable>
        <Pressable
          onPress={skip}
          style={{
            width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center",
            borderWidth: 1.5, borderColor: isDark ? "#2A2D3A" : "#E2E8F1",
          }}
        >
          <SkipForward size={18} color={isDark ? "#8A9BB5" : "#64748B"} />
        </Pressable>
      </View>
    </View>
  );

  const statsSection = (
    <View style={{ flex: isWide ? 1 : undefined }}>
      {/* Today summary */}
      <Card className="mb-4" elevated>
        <Text className={`text-base font-bold mb-4 ${t.text}`}>Today's Summary</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1, alignItems: "center", backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC", borderRadius: 12, padding: 14 }}>
            <Flame size={18} color="#E0A23A" />
            <Text style={{ fontSize: 28, fontWeight: "700", color: isDark ? "#E8EDF5" : "#13243A", marginTop: 6 }}>{sessions}</Text>
            <Text style={{ fontSize: 11, color: isDark ? "#8A9BB5" : "#64748B" }}>Sessions</Text>
          </View>
          <View style={{ flex: 1, alignItems: "center", backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC", borderRadius: 12, padding: 14 }}>
            <Clock size={18} color="#5DBFD6" />
            <Text style={{ fontSize: 28, fontWeight: "700", color: isDark ? "#E8EDF5" : "#13243A", marginTop: 6 }}>{totalMinutes}</Text>
            <Text style={{ fontSize: 11, color: isDark ? "#8A9BB5" : "#64748B" }}>Minutes</Text>
          </View>
        </View>

        {/* Per-course breakdown */}
        {courseLogs.some((c) => c.minutes > 0) && (
          <View style={{ marginTop: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", letterSpacing: 1, color: isDark ? "#8A9BB5" : "#64748B", marginBottom: 8 }}>BY COURSE</Text>
            {courseLogs.filter((c) => c.minutes > 0).map((c) => (
              <View key={c.code} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6 }}>
                <Text className={`text-sm font-semibold ${t.text}`}>{c.code}</Text>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#5DBFD6" }}>{c.minutes} min</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      {/* Session log */}
      <Card elevated>
        <Text className={`text-base font-bold mb-3 ${t.text}`}>Session Log</Text>
        {log.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 24 }}>
            <BookOpen size={28} color={isDark ? "#2A2D3A" : "#D1D5DB"} />
            <Text className={`text-sm mt-3 ${t.textMuted}`}>No sessions yet</Text>
            <Text className={`text-xs mt-1 ${t.textMuted}`}>Complete a focus session to start logging</Text>
          </View>
        ) : (
          log.map((entry, i) => (
            <View
              key={entry.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 10,
                borderTopWidth: i > 0 ? 1 : 0,
                borderTopColor: isDark ? "#2A2D3A" : "#E2E8F1",
              }}
            >
              <View style={{
                width: 8, height: 8, borderRadius: 4, marginRight: 12,
                backgroundColor: "#5DBFD6",
              }} />
              <View style={{ flex: 1 }}>
                <Text className={`text-sm font-semibold ${t.text}`}>{entry.courseCode}</Text>
                <Text className={`text-xs ${t.textMuted}`}>{formatTimestamp(entry.timestamp)}</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#5DBFD6", marginRight: 12 }}>
                {entry.duration} min
              </Text>
              <Pressable onPress={() => removeLog(entry.id)} style={{ padding: 4 }}>
                <Trash2 size={14} color={isDark ? "#8A9BB5" : "#94A3B8"} />
              </Pressable>
            </View>
          ))
        )}
      </Card>
    </View>
  );

  return (
    <SafeAreaView className={`flex-1 ${t.bg}`} edges={["bottom"]}>
      <HeaderBand showBack onBack={() => navigation.goBack()} title="Study Timer" subtitle="Pomodoro — 25 min focus, 5 min break" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: isWide ? 48 : 20,
          paddingTop: 24,
          paddingBottom: 110,
        }}
      >
        {isWide ? (
          <View style={{ flexDirection: "row", gap: 32, alignItems: "flex-start" }}>
            <Appear from="down" delay={50} duration={500} key={`timer-wide-${focusKey}`}>
              <View style={{ width: 340, alignItems: "center" }}>
                {timerSection}
              </View>
            </Appear>
            <Appear from="down" delay={150} duration={500} key={`stats-wide-${focusKey}`} style={{ flex: 1 }}>
              {statsSection}
            </Appear>
          </View>
        ) : (
          <View>
            <Appear from="down" delay={50} duration={500} key={`timer-${focusKey}`}>
              {timerSection}
            </Appear>
            <Appear from="down" delay={200} duration={500} key={`stats-${focusKey}`}>
              {statsSection}
            </Appear>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
