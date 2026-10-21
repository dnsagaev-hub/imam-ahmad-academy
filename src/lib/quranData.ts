import { cache } from 'react'

import { getPayloadClient } from './payload'
import type { Reciter } from './quran'
import { mediaUrl } from './queries'

/* Запросы раздела «Коран»: переводы сур и чтецы. Скрытое (без галочки «Опубликовано») не показывается. */

export type TranslationDoc = {
  surah: number
  translator?: string | null
  basmala?: string | null
  ayahs?: { number: number; text: string; comment?: unknown }[] | null
}

/** Номера сур, у которых есть опубликованный перевод. */
export const getTranslatedSurahs = cache(async (): Promise<number[]> => {
  try {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: 'quran-translations',
      where: { isPublished: { equals: true } },
      select: { surah: true },
      depth: 0,
      limit: 200,
      pagination: false,
    })
    return res.docs.map((d) => Number((d as { surah: number }).surah))
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
    return { id: String(r.id), name: r.name, nameAr: r.nameAr ?? '', base: r.source === 'link' && r.baseUrl ? r.baseUrl : null, files }
  })
})
