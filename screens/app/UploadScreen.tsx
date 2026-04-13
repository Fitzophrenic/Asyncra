import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle2, FileText } from "lucide-react-native";

import { RootStackParamList } from "../../navigation/RootNavigator";
import { useTheme, tokens } from "../../lib/theme";
import { useIsWide } from "../../components/layout/AppShell";

import HeaderBand from "../../components/ui/HeaderBand";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { UploadDropzone, Draft } from "../../components/domain/UploadDropzone";
import Appear, { useFocusKey } from "../../components/ui/Appear";

type Props = NativeStackScreenProps<RootStackParamList, "Upload">;

export default function UploadScreen({ navigation }: Props) {
  const mode = useTheme((s) => s.mode);
  const t = tokens[mode];
  const isWide = useIsWide();
  const focusKey = useFocusKey();
  const isDark = mode === "dark";

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [uploaded, setUploaded] = useState<string[]>([]);

  const canAnalyze = drafts.length > 0;

  const handleAnalyze = () => {
    setUploaded((prev) => [...prev, ...drafts.map((d) => d.name)]);
    setDrafts([]);
  };

  return (
    <SafeAreaView className={`flex-1 ${t.bg}`} edges={["bottom"]}>
      <HeaderBand
        showBack
        onBack={() => navigation.goBack()}
        title="Upload Courses"
        subtitle="Add more syllabi to your dashboard"
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: isWide ? 48 : 20,
          paddingTop: 24,
          paddingBottom: 40,
          alignItems: "center",
        }}
      >
        <View style={{ width: "100%", maxWidth: isWide ? 560 : undefined }}>
          <Appear from="down" delay={50} duration={500} key={`upload-${focusKey}`}>
            <UploadDropzone onDraftsChange={setDrafts} />
            <View style={{ marginTop: 16 }}>
              <PrimaryButton
                title={`Analyze ${drafts.length > 0 ? `(${drafts.length})` : "Syllabi"}`}
                onPress={handleAnalyze}
                disabled={!canAnalyze}
              />
            </View>
          </Appear>

          {uploaded.length > 0 && (
            <Appear from="down" delay={100} duration={500} key={`history-${focusKey}-${uploaded.length}`}>
              <View style={{ marginTop: 28 }}>
                <Text className={`text-sm font-bold mb-3 ${t.text}`}>Recently Uploaded</Text>
                {uploaded.map((name, i) => (
                  <View
                    key={`${name}-${i}`}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 12,
                      paddingHorizontal: 14,
                      borderRadius: 12,
                      marginBottom: 8,
                      backgroundColor: isDark ? "rgba(63,191,127,0.08)" : "#F0FDF4",
                      borderWidth: 1,
                      borderColor: isDark ? "rgba(63,191,127,0.15)" : "#BBF7D0",
                    }}
                  >
                    <CheckCircle2 size={16} color="#3FBF7F" />
                    <Text className={`text-sm ml-3 flex-1 ${t.text}`} numberOfLines={1}>{name}</Text>
                    <Text style={{ fontSize: 11, color: "#3FBF7F", fontWeight: "600" }}>Done</Text>
                  </View>
                ))}
              </View>
            </Appear>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
