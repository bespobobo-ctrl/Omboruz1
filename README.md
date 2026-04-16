# OmborUZ — Ombor Boshqaruv Tizimi 🏭

Ishlab chiqarish sexi uchun Telegram Mini App ko'rinishidagi ombor boshqaruv tizimi.

## 🚀 Xususiyatlar

- 📱 Telegram Mini App integratsiyasi
- 👔 Rahbar paneli (xodimlar boshqaruvi)
- 📦 Ombor bo'limi (mahsulotlar boshqaruvi)
- 📊 Kategoriya bo'yicha saralash
- 📱 QR kod generatsiyasi va yuklab olish
- 🔍 Mahsulot qidirish
- 🔐 JWT autentifikatsiya

## 📋 O'rnatish

### 1. MongoDB Atlas (bepul)
1. [mongodb.com/atlas](https://mongodb.com/atlas) ga o'ting
2. Bepul cluster yarating
3. Connection string ni oling
4. `.env.local` fayliga qo'ying

### 2. Vercel Deploy
1. GitHub ga push qiling
2. [vercel.com](https://vercel.com) da import qiling
3. Environment variables qo'shing
4. Deploy qiling

### 3. Telegram Webhook
Deploy bo'lgandan keyin:
```
https://your-app.vercel.app/api/bot
```
URL ni oching — webhook avtomatik o'rnatiladi.

### 4. Bot Menu Button
@BotFather da:
```
/setmenubutton
```
URL: `https://your-app.vercel.app`

## 🔑 Kirish Ma'lumotlari

| Rol | Login | Parol |
|-----|-------|-------|
| Rahbar | 123 | 123 |
| Ombor | Rahbar beradi | Rahbar beradi |

## 🛠 Texnologiyalar

- Next.js 15 (App Router)
- MongoDB + Mongoose
- JWT Authentication
- QR Code Generator
- Telegram Web App SDK
- Vercel Serverless

## 📁 Struktura

```
src/
├── app/
│   ├── page.js          # Login
│   ├── rahbar/page.js   # Admin panel
│   ├── ombor/page.js    # Warehouse panel
│   └── api/
│       ├── auth/        # Login API
│       ├── bot/         # Telegram webhook
│       ├── users/       # User CRUD
│       └── products/    # Product CRUD
├── lib/
│   ├── db.js           # MongoDB connection
│   ├── auth.js         # JWT utilities
│   └── models/         # Mongoose models
```
