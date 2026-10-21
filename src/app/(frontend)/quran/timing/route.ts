import { getReciters } from '@/lib/quranData'
import { getAyahTiming } from '@/lib/quranTiming'

/** GET /quran/timing?r=<чтец>&s=<сура> → { ayahs: [[аят, начало, конец], …] }; без разметки — пустой список. */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams
  const s = Number(q.get('s'))
  let ayahs: Awaited<ReturnType<typeof getAyahTiming>> = []
  if (Number.isInteger(s) && s >= 1 && s <= 114) {
    try {
      const reciter = (await getReciters()).find((r) => r.id === q.get('r'))
      if (reciter) ayahs = await getAyahTiming(reciter.base, s)
    } catch {
      /* mp3quran недоступен — просто без подсветки */
    }
  }
  return Response.json({ ayahs }, { headers: { 'Cache-Control': ayahs.length ? 'public, max-age=86400' : 'no-store' } })
}
