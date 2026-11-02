import React from "react";
import { ActivityIndicator, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "@/lib/auth";
import { AuthScreen } from "@/screens/AuthScreen";
import { ForgotPasswordScreen } from "@/screens/ForgotPasswordScreen";
import { ResetPasswordScreen } from "@/screens/ResetPasswordScreen";
import { SelectRoleScreen } from "@/screens/SelectRoleScreen";
import { OnboardingDriverScreen } from "@/screens/OnboardingDriverScreen";
import { OnboardingWorkerScreen } from "@/screens/OnboardingWorkerScreen";
import { MainTabNavigator } from "@/navigation/MainTabNavigator";
import { RequestDetailScreen } from "@/screens/RequestDetailScreen";
import { RequestNewScreen } from "@/screens/RequestNewScreen";
import { MessagesScreen } from "@/screens/MessagesScreen";
import { FriendsScreen } from "@/screens/FriendsScreen";
import { SupportScreen } from "@/screens/SupportScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { HistoryScreen } from "@/screens/HistoryScreen";
import { AdminScreen } from "@/screens/AdminScreen";
import { AdminMonitoringScreen } from "@/screens/AdminMonitoringScreen";
import { AdminSubscriptionsScreen } from "@/screens/AdminSubscriptionsScreen";
import { AdminBootstrapScreen } from "@/screens/AdminBootstrapScreen";
import { PrivacyScreen } from "@/screens/PrivacyScreen";
import { TermsScreen } from "@/screens/TermsScreen";

export type RootStackParamList = {
  Auth: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  SelectRole: undefined;
  OnboardingDriver: undefined;
  OnboardingWorker: undefined;
  Main: undefined;
  RequestNew: { type?: "taxi" | "service" };
  RequestDetail: { id: string };
  Messages: undefined;
  Friends: undefined;
  Support: undefined;
  Profile: undefined;
  History: undefined;
  Admin: undefined;
  AdminMonitoring: undefined;
  AdminSubscriptions: undefined;
  AdminBootstrap: undefined;
  Privacy: undefined;
  Terms: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { session, roles, loading } = useAuth();
  if (loading) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#1e40af" }}><ActivityIndicator size="large" color="#ffffff" /></View>;
  const hasRole = roles.length > 0;
  return <NavigationContainer><Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: "#1e40af" }, headerTintColor: "#ffffff", headerTitleStyle: { fontFamily: "TajawalBold" }, contentStyle: { backgroundColor: "#f5f7ff" } }}>
    {!session ? <><Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} /><Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: "استعادة كلمة المرور" }} /><Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: "كلمة المرور الجديدة" }} /></> : !hasRole ? <><Stack.Screen name="SelectRole" component={SelectRoleScreen} options={{ headerShown: false }} /><Stack.Screen name="OnboardingDriver" component={OnboardingDriverScreen} options={{ title: "تسجيل السائق" }} /><Stack.Screen name="OnboardingWorker" component={OnboardingWorkerScreen} options={{ title: "تسجيل الفني" }} /></> : <><Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} /><Stack.Screen name="RequestNew" component={RequestNewScreen} options={{ title: "طلب جديد" }} /><Stack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ title: "تفاصيل الطلب" }} /><Stack.Screen name="Messages" component={MessagesScreen} options={{ title: "الرسائل" }} /><Stack.Screen name="Friends" component={FriendsScreen} options={{ title: "الأصدقاء" }} /><Stack.Screen name="Support" component={SupportScreen} options={{ title: "الدعم" }} /><Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "الملف الشخصي" }} /><Stack.Screen name="History" component={HistoryScreen} options={{ title: "السجل" }} /><Stack.Screen name="Admin" component={AdminScreen} options={{ title: "لوحة الإدارة" }} /><Stack.Screen name="AdminMonitoring" component={AdminMonitoringScreen} options={{ title: "المراقبة" }} /><Stack.Screen name="AdminSubscriptions" component={AdminSubscriptionsScreen} options={{ title: "الاشتراكات" }} /><Stack.Screen name="AdminBootstrap" component={AdminBootstrapScreen} options={{ title: "الإعداد الأولي" }} /><Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: "الخصوصية" }} /><Stack.Screen name="Terms" component={TermsScreen} options={{ title: "الشروط" }} /></>}
  </Stack.Navigator></NavigationContainer>;
}
