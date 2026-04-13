import React, { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { useIsWide } from "../layout/AppShell";

export type HeaderBandProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightSlot?: ReactNode;
  preTitle?: ReactNode;
};

export default function HeaderBand({
  title,
  subtitle,
  showBack,
  onBack,
  rightSlot,
  preTitle,
}: HeaderBandProps) {
  const isWide = useIsWide();

  return (
    <View className="bg-asy-navy pb-6" style={{ paddingHorizontal: isWide ? 48 : 20, paddingTop: isWide ? 48 : 60 }}>
      <View style={{ width: "100%" }}>
        {showBack ? (
          <Pressable onPress={onBack} className="flex-row items-center mb-2">
            <ChevronLeft size={18} color="#FFFFFF" />
            <Text className="text-white text-sm ml-1">Back to Dashboard</Text>
          </Pressable>
        ) : null}
        {preTitle}
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-white text-3xl font-bold">{title}</Text>
            {subtitle ? (
              <Text className="text-white/70 text-sm mt-1">{subtitle}</Text>
            ) : null}
          </View>
          {rightSlot ? <View className="ml-2">{rightSlot}</View> : null}
        </View>
      </View>
    </View>
  );
}
export { HeaderBand };
