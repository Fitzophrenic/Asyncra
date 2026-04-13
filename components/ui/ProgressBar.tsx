import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from "react-native-reanimated";

export type ProgressBarProps = {
  value: number;
  max?: number;
  color?: "success" | "warning" | "danger" | "info";
  height?: number;
  showLabel?: boolean;
  animateDelay?: number;
  resetKey?: number;
};

const colorHex = {
  success: "#3FBF7F",
  warning: "#E0A23A",
  danger: "#E25C5C",
  info: "#5DBFD6",
} as const;

export default function ProgressBar({
  value,
  max = 100,
  color = "info",
  height = 8,
  showLabel = false,
  animateDelay = 300,
  resetKey = 0,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = 0;
    width.value = withDelay(
      animateDelay,
      withTiming(pct, { duration: 800, easing: Easing.out(Easing.cubic) })
    );
  }, [pct, animateDelay, resetKey]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View className="w-full">
      {showLabel ? (
        <Text className="mb-1 text-xs text-ink-secondary">
          {Math.round(value)} / {max}
        </Text>
      ) : null}
      <View
        className="w-full overflow-hidden rounded-full"
        style={{ height, backgroundColor: "rgba(100,116,139,0.15)" }}
      >
        <Animated.View
          style={[
            { height: "100%", borderRadius: 999, backgroundColor: colorHex[color] },
            animatedStyle,
          ]}
        />
      </View>
    </View>
  );
}
export { ProgressBar };
