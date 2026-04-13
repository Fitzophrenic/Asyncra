import { Switch, Text, View } from "react-native";
import { useTheme } from "../../lib/theme";

export type ToggleProps = {
  value: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  subtitle?: string;
};

export default function Toggle({ value, onChange, label, subtitle }: ToggleProps) {
  const mode = useTheme((s) => s.mode);
  const isDark = mode === "dark";
  const titleColor = isDark ? "text-ink-primary" : "text-inkLight-primary";
  const subColor = isDark ? "text-ink-muted" : "text-inkLight-muted";

  return (
    <View className="flex-row items-center justify-between py-3">
      {(label || subtitle) && (
        <View className="flex-1 pr-4">
          {label ? <Text className={`text-base font-medium ${titleColor}`}>{label}</Text> : null}
          {subtitle ? <Text className={`mt-0.5 text-xs ${subColor}`}>{subtitle}</Text> : null}
        </View>
      )}
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#1F3147", true: "#5DBFD6" }}
        thumbColor={value ? "#FFFFFF" : "#B6C2D1"}
      />
    </View>
  );
}
export { Toggle };
