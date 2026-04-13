import { useState } from "react";
import { KeyboardTypeOptions, Text, TextInput, TextInputProps, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { useTheme } from "../../lib/theme";

export type TextFieldProps = {
  label?: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  leftIcon?: LucideIcon;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: TextInputProps["autoCapitalize"];
};

export default function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  leftIcon: LeftIcon,
  keyboardType,
  autoCapitalize,
}: TextFieldProps) {
  const mode = useTheme((s) => s.mode);
  const [focused, setFocused] = useState(false);

  const isDark = mode === "dark";
  // Cyan-400 uppercase labels (matches Figma profile / signup)
  const labelColor = "text-brand-cyan";
  const bg = isDark ? "bg-surface-panelAlt" : "bg-surfaceLight-panel";
  const textColor = isDark ? "text-ink-primary" : "text-inkLight-primary";
  const placeholderColor = isDark ? "#7A8AA0" : "#94A3B8";
  // Cyan border always (matches Figma)
  const borderClass = "border-brand-cyan";

  return (
    <View className="w-full">
      {label ? (
        <Text className={`mb-2 text-xs font-medium uppercase tracking-wider ${labelColor}`}>{label}</Text>
      ) : null}
      <View className={`flex-row items-center rounded-2xl border ${bg} ${borderClass} px-4`}>
        {LeftIcon ? (
          <View className="mr-2">
            <LeftIcon size={18} color={isDark ? "#B6C2D1" : "#475569"} />
          </View>
        ) : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`flex-1 py-3 text-base ${textColor}`}
        />
      </View>
    </View>
  );
}
export { TextField };
