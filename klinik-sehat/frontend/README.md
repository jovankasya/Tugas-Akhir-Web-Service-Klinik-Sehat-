============================================
INSTRUKSI IMPLEMENTASI DATABASE
KLINIK SEHAT - TUGAS AKHIR
============================================

A. SOFTWARE YANG DIBUTUHKAN:
1. XAMPP/WAMP/LAMPP (PHP + MySQL + Apache)
2. phpMyAdmin (sudah include di XAMPP)
3. Text Editor (Notepad++/VS Code)
4. Browser (Chrome/Firefox)

B. LANGKAH-LANGKAH INSTALASI:

1. INSTAL XAMPP:
   - Download XAMPP dari apachefriends.org
   - Install dengan semua default settings
   - Jalankan XAMPP Control Panel
   - Start Apache dan MySQL

2. IMPORT DATABASE:
   - Buka browser, ketik: http://localhost/phpmyadmin
   - Klik "New" di sidebar kiri
   - Buat database baru: klinik_sehat
   - Klik database "klinik_sehat"
   - Klik tab "Import"
   - Pilih file: IMPLEMENTASI_SQL.sql
   - Klik "Go"

3. VERIFIKASI:
   - Setelah import, akan muncul 8 tabel:
     * patients
     * doctors  
     * appointments
     * medicines
     * users
     * medical_records (optional)
   - Klik "Browse" di setiap tabel untuk lihat data sample

4. TEST QUERY:
   - Buka tab "SQL"
   - Ketik: SELECT * FROM patients;
   - Klik "Go"
   - Harus muncul 5 data pasien sample


C. INFORMASI LOGIN SISTEM (DATA SAMPLE):

1. Login ke Aplikasi:
   URL: http://localhost/klinik-sehat/frontend/login.html
        http://localhost/klinik-sehat/frontend/index.html
   Username: admin
   Password: admin123

3. Login phpMyAdmin:
   URL: http://localhost/phpmyadmin
   Username: root
   Password: (kosong)

E. TROUBLESHOOTING:

1. Error "Cannot connect to MySQL":
   - Pastikan MySQL running di XAMPP
   - Cek port 3306 tidak dipakai aplikasi lain

2. Error importing SQL file:
   - Pastikan file encoding UTF-8
   - Max file size di phpMyAdmin: 50MB

3. Data tidak muncul:
   - Refresh browser
   - Clear cache browser
   - Import ulang database
   - Cmd

F. KONTAK:

Nama: [Jovanka Syakira Mulya]
NIM: [23.01.53.0019]
Email: [jovankasyakira0019@mhs.unisbank.ac.id]

folder node_modules.zip di ekstrac lalu di masukkan ke dalam folder backend
============================================
           SELAMAT MENGGUNAKAN!

============================================

