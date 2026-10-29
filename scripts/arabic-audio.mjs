// Озвучка слов словаря уроков арабского (задача 51): node scripts/arabic-audio.mjs
//
// Берёт слова из src/data/arabic/module-*.json, озвучивает те, у которых ещё нет файла, нейросетью Google
// (Gemini TTS, ключ Google AI Studio в переменной GEMINI_API_KEY — в репозиторий ключ не попадает) и кладёт
// mp3 в public/arabic/audio, а соответствие «слово → файл» — в src/data/arabic/audio.json.
// Бесплатный тариф даёт мало запросов в день, поэтому слова урока озвучиваются одним запросом (слово — строка),
// а запись режется по паузам; если пауз не столько, сколько слов, урок пропускается — запустить ещё раз.
// Нужен ffmpeg. Сайту ни ключ, ни сервис не нужны: он проигрывает готовые файлы.
// Готовый файл не пересоздаётся; чтобы переозвучить слово, удалите его строку из audio.json.

import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const MODEL = process.env.TTS_MODEL || 'gemini-3.1-flash-tts-preview'
const VOICE = process.env.TTS_VOICE || 'Charon'
const KEY = process.env.GEMINI_API_KEY
const ROOT = path.resolve(import.meta.dirname, '..')
const DATA = path.join(ROOT, 'src/data/arabic')
const OUT = path.join(ROOT, 'public/arabic/audio')
const MANIFEST = path.join(DATA, 'audio.json')

if (!KEY) {
  console.error('Нет ключа: GEMINI_API_KEY=… node scripts/arabic-audio.mjs')
  process.exit(1)
}

const key = (word) => word.normalize('NFC').trim()
// Приставка вроде «الْـ» (с татвилем) — не слово, её не озвучиваем
const speakable = (word) => !word.includes('ـ')
const fileFor = (word) => createHash('sha1').update(key(word)).digest('hex').slice(0, 12) + '.mp3'

const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {}
fs.mkdirSync(OUT, { recursive: true })

async function tts(words) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'x-goog-api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // Только сами слова: указания голосу модель читает вслух
      contents: [{ parts: [{ text: words.map((w) => `${w}.`).join('\n') }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
      },
    }),
  })
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 300)}`)
  const part = (await res.json()).candidates?.[0]?.content?.parts?.[0]?.inlineData
  if (!part) throw new Error('сервис не вернул звук')
  return { data: Buffer.from(part.data, 'base64'), wav: /wav/.test(part.mimeType) }
}

// Промежутки речи между паузами длиннее 0,25 с
function speech(file) {
  const log = spawnSync('ffmpeg', ['-i', file, '-af', 'silencedetect=n=-40dB:d=0.25', '-f', 'null', '-'], { encoding: 'utf8' }).stderr
  const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString())
  const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]))
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]))
  const sil = starts.map((s, i) => [s, ends[i] ?? dur])
  if (!sil.length || sil[0][0] > 0.05) sil.unshift([0, 0])
  if (sil[sil.length - 1][1] < dur - 0.05) sil.push([dur, dur])
  const segs = []
  for (let i = 0; i < sil.length - 1; i++) if (sil[i + 1][0] - sil[i][1] > 0.15) segs.push([sil[i][1], sil[i + 1][0]])
  return segs
}

function exportSeg(src, [a, b], out) {
  execFileSync('ffmpeg', [
    '-v', 'error', '-y', '-i', src,
    '-ss', Math.max(0, a - 0.08).toFixed(3), '-to', (b + 0.12).toFixed(3),
    '-af', 'afade=t=in:d=0.02,areverse,afade=t=in:d=0.04,areverse,apad=pad_dur=0.1,loudnorm=I=-16:TP=-1.5',
    '-ar', '24000', '-codec:a', 'libmp3lame', '-b:a', '64k', out,
  ])
}

// Ответы сервиса сохраняются (папка в .gitignore): запуск после сбоя не тратит дневной лимит заново
const tmp = path.join(ROOT, '.cache/arabic-audio')
fs.mkdirSync(tmp, { recursive: true })
const modules = fs.readdirSync(DATA).filter((f) => /^module-.*\.json$/.test(f)).sort()

for (const m of modules) {
  const { lessons } = JSON.parse(fs.readFileSync(path.join(DATA, m), 'utf8'))
  for (const lesson of lessons) {
    const words = [...new Set((lesson.arabic?.words ?? lesson.words ?? []).map((w) => key(w.word)))]
    const todo = words.filter((w) => speakable(w) && !manifest[w])
    if (!todo.length) continue
    process.stdout.write(`${lesson.slug}: ${todo.length} сл. … `)
    try {
      const name = createHash('sha1').update(`${MODEL} ${VOICE} ${todo.join(' ')}`).digest('hex').slice(0, 12)
      let raw = [`${name}.wav`, `${name}.pcm`].map((f) => path.join(tmp, f)).find((f) => fs.existsSync(f))
      if (!raw) {
        const { data, wav } = await tts(todo)
        raw = path.join(tmp, `${name}.${wav ? 'wav' : 'pcm'}`)
        fs.writeFileSync(raw, data)
      }
      const wav = raw.endsWith('.wav')
      const src = path.join(tmp, `${lesson.slug}-full.wav`)
      execFileSync('ffmpeg', ['-v', 'error', '-y', ...(wav ? [] : ['-f', 's16le', '-ar', '24000', '-ac', '1']), '-i', raw, src])
      const segs = speech(src)
      if (segs.length !== todo.length) {
        console.log(`пауз не столько, сколько слов (${segs.length} из ${todo.length}) — пропущено, запустите ещё раз`)
        continue
      }
      todo.forEach((w, i) => {
        exportSeg(src, segs[i], path.join(OUT, fileFor(w)))
        manifest[w] = fileFor(w)
      })
      fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
      console.log('готово')
    } catch (e) {
      console.log(`ошибка: ${e.message}`)
      // 429 — дневной лимит бесплатного тарифа (продолжить завтра), 400/403 — неверный ключ
      if (/^(400|403|429) /.test(e.message)) break
    }
  }
}
