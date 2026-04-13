import { ReactNode } from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../lib/theme";

export type PillVariant = "skill" | "success" | "warning" | "danger" | "date" | "neutral" | "status";
export type PillTone = "success" | "warning" | "danger" | "info";

export type PillProps = {
  label: string;
  variant?: PillVariant;
  tone?: PillTone;
  icon?: ReactNode;
  size?: "sm" | "md";
};

const variantMap: Record<Exclude<PillVariant, "status">, { bg: string; text: string }> = {
  skill: { bg: "bg-brand-cyanTint", text: "text-brand-navy" },
  success: { bg: "bg-status-success/20", text: "text-status-success" },
  warning: { bg: "bg-status-warning/20", text: "text-status-warning" },
  danger: { bg: "bg-status-danger/20", text: "text-status-danger" },
  date: { bg: "bg-brand-cyan", text: "text-brand-navyDeep" },
  neutral: { bg: "bg-surface-panelAlt", text: "text-ink-secondary" },
};

const toneMap: Record<PillTone, { bg: string; text: string }> = {
  success: { bg: "bg-status-success/20", text: "text-status-success" },
  warning: { bg: "bg-status-warning/20", text: "text-status-warning" },
  danger: { bg: "bg-status-danger/20", text: "text-status-danger" },
  info: { bg: "bg-status-info/20", text: "text-status-info" },
};

export default function Pill({ label, variant = "neutral", tone, icon, size = "md" }: PillProps) {
  const mode = useTheme((s) => s.mode);
  const neutralThemed =
    mode === "dark"
      ? { bg: "bg-surface-panelAlt", text: "text-ink-secondary" }
      : { bg: "bg-surfaceLight-panelAlt", text: "text-inkLight-secondary" };
  const v =
    variant === "status"
      ? toneMap[tone ?? "info"]
      : variant === "neutral"
        ? neutralThemed
        : variantMap[variant];
  const padding = size === "sm" ? "px-2 py-0.5" : "px-3 py-1";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <View className={`flex-row items-center self-start rounded-full ${padding} ${v.bg}`}>
      {icon ? <View className="mr-1">{icon}</View> : null}
      <Text className={`font-semibold ${textSize} ${v.text}`}>{label}</Text>
    </View>
  );
}
export { Pill };
