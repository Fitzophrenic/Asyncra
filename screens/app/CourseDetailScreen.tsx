import React, { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, ChevronDown, ChevronUp, Clock, Trash2 } from "lucide-react-native";

import { RootStackParamList } from "../../navigation/RootNavigator";
import { useAppStore } from "../../lib/store";
import { useTheme, tokens } from "../../lib/theme";
import { useIsWide } from "../../components/layout/AppShell";

import { parseIsoLocal } from "../../lib/dateUtils";
import HeaderBand from "../../components/ui/HeaderBand";
import Card from "../../components/ui/Card";
import Pill from "../../components/ui/Pill";
import ProgressBar from "../../components/ui/ProgressBar";
import DonutChart from "../../components/domain/DonutChart";
import Appear, { useFocusKey } from "../../components/ui/Appear";

type Props = NativeStackScreenProps<RootStackParamList, "CourseDetail">;

const workloadVariant = { light: "success", medium: "warning", heavy: "danger" } as const;

export default function CourseDetailScreen({ route, navigation }: Props) {
  const mode = useTheme((s) => s.mode);
  const t = tokens[mode];
  const isWide = useIsWide();
  const courseId = route.params?.courseId;
  const courses = useAppStore((s) => s.courses);
  const course = courses.find((c) => c.id === courseId) ?? courses[0];
  const removeCourse = useAppStore((s) => s.removeCourse);
  const focusKey = useFocusKey();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!course || deleting) return;
    const doDelete = async () => {
      setDeleting(true);
      try {
        await removeCourse(course.id);
        navigation.goBack();
      } catch (err) {
        console.warn("Failed to delete course:", err);
        if (Platform.OS === "web") {
          window.alert("Couldn't delete this course. Please try again.");
        } else {
          Alert.alert("Delete failed", "Couldn't delete this course. Please try again.");
        }
        setDeleting(false);
      }
    };
    const confirmMsg = `Delete ${course.code} (${course.title})? This can't be undone.`;
    if (Platform.OS === "web") {
      if (window.confirm(confirmMsg)) doDelete();
    } else {
      Alert.alert("Delete course", confirmMsg, [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: doDelete },
      ]);
    }
  };


  const donutData = [
    { label: "Exams", value: course.gradeWeights.exams, color: "#1B3A6B" },
    { label: "Projects", value: course.gradeWeights.projects, color: "#4FA8C2" },
    { label: "Homework", value: course.gradeWeights.homework, color: "#6EC4DE" },
    { label: "Participation", value: course.gradeWeights.participation, color: "#A8DEEC" },
  ];

  const hours = course.hourBreakdown;
  const totalHours = hours.lectures + hours.lab + hours.reading + hours.assignments;
  const semesterLow = course.weeklyHours[0] * 15;
  const semesterHigh = course.weeklyHours[1] * 15;

  const HourRow = ({
    label,
    value,
    index,
  }: {
    label: string;
    value: number;
    index: number;
  }) => (
    <View className="mb-3">
      <View className="flex-row justify-between mb-1.5">
        <Text className={`text-sm ${t.text}`}>{label}</Text>
        <Text className={`text-sm font-semibold ${t.text}`}>{value} hrs</Text>
      </View>
      <ProgressBar
        value={value}
        max={10}
        color="info"
        height={6}
        animateDelay={400 + index * 150}
        resetKey={focusKey}
      />
    </View>
  );

  const Section = ({
    title,
    open,
    onToggle,
    children,
  }: {
    title: string;
    open: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }) => (
    <Card variant="surface" className="mb-4">
      <Pressable onPress={onToggle} className="flex-row items-center justify-between">
        <Text className={`text-base font-bold ${t.text}`}>{title}</Text>
        {open ? (
          <ChevronUp size={18} color={mode === "dark" ? "#8A9BB5" : "#64748B"} />
        ) : (
          <ChevronDown size={18} color={mode === "dark" ? "#8A9BB5" : "#64748B"} />
        )}
      </Pressable>
      {open ? <View className="mt-3">{children}</View> : null}
    </Card>
  );

  const GradeWeightCard = (
    <Appear from="down" delay={100} duration={500} key={`grade-${focusKey}`}>
      <Card variant="surface" className="mb-4">
        <Text className={`text-base font-bold mb-4 ${t.text}`}>Grade Weight Breakdown</Text>
        <DonutChart size={isWide ? 200 : 170} data={donutData} />
      </Card>
    </Appear>
  );

  const WeeklyHourCard = (
    <Appear from="down" delay={200} duration={500} key={`weekly-${focusKey}`}>
      <Card variant="surface" className="mb-4">
        <Text className={`text-base font-bold mb-4 ${t.text}`}>Weekly Hour Breakdown</Text>
        <HourRow label="Lectures" value={hours.lectures} index={0} />
        <HourRow label="Lab Work" value={hours.lab} index={1} />
        <HourRow label="Reading" value={hours.reading} index={2} />
        <HourRow label="Assignments" value={hours.assignments} index={3} />
        <View className={`mt-2 pt-3 border-t ${t.border} flex-row justify-between items-center`}>
          <Text className={`text-sm font-semibold ${t.text}`}>Total Weekly Hours</Text>
          <Text className="text-base font-bold text-asy-accent">
            {course.weeklyHours[0]}-{course.weeklyHours[1]} hrs
          </Text>
        </View>
      </Card>
    </Appear>
  );

  const AISummaryCard = course.aiSummary ? (
    <Appear from="down" delay={300} duration={500} key={`ai-${focusKey}`}>
      <Card variant="surface" className="mb-4">
        <Text className={`text-base font-bold mb-2 ${t.text}`}>AI Course Summary</Text>
        <Text className={`text-sm leading-5 ${t.textSecondary}`}>{course.aiSummary}</Text>
      </Card>
    </Appear>
  ) : null;

  const instructor = course.instructor;
  const textbook = course.textbook;
  const prerequisites = course.prerequisites;
  const hasCourseInfo = Boolean(
    (instructor && instructor.name) ||
    (textbook && textbook.title) ||
    (prerequisites && prerequisites.length > 0)
  );

  const CourseInfoCard = hasCourseInfo ? (
    <Appear from="down" delay={400} duration={500} key={`info-${focusKey}`}>
      <Card variant="surface" className="mb-4">
        <Text className={`text-base font-bold mb-3 ${t.text}`}>Course Info</Text>

        {instructor && instructor.name ? (
          <View className="mb-3">
            <Text className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${t.textMuted}`}>Instructor</Text>
            <Text className={`text-sm font-semibold ${t.text}`}>{instructor.name}</Text>
            {instructor.email ? (
              <Text className={`text-xs ${t.textSecondary}`}>{instructor.email}</Text>
            ) : null}
            {instructor.office ? (
              <Text className={`text-xs ${t.textSecondary}`}>Office: {instructor.office}</Text>
            ) : null}
            {instructor.officeHours ? (
              <Text className={`text-xs ${t.textSecondary}`}>Office Hours: {instructor.officeHours}</Text>
            ) : null}
            {instructor.phone ? (
              <Text className={`text-xs ${t.textSecondary}`}>Phone: {instructor.phone}</Text>
            ) : null}
          </View>
        ) : null}

        {textbook && textbook.title ? (
          <View className="mb-3">
            <Text className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${t.textMuted}`}>
              {textbook.required === false ? "Recommended Textbook" : "Required Textbook"}
            </Text>
            <Text className={`text-sm font-semibold ${t.text}`}>{textbook.title}</Text>
            {textbook.author || textbook.edition ? (
              <Text className={`text-xs ${t.textSecondary}`}>
                {textbook.author}
                {textbook.author && textbook.edition ? " · " : ""}
                {textbook.edition}
              </Text>
            ) : null}
            {textbook.isbn ? (
              <Text className={`text-xs ${t.textMuted}`}>ISBN: {textbook.isbn}</Text>
            ) : null}
          </View>
        ) : null}

        {prerequisites ? (
          <View>
            <Text className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${t.textMuted}`}>Prerequisites</Text>
            <Text className={`text-sm ${t.textSecondary}`}>{prerequisites}</Text>
          </View>
        ) : null}
      </Card>
    </Appear>
  ) : null;

  const meetingDayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const sortedMeetings = (course.meetingTimes ?? [])
    .slice()
    .sort((a, b) => {
      const da = meetingDayOrder.indexOf(a.day);
      const db = meetingDayOrder.indexOf(b.day);
      if (da !== db) return da - db;
      return a.start.localeCompare(b.start);
    });

  const formatTime12h = (hhmm: string) => {
    const [h, m] = hhmm.split(":").map(Number);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  };

  const ScheduleCard = sortedMeetings.length > 0 ? (
    <Appear from="down" delay={500} duration={500} key={`sched-${focusKey}`}>
      <Card variant="surface" className="mb-4">
        <Text className={`text-base font-bold mb-2 ${t.text}`}>Weekly Schedule</Text>
        {sortedMeetings.map((m, i) => (
          <View key={i} className="flex-row items-center py-1.5">
            <Text className={`text-sm font-semibold w-24 ${t.text}`}>{m.day}</Text>
            <Text className={`text-sm flex-1 ${t.textSecondary}`}>
              {formatTime12h(m.start)} – {formatTime12h(m.end)}
              {m.location ? ` · ${m.location}` : ""}
            </Text>
            <Text className={`text-xs ${t.textMuted}`} style={{ textTransform: "capitalize" }}>
              {m.type.replace("-", " ")}
            </Text>
          </View>
        ))}
      </Card>
    </Appear>
  ) : null;

  const GradingCard = (course.gradingScale && course.gradingScale.length > 0) ? (
    <Appear from="down" delay={600} duration={500} key={`grading-${focusKey}`}>
      <Card variant="surface" className="mb-4">
        <Text className={`text-base font-bold mb-2 ${t.text}`}>Grading Scale</Text>
        <View className="flex-row flex-wrap" style={{ gap: 8 }}>
          {course.gradingScale.map((g, i) => (
            <View
              key={i}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor: mode === "dark" ? "rgba(255,255,255,0.04)" : "#F1F5F9",
                minWidth: 68,
              }}
            >
              <Text className={`text-xs font-bold ${t.text}`}>{g.letter}</Text>
              <Text className={`text-[10px] ${t.textMuted}`}>≥ {g.minPercent}%</Text>
            </View>
          ))}
        </View>
      </Card>
    </Appear>
  ) : null;

  const KeyDeadlinesCard = (
    <Appear from="down" delay={isWide ? 100 : 700} duration={500} key={`deadlines-${focusKey}`}>
      <Card variant="surface" className="mb-4">
        <View className="flex-row items-center mb-3">
          <Calendar size={16} color="#5DBFD6" />
          <Text className={`ml-2 text-base font-bold ${t.text}`}>Key Deadlines</Text>
        </View>
        {course.deadlines.map((d) => {
          const dt = parseIsoLocal(d.dueDate);
          const month = dt.toLocaleString("en-US", { month: "short" });
          const day = String(dt.getDate());
          return (
            <View key={d.id} className="flex-row items-center py-2">
              <View
                style={{ backgroundColor: "#5DBFD6" }}
                className="rounded-lg px-3 py-2 mr-3 items-center"
              >
                <Text className="text-white text-[10px] font-bold">{month}</Text>
                <Text className="text-white text-sm font-bold">{day}</Text>
              </View>
              <View className="flex-1">
                <Text className={`text-sm font-semibold ${t.text}`}>{d.title}</Text>
                <Text className={`text-xs ${t.textMuted}`}>
                  {d.type[0].toUpperCase() + d.type.slice(1)}
                </Text>
              </View>
            </View>
          );
        })}
      </Card>
    </Appear>
  );

  const SkillsCard = (
    <Appear from="down" delay={isWide ? 200 : 800} duration={500} key={`skills-${focusKey}`}>
      <Card variant="surface" className="mb-4">
        <Text className={`text-base font-bold mb-3 ${t.text}`}>Skills & Tools</Text>
        <View className="flex-row flex-wrap -m-1">
          {course.skills.map((s) => (
            <View key={s} className="m-1">
              <Pill label={s} variant="skill" />
            </View>
          ))}
        </View>
      </Card>
    </Appear>
  );

  const TimeInvestmentCard = (
    <Appear from="down" delay={isWide ? 300 : 900} duration={500} key={`time-${focusKey}`}>
      <View style={{ backgroundColor: "#4A9BB5" }} className="rounded-2xl p-5 mb-4">
        <View className="flex-row items-center mb-3">
          <Clock size={16} color="#FFFFFF" />
          <Text className="ml-2 text-base font-bold text-white">Time Investment</Text>
        </View>
        <View className="mb-3">
          <Text className="text-white/80 text-xs">Per Week</Text>
          <Text className="text-white text-3xl font-bold mt-1">
            {course.weeklyHours[0]}-{course.weeklyHours[1]} hrs
          </Text>
        </View>
        <View className="border-t border-white/30 pt-3">
          <Text className="text-white/80 text-xs">Total Semester</Text>
          <Text className="text-white text-2xl font-bold mt-1">
            {semesterLow}-{semesterHigh} hrs
          </Text>
        </View>
      </View>
    </Appear>
  );

  const DeleteCourseCard = (
    <Appear from="down" delay={isWide ? 400 : 1000} duration={500} key={`delete-${focusKey}`}>
      <Pressable
        onPress={handleDelete}
        disabled={deleting}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 14,
          borderRadius: 14,
          borderWidth: 1.5,
          borderColor: "#E25C5C",
          marginBottom: 16,
          opacity: deleting ? 0.6 : 1,
        }}
      >
        <Trash2 size={16} color="#E25C5C" />
        <Text style={{ color: "#E25C5C", fontWeight: "600", marginLeft: 8, fontSize: 14 }}>
          {deleting ? "Deleting..." : "Delete Course"}
        </Text>
      </Pressable>
    </Appear>
  );

  return (
    <SafeAreaView className={`flex-1 ${t.bg}`} edges={["bottom"]}>
      <HeaderBand
        showBack
        onBack={() => navigation.goBack()}
        title={course.title}
        subtitle={`${course.code} • ${course.term} • ${course.credits} Credits`}
        rightSlot={
          <Pill
            label={course.workload[0].toUpperCase() + course.workload.slice(1)}
            variant={workloadVariant[course.workload]}
          />
        }
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: isWide ? 48 : 20,
          paddingTop: isWide ? 32 : 20,
          paddingBottom: 110,
        }}
      >
        <View style={{ width: "100%" }}>
          {isWide ? (
            <View className="flex-row gap-6">
              <View className="flex-[2]">
                {GradeWeightCard}
                {WeeklyHourCard}
                {AISummaryCard}
                {CourseInfoCard}
                {ScheduleCard}
                {GradingCard}
              </View>
              <View className="flex-1">
                {KeyDeadlinesCard}
                {SkillsCard}
                {TimeInvestmentCard}
                {DeleteCourseCard}
              </View>
            </View>
          ) : (
            <>
              {GradeWeightCard}
              {WeeklyHourCard}
              {AISummaryCard}
              {CourseInfoCard}
              {ScheduleCard}
              {GradingCard}
              {KeyDeadlinesCard}
              {SkillsCard}
              {TimeInvestmentCard}
                {DeleteCourseCard}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
