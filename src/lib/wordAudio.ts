import audio from '../data/arabic/audio.json'
import { mediaUrl } from './queries'

/*
 * Озвучка слов словаря урока арабского (задача 51). Своя запись владельца (поле «Своя запись произношения»)
 * важнее готовой: готовые файлы озвучены нейросетью один раз (scripts/arabic-audio.py) и лежат в public/arabic/audio;
 * src/data/arabic/audio.json — какое слово (как написано в словаре, с огласовкой) в каком файле.
 */

const files = audio as Record<string, string>

export const audioKey = (word: string) => word.normalize('NFC').trim()

export function wordAudioUrl(w: { word?: string | null; audio?: unknown }): string | null {
  const own = mediaUrl(w.audio)
  if (own) return own
  const file = w.word ? files[audioKey(w.word)] : undefined
  return file ? `/arabic/audio/${file}` : null
}

/*
 * Озвучка примеров (задача 59, слова владельца 07.11.2026): владелец загружает запись в список «Озвучка примеров»
 * урока и вписывает арабскую часть примера, как в тексте урока. Сравнение без пробелов, знаков направления, татвиля
 * и конечной точки, чтобы лишний пробел при копировании не мешал.
 */
export const exampleKey = (ar: string) =>
  ar
    .normalize('NFC')
    .replace(/[\s\u00a0\u200e\u200f\u061c\u0640]/g, '')
    .replace(/[.،؟?!:؛]+$/, '')

/** Какой пример — какой файл: ключ exampleKey → адрес записи. */
export function exampleAudioMap(list: { arabic?: string | null; audio?: unknown }[] | null | undefined): Map<string, string> {
  const map = new Map<string, string>()
  for (const x of list ?? []) {
    const url = mediaUrl(x.audio)
    if (x.arabic?.trim() && url) map.set(exampleKey(x.arabic), url)
  }
  return map
}
