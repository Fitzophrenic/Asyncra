import React from "react";
import { Pressable, Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";

type Props = {
  label: string;
  icon?: LucideIcon;
  selected?: boolean;
  onPress: () => void;
};

// Always-light cyan-tinted pill (matches Figma onboarding regardless of theme).
export default function OptionPill({ label, icon: Icon, selected, onPress }: Props) {
  const iconColor = selected ? "#0E2747" : "#13345F";

  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderRadius: 16,
        backgroundColor: "#E6F4F8",
        borderWidth: selected ? 1 : 0,
        borderColor: "#5DBFD6",
        width: "100%",
      }}
    >
      {Icon ? (
        <View style={{ marginRight: 12 }}>
          <Icon size={20} color={iconColor} />
        </View>
      ) : null}
      <Text style={{ color: "#13243A", fontSize: 16, fontWeight: "500" }}>{label}</Text>
    </Pressable>
  );
}
export { OptionPill };
