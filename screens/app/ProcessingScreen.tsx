import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Easing, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CheckCircle2, FileText } from "lucide-react-native";

import { RootStackParamList } from "../../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "Processing">;

const STEPS = [
  "Reading course structure",
  "Identifying key dates",
  "Calculating workload intensity",
  "Mapping skills and tools",
];

export default function ProcessingScreen({ navigation }: Props) {
  const [completed, setCompleted] = useState(0);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 1; i <= STEPS.length; i++) {
      timers.push(
        setTimeout(() => {
          setCompleted(i);
        }, i * 900),
      );
    }
    timers.push(
      setTimeout(() => {
        navigation.replace("OnboardingMajor");
      }, STEPS.length * 900 + 500),
    );
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [navigation]);

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
