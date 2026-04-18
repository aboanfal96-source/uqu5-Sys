# خطوات التطبيق — 3 خطوات فقط

## الخطوة 1: انسخ الملفات

أضف هذه الملفات لمشروعك (لا تعدّل أي ملف موجود):

```
app/
  request/page.jsx
  admin-login/page.jsx
  admin-dashboard/page.jsx
  api/
    requests/route.js
    requests/[id]/route.js
    admin-auth/route.js
middleware.js
```

## الخطوة 2: أضف كلمة المرور

في ملف `.env.local` (أو في Vercel → Settings → Environment Variables):

```
ADMIN_PASSWORD=اكتب_كلمة_مرورك_هنا
```

## الخطوة 3: ارفع على Vercel

```bash
git add .
git commit -m "add request system"
git push
```

---

## روابطك النهائية

| الصفحة | الرابط |
|--------|--------|
| صفحة الموظفين (انشرها) | `yoursite.vercel.app/request` |
| دخول الإدارة | `yoursite.vercel.app/admin-login` |
| لوحة التحكم | `yoursite.vercel.app/admin-dashboard` |

---

## ملاحظة
- البيانات تُحفظ في ملف `data/requests.json` تلقائياً
- لوحة التحكم محمية بكلمة مرور
- زر "توليد بالذكاء الاصطناعي" يكتب التقرير تلقائياً
