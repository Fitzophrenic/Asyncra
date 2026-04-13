import { View, Text } from "react-native";
import { AlertTriangle, Clock } from "lucide-react-native";
import { useTheme, tokens } from "../../lib/theme";
import { mockDeadlines } from "../../lib/mockData";

export default function TodayFocus() {
  const mode = useTheme((s) => s.mode);
  const t = tokens[mode];

  // Find most urgent deadline
  const urgent = [...mockDeadlines].sort((a, b) => a.daysLeft - b.daysLeft)[0];
  if (!urgent) return null;

  const urgencyColor = urgent.daysLeft <= 1 ? "#E25C5C" : urgent.daysLeft <= 3 ? "#E0A23A" : "#5DBFD6";
  const urgencyBg = urgent.daysLeft <= 1
    ? (mode === "dark" ? "rgba(226,92,92,0.12)" : "#FEF2F2")
    : urgent.daysLeft <= 3
      ? (mode === "dark" ? "rgba(224,162,58,0.12)" : "#FFF7ED")
      : (mode === "dark" ? "rgba(93,191,214,0.12)" : "#E6F4F8");

  return (
    <View
      style={{
        backgroundColor: urgencyBg,
        borderRadius: 16,
        padding: 16,
        flex: 1,
        borderLeftWidth: 4,
        borderLeftColor: urgencyColor,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
        <AlertTriangle size={14} color={urgencyColor} />
        <Text style={{ fontSize: 11, fontWeight: "700", color: urgencyColor, letterSpacing: 1, marginLeft: 6 }}>
          TODAY'S FOCUS
        </Text>
      </View>
      <Text className={`text-base font-bold ${t.text}`}>{urgent.title}</Text>
      <Text className={`text-xs mt-1 ${t.textMuted}`}>{urgent.courseTag}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
        <Clock size={11} color={urgencyColor} />
        <Text style={{ fontSize: 12, fontWeight: "600", color: urgencyColor, marginLeft: 4 }}>
          {urgent.daysLeft === 0 ? "Due today" : urgent.daysLeft === 1 ? "Due tomorrow" : `${urgent.daysLeft} days left`}
        </Text>
      </View>
    </View>
  );
}
export { TodayFocus };
