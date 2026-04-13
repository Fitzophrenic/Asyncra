import { ReactNode } from "react";
import { Platform, Pressable, View } from "react-native";
import { useTheme } from "../../lib/theme";

export type CardProps = {
  variant?: "surface" | "paper" | "accent";
  children: ReactNode;
  className?: string;
  style?: any;
  onPress?: () => void;
  elevated?: boolean;
};

export default function Card({ variant = "surface", children, className = "", style, onPress, elevated }: CardProps) {
  const mode = useTheme((s) => s.mode);
  const isDark = mode === "dark";
  const isWeb = Platform.OS === "web";

  const surfaceClass = isDark
    ? "bg-surface-panel border border-surface-border"
    : "bg-surfaceLight-panel border border-surfaceLight-border";
  const variantClass =
    variant === "paper"
      ? "bg-surfaceLight-panel border border-surfaceLight-border"
      : variant === "accent"
        ? "bg-brand-cyan"
        : surfaceClass;

  const shadowStyle = elevated && !isDark && isWeb
    ? { shadowColor: "#0F172A", shadowOpacity: 0.07, shadowRadius: 20, shadowOffset: { width: 0, height: 6 } }
    : {};

  const classes = `rounded-2xl p-6 ${variantClass} ${className}`;

  if (onPress) {
    return (
      <Pressable onPress={onPress} className={classes} style={[shadowStyle, style]}>
        {children}
      </Pressable>
    );
  }
  return <View className={classes} style={[shadowStyle, style]}>{children}</View>;
}
export { Card };
