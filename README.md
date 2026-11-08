# AplikasiDKM — Hasil Bongkar EXE

> Ini **bukan** source code asli 100%. Source `.go` dan `.svelte` aslinya tidak tersimpan di dalam exe, jadi tidak bisa dikembalikan persis seperti semula. Yang berhasil dipulihkan adalah semua yang memang tertanam di dalam exe: frontend hasil build, skema database, template surat, dan daftar lengkap fungsi backend. Itu sudah cukup untuk memodifikasi dan membangun ulang aplikasi yang setara.

## EXE-nya sebenarnya apa?

- **Bahasa:** Go 1.27.2
- **Framework desktop:** Wails v2.17.0 (Go + WebView2)
- **Frontend:** Svelte, di-build dengan Vite (hasil build saja yang ada di exe)
- **Database:** SQLite, file `dkm.db` (library modernc.org/sqlite, tanpa CGO)
- **Fitur lain:** Export Excel (excelize), export PDF (go-pdf/fpdf), backup ke Google Drive (OAuth2), publikasi web
- **Ukuran exe:** 27.616.768 byte, PE32+ GUI x86-64 Windows

## Yang berhasil dipulihkan

| File | Isi | Status |
|---|---|---|
| `frontend/dist/index.html` | HTML utama (379 byte) | Utuh, byte-perfect |
| `frontend/dist/assets/index-DJlp8P2U.js` | Seluruh UI Svelte, sudah di-minify (220.871 byte) | Utuh, byte-perfect |
| `frontend/dist/assets/style-x_eaq6ZN.css` | Seluruh CSS (13.616 byte) | Utuh, byte-perfect |
| `backend/schema.sql` | Skema SQLite | Terverifikasi: 23 tabel + 8 view, berhasil dibuat di SQLite kosong |
| `backend/sql-queries.txt` | 42 query SQL aplikasi (SELECT/INSERT/UPDATE/DELETE) | Diekstrak dari string di exe |
| `backend/templates_raw.json` | 28 template surat bawaan (JSON) | Utuh, valid JSON |
| `backend/api-methods.txt` | 131 method `App` (92 exported / dipanggil frontend, 39 internal) | Lengkap |

### Tabel database (23)

`users`, `settings`, `org_periode`, `org_bidang`, `org_pengurus`, `jamaah`, `kas_akun`, `kas_kategori`, `kas_transaksi`, `zakat_masuk`, `mustahik`, `penyaluran`, `qurban_kelompok`, `qurban_peserta`, `petugas_jadwal`, `inventaris`, `peminjaman`, `pengumuman`, `surat_template`, `surat_counter`, `surat_keluar`, `surat_masuk`, `dokumen_draft`

### Modul di frontend

Dashboard, Kas (multi-akun), ZIS / Zakat, Qurban, Jadwal, Jamaah, Inventaris, Surat, Struktur / Pengurus, Web, Backup, Pengaturan.

### Template surat (28)

Undangan rapat, undangan kajian, undangan PHBI, undangan halal bihalal, permohonan dana, permohonan bantuan pemerintah, permohonan penceramah, permohonan izin keramaian, surat edaran, SK pengurus, SK panitia, surat tugas, surat kuasa, SK aktif pengurus, SK domisili, surat rekomendasi, surat pengantar, peminjaman tempat, peminjaman barang, berita acara rapat, berita acara serah terima, notulen rapat, daftar hadir, kwitansi, terima kasih donatur, cover LPJ, LPJ kegiatan, proposal kegiatan.

## Yang TIDAK bisa dipulihkan

- File `.go` asli (logika backend hanya bisa dilihat sebagai nama fungsi + query SQL + string; isi fungsi persisnya hanya ada sebagai kode mesin).
- File `.svelte` / komponen frontend asli (yang ada hanya JS hasil build yang sudah di-minify; nama variabel dan struktur komponen asli hilang).
- Data `dkm.db` milikmu — database itu dibuat saat aplikasi berjalan, bukan tertanam di exe. Kalau masih ada file `dkm.db` di laptopmu, simpan baik-baik, itu datanya.

## ⚠️ Penting soal keamanan

Di dalam exe ini tertanam kredensial Google OAuth bawaan (Client ID + Client Secret) untuk fitur backup Drive, plus URL web bawaan. Kredensial itu **tidak saya salin ke folder ini** — sengaja tidak disertakan.

Artinya:
1. **Jangan sebarkan exe ini ke publik** apa adanya.
2. **Segera rotasi / buat ulang kredensial OAuth itu di Google Cloud Console**, lalu ganti dengan kredensial milikmu sendiri.
3. Saat membangun ulang, jangan menanam secret di kode / ldflags. Pakai input di Pengaturan (aplikasi ini memang sudah punya kolom Client ID / Client Secret di Pengaturan) atau environment variable.

## Cara memodifikasi dari sini

**Paling gampang — ubah tampilan:**
- Edit `frontend/dist/assets/style-x_eaq6ZN.css` (warna ada di `:root`, warna utama `--pri: #0f766e` hijau teal).
- Ganti teks/label di `index-DJlp8P2U.js` dengan search-replace hati-hati (file minify, satu baris panjang). Cocok untuk ganti nama, label, dan teks kecil.

**Jalan yang benar — bangun ulang:**
1. Buat proyek Wails v2 baru (Go 1.27).
2. Pakai `frontend/dist/` ini apa adanya sebagai aset frontend.
3. Implementasikan ulang 92 method di `backend/api-methods.txt` di Go, memakai `backend/schema.sql` dan `backend/sql-queries.txt` sebagai cetak biru. Dependensi utama ada di `go.mod` asli: `wails/v2`, `modernc.org/sqlite`, `excelize/v2`, `go-pdf/fpdf`, `google.golang.org/api` (Drive), `golang.org/x/oauth2`.
4. Isi `templates_raw.json` sebagai template bawaan (di kode asli, template ini di-seed ke tabel `surat_template` saat pertama jalan).

## File asli

Zip asli yang kamu upload tetap ada di `workspace/user/files/AplikasiDKM_0_tyx2.zip`. Folder kerja pembongkaran ada di `workspace/dkm/` (exe hasil ekstrak + Go 1.27 yang saya unduh untuk analisis).
