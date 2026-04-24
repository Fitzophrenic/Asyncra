import React, { useEffect, useRef, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
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
  /** force light-card styling when the dropzone sits inside a white card */
  onLight?: boolean;
};

function fmtSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const ACCEPTED_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function isAcceptedFile(file: File) {
  if (ACCEPTED_MIME.includes(file.type)) return true;
  const name = file.name.toLowerCase();
  return name.endsWith(".pdf") || name.endsWith(".doc") || name.endsWith(".docx");
}

export default function UploadDropzone({ onDraftsChange, hint, multi = true, onLight = false }: Props) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const dropRef = useRef<View>(null);
  const mode = useTheme((s) => s.mode);
  // force dark text when sitting on a light card
  const isDark = onLight ? false : mode === "dark";

  const update = (next: Draft[]) => {
    setDrafts(next);
    onDraftsChange?.(next);
  };

  // ref so web drop handlers see the latest drafts
  const draftsRef = useRef(drafts);
  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  const pick = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: ACCEPTED_MIME,
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

  // web: attach DOM drag events (Pressable doesn't forward them)
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const node = dropRef.current as unknown as HTMLElement | null;
    if (!node) return;

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
      setIsDragOver(true);
    };
    const onDragLeave = (e: DragEvent) => {
      // only clear if leaving the dropzone entirely
      if (e.target === node) setIsDragOver(false);
    };
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = Array.from(e.dataTransfer?.files ?? []);
      const accepted = files.filter(isAcceptedFile);
      if (accepted.length === 0) return;
      const toAdd: Draft[] = accepted.map((f, i) => ({
        id: `${Date.now()}_${i}_${f.name}`,
        name: f.name,
        size: f.size,
        uri: URL.createObjectURL(f),
        mimeType: f.type || "application/pdf",
      }));
      update([...(draftsRef.current ?? []), ...(multi ? toAdd : toAdd.slice(0, 1))]);
    };

    node.addEventListener("dragover", onDragOver);
    node.addEventListener("dragleave", onDragLeave);
    node.addEventListener("drop", onDrop);
    return () => {
      node.removeEventListener("dragover", onDragOver);
      node.removeEventListener("dragleave", onDragLeave);
      node.removeEventListener("drop", onDrop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remove = (id: string) => update(drafts.filter((d) => d.id !== id));

  const headline = multi
    ? "Drop your syllabi here — upload multiple at once"
    : "Drop your syllabus here";

  // use darker colors on light mode so text stays readable
  const borderColor = isDragOver
    ? "#0E7490"
    : isDark
      ? "rgba(93,191,214,0.5)"
      : "#5DBFD6";
  const bgColor = isDragOver
    ? (isDark ? "rgba(93,191,214,0.15)" : "#CFFAFE")
    : (isDark ? "rgba(93,191,214,0.06)" : "#ECFEFF");
  const headlineColor = isDark ? "#E8EDF5" : "#0F172A";
  const subtitleColor = isDark ? "#B6C2D1" : "#334155";
  const hintColor = isDark ? "#8A9BB5" : "#475569";
  const iconFaintColor = isDark ? "#5DBFD6" : "#0E7490";

  return (
    <View>
      <Pressable
        ref={dropRef}
        onPress={pick}
        style={{
          borderWidth: 2,
          borderStyle: "dashed",
          borderColor,
          borderRadius: 16,
          backgroundColor: bgColor,
          padding: 32,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View style={{ flexDirection: "row", marginBottom: 8 }}>
          <FileText size={16} color={iconFaintColor} />
          <View style={{ width: 8 }} />
          <FileText size={16} color={iconFaintColor} />
          <View style={{ width: 8 }} />
          <FileText size={16} color={iconFaintColor} />
        </View>
        <View style={{
          width: 48, height: 48, borderRadius: 24,
          backgroundColor: isDark ? "rgba(93,191,214,0.15)" : "#A5F3FC",
          alignItems: "center", justifyContent: "center", marginBottom: 12,
        }}>
          <Upload size={20} color={isDark ? "#5DBFD6" : "#0E7490"} />
        </View>
        <Text style={{ fontSize: 15, fontWeight: "600", color: headlineColor, textAlign: "center" }}>
          {isDragOver ? "Drop to upload" : headline}
        </Text>
        <Text style={{ fontSize: 13, marginTop: 4, color: subtitleColor, textAlign: "center" }}>
          {Platform.OS === "web" ? "or click to browse files" : "or tap to browse files"}
        </Text>
        <Text style={{ fontSize: 11, marginTop: 8, color: hintColor, textAlign: "center" }}>
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
