import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react-native";

import type { Notification } from "../../lib/types";
import { useAppStore } from "../../lib/store";
import { useTheme, tokens } from "../../lib/theme";

import HeaderBand from "../../components/ui/HeaderBand";
import Card from "../../components/ui/Card";
import Toggle from "../../components/ui/Toggle";
import Appear, { useFocusKey } from "../../components/ui/Appear";
import { useIsWide } from "../../components/layout/AppShell";

type Tone = {
  stripe: string;
  pill: string;
  text: string;
  iconBg: string;
  icon: typeof AlertCircle;
  color: string;
  bgDark: string;
  bgLight: string;
  borderLight: string;
};

const stripe: Record<Notification["severity"], Tone> = {
  danger: {
    stripe: "bg-red-500",
    pill: "bg-red-500",
    text: "text-red-500",
    iconBg: "bg-red-500/20",
    icon: AlertCircle,
    color: "#EF4444",
    bgDark: "bg-red-500/10",
    bgLight: "bg-red-50",
    borderLight: "border-red-200",
  },
  warning: {
    stripe: "bg-amber-500",
    pill: "bg-amber-500",
    text: "text-amber-500",
    iconBg: "bg-amber-500/20",
    icon: AlertTriangle,
    color: "#F59E0B",
    bgDark: "bg-amber-500/10",
    bgLight: "bg-amber-50",
    borderLight: "border-amber-200",
  },
  info: {
    stripe: "bg-asy-accent",
    pill: "bg-asy-accent",
    text: "text-asy-accent",
    iconBg: "bg-asy-accent/20",
    icon: Info,
    color: "#5DBFD6",
    bgDark: "bg-asy-accent/10",
    bgLight: "bg-cyan-50",
    borderLight: "border-cyan-200",
  },
};

export default function NotificationsScreen() {
  const mode = useTheme((s) => s.mode);
  const t = tokens[mode];
  const focusKey = useFocusKey();
  const isWide = useIsWide();

  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(true);
  const [reminders, setReminders] = useState(true);
  const notifications = useAppStore((s) => s.notifications);
  const dismissNotification = useAppStore((s) => s.dismissNotification);
  const items = notifications;

  const dismiss = (id: string) => dismissNotification(id);

  return (
    <SafeAreaView className={`flex-1 ${t.bg}`} edges={["bottom"]}>
      <HeaderBand
        title="Notifications"
        subtitle="Stay on top of deadlines and important updates"
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: isWide ? 48 : 20,
          paddingTop: 20,
          paddingBottom: 110,
        }}
      >
        <View style={{ width: "100%" }}>
        <Appear from="down" delay={60} duration={500} key={`settings-${focusKey}`}>
          <Card className="mb-6">
            <Text className={`text-base font-bold mb-2 ${t.text}`}>Notification Settings</Text>
            <Toggle value={email} onChange={setEmail} label="Email Notifications" subtitle="Receive alerts via email" />
            <Toggle value={push} onChange={setPush} label="Push Notifications" subtitle="Get mobile push alerts" />
            <Toggle value={reminders} onChange={setReminders} label="Deadline Reminders" subtitle="24hr advance reminders" />
          </Card>
        </Appear>

        <Appear from="fade" delay={150} duration={400} key={`title-${focusKey}`}>
          <Text className={`text-xl font-bold mb-3 ${t.text}`}>Recent Alerts</Text>
        </Appear>

        {items.length === 0 ? (
          <Text className={`text-center py-10 text-sm ${t.textMuted}`}>You're all caught up</Text>
        ) : (
          items.map((n, i) => {
            const s = stripe[n.severity];
            const Icon = s.icon;
            const cardBg = mode === "dark" ? s.bgDark : `${s.bgLight} border ${s.borderLight}`;
            return (
              <Appear from="down" delay={200 + i * 80} duration={500} key={`${n.id}-${focusKey}`}>
                <View className={`mb-3 flex-row overflow-hidden rounded-2xl ${cardBg}`}>
                  <View className={`w-1 ${s.stripe}`} />
                  <View className="flex-1 p-4 flex-row items-start">
                    <View className={`w-9 h-9 rounded-full ${s.iconBg} items-center justify-center mr-3`}>
                      <Icon size={16} color={s.color} />
                    </View>
                    <View className="flex-1">
                      <Text className={`text-[10px] font-bold uppercase tracking-wider ${s.text}`}>
                        {n.courseTag}
                      </Text>
                      <Text className={`mt-1 text-sm font-semibold ${t.text}`}>{n.title}</Text>
                      <Text className={`mt-1 text-xs ${t.textMuted}`}>{n.date}</Text>
                    </View>
                    <View className="items-end">
                      <View className={`rounded-full ${s.pill} px-2.5 py-1 mb-1`}>
                        <Text className="text-[10px] font-bold text-white">{n.daysLeft}D LEFT</Text>
                      </View>
                      <Pressable onPress={() => dismiss(n.id)} className="p-1">
                        <X size={14} color={mode === "dark" ? "#8A9BB5" : "#94A3B8"} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              </Appear>
            );
          })
        )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
