import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

const REPLIES: Record<string, string[]> = {
  "customer-taxi": ["كم الوقت للوصول؟", "أنا في الانتظار", "هل وصلت؟", "شكرًا لك", "الرجاء الاتصال بي", "ألغيت الطلب", "موقعي تغير", "الرحلة ممتازة"],
  "customer-service": ["كم الوقت للوصول؟", "أحتاج مساعدة", "هل أحضرت الأدوات؟", "شكرًا لك", "الرجاء الاتصال بي", "العمل ممتاز", "كم التكلفة؟", "هل انتهيت؟"],
  "provider-taxi": ["أنا في الطريق", "وصلت للموقع", "كم دقيقة للانتظار", "أين موقعك بالضبط؟", "الرحلة جاهزة", "شكرًا لك", "يرجى التقييم", "خزانة ممتلئة"],
  "provider-service": ["أنا في الطريق", "وصلت للموقع", "كم دقيقة للانتظار", "أين موقعك بالضبط؟", "العمل جاهز", "شكرًا لك", "يرجى التقييم", "الأدوات جاهزة"],
};

export function QuickReplies({ role, type, onSelect }: { role: "customer" | "provider"; type: string; onSelect: (text: string) => void }) {
  const key = `${role}-${type}`;
  const replies = REPLIES[key] ?? REPLIES["customer-taxi"];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
      {replies.map((r) => (
        <TouchableOpacity
          key={r}
          onPress={() => onSelect(r)}
          style={{
            backgroundColor: "#f1f5f9",
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
            marginRight: 8,
            borderWidth: 1,
            borderColor: "#e2e8f0",
          }}
        >
          <Text style={{ fontFamily: "TajawalMedium", fontSize: 13, color: "#475569" }}>{r}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
