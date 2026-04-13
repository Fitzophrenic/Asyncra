import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, ChevronDown, ChevronUp, Clock } from "lucide-react-native";

import { RootStackParamList } from "../../navigation/RootNavigator";
import { mockCourses } from "../../lib/mockData";
import { useTheme, tokens } from "../../lib/theme";
import { useIsWide } from "../../components/layout/AppShell";

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
  const course = mockCourses.find((c) => c.id === courseId) ?? mockCourses[0];
  const focusKey = useFocusKey();

  const [descOpen, setDescOpen] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [gradingOpen, setGradingOpen] = useState(false);

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

  const DescriptionCard = (
    <Appear from="down" delay={400} duration={500} key={`desc-${focusKey}`}>
      <Section title="Course Description" open={descOpen} onToggle={() => setDescOpen((v) => !v)}>
        <Text className={`text-sm leading-5 ${t.textSecondary}`}>
          Explore the fundamentals of data science including data collection, cleaning, analysis,
          and visualization...
        </Text>
      </Section>
    </Appear>
  );

  const ScheduleCard = (
    <Appear from="down" delay={500} duration={500} key={`sched-${focusKey}`}>
      <Section title="Weekly Schedule" open={scheduleOpen} onToggle={() => setScheduleOpen((v) => !v)}>
        <Text className={`text-sm leading-5 ${t.textSecondary}`}>
          Monday & Wednesday: 2:00 PM – 3:30 PM (Lectures){"\n"}
          Friday: 1:00 PM – 3:00 PM (Lab Sessions)
        </Text>
      </Section>
    </Appear>
  );

  const GradingCard = (
    <Appear from="down" delay={600} duration={500} key={`grading-${focusKey}`}>
      <Section title="Grading Policy" open={gradingOpen} onToggle={() => setGradingOpen((v) => !v)}>
        <Text className={`text-sm leading-5 ${t.textSecondary}`}>
          Letter grades based on total points. A: 90–100%, B: 80–89%, C: 70–79%, D: 60–69%, F:
          below 60%.
        </Text>
      </Section>
    </Appear>
  );

  const KeyDeadlinesCard = (
    <Appear from="down" delay={isWide ? 100 : 700} duration={500} key={`deadlines-${focusKey}`}>
      <Card variant="surface" className="mb-4">
        <View className="flex-row items-center mb-3">
          <Calendar size={16} color="#5DBFD6" />
          <Text className={`ml-2 text-base font-bold ${t.text}`}>Key Deadlines</Text>
        </View>
        {course.deadlines.map((d) => {
          const dt = new Date(d.dueDate);
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
                {DescriptionCard}
                {ScheduleCard}
                {GradingCard}
              </View>
              <View className="flex-1">
                {KeyDeadlinesCard}
                {SkillsCard}
                {TimeInvestmentCard}
              </View>
            </View>
          ) : (
            <>
              {GradeWeightCard}
              {WeeklyHourCard}
              {AISummaryCard}
              {DescriptionCard}
              {ScheduleCard}
              {GradingCard}
              {KeyDeadlinesCard}
              {SkillsCard}
              {TimeInvestmentCard}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
