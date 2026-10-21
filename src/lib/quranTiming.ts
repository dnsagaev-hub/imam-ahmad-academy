/*
 * Разметка времени аятов для подсветки читаемого аята. Берётся у mp3quran.net (API v3, раздел ayat_timing)
 * и только для чтеца, подключённого ссылкой на папку mp3quran: разметка относится к тем же файлам.
 * Своих MP3 и чтецов без разметки это не касается — у них подсветки нет.
 */

const API = 'https://www.mp3quran.net/api/v3/ayat_timing'
const DAY = 86400

/** Аят и его начало и конец в записи — в тех единицах, что отдаёт mp3quran (переводит в секунды браузер). */
export type AyahTime = [ayah: number, start: number, end: number]

// «https://server8.mp3quran.net/afs/» → «server8.mp3quran.net/afs»
const folderKey = (u: string) => u.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '')

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, { next: { revalidate: DAY }, signal: AbortSignal.timeout(10000) })
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

const asList = (d: unknown, key: string): unknown[] =>
  Array.isArray(d) ? d : d && typeof d === 'object' && Array.isArray((d as Record<string, unknown>)[key]) ? ((d as Record<string, unknown>)[key] as unknown[]) : []

/** Номер записи (read) в mp3quran, чья папка совпадает с папкой чтеца, или null. */
async function readIdFor(base: string): Promise<number | null> {
  const key = folderKey(base)
  for (const r of asList(await getJson(`${API}/reads`), 'reads')) {
    if (!r || typeof r !== 'object') continue
    const o = r as Record<string, unknown>
    // Адрес папки в списке может лежать под разными именами полей — сравниваем все строки записи
    const hit = Object.values(o).some((v) => typeof v === 'string' && /mp3quran\.net/i.test(v) && folderKey(v) === key)
    if (hit && Number.isFinite(Number(o.id))) return Number(o.id)
  }
  return null
}

export async function getAyahTiming(base: string | null, surah: number): Promise<AyahTime[]> {
  if (!base || !/mp3quran\.net/i.test(base)) return []
  const id = await readIdFor(base)
  if (id === null) return []
  const out: AyahTime[] = []
  for (const t of asList(await getJson(`${API}?surah=${surah}&read=${id}`), 'data')) {
    const o = (t ?? {}) as Record<string, unknown>
    const ayah = Number(o.ayah)
    const start = Number(o.start_time)
    const end = Number(o.end_time)
    if (Number.isInteger(ayah) && ayah >= 0 && Number.isFinite(start) && Number.isFinite(end) && end > start) out.push([ayah, start, end])
  }
  return out.sort((a, b) => a[1] - b[1])
}
