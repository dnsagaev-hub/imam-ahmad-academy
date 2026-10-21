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

export type ParsedSurah = { basmala: string | null; ayahs: { number: number; text: string }[] }

/**
 * Перевод суры из абзацев: «N. текст» — перевод аята N; абзац, начинающийся со «С именем Аллаха», — басмала.
 * Арабские абзацы и заголовки пропускаются (арабский текст на сайте берётся не из файла).
 */
export function parseSurahDocx(buf: Buffer): ParsedSurah {
  let basmala: string | null = null
  const ayahs: { number: number; text: string }[] = []
  for (const p of docxParagraphs(buf)) {
    const m = p.match(/^(\d{1,3})\s*[.)]\s*(.+)$/)
    if (m && /[А-Яа-яЁё]/.test(m[2])) ayahs.push({ number: Number(m[1]), text: m[2].trim() })
    else if (!basmala && /^С именем Аллаха/i.test(p)) basmala = p
  }
  return { basmala, ayahs }
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
