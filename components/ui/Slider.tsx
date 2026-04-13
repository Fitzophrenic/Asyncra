import RNSlider from "@react-native-community/slider";
import { View } from "react-native";
import { useTheme } from "../../lib/theme";

export type SliderProps = {
  value: number;
  onChange?: (v: number) => void;
  onValueChange?: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  label?: string;
};

export default function Slider({ value, onChange, onValueChange, min, max, step = 1 }: SliderProps) {
  const handle = onChange ?? onValueChange ?? (() => {});
  const mode = useTheme((s) => s.mode);
  const isDark = mode === "dark";

  return (
    <View className="w-full">
      <RNSlider
        value={value}
        minimumValue={min}
        maximumValue={max}
        step={step}
        onValueChange={handle}
        minimumTrackTintColor="#5DBFD6"
        maximumTrackTintColor={isDark ? "#1F3147" : "#E2E8F1"}
        thumbTintColor="#5DBFD6"
        style={{ width: "100%", height: 40 }}
      />
    </View>
  );
}
export { Slider };
