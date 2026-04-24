import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlertCircle, CheckCircle2, FileText, Loader2 } from "lucide-react-native";

import { RootStackParamList } from "../../navigation/RootNavigator";
import { useTheme, tokens } from "../../lib/theme";
import { useIsWide } from "../../components/layout/AppShell";
import { uploadApi } from "../../lib/api";
import { useAppStore } from "../../lib/store";

import HeaderBand from "../../components/ui/HeaderBand";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { UploadDropzone, Draft } from "../../components/domain/UploadDropzone";
import Appear, { useFocusKey } from "../../components/ui/Appear";

type Props = NativeStackScreenProps<RootStackParamList, "Upload">;

type UploadResult = { name: string; status: "done" | "failed"; error?: string };

export default function UploadScreen({ navigation }: Props) {
  const mode = useTheme((s) => s.mode);
  const t = tokens[mode];
  const isWide = useIsWide();
  const focusKey = useFocusKey();
  const isDark = mode === "dark";
  const fetchDashboard = useAppStore((s) => s.fetchDashboard);

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [uploaded, setUploaded] = useState<UploadResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const canAnalyze = drafts.length > 0 && !isAnalyzing;

  const handleAnalyze = async () => {
    if (drafts.length === 0) return;
    setIsAnalyzing(true);
    const pending = drafts;
    setDrafts([]);

    const results: UploadResult[] = [];
    for (const d of pending) {
      try {
        await uploadApi.analyzeSyllabus(d.uri, d.name, d.mimeType || "application/pdf");
        results.push({ name: d.name, status: "done" });
      } catch (err: any) {
        results.push({ name: d.name, status: "failed", error: err?.message || "Upload failed" });
      }
    }
    setUploaded((prev) => [...prev, ...results]);

    try {
      await fetchDashboard();
    } catch (err) {
      console.warn("fetchDashboard after upload failed:", err);
    }

    setIsAnalyzing(false);
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
                title={isAnalyzing ? "Analyzing..." : `Analyze ${drafts.length > 0 ? `(${drafts.length})` : "Syllabi"}`}
                onPress={handleAnalyze}
                disabled={!canAnalyze}
              />
            </View>
          </Appear>

          {uploaded.length > 0 && (
            <Appear from="down" delay={100} duration={500} key={`history-${focusKey}-${uploaded.length}`}>
              <View style={{ marginTop: 28 }}>
                <Text className={`text-sm font-bold mb-3 ${t.text}`}>Recently Uploaded</Text>
                {uploaded.map((r, i) => {
                  const failed = r.status === "failed";
                  return (
                    <View
                      key={`${r.name}-${i}`}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                        borderRadius: 12,
                        marginBottom: 8,
                        backgroundColor: failed
                          ? (isDark ? "rgba(226,92,92,0.08)" : "#FEF2F2")
                          : (isDark ? "rgba(63,191,127,0.08)" : "#F0FDF4"),
                        borderWidth: 1,
                        borderColor: failed
                          ? (isDark ? "rgba(226,92,92,0.2)" : "#FECACA")
                          : (isDark ? "rgba(63,191,127,0.15)" : "#BBF7D0"),
                      }}
                    >
                      {failed ? <AlertCircle size={16} color="#E25C5C" /> : <CheckCircle2 size={16} color="#3FBF7F" />}
                      <Text className={`text-sm ml-3 flex-1 ${t.text}`} numberOfLines={1}>{r.name}</Text>
                      <Text style={{ fontSize: 11, color: failed ? "#E25C5C" : "#3FBF7F", fontWeight: "600" }}>
                        {failed ? "Failed" : "Done"}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Appear>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
