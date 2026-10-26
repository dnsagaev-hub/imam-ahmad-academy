import { RichText } from '@payloadcms/richtext-lexical/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Crumbs } from '@/components/PageHead'
import { SurahInfoButtons, type SurahInfoPart } from '@/components/quran/SurahInfoButtons'
import { SurahView, type AyahNote } from '@/components/quran/SurahView'
import { SURAH_INFO_PARTS } from '@/collections/SurahInfo'
import { mushafPages } from '@/lib/mushaf'
import { AYAH_NOTES, PLACE_LABEL, plural } from '@/lib/quran'
import { getReciters, getSurahInfo, getSurahNamed, getSurahs, getTranslation } from '@/lib/quranData'

export const dynamic = 'force-dynamic'

// Перевод басмалы владельца (как в его файле суры 67): если в файле суры басмалы нет, берётся он
const BASMALA_RU = 'С именем Аллаха, Милостивого, Милующего!'

// В тексте редактора есть хотя бы одна буква (пустой редактор хранит пустой абзац)
const hasText = (v: unknown) => {
  const c = v as { root?: { children?: unknown[] } } | null | undefined
  return !!c?.root?.children?.some((ch) => JSON.stringify(ch).includes('"text":"'))
}

const num = (n: string) => (/^[1-9]\d{0,2}$/.test(n) && Number(n) >= 1 && Number(n) <= 114 ? Number(n) : 0)

export async function generateMetadata({ params }: { params: Promise<{ n: string }> }): Promise<Metadata> {
  const s = await getSurahNamed(num((await params).n))
  return { title: s ? `Сура ${s.n} «${s.ru}»` : 'Коран' }
}

async function loadArabic(n: number): Promise<string[]> {
  return (await import(`@/data/quran/${n}.json`)).default as string[]
}

export default async function SurahPage({ params }: { params: Promise<{ n: string }> }) {
  const n = num((await params).n)
  if (!n) notFound()
  const surahs = await getSurahs()
  const s = surahs[n - 1]
  const arabic = await loadArabic(n)
  // Басмала стоит перед каждой сурой, кроме ат-Таубы; в аль-Фатихе она — первый аят
  const basmala = n !== 1 && n !== 9 ? (await loadArabic(1))[0].replace(/\s*[٠-٩]+\s*$/, '') : null
  const [tr, reciters] = await Promise.all([getTranslation(n), getReciters()])
  const ayahs = tr?.ayahs?.length ? [...tr.ayahs].sort((a, b) => a.number - b.number) : null
  const translation = ayahs ? Array.from({ length: s.ayahs }, (_, i) => ayahs.find((a) => a.number === i + 1)?.text ?? '') : null
  // Пояснения к аяту (толкование и др.): кнопка — только у заполненного
  const notes: Record<number, AyahNote[]> = {}
  for (const a of ayahs ?? []) {
    const list = AYAH_NOTES.filter((f) => hasText(a[f.name])).map((f) => ({ name: f.name, body: <RichText data={a[f.name] as never} /> }))
    if (list.length) notes[a.number] = list
  }
  // Сведения о суре: кнопка — только у заполненного пункта
  const info = await getSurahInfo(n)
  const infoParts: SurahInfoPart[] = SURAH_INFO_PARTS.filter((p) => hasText(info?.[p.name])).map((p) => ({
    key: p.name,
    label: p.label,
    body: <RichText data={info![p.name] as never} />,
  }))
  const pages = mushafPages(n)!
  const prev = n > 1 ? surahs[n - 2] : null
  const next = n < 114 ? surahs[n] : null

  return (
    <>
      <Header />
      <div className="subbar">
        <div className="container">
          <Crumbs items={[{ label: 'Главная', href: '/' }, { label: 'Коран', href: '/quran' }, { label: `${n}. ${s.ru}` }]} />
          <div className="sh">
            <div className="sh-ru">
              <p className="eyebrow">Сура {n}</p>
              <h1 className="page-title">{s.ru}</h1>
              <p className="sh-mean">«{s.meaning}»</p>
              <div className="media-stats">
                <span>{PLACE_LABEL[s.place]}</span>
                <span>
                  <b>{s.ayahs}</b> {plural(s.ayahs, ['аят', 'аята', 'аятов'])}
                </span>
              </div>
              {translation && tr?.translator ? <p className="sh-credit">Перевод, комментарий и редакция — {tr.translator}</p> : null}
              {infoParts.length ? <SurahInfoButtons surahName={s.ru} parts={infoParts} /> : null}
            </div>
            <p className="sh-ar" lang="ar" dir="rtl">
              سُورَةُ {s.ar}
            </p>
          </div>
        </div>
      </div>
      <main className="container qmain">
        <SurahView surah={s} arabic={arabic} basmala={basmala} basmalaRu={translation ? tr?.basmala || BASMALA_RU : null} translation={translation} notes={notes} mushaf={pages} topics={(tr?.topics ?? []).filter((t) => t.title?.trim()).map((t) => ({ from: Number(t.from), title: t.title.trim() }))} reciters={reciters} surahs={surahs} />
        <nav className="sv-pager" aria-label="Соседние суры">
          {prev ? (
            <Link href={`/quran/${prev.n}`} className="sv-pg">
              <span>← Сура {prev.n}</span>
              <b>{prev.ru}</b>
            </Link>
          ) : (
            <span />
          )}
          <Link href="/quran" className="sv-pg sv-pg-all">
            Все суры
          </Link>
          {next ? (
            <Link href={`/quran/${next.n}`} className="sv-pg sv-pg-next">
              <span>Сура {next.n} →</span>
              <b>{next.ru}</b>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </main>
      <Footer />
    </>
  )
}
