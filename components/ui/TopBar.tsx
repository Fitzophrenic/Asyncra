import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { useTheme, tokens } from "../../lib/theme";

export type TopBarProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: ReactNode;
  variant?: "navy" | "transparent";
};

export default function TopBar({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightSlot,
  variant = "navy",
}: TopBarProps) {
  const mode = useTheme((s) => s.mode);
  const t = tokens[mode];

  const isNavy = variant === "navy";
  const bg = isNavy ? "bg-brand-navy" : "bg-transparent";
  const titleColor = isNavy ? "text-ink-primary" : t.text;
  const subColor = isNavy ? "text-brand-cyanSoft" : t.textSecondary;

  return (
    <View className={`flex-row items-center px-4 py-4 ${bg}`}>
      {showBack && (
        <Pressable onPress={onBack} className="mr-3 h-9 w-9 items-center justify-center rounded-full">
          <Text className={`text-2xl ${titleColor}`}>‹</Text>
        </Pressable>
      )}
      <View className="flex-1">
        <Text className={`font-bold text-xl ${titleColor}`}>{title}</Text>
        {subtitle ? <Text className={`mt-0.5 text-xs ${subColor}`}>{subtitle}</Text> : null}
      </View>
      {rightSlot ? <View className="ml-3">{rightSlot}</View> : null}
    </View>
  );
}
export { TopBar };
