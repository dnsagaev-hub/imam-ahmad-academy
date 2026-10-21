/*
 * Разовая загрузка подготовленной статьи (JSON и, если есть, картинка-схема) в раздел «Статьи и разборы».
 * Повторный запуск не дублирует: статья с тем же адресом обновляется, картинка с тем же именем берётся уже загруженная.
 * Переменные: ARTICLE_DIR — папка со статьёй, ARTICLE_JSON — имя файла статьи.
 */
import config from '@payload-config'
import fs from 'node:fs'
import path from 'node:path'
import { getPayload } from 'payload'

const dir = process.env.ARTICLE_DIR as string
const A = JSON.parse(fs.readFileSync(path.join(dir, process.env.ARTICLE_JSON as string), 'utf8'))
const payload = await getPayload({ config })

// Картинка необязательна: статья без схемы загружается без неё.
let imageId = A.image ? (await payload.find({ collection: 'media', where: { filename: { equals: A.image } }, limit: 1, depth: 0 })).docs[0]?.id : undefined
if (A.image && !imageId) {
  const data = fs.readFileSync(path.join(dir, A.image))
  imageId = (await payload.create({ collection: 'media', data: { alt: A.imageAlt }, file: { data, mimetype: 'image/png', name: A.image, size: data.length } })).id
}
const body = JSON.parse(JSON.stringify(A.body).replace('"__IMAGE__"', JSON.stringify(imageId)))

const { image: _i, imageAlt: _a, ...rest } = A
const data = { ...rest, body, isPublished: true, publishedAt: new Date().toISOString() }
const ex = await payload.find({ collection: 'articles', where: { slug: { equals: A.slug } }, limit: 1, depth: 0 })
if (ex.totalDocs) await payload.update({ collection: 'articles', id: ex.docs[0].id, data })
else await payload.create({ collection: 'articles', data })
payload.logger.info(`Статья «${A.title}» ${ex.totalDocs ? 'обновлена' : 'добавлена'}: /articles/${A.slug}`)
process.exit(0)
