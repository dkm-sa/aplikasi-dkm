import { put, list, del } from '@vercel/blob'
import crypto from 'node:crypto'

const DATA = 'dkm/data.json'
const CONF = 'dkm/config.json'
const DOK = 'dkm/dokumen.json'

async function readJSON(path) {
  const { blobs } = await list({ prefix: path, limit: 5 })
  const b = blobs.find((x) => x.pathname === path)
  if (!b) return null
  const r = await fetch(b.url + '?t=' + Date.now(), { cache: 'no-store' })
  if (!r.ok) return null
  return r.json()
}

async function writeJSON(path, obj, maxAge = 60) {
  return put(path, JSON.stringify(obj), {
    access: 'public', addRandomSuffix: false, allowOverwrite: true,
    contentType: 'application/json', cacheControlMaxAge: maxAge,
  })
}

export const sha = (s) => crypto.createHash('sha256').update(String(s)).digest('hex')
export const getData = () => readJSON(DATA)
export const setData = (d) => writeJSON(DATA, d)
export const getConf = () => readJSON(CONF)
export const setConf = (c) => writeJSON(CONF, c)
export const getDok = async () => (await readJSON(DOK)) || []
export const setDok = (d) => writeJSON(DOK, d)
export const putPDF = (path, buf) => put(path, buf, { access: 'public', addRandomSuffix: true, contentType: 'application/pdf', cacheControlMaxAge: 3600 })
export const delBlob = (url) => del(url)

// Memeriksa kunci publikasi. Mengembalikan null bila sah, atau pesan galat.
export async function cekKunci(key, bolehKlaim = false) {
  key = String(key || '')
  if (key.length < 24) return 'Kunci publikasi tidak valid'
  const conf = await getConf()
  // RECONSTRUCTED - remainder inferred from publish.js and the partial; verify by publishing from the desktop app
  const kunci = sha(key)
  if (process.env.PUBLISH_KEY && kunci === sha(process.env.PUBLISH_KEY)) return null
  if (!conf || !conf.kunciHash) {
    if (!bolehKlaim) return 'Web belum diklaim'
    await setConf({ kunciHash: kunci })
    return null
  }
  if (kunci === conf.kunciHash) return null
  return 'Kunci publikasi salah'
}
