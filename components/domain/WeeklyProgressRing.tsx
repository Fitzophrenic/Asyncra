import { View, Text } from "react-native";
import { useTheme, tokens } from "../../lib/theme";

type Props = {
  logged: number;
  target: number;
};

export default function WeeklyProgressRing({ logged, target }: Props) {
  const mode = useTheme((s) => s.mode);
  const t = tokens[mode];
  const pct = Math.min(1, logged / target);
  const color = pct >= 1 ? "#3FBF7F" : pct >= 0.6 ? "#5DBFD6" : "#E0A23A";

  return (
    <View
      style={{
        backgroundColor: mode === "dark" ? "rgba(93,191,214,0.1)" : "#E6F4F8",
        borderRadius: 16,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      {/* Simple ring visualization */}
      <View style={{ width: 64, height: 64, alignItems: "center", justifyContent: "center", marginRight: 16 }}>
        <View style={{
          width: 64, height: 64, borderRadius: 32,
          borderWidth: 5,
          borderColor: mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        }} />
        <View style={{
          position: "absolute", width: 64, height: 64, borderRadius: 32,
          borderWidth: 5,
          borderColor: color,
          borderTopColor: pct >= 0.25 ? color : "transparent",
          borderRightColor: pct >= 0.5 ? color : "transparent",
          borderBottomColor: pct >= 0.75 ? color : "transparent",
          borderLeftColor: pct >= 1 ? color : "transparent",
          transform: [{ rotate: "-90deg" }],
        }} />
        <Text style={{ position: "absolute", fontSize: 14, fontWeight: "700", color }}>
          {Math.round(pct * 100)}%
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text className={`text-sm font-bold ${t.text}`}>Weekly Study Progress</Text>
        <Text className={`text-xs mt-1 ${t.textMuted}`}>
          {logged} of {target} hours logged
        </Text>
        <View style={{
          height: 5, borderRadius: 3, marginTop: 8,
          backgroundColor: mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        }}>
          <View style={{
            width: `${pct * 100}%`, height: 5, borderRadius: 3, backgroundColor: color,
          }} />
        </View>
      </View>
    </View>
  );
}
export { WeeklyProgressRing };
