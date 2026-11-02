import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { haversineKm, estimateFare } from '@/lib/pricing';
import { Button } from '@/components/ui';

const SERVICES = [
  { slug: 'taxi', label: 'سيارة', emoji: '🚕', color: '#2563eb' },
  { slug: 'plumber', label: 'سباك', emoji: '🔧', color: '#0891b2' },
  { slug: 'electrician', label: 'كهربائي', emoji: '💡', color: '#ca8a04' },
  { slug: 'carpenter', label: 'نجار', emoji: '🪚', color: '#9333ea' },
  { slug: 'cleaning', label: 'تنظيف', emoji: '🧹', color: '#16a34a' },
  { slug: 'ac', label: 'مكيفات', emoji: '❄️', color: '#0284c7' },
];

const VEHICLE_CATS = [
  { key: 'economy', label: 'اقتصادية', emoji: '🚗' },
  { key: 'premium', label: 'فاخرة', emoji: '🚙' },
  { key: 'luxury', label: 'ممنون فاخر', emoji: '🚘' },
];

export default function NewRequest() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const { user } = useAuth();
  const [selectedService, setSelectedService] = useState(type || 'taxi');
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleCat, setVehicleCat] = useState('economy');
  const [workerLevel, setWorkerLevel] = useState<'fani' | 'khabir'>('fani');
  const [extraWorkers, setExtraWorkers] = useState(0);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const isTaxi = selectedService === 'taxi';

  async function submit() {
    if (!pickup.trim() || !destination.trim()) { Alert.alert('خطأ', 'الرجاء إدخال نقطة الانطلاق والوجهة'); return; }
    setBusy(true);
    try {
      const chosenService = SERVICES.find((item) => item.slug === selectedService);
      const { data: serviceRow } = isTaxi ? { data: null } : await supabase.from('services').select('id').eq('name_ar', chosenService?.label || '').maybeSingle();
      const { data, error } = await supabase.from('service_requests').insert({
        customer_id: user?.id, type: isTaxi ? 'taxi' : 'service', status: isTaxi ? 'searching' : 'pending',
        service_id: serviceRow?.id || null, pickup_text: pickup, dest_text: destination,
        vehicle_category: isTaxi ? vehicleCat : null,
        level_required: !isTaxi ? workerLevel : null,
        workers_count: !isTaxi ? extraWorkers + 1 : 1,
        notes: notes || null, price_estimate: price,
      }).select().single();
      if (error) throw error;
      if (isTaxi && data) { const { error: dispatchError } = await supabase.rpc('dispatch_request', { _request_id: data.id }); if (dispatchError) throw dispatchError; }
      router.replace({ pathname: '/request/[id]', params: { id: data.id } });
    } catch (err: any) { Alert.alert('خطأ', err?.message || 'حدث خطأ'); }
    finally { setBusy(false); }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>طلب جديد</Text>
      <Text style={styles.label}>نوع الخدمة</Text>
      <View style={styles.serviceGrid}>
        {SERVICES.map((s) => (
          <TouchableOpacity key={s.slug} style={[styles.serviceTile, selectedService === s.slug && { backgroundColor: s.color + '20', borderColor: s.color }]} onPress={() => setSelectedService(s.slug)}>
            <Text style={styles.serviceEmoji}>{s.emoji}</Text>
            <Text style={[styles.serviceLabel, { color: selectedService === s.slug ? s.color : '#64748b' }]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>نقطة الانطلاق</Text>
      <TextInput style={styles.input} value={pickup} onChangeText={setPickup} placeholder="موقعك الحالي" placeholderTextColor="#94a3b8" />
      <Text style={styles.label}>الوجهة</Text>
      <TextInput style={styles.input} value={destination} onChangeText={setDestination} placeholder="إلى أين؟" placeholderTextColor="#94a3b8" />
      {isTaxi ? (
        <>
          <Text style={styles.label}>فئة السيارة</Text>
          <View style={styles.catRow}>
            {VEHICLE_CATS.map((c) => (
              <TouchableOpacity key={c.key} style={[styles.catChip, vehicleCat === c.key && styles.catChipActive]} onPress={() => setVehicleCat(c.key)}>
                <Text style={styles.catEmoji}>{c.emoji}</Text>
                <Text style={[styles.catLabel, vehicleCat === c.key && styles.catLabelActive]}>{c.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <>
          <Text style={styles.label}>مستوى الفني</Text>
          <View style={styles.catRow}>
            <TouchableOpacity style={[styles.catChip, workerLevel === 'fani' && styles.catChipActive]} onPress={() => setWorkerLevel('fani')}><Text style={[styles.catLabel, workerLevel === 'fani' && styles.catLabelActive]}>فني</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.catChip, workerLevel === 'khabir' && styles.catChipActive]} onPress={() => setWorkerLevel('khabir')}><Text style={[styles.catLabel, workerLevel === 'khabir' && styles.catLabelActive]}>خبير</Text></TouchableOpacity>
          </View>
          <Text style={styles.label}>عدد الفنيين الإضافيين: {extraWorkers}</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity style={styles.stepperBtn} onPress={() => setExtraWorkers(Math.max(0, extraWorkers - 1))}><Text style={styles.stepperText}>−</Text></TouchableOpacity>
            <Text style={styles.stepperValue}>{extraWorkers}</Text>
            <TouchableOpacity style={styles.stepperBtn} onPress={() => setExtraWorkers(Math.min(5, extraWorkers + 1))}><Text style={styles.stepperText}>+</Text></TouchableOpacity>
          </View>
        </>
      )}
      <Text style={styles.label}>ملاحظات (اختياري)</Text>
      <TextInput style={[styles.input, { height: 80 }]} value={notes} onChangeText={setNotes} placeholder="أي تفاصيل إضافية..." placeholderTextColor="#94a3b8" multiline />
      {price !== null && (
        <View style={styles.priceBox}><Text style={styles.priceLabel}>السعر التقديري</Text><Text style={styles.priceValue}>{price.toLocaleString('en')} د.ع</Text></View>
      )}
      <View style={{ height: 24 }} />
      <Button title="إرسال الطلب" onPress={submit} loading={busy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 50 },
  title: { fontSize: 28, fontWeight: '900', color: '#1e293b', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 8, marginTop: 16 },
  serviceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  serviceTile: { width: '31%', aspectRatio: 1, borderRadius: 16, backgroundColor: '#fff', borderWidth: 2, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  serviceEmoji: { fontSize: 32, marginBottom: 4 },
  serviceLabel: { fontSize: 13, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: 'rgba(30,41,59,0.1)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, fontWeight: '600', color: '#1e293b', backgroundColor: 'rgba(30,41,59,0.03)', textAlign: 'left' },
  catRow: { flexDirection: 'row', gap: 10 },
  catChip: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 14, backgroundColor: '#fff', borderWidth: 2, borderColor: 'transparent' },
  catChipActive: { borderColor: '#2563eb', backgroundColor: '#2563eb10' },
  catEmoji: { fontSize: 18 },
  catLabel: { fontSize: 14, fontWeight: '700', color: '#64748b' },
  catLabelActive: { color: '#2563eb' },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  stepperBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(30,41,59,0.1)' },
  stepperText: { fontSize: 24, fontWeight: '900', color: '#2563eb' },
  stepperValue: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  priceBox: { backgroundColor: '#2563eb10', borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 20 },
  priceLabel: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  priceValue: { fontSize: 24, fontWeight: '900', color: '#2563eb', marginTop: 4 },
});
