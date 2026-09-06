# Portal Karir & Rekrutmen ATS (PT Indonesia Thai Summit Plastech)

Sistem Informasi Rekrutmen Karyawan & Applicant Tracking System (ATS) berbasis Next.js 15, React 19, TypeScript, Material-UI (MUI v6), dan PostgreSQL dengan Prisma ORM.

## Fitur Utama

- **7 Tahap Seleksi Komprehensif**:
  1. Screening Dokumen & CV (Validasi berkas PDF <= 100 KB dan 13 kolom biodata)
  2. Tes Psikotes Online (Bank soal logika/numerik + profiling karakteristik kepribadian diri)
  3. Tes Teknis Kejuruan (Pilihan ganda + studi kasus/essay dievaluasi oleh User Departemen)
  4. Interview HR (Penjadwalan online MS Teams/Zoom atau onsite di pabrik KIIC/GIIC)
  5. Interview User Departemen (Evaluasi kompetensi teknis bersama supervisor departemen)
  6. Medical Check-Up (MCU) (Rujukan ke klinik/rumah sakit rekanan resmi)
  7. Offering Letter & Kontrak Kerja (Penerbitan surat penawaran gaji dan sinkronisasi ke Karyawan Sementara)
- **Role-Based Access Control (RBAC)**:
  - **Super Administrator**: Kontrol penuh atas seluruh tahapan, manajemen staf, reset password, dan reset MFA.
  - **HR Recruitment**: Mengelola screening, psikotes, interview HR, MCU, offering letter, dan cetak ID card karyawan.
  - **User Departemen**: Khusus mengelola bank soal teknis kejuruan dan evaluasi tahap teknis/interview user sesuai departemen.
- **Anti-Cheat Ujian Online**: Deteksi tab-switch (alt-tab) realtime dengan batasan pelanggaran dan auto-lock.
- **2-Factor Authentication (MFA/TOTP)**: Dukungan Google Authenticator / Microsoft Authenticator.
- **Automated Personalized Email Notifications**: Notifikasi resmi otomatis setiap tahapan kelolosan/penolakan.

## Panduan Instalasi & Menjalankan Aplikasi

1. **Clone repositori**:
   ```bash
   git clone https://github.com/alfaridzi28/web-karir.git
   cd web-karir
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**:
   Salin `.env.example` ke `.env` dan sesuaikan koneksi database PostgreSQL:
   ```bash
   cp .env.example .env
   ```

4. **Migrasi Database & Seed Data**:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Jalankan Server Pengembangan**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3001`.
