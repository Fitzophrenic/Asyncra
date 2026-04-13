import React, { ReactNode, useState, useCallback } from "react";
import { ViewStyle, StyleProp } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  SlideInLeft,
} from "react-native-reanimated";
import { useFocusEffect } from "@react-navigation/native";

export type AppearProps = {
  children: ReactNode;
  delay?: number;
  duration?: number;
  from?: "down" | "up" | "fade" | "right" | "left";
  distance?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
};

export function useFocusKey() {
  const [key, setKey] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setKey((k) => k + 1);
    }, [])
  );
  return key;
}

export default function Appear({
  children,
  delay = 0,
  duration = 450,
  from = "fade",
  style,
  className,
}: AppearProps) {
  let entering;
  switch (from) {
    case "down":
      entering = FadeInDown.duration(duration).delay(delay);
      break;
    case "up":
      entering = FadeInUp.duration(duration).delay(delay);
      break;
    case "right":
      entering = SlideInRight.duration(duration).delay(delay);
      break;
    case "left":
      entering = SlideInLeft.duration(duration).delay(delay);
      break;
    default:
      entering = FadeIn.duration(duration).delay(delay);
  }

  return (
    <Animated.View entering={entering} style={style} className={className}>
      {children}
    </Animated.View>
  );
}
export { Appear };
