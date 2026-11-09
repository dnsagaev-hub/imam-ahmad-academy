import type { Payload, PayloadRequest } from 'payload'

import fonetika from '../data/arabic/fonetika.json'
import orfografiya from '../data/arabic/orfografiya.json'

/*
 * Уроки дополнительных курсов арабского (задача 56): текст владельца (документы «Урок N»), перенесён без изменений слов.
 * Формат тот же, что у основного курса (вкладка урока «Урок арабского»). Вызывается миграцией и наполнением.
 * Урок, который уже есть (по адресу), не трогается; в курс ставятся только уроки, которых там ещё нет.
 */

type ExtraModule = { course: string; module: string; planned?: { from: string; to: string }; lessons: ({ slug: string; title: string } & Record<string, unknown>)[] }

export const ARABIC_EXTRA_MODULES: ExtraModule[] = [
  { ...(fonetika as ExtraModule), planned: { from: '12–15', to: '15' } },
  // Задача 60: уроки 1–15 курса «Арабская орфография» (документы владельца 09.11.2026)
  { ...(orfografiya as ExtraModule), planned: { from: '12–16', to: '15' } },
]

const idOf = (x: unknown) => (x && typeof x === 'object' ? (x as { id: number | string }).id : (x as number | string))

/** only — адрес курса: миграция ставит уроки только своего курса, не трогая уроки других курсов, удалённые владельцем */
export async function installArabicExtraLessons(payload: Payload, req?: Partial<PayloadRequest>, only?: string) {
  const opts = { req, overrideAccess: true } as const
  for (const m of ARABIC_EXTRA_MODULES) {
    if (only && m.course !== only) continue
    const res = await payload.find({ collection: 'courses', where: { slug: { equals: m.course } }, limit: 1, depth: 0, ...opts })
    const course = res.docs[0] as Record<string, any> | undefined
    if (!course) continue
    const ids: (number | string)[] = []
    for (const l of m.lessons) {
      const found = await payload.find({ collection: 'lessons', where: { slug: { equals: l.slug } }, limit: 1, depth: 0, ...opts })
      const doc = found.docs[0] ?? (await payload.create({ collection: 'lessons', data: { ...l, isPublished: true } as never, ...opts }))
      ids.push(doc.id)
    }
    const modules: { id?: string; title: string; lessons: (number | string)[] }[] = (course.modules ?? []).map((x: any) => ({
      id: x.id,
      title: x.title,
      lessons: (x.lessons ?? []).map(idOf),
    }))
    const inCourse = new Set(modules.flatMap((x) => x.lessons.map(String)))
    const missing = ids.filter((id) => !inCourse.has(String(id)))
    const data: Record<string, unknown> = {}
    if (missing.length) {
      const mod = modules.find((x) => x.title === m.module)
      if (mod) mod.lessons.push(...missing)
      else modules.push({ title: m.module, lessons: missing })
      data.modules = modules
    }
    // «Планируется уроков» уточняется по программе владельца, только если его ещё не меняли
    if (m.planned && course.plannedLessons === m.planned.from) data.plannedLessons = m.planned.to
    if (Object.keys(data).length) await payload.update({ collection: 'courses', id: course.id, data: data as never, ...opts })
    payload.logger.info(`Уроки курса ${m.course}: добавлено в курс ${missing.length}.`)
  }
}
