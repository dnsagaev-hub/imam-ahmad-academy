import { inflateRawSync } from 'node:zlib'

/*
 * Чтение перевода суры из файла Word (.docx) без сторонних библиотек.
 * .docx — это zip-архив; текст лежит в word/document.xml, абзац — <w:p>.
 */

function readZipEntry(buf: Buffer, name: string): Buffer | null {
  // Конец центрального каталога: подпись 0x06054b50 в последних 64 КБ файла
  let eocd = -1
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i
      break
    }
  }
  if (eocd < 0) return null
  const count = buf.readUInt16LE(eocd + 10)
  let p = buf.readUInt32LE(eocd + 16)
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) return null
    const method = buf.readUInt16LE(p + 10)
    const size = buf.readUInt32LE(p + 20)
    const nameLen = buf.readUInt16LE(p + 28)
    const extraLen = buf.readUInt16LE(p + 30)
    const commentLen = buf.readUInt16LE(p + 32)
    const local = buf.readUInt32LE(p + 42)
    if (buf.toString('utf8', p + 46, p + 46 + nameLen) === name) {
      const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28)
      const data = buf.subarray(start, start + size)
      return method === 0 ? data : inflateRawSync(data)
    }
    p += 46 + nameLen + extraLen + commentLen
  }
  return null
}

const unescape = (s: string) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, '&')

/** Абзацы документа простым текстом (табуляции и переносы строк — пробелы). */
export function docxParagraphs(buf: Buffer): string[] {
  const xml = readZipEntry(buf, 'word/document.xml')
  if (!xml) throw new Error('Не удалось прочитать файл: это не документ Word (.docx).')
  return (xml.toString('utf8').match(/<w:p[ >][\s\S]*?<\/w:p>/g) ?? [])
    .map((p) =>
      unescape(
        p
          .replace(/<w:(tab|br)\b[^>]*\/>/g, ' ')
          .match(/<w:t(?:\s[^>]*)?>[^<]*<\/w:t>/g)
          ?.map((t) => t.replace(/<[^>]+>/g, ''))
          .join('') ?? '',
      )
        .replace(/\s+/g, ' ')
        .trim(),
    )
    .filter(Boolean)
}

export type ParsedSurah = { basmala: string | null; ayahs: { number: number; text: string }[]; stray: string | null; autoNumbered: boolean }

/**
 * Перевод суры из абзацев: «N. текст» — перевод аята N; абзац, начинающийся со «С именем Аллаха», — басмала.
 * Арабские абзацы и заголовки пропускаются (арабский текст на сайте берётся не из файла).
 * Русский абзац без номера после первого аята — `stray`: иначе он молча пропал бы с сайта.
 */
export function parseSurahDocx(buf: Buffer): ParsedSurah {
  let basmala: string | null = null
  let stray: string | null = null
  const ayahs: { number: number; text: string }[] = []
  for (const p of docxParagraphs(buf)) {
    const m = p.match(/^(\d{1,3})\s*[.)]\s*(.+)$/)
    if (m && /[А-Яа-яЁё]/.test(m[2])) ayahs.push({ number: Number(m[1]), text: m[2].trim() })
    else if (!basmala && /^С именем Аллаха/i.test(p)) basmala = p
    else if (ayahs.length && !stray && /[А-Яа-яЁё]/.test(p)) stray = `после аята ${ayahs[ayahs.length - 1].number}: «${p.slice(0, 60)}${p.length > 60 ? '…' : ''}»`
  }
  // Номера, поставленные автоматическим списком Word, в тексте абзаца не видны
  const xml = readZipEntry(buf, 'word/document.xml')?.toString('utf8') ?? ''
  return { basmala, ayahs, stray, autoNumbered: !ayahs.length && xml.includes('<w:numPr>') }
}

/** «1, 2, 5–9» вместо длинного перечня номеров. */
function ranges(nums: number[]): string {
  const out: string[] = []
  const sorted = [...nums].sort((a, b) => a - b)
  for (let i = 0; i < sorted.length; i++) {
    let j = i
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++
    out.push(j > i + 1 ? `${sorted[i]}–${sorted[j]}` : j === i + 1 ? `${sorted[i]}, ${sorted[j]}` : `${sorted[i]}`)
    i = j
  }
  return out.join(', ')
}

/** Ошибки состава аятов: пропущенные, лишние и повторённые номера. Пусто — всё верно. */
export function checkAyahNumbers(numbers: number[], total: number): string[] {
  const seen = new Set<number>()
  const dup = new Set<number>()
  for (const n of numbers) (seen.has(n) ? dup : seen).add(n)
  const missing = Array.from({ length: total }, (_, i) => i + 1).filter((n) => !seen.has(n))
  const extra = [...seen].filter((n) => n < 1 || n > total)
  const errors: string[] = []
  if (missing.length) errors.push(`нет ${missing.length > 1 ? 'аятов' : 'аята'} ${ranges(missing)}`)
  if (extra.length) errors.push(`лишние аяты ${ranges(extra)}`)
  if (dup.size) errors.push(`повторяются номера ${ranges([...dup])}`)
  return errors
}

export type CollectionSurah = {
  /** Заголовок суры в файле: «Ан-Наба» */
  name: string
  /** Смысл названия: (Весть) */
  meaning: string
  basmala: string | null
  ayahs: { number: number; text: string }[]
  stray: string | null
}

const CYR = /[А-Яа-яЁё]/
const AYAH = /^(\d{1,3})\s*[.)]\s*(.+)$/

/**
 * Сборник сур в одном файле (как «Коран 78-114.docx»): перед каждой сурой два абзаца — «Название» и (смысл названия),
 * дальше аяты «N. перевод». Первый аят суры может быть без номера (номер стоял автоматическим списком Word):
 * если первый пронумерованный аят — 2, последний русский абзац перед ним считается аятом 1.
 * `firstHint` — номер первой суры, если в начале файла написано «78 – 114».
 */
export function parseCollectionDocx(buf: Buffer): { surahs: CollectionSurah[]; firstHint: number | null } {
  const paras = docxParagraphs(buf)
  const surahs: CollectionSurah[] = []
  const pending: string[][] = []
  let firstHint: number | null = null
  for (let i = 0; i < paras.length; i++) {
    const p = paras[i]
    const next = paras[i + 1] ?? ''
    if (/^«[^»]{1,40}»$/.test(p) && /^\([^)]{1,60}\)$/.test(next)) {
      surahs.push({ name: p.slice(1, -1).trim(), meaning: next.slice(1, -1).trim(), basmala: null, ayahs: [], stray: null })
      pending.push([])
      i++
      continue
    }
    const s = surahs[surahs.length - 1]
    if (!s) {
      const m = p.match(/^(\d{1,3})\s*[–—-]\s*\d{1,3}\b/)
      if (m && firstHint === null) firstHint = Number(m[1])
      continue
    }
    const m = p.match(AYAH)
    if (m && CYR.test(m[2])) s.ayahs.push({ number: Number(m[1]), text: m[2].trim() })
    else if (!s.basmala && /^С именем Аллаха/i.test(p)) s.basmala = p
    else if (CYR.test(p)) {
      if (!s.ayahs.length) pending[pending.length - 1].push(p)
      else if (!s.stray) s.stray = `после аята ${s.ayahs[s.ayahs.length - 1].number}: «${p.slice(0, 60)}${p.length > 60 ? '…' : ''}»`
    }
  }
  surahs.forEach((s, k) => {
    const before = pending[k]
    if (!before.length) return
    if (s.ayahs[0]?.number === 2) s.ayahs.unshift({ number: 1, text: before.pop()! })
    if (before.length && !s.stray) s.stray = `перед первым аятом: «${before[0].slice(0, 60)}${before[0].length > 60 ? '…' : ''}»`
  })
  return { surahs, firstHint }
}
