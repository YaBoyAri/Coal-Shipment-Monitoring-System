# Frontend — Coal Shipment Monitoring System

Frontend ini adalah aplikasi **React + Vite** untuk monitoring dan pengelolaan data shipment batubara.

## Tech Stack

- React + Vite
- React Router (routing + proteksi halaman via localStorage SID)
- Recharts (grafik dashboard)
- `xlsx` (export data ke Excel)

## Menjalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

Catatan:
- Frontend saat ini mengakses backend di `http://localhost:3000`.
- Pastikan backend sudah jalan terlebih dahulu.

## Fitur Utama

### 1) Login

- Halaman: `'/login'`
- Memanggil endpoint `POST /api/auth/login`.
- Jika sukses, frontend menyimpan:
	- `ptba_sid` (session id) di localStorage
	- `ptba_user` (info user) di localStorage

### 2) Proteksi Halaman (Auth Guard)

- Implementasi: komponen `RequireAuth` di [frontend/src/App.jsx](src/App.jsx)
- Jika `ptba_sid` tidak ada, user akan diarahkan ke `/login`.

### 3) Data Shipment (List + Search + Delete)

- Halaman: `'/data-shipment'`
- Menampilkan tabel data shipment dari `GET /api/shipping`.
- Pencarian cepat dengan highlight kata kunci.
- Hapus data dengan konfirmasi (`DELETE /api/shipping/:id`).

### 4) Input Data Shipment

- Halaman: `'/input-data-shipment'`
- Form input data shipment baru (`POST /api/shipping`).
- UX:
	- Draft form disimpan otomatis ke localStorage (`ptba_form_shipment`).
	- Auto hitung `rata_rata_muat` berdasarkan `est_commenced_loading` dan `est_completed_loading`.
	- Opsi Jetty `Others` mendukung input manual.

### 5) Edit Data Shipment

- Halaman: `'/edit-data-shipment/:id'`
- Mengambil detail data: `GET /api/shipping/:id`
- Simpan perubahan: `PUT /api/shipping/:id` (partial update)
- Konversi datetime dari DB ke input `datetime-local`.

### 6) Dashboard

- Halaman: `'/dashboard'`
- Ringkasan:
	- total shipment, total tonnage, rata-rata tonnage
- Visualisasi:
	- tren per bulan (LineChart)
	- distribusi status (PieChart)
	- distribusi jetty (BarChart)

### 7) Export Data Shipment (Excel)

- Halaman: `'/export-data-shipment'`
- Fitur:
	- filter berdasarkan Status dan Jetty
	- pilih kolom yang ingin diexport
	- preview beberapa baris data
	- export ke file `.xlsx` dengan nama bertimestamp

## Catatan Integrasi API

Semua request ke endpoint shipping mengirim SID dengan header:

```text
Authorization: Bearer <ptba_sid>
```

Jika backend membalas `401`, frontend akan menghapus `ptba_sid`/`ptba_user` dan redirect ke `/login`.
