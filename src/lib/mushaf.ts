import fs from 'fs/promises'
import path from 'path'

import sharp from 'sharp'

/*
 * Мусхаф Медины (Комплекс короля Фахда, чтение Хафса, 604 страницы): страницы суры для чтения на сайте и PDF.
 * Номера страниц сур — mp3quran.net, API v3 «suwar» (start_page, end_page), 23.10.2026. Изображения страниц —
 * открытый набор GovarJabbar/Quran-PNG на GitHub (выбор владельца 23.10.2026); сайт скачивает страницу один раз,
 * уменьшает и хранит копию в media/mushaf (в локальной версии — Docker-том media).
 */

// Первая и последняя страница каждой суры, по порядку сур 1…114
const PAGES: [number, number][] = [[1, 1], [2, 49], [50, 76], [77, 106], [106, 127], [128, 150], [151, 176], [177, 186], [187, 207], [208, 221], [221, 235], [235, 248], [249, 255], [255, 261], [262, 267], [267, 281], [282, 293], [293, 304], [305, 312], [312, 321], [322, 331], [332, 341], [342, 349], [350, 359], [359, 366], [367, 376], [377, 385], [385, 396], [396, 404], [404, 410], [411, 414], [415, 417], [418, 427], [428, 434], [434, 440], [440, 445], [446, 452], [453, 458], [458, 467], [467, 476], [477, 482], [483, 489], [489, 495], [496, 498], [499, 502], [502, 506], [507, 510], [511, 515], [515, 517], [518, 520], [520, 523], [523, 525], [526, 528], [528, 531], [531, 534], [534, 537], [537, 541], [542, 545], [545, 548], [549, 551], [551, 552], [553, 554], [554, 555], [556, 557], [558, 559], [560, 561], [562, 564], [564, 566], [566, 568], [568, 570], [570, 571], [572, 573], [574, 575], [575, 577], [577, 578], [578, 580], [580, 581], [582, 583], [583, 584], [585, 586], [586, 586], [587, 587], [587, 589], [589, 590], [590, 590], [591, 591], [591, 592], [592, 593], [593, 594], [594, 595], [595, 595], [595, 596], [596, 596], [596, 597], [597, 597], [597, 598], [598, 598], [598, 599], [599, 599], [599, 600], [600, 600], [600, 600], [601, 601], [601, 601], [601, 601], [602, 602], [602, 602], [602, 602], [603, 603], [603, 603], [603, 603], [604, 604], [604, 604], [604, 604]]

export const MUSHAF_TOTAL = 604

/** Страницы суры в мусхафе Медины: первая и последняя (на них бывают и соседние суры). */
export const mushafPages = (n: number): { from: number; to: number } | null => {
  const p = PAGES[n - 1]
  return p ? { from: p[0], to: p[1] } : null
}

const SOURCE = 'https://raw.githubusercontent.com/GovarJabbar/Quran-PNG/master/'
const DIR = path.resolve(process.cwd(), 'media/mushaf')
// Ширина копии: страница остаётся чёткой на экране и при печати, а файл — лёгким
const WIDTH = 1300

const pending = new Map<number, Promise<Buffer>>()

/** Страница мусхафа PNG (белый фон, оттенки серого, без чересстрочности — её можно вставить в PDF как есть). */
export function mushafPage(page: number): Promise<Buffer> {
  if (!Number.isInteger(page) || page < 1 || page > MUSHAF_TOTAL) return Promise.reject(new Error('Нет такой страницы'))
  let p = pending.get(page)
  if (!p) {
    p = loadPage(page).finally(() => pending.delete(page))
    pending.set(page, p)
  }
  return p
}

async function loadPage(page: number): Promise<Buffer> {
  const file = path.join(DIR, `${String(page).padStart(3, '0')}.png`)
  try {
    return await fs.readFile(file)
  } catch {
    /* копии ещё нет — скачиваем */
  }
  const res = await fetch(`${SOURCE}${String(page).padStart(3, '0')}.png`, { signal: AbortSignal.timeout(30000), cache: 'no-store' })
  if (!res.ok) throw new Error(`Страница ${page}: источник ответил ${res.status}`)
  const png = await sharp(Buffer.from(await res.arrayBuffer()))
    .flatten({ background: '#ffffff' })
    .resize({ width: WIDTH })
    .greyscale()
    .png({ palette: true, colors: 16, compressionLevel: 9, progressive: false })
    .toBuffer()
  await fs.mkdir(DIR, { recursive: true })
  await fs.writeFile(file, png)
  return png
}

type Png = { width: number; height: number; bits: number; colorType: number; palette: Buffer | null; data: Buffer }

function readPng(buf: Buffer): Png {
  let pos = 8
  const png: Png = { width: 0, height: 0, bits: 8, colorType: 0, palette: null, data: Buffer.alloc(0) }
  const idat: Buffer[] = []
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos)
    const type = buf.toString('ascii', pos + 4, pos + 8)
    const body = buf.subarray(pos + 8, pos + 8 + len)
    if (type === 'IHDR') {
      png.width = body.readUInt32BE(0)
      png.height = body.readUInt32BE(4)
      png.bits = body[8]
      png.colorType = body[9]
      if (body[12]) throw new Error('Чересстрочный PNG не поддерживается')
    } else if (type === 'PLTE') png.palette = Buffer.from(body)
    else if (type === 'IDAT') idat.push(body)
    pos += 12 + len
  }
  png.data = Buffer.concat(idat)
  return png
}

/**
 * PDF из страниц PNG без сторонних библиотек: каждая страница — лист A4 с картинкой по центру.
 * Сжатые данные PNG вставляются в PDF без перекодирования (FlateDecode с предсказателем PNG).
 */
export function buildPdf(pages: Buffer[], title: string): Buffer {
  const A4 = [595.28, 841.89]
  const M = 28
  const parts: Buffer[] = []
  const offsets: number[] = []
  let size = 0
  const push = (b: Buffer | string) => {
    const buf = typeof b === 'string' ? Buffer.from(b, 'latin1') : b
    parts.push(buf)
    size += buf.length
  }
  const obj = (id: number, ...body: (Buffer | string)[]) => {
    offsets[id] = size
    push(`${id} 0 obj\n`)
    body.forEach(push)
    push('\nendobj\n')
  }
  push('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n')
  const n = pages.length
  // 1 — каталог, 2 — список страниц, 3 — сведения; у страницы k: лист, содержимое, картинка
  const pageId = (k: number) => 4 + k * 3
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>')
  obj(2, `<< /Type /Pages /Count ${n} /Kids [${pages.map((_, k) => `${pageId(k)} 0 R`).join(' ')}] >>`)
  // Название в UTF-16: русские буквы в сведениях PDF
  const utf16 = Buffer.from('﻿' + title, 'utf16le').swap16().toString('hex')
  obj(3, `<< /Title <${utf16}> /Producer (Imam Ahmad Academy) >>`)
  pages.forEach((buf, k) => {
    const png = readPng(buf)
    const scale = Math.min((A4[0] - 2 * M) / png.width, (A4[1] - 2 * M) / png.height)
    const w = png.width * scale
    const h = png.height * scale
    const x = (A4[0] - w) / 2
    const y = (A4[1] - h) / 2
    const draw = `q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm /Im0 Do Q`
    const colors = png.colorType === 3 ? 1 : png.colorType === 0 ? 1 : png.colorType === 2 ? 3 : 0
    if (!colors) throw new Error('Неподдерживаемый вид PNG')
    const space =
      png.colorType === 3 && png.palette
        ? `[/Indexed /DeviceRGB ${png.palette.length / 3 - 1} <${png.palette.toString('hex')}>]`
        : png.colorType === 2
          ? '/DeviceRGB'
          : '/DeviceGray'
    obj(pageId(k), `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4[0]} ${A4[1]}] /Resources << /XObject << /Im0 ${pageId(k) + 2} 0 R >> >> /Contents ${pageId(k) + 1} 0 R >>`)
    obj(pageId(k) + 1, `<< /Length ${draw.length} >>\nstream\n${draw}\nendstream`)
    obj(
      pageId(k) + 2,
      `<< /Type /XObject /Subtype /Image /Width ${png.width} /Height ${png.height} /ColorSpace ${space} /BitsPerComponent ${png.bits} /Filter /FlateDecode /DecodeParms << /Predictor 15 /Colors ${colors} /BitsPerComponent ${png.bits} /Columns ${png.width} >> /Length ${png.data.length} >>\nstream\n`,
      png.data,
      '\nendstream',
    )
  })
  const xref = size
  const count = pageId(n)
  push(`xref\n0 ${count}\n0000000000 65535 f \n`)
  for (let id = 1; id < count; id++) push(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`)
  push(`trailer\n<< /Size ${count} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xref}\n%%EOF\n`)
  return Buffer.concat(parts)
}
