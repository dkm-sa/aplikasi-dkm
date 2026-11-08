import { cekKunci, getDok, setDok, putPDF, delBlob } from './_store.js'

export const config = { api: { bodyParser: false } }

const MAKS = 4.3 * 1024 * 1024

async function bacaBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body
  const parts = []
  let n = 0
  for await (const c of req) {
    n += c.length
    if (n > MAKS) throw Object.assign(new Error('File PDF terlalu besar (maks. 4 MB)'), { code: 413 })
    parts.push(c)
  }
  return Buffer.concat(parts)
}

const hdr = (req, k) => { try { return decodeURIComponent(String(req.headers[k] || '')) } catch { return String(req.headers[k] || '') } }

// GET → daftar dokumen; POST (body = PDF) → unggah; DELETE ?id= → hapus.
// Header: x-key, x-id, x-judul, x-tanggal, x-ringkasan, x-jenis (semua URL-encoded).
export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'public, s-maxage=60')
      return res.status(200).json(await getDok())
    }
    const salah = await cekKunci(req.headers['x-key'])
    if (salah) return res.status(403).json({ error: salah })
    if (req.method === 'DELETE') {
      const id = String((req.query && req.query.id) || '')
      const list = await getDok()
      const d = list.find((x) => x.id === id)
      if (d) { try { await delBlob(d.url) } catch {} }
      await setDok(list.filter((x) => x.id !== id))
      return res.status(200).json({ ok: true })
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Metode tidak diizinkan' })
    // POST: body = file PDF
    // RECONSTRUCTED - remainder inferred from the header comment and _store.js; verify by uploading a PDF from the desktop app
    const buf = await bacaBody(req)
    const id = hdr(req, 'x-id') || ('d' + Date.now().toString(36))
    const entry = {
      id,
      judul: hdr(req, 'x-judul'),
      tanggal: hdr(req, 'x-tanggal'),
      ringkasan: hdr(req, 'x-ringkasan'),
      jenis: hdr(req, 'x-jenis'),
      url: (await putPDF('dkm/dokumen/' + id + '.pdf', buf)).url,
      ukuran: buf.length,
    }
    const list = await getDok()
    const lama = list.find((x) => x.id === id)
    if (lama) { try { await delBlob(lama.url) } catch {} }
    await setDok([...list.filter((x) => x.id !== id), entry])
    return res.status(200).json({ ok: true, dokumen: entry })
  } catch (e) {
    return res.status(e.code || 500).json({ error: e.message || 'Gagal mengunggah dokumen' })
  }
}
