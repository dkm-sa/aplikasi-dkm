import { cekKunci, setData } from './_store.js'

export const config = { api: { bodyParser: { sizeLimit: '4mb' } } }

// POST { key, data?, ping? }
// - Kunci pertama yang dipakai akan "mengklaim" web ini (disimpan sebagai hash).
// - Env PUBLISH_KEY (opsional) selalu diterima, untuk memulihkan bila kunci aplikasi hilang.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Gunakan POST' })
  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
  try {
    const salah = await cekKunci(body?.key, true)
    if (salah) return res.status(salah.startsWith('Kunci') ? 400 : 403).json({ error: salah })
    if (body.ping) return res.status(200).json({ ok: true, terhubung: true })
    if (!body.data || typeof body.data !== 'object') return res.status(400).json({ error: 'Data kosong' })
    const data = { ...body.data, diperbarui: new Date().toISOString() }
    await setData(data)
    return res.status(200).json({ ok: true, diperbarui: data.diperbarui })
  } catch (e) {
    return res.status(500).json({ error: 'Gagal menyimpan: ' + (e?.message || e) })
  }
}
