import React from "react";
import { Pressable, Text, View } from "react-native";
import { BookOpen, Clock } from "lucide-react-native";
import type { Course } from "../../lib/types";
import { useTheme, tokens } from "../../lib/theme";

type Props = { course: Course; onPress: () => void };

const dotColor: Record<Course["workload"], string> = {
  light: "bg-emerald-500",
  medium: "bg-amber-500",
  heavy: "bg-red-500",
};

export default function CourseCard({ course, onPress }: Props) {
  const mode = useTheme((s) => s.mode);
  const t = tokens[mode];
  const [lo, hi] = course.weeklyHours;
  const metaColor = mode === "dark" ? "#8A9BB5" : "#64748B";

  return (
    <Pressable
      onPress={onPress}
      className={`${t.bgCard} border ${t.border} rounded-2xl p-5`}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className={`text-lg font-bold ${t.text}`}>{course.title}</Text>
          <Text className={`text-xs mt-1 ${t.textMuted}`}>{course.code}</Text>
        </View>
        <View className={`w-2.5 h-2.5 rounded-full ${dotColor[course.workload]}`} />
      </View>
      <View className="flex-row items-center gap-4 mt-4">
        <View className="flex-row items-center gap-1.5">
          <BookOpen size={14} color={metaColor} />
          <Text className={`text-sm ${t.textMuted}`}>{course.credits} credits</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Clock size={14} color={metaColor} />
          <Text className={`text-sm ${t.textMuted}`}>
            {lo}-{hi} hrs
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
