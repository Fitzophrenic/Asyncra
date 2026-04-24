import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Easing, Pressable, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AlertCircle, CheckCircle2, FileText } from "lucide-react-native";

import { RootStackParamList } from "../../navigation/RootNavigator";
import { uploadApi } from "../../lib/api";
import { useAppStore } from "../../lib/store";

type Props = NativeStackScreenProps<RootStackParamList, "Processing">;

const STEPS = [
  "Reading course structure",
  "Identifying key dates",
  "Calculating workload intensity",
  "Mapping skills and tools",
];

export default function ProcessingScreen({ navigation, route }: Props) {
  const [completed, setCompleted] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const pulse = useRef(new Animated.Value(1)).current;
  const setPendingAnalysis = useAppStore((s) => s.setPendingAnalysis);

  const { draft } = route.params ?? {};

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    let cancelled = false;

    // advance the step indicator steadily while the real upload runs
    const stepTimers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= STEPS.length - 1; i++) {
      stepTimers.push(
        setTimeout(() => {
          if (!cancelled) setCompleted(i);
        }, i * 1100),
      );
    }

    async function run() {
      try {
        if (!draft) {
          throw new Error("No syllabus provided");
        }
        const analysis = await uploadApi.preview(
          draft.uri,
          draft.name,
          draft.mimeType || "application/pdf",
        );

        if (cancelled) return;
        setPendingAnalysis(analysis);
        setCompleted(STEPS.length);
        setTimeout(() => {
          if (!cancelled) navigation.replace("OnboardingMajor");
        }, 400);
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || "Failed to analyze syllabus");
      }
    }

    run();

    return () => {
      cancelled = true;
      stepTimers.forEach(clearTimeout);
    };
  }, [navigation, draft, setPendingAnalysis]);

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F4F7FB", alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
        <View style={{ width: 112, height: 112, borderRadius: 16, backgroundColor: "#FFF0F0", borderWidth: 1, borderColor: "#FCA5A5", alignItems: "center", justifyContent: "center", marginBottom: 32 }}>
          <AlertCircle size={48} color="#E25C5C" />
        </View>
        <Text style={{ fontSize: 22, fontWeight: "700", color: "#13243A", marginBottom: 8, textAlign: "center" }}>
          Couldn't analyze your syllabus
        </Text>
        <Text style={{ fontSize: 13, color: "#64748B", marginBottom: 24, textAlign: "center", maxWidth: 360 }}>
          {error}
        </Text>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{ backgroundColor: "#1B3A6B", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F7FB", alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
      <Animated.View
        style={{
          transform: [{ scale: pulse }],
          width: 112,
          height: 112,
          borderRadius: 16,
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: "#E2E8F1",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 32,
        }}
      >
        <FileText size={48} color="#5DBFD6" />
      </Animated.View>
      <Text style={{ fontSize: 24, fontWeight: "700", color: "#13243A", marginBottom: 24 }}>
        Analyzing Your Syllabus
      </Text>
      <View
        style={{
          backgroundColor: "#FFFFFF",
          borderWidth: 1,
          borderColor: "#E2E8F1",
          borderRadius: 16,
          padding: 20,
          width: "100%",
          maxWidth: 400,
        }}
      >
        {STEPS.map((label, i) => {
          const done = i < completed;
          const inProgress = i === completed;
          return (
            <View key={label} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8 }}>
              <View style={{ width: 24, height: 24, marginRight: 12, alignItems: "center", justifyContent: "center" }}>
                {done ? (
                  <CheckCircle2 size={20} color="#5DBFD6" />
                ) : inProgress ? (
                  <ActivityIndicator size="small" color="#5DBFD6" />
                ) : (
                  <View style={{ width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: "#E2E8F1" }} />
                )}
              </View>
              <Text style={{ fontSize: 14, color: done || inProgress ? "#13243A" : "#94A3B8" }}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={{ marginTop: 16, fontSize: 12, color: "#94A3B8" }}>
        This usually takes just a few seconds
      </Text>
    </View>
  );
}
