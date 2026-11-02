import { useState, useEffect, useCallback, useRef } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

const QUICK_REPLIES_CUSTOMER = ['وصلت!', 'كم دقيقة؟', 'أين أنت؟', 'شكراً جزيلاً', 'هل أنت قريب؟'];
const QUICK_REPLIES_PROVIDER = ['قادم إليك', 'وصلت للموقع', 'بانتظارك', 'تم الإنجاز', 'دقيقة واحدة'];

export default function RequestDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [request, setRequest] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [showRating, setShowRating] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const isProvider = request?.provider_id === user?.id;
  const isCustomer = request?.customer_id === user?.id;
  const isActive = request?.status === 'in_progress' || request?.status === 'accepted';

  const loadRequest = useCallback(async () => {
    const { data } = await supabase.from('service_requests').select('*, customer:profiles!service_requests_customer_id_fkey(full_name, phone), provider:profiles!service_requests_provider_id_fkey(full_name, phone)').eq('id', id).maybeSingle();
    setRequest(data); setLoading(false);
  }, [id]);

  const loadMessages = useCallback(async () => {
    const { data } = await supabase.from('messages').select('*, sender:profiles(full_name)').eq('request_id', id).order('created_at', { ascending: true });
    setMessages(data || []);
  }, [id]);

  useEffect(() => {
    loadRequest(); loadMessages();
    const sub = supabase.channel(`request-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'service_requests', filter: `id=eq.${id}` }, (payload) => { setRequest((prev: any) => ({ ...prev, ...payload.new })); if (payload.new.status === 'completed') setShowRating(true); })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `request_id=eq.${id}` }, () => loadMessages())
      .subscribe();
    return () => { supabase.removeChannel(sub); };
  }, [id, loadRequest, loadMessages]);

  async function sendMessage(text?: string) {
    const msg = (text || newMsg).trim(); if (!msg) return; setNewMsg('');
    await supabase.from('messages').insert({ request_id: id, sender_id: user?.id, body: msg });
    loadMessages();
  }

  async function acceptRequest() { const { error } = await supabase.rpc('accept_service_request', { _request_id: id }); if (error) Alert.alert('خطأ', error.message); else loadRequest(); }
  async function startRide() { const { error } = await supabase.rpc('transition_service_request', { _request_id: id, _new_status: 'in_progress' }); if (error) Alert.alert('خطأ', error.message); else loadRequest(); }
  async function completeRide() { const { error } = await supabase.rpc('transition_service_request', { _request_id: id, _new_status: 'completed' }); if (error) Alert.alert('خطأ', error.message); else { loadRequest(); setShowRating(true); } }
  async function cancelRequest() { Alert.alert('إلغاء الطلب', 'هل أنت متأكد؟', [{ text: 'تراجع', style: 'cancel' }, { text: 'إلغاء الطلب', style: 'destructive', onPress: async () => { await supabase.from('service_requests').update({ status: 'cancelled' }).eq('id', id); router.back(); } }]); }
  async function submitRating() { if (rating === 0) return; const otherId = isCustomer ? request?.provider_id : request?.customer_id; await supabase.from('ratings').insert({ request_id: id, rater_id: user?.id, ratee_id: otherId, stars: rating }); setShowRating(false); router.back(); }

  if (loading) return <View style={styles.center}><Text style={{ color: '#64748b' }}>جاري التحميل...</Text></View>;
  if (!request) return <View style={styles.center}><Text style={{ color: '#64748b' }}>الطلب غير موجود</Text></View>;

  const statusLabel: Record<string, string> = { searching: 'بحث عن مزوّد...', pending: 'بانتظار القبول', accepted: 'تم القبول', in_progress: 'قيد التنفيذ', completed: 'مكتمل', cancelled: 'ملغي' };
  const quickReplies = isCustomer ? QUICK_REPLIES_CUSTOMER : QUICK_REPLIES_PROVIDER;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <View style={styles.header}><TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>→</Text></TouchableOpacity><Text style={styles.headerTitle}>{statusLabel[request.status] || request.status}</Text><View style={{ width: 30 }} /></View>
        <View style={styles.infoCard}><Text style={styles.infoType}>{request.type === 'taxi' ? '🚕 طلب سيارة' : '🔧 خدمة منزلية'}</Text>{request.pickup_text && <Text style={styles.infoRow}>من: {request.pickup_text}</Text>}{request.dest_text && <Text style={styles.infoRow}>إلى: {request.dest_text}</Text>}{request.price_estimate && <Text style={styles.infoPrice}>{request.price_estimate.toLocaleString('en')} د.ع</Text>}</View>
        <View style={styles.actionsRow}>
          {request.status === 'searching' && isProvider && <TouchableOpacity style={styles.actionBtn} onPress={acceptRequest}><Text style={styles.actionBtnText}>قبول الطلب</Text></TouchableOpacity>}
          {request.status === 'accepted' && isProvider && <TouchableOpacity style={styles.actionBtn} onPress={startRide}><Text style={styles.actionBtnText}>بدء الرحلة</Text></TouchableOpacity>}
          {isActive && isProvider && <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#16a34a' }]} onPress={completeRide}><Text style={styles.actionBtnText}>إنهاء</Text></TouchableOpacity>}
          {request.status !== 'cancelled' && request.status !== 'completed' && <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#dc2626' }]} onPress={cancelRequest}><Text style={styles.actionBtnText}>إلغاء</Text></TouchableOpacity>}
        </View>
        <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 8 }} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
          {messages.map((msg) => (<View key={msg.id} style={[styles.msgBubble, msg.sender_id === user?.id ? styles.msgMine : styles.msgOther]}><Text style={styles.msgText}>{msg.body}</Text></View>))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>{quickReplies.map((qr) => (<TouchableOpacity key={qr} style={styles.quickReply} onPress={() => sendMessage(qr)}><Text style={styles.quickReplyText}>{qr}</Text></TouchableOpacity>))}</ScrollView>
        <View style={styles.inputRow}><TextInput style={styles.msgInput} value={newMsg} onChangeText={setNewMsg} placeholder="اكتب رسالة..." placeholderTextColor="#94a3b8" onSubmitEditing={() => sendMessage()} /><TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage()}><Text style={styles.sendBtnText}>إرسال</Text></TouchableOpacity></View>
        {showRating && (<View style={styles.ratingOverlay}><View style={styles.ratingCard}><Text style={styles.ratingTitle}>قيّم الخدمة</Text><View style={styles.starsRow}>{[1, 2, 3, 4, 5].map((s) => (<TouchableOpacity key={s} onPress={() => setRating(s)}><Text style={[styles.star, s <= rating && styles.starActive]}>★</Text></TouchableOpacity>))}</View><TouchableOpacity style={styles.ratingSubmit} onPress={submitRating}><Text style={styles.ratingSubmitText}>إرسال التقييم</Text></TouchableOpacity></View></View>)}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' }, center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: 'rgba(30,41,59,0.06)' },
  backBtn: { fontSize: 24, color: '#2563eb', fontWeight: '700' }, headerTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, margin: 16 }, infoType: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginBottom: 8 }, infoRow: { fontSize: 14, color: '#64748b', marginTop: 4 }, infoPrice: { fontSize: 18, fontWeight: '800', color: '#2563eb', marginTop: 8 },
  actionsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 }, actionBtn: { flex: 1, backgroundColor: '#2563eb', borderRadius: 14, paddingVertical: 12, alignItems: 'center' }, actionBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  msgBubble: { maxWidth: '75%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 8 }, msgMine: { backgroundColor: '#2563eb', alignSelf: 'flex-end' }, msgOther: { backgroundColor: '#fff', alignSelf: 'flex-start' }, msgText: { fontSize: 15, color: '#1e293b' },
  quickReply: { backgroundColor: '#2563eb10', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }, quickReplyText: { fontSize: 13, color: '#2563eb', fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: 'rgba(30,41,59,0.06)', paddingBottom: 24 },
  msgInput: { flex: 1, borderWidth: 1, borderColor: 'rgba(30,41,59,0.1)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#1e293b', backgroundColor: '#f8fafc' },
  sendBtn: { backgroundColor: '#2563eb', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 }, sendBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  ratingOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  ratingCard: { backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center', width: '80%' }, ratingTitle: { fontSize: 22, fontWeight: '800', color: '#1e293b', marginBottom: 20 }, starsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 }, star: { fontSize: 40, color: '#cbd5e1' }, starActive: { color: '#f59e0b' }, ratingSubmit: { backgroundColor: '#2563eb', borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14 }, ratingSubmitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
