import { View, Text } from "react-native";
import { BookOpen, Bell, Calendar, Plus } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { useTheme, tokens } from "../../lib/theme";
import { PrimaryButton } from "./PrimaryButton";

type Props = {
  type: "courses" | "notifications" | "deadlines";
  onAction?: () => void;
};

const config: Record<string, { Icon: LucideIcon; title: string; body: string; action?: string }> = {
  courses: {
    Icon: BookOpen,
    title: "No courses yet",
    body: "Upload a syllabus to get started with personalized insights and deadline tracking.",
    action: "Upload Syllabus",
  },
  notifications: {
    Icon: Bell,
    title: "All caught up!",
    body: "You have no new notifications. We'll alert you when deadlines are approaching.",
  },
  deadlines: {
    Icon: Calendar,
    title: "No upcoming deadlines",
    body: "Once you upload a syllabus, your key dates and deadlines will appear here.",
  },
};

export default function EmptyState({ type, onAction }: Props) {
  const mode = useTheme((s) => s.mode);
  const t = tokens[mode];
  const { Icon, title, body, action } = config[type];

  return (
    <View style={{ alignItems: "center", paddingVertical: 48, paddingHorizontal: 32 }}>
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: mode === "dark" ? "rgba(93,191,214,0.15)" : "#E6F4F8",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <Icon size={36} color="#5DBFD6" />
      </View>
      <Text className={`text-xl font-bold text-center ${t.text}`}>{title}</Text>
      <Text className={`text-sm text-center mt-2 ${t.textMuted}`} style={{ maxWidth: 280, lineHeight: 20 }}>
        {body}
      </Text>
      {action && onAction && (
        <View style={{ marginTop: 24, width: 200 }}>
          <PrimaryButton title={action} onPress={onAction} />
        </View>
      )}
    </View>
  );
}
export { EmptyState };
