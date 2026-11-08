import { getData, getDok } from './_store.js'

export default async function handler(req, res) {
  try {
    const [d, dok] = await Promise.all([getData(), getDok().catch(() => [])])
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    if (!d) return res.status(200).json(dok.length ? { dokumen: dok } : { kosong: true })
    return res.status(200).json({ ...d, dokumen: dok })
  } catch (e) {
    return res.status(500).json({ error: 'Gagal membaca data' })
  }
}
