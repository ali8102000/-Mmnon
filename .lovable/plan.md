# خطة الترقية الإنتاجية — 6 مراحل

كل مرحلة = إصدار مستقل قابل للاستخدام. ننفّذها بالترتيب، ونتأكد أن كل مرحلة تعمل قبل التالية.

---

## المرحلة 1 — أساس الـAuth والملفات الشخصية

**الهدف:** تسجيل/دخول لا يفشل أبدًا + استعادة كلمة المرور.

- إصلاح تدفّق التسجيل بالكامل (تأكيد أن الـtrigger يُنشئ الدور `customer`، ومعالجة كل حالات الخطأ).
- إضافة صفحة "نسيت كلمة المرور" + صفحة `/reset-password`.
- إضافة شاشة تسجيل حديثة (إعادة تصميم بسيطة، نفس الـtokens الحالية).
- تثبيت `_authenticated` layout كحارس للمسارات المحمية بدل التحقق اليدوي.
- اختبارات E2E: تسجيل/دخول/استرجاع → دائمًا توجيه صحيح.

**الجداول الجديدة:** لا شيء. **التغييرات على الموجود:** `profiles` (إضافة `email` اختياري لإعادة التعيين).

---

## المرحلة 2 — محرك الطلبات + الـDispatch + التتبع اللحظي

**الهدف:** زبون يطلب → النظام يبحث عن أقرب كابتن متاح → الكابتن يقبل/يرفض → تتبّع حي.

- إعادة هيكلة `service_requests` بدورة حياة كاملة: `pending → searching → assigned → accepted → in_progress → completed | cancelled`.
- جدول جديد `request_offers` لتسجيل العروض المُرسلة لكل كابتن (مع `expires_at` 15 ثانية).
- Server function `dispatchRequest`: تبحث ضمن نصف قطر تدريجي (2km → 5km → 10km) عن كباتن `online`، ترتّب حسب: المسافة، التقييم، آخر استجابة. تُرسل عرضًا واحدًا في كل مرة.
- Server function `respondToOffer(accept|reject)` مع قفل ذرّي (أول قبول يفوز).
- pg_cron يفحص العروض المنتهية كل 5 ثوانٍ ويُعيد التوزيع.
- `live_locations`: تحديث الموقع كل 3 ثوانٍ من الجهة المتحركة (الكابتن أثناء التوجّه، الزبون أثناء الانتظار).
- Realtime channels لتدفّق `service_requests` و`live_locations` للطرفين فقط (RLS صارمة).
- خريطة Uber-style موحّدة: نقطة الانطلاق، الوجهة، خط المسار، أيقونة الكابتن تتحرّك بسلاسة (تخفيف interpolation).

**جداول:** `request_offers` جديد، `driver_profiles` (+ `is_online`, `current_lat/lng`, `last_seen_at`)، تعديلات على `service_requests`.

---

## المرحلة 3 — محرك التسعير + العمولة + محفظة الكابتن

**الهدف:** سعر يُحسب قبل التأكيد، عمولة منصة تُخصم تلقائيًا.

- جدول `pricing_rules` لكل فئة سيارة: `base_fare`, `per_km`, `per_minute`, `min_fare`, `surge_multiplier`.
- Server function `estimateFare(origin, dest, category)` تستدعي Google Routes API → ترجع `distance_km`, `duration_min`, `total`.
- عرض السعر في شاشة الطلب قبل التأكيد + شارة "زيادة سعر" عند الذروة.
- عند `completed`: trigger يحسب السعر النهائي، يُدخل صفّ في `transactions` (عمولة 15% افتراضيًا)، ويحدّث `driver_wallets.balance`.
- شاشة "أرباحي" للكابتن: الرصيد، رحلات اليوم، تقرير أسبوعي/شهري.

**جداول:** `pricing_rules`, `transactions`, `driver_wallets`.

---

## المرحلة 4 — الإشعارات داخل التطبيق + التقييمات

**الهدف:** تنبيهات لحظية مسموعة + تقييم بعد كل رحلة.

- جدول `notifications` (user_id, type, payload, read_at).
- Realtime subscription في root → toast + صوت قابل للإيقاف من الإعدادات.
- popup قبول الطلب للكابتن مع مؤقّت تنازلي 15 ثانية.
- شاشة تقييم إلزامية بعد `completed` تكتب في `ratings` (موجود).
- تحديث متوسّط تقييم الكابتن في `driver_profiles.rating_avg` عبر trigger.

**جداول:** `notifications`.

---

## المرحلة 5 — لوحة تحكم Admin

**الهدف:** سيطرة كاملة على المنصة.

- دور `admin` في `app_role` + مسارات تحت `_authenticated/admin/` محمية بـ`has_role`.
- صفحات: المستخدمون، الكباتن (تفعيل/تعليق)، الطلبات الحيّة، التحليلات (طلبات/يوم، إيرادات/أسبوع، خريطة حرارية)، الخدمات والفئات، قواعد التسعير.
- Server functions Admin-only لكل عملية حسّاسة، مع verify `has_role(auth.uid(), 'admin')`.

---

## المرحلة 6 — التشديد الأمني والأداء

**الهدف:** جاهز للإنتاج.

- منع GPS spoofing: تحقّق من سرعة تغيّر الموقع server-side (>200km/h = مرفوض).
- Rate-limit على `request.new` (طلب واحد نشط لكل زبون).
- تحقّق من إقفال RLS لكل جدول جديد + grants صريحة.
- فهارس geospatial (`POINT` + `GIST index`) لتسريع البحث عن أقرب كابتن.
- مراجعة `security--run_security_scan` ومعالجة كل التحذيرات.
- إعادة تصميم نهائية للواجهات الرئيسية (الخريطة، شاشة الطلب، شاشة الكابتن) بمستوى Uber.

---

## ملاحظات تقنية

- **Stack:** TanStack Start + Supabase (Lovable Cloud) + Google Maps connector + Realtime.
- **الـDispatch ليس Edge Function:** يبقى `createServerFn` لتجنّب cold-starts؛ pg_cron يدير انتهاء العروض.
- **الـlive tracking:** تحديث كل 3 ثوانٍ من الجهاز + interpolation 60fps على الخريطة لحركة ناعمة.
- **لا Push للموبايل الآن** — يحتاج تحويل لـCapacitor، نتركه لمرحلة لاحقة.

```text
┌─────────────────────────────────────────────────────────┐
│                    Customer / Driver UI                  │
└────────────┬─────────────────────────┬──────────────────┘
             │ createServerFn          │ Realtime
             ▼                          ▼
   ┌──────────────────┐      ┌──────────────────────┐
   │  Dispatch / Fare │◄────►│ Postgres + RLS       │
   │  Wallet / Admin  │      │ pg_cron (timeouts)   │
   └──────────────────┘      └──────────────────────┘
```

## ما المطلوب منك للبدء

أوافق على الخطة → أبدأ المرحلة 1 فورًا. كل مرحلة تنتهي برسالة "✅ المرحلة X جاهزة" قبل الانتقال.
