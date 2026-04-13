import { useState, useRef } from "react";
import { View, Text, FlatList, Dimensions, Pressable, Platform } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { FileText, BarChart3, Target, ArrowRight, ChevronRight } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

import { RootStackParamList } from "../../navigation/RootNavigator";
import { Logo } from "../../components/ui/Logo";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { useIsWide } from "../../components/layout/AppShell";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

type Slide = { title: string; body: string; Icon: LucideIcon; highlight: string };

const slides: Slide[] = [
  {
    title: "What is Asyncra?",
    body: "Your AI-powered academic advisor that transforms syllabi into personalized study plans, workload insights, and deadline tracking.",
    Icon: FileText,
    highlight: "AI-powered academic advisor",
  },
  {
    title: "How It Works",
    body: "Upload your syllabus PDF, and our AI instantly extracts key dates, grading weights, weekly hour estimates, and skills — all in seconds.",
    Icon: BarChart3,
    highlight: "Upload → Analyze → Organize",
  },
  {
    title: "Stay on Track",
    body: "Get personalized roadmaps, deadline alerts, and workload comparisons to help you succeed in every course.",
    Icon: Target,
    highlight: "Never miss a deadline again",
  },
];

const { width: SCREEN_W } = Dimensions.get("window");

/* ---------- Mobile carousel version ---------- */
function MobileSplash({ navigation }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const goNext = () => {
    if (activeIndex < slides.length - 1) {
      const next = activeIndex + 1;
      setActiveIndex(next);
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
    } else {
      navigation.replace("Landing");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F7FB" }}>
      <View style={{ alignItems: "center", paddingTop: 80, paddingBottom: 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Logo size={48} />
          <Text style={{ fontSize: 28, fontWeight: "700", letterSpacing: 3, color: "#1B3A6B" }}>
            ASYNCRA
          </Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
          if (idx >= 0 && idx < slides.length) setActiveIndex(idx);
        }}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => {
          const Icon = item.Icon;
          return (
            <View style={{ width: SCREEN_W, paddingHorizontal: 40, justifyContent: "center", alignItems: "center" }}>
              <View
                style={{
                  width: 100, height: 100, borderRadius: 50,
                  backgroundColor: "#E6F4F8",
                  alignItems: "center", justifyContent: "center", marginBottom: 32,
                }}
              >
                <Icon size={44} color="#1B3A6B" />
              </View>
              <Text style={{ fontSize: 28, fontWeight: "700", color: "#13243A", textAlign: "center", marginBottom: 16 }}>
                {item.title}
              </Text>
              <Text style={{ fontSize: 16, color: "#64748B", textAlign: "center", lineHeight: 24 }}>
                {item.body}
              </Text>
            </View>
          );
        }}
      />

      <View style={{ paddingHorizontal: 40, paddingBottom: 60 }}>
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 32 }}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === activeIndex ? 24 : 8, height: 8, borderRadius: 4,
                backgroundColor: i === activeIndex ? "#5DBFD6" : "#D1D5DB",
              }}
            />
          ))}
        </View>
        <PrimaryButton
          title={activeIndex === slides.length - 1 ? "Get Started" : "Next"}
          onPress={goNext}
        />
        {activeIndex < slides.length - 1 && (
          <Pressable onPress={() => navigation.replace("Landing")} style={{ marginTop: 16, alignItems: "center" }}>
            <Text style={{ fontSize: 14, color: "#94A3B8" }}>Skip</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

/* ---------- Web full-page version ---------- */
function WebSplash({ navigation }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: "#F4F7FB" }}>
      {/* Hero section */}
      <View style={{ backgroundColor: "#1B3A6B", paddingVertical: 80, alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <Logo size={56} />
          <Text style={{ fontSize: 42, fontWeight: "700", letterSpacing: 4, color: "#FFFFFF" }}>
            ASYNCRA
          </Text>
        </View>
        <Text style={{ fontSize: 20, color: "#B7E2EC", fontWeight: "500", marginBottom: 8 }}>
          Your AI-Powered Academic Advisor
        </Text>
        <Text style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", maxWidth: 500, textAlign: "center", lineHeight: 24 }}>
          Transform syllabi into actionable insights in seconds
        </Text>
        <Pressable
          onPress={() => navigation.replace("Landing")}
          style={{
            marginTop: 36,
            backgroundColor: "#5DBFD6",
            paddingHorizontal: 36,
            paddingVertical: 16,
            borderRadius: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            shadowColor: "#5DBFD6",
            shadowOpacity: 0.3,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 6 },
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#FFFFFF" }}>Get Started Free</Text>
          <ArrowRight size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Feature cards */}
      <View style={{ paddingVertical: 64, paddingHorizontal: 48, alignItems: "center" }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: "#5DBFD6", letterSpacing: 2, marginBottom: 12 }}>
          HOW IT WORKS
        </Text>
        <Text style={{ fontSize: 32, fontWeight: "700", color: "#13243A", marginBottom: 48, textAlign: "center" }}>
          Three steps to academic clarity
        </Text>

        <View style={{ flexDirection: "row", gap: 24, maxWidth: 1000, width: "100%" }}>
          {slides.map((slide, i) => {
            const Icon = slide.Icon;
            return (
              <View
                key={i}
                style={{
                  flex: 1,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 20,
                  padding: 32,
                  borderWidth: 1,
                  borderColor: "#E2E8F1",
                  shadowColor: "#0F172A",
                  shadowOpacity: 0.06,
                  shadowRadius: 20,
                  shadowOffset: { width: 0, height: 6 },
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                  <View style={{
                    width: 48, height: 48, borderRadius: 14,
                    backgroundColor: "#E6F4F8",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={24} color="#1B3A6B" />
                  </View>
                  <View style={{
                    width: 28, height: 28, borderRadius: 14,
                    backgroundColor: "#5DBFD6",
                    alignItems: "center", justifyContent: "center",
                    marginLeft: 12,
                  }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}>{i + 1}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 20, fontWeight: "700", color: "#13243A", marginBottom: 8 }}>
                  {slide.title}
                </Text>
                <Text style={{ fontSize: 14, color: "#64748B", lineHeight: 22 }}>
                  {slide.body}
                </Text>
                <View style={{
                  marginTop: 20, backgroundColor: "#F0F9FB", borderRadius: 10,
                  paddingHorizontal: 14, paddingVertical: 8, alignSelf: "flex-start",
                }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: "#5DBFD6" }}>
                    {slide.highlight}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Bottom CTA */}
      <View style={{ backgroundColor: "#1B3A6B", paddingVertical: 48, alignItems: "center" }}>
        <Text style={{ fontSize: 24, fontWeight: "700", color: "#FFFFFF", marginBottom: 8 }}>
          Ready to optimize your semester?
        </Text>
        <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 24 }}>
          No account required to analyze your first syllabus
        </Text>
        <Pressable
          onPress={() => navigation.replace("Landing")}
          style={{
            backgroundColor: "#5DBFD6",
            paddingHorizontal: 32,
            paddingVertical: 14,
            borderRadius: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#FFFFFF" }}>Upload Your Syllabus</Text>
          <ChevronRight size={16} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

export default function WelcomeSplashScreen(props: Props) {
  const isWide = useIsWide();
  return isWide ? <WebSplash {...props} /> : <MobileSplash {...props} />;
}
