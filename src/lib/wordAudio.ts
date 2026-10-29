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
