// Озвучка слов словаря уроков арабского (задача 51): node scripts/arabic-audio.mjs
//
// Берёт слова из src/data/arabic/module-*.json, озвучивает те, у которых ещё нет файла, нейросетью Google
// (Gemini TTS, ключ Google AI Studio в переменной GEMINI_API_KEY — в репозиторий ключ не попадает) и кладёт
// mp3 в public/arabic/audio, а соответствие «слово → файл» — в src/data/arabic/audio.json.
// Бесплатный тариф даёт мало запросов в день, поэтому слова озвучиваются пачками по ~32 (слово — строка, около двух уроков),
// а запись режется по паузам; если пауз не столько, сколько слов, пачка пропускается — запустить ещё раз.
// Нужен ffmpeg. Сайту ни ключ, ни сервис не нужны: он проигрывает готовые файлы.
// Готовый файл не пересоздаётся; чтобы переозвучить слово, удалите его строку из audio.json.

import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const MODEL = process.env.TTS_MODEL || 'gemini-3.1-flash-tts-preview'
const VOICE = process.env.TTS_VOICE || 'Charon'
const SEP = process.env.TTS_SEP ?? ''
// Указания «диктору» в формате Gemini TTS (вслух читается только TRANSCRIPT). Без них модель часто читает слово
// в паузальной форме — без танвина и последней огласовки, та марбута как -х (так вышло с числами урока 16 и днями недели урока 17)
const PROFILE = `# AUDIO PROFILE: Arabic teacher
## THE SCENE: A Classical Arabic vocabulary lesson for beginners.
### DIRECTOR'S NOTES
Read each word of the transcript separately, with a clear pause after each. Pronounce every word exactly as vocalized, in connected (wasl) form: always pronounce the final short vowel and the tanwin (-un, -an, -in), never stop on a sukun, never pronounce ta marbuta as -h. Do not read these notes aloud.

### TRANSCRIPT
`
// Режим «примеры» (TTS_SOURCE=examples, задача 51, просьба владельца 10.11.2026): строки-примеры из объяснений уроков
// курса фонетики — медленно и чётко; каждая строка — один файл, элементы через тире или запятую читаются с паузой
const EXAMPLES = process.env.TTS_SOURCE === 'examples'
const PROFILE_EX = `# AUDIO PROFILE: Arabic phonetics teacher
## THE SCENE: An Arabic phonetics course for beginners: the student must hear the exact pronunciation of every letter and word.
### DIRECTOR'S NOTES
Speak slowly and very clearly, with precise, careful articulation of every consonant and vowel (Classical Arabic). Each line of the transcript is separate: make a long pause after each line. Inside a line, items separated by a dash or a comma are separate: make a clear pause between them. A single letter without vowel marks: pronounce its sound followed by a short a (س = "sa", ع = "ʿa"), not its letter name. A syllable (letter with a vowel mark) is pronounced exactly as vocalized, e.g. بَ = "ba", بِ = "bi", بُ = "bu". Pronounce every word exactly as vocalized, including the final short vowel and tanwin; if the last letter has sukun, stop on it. Do not read these notes aloud.

### TRANSCRIPT
`
const KEY = process.env.GEMINI_API_KEY
const ROOT = path.resolve(import.meta.dirname, '..')
const DATA = path.join(ROOT, 'src/data/arabic')
const OUT = path.join(ROOT, EXAMPLES ? 'public/arabic/examples' : 'public/arabic/audio')
const MANIFEST = path.join(DATA, EXAMPLES ? 'example-audio.json' : 'audio.json')

if (!KEY) {
  console.error('Нет ключа: GEMINI_API_KEY=… node scripts/arabic-audio.mjs')
  process.exit(1)
}

// Ключ примера — как exampleKey в src/lib/wordAudio.ts (без пробелов, знаков направления, татвиля и конечной точки)
const exampleKey = (ar) =>
  ar.normalize('NFC').replace(/[\s\u00a0\u200e\u200f\u061c\u0640]/g, '').replace(/[.،؟?!:؛]+$/, '')
// Строка-пример — как exampleLine в src/components/arabic/ArabicLesson.tsx
function exampleLine(line) {
  if (!/^[\u0600-\u06FF]/.test(line)) return null
  if (!/[А-Яа-яЁёA-Za-z]/.test(line)) return line
  const ru = line.search(/[А-Яа-яЁёA-Za-z0-9«|]/)
  if (ru < 0) return line
  const m = line.slice(0, ru).match(/^(.*\S)\s+—\s+$/)
  return m ? m[1] : null
}
// Для чтения: знак огласовки в скобках «(ـَ)» не читается; строка, где татвиль остаётся (сам знак «ـُ»), не озвучивается
const spoken = (ar) => ar.replace(/\s*\(ـ[^)]*\)/g, '').trim()
const key = (word) => (EXAMPLES ? exampleKey(word) : word.normalize('NFC').trim())
// Приставка вроде «الْـ» (с татвилем) — не слово, её не озвучиваем
const speakable = (word) => !(EXAMPLES ? spoken(word) : word).includes('ـ')
const fileFor = (word) => createHash('sha1').update(key(word)).digest('hex').slice(0, 12) + '.mp3'

const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {}
fs.mkdirSync(OUT, { recursive: true })

async function tts(words) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'x-goog-api-key': KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: (EXAMPLES ? PROFILE_EX : PROFILE) + words.map((w) => `${EXAMPLES ? spoken(w) : w}${SEP}`).join('\n') }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
      },
    }),
  })
  if (!res.ok) throw new Error(`${res.status} ${(await res.text()).slice(0, 300)}`)
  const json = await res.json()
  const part = json.candidates?.[0]?.content?.parts?.[0]?.inlineData
  if (!part) throw new Error(`сервис не вернул звук (${json.candidates?.[0]?.finishReason ?? JSON.stringify(json).slice(0, 200)})`)
  return { data: Buffer.from(part.data, 'base64'), wav: /wav/.test(part.mimeType) }
}

// Промежутки речи между паузами длиннее 0,25 с. В примерах фонетики бывают очень короткие слоги («بَ», «فَ») — порог длины речи ниже
const MIN_SPEECH = EXAMPLES ? 0.08 : 0.15
function speech(file, n = -40, d = 0.25) {
  const log = spawnSync('ffmpeg', ['-i', file, '-af', `silencedetect=n=${n}dB:d=${d}`, '-f', 'null', '-'], { encoding: 'utf8' }).stderr
  const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString())
  const starts = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1]))
  const ends = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => Number(m[1]))
  const sil = starts.map((s, i) => [s, ends[i] ?? dur])
  if (!sil.length || sil[0][0] > 0.05) sil.unshift([0, 0])
  if (sil[sil.length - 1][1] < dur - 0.05) sil.push([dur, dur])
  const segs = []
  for (let i = 0; i < sil.length - 1; i++) if (sil[i + 1][0] - sil[i][1] > MIN_SPEECH) segs.push([sil[i][1], sil[i + 1][0]])
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

// Все ещё не озвученные слова по порядку уроков, без повторов (слово из прошлого урока второй раз не озвучивается)
const todoAll = []
const exampleText = {}
if (EXAMPLES) {
  for (const f of (process.env.TTS_EXAMPLES || 'fonetika.json').split(',')) {
    for (const lesson of JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')).lessons)
      for (const raw of String(lesson.arabic?.grammar ?? '').split('\n')) {
        const ar = exampleLine(raw.trim())
        const k = ar ? key(ar) : ''
        if (k && speakable(ar) && !manifest[k] && !(k in exampleText)) {
          exampleText[k] = ar
          todoAll.push(ar)
        }
      }
  }
}
for (const m of EXAMPLES ? [] : modules) {
  const { lessons } = JSON.parse(fs.readFileSync(path.join(DATA, m), 'utf8'))
  for (const lesson of lessons)
    for (const w of lesson.arabic?.words ?? lesson.words ?? []) {
      // У глагола озвучиваются и формы: маади, мудари‘, масдар — кнопка у строки «Формы»
      for (const form of [w.word, w.past, w.present, w.masdar]) {
        const k = form ? key(form) : ''
        if (k && speakable(k) && !manifest[k] && !todoAll.includes(k)) todoAll.push(k)
      }
    }
}

// Слова идут пачками по BATCH (около двух уроков) — так дневного лимита хватает на 15–20 уроков
const BATCH = Number(process.env.TTS_BATCH) || 32
const MAX = Number(process.env.TTS_MAX_BATCHES) || Infinity
for (let start = 0; start < todoAll.length && start / BATCH < MAX; start += BATCH) {
  const todo = todoAll.slice(start, start + BATCH)
  process.stdout.write(`${todo[0]} … ${todo[todo.length - 1]}: ${todo.length} сл. … `)
  try {
    const name = createHash('sha1').update(`${MODEL} ${VOICE} ${EXAMPLES ? PROFILE_EX : PROFILE} ${todo.join(' ')}`).digest('hex').slice(0, 12)
    let raw = [`${name}.wav`, `${name}.pcm`].map((f) => path.join(tmp, f)).find((f) => fs.existsSync(f))
    if (!raw) {
      const { data, wav } = await tts(todo)
      raw = path.join(tmp, `${name}.${wav ? 'wav' : 'pcm'}`)
      fs.writeFileSync(raw, data)
    }
    const wav = raw.endsWith('.wav')
    const src = path.join(tmp, `${name}-full.wav`)
    execFileSync('ffmpeg', ['-v', 'error', '-y', ...(wav ? [] : ['-f', 's16le', '-ar', '24000', '-ac', '1']), '-i', raw, src])
    // Паузы бывают неровными: подбираем порог тишины, при котором кусков ровно столько, сколько слов
    const tries = [[-40, 0.25], [-40, 0.35], [-35, 0.3], [-45, 0.3], [-40, 0.45], [-35, 0.45], [-50, 0.4], [-40, 0.2], [-30, 0.3], [-45, 0.5]]
    // Два слова через запятую или косую черту («صَوْمٌ، صِيَامٌ», «أَيُّهَا / أَيَّتُهَا») модель читает как два — у такой строки два куска
    // В примерах элементы — через тире или запятую: «بَ — بِ — بُ», «خ، ص، ض»; в тексте из нескольких предложений
    // диктор делает паузу и после точки
    const parts = todo.map((w) =>
      EXAMPLES ? spoken(w).split(/\s+—\s+|،|[.؟!]\s+/).filter((x) => x.trim()).length : w.split(/[،؛,/]/).filter((x) => x.trim()).length,
    )
    const need = parts.reduce((a, b) => a + b, 0)
    let segs = []
    for (const [n, d] of tries) if ((segs = speech(src, n, d)).length === need) break
    // Лишние куски — слово из двух частей или пауза внутри слова: склеиваем соседей с самой короткой паузой
    if (segs.length !== need) {
      segs = speech(src)
      while (segs.length > need) {
        let k = 0
        for (let i = 1; i < segs.length - 1; i++) if (segs[i + 1][0] - segs[i][1] < segs[k + 1][0] - segs[k][1]) k = i
        segs.splice(k, 2, [segs[k][0], segs[k + 1][1]])
      }
    }
    if (segs.length === need) {
      let j = 0
      segs = parts.map((k) => {
        const g = [segs[j][0], segs[j + k - 1][1]]
        j += k
        return g
      })
    }
    if (segs.length !== todo.length) {
      console.log(`пауз не столько, сколько слов (${segs.length} из ${todo.length}) — пропущено, запустите ещё раз (или с меньшим TTS_BATCH)`)
      continue
    }
    todo.forEach((w, i) => {
      exportSeg(src, segs[i], path.join(OUT, fileFor(w)))
      manifest[key(w)] = fileFor(w)
    })
    fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
    console.log('готово')
  } catch (e) {
    console.log(`ошибка: ${e.message}`)
    // 429 — дневной лимит бесплатного тарифа (продолжить завтра), 400/403 — неверный ключ
    if (/^(400|403|429) /.test(e.message)) break
  }
}
