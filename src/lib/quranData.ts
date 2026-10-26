import { cache } from 'react'

import { getPayloadClient } from './payload'
import { SURAHS, currentFolder, type AyahNoteName, type Reciter, type Surah } from './quran'
import { mediaUrl } from './queries'

/* Запросы раздела «Коран»: переводы сур и чтецы. Скрытое (без галочки «Опубликовано») не показывается. */

export type TranslationDoc = {
  surah: number
  translator?: string | null
  basmala?: string | null
  topics?: { from: number; title: string }[] | null
  ayahs?: ({ number: number; text: string } & Partial<Record<AyahNoteName, unknown>>)[] | null
}

/** Номера сур, у которых есть опубликованный перевод. */
export const getTranslatedSurahs = cache(async (): Promise<number[]> => {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'quran-translations',
      where: { isPublished: { equals: true } },
      select: { surah: true, ayahs: { number: true } },
      depth: 0,
      limit: 200,
      pagination: false,
    })
    // Запись без аятов (создана без файла) переводом не считается
    return (res.docs as { surah: number; ayahs?: unknown[] | null }[]).filter((d) => d.ayahs?.length).map((d) => Number(d.surah))
  } catch {
    return []
  }
})

export async function getTranslation(n: number): Promise<TranslationDoc | null> {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'quran-translations',
    where: { and: [{ surah: { equals: n } }, { isPublished: { equals: true } }] },
    depth: 0,
    limit: 1,
  })
  return (res.docs[0] as unknown as TranslationDoc) ?? null
}

type ReciterDoc = {
  id: number | string
  name: string
  nameAr?: string | null
  source?: 'link' | 'files' | null
  baseUrl?: string | null
  files?: { surah: number; audio: unknown }[] | null
}

export const getReciters = cache(async (): Promise<Reciter[]> => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'reciters',
    where: { isPublished: { equals: true } },
    sort: 'order',
    depth: 1,
    limit: 100,
  })
  return (res.docs as unknown as ReciterDoc[]).map((r) => {
    const files: Record<number, string> = {}
    if (r.source === 'files') for (const f of r.files ?? []) {
      const url = mediaUrl(f.audio)
      if (url) files[Number(f.surah)] = url
    }
    return { id: String(r.id), name: r.name, nameAr: r.nameAr ?? '', base: r.source === 'link' && r.baseUrl ? currentFolder(r.baseUrl) : null, files }
  })
})

/**
 * Суры с названиями, которые владелец поправил в админке («Коран → Сведения о сурах»): пустое поле —
 * название по умолчанию. Действует и без галочки «Опубликовано»: это не текст, а подпись суры.
 */
export const getSurahs = cache(async (): Promise<Surah[]> => {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'surah-info',
      select: { surah: true, nameRu: true, meaning: true, nameAr: true },
      depth: 0,
      limit: 200,
      pagination: false,
    })
    const own = new Map((res.docs as { surah: number; nameRu?: string | null; meaning?: string | null; nameAr?: string | null }[]).map((d) => [Number(d.surah), d]))
    return SURAHS.map((s) => {
      const d = own.get(s.n)
      return d ? { ...s, ru: d.nameRu?.trim() || s.ru, meaning: d.meaning?.trim() || s.meaning, ar: d.nameAr?.trim() || s.ar } : s
    })
  } catch {
    return SURAHS
  }
})

/** Сура с названием из админки (номер 1–114). */
export const getSurahNamed = async (n: number): Promise<Surah | undefined> => (await getSurahs())[n - 1]

/** Сведения о суре (кнопки в шапке): опубликованная запись или null. */
export async function getSurahInfo(n: number): Promise<Record<string, unknown> | null> {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'surah-info',
      where: { and: [{ surah: { equals: n } }, { isPublished: { equals: true } }] },
      depth: 0,
      limit: 1,
    })
    return (res.docs[0] as unknown as Record<string, unknown>) ?? null
  } catch {
    return null
  }
}
