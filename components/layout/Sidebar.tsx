import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { LayoutDashboard, BarChart3, Bell, User, Sun, Moon } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

import { useTheme, useSidebar } from "../../lib/theme";
import { useAuth } from "../../lib/auth";
import Logo from "../ui/Logo";

type Item = { name: string; label: string; Icon: LucideIcon };

const ITEMS: Item[] = [
  { name: "Dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { name: "Compare", label: "Compare", Icon: BarChart3 },
  { name: "Notifications", label: "Notifications", Icon: Bell },
  { name: "Profile", label: "Profile", Icon: User },
];

const COLLAPSED = 76;
const EXPANDED = 240;
const NAVY = "#1B3A6B";
const WHITE = "#E8EDF5";
const MUTED = "#8FABC4";
const ACCENT = "#6EC4DE";

export default function Sidebar() {
  const mode = useTheme((s) => s.mode);
  const toggle = useTheme((s) => s.toggle);
  const user = useAuth((s) => s.user);
  const nav = useNavigation<any>();
  const [hovered, setHovered] = useState(false);

  const width = useSharedValue(EXPANDED);
  const labelOpacity = useSharedValue(1);

  const containerStyle = useAnimatedStyle(() => ({ width: width.value }));
  const labelStyle = useAnimatedStyle(() => ({ opacity: labelOpacity.value }));

  const activeName: string = useNavigationState((state: any) => {
    if (!state) return "Dashboard";
    const findActive = (s: any): string => {
      const route = s.routes[s.index];
      if (route.state) return findActive(route.state);
      return route.name;
    };
    try {
      return findActive(state);
    } catch {
      return "Dashboard";
    }
  });

  const pinned = useSidebar((s) => s.pinned);
  const expanded = pinned || hovered;

  React.useEffect(() => {
    width.value = withTiming(expanded ? EXPANDED : COLLAPSED, { duration: 220 });
    labelOpacity.value = withTiming(expanded ? 1 : 0, { duration: 180 });
  }, [expanded]);

  return (
    <View
      // @ts-ignore - onMouseEnter/Leave are web-only DOM events
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ height: "100%" }}
    >
      <Animated.View
        style={[
          {
            height: "100%",
            overflow: "hidden",
            backgroundColor: NAVY,
            borderRightWidth: 1,
            borderRightColor: "rgba(255,255,255,0.08)",
          },
          containerStyle,
        ]}
      >
        {/* Logo row */}
        <View
          style={{
            paddingVertical: 24,
            paddingHorizontal: 18,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Logo size={40} />
          <Animated.View style={[labelStyle, { marginLeft: 12, flex: 1 }]}>
            <Text
              numberOfLines={1}
              style={{ fontSize: 20, fontWeight: "700", letterSpacing: 2, color: WHITE }}
            >
              ASYNCRA
            </Text>
          </Animated.View>
        </View>

        {/* Nav items */}
        <View style={{ marginTop: 8 }}>
          {ITEMS.map(({ name, label, Icon }) => {
            const active = activeName === name;
            return (
              <Pressable
                key={name}
                onPress={() => nav.navigate("AppTabs", { screen: name })}
                style={{
                  marginHorizontal: 12,
                  marginVertical: 4,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderRadius: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: active ? "rgba(110,196,222,0.18)" : "transparent",
                }}
              >
                <View style={{ width: 24, alignItems: "center" }}>
                  <Icon size={20} color={active ? ACCENT : WHITE} />
                </View>
                <Animated.View style={[labelStyle, { marginLeft: 14, flex: 1 }]}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: active ? ACCENT : WHITE,
                    }}
                  >
                    {label}
                  </Text>
                </Animated.View>
              </Pressable>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />

        {/* Bottom: theme toggle + user chip */}
        <View
          style={{
            padding: 14,
            borderTopWidth: 1,
            borderTopColor: "rgba(255,255,255,0.1)",
          }}
        >
          <Pressable
            onPress={() => toggle()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginBottom: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "rgba(110,196,222,0.4)",
            }}
          >
            <View style={{ width: 24, alignItems: "center" }}>
              {mode === "dark" ? (
                <Sun size={16} color={WHITE} />
              ) : (
                <Moon size={16} color={WHITE} />
              )}
            </View>
            <Animated.View style={[labelStyle, { marginLeft: 14, flex: 1 }]}>
              <Text
                numberOfLines={1}
                style={{ fontSize: 14, fontWeight: "500", color: WHITE }}
              >
                {mode === "dark" ? "Light Mode" : "Dark Mode"}
              </Text>
            </Animated.View>
          </Pressable>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: user?.avatarColor || ACCENT,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 14 }}>{user?.initials ?? "?"}</Text>
            </View>
            <Animated.View style={[labelStyle, { marginLeft: 12, flex: 1 }]}>
              <Text
                numberOfLines={1}
                style={{ fontSize: 14, fontWeight: "600", color: WHITE }}
              >
                {user?.name ?? "Student"}
              </Text>
              <Text
                numberOfLines={1}
                style={{ fontSize: 10, fontWeight: "600", letterSpacing: 1, color: MUTED }}
              >
                STUDENT
              </Text>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
export { Sidebar };
