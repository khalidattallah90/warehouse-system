# 🏭 نظام إدارة المخازن - Warehouse Management System

نظام إلكتروني متكامل لإدارة مخازن السيراميك مبني بـ React + Node.js + MySQL

---

## 📁 هيكل المشروع

```
warehouse-system/
├── backend/          ← Node.js + Express
│   ├── server.js
│   ├── .env
│   ├── db/
│   │   ├── db.js         (الاتصال بـ MySQL)
│   │   └── schema.sql    (جداول قاعدة البيانات)
│   ├── routes/
│   │   ├── auth.js       (تسجيل الدخول والتسجيل)
│   │   ├── items.js      (إدارة الأصناف)
│   │   ├── orders.js     (إدارة الطلبات)
│   │   └── misc.js       (موردين، عملاء، تقارير، مستخدمين)
│   └── middleware/
│       └── auth.js       (JWT middleware)
└── frontend/         ← React
    └── src/
        ├── App.jsx
        ├── context/
        │   └── AuthContext.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Dashboard.jsx
        │   └── ... (باقي الصفحات)
        └── components/
            └── Sidebar.jsx
```

---

## ⚙️ خطوات التشغيل

### 1. إعداد قاعدة البيانات MySQL

```bash
# افتح MySQL وشغّل ملف الـ schema
mysql -u root -p < backend/db/schema.sql
```

### 2. إعداد الـ Backend

```bash
cd backend
npm install
```

عدّل ملف `.env` وأدخل كلمة مرور MySQL الخاصة بك:
```
DB_PASSWORD=your_actual_password
```

```bash
npm run dev    # للتطوير
npm start      # للإنتاج
```

الخادم سيعمل على: `http://localhost:5000`

### 3. إعداد الـ Frontend

```bash
cd frontend
npm install
npm start
```

سيفتح المتصفح تلقائياً على: `http://localhost:3000`

---

## 🔑 بيانات الدخول الافتراضية

| الدور | اسم المستخدم | كلمة المرور |
|-------|-------------|------------|
| مدير | admin | admin123 |

> ⚠️ قم بتغيير كلمة المرور بعد أول تسجيل دخول

---

## 🌐 API Endpoints

| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | /api/auth/login | تسجيل الدخول |
| POST | /api/auth/register | تسجيل حساب جديد |
| GET | /api/auth/me | بيانات المستخدم الحالي |
| GET | /api/items | جلب كل الأصناف |
| POST | /api/items | إضافة صنف جديد |
| PUT | /api/items/:id | تعديل صنف |
| DELETE | /api/items/:id | حذف صنف |
| GET | /api/orders | جلب الطلبات |
| POST | /api/orders | إنشاء طلب جديد |
| PUT | /api/orders/:id/status | تحديث حالة الطلب |
| GET | /api/suppliers | جلب الموردين |
| GET | /api/customers | جلب العملاء |
| GET | /api/reports/stats | إحصائيات لوحة التحكم |
| GET | /api/users | إدارة المستخدمين (أدمن فقط) |

---

## 👥 أدوار المستخدمين

| الدور | الصلاحيات |
|-------|-----------|
| admin | كل الصلاحيات |
| warehouse_keeper | الأصناف + الطلبات |
| accountant | الطلبات + العملاء + التقارير |
| customer | واجهة المتجر + إنشاء طلبات |

---

## 🛠️ التقنيات المستخدمة

**Backend:** Node.js, Express.js, MySQL2, JWT, Bcrypt, Dotenv, CORS

**Frontend:** React 18, React Router v6, Axios

**Database:** MySQL 8+
