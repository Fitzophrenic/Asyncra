import { ReactNode } from "react";
import { Text, View } from "react-native";
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { useTheme } from "../../lib/theme";

export type AlertBannerProps = {
  severity: "warning" | "danger" | "info" | "success";
  title: string;
  subtitle?: string;
  icon?: ReactNode;
};

type Tone = {
  stripe: string;
  bgDark: string;
  bgLight: string;
  borderLight: string;
  text: string;
  Icon: LucideIcon;
  iconColor: string;
};

const tones: Record<AlertBannerProps["severity"], Tone> = {
  warning: {
    stripe: "bg-amber-500",
    bgDark: "bg-amber-500/10",
    bgLight: "bg-amber-50",
    borderLight: "border-amber-200",
    text: "text-amber-500",
    Icon: AlertTriangle,
    iconColor: "#F59E0B",
  },
  danger: {
    stripe: "bg-red-500",
    bgDark: "bg-red-500/10",
    bgLight: "bg-red-50",
    borderLight: "border-red-200",
    text: "text-red-500",
    Icon: AlertCircle,
    iconColor: "#EF4444",
  },
  info: {
    stripe: "bg-asy-accent",
    bgDark: "bg-asy-accent/10",
    bgLight: "bg-cyan-50",
    borderLight: "border-cyan-200",
    text: "text-asy-accent",
    Icon: Info,
    iconColor: "#6EC4DE",
  },
  success: {
    stripe: "bg-emerald-500",
    bgDark: "bg-emerald-500/10",
    bgLight: "bg-emerald-50",
    borderLight: "border-emerald-200",
    text: "text-emerald-500",
    Icon: CheckCircle2,
    iconColor: "#10B981",
  },
};

export default function AlertBanner({ severity, title, subtitle, icon }: AlertBannerProps) {
  const mode = useTheme((m) => m.mode);
  const tone = tones[severity];
  const isDark = mode === "dark";
  const bg = isDark ? tone.bgDark : `${tone.bgLight} border ${tone.borderLight}`;
  const subColor = isDark ? "text-asy-textMuted" : "text-slate-600";
  const Icon = tone.Icon;

  return (
    <View className={`flex-row overflow-hidden rounded-2xl ${bg}`}>
      <View className={`w-1 ${tone.stripe}`} />
      <View className="flex-1 flex-row items-start p-4">
        <View className="mr-3 mt-0.5">
          {icon ?? <Icon size={18} color={tone.iconColor} />}
        </View>
        <View className="flex-1">
          <Text className={`font-semibold text-sm ${tone.text}`}>{title}</Text>
          {subtitle ? <Text className={`mt-0.5 text-xs ${subColor}`}>{subtitle}</Text> : null}
        </View>
      </View>
    </View>
  );
}
export { AlertBanner };
