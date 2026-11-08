# web-dkm — Informasi DKM (situs web publik)

Situs web publik untuk AplikasiDKM: menampilkan informasi masjid (pengumuman,
jadwal petugas, laporan kas, ZIS & qurban, laporan kegiatan/PDF, dan susunan
pengurus) yang dipublikasikan dari aplikasi desktop AplikasiDKM.

- **Stack:** Node.js ≥ 20, vanilla JS (tanpa framework/build step),
  `@vercel/blob` untuk penyimpanan, deploy di Vercel.
- **Endpoint API:**
  - `GET /api/data` — data publik yang dipublikasikan (digabung dari Blob).
  - `POST /api/publish` — aplikasi desktop mengirim data baru; kunci publikasi
    pertama yang dipakai akan "mengklaim" web ini (disimpan sebagai hash).
    Env `PUBLISH_KEY` (opsional) selalu diterima, untuk memulihkan bila kunci
    aplikasi hilang.
  - `GET /api/dokumen`, `POST /api/dokumen` (body = PDF), `DELETE /api/dokumen?id=`
    — daftar/unggah/hapus dokumen PDF laporan kegiatan.
- **Penyimpanan (Vercel Blob, path):**
  - `dkm/data.json` — data publik terakhir
  - `dkm/config.json` — hash kunci publikasi
  - `dkm/dokumen.json` — daftar dokumen
  - `dkm/dokumen/*.pdf` — berkas PDF laporan

## Asal file & status pemulihan

Sumber dipulihkan dari deployment Vercel `dpl_Fh3skHFQMueoVWUJuq7iTwBgHR33`
(proyek `dkm-sa`). Tool Vercel hanya mengembalikan ~1500 byte pertama dari
tiap file, dan teks yang disajikan situs live mengubah HTML di dalam template
literal JS menjadi Markdown — jadi sebagian file hanya bisa direkonstruksi,
bukan byte-perfect. Status tiap file:

| File | Status |
| --- | --- |
| `src/api/data.js` | Byte-perfect (502 B) |
| `src/api/publish.js` | Byte-perfect (1183 B) |
| `src/api/_store.js` | Direkonstruksi — 1500 byte pertama byte-perfect (terverifikasi terhadap file deployment); sisanya (`cekKunci`) disimpulkan dari `publish.js` dan komentar di file. Verifikasi dengan mem-publish dari aplikasi desktop. |
| `src/api/dokumen.js` | Direkonstruksi — 1500 byte pertama byte-perfect (terverifikasi terhadap file deployment); sisanya (handler POST) disimpulkan dari komentar header dan `_store.js`. Verifikasi dengan mengunggah PDF dari aplikasi desktop. |
| `src/package.json` | Byte-perfect (144 B) |
| `src/public/index.html` | Byte-perfect (1184 B) |
| `src/public/app.js` | Direkonstruksi — 1500 byte pertama byte-perfect (terverifikasi terhadap file deployment); sisanya direkonstruksi dari teks live situs. `node --check` lolos; smoke test (semua tab + keseimbangan tag HTML) lolos. |
| `src/public/style.css` | Direkonstruksi — 1500 byte pertama terverifikasi byte-identik dengan file deployment; sisanya ditranskripsi dari file live dengan transformasi yang sama (newline → `", "` pada teks live). |
| `src/public/privacy.html` | Direkonstruksi — doctype/head/metadata sesuai file deployment; isi dibuat ulang dari teks halaman live, dengan gaya visual yang sama seperti `index.html`. |
| `src/vercel.json` | Byte-perfect (163 B) |

## Penting: data live TIDAK ada di repo ini

Isi Vercel Blob (`dkm/data.json`, `dkm/config.json`, `dkm/dokumen.json`,
dan PDF) adalah data live dan **tidak** ikut di-commit. Deploy ulang dari repo
ini saja tidak akan mengubah data yang tampil di situs — data hanya berubah
ketika aplikasi desktop mem-publish ulang atau dokumen diunggah/dihapus.
Jangan pernah me-commit kunci publikasi atau token apa pun ke repo ini;
satu-satunya yang berhubungan dengan kunci di sini hanyalah nama env var
`PUBLISH_KEY`.

## Deploy

Dari folder `web/`:

```bash
vercel deploy --prod
```

Atau hubungkan proyek Vercel `dkm-sa` ke repo ini (GitHub
`dkm-sa/aplikasi-dkm`, folder `web/`) agar setiap push ke `main` otomatis
ter-deploy. Sebelum menghubungkan, pastikan tidak ada deployment CLI lama
yang akan tertimpa secara tak sengaja.

## Pengembangan lokal

```bash
npm install
vercel dev
```

Butuh env `BLOB_READ_WRITE_TOKEN` (dari dashboard Vercel → Storage) untuk
menjalankan API secara lokal; tanpa itu endpoint akan gagal saat mengakses Blob.
