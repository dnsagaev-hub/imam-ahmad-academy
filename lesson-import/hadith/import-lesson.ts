/*
 * Разовая загрузка подготовленного урока (JSON + картинки) в сайт.
 * Повторный запуск не дублирует: урок с тем же адресом обновляется, картинка с тем же именем берётся уже загруженная.
 * Переменные: LESSON_DIR — папка с уроком, LESSON_JSON — имя файла урока.
 */
import config from '@payload-config'
import fs from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'

const dir = process.env.LESSON_DIR as string
const L = JSON.parse(fs.readFileSync(path.join(dir, process.env.LESSON_JSON as string), 'utf8'))
const payload = await getPayload({ config })

const book = await payload.find({ collection: 'books', where: { slug: { equals: L.book } }, limit: 1, depth: 0 })
if (!book.totalDocs) payload.logger.warn(`Книга «${L.book}» не найдена — урок будет без книги`)

const content = []
for (const b of L.content) {
  if (b.blockType !== 'figure') {
    content.push(b)
    continue
  }
  const found = await payload.find({ collection: 'media', where: { filename: { equals: b.image } }, limit: 1, depth: 0 })
  let id = found.docs[0]?.id
  if (!id) {
    const data = fs.readFileSync(path.join(dir, b.image))
    const mimetype = b.image.endsWith('.svg') ? 'image/svg+xml' : b.image.endsWith('.jpg') ? 'image/jpeg' : 'image/png'
    id = (await payload.create({ collection: 'media', data: { alt: b.caption }, file: { data, mimetype, name: b.image, size: data.length } })).id
  }
  content.push({ ...b, image: id })
}

const data = { ...L, book: book.docs[0]?.id, content, isPublished: true }
const ex = await payload.find({ collection: 'lessons', where: { slug: { equals: L.slug } }, limit: 1, depth: 0 })
if (ex.totalDocs) await payload.update({ collection: 'lessons', id: ex.docs[0].id, data })
else await payload.create({ collection: 'lessons', data })
payload.logger.info(`Урок «${L.title}» ${ex.totalDocs ? 'обновлён' : 'добавлен'}: /lessons/${L.slug}`)
process.exit(0)
