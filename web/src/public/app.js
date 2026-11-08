(function () {
  'use strict'
  const $ = (s) => document.querySelector(s)
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
  const rp = (n) => 'Rp ' + Math.round(Number(n) || 0).toLocaleString('id-ID')
  const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const BLN_P = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const tgl = (s) => { if (!s) return ''; const [y, m, d] = s.slice(0, 10).split('-').map(Number); return d + ' ' + BLN_P[m - 1] + ' ' + y }
  const hariTgl = (s) => { const [y, m, d] = s.slice(0, 10).split('-').map(Number); return HARI[new Date(y, m - 1, d).getDay()] + ', ' + tgl(s) }
  const bulanLabel = (ym) => { const [y, m] = ym.split('-').map(Number); return BLN_P[m - 1] + ' ' + y }
  const safeImg = (u) => (typeof u === 'string' && /^(data:image\/(png|jpe?g|gif|webp);base64,|https:\/\/)/.test(u) ? u : '')

  let D = null
  let tab = (location.hash || '#beranda').slice(1)

  const TABS = [
    ['beranda', 'Beranda', () => true],
    ['jadwal', 'Jadwal Petugas', () => D.jadwal && D.jadwal.length],
    ['kas', 'Laporan Kas', () => D.kas && D.kas.akun && D.kas.akun.length],
    ['zis', 'ZIS & Qurban', () => D.zis || D.qurban],
    ['laporan', 'Laporan Kegiatan', () => D.dokumen && D.dokumen.length],
    ['pengurus', 'Pengurus', () => D.pengurus && D.pengurus.length],
  ]

  // RECONSTRUCTED — everything below this line is a faithful reconstruction
  // from the live-served text of this file (dkm-sa.vercel.app/app.js). The
  // first 1500 bytes above are byte-identical to the Vercel deployment file;
  // the remainder reproduces the same logic and rendered output, but the
  // exact original HTML inside template literals could not be recovered
  // byte-perfect, because the live text fetch converts that HTML to Markdown.
  // Verify by loading the site and comparing the rendered pages.
  function header() {
    const o = D.org || {}
    document.title = o.nama ? o.nama + ' – Informasi Jamaah' : 'Informasi DKM'
    $('#nama').textContent = o.nama || 'Informasi DKM'
    $('#jenis').textContent = o.jenis || 'Dewan Kemakmuran Masjid'
    $('#alamat').textContent = [o.alamat, o.kota].filter(Boolean).join(', ')
    const lg = safeImg(o.logo)
    if (lg) { $('#logo').src = lg; $('#logo').hidden = false }
    const k = []
    if (o.telepon) k.push(`<a href="tel:${esc(String(o.telepon).replace(/[^0-9+]/g, ''))}">Telp. ${esc(String(o.telepon).trim().replace(/^[^0-9+]+/, ''))}</a>`)
    if (o.email) k.push(`<a href="mailto:${esc(o.email)}">${esc(o.email)}</a>`)
    const atas = []
    if (o.telepon) {
      const t = String(o.telepon).trim().replace(/^[^0-9+]+/, ''), d = t.replace(/[^0-9+]/g, '')
      let wa = d.replace(/^\+/, ''); if (wa.startsWith('0')) wa = '62' + wa.slice(1)
      atas.push(`☎ ${esc(t)}`)
      if (wa.length >= 9) atas.push(`<a href="https://wa.me/${wa}">WhatsApp</a>`)
    }
    if (o.email) atas.push(`✉ ${esc(o.email)}`)
    $('#kontakAtas').innerHTML = atas.join('')
    $('#kontakAtas').hidden = !atas.length
    $('#kontak').innerHTML = `<strong>${esc(o.nama || '')}</strong>` + (k.length ? `<br>${k.join(' · ')}` : '')
    if (D.diperbarui) $('#diperbarui').textContent = 'Data diperbarui ' + new Date(D.diperbarui).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })
  }

  function tabs() {
    const vis = TABS.filter((t) => t[2]())
    if (!vis.find((t) => t[0] === tab)) tab = 'beranda'
    $('#tabs').innerHTML = vis.map((t) => `<button data-t="${t[0]}" class="${t[0] === tab ? 'on' : ''}">${t[1]}</button>`).join('')
    $('#tabs').querySelectorAll('button').forEach((b) => b.onclick = () => { tab = b.dataset.t; location.hash = tab; render() })
  }

  function pengumumanHTML(list) {
    if (!list || !list.length) return ''
    return '<div class="kartu"><h2>Pengumuman</h2>' + list.map((p) => {
      const img = safeImg(p.gambar)
      return `<div class="pengumuman"><h3>${esc(p.judul)}</h3><div class="tgl">${esc(tgl(p.tanggal))}</div><p>${esc(p.isi)}</p>${img ? `<img src="${img}" alt="">` : ''}</div>`
    }).join('') + '</div>'
  }

  function jadwalHTML(rows, limitHari) {
    if (!rows || !rows.length) return '<div class="kartu"><p class="muted">Belum ada jadwal.</p></div>'
    const g = {}
    rows.forEach((r) => { (g[r.tanggal] = g[r.tanggal] || []).push(r) })
    let keys = Object.keys(g).sort()
    if (limitHari) keys = keys.slice(0, limitHari)
    return '<div class="kartu">' + keys.map((k) => {
      const byKeg = {}
      g[k].forEach((r) => { (byKeg[r.kegiatan || 'Kegiatan'] = byKeg[r.kegiatan || 'Kegiatan'] || []).push(r) })
      return `<div class="hari">${esc(hariTgl(k))}</div>` + Object.keys(byKeg).map((kg) =>
        `<div><strong>${esc(kg)}</strong>` + byKeg[kg].map((r) =>
          `<div class="petugas"><span>${esc(r.peran || '-')}</span><span><strong>${esc(r.nama)}</strong>${r.tema ? ` <span class="muted">${esc(r.tema)}</span>` : ''}</span></div>`
        ).join('') + '</div>').join('')
    }).join('') + '</div>'
  }

  function kasRingkasHTML() {
    const k = D.kas
    if (!k || !k.akun) return ''
    return '<div class="grid">' + k.akun.map((a) =>
      `<div class="kartu stat"><div class="lbl">${esc(a.nama)}</div><div class="val">${rp(a.saldo)}</div><div class="small muted">▲ ${rp(a.masuk_bulan_ini)} · ▼ ${rp(a.keluar_bulan_ini)} bulan ini</div></div>`
    ).join('') + '</div>'
  }

  function beranda() {
    let h = pengumumanHTML(D.pengumuman)
    if (D.kas && D.kas.akun && D.kas.akun.length) {
      h += '<div class="kartu"><h2>Saldo Kas</h2>' + (D.kas.total != null && D.kas.akun.length > 1 ? `<div class="stat"><div class="lbl">Total seluruh kas</div><div class="val">${rp(D.kas.total)}</div></div>` : '') + kasRingkasHTML() + '</div>'
    }
    if (D.jadwal && D.jadwal.length) h += '<div class="kartu"><h2>Jadwal Terdekat</h2>' + jadwalHTML(D.jadwal, 3) + '</div>'
    if (D.dokumen && D.dokumen.length) h += '<div class="kartu"><h2>Laporan Terbaru</h2>' + dokumenHTML(D.dokumen.slice(0, 2)) + (D.dokumen.length > 2 ? '<p><a href="#laporan">Lihat semua laporan →</a></p>' : '') + '</div>'
    if (!h) h = '<div class="kartu"><p class="muted center pad">Belum ada informasi yang dipublikasikan.</p></div>'
    return h
  }

  let kasAkun = 'all', kasBulan = '', kasCari = ''
  function kas() {
    const k = D.kas
    let h = '<div class="kartu"><h2>Laporan Kas</h2>' + kasRingkasHTML()
    // grafik bulanan
    const tren = (kasAkun === 'all' ? k.tren : (k.akun.find((a) => String(a.id) === kasAkun) || {}).tren) || []
    if (tren.length) {
      const mx = Math.max(1, ...tren.map((t) => Math.max(t.masuk, t.keluar)))
      h += '<div class="kartu"><strong>Pemasukan & pengeluaran per bulan</strong><div class="legend"><span><i style="background:var(--hijau2)"></i>Masuk</span><span><i style="background:#e08a84"></i>Keluar</span></div><div class="bars">' +
        tren.map((t) => { const [, m] = t.bulan.split('-').map(Number); return `<div class="bar"><div class="pair"><div class="m" style="height:${Math.round(t.masuk / mx * 120)}px"></div><div class="k" style="height:${Math.round(t.keluar / mx * 120)}px"></div></div><div class="b">${BLN[m - 1]}</div></div>` }).join('') + '</div></div>'
    }
    const semua = k.rincian || []
    if (semua.length || k.rincian_lengkap) {
      const akunSel = kasAkun === 'all' ? k.akun : k.akun.filter((a) => String(a.id) === kasAkun)
      const multi = k.akun.length > 1
      let saldo = akunSel.reduce((s, a) => s + (Number(a.saldo_awal) || 0), 0)
      const saldoAwalKas = saldo
      // saldo berjalan dihitung dari transaksi paling awal
      const rows = semua.filter((r) => kasAkun === 'all' || String(r.akun_id) === kasAkun).map((r) => {
        saldo += r.jenis === 'masuk' ? r.jumlah : -r.jumlah
        return Object.assign({ saldo }, r)
      })
      // rekap per bulan
      const rek = []
      let run = saldoAwalKas
      rows.forEach((r) => {
        const ym = r.tanggal.slice(0, 7)
        let x = rek[rek.length - 1]
        if (!x || x.bulan !== ym) { x = { bulan: ym, awal: run, masuk: 0, keluar: 0 }; rek.push(x) }
        if (r.jenis === 'masuk') x.masuk += r.jumlah; else x.keluar += r.jumlah
        run = r.saldo; x.akhir = run
      })
      const bulanList = rek.map((x) => x.bulan).reverse()
      if (kasBulan && kasBulan !== 'semua' && !bulanList.includes(kasBulan)) kasBulan = ''
      if (!kasBulan) kasBulan = bulanList[0] || 'semua'
      h += '<div class="kartu">' + (multi ? `<div class="toolbar"><select id="selAkun"><option value="all">Semua kas</option>${k.akun.map((a) => `<option value="${a.id}"${String(a.id) === kasAkun ? ' selected' : ''}>${esc(a.nama)}</option>`).join('')}</select></div>` : '')
      if (rek.length) {
        const tm = rek.reduce((s, x) => s + x.masuk, 0), tk = rek.reduce((s, x) => s + x.keluar, 0)
        h += '<h2>Alur Kas per Bulan</h2><p class="muted small">' + (k.rincian_lengkap ? 'Sejak ' + bulanLabel(rek[0].bulan) + ', saldo awal ' + rp(saldoAwalKas) + '. ' : '') + 'Klik salah satu bulan untuk melihat rinciannya.</p>' +
          '<div class="scroll"><table class="rekap"><thead><tr><th>Bulan</th><th class="n">Saldo awal</th><th class="n">Masuk</th><th class="n">Keluar</th><th class="n">Saldo akhir</th></tr></thead><tbody>' +
          rek.slice().reverse().map((x) => `<tr class="klik${x.bulan === kasBulan ? ' on' : ''}" data-b="${x.bulan}"><td>${esc(bulanLabel(x.bulan))}</td><td class="n">${rp(x.awal)}</td><td class="n">${rp(x.masuk)}</td><td class="n">${rp(x.keluar)}</td><td class="n"><strong>${rp(x.akhir)}</strong></td></tr>`).join('') +
          '</tbody><tfoot><tr><th>Total</th><th class="n">' + rp(saldoAwalKas) + '</th><th class="n">' + rp(tm) + '</th><th class="n">' + rp(tk) + '</th><th class="n">' + rp(run) + '</th></tr></tfoot></table></div>'
      }
      const q = kasCari.trim().toLowerCase()
      let f = kasBulan === 'semua' ? rows : rows.filter((r) => r.tanggal.slice(0, 7) === kasBulan)
      const per = rek.find((x) => x.bulan === kasBulan)
      const awalPer = kasBulan === 'semua' ? saldoAwalKas : (per ? per.awal : 0)
      const akhirPer = kasBulan === 'semua' ? run : (per ? per.akhir : 0)
      if (q) f = f.filter((r) => (r.keterangan + ' ' + r.kategori + ' ' + r.akun).toLowerCase().includes(q))
      const tm = f.reduce((s, r) => s + (r.jenis === 'masuk' ? r.jumlah : 0), 0)
      const tk = f.reduce((s, r) => s + (r.jenis === 'keluar' ? r.jumlah : 0), 0)
      h += '<h2>Rincian Transaksi</h2>' +
        `<div class="toolbar"><select id="selBulan"><option value="semua">Semua bulan</option>${bulanList.map((b) => `<option value="${b}"${b === kasBulan ? ' selected' : ''}>${bulanLabel(b)}</option>`).join('')}</select><input type="search" id="cari" placeholder="Cari transaksi..." value="${esc(kasCari)}"></div>` +
        '<p class="muted small">Masuk ' + rp(tm) + ' · Keluar ' + rp(tk) + '</p>' +
        '<div class="scroll" id="rincian"><table class="rincian"><thead><tr><th>Tanggal</th><th>Keterangan</th><th class="n">Jumlah</th><th class="n">Saldo</th></tr></thead><tbody>' +
        '<tr class="saldo-row"><td></td><td><strong>Saldo awal</strong></td><td></td><td class="n"><strong>' + rp(awalPer) + '</strong></td></tr>' +
        (f.length ? f.map((r) => '<tr><td class="nowrap">' + esc(r.tanggal.slice(8, 10) + '/' + r.tanggal.slice(5, 7) + '/' + r.tanggal.slice(2, 4)) + '</td><td>' + esc(r.keterangan || '-') + '<br>' + esc(r.kategori) + (multi && kasAkun === 'all' ? ' · ' + esc(r.akun) : '') + '</td><td class="n ' + (r.jenis === 'masuk' ? 'masuk' : 'keluar') + '">' + (r.jenis === 'masuk' ? '+' : '−') + rp(r.jumlah).slice(3) + '</td><td class="n">' + rp(r.saldo) + '</td></tr>').join('') : '<tr><td colspan="4" class="muted center">Tidak ada transaksi.</td></tr>') +
        '<tr class="saldo-row"><td></td><td><strong>Saldo akhir</strong></td><td></td><td class="n"><strong>' + rp(akhirPer) + '</strong></td></tr>' +
        '</tbody></table></div>'
      h += '</div>'
    }
    h += '</div>'
    return h
  }

  function zis() {
    let h = ''
    const z = D.zis
    if (z) {
      h += '<div class="kartu"><h2>Zakat, Infak & Sedekah ' + esc(z.tahun || '') + '</h2>'
      const m = z.masuk || []
      if (m.length) h += '<div class="scroll"><table><thead><tr><th>Penerimaan</th><th>Bentuk</th><th class="n">Jumlah</th><th class="n">Jiwa</th></tr></thead><tbody>' +
        m.map((r) => '<tr><td>' + esc(r.jenis) + '</td><td>' + esc(r.bentuk) + '</td><td class="n">' + (r.bentuk === 'uang' ? rp(r.total) : (Number(r.total) || 0).toLocaleString('id-ID') + ' kg') + '</td><td class="n">' + esc(r.jiwa) + '</td></tr>').join('') + '</tbody></table></div>'
      const p = z.salur || []
      if (p.length) h += '<div class="scroll"><table><thead><tr><th>Penyaluran</th><th>Bentuk</th><th class="n">Jumlah</th></tr></thead><tbody>' +
        p.map((r) => '<tr><td>' + esc(r.jenis || r.asnaf || '') + '</td><td>' + esc(r.bentuk || '') + '</td><td class="n">' + (r.bentuk === 'uang' ? rp(r.total) : (Number(r.total) || 0).toLocaleString('id-ID') + ' kg') + '</td></tr>').join('') + '</tbody></table></div>'
      if (!m.length && !p.length) h += '<p class="muted">Belum ada data tahun ini.</p>'
      h += '</div>'
    }
    const q = D.qurban
    if (q && q.jenis && q.jenis.length) {
      h += '<div class="kartu"><h2>Qurban ' + esc(q.tahun || '') + '</h2>' + q.jenis.map((j) => '<div class="stat"><div class="lbl">' + esc(j.jenis) + '</div><div class="val">' + esc(j.peserta) + ' peserta</div>' + (j.kelompok ? '<div class="small muted">' + esc(j.kelompok) + ' kelompok/ekor</div>' : '') + '</div>').join('') + '</div>'
    }
    return h || '<div class="kartu"><p class="muted center pad">Belum ada data.</p></div>'
  }

  const safePDF = (u) => (typeof u === 'string' && /^https:\/\/[a-z0-9.-]+\.public\.blob\.vercel-storage\.com\//i.test(u) ? u : '')
  const ukuran = (n) => (n > 1048576 ? (n / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB')
  function dokumenHTML(list) {
    return '<div class="dok-list">' + list.map((d) => {
      const u = safePDF(d.url)
      return '<div class="kartu dok"><div class="dok-ikon">PDF</div><div class="dok-isi"><div class="badge">' + esc(d.jenis || 'Laporan') + '</div>' +
        '<h3>' + esc(d.judul) + '</h3><div class="tgl">' + esc(d.tanggal ? tgl(d.tanggal) : '') + (d.ukuran ? ' · ' + ukuran(d.ukuran) : '') + '</div>' +
        (d.ringkasan ? '<p>' + esc(d.ringkasan) + '</p>' : '') +
        (u ? '<a class="tombol" href="' + u + '" target="_blank" rel="noopener">Buka laporan (PDF)</a>' : '') + '</div></div>'
    }).join('') + '</div>'
  }
  function laporan() {
    return '<div class="kartu"><h2>Laporan Kegiatan</h2><p class="muted">Laporan pertanggungjawaban (LPJ) dan dokumen yang dipublikasikan pengurus.</p>' + dokumenHTML(D.dokumen || []) + '</div>'
  }

  function pengurus() {
    const list = D.pengurus || []
    let h = '<div class="kartu"><h2>Pengurus' + (D.periode ? ' Masa bakti ' + esc(D.periode) + '' : '') + '</h2>'
    const g = {}
    const order = []
    list.forEach((p) => { const b = p.bidang || 'Pengurus'; if (!g[b]) { g[b] = []; order.push(b) } g[b].push(p) })
    if (!list.some((p) => safeImg(p.foto))) {
      // tanpa foto: daftar susunan pengurus standar (Jabatan : Nama)
      h += '<div class="kartu susunan">'
      order.forEach((b) => {
        const L = g[b]
        let rows = ''
        if (L.every((p) => p.jabatan)) {
          // Jabatan : Nama; jabatan sama berurutan digabung & dinomori (Anggota : 1. A, 2. B)
          for (let i = 0; i < L.length;) {
            let j = i; while (j < L.length && L[j].jabatan === L[i].jabatan) j++
            const n = j - i
            for (let k = i; k < j; k++) rows += '<tr><td class="sus-jb">' + (k === i ? esc(L[k].jabatan) : '') + '</td><td class="sus-tt">' + (k === i ? ':' : '') + '</td><td class="sus-nm">' + (n > 1 ? '<span class="sus-no">' + (k - i + 1) + '.</span>' : '') + esc(L[k].nama) + '</td></tr>'
            i = j
          }
        } else {
          // sebagian tanpa jabatan: daftar bernomor, jabatan sebagai keterangan
          rows = L.map((p, i) => '<tr><td class="sus-nm">' + (L.length > 1 ? '<span class="sus-no">' + (i + 1) + '.</span>' : '') + esc(p.nama) + (p.jabatan ? ' <span class="sus-ket">(' + esc(p.jabatan) + ')</span>' : '') + '</td></tr>').join('')
        }
        h += '<div class="sus-bidang">' + esc(b) + '</div><table class="sus-tabel">' + rows + '</table>'
      })
      return h + '</div></div>'
    }
    order.forEach((b) => {
      h += '<h3>' + esc(b) + '</h3><div class="pengurus">' +
        g[b].map((p) => { const f = safeImg(p.foto); return '<div class="org">' + (f ? '<img src="' + f + '" alt="">' : '<div class="ph"></div>') + '<div class="nm">' + esc(p.nama) + '</div><div class="jb">' + esc(p.jabatan) + '</div></div>' }).join('') + '</div>'
    })
    return h + '</div>'
  }

  function render() {
    tabs()
    const fn = { beranda, jadwal: () => '<div class="kartu"><h2>Jadwal Petugas</h2>' + jadwalHTML(D.jadwal), kas, zis, laporan, pengurus }[tab] || beranda
    $('#main').innerHTML = fn()
    const sa = $('#selAkun'), sb = $('#selBulan')
    if (sa) sa.onchange = () => { kasAkun = sa.value; render() }
    if (sb) sb.onchange = () => { kasBulan = sb.value; render() }
    document.querySelectorAll('tr.klik').forEach((tr) => tr.onclick = () => { kasBulan = tr.dataset.b; render(); const r = $('#rincian'); if (r) r.scrollIntoView({ behavior: 'smooth' }) })
    const ci = $('#cari')
    if (ci) ci.oninput = () => { kasCari = ci.value; const pos = ci.selectionStart; render(); const n = $('#cari'); n.focus(); try { n.setSelectionRange(pos, pos) } catch (e) {} }
  }

  fetch('/api/data').then((r) => r.json()).then((d) => {
    if (!d || d.kosong || d.error) {
      $('#main').innerHTML = '<div class="kartu"><p class="muted center pad">Belum ada data yang dipublikasikan dari aplikasi DKM.</p></div>'
      return
    }
    D = d
    header()
    render()
  }).catch(() => { $('#main').innerHTML = '<div class="kartu"><p class="muted center pad">Gagal memuat data. Coba muat ulang halaman.</p></div>' })

  window.addEventListener('hashchange', () => { const t = (location.hash || '#beranda').slice(1); if (D && t !== tab) { tab = t; render() } })
})()
