import fs from 'fs'
import path from 'path'
import type { Payload, PayloadRequest } from 'payload'

import module01 from '../data/arabic/module-01.json'

/*
 * Уроки авторского учебника арабского языка (курс «Арабский язык» ступени Тамхиди, задача 50).
 * Текст уроков — материал владельца (документы «Урок N…»), перенесён без изменений; упражнения — задания с проверкой.
 * Вызывается миграцией (один раз на базе владельца) и демо-наполнением. Урок, который уже есть (по адресу), не трогается;
 * курс меняется, только если поля ещё как в стартовой программе — правки владельца не перезаписываются.
 */

type Module = { module: string; lessons: ({ slug: string; title: string } & Record<string, unknown>)[] }

export const ARABIC_MODULES: Module[] = [module01 as Module]

export const ARABIC_COURSE_SLUG = 'stupen-1-01-arabic'

// Стартовая программа (src/seed/program.ts до задачи 50) — меняем только эти значения
const OLD = {
  title: 'Арабский язык: первый год',
  scope: 'Учебник Мухаммада Багауддина — полностью, первый год курса.',
  bookAuthor: 'Мухаммад Багауддин',
  book: 'uchebnik-arabskogo-bagauddin',
}
export const NEW_COURSE = {
  title: 'Арабский язык для чтения религиозных текстов',
  scope: 'Авторский учебник академии: 120 уроков, от именного предложения до разбора оригинальных матнов.',
  bookAuthor: 'Авторский учебник академии',
}

// Картинки к словам — файлы владельца в public/arabic (папка public есть и в Docker-образе); в данных слова — поле picture
const PICTURES_DIR = path.resolve(process.cwd(), 'public/arabic')

type Opts = { req?: Partial<PayloadRequest>; overrideAccess: true }

async function pictureId(payload: Payload, file: string, alt: string, opts: Opts) {
  const filename = `arabic-${file}`
  const found = await payload.find({ collection: 'media', where: { filename: { equals: filename } }, limit: 1, depth: 0, ...opts })
  if (found.docs[0]) return found.docs[0].id
  const filePath = path.join(PICTURES_DIR, file)
  if (!fs.existsSync(filePath)) return undefined
  const data = fs.readFileSync(filePath)
  const doc = await payload.create({
    collection: 'media',
    data: { alt },
    file: { data, name: filename, mimetype: 'image/webp', size: data.length },
    ...opts,
  })
  return doc.id
}

/** Ставит картинки словам урока, у которых картинки ещё нет; картинки владельца не трогает. */
async function fillPictures(payload: Payload, lesson: Record<string, any>, words: Record<string, unknown>[], opts: Opts) {
  const byWord = new Map(words.filter((w) => w.picture).map((w) => [String(w.word), String(w.picture)]))
  if (!byWord.size) return
  const arabic = lesson.arabic ?? {}
  let changed = false
  const next = []
  for (const w of arabic.words ?? []) {
    const file = byWord.get(String(w.word))
    if (!w.image && file) {
      const id = await pictureId(payload, file, String(w.translation ?? w.word), opts)
      if (id !== undefined) {
        next.push({ ...w, image: id })
        changed = true
        continue
      }
    }
    next.push(w)
  }
  if (changed) await payload.update({ collection: 'lessons', id: lesson.id, data: { arabic: { ...arabic, words: next } } as never, ...opts })
}

const withoutPictures = (l: Record<string, any>) => ({
  ...l,
  arabic: { ...l.arabic, words: (l.arabic?.words ?? []).map(({ picture: _picture, ...w }: Record<string, unknown>) => w) },
})

const idOf = (x: unknown) => (x && typeof x === 'object' ? (x as { id: number | string }).id : (x as number | string))

export async function installArabicLessons(payload: Payload, req?: Partial<PayloadRequest>) {
  const opts = { req, overrideAccess: true } as const
  const created: { module: string; ids: (number | string)[] }[] = []
  for (const m of ARABIC_MODULES) {
    const ids: (number | string)[] = []
    for (const l of m.lessons) {
      const found = await payload.find({ collection: 'lessons', where: { slug: { equals: l.slug } }, limit: 1, depth: 0, ...opts })
      const doc = found.docs[0] ?? (await payload.create({ collection: 'lessons', data: withoutPictures(l) as never, ...opts }))
      // Номер урока сайт пишет сам: «Урок 1. Урок 1. …» → «Урок 1. …» (только если название не меняли)
      if (found.docs[0] && doc.title !== l.title && doc.title.replace(/^Урок \d+\.\s*/, '') === l.title) {
        await payload.update({ collection: 'lessons', id: doc.id, data: { title: l.title }, ...opts })
      }
      await fillPictures(payload, doc as Record<string, any>, ((l.arabic as any)?.words ?? []) as Record<string, unknown>[], opts)
      ids.push(doc.id)
    }
    created.push({ module: m.module, ids })
  }

  const res = await payload.find({ collection: 'courses', where: { slug: { equals: ARABIC_COURSE_SLUG } }, limit: 1, depth: 0, ...opts })
  const course = res.docs[0] as Record<string, any> | undefined
  if (!course) return payload.logger.info('Курс арабского Тамхиди не найден — уроки созданы без курса.')

  const modules: { id?: string; title: string; lessons: (number | string)[] }[] = (course.modules ?? []).map((m: any) => ({
    id: m.id,
    title: m.title,
    lessons: (m.lessons ?? []).map(idOf),
  }))
  const inCourse = new Set(modules.flatMap((m) => m.lessons.map(String)))
  for (const c of created) {
    const missing = c.ids.filter((id) => !inCourse.has(String(id)))
    if (!missing.length) continue
    const mod = modules.find((m) => m.title === c.module)
    if (mod) mod.lessons.push(...missing)
    else modules.push({ title: c.module, lessons: missing })
  }

  const data: Record<string, unknown> = { modules }
  if (course.title === OLD.title) data.title = NEW_COURSE.title
  if (course.scope === OLD.scope) {
    data.scope = NEW_COURSE.scope
    if (course.description === OLD.scope) data.description = NEW_COURSE.scope
  }
  if (course.bookAuthor === OLD.bookAuthor) data.bookAuthor = NEW_COURSE.bookAuthor
  // Учебник Багауддина больше не учебник курса (в библиотеке книга остаётся)
  const old = await payload.find({ collection: 'books', where: { slug: { equals: OLD.book } }, limit: 1, depth: 0, ...opts })
  const oldId = old.docs[0]?.id
  const books = (course.books ?? []).map(idOf)
  if (oldId !== undefined && books.some((b: unknown) => String(b) === String(oldId))) data.books = books.filter((b: unknown) => String(b) !== String(oldId))

  await payload.update({ collection: 'courses', id: course.id, data: data as never, ...opts })
  payload.logger.info('Уроки арабского добавлены в курс Тамхиди.')
}

/** Переносит в базу новую грамматику урока из учебника владельца (по его просьбе): тема, текст и примеры заметки. */
export async function updateArabicGrammar(payload: Payload, slug: string, req?: Partial<PayloadRequest>) {
  const opts = { req, overrideAccess: true } as const
  const l = ARABIC_MODULES.flatMap((m) => m.lessons).find((x) => x.slug === slug)
  const found = await payload.find({ collection: 'lessons', where: { slug: { equals: slug } }, limit: 1, depth: 0, ...opts })
  const doc = found.docs[0] as Record<string, any> | undefined
  if (!l || !doc) return
  const src = (l.arabic ?? {}) as Record<string, unknown>
  const arabic = { ...(doc.arabic ?? {}), grammarTitle: src.grammarTitle, grammar: src.grammar, grammarExamples: src.grammarExamples ?? [] }
  await payload.update({ collection: 'lessons', id: doc.id, data: { arabic } as never, ...opts })
  payload.logger.info(`Грамматика урока ${slug} обновлена.`)
}
