import React from "react";
import { View, Text } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { useTheme, tokens } from "../../lib/theme";

type Datum = { label: string; value: number; color: string };
type Props = { data: Datum[]; size?: number };

export default function DonutChart({ data, size = 160 }: Props) {
  const mode = useTheme((s) => s.mode);
  const t = tokens[mode];

  const pieData = data.map((d) => ({ value: d.value, color: d.color }));
  const radius = size / 2;
  const innerRadius = radius * 0.62;

  return (
    <View className="flex-row items-center">
      <PieChart
        data={pieData}
        donut
        radius={radius}
        innerRadius={innerRadius}
        innerCircleColor="transparent"
      />
      <View className="ml-5 flex-1">
        {data.map((d) => (
          <View key={d.label} className="flex-row items-center py-1">
            <View
              className="w-3 h-3 rounded-sm mr-2"
              style={{ backgroundColor: d.color }}
            />
            <Text className={`text-sm flex-1 ${t.textSecondary}`}>{d.label}</Text>
            <Text className={`text-sm font-semibold ${t.text}`}>{d.value}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
