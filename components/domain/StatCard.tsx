import React from "react";
import { Text } from "react-native";
import { Card } from "../ui";
import { useTheme, tokens } from "../../lib/theme";

type Props = { label: string; value: string };

export default function StatCard({ label, value }: Props) {
  const mode = useTheme((s) => s.mode);
  const t = tokens[mode];
  return (
    <Card variant="surface" className="p-5 flex-1">
      <Text className={`text-xs font-semibold tracking-wider uppercase ${t.textMuted}`}>
        {label}
      </Text>
      <Text className="text-cyan-400 text-3xl font-bold mt-2">{value}</Text>
    </Card>
  );
}
