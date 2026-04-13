import React, { ReactNode } from "react";
import { Platform, View, useWindowDimensions } from "react-native";
import { useTheme, tokens } from "../../lib/theme";
import Sidebar from "./Sidebar";

export function useIsWide() {
  const { width } = useWindowDimensions();
  return Platform.OS === "web" && width >= 1024;
}

export default function AppShell({ children }: { children: ReactNode }) {
  const isWide = useIsWide();
  const mode = useTheme((s) => s.mode);
  const t = tokens[mode];

  if (!isWide) return <>{children}</>;

  return (
    <View className={`flex-row ${t.bg}`} style={{ height: "100%" }}>
      <Sidebar />
      <View className="flex-1">{children}</View>
    </View>
  );
}
export { AppShell };
