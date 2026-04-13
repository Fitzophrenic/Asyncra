import { View, Image } from "react-native";
import { GraduationCap } from "lucide-react-native";

export type LogoProps = { size?: number };

// Try to load the brand logo; fall back to an icon if the asset isn't present yet.
let logoSource: number | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  logoSource = require("../../assets/logo.avif");
} catch {
  logoSource = null;
}

export default function Logo({ size = 32 }: LogoProps) {
  return (
    <View
      className="items-center justify-center rounded-full bg-white overflow-hidden"
      style={{ width: size, height: size }}
    >
      {logoSource ? (
        <Image source={logoSource} style={{ width: size, height: size }} resizeMode="contain" />
      ) : (
        <GraduationCap size={Math.round(size * 0.6)} color="#1B3A6B" />
      )}
    </View>
  );
}
export { Logo };
