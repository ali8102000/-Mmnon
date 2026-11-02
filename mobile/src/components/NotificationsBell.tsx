import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { formatTime } from "@/lib/helpers";
import type { Database } from "@/lib/types";

type Notif = Database["public"]["Tables"]["notifications"]["Row"];

export function NotificationsBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30);
    setItems(data ?? []);
    setUnread(data?.filter((n) => !n.read_at).length ?? 0);
  }, [user]);

  useEffect(() => {
    load();
    if (!user) return;
    const ch = supabase.channel(`notif-${user.id}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, () => load()).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load, user]);

  async function markAll() {
    if (!user) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
    setItems((cur) => cur.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    setUnread(0);
  }

  if (!user) return null;

  return (
    <>
      <TouchableOpacity onPress={() => { setOpen(true); }} style={{ paddingHorizontal: 12 }}>
        <View>
          <Ionicons name="notifications" size={24} color="#fff" />
          {unread > 0 && (
            <View style={{ position: "absolute", top: -4, right: -4, backgroundColor: "#dc2626", borderRadius: 10, minWidth: 20, height: 20, justifyContent: "center", alignItems: "center", paddingHorizontal: 4 }}>
              <Text style={{ color: "#fff", fontSize: 10, fontFamily: "TajawalBold" }}>{unread > 9 ? "9+" : unread}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <TouchableOpacity activeOpacity={1} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} onPress={() => setOpen(false)}>
          <View style={{ marginTop: 60, marginHorizontal: 16, backgroundColor: "#fff", borderRadius: 20, maxHeight: "70%", padding: 16 }} >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontFamily: "TajawalBlack", color: "#1a1a2e" }}>الإشعارات</Text>
              {unread > 0 && (
                <TouchableOpacity onPress={markAll}>
                  <Text style={{ color: "#1e40af", fontFamily: "TajawalMedium", fontSize: 13 }}>تعليم الكل كمقروء</Text>
                </TouchableOpacity>
              )}
            </View>
            <ScrollView>
              {items.length === 0 ? (
                <Text style={{ textAlign: "center", fontFamily: "Tajawal", color: "#94a3b8", paddingVertical: 40 }}>لا توجد إشعارات</Text>
              ) : (
                items.map((n) => (
                  <View key={n.id} style={{ backgroundColor: n.read_at ? "#fff" : "#eff6ff", borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: "#e2e8f0" }}>
                    <Text style={{ fontFamily: "TajawalBold", fontSize: 14, color: "#1a1a2e" }}>{n.title}</Text>
                    {n.body && <Text style={{ fontFamily: "Tajawal", fontSize: 12, color: "#64748b", marginTop: 4 }}>{n.body}</Text>}
                    <Text style={{ fontFamily: "Tajawal", fontSize: 10, color: "#cbd5e1", marginTop: 4 }}>{formatTime(n.created_at)}</Text>
                  </View>
                ))
              )}
            </ScrollView>
            <TouchableOpacity onPress={() => setOpen(false)} style={{ backgroundColor: "#1e40af", borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 12 }}>
              <Text style={{ color: "#fff", fontFamily: "TajawalBold" }}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
