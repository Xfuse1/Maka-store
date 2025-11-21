# مشروع متجر مكة - Maka Store

متجر إلكتروني متكامل للأزياء النسائية مبني باستخدام Next.js 15 و Supabase

## 🚀 النشر على Vercel

### المتطلبات الأساسية
1. حساب على [Vercel](https://vercel.com)
2. حساب على [Supabase](https://supabase.com)
3. Git مثبت على جهازك

### خطوات النشر

#### 1. تجهيز قاعدة البيانات Supabase

1. سجل دخول على [Supabase](https://supabase.com)
2. أنشئ مشروع جديد
3. افتح SQL Editor وشغّل السكريبتات بالترتيب:
   ```sql
   -- من مجلد scripts/
   00-complete-database-setup.sql
   15-create-hero-slides-table.sql
   19-hero-slides-rls.sql
   20-create-hero-slides-storage.sql
   ```

4. أنشئ Storage Buckets:
   - اذهب لـ Storage
   - أنشئ bucket اسمه `hero-slides` (public)
   - أنشئ bucket اسمه `logos` (public)
   - أنشئ bucket اسمه `categories` (public)

5. احصل على المفاتيح من Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

#### 2. رفع الكود على Git

```bash
# في مجلد المشروع
cd F:\cezzzez\makastore-main\makastore-main

# تهيئة Git (إذا لم يكن موجود)
git init

# إضافة كل الملفات
git add .

# Commit أول
git commit -m "Initial commit - Maka Store"

# ربط مع GitHub/GitLab (اختياري لكن مستحسن)
# أنشئ repository جديد على GitHub أولاً
git remote add origin https://github.com/your-username/makastore.git
git branch -M main
git push -u origin main
```

#### 3. النشر على Vercel

**الطريقة الأولى: من خلال موقع Vercel (الأسهل)**

1. اذهب لـ [vercel.com](https://vercel.com)
2. اضغط "New Project"
3. استورد الـ repository من GitHub
4. أضف Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ADMIN_API_SECRET=your-secret-key-here
   ```
5. اضغط "Deploy"

**الطريقة الثانية: من خلال CLI**

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# النشر
vercel

# للنشر للـ production مباشرة
vercel --prod
```

#### 4. إعدادات بعد النشر

1. **Domain Settings**: في Vercel Dashboard
   - أضف domain مخصص إذا أردت
   - اضبط SSL (تلقائي)

2. **Environment Variables**: تأكد من إضافة:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   ADMIN_API_SECRET
   ```

3. **Supabase Settings**: في لوحة تحكم Supabase
   - اذهب لـ Authentication > URL Configuration
   - أضف رابط Vercel الخاص بك في Redirect URLs
   - مثال: `https://your-site.vercel.app/auth/callback`

## 📝 ملاحظات مهمة

### الأمان
- ❌ **لا ترفع** ملف `.env.local` على Git
- ✅ استخدم Environment Variables في Vercel
- ✅ احفظ `ADMIN_API_SECRET` في مكان آمن

### الأداء
- الصور يجب أن تكون مخزنة في Supabase Storage
- استخدم next/image للصور لتحسين الأداء
- فعّل ISR (Incremental Static Regeneration) للصفحات الثابتة

### التحديثات
```bash
# لتحديث المشروع بعد تعديلات
git add .
git commit -m "Update: description"
git push

# Vercel سيعمل deploy تلقائي
```

## 🛠️ التطوير المحلي

```bash
# تثبيت المكتبات
npm install

# تشغيل السيرفر المحلي
npm run dev

# فتح المتصفح على
http://localhost:3000
```

## 📂 هيكل المشروع

```
src/
├── app/                 # Next.js App Router
│   ├── admin/          # لوحة التحكم
│   ├── api/            # API Routes
│   └── ...
├── components/         # React Components
├── lib/               # Utilities & Helpers
└── styles/            # CSS Styles

scripts/               # SQL Scripts
```

## 🔗 روابط مفيدة

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)

## 🆘 استكشاف الأخطاء

### خطأ: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### خطأ في الـ Build على Vercel
- تحقق من Environment Variables
- تحقق من أن كل الـ dependencies في package.json
- راجع Build Logs في Vercel Dashboard

### مشاكل الاتصال بـ Supabase
- تأكد من صحة الـ URLs والمفاتيح
- تحقق من RLS Policies
- تأكد من إضافة domain Vercel في Supabase Auth settings

## 📧 الدعم

للمساعدة أو الاستفسارات، راجع الـ Issues في المشروع.
