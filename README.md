# Coal Shipment Monitoring System

Aplikasi web untuk **monitoring & pengelolaan data pengiriman batubara** (shipment) berbasis **React (Vite)** di sisi frontend dan **Node.js (Express) + MySQL** di sisi backend.

## Ringkasan

- **Frontend**: UI untuk login, kelola data shipment (CRUD), dashboard analitik, dan export data ke Excel.
- **Backend**: REST API untuk autentikasi berbasis session (SID) dan endpoint data shipment dengan proteksi autentikasi.

## Struktur Folder

- `frontend/` — React + Vite (UI)
- `backend/` — Express API + MySQL (service & auth)

## Quick Start (Dev)

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

> Backend default berjalan di `http://localhost:3000`.

Jika butuh membuat user admin (opsional):

```bash
cd backend
npm run seed:admin
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

> Frontend Vite akan menampilkan URL dev server (umumnya `http://localhost:5173`).

## Dokumentasi

- Backend (alur API, auth, endpoint): lihat [backend/README.md](backend/README.md)
- Frontend (fitur & halaman): lihat [frontend/README.md](frontend/README.md)

## Catatan Konfigurasi

- Frontend saat ini memanggil API ke `http://localhost:3000` secara hard-coded.
- Pastikan MySQL sudah berjalan dan kredensial DB sesuai pada `backend/.env`.
