# موقع المجلس القروي عسلة

موقع إلكتروني لمجلس قروي عسلة يتيح للمواطنين متابعة الأخبار والخدمات، وللإدارة نشر
وإدارة المحتوى. واجهة عربية بالكامل (RTL)، وخلفية REST API مبنية على Express و Prisma
و PostgreSQL.

راجع [`CLAUDE.md`](CLAUDE.md) و [`docs/SPEC.md`](docs/SPEC.md) (إن وُجد) للتوثيق الكامل.

## البنية

```
backend/   Express + Prisma + PostgreSQL + JWT + Multer
frontend/  React + Vite + TypeScript + Tailwind CSS (RTL/عربي)
```

## التشغيل

### 1. قاعدة البيانات
يلزم تشغيل PostgreSQL محليًا أو استخدام قاعدة بيانات مستضافة (Neon / Supabase / Railway)
وتحديث `DATABASE_URL` في `backend/.env`.

### 2. الخادم الخلفي (Backend)
```bash
cd backend
npm install
copy .env.example .env        # عدّل القيم، خاصة DATABASE_URL و JWT_SECRET
npx prisma migrate dev        # ينشئ الجداول العلائقية من schema.prisma
npx prisma generate
npm run seed                  # ينشئ حساب الإدارة + بيانات أولية
npm run dev                   # http://localhost:5000
```

### 3. الواجهة الأمامية (Frontend)
```bash
cd frontend
npm install
copy .env.example .env
npm run dev                   # http://localhost:5173
```

### دخول لوحة الإدارة
افتح `/admin/login` وسجّل الدخول باستخدام `ADMIN_USERNAME` / `ADMIN_PASSWORD` المحددة في
`backend/.env` وقت التشغيل الأول لأمر `npm run seed`. يُفضّل تغيير كلمة المرور من لوحة
التحكم بعد أول دخول.

> أداة مفيدة: `npx prisma studio` (داخل مجلد backend) تفتح واجهة لتصفح وتعديل البيانات مباشرة.
