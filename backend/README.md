# Backend — Coal Shipment Monitoring System

Backend ini adalah REST API berbasis **Node.js (Express)** yang terhubung ke **MySQL**. Fokus utama backend:

- Autentikasi login dan pembuatan **session** (SID)
- Proteksi endpoint dengan middleware `requireAuth`
- CRUD data shipment pada tabel `shipping_data`

## Tech Stack

- Node.js + Express (`express`)
- MySQL driver (`mysql2/promise`)
- Hash password (`bcryptjs`)
- Session sederhana berbasis DB (tabel `sessions`)

## Menjalankan Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Endpoint health check:
- `GET /` → `{ "message": "Backend PTBA is running!" }`

## Konfigurasi Environment

File contoh: [backend/.env.example](.env.example)

Variabel yang dipakai:
- `PORT` (default `3000`)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`
- `SESSION_TTL_DAYS` (default `7`)
- Seed admin (opsional): `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_ROLE`

Catatan: koneksi DB dibuat via [backend/src/db/pool.js](src/db/pool.js) menggunakan `ensurePool()` dan akan return `null` jika env DB tidak lengkap atau koneksi gagal.

## Alur Logika API (High Level)

### 1) Startup server

- Entry: [backend/src/index.js](src/index.js)
- Mengaktifkan middleware:
  - `cors(...)`
  - `express.json()` dan `express.urlencoded()`
- Mendaftarkan route:
  - `/api/auth` → [backend/src/routes/auth.js](src/routes/auth.js)
  - `/api/shipping` → [backend/src/routes/shipping.js](src/routes/shipping.js)

### 2) Autentikasi & Session

#### Login

- Endpoint: `POST /api/auth/login`
- Body:
  - `username` (atau `email`) dan `password`

Flow yang terjadi:
1. Route login memanggil `findUserByUsername(username)` (service) untuk mencari user berdasarkan `email` **atau** `name`.
2. Password diverifikasi dengan `bcrypt.compare(password, user.password)`.
3. Jika valid, server membuat `sid` menggunakan `crypto.randomUUID()`.
4. Server menyimpan session ke tabel `sessions` dengan `createSession({ sid, user })`:
   - `expires` dihitung dari `SESSION_TTL_DAYS`
   - `data` disimpan sebagai JSON string `{ user: { id, uuid, name, email, role } }`
5. Response sukses:
   - `{ sid, expires, user }`

#### Mengirim Session ke Request Berikutnya

Middleware auth mendukung 2 cara membawa SID:
- Header `Authorization: Bearer <sid>` (cara utama)
- Header `X-Session-Id: <sid>`

Implementasi ada di [backend/src/middleware/auth.js](src/middleware/auth.js).

#### Proteksi Endpoint (`requireAuth`)

Flow middleware:
1. Ambil SID dari header.
2. Ambil session dari DB via `getSessionById(sid)`.
3. Validasi:
   - session ada
   - `expires` belum lewat
   - `data.user` ada
4. Jika valid:
   - `req.user` diisi user dari session
   - `req.sessionId` diisi SID
5. Jika tidak valid: `401 Unauthorized`

### 3) Shipping API (CRUD)

Semua endpoint `/api/shipping/*` wajib auth (menggunakan `requireAuth`).

- `GET /api/shipping`
  - Memanggil `listShipping()`
  - Query: `SELECT * FROM shipping_data ORDER BY id ASC`

- `POST /api/shipping`
  - Memanggil `createShipping(req.body)`
  - Validasi minimal (wajib):
    - `tug_barge_name`, `brand`, `tonnage`, `buyer`, `pod`, `jetty`, `status`
  - Insert ke `shipping_data`

- `GET /api/shipping/:id`
  - Memanggil `getShippingById(id)`
  - Return `404` jika data tidak ada

- `PUT /api/shipping/:id`
  - Memanggil `updateShippingPartial(id, req.body)`
  - Partial update: hanya field yang ada di payload yang di-update
  - Return `400` jika tidak ada field yang di-update
  - Return `404` jika id tidak ditemukan

- `DELETE /api/shipping/:id`
  - Memanggil `deleteShipping(id)`
  - Return `404` jika id tidak ditemukan

Service CRUD ada di [backend/src/services/shipping.js](src/services/shipping.js).

## Model Data (Berdasarkan Query di Kode)

Backend mengasumsikan tabel berikut ada di MySQL:

### `users`
Kolom yang dipakai:
- `id` (number)
- `uuid` (string)
- `name` (string)
- `email` (string)
- `password` (string, hashed)
- `role` (string)

### `sessions`
Kolom yang dipakai:
- `sid` (string)
- `expires` (datetime)
- `data` (text/json string)

### `shipping_data`
Kolom yang dipakai:
- `id`
- `tug_barge_name`
- `brand`
- `tonnage`
- `buyer`
- `pod`
- `jetty`
- `status`
- `est_commenced_loading` (datetime, nullable)
- `est_completed_loading` (datetime, nullable)
- `rata_rata_muat` (time/string, nullable)
- `si_spk` (string, nullable)

## Seed Admin (Opsional)

Script: [backend/src/seedAdmin.js](src/seedAdmin.js)

```bash
cd backend
npm run seed:admin
```

- Membuat user admin berdasarkan env `ADMIN_*` jika email tersebut belum ada.
- Password akan di-hash dengan bcrypt sebelum disimpan.

## Contoh Request

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin@local.test\",\"password\":\"admin123\"}"
```

### Akses Shipping (dengan SID)

```bash
curl http://localhost:3000/api/shipping \
  -H "Authorization: Bearer <sid>"
```
