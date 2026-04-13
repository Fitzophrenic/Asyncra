import { View, Text, ScrollView } from "react-native";
import { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../navigation/RootNavigator";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Card } from "../../components/ui/Card";
import { Slider } from "../../components/ui/Slider";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { Appear } from "../../components/ui/Appear";
import { useAuth } from "../../lib/auth";

type Props = NativeStackScreenProps<RootStackParamList, "OnboardingHours">;

function Dots({ active }: { active: number }) {
  return (
    <View className="flex-row justify-center gap-2 mt-8">
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          className={`w-2 h-2 rounded-full ${i === active ? "bg-brand-cyan" : "bg-surfaceLight-border"}`}
        />
      ))}
    </View>
  );
}

export default function OnboardingHoursScreen({ navigation }: Props) {
  const [hours, setHours] = useState(20);

  const setOnboarding = useAuth((s) => s.setOnboardingData);
  const complete = () => {
    setOnboarding({ weeklyStudyHours: hours });
    navigation.navigate("Preview");
  };

  return (
    <View className="flex-1 bg-slate-50">
      <View style={{ paddingTop: 56, paddingHorizontal: 20 }}>
        <ProgressBar value={4} max={4} />
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      >
        <View style={{ width: "100%", maxWidth: 720 }}>
          <Appear from="down" delay={80} duration={550}>
            <Text
              className="text-3xl font-bold text-center"
              style={{ color: "#13243A", fontSize: 32 }}
            >
              How many hours per week can you dedicate to studying?
            </Text>
            <Text className="text-sm text-center mt-3" style={{ color: "#64748B" }}>
              This helps us give you realistic workload assessments
            </Text>
          </Appear>

          <Appear from="down" delay={200} duration={550}>
            <Card variant="paper" className="p-6 mt-8 items-center">
              <Text className="text-brand-cyan text-6xl font-bold">{hours}</Text>
              <Text className="text-inkLight-muted text-xs font-semibold tracking-wider mt-1">
                HOURS PER WEEK
              </Text>
              <View className="w-full mt-6">
                <Slider value={hours} onValueChange={setHours} min={0} max={40} step={1} />
              </View>
              <View className="w-full mt-6">
                <PrimaryButton title="Almost Done" onPress={complete} />
              </View>
            </Card>
          </Appear>

          <Appear from="fade" delay={500} duration={500}>
            <Dots active={3} />
          </Appear>
        </View>
      </ScrollView>
    </View>
  );
}
