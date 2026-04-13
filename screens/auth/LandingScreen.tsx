import { View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform, Dimensions, FlatList, Pressable } from "react-native";
import type { NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useState, useRef, useEffect, useCallback } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Link as LinkIcon, Zap, BarChart3, Map } from "lucide-react-native";

import { RootStackParamList } from "../../navigation/RootNavigator";
import { Card } from "../../components/ui/Card";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { Logo } from "../../components/ui/Logo";
import { Appear } from "../../components/ui/Appear";
import { UploadDropzone, Draft } from "../../components/domain/UploadDropzone";
import { useIsWide } from "../../components/layout/AppShell";

type Props = NativeStackScreenProps<RootStackParamList, "Landing">;

const features = [
  { title: "Instant Analysis", body: "AI reads and structures your syllabus in seconds", Icon: Zap },
  { title: "Workload Insights", body: "Know exactly how many hours each course demands", Icon: BarChart3 },
  { title: "Smart Planning", body: "Get personalized roadmaps for academic success", Icon: Map },
];

function FeatureCard({ item }: { item: typeof features[number] }) {
  const Icon = item.Icon;
  return (
    <Card variant="paper" className="p-5">
      <View className="flex-row items-center gap-3">
        <View className="w-12 h-12 rounded-full bg-cyan-100 items-center justify-center">
          <Icon size={22} color="#0E7490" />
        </View>
        <View style={{ flex: 1 }}>
          <Text className="text-slate-900 font-bold text-base">
            {item.title}
          </Text>
          <Text className="text-brand-cyan text-sm mt-1">{item.body}</Text>
        </View>
      </View>
    </Card>
  );
}

function FeatureCarousel() {
  const isWide = useIsWide();
  const { width } = Dimensions.get("window");
  const cardWidth = width;
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % features.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3500);
  }, []);

  useEffect(() => {
    if (isWide) return;
    startAutoPlay();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [startAutoPlay, isWide]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
    if (index !== activeIndex && index >= 0 && index < features.length) {
      setActiveIndex(index);
    }
  };

  if (isWide) {
    return (
      <View className="px-5 mt-8 items-center">
        <View style={{ width: "100%", maxWidth: 820, flexDirection: "row", gap: 16 }}>
          {features.map((f, i) => (
            <View key={f.title} style={{ flex: 1 }}>
              <Appear delay={550 + i * 120} duration={600}>
                <FeatureCard item={f} />
              </Appear>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View className="mt-8">
      <FlatList
        ref={flatListRef}
        data={features}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        onScrollBeginDrag={() => { if (intervalRef.current) clearInterval(intervalRef.current); }}
        onScrollEndDrag={() => startAutoPlay()}
        scrollEventThrottle={16}
        decelerationRate="fast"
        keyExtractor={(item) => item.title}
        renderItem={({ item }) => (
          <View style={{ width: cardWidth, paddingHorizontal: 24 }}>
            <FeatureCard item={item} />
          </View>
        )}
      />
      <View className="flex-row justify-center gap-2 mt-4">
        {features.map((_, i) => (
          <View
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === activeIndex ? "#5DBFD6" : "#D1D5DB",
            }}
          />
        ))}
      </View>
    </View>
  );
}

export default function LandingScreen({ navigation }: Props) {
  const [url, setUrl] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);

  const canAnalyze = drafts.length > 0 || url.trim().length > 0;

  const onAnalyze = () => {
    if (!canAnalyze) return;
    if (drafts.length > 0) {
      // eslint-disable-next-line no-console
      console.log("Analyzing drafts:", drafts);
    }
    navigation.navigate("Processing");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
      <View style={{ backgroundColor: "#1B3A6B" }} className="px-6 pt-20 pb-40 items-center">
        <Appear from="down" delay={50} duration={600}>
          <View className="flex-row items-center" style={{ gap: 14 }}>
            <Logo size={56} />
            <Text className="text-white font-bold tracking-widest" style={{ fontSize: 40 }}>
              ASYNCRA
            </Text>
          </View>
        </Appear>
        <Appear from="down" delay={180} duration={600}>
          <Text className="text-white text-base mt-5 font-semibold">
            Your AI-Powered Academic Advisor
          </Text>
        </Appear>
        <Appear from="down" delay={260} duration={600}>
          <Text className="text-slate-300 text-sm mt-2 text-center">
            Transform syllabi into actionable insights in seconds
          </Text>
        </Appear>
      </View>

      {/* Wavy transition between navy band and slate-50 canvas */}
      <View style={{ width: "100%", height: 90, marginTop: -1 }}>
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
        >
          <Path
            d="M0,0 C320,90 720,0 1080,55 C1260,82 1380,40 1440,20 L1440,90 L0,90 Z"
            fill="#F4F7FB"
          />
        </Svg>
      </View>

      <View className="px-5 -mt-40 items-center">
        <Appear from="down" delay={380} duration={650} className="w-full max-w-[820px] mx-auto">
          <Card variant="paper" className="p-8 shadow-xl">
            <UploadDropzone onDraftsChange={setDrafts} />
            <View className="flex-row items-center my-5">
              <View className="flex-1 h-px bg-slate-200" />
              <Text className="mx-3 text-slate-400 text-xs font-semibold">OR</Text>
              <View className="flex-1 h-px bg-slate-200" />
            </View>
            <View className="flex-row items-center gap-3">
              <View
                className="flex-1 flex-row items-center rounded-2xl bg-white px-4"
                style={{ borderWidth: 1, borderColor: "#5DBFD6", height: 52 }}
              >
                <LinkIcon size={18} color="#5DBFD6" />
                <TextInput
                  value={url}
                  onChangeText={setUrl}
                  placeholder="Paste syllabus URL here"
                  placeholderTextColor="#94A3B8"
                  className="flex-1 ml-3 text-base"
                  style={{ color: "#13243A", outlineStyle: "none" } as any}
                />
              </View>
              <View className="w-32">
                <PrimaryButton title="Analyze" onPress={onAnalyze} disabled={!canAnalyze} />
              </View>
            </View>
            <Text className="text-center text-slate-400 text-xs mt-4 tracking-wider">
              NO ACCOUNT REQUIRED TO GET STARTED
            </Text>
            <Pressable onPress={() => navigation.navigate("SignIn")} style={{ marginTop: 12, alignItems: "center" }}>
              <Text style={{ fontSize: 13, color: "#64748B" }}>
                Already have an account? <Text style={{ color: "#5DBFD6", fontWeight: "600" }}>Sign In</Text>
              </Text>
            </Pressable>
          </Card>
        </Appear>
      </View>

      <FeatureCarousel />
    </ScrollView>
    </KeyboardAvoidingView>
  );
}
