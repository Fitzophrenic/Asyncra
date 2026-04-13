import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, ChevronRight, Search } from "lucide-react-native";

import { mockComparisons, ProgramComparison } from "../../lib/mockData";
import { useTheme, tokens } from "../../lib/theme";

import HeaderBand from "../../components/ui/HeaderBand";
import TextField from "../../components/ui/TextField";
import Card from "../../components/ui/Card";
import ProgressBar from "../../components/ui/ProgressBar";
import Appear, { useFocusKey } from "../../components/ui/Appear";
import { useIsWide } from "../../components/layout/AppShell";

function colorForValue(v: number): "success" | "warning" | "danger" {
  if (v >= 85) return "success";
  if (v >= 70) return "warning";
  return "danger";
}

function StatRow({
  label,
  value,
  display,
  color,
  animDelay,
  resetKey,
}: {
  label: string;
  value: number;
  display: string;
  color: "success" | "warning" | "danger" | "info";
  animDelay?: number;
  resetKey?: number;
}) {
  const mode = useTheme((s) => s.mode);
  const t = tokens[mode];
  const displayColor =
    color === "success"
      ? "text-emerald-500"
      : color === "warning"
        ? "text-amber-500"
        : color === "danger"
          ? "text-red-500"
          : "text-asy-accent";
  return (
    <View className="mb-3">
      <View className="flex-row justify-between mb-1">
        <Text className={`text-[10px] font-semibold uppercase tracking-wider ${t.textMuted}`}>
          {label}
        </Text>
        <Text className={`text-xs font-bold ${displayColor}`}>{display}</Text>
      </View>
      <ProgressBar value={value} max={100} color={color} animateDelay={animDelay} resetKey={resetKey} />
    </View>
  );
}

function ComparisonCard({ p, delay, focusKey }: { p: ProgramComparison; delay: number; focusKey: number }) {
  const mode = useTheme((s) => s.mode);
  const t = tokens[mode];
  return (
    <Appear from="down" delay={delay} duration={500} key={focusKey + p.id}>
      <Card className="mb-4">
        <Text className={`text-lg font-bold ${t.text}`}>{p.institution}</Text>
        <Text className={`text-xs mt-1 mb-4 ${t.textMuted}`}>{p.degree}</Text>
        <View className={`border-t ${t.border} pt-4`}>
          <StatRow label="Graduation Rate" value={p.graduationRate} display={`${p.graduationRate}%`} color={colorForValue(p.graduationRate)} animDelay={delay + 200} resetKey={focusKey} />
          <StatRow label="Avg. Salary" value={Math.min(100, p.avgStartingSalary)} display={`$${p.avgStartingSalary}k`} color="warning" animDelay={delay + 350} resetKey={focusKey} />
          <StatRow label="Career Readiness" value={p.careerReadiness} display={`${p.careerReadiness}%`} color={colorForValue(p.careerReadiness)} animDelay={delay + 500} resetKey={focusKey} />
          <StatRow label="Workload Intensity" value={p.workloadIntensity} display={`${p.workloadIntensity}%`} color={colorForValue(p.workloadIntensity)} animDelay={delay + 650} resetKey={focusKey} />
        </View>
        <View className={`flex-row mt-4 pt-4 border-t ${t.border}`}>
          <View className="flex-1 pr-2">
            <Text className="text-[10px] font-bold uppercase tracking-wider mb-2 text-emerald-500">Strengths</Text>
            {p.strengths.map((s) => (
              <View key={s} className="flex-row mb-1">
                <Text className="text-emerald-500 mr-1">✓</Text>
                <Text className={`text-xs flex-1 ${t.textSecondary}`}>{s}</Text>
              </View>
            ))}
          </View>
          <View className="flex-1 pl-2">
            <Text className="text-[10px] font-bold uppercase tracking-wider mb-2 text-red-500">Weaknesses</Text>
            {p.weaknesses.map((w) => (
              <View key={w} className="flex-row mb-1">
                <Text className="text-red-500 mr-1">×</Text>
                <Text className={`text-xs flex-1 ${t.textSecondary}`}>{w}</Text>
              </View>
            ))}
          </View>
        </View>
      </Card>
    </Appear>
  );
}

export default function CompareScreen() {
  const mode = useTheme((s) => s.mode);
  const t = tokens[mode];
  const isWide = useIsWide();
  const [search, setSearch] = useState("");
  const [index, setIndex] = useState(0);
  const focusKey = useFocusKey();

  const q = search.trim().toLowerCase();
  const filtered = q
    ? mockComparisons.filter(
        (p) =>
          p.institution.toLowerCase().includes(q) ||
          p.degree.toLowerCase().includes(q),
      )
    : mockComparisons;

  const safeIndex = Math.min(index, Math.max(0, filtered.length - 1));
  const current = filtered[safeIndex];

  return (
    <SafeAreaView className={`flex-1 ${t.bg}`} edges={["bottom"]}>
      <HeaderBand
        title="Program Comparison"
        subtitle="Compare programs side-by-side to make informed decisions"
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: isWide ? 48 : 20,
          paddingTop: 20,
          paddingBottom: 110,
        }}
      >
        <View style={{ width: "100%" }}>
        <Appear from="down" delay={50} duration={400} key={`search-${focusKey}`}>
          <View className="mb-5" style={{ maxWidth: isWide ? 640 : undefined }}>
            <TextField
              value={search}
              onChangeText={(v) => {
                setSearch(v);
                setIndex(0);
              }}
              placeholder="Search for programs or institutions..."
              leftIcon={Search}
            />
          </View>
        </Appear>

        {filtered.length === 0 ? (
          <Text className={`text-center py-10 text-sm ${t.textMuted}`}>No programs found</Text>
        ) : isWide ? (
          <View className="flex-row flex-wrap -mx-2">
            {filtered.map((p, i) => (
              <View key={p.id} className="px-2 mb-4" style={{ width: "50%" }}>
                <ComparisonCard p={p} delay={100 + i * 120} focusKey={focusKey} />
              </View>
            ))}
          </View>
        ) : (
          <>
            {current ? <ComparisonCard p={current} delay={100} focusKey={focusKey} /> : null}
            {filtered.length > 1 ? (
              <View className="items-center mt-2">
                <View className="flex-row gap-3 mb-3">
                  <Pressable
                    onPress={() => setIndex((i) => Math.max(0, i - 1))}
                    disabled={safeIndex === 0}
                    className={`w-12 h-12 rounded-full items-center justify-center ${safeIndex === 0 ? "bg-asy-accent/30" : "bg-asy-accent/60"}`}
                  >
                    <ChevronLeft size={20} color="#FFFFFF" />
                  </Pressable>
                  <Pressable
                    onPress={() => setIndex((i) => Math.min(filtered.length - 1, i + 1))}
                    disabled={safeIndex === filtered.length - 1}
                    className={`w-12 h-12 rounded-full items-center justify-center ${safeIndex === filtered.length - 1 ? "bg-asy-accent/30" : "bg-asy-accent"}`}
                  >
                    <ChevronRight size={20} color="#FFFFFF" />
                  </Pressable>
                </View>
                <View className="flex-row gap-2">
                  {filtered.map((_, i) => (
                    <View
                      key={i}
                      className={`h-1.5 rounded-full ${i === safeIndex ? "w-6 bg-asy-accent" : "w-1.5 bg-asy-accent/40"}`}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
