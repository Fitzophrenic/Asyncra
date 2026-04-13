import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Check, Pencil } from "lucide-react-native";
import { useTheme } from "../../lib/theme";

const COLORS = [
  "#5DBFD6", "#1B3A6B", "#3FBF7F", "#E0A23A", "#E25C5C",
  "#8B5CF6", "#EC4899", "#F97316", "#14B8A6", "#6366F1",
];

type Props = {
  initials: string;
  selectedColor: string;
  onColorChange: (color: string) => void;
};

export default function AvatarPicker({ initials, selectedColor, onColorChange }: Props) {
  const mode = useTheme((s) => s.mode);
  const [open, setOpen] = useState(false);
  const isDark = mode === "dark";

  return (
    <View style={{ alignItems: "center" }}>
      <Pressable onPress={() => setOpen((v) => !v)} style={{ position: "relative" }}>
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            backgroundColor: selectedColor,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 30, fontWeight: "700", color: "#FFFFFF" }}>{initials}</Text>
        </View>
        <View
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: isDark ? "#1E1E2E" : "#FFFFFF",
            borderWidth: 2,
            borderColor: selectedColor,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Pencil size={12} color={selectedColor} />
        </View>
      </Pressable>

      {open && (
        <View style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 10,
          marginTop: 16,
          backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC",
          borderRadius: 14,
          padding: 14,
        }}>
          {COLORS.map((color) => {
            const active = selectedColor === color;
            return (
              <Pressable
                key={color}
                onPress={() => { onColorChange(color); setOpen(false); }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: color,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: active ? 2.5 : 0,
                  borderColor: "#FFFFFF",
                }}
              >
                {active && <Check size={14} color="#FFFFFF" />}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}
export { AvatarPicker };
