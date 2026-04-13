import { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const PIECE_COUNT = 60;
const COLORS = ["#5DBFD6", "#1B3A6B", "#E0A23A", "#3FBF7F", "#B7E2EC", "#13345F", "#6EC4DE"];

type Piece = {
  x: number;
  delay: number;
  color: string;
  size: number;
  rotation: number;
  isRect: boolean;
};

function makePieces(): Piece[] {
  return Array.from({ length: PIECE_COUNT }, () => ({
    x: Math.random() * SCREEN_W,
    delay: Math.random() * 600,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
    isRect: Math.random() > 0.5,
  }));
}

export function Confetti({ visible }: { visible: boolean }) {
  const pieces = useRef(makePieces()).current;
  const anims = useRef(pieces.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!visible) return;
    const animations = anims.map((anim, i) =>
      Animated.sequence([
        Animated.delay(pieces[i].delay),
        Animated.timing(anim, {
          toValue: 1,
          duration: 1800 + Math.random() * 600,
          useNativeDriver: true,
        }),
      ])
    );
    Animated.parallel(animations).start();
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {pieces.map((p, i) => {
        const translateY = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [-40, SCREEN_H + 40],
        });
        const translateX = anims[i].interpolate({
          inputRange: [0, 0.25, 0.5, 0.75, 1],
          outputRange: [0, 15, -10, 20, -5],
        });
        const rotate = anims[i].interpolate({
          inputRange: [0, 1],
          outputRange: [`${p.rotation}deg`, `${p.rotation + 720}deg`],
        });
        const opacity = anims[i].interpolate({
          inputRange: [0, 0.1, 0.85, 1],
          outputRange: [0, 1, 1, 0],
        });

        return (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              left: p.x,
              top: 0,
              width: p.isRect ? p.size * 1.5 : p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.isRect ? 2 : p.size / 2,
              transform: [{ translateY }, { translateX }, { rotate }],
              opacity,
            }}
          />
        );
      })}
    </View>
  );
}
