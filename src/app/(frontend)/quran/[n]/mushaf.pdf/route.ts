import fs from 'fs/promises'
import path from 'path'

import { buildPdf, mushafPage, mushafPages } from '@/lib/mushaf'
import { getSurahNamed } from '@/lib/quranData'

const DIR = path.resolve(process.cwd(), 'media/mushaf')

/** GET /quran/<сура>/mushaf.pdf → страницы суры из мусхафа Медины одним PDF (готовый файл хранится рядом со страницами). */
export async function GET(_req: Request, { params }: { params: Promise<{ n: string }> }) {
  const raw = (await params).n
  const s = /^\d{1,3}$/.test(raw) ? await getSurahNamed(Number(raw)) : undefined
  const pages = s ? mushafPages(s.n) : null
  if (!s || !pages) return new Response('Нет такой суры', { status: 404 })
  const file = path.join(DIR, `sura-${String(s.n).padStart(3, '0')}.pdf`)
  let pdf: Buffer
  try {
    pdf = await fs.readFile(file)
  } catch {
    try {
      const list: Buffer[] = []
      // По шесть страниц за раз: у длинных сур (аль-Бакара — 48 страниц) первая сборка не душит источник
      for (let p = pages.from; p <= pages.to; p += 6) {
        const batch = []
        for (let q = p; q <= Math.min(pages.to, p + 5); q++) batch.push(mushafPage(q))
        list.push(...(await Promise.all(batch)))
      }
      pdf = buildPdf(list, `Сура ${s.n} «${s.ru}» — мусхаф Медины, стр. ${pages.from}–${pages.to}`)
      await fs.mkdir(DIR, { recursive: true })
      await fs.writeFile(file, pdf)
    } catch {
      return new Response('PDF сейчас не собрать: страницы мусхафа недоступны. Попробуйте позже.', { status: 502, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } })
    }
  }
  const name = `Сура ${s.n} ${s.ru}.pdf`
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="sura-${s.n}.pdf"; filename*=UTF-8''${encodeURIComponent(name)}`,
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
