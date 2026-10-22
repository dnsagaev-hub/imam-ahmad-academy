'use server'

import { revalidatePath } from 'next/cache'

import { isAdminUser } from '@/access'
import { checkAyahNumbers, parseCollectionDocx } from '@/lib/docx'
import { getCurrentUser, getPayloadClient } from '@/lib/payload'
import { getSurah, keepNotes, plural } from '@/lib/quran'

const AYAT: [string, string, string] = ['аят', 'аята', 'аятов']

export type ImportState = { error?: string; problems?: string[]; done?: string[] } | null

type Ayah = { number?: number | null; text?: string | null } & Record<string, unknown>

/**
 * Сборник переводов одним файлом: делит файл по сурам и сохраняет каждую суру так же, как «Перевод суры» в админке.
 * Если хоть одна сура не сходится по аятам, не сохраняется ничего. Сура, которая уже есть, обновляется:
 * переводы аятов — из файла, пояснения к аятам, переводчик и галочка «Опубликовано» остаются прежними.
 */
export async function importQuranCollection(_prev: ImportState, form: FormData): Promise<ImportState> {
  const user = await getCurrentUser()
  if (!isAdminUser(user)) return { error: 'Загружать переводы может только администратор. Войдите в админку и откройте эту страницу снова.' }

  const file = form.get('file')
  if (!(file instanceof File) || !file.size) return { error: 'Выберите файл Word (.docx).' }
  if (!file.name.toLowerCase().endsWith('.docx')) return { error: 'Нужен файл Word в формате .docx.' }
  const first = Number(form.get('first'))
  if (!Number.isInteger(first) || first < 1 || first > 114) return { error: 'Укажите номер первой суры в файле — от 1 до 114.' }

  let parsed
  try {
    parsed = parseCollectionDocx(Buffer.from(await file.arrayBuffer()))
  } catch (e) {
    return { error: (e as Error).message }
  }
  if (!parsed.surahs.length)
    return { error: 'В файле не найдено ни одной суры. Перед каждой сурой нужны два абзаца: «Название» и (смысл названия), затем аяты «1. Перевод…».' }
  if (first + parsed.surahs.length - 1 > 114)
    return { error: `В файле ${parsed.surahs.length} сур: если первая — ${first}, последняя вышла бы больше 114. Проверьте номер первой суры.` }

  const problems: string[] = []
  parsed.surahs.forEach((p, k) => {
    const s = getSurah(first + k)!
    if (p.stray) problems.push(`Сура ${s.n} «${p.name}»: абзац перевода без номера ${p.stray}.`)
    const errors = checkAyahNumbers(p.ayahs.map((a) => a.number), s.ayahs)
    if (errors.length) problems.push(`Сура ${s.n} «${p.name}» (по счёту — «${s.ru}», ${s.ayahs} ${plural(s.ayahs, AYAT)}): ${errors.join('; ')}.`)
  })
  if (problems.length) return { error: 'Ничего не сохранено: в файле есть ошибки. Исправьте их и загрузите файл снова.', problems }

  const payload = await getPayloadClient()
  const done: string[] = []
  for (const [k, p] of parsed.surahs.entries()) {
    const s = getSurah(first + k)!
    const found = await payload.find({ collection: 'quran-translations', where: { surah: { equals: s.n } }, limit: 1, depth: 0, user, overrideAccess: false })
    const old = found.docs[0] as { id: number | string; ayahs?: Ayah[] | null } | undefined
    // Пояснения к аятам (толкование и др.) остаются прежними
    const notes = new Map((old?.ayahs ?? []).map((a) => [Number(a.number), a]))
    const ayahs = p.ayahs.map((a) => ({ number: a.number, text: a.text, ...(keepNotes(notes.get(a.number)) as Record<string, never>) }))
    const data = { surah: s.n, ayahs, ...(p.basmala ? { basmala: p.basmala } : {}) }
    if (old) await payload.update({ collection: 'quran-translations', id: old.id, data, user, overrideAccess: false })
    else await payload.create({ collection: 'quran-translations', data, user, overrideAccess: false })
    done.push(`Сура ${s.n} «${s.ru}» — ${old ? 'обновлена' : 'добавлена'}, ${ayahs.length} ${plural(ayahs.length, AYAT)}`)
  }
  revalidatePath('/quran', 'layout')
  return { done }
}
