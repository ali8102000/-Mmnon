import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { HomeScreen } from "@/screens/HomeScreen";
import { HistoryScreen } from "@/screens/HistoryScreen";
import { MessagesScreen } from "@/screens/MessagesScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { NotificationsBell } from "@/components/NotificationsBell";
import { useAuth } from "@/lib/auth";
export type MainTabParamList = { Home: undefined; History: undefined; Messages: undefined; Profile: undefined };
const Tab = createBottomTabNavigator<MainTabParamList>();
export function MainTabNavigator() { const { roles } = useAuth(); const isProvider = roles.includes("driver") || roles.includes("worker"); return <Tab.Navigator screenOptions={{ tabBarActiveTintColor: "#1e40af", tabBarInactiveTintColor: "#94a3b8", tabBarStyle: { backgroundColor: "#ffffff", borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingBottom: 4, paddingTop: 4, height: 60 }, tabBarLabelStyle: { fontFamily: "TajawalMedium", fontSize: 11 }, headerStyle: { backgroundColor: "#1e40af" }, headerTintColor: "#ffffff", headerTitleStyle: { fontFamily: "TajawalBold" }, headerLeft: () => <NotificationsBell /> }}><Tab.Screen name="Home" component={HomeScreen} options={{ title: isProvider ? "الطلبات" : "الرئيسية", tabBarIcon: ({ color, size }) => <Ionicons name={isProvider ? "car" : "home"} color={color} size={size} /> }} /><Tab.Screen name="History" component={HistoryScreen} options={{ title: "السجل", tabBarIcon: ({ color, size }) => <Ionicons name="time" color={color} size={size} /> }} /><Tab.Screen name="Messages" component={MessagesScreen} options={{ title: "الرسائل", tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" color={color} size={size} /> }} /><Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "حسابي", tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} /> }} /></Tab.Navigator>; }
