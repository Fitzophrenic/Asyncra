import React, { useState } from "react";
import { Alert, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown, ChevronUp, LogOut, Save, Sun, Moon, Bell, Shield } from "lucide-react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";

import { useAuth } from "../../lib/auth";
import { useAppStore } from "../../lib/store";
import { userApi } from "../../lib/api";
import { useTheme, tokens } from "../../lib/theme";

import HeaderBand from "../../components/ui/HeaderBand";
import Card from "../../components/ui/Card";
import TextField from "../../components/ui/TextField";
import Toggle from "../../components/ui/Toggle";
import Appear, { useFocusKey } from "../../components/ui/Appear";
import { useIsWide } from "../../components/layout/AppShell";
import AvatarPicker from "../../components/domain/AvatarPicker";

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const mode = useTheme((s) => s.mode);
  const toggleTheme = useTheme((s) => s.toggle);
  const t = tokens[mode];
  const focusKey = useFocusKey();
  const isWide = useIsWide();
  const isDark = mode === "dark";

  const user = useAuth((s) => s.user);
  const updateUser = useAuth((s) => s.updateUser);
  const signOut = useAuth((s) => s.signOut);
  const courses = useAppStore((s) => s.courses);
  const dashboard = useAppStore((s) => s.dashboard);
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [major, setMajor] = useState(user?.major ?? "");
  const [enrollment, setEnrollment] = useState(user?.enrollment ?? "full-time");
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [goal, setGoal] = useState(user?.goal ?? "");
  const [hours, setHours] = useState(String(user?.weeklyHours ?? 20));
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor ?? "#5DBFD6");
  const [saving, setSaving] = useState(false);

  const profileCard = (
    <Appear from="down" delay={60} duration={500} key={`avatar-${focusKey}`}>
      <Card className="mb-5">
        <View style={{ alignItems: "center", paddingVertical: 8 }}>
          <AvatarPicker initials={user?.initials ?? "?"} selectedColor={avatarColor} onColorChange={setAvatarColor} />
          <Text className={`mt-4 text-xl font-bold ${t.text}`}>{user?.name ?? ""}</Text>
          <Text className={`mt-1 text-sm ${t.textMuted}`}>{user?.email ?? ""}</Text>
          <View style={{
            flexDirection: "row", gap: 12, marginTop: 12,
          }}>
            <View style={{
              backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC",
              borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, alignItems: "center",
            }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#5DBFD6" }}>{courses.length}</Text>
              <Text style={{ fontSize: 10, color: isDark ? "#8A9BB5" : "#64748B" }}>Courses</Text>
            </View>
            <View style={{
              backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC",
              borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, alignItems: "center",
            }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#5DBFD6" }}>{dashboard.totalCredits}</Text>
              <Text style={{ fontSize: 10, color: isDark ? "#8A9BB5" : "#64748B" }}>Credits</Text>
            </View>
            <View style={{
              backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC",
              borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, alignItems: "center",
            }}>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#5DBFD6" }}>{user?.weeklyHours ?? 0}</Text>
              <Text style={{ fontSize: 10, color: isDark ? "#8A9BB5" : "#64748B" }}>Hrs/wk</Text>
            </View>
          </View>
        </View>
      </Card>
    </Appear>
  );

  const accountCard = (
    <Appear from="down" delay={140} duration={500} key={`details-${focusKey}`}>
      <Card className="mb-5">
        <Text className={`text-base font-bold mb-4 ${t.text}`}>Account Details</Text>
        <View className="mb-3">
          <TextField label="Full Name" value={name} onChangeText={setName} />
        </View>
        <View className="mb-3">
          <TextField label="Email" value={email} onChangeText={setEmail} />
        </View>
        <View className="mb-3">
          <TextField label="Major" value={major} onChangeText={setMajor} />
        </View>
        <TextField
          label="Enrollment"
          value={enrollment}
          onChangeText={(v) => setEnrollment(v as typeof enrollment)}
        />
      </Card>
    </Appear>
  );

  const prefsCard = (
    <Appear from="down" delay={220} duration={500} key={`prefs-${focusKey}`}>
      <Card className="mb-5">
        <Pressable onPress={() => setPrefsOpen((v) => !v)} className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Shield size={16} color="#5DBFD6" style={{ marginRight: 8 }} />
            <Text className={`text-base font-bold ${t.text}`}>Academic Preferences</Text>
          </View>
          {prefsOpen
            ? <ChevronUp size={16} color={isDark ? "#8A9BB5" : "#64748B"} />
            : <ChevronDown size={16} color={isDark ? "#8A9BB5" : "#64748B"} />
          }
        </Pressable>
        {prefsOpen && (
          <View style={{ marginTop: 16 }}>
            <View className="mb-3">
              <TextField label="Goal" value={goal} onChangeText={setGoal} />
            </View>
            <TextField label="Weekly Study Hours" value={hours} onChangeText={setHours} keyboardType="numeric" />
          </View>
        )}
      </Card>
    </Appear>
  );

  const settingsCard = (
    <Appear from="down" delay={300} duration={500} key={`settings-${focusKey}`}>
      <Card className="mb-5">
        <Text className={`text-base font-bold mb-3 ${t.text}`}>Settings</Text>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            {isDark ? <Sun size={16} color="#5DBFD6" /> : <Moon size={16} color="#5DBFD6" />}
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text className={`text-sm font-medium ${t.text}`}>
                {isDark ? "Light Mode" : "Dark Mode"}
              </Text>
            </View>
          </View>
          <Toggle value={isDark} onChange={() => toggleTheme()} />
        </View>

        <View style={{ height: 1, backgroundColor: isDark ? "#2A2D3A" : "#E2E8F1" }} />

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Bell size={16} color="#5DBFD6" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text className={`text-sm font-medium ${t.text}`}>Email Notifications</Text>
            </View>
          </View>
          <Toggle value={emailNotifs} onChange={setEmailNotifs} />
        </View>

        <View style={{ height: 1, backgroundColor: isDark ? "#2A2D3A" : "#E2E8F1" }} />

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Bell size={16} color="#5DBFD6" />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text className={`text-sm font-medium ${t.text}`}>Push Notifications</Text>
            </View>
          </View>
          <Toggle value={pushNotifs} onChange={setPushNotifs} />
        </View>
      </Card>
    </Appear>
  );

  const buttonsSection = (
    <Appear from="down" delay={380} duration={500} key={`btns-${focusKey}`}>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Pressable
          onPress={async () => {
            if (saving) return;
            setSaving(true);
            const parts = name.trim().split(" ");
            const initials = parts.length >= 2
              ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
              : name.trim().slice(0, 2).toUpperCase();
            const payload = {
              name: name.trim(),
              major,
              enrollment,
              goal,
              weeklyHours: Number(hours) || 20,
              avatarColor,
            };
            // optimistic local update so UI feels instant
            updateUser({ ...payload, email, initials });
            try {
              const updated = await userApi.updateProfile(payload);
              // sync with server-authoritative shape (e.g. recalculated initials)
              updateUser(updated);
            } catch (err) {
              console.warn("updateProfile failed:", err);
              if (Platform.OS === "web") {
                window.alert("Couldn't save profile changes. Please try again.");
              } else {
                Alert.alert("Save failed", "Couldn't save profile changes. Please try again.");
              }
            } finally {
              setSaving(false);
            }
          }}
          style={{
            flex: 1, backgroundColor: "#5DBFD6", borderRadius: 14, paddingVertical: 14,
            flexDirection: "row", alignItems: "center", justifyContent: "center",
            opacity: saving ? 0.6 : 1,
          }}
        >
          <Save size={16} color="#FFFFFF" />
          <Text style={{ color: "#FFFFFF", fontWeight: "600", marginLeft: 8, fontSize: 14 }}>
            {saving ? "Saving..." : "Save"}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            const doSignOut = () => {
              signOut();
              navigation.dispatch(
                CommonActions.reset({ index: 0, routes: [{ name: "Welcome" }] })
              );
            };
            if (Platform.OS === "web") {
              if (window.confirm("Are you sure you want to sign out?")) doSignOut();
            } else {
              Alert.alert("Sign Out", "Are you sure you want to sign out?", [
                { text: "Cancel", style: "cancel" },
                { text: "Sign Out", style: "destructive", onPress: doSignOut },
              ]);
            }
          }}
          style={{
            flex: 1, borderWidth: 1.5, borderColor: "#E25C5C", borderRadius: 14, paddingVertical: 14,
            flexDirection: "row", alignItems: "center", justifyContent: "center",
          }}
        >
          <LogOut size={16} color="#E25C5C" />
          <Text style={{ color: "#E25C5C", fontWeight: "600", marginLeft: 8, fontSize: 14 }}>Sign Out</Text>
        </Pressable>
      </View>
      <Text style={{ textAlign: "center", fontSize: 11, marginTop: 16, color: isDark ? "#8A9BB5" : "#94A3B8" }}>
        Asynchra v0.1.0
      </Text>
    </Appear>
  );

  return (
    <SafeAreaView className={`flex-1 ${t.bg}`} edges={["bottom"]}>
      <HeaderBand title="Profile & Settings" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: isWide ? 48 : 20,
          paddingTop: 20,
          paddingBottom: 110,
        }}
      >
        {isWide ? (
          <View style={{ flexDirection: "row", gap: 24, alignItems: "flex-start" }}>
            <View style={{ width: 320 }}>
              {profileCard}
              {settingsCard}
              {buttonsSection}
            </View>
            <View style={{ flex: 1 }}>
              {accountCard}
              {prefsCard}
            </View>
          </View>
        ) : (
          <View>
            {profileCard}
            {accountCard}
            {prefsCard}
            {settingsCard}
            {buttonsSection}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
