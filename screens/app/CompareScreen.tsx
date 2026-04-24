import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check, ChevronLeft, ChevronRight, Search } from "lucide-react-native";

import type { ProgramComparison } from "../../lib/types";
import { useAppStore } from "../../lib/store";
import { useAuth } from "../../lib/auth";
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

function ComparisonCard({
  p,
  delay,
  focusKey,
  selected,
  onToggleSelect,
}: {
  p: ProgramComparison;
  delay: number;
  focusKey: number;
  selected: boolean;
  onToggleSelect: () => void;
}) {
  const mode = useTheme((s) => s.mode);
  const t = tokens[mode];
  return (
    <Appear from="down" delay={delay} duration={500} key={focusKey + p.id}>
      <Card className="mb-4" style={selected ? { borderColor: "#5DBFD6", borderWidth: 2 } : undefined}>
        {/* Header with checkmark selector */}
        <View className="flex-row items-start">
          <View style={{ flex: 1 }}>
            <Text className={`text-lg font-bold ${t.text}`}>{p.institution}</Text>
            <Text className={`text-xs mt-1 mb-4 ${t.textMuted}`}>{p.degree}</Text>
          </View>
          <Pressable
            onPress={onToggleSelect}
            hitSlop={10}
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: selected ? "#5DBFD6" : mode === "dark" ? "#3A3F4E" : "#CBD5E1",
              backgroundColor: selected ? "#5DBFD6" : "transparent",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: 8,
            }}
          >
            {selected ? <Check size={16} color="#FFFFFF" /> : null}
          </Pressable>
        </View>

        <View className={`border-t ${t.border} pt-4`}>
          <StatRow
            label="Graduation Rate"
            value={p.graduationRate}
            display={`${p.graduationRate}%`}
            color={colorForValue(p.graduationRate)}
            animDelay={delay + 200}
            resetKey={focusKey}
          />
          <StatRow
            label="Avg. Salary"
            value={Math.min(100, p.avgStartingSalary)}
            display={`$${p.avgStartingSalary}k`}
            color="warning"
            animDelay={delay + 350}
            resetKey={focusKey}
          />
          <StatRow
            label="Career Readiness"
            value={p.careerReadiness}
            display={`${p.careerReadiness}%`}
            color={colorForValue(p.careerReadiness)}
            animDelay={delay + 500}
            resetKey={focusKey}
          />
          <StatRow
            label="Workload Intensity"
            value={p.workloadIntensity}
            display={`${p.workloadIntensity}%`}
            color={colorForValue(p.workloadIntensity)}
            animDelay={delay + 650}
            resetKey={focusKey}
          />
        </View>

        <View className={`flex-row mt-4 pt-4 border-t ${t.border}`}>
          <View className="flex-1 pr-2">
            <Text className="text-[10px] font-bold uppercase tracking-wider mb-2 text-emerald-500">
              Strengths
            </Text>
            {p.strengths.map((s) => (
              <View key={s} className="flex-row mb-1">
                <Text className="text-emerald-500 mr-1">✓</Text>
                <Text className={`text-xs flex-1 ${t.textSecondary}`}>{s}</Text>
              </View>
            ))}
          </View>
          <View className="flex-1 pl-2">
            <Text className="text-[10px] font-bold uppercase tracking-wider mb-2 text-red-500">
              Weaknesses
            </Text>
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
  // keep full objects so picks survive a new search
  const [selectedPrograms, setSelectedPrograms] = useState<ProgramComparison[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const focusKey = useFocusKey();
  const comparisons = useAppStore((s) => s.comparisons);
  const fetchComparisons = useAppStore((s) => s.fetchComparisons);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const user = useAuth((s) => s.user);
  const major = user?.major && user.major !== "Undeclared" ? user.major : null;

  const MIN_SELECT = 2;
  const MAX_SELECT = 3;

  useFocusEffect(
    React.useCallback(() => {
      if (!isAuthenticated) return;
      setIsLoading(true);
      fetchComparisons(undefined)
        .catch((err) => console.warn("fetchComparisons failed:", err))
        .finally(() => setIsLoading(false));
    }, [isAuthenticated, fetchComparisons])
  );

  // debounce search to avoid hitting API on every keystroke
  useEffect(() => {
    if (!isAuthenticated) return;
    const trimmed = search.trim();
    const handle = setTimeout(() => {
      setIsLoading(true);
      fetchComparisons(trimmed || undefined)
        .catch((err) => console.warn("fetchComparisons failed:", err))
        .finally(() => setIsLoading(false));
    }, 400);
    return () => clearTimeout(handle);
  }, [search, isAuthenticated, fetchComparisons]);

  const toggleSelect = (program: ProgramComparison) => {
    setSelectedPrograms((prev) => {
      if (prev.some((x) => x.id === program.id)) return prev.filter((x) => x.id !== program.id);
      if (prev.length >= MAX_SELECT) return [...prev.slice(1), program];
      return [...prev, program];
    });
    setIndex(0);
  };

  const clearAll = () => {
    setSelectedPrograms([]);
    setIndex(0);
  };

  const selectedIds = selectedPrograms.map((p) => p.id);
  const isComparing = selectedPrograms.length >= MIN_SELECT;
  const safeIndex = Math.min(index, Math.max(0, comparisons.length - 1));

  return (
    <SafeAreaView className={`flex-1 ${t.bg}`} edges={["bottom"]}>
      <HeaderBand
        title="Program Comparison"
        subtitle={
          major
            ? `${major} programs across U.S. colleges`
            : "Compare programs across U.S. colleges"
        }
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
            <View className="mb-3" style={{ maxWidth: isWide ? 640 : undefined }}>
              <TextField
                value={search}
                onChangeText={(v) => {
                  setSearch(v);
                  setIndex(0);
                }}
                placeholder="Search by school name (e.g. LSU, Louisiana State)"
                leftIcon={Search}
              />
            </View>
          </Appear>

          {/* Selection hint + clear action */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className={`text-xs ${t.textMuted}`}>
              {isComparing
                ? `Comparing ${selectedPrograms.length} program${selectedPrograms.length === 1 ? "" : "s"} · clear to browse all`
                : selectedPrograms.length === 1
                  ? `Pick 1 more to start comparing (up to ${MAX_SELECT})`
                  : `Pick at least ${MIN_SELECT} programs (up to ${MAX_SELECT}) to compare side-by-side`}
            </Text>
            {selectedPrograms.length > 0 ? (
              <Pressable onPress={clearAll} hitSlop={8}>
                <Text className="text-xs font-semibold text-asy-accent">Clear selection</Text>
              </Pressable>
            ) : null}
          </View>

          {/* Compare section: selected cards at the top */}
          {isComparing ? (
            <View className="mb-6">
              {isWide ? (
                (() => {
                  // split width across selected cards
                  const columns = Math.min(3, Math.max(2, selectedPrograms.length));
                  const columnWidth = `${100 / columns}%` as `${number}%`;
                  return (
                    <View className="flex-row flex-wrap -mx-2">
                      {selectedPrograms.map((p, i) => (
                        <View key={p.id} className="px-2 mb-4" style={{ width: columnWidth }}>
                          <ComparisonCard
                            p={p}
                            delay={100 + i * 80}
                            focusKey={focusKey}
                            selected
                            onToggleSelect={() => toggleSelect(p)}
                          />
                        </View>
                      ))}
                    </View>
                  );
                })()
              ) : (
                // mobile: scroll so cards sit side by side
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginHorizontal: -20 }}
                  contentContainerStyle={{ paddingHorizontal: 12 }}
                >
                  {selectedPrograms.map((p, i) => (
                    <View
                      key={p.id}
                      style={{
                        width: 280,
                        marginHorizontal: 8,
                      }}
                    >
                      <ComparisonCard
                        p={p}
                        delay={100 + i * 80}
                        focusKey={focusKey}
                        selected
                        onToggleSelect={() => toggleSelect(p)}
                      />
                    </View>
                  ))}
                </ScrollView>
              )}

              {/* mobile: swipe hint */}
              {!isWide && selectedPrograms.length > 1 ? (
                <Text className={`text-center text-[10px] mt-1 mb-3 ${t.textMuted}`}>
                  ← swipe to compare →
                </Text>
              ) : null}

              <View className={`border-t ${t.border} mt-2 mb-1`} />
              <Text className={`text-xs font-bold tracking-wider mt-4 mb-3 ${t.textMuted}`}>
                BROWSE MORE TO ADD OR SWAP
              </Text>
            </View>
          ) : null}

          {/* Browse grid: full results, selected cards highlighted */}
          {isLoading && comparisons.length === 0 ? (
            <Text className={`text-center py-10 text-sm ${t.textMuted}`}>Loading programs…</Text>
          ) : comparisons.length === 0 ? (
            <View className="py-10 items-center">
              <Text className={`text-center text-sm ${t.textMuted}`}>
                {search.trim()
                  ? `No results for "${search.trim()}"`
                  : "No programs reported outcomes for this field. Try a school name."}
              </Text>
            </View>
          ) : isWide ? (
            <View className="flex-row flex-wrap -mx-2">
              {comparisons.map((p, i) => (
                <View key={p.id} className="px-2 mb-4" style={{ width: "50%" }}>
                  <ComparisonCard
                    p={p}
                    delay={100 + i * 60}
                    focusKey={focusKey}
                    selected={selectedIds.includes(p.id)}
                    onToggleSelect={() => toggleSelect(p)}
                  />
                </View>
              ))}
            </View>
          ) : (
            <>
              {comparisons[safeIndex] ? (
                <ComparisonCard
                  p={comparisons[safeIndex]}
                  delay={100}
                  focusKey={focusKey}
                  selected={selectedIds.includes(comparisons[safeIndex].id)}
                  onToggleSelect={() => toggleSelect(comparisons[safeIndex])}
                />
              ) : null}
              {comparisons.length > 1 ? (
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
                      onPress={() => setIndex((i) => Math.min(comparisons.length - 1, i + 1))}
                      disabled={safeIndex === comparisons.length - 1}
                      className={`w-12 h-12 rounded-full items-center justify-center ${safeIndex === comparisons.length - 1 ? "bg-asy-accent/30" : "bg-asy-accent"}`}
                    >
                      <ChevronRight size={20} color="#FFFFFF" />
                    </Pressable>
                  </View>
                  <View className="flex-row gap-2">
                    {comparisons.map((_, i) => (
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

          {comparisons.length > 0 ? (
            <Text className={`text-center mt-6 text-[10px] ${t.textMuted}`}>
              Data: U.S. Department of Education · College Scorecard
            </Text>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
