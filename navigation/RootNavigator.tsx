import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Home, BarChart3, Bell, Menu } from "lucide-react-native";
import AppShell, { useIsWide } from "../components/layout/AppShell";

import WelcomeSplashScreen from "../screens/auth/WelcomeSplashScreen";
import LandingScreen from "../screens/auth/LandingScreen";
import SignUpScreen from "../screens/auth/SignUpScreen";
import SignInScreen from "../screens/auth/SignInScreen";
import PreviewScreen from "../screens/auth/PreviewScreen";
import OnboardingMajorScreen from "../screens/onboarding/OnboardingMajorScreen";
import OnboardingEnrollmentScreen from "../screens/onboarding/OnboardingEnrollmentScreen";
import OnboardingGoalScreen from "../screens/onboarding/OnboardingGoalScreen";
import OnboardingHoursScreen from "../screens/onboarding/OnboardingHoursScreen";
import DashboardScreen from "../screens/app/DashboardScreen";
import CourseDetailScreen from "../screens/app/CourseDetailScreen";
import ProcessingScreen from "../screens/app/ProcessingScreen";
import CompareScreen from "../screens/app/CompareScreen";
import NotificationsScreen from "../screens/app/NotificationsScreen";
import ProfileScreen from "../screens/app/ProfileScreen";
import CourseCompareScreen from "../screens/app/CourseCompareScreen";
import WeeklyCalendarScreen from "../screens/app/WeeklyCalendarScreen";
import GpaCalculatorScreen from "../screens/app/GpaCalculatorScreen";
import StudyTimerScreen from "../screens/app/StudyTimerScreen";
import UploadScreen from "../screens/app/UploadScreen";

export type RootStackParamList = {
  Welcome: undefined;
  Landing: undefined;
  Processing: { draft?: { uri: string; name: string; mimeType?: string } };
  Preview: undefined;
  SignUp: undefined;
  SignIn: undefined;
  OnboardingMajor: undefined;
  OnboardingEnrollment: undefined;
  OnboardingGoal: undefined;
  OnboardingHours: undefined;
  AppTabs: { screen?: string };
  CourseDetail: { courseId: string };
  CourseCompare: undefined;
  WeeklyCalendar: undefined;
  GpaCalculator: undefined;
  StudyTimer: undefined;
  Upload: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function AppTabsInner() {
  const isWide = useIsWide();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#6EC4DE",
        tabBarInactiveTintColor: "#FFFFFFCC",
        headerShown: false,
        tabBarShowLabel: true,
        animation: "shift",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
          letterSpacing: 1,
          marginTop: 2,
        },
        tabBarStyle: isWide
          ? { display: "none" }
          : {
              backgroundColor: "#1B3A6B",
              borderTopWidth: 0,
              height: 85,
              paddingBottom: 28,
              paddingTop: 10,
              elevation: 0,
            },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: "HOME",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Compare"
        component={CompareScreen}
        options={{
          tabBarLabel: "COMPARE",
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: "ALERTS",
          tabBarIcon: ({ color, size }) => <Bell color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "MENU",
          tabBarIcon: ({ color, size }) => <Menu color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AppTabs() {
  return (
    <AppShell>
      <AppTabsInner />
    </AppShell>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "fade",
        animationDuration: 350,
        gestureEnabled: true,
      }}
      initialRouteName="Welcome"
    >
      <Stack.Screen name="Welcome" component={WelcomeSplashScreen} />
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="Processing" component={ProcessingScreen} options={{ animation: "fade" }} />
      <Stack.Screen name="Preview" component={PreviewScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen
        name="OnboardingMajor"
        component={OnboardingMajorScreen}
        options={{ animation: "slide_from_right", animationDuration: 380 }}
      />
      <Stack.Screen
        name="OnboardingEnrollment"
        component={OnboardingEnrollmentScreen}
        options={{ animation: "slide_from_right", animationDuration: 380 }}
      />
      <Stack.Screen
        name="OnboardingGoal"
        component={OnboardingGoalScreen}
        options={{ animation: "slide_from_right", animationDuration: 380 }}
      />
      <Stack.Screen
        name="OnboardingHours"
        component={OnboardingHoursScreen}
        options={{ animation: "slide_from_right", animationDuration: 380 }}
      />
      <Stack.Screen
        name="AppTabs"
        component={AppTabs}
        options={{ animation: "none" }}
      />
      <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
      <Stack.Screen name="CourseCompare" component={CourseCompareScreen} options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="WeeklyCalendar" component={WeeklyCalendarScreen} options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="GpaCalculator" component={GpaCalculatorScreen} options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="StudyTimer" component={StudyTimerScreen} options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="Upload" component={UploadScreen} options={{ animation: "slide_from_right" }} />
    </Stack.Navigator>
  );
}
