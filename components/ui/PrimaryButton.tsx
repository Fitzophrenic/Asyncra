import { Pressable, Text } from "react-native";

export type PrimaryButtonProps = {
  label?: string;
  title?: string;
  onPress: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  variant?: "primary" | "ghost";
};

export default function PrimaryButton({
  label,
  title,
  onPress,
  disabled = false,
  fullWidth = true,
  variant = "primary",
}: PrimaryButtonProps) {
  const isGhost = variant === "ghost";
  const bg = isGhost ? "bg-transparent border border-cyan-400" : "bg-cyan-400";
  const text = isGhost ? "text-cyan-400" : "text-white";
  const width = fullWidth ? "w-full" : "self-start";
  const opacity = disabled ? "opacity-50" : "";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`${bg} ${width} ${opacity} items-center justify-center rounded-full px-6 py-4`}
    >
      <Text className={`font-semibold text-base ${text}`}>{label ?? title}</Text>
    </Pressable>
  );
}
export { PrimaryButton };
