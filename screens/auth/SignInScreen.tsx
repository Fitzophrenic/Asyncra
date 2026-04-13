import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Lock } from "lucide-react-native";

import { RootStackParamList } from "../../navigation/RootNavigator";
import { Logo } from "../../components/ui/Logo";
import { PrimaryButton } from "../../components/ui/PrimaryButton";
import { Appear } from "../../components/ui/Appear";
import { useAuth } from "../../lib/auth";

type Props = NativeStackScreenProps<RootStackParamList, "SignIn">;

export default function SignInScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const signIn = useAuth((s) => s.signIn);

  const inputBase = {
    height: 52,
    borderWidth: 1,
    borderColor: "#5DBFD6",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    color: "#13243A",
    fontSize: 15,
    outlineStyle: "none",
  } as any;

  const handleSignIn = () => {
    let valid = true;
    if (!email.includes("@")) {
      setEmailError("Please enter a valid email address");
      valid = false;
    } else {
      setEmailError("");
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      valid = false;
    } else {
      setPasswordError("");
    }
    if (valid) {
      signIn(email, password).then(() => {
        navigation.navigate("AppTabs", { screen: "Dashboard" });
      });
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <View
        style={{ backgroundColor: "#1B3A6B" }}
        className="pt-16 pb-10 items-center"
      >
        <Appear from="down" delay={40} duration={550}>
          <View className="flex-row items-center" style={{ gap: 12 }}>
            <Logo size={48} />
            <Text className="text-white font-bold tracking-widest" style={{ fontSize: 30 }}>
              ASYNCRA
            </Text>
          </View>
        </Appear>
      </View>

      <ScrollView contentContainerStyle={{ paddingVertical: 40, alignItems: "center" }}>
        <Appear from="down" delay={120} duration={600} style={{ width: "100%", maxWidth: 420, paddingHorizontal: 24 }}>
          <Text className="text-2xl font-bold text-center" style={{ color: "#13243A" }}>
            Welcome Back
          </Text>
          <Text className="text-sm text-center mt-2" style={{ color: "#64748B" }}>
            Sign in to continue your academic journey
          </Text>

          <View style={{ marginTop: 28 }}>
            <Text
              className="font-semibold uppercase mb-2"
              style={{ color: "#13345F", fontSize: 11, letterSpacing: 1 }}
            >
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={(v) => { setEmail(v); if (emailError) setEmailError(""); }}
              placeholder="john@university.edu"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              style={[inputBase, emailError ? { borderColor: "#E25C5C" } : {}]}
            />
            {emailError ? <Text style={{ color: "#E25C5C", fontSize: 12, marginTop: 4 }}>{emailError}</Text> : null}
          </View>

          <View style={{ marginTop: 18 }}>
            <Text
              className="font-semibold uppercase mb-2"
              style={{ color: "#13345F", fontSize: 11, letterSpacing: 1 }}
            >
              Password
            </Text>
            <View style={{ position: "relative", justifyContent: "center" }}>
              <TextInput
                value={password}
                onChangeText={(v) => { setPassword(v); if (passwordError) setPasswordError(""); }}
                placeholder="••••••••"
                placeholderTextColor="#94A3B8"
                secureTextEntry
                style={[inputBase, passwordError ? { borderColor: "#E25C5C" } : {}]}
              />
              <View style={{ position: "absolute", right: 16 }} pointerEvents="none">
                <Lock size={16} color="#94A3B8" />
              </View>
            </View>
            {passwordError ? <Text style={{ color: "#E25C5C", fontSize: 12, marginTop: 4 }}>{passwordError}</Text> : null}
          </View>

          <View style={{ marginTop: 28 }}>
            <PrimaryButton title="Sign In" onPress={handleSignIn} />
          </View>

          <View className="flex-row justify-center mt-5">
            <Text className="text-sm" style={{ color: "#64748B" }}>
              Don't have an account?{" "}
            </Text>
            <Pressable onPress={() => navigation.navigate("SignUp")}>
              <Text className="text-sm font-semibold" style={{ color: "#5DBFD6" }}>
                Sign Up
              </Text>
            </Pressable>
          </View>
        </Appear>
      </ScrollView>
    </View>
  );
}
