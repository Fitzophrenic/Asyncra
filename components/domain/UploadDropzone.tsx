import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { FileText, Upload, X } from "lucide-react-native";
import { useTheme } from "../../lib/theme";

export type Draft = {
  id: string;
  name: string;
  size?: number;
  uri: string;
  mimeType?: string;
};

type Props = {
  onDraftsChange?: (drafts: Draft[]) => void;
  hint?: string;
  multi?: boolean;
};

function fmtSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadDropzone({ onDraftsChange, hint, multi = true }: Props) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const mode = useTheme((s) => s.mode);
  const isDark = mode === "dark";

  const update = (next: Draft[]) => {
    setDrafts(next);
    onDraftsChange?.(next);
  };

  const pick = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      multiple: multi,
      copyToCacheDirectory: true,
    });
    if (res.canceled) return;
    const added: Draft[] = res.assets.map((a, i) => ({
      id: `${Date.now()}_${i}_${a.name}`,
      name: a.name,
      size: a.size,
      uri: a.uri,
      mimeType: a.mimeType ?? undefined,
    }));
    update([...drafts, ...added]);
  };

  const remove = (id: string) => update(drafts.filter((d) => d.id !== id));

  const headline = multi
    ? "Drop your syllabi here — upload multiple at once"
    : "Drop your syllabus here";

  return (
    <View>
      <Pressable
        onPress={pick}
        style={{
          borderWidth: 2,
          borderStyle: "dashed",
          borderColor: isDark ? "rgba(93,191,214,0.4)" : "#67E8F9",
          borderRadius: 16,
          backgroundColor: isDark ? "rgba(93,191,214,0.06)" : "#ECFEFF",
          padding: 32,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View style={{ flexDirection: "row", marginBottom: 8 }}>
          <FileText size={16} color={isDark ? "#5DBFD6" : "#94A3B8"} />
          <View style={{ width: 8 }} />
          <FileText size={16} color={isDark ? "#5DBFD6" : "#94A3B8"} />
          <View style={{ width: 8 }} />
          <FileText size={16} color={isDark ? "#5DBFD6" : "#94A3B8"} />
        </View>
        <View style={{
          width: 48, height: 48, borderRadius: 24,
          backgroundColor: isDark ? "rgba(93,191,214,0.15)" : "#A5F3FC",
          alignItems: "center", justifyContent: "center", marginBottom: 12,
        }}>
          <Upload size={20} color={isDark ? "#5DBFD6" : "#0E7490"} />
        </View>
        <Text style={{ fontSize: 15, fontWeight: "600", color: isDark ? "#E8EDF5" : "#0F172A", textAlign: "center" }}>
          {headline}
        </Text>
        <Text style={{ fontSize: 13, marginTop: 4, color: isDark ? "#8A9BB5" : "#64748B", textAlign: "center" }}>
          or tap to browse files
        </Text>
        <Text style={{ fontSize: 11, marginTop: 8, color: isDark ? "#5A6A80" : "#94A3B8", textAlign: "center" }}>
          {hint ?? "Supports PDF, DOC, DOCX • Upload one or more at a time"}
        </Text>
      </Pressable>

      {drafts.length > 0 ? (
        <View style={{ marginTop: 12 }}>
          {drafts.map((d) => (
            <View
              key={d.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC",
                borderWidth: 1,
                borderColor: isDark ? "#2A2D3A" : "#E2E8F1",
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 8,
              }}
            >
              <FileText size={16} color="#5DBFD6" />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={{ fontSize: 13, color: isDark ? "#E8EDF5" : "#0F172A" }} numberOfLines={1}>
                  {d.name}
                </Text>
                {d.size ? <Text style={{ fontSize: 11, color: isDark ? "#8A9BB5" : "#64748B" }}>{fmtSize(d.size)}</Text> : null}
              </View>
              <Pressable onPress={() => remove(d.id)} style={{ padding: 4 }}>
                <X size={16} color={isDark ? "#8A9BB5" : "#64748B"} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
export { UploadDropzone };
