# Setup Google Calendar Integration

Panduan untuk mengintegrasikan Google Calendar dengan fitur Smart Schedule Builder.

## Langkah 1: Buat Project di Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang sudah ada
3. Aktifkan Google Calendar API:
   - Navigasi ke **APIs & Services** > **Library**
   - Cari "Google Calendar API"
   - Klik **Enable**

## Langkah 2: Buat OAuth 2.0 Credentials

1. Navigasi ke **APIs & Services** > **Credentials**
2. Klik **Create Credentials** > **OAuth client ID**
3. Jika diminta, konfigurasi OAuth consent screen:
   - Pilih **External** (jika aplikasi untuk publik)
   - Isi informasi aplikasi:
     - App name: "AI Campus Schedule Builder"
     - User support email: email Anda
     - Developer contact email: email Anda
   - Klik **Save and Continue**
   - Di bagian **Scopes**, klik **Add or Remove Scopes**
   - Tambahkan scope: `https://www.googleapis.com/auth/calendar.events`
   - Klik **Save and Continue**
   - Tambahkan test users (email yang akan digunakan untuk testing)
   - Klik **Save and Continue**

4. Kembali ke **Credentials**, klik **Create Credentials** > **OAuth client ID**
5. Pilih **Application type**: **Web application**
6. Isi informasi:
   - Name: "AI Campus Web Client"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (untuk development)
     - `https://your-production-domain.com` (untuk production)
   - Authorized redirect URIs:
     - `http://localhost:3000` (untuk development)
     - `https://your-production-domain.com` (untuk production)
7. Klik **Create**
8. Copy **Client ID** yang muncul

## Langkah 3: Konfigurasi Environment Variables

1. Buka file `.env` di root project
2. Tambahkan atau update baris berikut:
   ```
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
   ```
3. Ganti `your_client_id_here` dengan Client ID yang Anda copy dari langkah sebelumnya

## Langkah 4: Restart Development Server

```bash
npm run dev
```

## Cara Menggunakan

1. Buka aplikasi dan navigasi ke **Fitur 3: Smart Schedule Builder**
2. Input jadwal kuliah dan kegiatan Anda
3. Klik **Generate Jadwal Optimal** untuk membuat jadwal
4. Setelah jadwal dibuat, klik tab **📅 KALENDER**
5. Klik tombol **🔐 Login & Sync Google Calendar**
6. Login dengan akun Google Anda
7. Berikan izin untuk mengakses Google Calendar
8. Setelah login berhasil, klik **🔄 Sync ke Google Calendar**
9. Jadwal Anda akan otomatis ditambahkan ke Google Calendar!

## Fitur Calendar View

- **Week View**: Tampilan mingguan dengan slot waktu per jam
- **Day View**: Tampilan harian yang lebih detail
- **Month View**: Tampilan bulanan untuk overview
- **Color Coding**:
  - Biru: Kuliah
  - Hijau: Kegiatan
  - Kuning: Seminar
  - Merah: Lomba
  - Cyan: UKM

## Troubleshooting

### Error: "Invalid Client ID"
- Pastikan `NEXT_PUBLIC_GOOGLE_CLIENT_ID` sudah diisi dengan benar di file `.env`
- Restart development server setelah mengubah environment variables

### Error: "Access Blocked: This app's request is invalid"
- Pastikan Authorized JavaScript origins dan redirect URIs sudah dikonfigurasi dengan benar di Google Cloud Console
- Pastikan URL yang digunakan sesuai dengan yang didaftarkan

### Error: "Not authenticated with Google Calendar"
- Klik tombol "Login & Sync Google Calendar" terlebih dahulu
- Pastikan sudah memberikan izin yang diperlukan saat login

### Sync tidak berhasil
- Periksa console browser untuk error messages
- Pastikan Google Calendar API sudah diaktifkan di Google Cloud Console
- Periksa bahwa scope `https://www.googleapis.com/auth/calendar.events` sudah ditambahkan

## Catatan Keamanan

- **JANGAN** commit file `.env` ke Git
- **JANGAN** share Client ID di publik
- Untuk production, gunakan environment variables yang aman
- Gunakan HTTPS untuk production deployment
