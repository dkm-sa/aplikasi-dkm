-- Skema database AplikasiDKM (dkm.db, SQLite)
-- Diekstrak dari string di dalam AplikasiDKM.exe
-- 23 tabel aplikasi

CREATE TABLE IF NOT EXISTS org_periode (
  id INTEGER PRIMARY KEY AUTOINCREMENT, nama TEXT NOT NULL, mulai TEXT NOT NULL DEFAULT '', selesai TEXT NOT NULL DEFAULT '',
  aktif INTEGER NOT NULL DEFAULT 0, keterangan TEXT NOT NULL DEFAULT '');

CREATE TABLE IF NOT EXISTS org_bidang (
  id INTEGER PRIMARY KEY AUTOINCREMENT, nama TEXT NOT NULL, parent_id INTEGER REFERENCES org_bidang(id) ON DELETE SET NULL,
  urutan INTEGER NOT NULL DEFAULT 0, peran TEXT NOT NULL DEFAULT '', aktif INTEGER NOT NULL DEFAULT 1, keterangan TEXT NOT NULL DEFAULT '');

CREATE TABLE IF NOT EXISTS org_pengurus (
  id INTEGER PRIMARY KEY AUTOINCREMENT, periode_id INTEGER NOT NULL REFERENCES org_periode(id) ON DELETE CASCADE,
  bidang_id INTEGER REFERENCES org_bidang(id) ON DELETE SET NULL, parent_id INTEGER REFERENCES org_pengurus(id) ON DELETE SET NULL,
  jamaah_id INTEGER REFERENCES jamaah(id) ON DELETE SET NULL,
  nama TEXT NOT NULL, jabatan TEXT NOT NULL DEFAULT '', telepon TEXT NOT NULL DEFAULT '', alamat TEXT NOT NULL DEFAULT '',
  foto TEXT NOT NULL DEFAULT '', aktif INTEGER NOT NULL DEFAULT 1, urutan INTEGER NOT NULL DEFAULT 0, keterangan TEXT NOT NULL DEFAULT '');

CREATE TABLE IF NOT EXISTS dokumen_draft (
  id INTEGER PRIMARY KEY AUTOINCREMENT, template_id INTEGER, template_nama TEXT NOT NULL DEFAULT '', judul TEXT NOT NULL DEFAULT '',
  tanggal TEXT NOT NULL DEFAULT '', nomor TEXT NOT NULL DEFAULT '', data TEXT NOT NULL DEFAULT '{}', surat_keluar_id INTEGER,
  dibuat_oleh TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime')));

CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT '');

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE COLLATE NOCASE, nama TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'sekretaris', aktif INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')));

CREATE TABLE IF NOT EXISTS kas_kategori (id INTEGER PRIMARY KEY AUTOINCREMENT, nama TEXT NOT NULL, jenis TEXT NOT NULL DEFAULT 'masuk', aktif INTEGER NOT NULL DEFAULT 1);

CREATE TABLE IF NOT EXISTS kas_transaksi (
  id INTEGER PRIMARY KEY AUTOINCREMENT, tanggal TEXT NOT NULL, jenis TEXT NOT NULL, kategori_id INTEGER REFERENCES kas_kategori(id) ON DELETE SET NULL,
  keterangan TEXT NOT NULL DEFAULT '', pihak TEXT NOT NULL DEFAULT '', jumlah REAL NOT NULL DEFAULT 0, dibuat_oleh TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')));

CREATE TABLE IF NOT EXISTS zakat_masuk (
  id INTEGER PRIMARY KEY AUTOINCREMENT, tanggal TEXT NOT NULL, nama TEXT NOT NULL, alamat TEXT NOT NULL DEFAULT '',
  jenis TEXT NOT NULL DEFAULT 'fitrah', bentuk TEXT NOT NULL DEFAULT 'uang', jumlah REAL NOT NULL DEFAULT 0, jiwa INTEGER NOT NULL DEFAULT 1,
  amil TEXT NOT NULL DEFAULT '', keterangan TEXT NOT NULL DEFAULT '');

CREATE TABLE IF NOT EXISTS mustahik (
  id INTEGER PRIMARY KEY AUTOINCREMENT, nama TEXT NOT NULL, alamat TEXT NOT NULL DEFAULT '', asnaf TEXT NOT NULL DEFAULT 'fakir',
  telepon TEXT NOT NULL DEFAULT '', jiwa INTEGER NOT NULL DEFAULT 1, keterangan TEXT NOT NULL DEFAULT '');

CREATE TABLE IF NOT EXISTS penyaluran (
  id INTEGER PRIMARY KEY AUTOINCREMENT, tanggal TEXT NOT NULL, mustahik_id INTEGER REFERENCES mustahik(id) ON DELETE SET NULL,
  jenis TEXT NOT NULL DEFAULT 'fitrah', bentuk TEXT NOT NULL DEFAULT 'uang', jumlah REAL NOT NULL DEFAULT 0, keterangan TEXT NOT NULL DEFAULT '');

CREATE TABLE IF NOT EXISTS qurban_kelompok (id INTEGER PRIMARY KEY AUTOINCREMENT, tahun INTEGER NOT NULL, jenis TEXT NOT NULL, nama TEXT NOT NULL, keterangan TEXT NOT NULL DEFAULT '');

CREATE TABLE IF NOT EXISTS qurban_peserta (
  id INTEGER PRIMARY KEY AUTOINCREMENT, tahun INTEGER NOT NULL, nama TEXT NOT NULL, alamat TEXT NOT NULL DEFAULT '', telepon TEXT NOT NULL DEFAULT '',
  jenis TEXT NOT NULL DEFAULT 'kambing', kelompok_id INTEGER REFERENCES qurban_kelompok(id) ON DELETE SET NULL,
  biaya REAL NOT NULL DEFAULT 0, lunas INTEGER NOT NULL DEFAULT 0, atas_nama TEXT NOT NULL DEFAULT '', keterangan TEXT NOT NULL DEFAULT '');

CREATE TABLE IF NOT EXISTS petugas_jadwal (
  id INTEGER PRIMARY KEY AUTOINCREMENT, tanggal TEXT NOT NULL, kegiatan TEXT NOT NULL DEFAULT '', peran TEXT NOT NULL DEFAULT '',
  nama TEXT NOT NULL DEFAULT '', tema TEXT NOT NULL DEFAULT '', keterangan TEXT NOT NULL DEFAULT '');

CREATE TABLE IF NOT EXISTS jamaah (
  id INTEGER PRIMARY KEY AUTOINCREMENT, nama TEXT NOT NULL, kategori TEXT NOT NULL DEFAULT 'Jamaah', jenis_kelamin TEXT NOT NULL DEFAULT '',
  alamat TEXT NOT NULL DEFAULT '', telepon TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', donatur_tetap INTEGER NOT NULL DEFAULT 0,
  nominal_rutin REAL NOT NULL DEFAULT 0, keterangan TEXT NOT NULL DEFAULT '');

CREATE TABLE IF NOT EXISTS inventaris (
  id INTEGER PRIMARY KEY AUTOINCREMENT, kode TEXT NOT NULL DEFAULT '', nama TEXT NOT NULL, kategori TEXT NOT NULL DEFAULT '',
  jumlah INTEGER NOT NULL DEFAULT 1, satuan TEXT NOT NULL DEFAULT 'unit', kondisi TEXT NOT NULL DEFAULT 'Baik', lokasi TEXT NOT NULL DEFAULT '',
  tanggal_perolehan TEXT NOT NULL DEFAULT '', sumber TEXT NOT NULL DEFAULT '', nilai REAL NOT NULL DEFAULT 0, keterangan TEXT NOT NULL DEFAULT '');

CREATE TABLE IF NOT EXISTS peminjaman (
  id INTEGER PRIMARY KEY AUTOINCREMENT, inventaris_id INTEGER REFERENCES inventaris(id) ON DELETE CASCADE, peminjam TEXT NOT NULL,
  telepon TEXT NOT NULL DEFAULT '', jumlah INTEGER NOT NULL DEFAULT 1, tgl_pinjam TEXT NOT NULL, tgl_rencana_kembali TEXT NOT NULL DEFAULT '',
  tgl_kembali TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'dipinjam', keterangan TEXT NOT NULL DEFAULT '');

CREATE TABLE IF NOT EXISTS surat_template (
  id INTEGER PRIMARY KEY AUTOINCREMENT, kode TEXT NOT NULL UNIQUE, nama TEXT NOT NULL, kategori TEXT NOT NULL DEFAULT 'Umum',
  kode_surat TEXT NOT NULL DEFAULT '', definisi TEXT NOT NULL, builtin INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now','localtime')));

CREATE TABLE IF NOT EXISTS surat_counter (tahun INTEGER PRIMARY KEY, terakhir INTEGER NOT NULL DEFAULT 0);

CREATE TABLE IF NOT EXISTS surat_keluar (
  id INTEGER PRIMARY KEY AUTOINCREMENT, template_id INTEGER, template_nama TEXT NOT NULL DEFAULT '', nomor TEXT NOT NULL DEFAULT '',
  nomor_urut INTEGER NOT NULL DEFAULT 0, tahun INTEGER NOT NULL DEFAULT 0, tanggal TEXT NOT NULL, perihal TEXT NOT NULL DEFAULT '',
  tujuan TEXT NOT NULL DEFAULT '', data TEXT NOT NULL DEFAULT '{}', file_pdf TEXT NOT NULL DEFAULT '', file_docx TEXT NOT NULL DEFAULT '',
  dibuat_oleh TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')));

CREATE TABLE IF NOT EXISTS surat_masuk (
  id INTEGER PRIMARY KEY AUTOINCREMENT, nomor TEXT NOT NULL DEFAULT '', tanggal_surat TEXT NOT NULL DEFAULT '', tanggal_terima TEXT NOT NULL DEFAULT '',
  pengirim TEXT NOT NULL DEFAULT '', perihal TEXT NOT NULL DEFAULT '', sifat TEXT NOT NULL DEFAULT 'Biasa', disposisi TEXT NOT NULL DEFAULT '',
  keterangan TEXT NOT NULL DEFAULT '', lampiran TEXT NOT NULL DEFAULT '');

CREATE TABLE IF NOT EXISTS pengumuman (
  id INTEGER PRIMARY KEY AUTOINCREMENT, tanggal TEXT NOT NULL, judul TEXT NOT NULL, isi TEXT NOT NULL DEFAULT '',
  gambar TEXT NOT NULL DEFAULT '', tampil_sampai TEXT NOT NULL DEFAULT '', aktif INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')));

CREATE TABLE IF NOT EXISTS kas_akun (
  id INTEGER PRIMARY KEY AUTOINCREMENT, nama TEXT NOT NULL UNIQUE COLLATE NOCASE, keterangan TEXT NOT NULL DEFAULT '',
  saldo_awal REAL NOT NULL DEFAULT 0, urutan INTEGER NOT NULL DEFAULT 0, aktif INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')));

-- Views
CREATE VIEW IF NOT EXISTS v_bidang AS SELECT b.*, COALESCE(p.nama,'') AS parent_nama,
  (SELECT COUNT(*) FROM org_pengurus g JOIN org_periode o ON o.id=g.periode_id WHERE g.bidang_id=b.id AND o.aktif=1) AS jumlah_pengurus
  FROM org_bidang b LEFT JOIN org_bidang p ON p.id=b.parent_id;

CREATE VIEW IF NOT EXISTS v_pengurus AS SELECT g.*, COALESCE(b.nama,'') AS bidang_nama, COALESCE(b.urutan,9999) AS bidang_urutan,
  COALESCE(a.nama,'') AS parent_nama, COALESCE(j.nama,'') AS jamaah_nama, COALESCE(o.nama,'') AS periode_nama
  FROM org_pengurus g LEFT JOIN org_bidang b ON b.id=g.bidang_id LEFT JOIN org_pengurus a ON a.id=g.parent_id
  LEFT JOIN jamaah j ON j.id=g.jamaah_id LEFT JOIN org_periode o ON o.id=g.periode_id;

CREATE VIEW IF NOT EXISTS v_kas AS SELECT t.*, COALESCE(k.nama,'(tanpa kategori)') AS kategori_nama FROM kas_transaksi t LEFT JOIN kas_kategori k ON k.id=t.kategori_id;

CREATE VIEW IF NOT EXISTS v_penyaluran AS SELECT p.*, COALESCE(m.nama,'-') AS mustahik_nama, COALESCE(m.asnaf,'') AS asnaf FROM penyaluran p LEFT JOIN mustahik m ON m.id=p.mustahik_id;

CREATE VIEW IF NOT EXISTS v_qurban AS SELECT q.*, COALESCE(k.nama,'') AS kelompok_nama FROM qurban_peserta q LEFT JOIN qurban_kelompok k ON k.id=q.kelompok_id;

CREATE VIEW IF NOT EXISTS v_qurban_kelompok AS SELECT k.*, (SELECT COUNT(*) FROM qurban_peserta q WHERE q.kelompok_id=k.id) AS jumlah_peserta FROM qurban_kelompok k;

CREATE VIEW IF NOT EXISTS v_inventaris AS SELECT i.*, COALESCE((SELECT SUM(p.jumlah) FROM peminjaman p WHERE p.inventaris_id=i.id AND p.status='dipinjam'),0) AS dipinjam FROM inventaris i;

CREATE VIEW IF NOT EXISTS v_peminjaman AS SELECT p.*, COALESCE(i.nama,'-') AS barang_nama, COALESCE(i.kode,'') AS barang_kode FROM peminjaman p LEFT JOIN inventaris i ON i.id=p.inventaris_id;

-- Versi view kas dengan akun (ditemukan juga di binary, tanpa IF NOT EXISTS):
-- CREATE VIEW v_kas_kategori AS SELECT k.*, COALESCE(a.nama,'Semua kas') AS akun_nama FROM kas_kategori k LEFT JOIN kas_akun a ON a.id=k.akun_id;
-- CREATE VIEW v_kas_akun AS SELECT a.*, (SELECT COUNT(*) FROM kas_transaksi t WHERE t.akun_id=a.id) AS jumlah_transaksi,
--   a.saldo_awal + COALESCE((SELECT SUM(CASE WHEN jenis='masuk' THEN jumlah ELSE -jumlah END) FROM kas_transaksi t WHERE t.akun_id=a.id),0) AS saldo FROM kas_akun a;
