import { View, Text, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { RootStackParamList } from "../../navigation/RootNavigator";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { OptionPill } from "../../components/domain/OptionPill";
import { Appear } from "../../components/ui/Appear";
import { useIsWide } from "../../components/layout/AppShell";
import { useAuth } from "../../lib/auth";
import { Clock, Clock3 } from "lucide-react-native";

type Props = NativeStackScreenProps<RootStackParamList, "OnboardingEnrollment">;

const OPTIONS = [
  { label: "Full-time", icon: Clock },
  { label: "Part-time", icon: Clock3 },
];

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

export default function OnboardingEnrollmentScreen({ navigation }: Props) {
  const setOnboarding = useAuth((s) => s.setOnboardingData);
  const select = (label: string) => {
    setOnboarding({ enrollment: label.toLowerCase().replace("-", "-") as "full-time" | "part-time" });
    navigation.navigate("OnboardingGoal");
  };
  const isWide = useIsWide();

  return (
    <View className="flex-1 bg-slate-50">
      <View style={{ paddingTop: 56, paddingHorizontal: 20 }}>
        <ProgressBar value={2} max={4} />
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
              Are you enrolled full-time or part-time?
            </Text>
          </Appear>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "space-between",
              marginTop: 40,
            }}
          >
            {OPTIONS.map((o, i) => (
              <View
                key={o.label}
                style={{ width: isWide ? "48%" : "100%", marginBottom: 16 }}
              >
                <Appear delay={200 + i * 80} duration={500}>
                  <OptionPill label={o.label} icon={o.icon} onPress={() => select(o.label)} />
                </Appear>
              </View>
            ))}
          </View>

          <Appear from="fade" delay={500} duration={500}>
            <Dots active={1} />
          </Appear>
        </View>
      </ScrollView>
    </View>
  );
}
