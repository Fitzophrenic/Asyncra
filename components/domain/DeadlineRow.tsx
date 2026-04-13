import React from "react";
import { Pressable, Text, View } from "react-native";
import { Pill } from "../ui";
import { Deadline } from "../../lib/mockData";
import { useTheme, tokens } from "../../lib/theme";

type Props = {
  deadline: Deadline;
  showDismiss?: boolean;
  onDismiss?: () => void;
  showCountdown?: boolean;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const month = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
  return `${month} ${d.getDate()}`;
}

export default function DeadlineRow({
  deadline,
  showDismiss,
  onDismiss,
  showCountdown,
}: Props) {
  const mode = useTheme((s) => s.mode);
  const t = tokens[mode];

  return (
    <View className="flex-row items-center py-3">
      <Pill variant="date" label={formatDate(deadline.dueDate)} />
      <View className="flex-1 ml-3">
        <Text className={`text-sm font-semibold ${t.text}`} numberOfLines={1}>
          {deadline.title}
        </Text>
        <Text className={`text-xs mt-0.5 ${t.textMuted}`}>
          {deadline.courseTag}
        </Text>
      </View>
      {showCountdown ? (
        <View className="bg-brand-cyanTint px-2 py-1 rounded-md ml-2">
          <Text className="text-xs font-bold text-brand-navyDeep">
            {deadline.daysLeft}D LEFT
          </Text>
        </View>
      ) : null}
      {showDismiss ? (
        <Pressable onPress={onDismiss} className="ml-2 px-2">
          <Text className={`text-xl ${t.textMuted}`}>×</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
