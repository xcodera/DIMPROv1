# Technical Specification & Documentation: myBCA Clone (AI Powered)

## 1. Introduction
Proyek ini adalah aplikasi web mobile-first yang mensimulasikan antarmuka dan pengalaman pengguna (UI/UX) dari aplikasi operasional perusahaan modern, yang terinspirasi oleh estetika myBCA. Aplikasi ini mengintegrasikan kecerdasan buatan (Gemini AI) untuk dua fungsi utama: asisten finansial cerdas dan sistem verifikasi identitas (SLIKs) melalui Optical Character Recognition (OCR) pada KTP. Selain itu, aplikasi ini memiliki fitur operasional inti seperti sistem absensi berbasis lokasi.

## 2. Technology Stack
Aplikasi dibangun dengan standar teknis berikut:
- **Framework Core**: React 19 (ES6 Modules)
- **Styling Engine**: Tailwind CSS 3.x (Utility-first)
- **Iconography**: Lucide React v0.562.0
- **AI Engine**: Google GenAI SDK (gemini-3-flash-preview)
- **State Management**: React Hooks (useState, useEffect, useRef)
- **Runtime Environment**: Web Browser (Mobile Optimized)

## 3. UI/UX Design System (Metrics)
Sistem desain didasarkan pada estetika korporat yang profesional, bersih, dan modern dengan penekanan pada kejelasan dan kemudahan penggunaan.

### Visual Foundations:
- **Color Palette**:
  - **Primary**: `#004691` (BCA Navy Blue) - Digunakan untuk header, tombol utama, dan branding.
  - **Background**: `#F8FAFC` (Light) / `#0f172a` (Dark Mode).
  - **Surface**: `bg-white` (Light) / `bg-[#1e293b]` (Dark) untuk kartu dan panel.
- **Typography**:
  - **Font Family**: Inter (Sans-serif)
  - **Standard Font Sizes**: 
    - Title: `text-xl` (20px) / `text-2xl` (24px)
    - Body: `text-sm` (14px)
    - Caption/Supporting: `text-xs` (12px)
    - Badge/Micro: `text-[10px]`
- **Layout & Spacing**:
  - **Container Padding**: `px-6` (24px) untuk margin sisi ponsel standar.
  - **Corner Radius**: `rounded-2xl` (16px) dan `rounded-3xl` (24px) untuk kartu dan elemen utama.
  - **Element Spacing**: `space-y-8` untuk margin vertikal antar komponen utama.
- **Glassmorphism**: Penggunaan `backdrop-blur-md` dan `bg-white/10` pada header untuk menciptakan efek kedalaman.

## 4. Application Flow (User Journeys)

1.  **Dashboard Experience**:
    - Pengguna disambut dengan salam dinamis berdasarkan waktu (Pagi/Siang/Sore/Malam).
    - Status card menampilkan jam real-time, tanggal, dan lokasi yang dideteksi melalui Geolocation API.
    - Terdapat running text (marquee) dengan kutipan motivasi.
    - Menu cepat (Absensi, SLIKs, Laporan, Lainnya) menyediakan akses langsung ke fitur utama.
    - Bagian "Ringkasan Akun & Kinerja" menampilkan statistik kunci seperti saldo, poin, dan progres proyek.
    - Daftar "Aktivitas Terakhir" menampilkan 5 log aktivitas terbaru dari seluruh aplikasi.

2.  **Attendance Journey**:
    - Dari Dashboard, pengguna menekan ikon "Absensi".
    - Halaman Absensi menampilkan jam digital presisi dan melacak lokasi pengguna secara real-time.
    - Pengguna dapat melakukan "Clock In" dan "Clock Out". Status kehadiran ("Hadir Tepat Waktu" atau "Terlambat") ditentukan secara otomatis.
    - Terdapat fitur untuk mengajukan izin, sakit, atau cuti melalui modal interaktif.
    - Riwayat absensi (maksimal 5 entri) ditampilkan di bagian bawah halaman.

3.  **AI-Powered SLIKs Verification**:
    - Dari navigasi bawah, pengguna menekan tombol "SLIK" di tengah.
    - **Langkah 1 (Upload)**: Pengguna mengunggah gambar KTP. Halaman ini juga menampilkan riwayat pengecekan sebelumnya.
    - **Langkah 2 (Processing)**: Sebuah animasi pemindaian ditampilkan saat Gemini AI menganalisis gambar untuk mengekstrak data dan mendeteksi batas kartu.
    - **Langkah 3 (Review)**: AI mengembalikan data terstruktur (NIK, Nama, Alamat, dll.) dan gambar KTP yang telah dipotong (cropped) secara otomatis. Data yang diekstrak ditampilkan dalam formulir yang dapat diedit.
    - **Langkah 4 (Confirmation)**: Pengguna dapat meninjau, menyalin metadata JSON, dan mengonfirmasi data untuk menyelesaikan proses verifikasi. Aktivitas ini kemudian dicatat dalam riwayat SLIKs dan log aktivitas utama.

4.  **Financial AI Assistant**:
    - Dari navigasi bawah, pengguna memilih "AI Chat".
    - Pengguna dapat berinteraksi dengan asisten AI yang telah dikonfigurasi untuk menjawab pertanyaan seputar data transaksi (menggunakan `MOCK_TRANSACTIONS`).
    - AI memberikan ringkasan dan wawasan keuangan secara percakapan.

## 5. Coding Documentation & Standards

### File Architecture:
- `App.tsx`: Orchestrator utama yang menangani routing view, state global (seperti tema Dark/Light dan log aktivitas), dan menyatukan semua komponen.
- `components/Layout.tsx`: Menyediakan struktur visual dasar, termasuk bottom navigation bar.
- `components/Dashboard.tsx`: Komponen untuk halaman utama, menampilkan jam real-time, lokasi, statistik, dan ringkasan aktivitas.
- `components/Attendance.tsx`: Mengelola semua logika untuk fitur absensi, termasuk pelacakan lokasi dan modal pengajuan.
- `components/Sliks.tsx`: Mengimplementasikan alur verifikasi KTP multi-langkah, termasuk interaksi dengan Gemini AI untuk OCR.
- `components/AIChat.tsx`: Membangun antarmuka percakapan untuk asisten finansial.
- `services/geminiService.ts`: Mengisolasi logika panggilan ke Gemini AI untuk fitur AI Chat, dikonfigurasi dengan `systemInstruction` untuk memastikan jawaban yang relevan.

### Key Logic Implementation:
- **Real-time Clock & Geolocation**: Menggunakan `useEffect` dengan `setInterval` untuk jam dan `navigator.geolocation.watchPosition` untuk pelacakan lokasi berkelanjutan, dengan cleanup untuk mencegah memory leak.
- **View Routing**: State `activeView` di `App.tsx` mengontrol komponen mana yang dirender, menciptakan pengalaman navigasi Single-Page Application (SPA) yang cepat.
- **AI-Powered OCR**: Dalam `Sliks.tsx`, Gemini AI dipanggil dengan gambar KTP dan `responseSchema` JSON. Ini memaksa model untuk mengembalikan data terstruktur, termasuk `card_box` (koordinat batas kartu), yang kemudian digunakan untuk memotong gambar secara otomatis menggunakan HTML Canvas.
- **State Management Terpusat**: Log aktivitas (`activities`) dikelola di `App.tsx` dan diteruskan sebagai props. Fungsi `addActivity` juga diteruskan ke komponen anak untuk memungkinkan mereka memperbarui log global, memastikan konsistensi data di seluruh aplikasi.

## 6. Security & Permissions
Aplikasi ini secara eksplisit meminta izin pengguna melalui `metadata.json` untuk mengakses:
1.  **Camera**: Diperlukan untuk fungsionalitas unggah foto KTP pada fitur SLIKs (dan potensi fitur QRIS di masa depan).
2.  **Geolocation**: Kritis untuk validasi lokasi pada fitur Absensi Digital untuk memastikan integritas data kehadiran.
