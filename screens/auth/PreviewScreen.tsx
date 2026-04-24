import { View, Text, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { Clock, Brain, Calendar, Sparkles, TrendingUp, BookOpen, Target } from "lucide-react-native";

import { RootStackParamList } from "../../navigation/RootNavigator";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { Appear } from "../../components/ui/Appear";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { useAppStore } from "../../lib/store";
import { mockCourses } from "../../lib/mockData";
import { useIsWide } from "../../components/layout/AppShell";

type Props = NativeStackScreenProps<RootStackParamList, "Preview">;

const WORKLOAD_COLOR: Record<string, { bg: string; dot: string; text: string }> = {
  light: { bg: "#E6F9EF", dot: "#3FBF7F", text: "#14532D" },
  medium: { bg: "#FEF3E2", dot: "#E0A23A", text: "#9A6A1F" },
  heavy: { bg: "#FEE2E2", dot: "#E25C5C", text: "#7F1D1D" },
};

export default function PreviewScreen({ navigation }: Props) {
  const pending = useAppStore((s) => s.pendingAnalysis);
  // fall back to a mock course if a user somehow lands here without a pending analysis
  const course = pending ?? mockCourses[0];
  const workloadStyle = WORKLOAD_COLOR[course.workload] ?? WORKLOAD_COLOR.medium;
  const workloadLabel = course.workload.charAt(0).toUpperCase() + course.workload.slice(1);
  const isWide = useIsWide();

  const courseCard = (
    <Appear from="down" delay={80} duration={500} style={{ flex: isWide ? 1 : undefined }}>
      <View style={{
        backgroundColor: "#FFFFFF", borderRadius: 20, padding: isWide ? 24 : 20,
        borderWidth: 1, borderColor: "#E2E8F1",
        shadowColor: "#0F172A", shadowOpacity: 0.06, shadowRadius: 20, shadowOffset: { width: 0, height: 6 },
      }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={{ fontSize: isWide ? 22 : 20, fontWeight: "700", color: "#13243A" }}>{course.title}</Text>
            <Text style={{ fontSize: 12, color: "#64748B", marginTop: 3 }}>{course.code} · {course.term} · {course.credits} Credits</Text>
          </View>
          <View style={{ backgroundColor: workloadStyle.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: workloadStyle.dot }} />
            <Text style={{ marginLeft: 5, fontSize: 11, fontWeight: "600", color: workloadStyle.text }}>{workloadLabel}</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: "#E6F4F8", borderRadius: 12, paddingVertical: 12, alignItems: "center" }}>
            <Clock size={14} color="#5DBFD6" />
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#13243A", marginTop: 3 }}>{course.weeklyHours[0]}–{course.weeklyHours[1]}</Text>
            <Text style={{ fontSize: 9, color: "#13345F" }}>hrs/week</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#FEF3E2", borderRadius: 12, paddingVertical: 12, alignItems: "center" }}>
            <Calendar size={14} color="#E0A23A" />
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#13243A", marginTop: 3 }}>{course.deadlines.length}</Text>
            <Text style={{ fontSize: 9, color: "#9A6A1F" }}>deadlines</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#F0FDF4", borderRadius: 12, paddingVertical: 12, alignItems: "center" }}>
            <Brain size={14} color="#3FBF7F" />
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#13243A", marginTop: 3 }}>{course.skills.length}</Text>
            <Text style={{ fontSize: 9, color: "#166534" }}>skills</Text>
          </View>
        </View>

        {/* Grade bars */}
        <Text style={{ fontSize: 12, fontWeight: "700", color: "#13243A", marginBottom: 8 }}>Grade Breakdown</Text>
        {[
          { label: "Exams", value: course.gradeWeights.exams },
          { label: "Projects", value: course.gradeWeights.projects },
          { label: "Homework", value: course.gradeWeights.homework },
        ].map((g, i) => (
          <View key={g.label} style={{ marginBottom: 6 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
              <Text style={{ fontSize: 11, color: "#64748B" }}>{g.label}</Text>
              <Text style={{ fontSize: 11, fontWeight: "600", color: "#13243A" }}>{g.value}%</Text>
            </View>
            <ProgressBar value={g.value} max={100} color="info" height={4} animateDelay={300 + i * 100} />
          </View>
        ))}

        {/* Skills */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 12 }}>
          {course.skills.slice(0, 4).map((s) => (
            <View key={s} style={{ backgroundColor: "#E6F4F8", paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6 }}>
              <Text style={{ fontSize: 10, fontWeight: "600", color: "#1B3A6B" }}>{s}</Text>
            </View>
          ))}
          <View style={{ backgroundColor: "#F1F5F9", paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6 }}>
            <Text style={{ fontSize: 10, fontWeight: "600", color: "#94A3B8" }}>+{course.skills.length - 4}</Text>
          </View>
        </View>
      </View>
    </Appear>
  );

  const paywallCard = (
    <Appear from="down" delay={250} duration={600} style={isWide ? { width: 320 } : undefined}>
      <View style={{
        backgroundColor: "#FFFFFF", borderRadius: 20, padding: isWide ? 28 : 24, alignItems: "center",
        borderWidth: 1, borderColor: "#E2E8F1",
        shadowColor: "#0F172A", shadowOpacity: 0.08, shadowRadius: 24, shadowOffset: { width: 0, height: 8 },
      }}>
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "#E6F4F8", alignItems: "center", justifyContent: "center" }}>
          <Sparkles size={22} color="#5DBFD6" />
        </View>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#13243A", marginTop: 12, textAlign: "center" }}>
          Your analysis is ready
        </Text>
        <Text style={{ fontSize: 13, color: "#64748B", marginTop: 4, textAlign: "center" }}>
          Sign up to unlock your full breakdown
        </Text>

        <View style={{ width: "100%", marginTop: 20, gap: 10 }}>
          {[
            { icon: TrendingUp, text: "AI course summary", color: "#5DBFD6" },
            { icon: Calendar, text: "Weekly schedule & deadlines", color: "#E0A23A" },
            { icon: BookOpen, text: "Grade & hour breakdown", color: "#3FBF7F" },
            { icon: Target, text: "Program comparison", color: "#8B5CF6" },
          ].map((item, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: `${item.color}14`, alignItems: "center", justifyContent: "center" }}>
                <item.icon size={14} color={item.color} />
              </View>
              <Text style={{ fontSize: 13, color: "#13243A", fontWeight: "500", marginLeft: 10 }}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={{ width: "100%", marginTop: 20 }}>
          <PrimaryButton title="Sign Up Free" onPress={() => navigation.navigate("SignUp")} />
        </View>
        <Text style={{ fontSize: 10, color: "#94A3B8", marginTop: 8 }}>
          No credit card · 30 seconds
        </Text>
      </View>
    </Appear>
  );

  if (isWide) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F4F7FB", justifyContent: "center", alignItems: "center", padding: 48 }}>
        <View style={{ width: "100%", maxWidth: 900 }}>
          <View style={{ flexDirection: "row", gap: 16, alignItems: "flex-start" }}>
            {courseCard}
            {paywallCard}
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F4F7FB" }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 16,
          paddingBottom: 32,
        }}
      >
        <View style={{ gap: 14 }}>
          {courseCard}
          {paywallCard}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
