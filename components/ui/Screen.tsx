import { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme, tokens } from "../../lib/theme";

export type ScreenProps = {
  children: ReactNode;
  variant?: "dark" | "light";
  scroll?: boolean;
  className?: string;
};

export default function Screen({ children, variant, scroll = false, className = "" }: ScreenProps) {
  const mode = useTheme((s) => s.mode);
  const resolved = variant ?? mode;
  const t = tokens[resolved];

  const inner = scroll ? (
    <ScrollView className={`flex-1 ${t.bg} ${className}`} contentContainerStyle={{ flexGrow: 1 }}>
      {children}
    </ScrollView>
  ) : (
    <View className={`flex-1 ${t.bg} ${className}`}>{children}</View>
  );

  return <SafeAreaView className={`flex-1 ${t.bg}`}>{inner}</SafeAreaView>;
}
export { Screen };
