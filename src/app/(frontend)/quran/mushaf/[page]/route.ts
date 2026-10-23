import { MUSHAF_TOTAL, mushafPage } from '@/lib/mushaf'

/** GET /quran/mushaf/<страница> → страница мусхафа Медины, PNG. */
export async function GET(_req: Request, { params }: { params: Promise<{ page: string }> }) {
  const raw = (await params).page
  const page = /^\d{1,3}$/.test(raw) && Number(raw) >= 1 && Number(raw) <= MUSHAF_TOTAL ? Number(raw) : 0
  if (!page) return new Response('Нет такой страницы мусхафа', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  try {
    const png = await mushafPage(page)
    return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' } })
  } catch {
    return new Response('Страница мусхафа сейчас недоступна', { status: 502, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } })
  }
}
