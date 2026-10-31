'use client'

import { useMemo, useState, useSyncExternalStore } from 'react'

/*
 * Карточки для повторения слов курса арабского. Повторение по коробкам (система Лейтнера):
 * «Помню» — слово уходит в следующую коробку и вернётся через 1, 2, 4, 8, 16 дней; «Не помню» — в первую коробку.
 * Где какое слово, хранится только в браузере ученика (регистрация выключена — персональные данные не собираются).
 */

export type CardWord = {
  key: string
  word: string
  translation: string
  root?: string
  plural?: string
  verb?: string
  /** формы глагола: мудари и масдар — отдельными строками на обороте */
  present?: string
  masdar?: string
  image?: string | null
  lesson: number
}

type Box = { box: number; due: string }
type Store = Record<string, Box>

const KEY = 'imam-ahmad-academy:cards:v1'
const DAYS = [0, 1, 2, 4, 8, 16]

const today = () => new Date().toISOString().slice(0, 10)
const addDays = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10)

const EVENT = 'academy-cards-change'

function readRaw(): string {
  try {
    return window.localStorage.getItem(KEY) ?? ''
  } catch {
    return ''
  }
}

function parse(raw: string): Store {
  try {
    const data = raw ? JSON.parse(raw) : {}
    return data && typeof data === 'object' ? data : {}
  } catch {
    return {}
  }
}

function save(s: Store) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* хранилище недоступно — карточки работают без запоминания */
  }
  window.dispatchEvent(new Event(EVENT))
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb)
  window.addEventListener('storage', cb)
  return () => {
    window.removeEventListener(EVENT, cb)
    window.removeEventListener('storage', cb)
  }
}

export function Flashcards({ words, lessons, from: from0, to: to0 }: { words: CardWord[]; lessons: number[]; from: number; to: number }) {
  const [from, setFrom] = useState(from0)
  const [to, setTo] = useState(to0)
  const [dir, setDir] = useState<'ar' | 'ru'>('ar')
  const [onlyDue, setOnlyDue] = useState(true)
  // null — страница ещё не загрузилась в браузере
  const raw = useSyncExternalStore(subscribe, readRaw, () => null)
  const stored = useMemo(() => parse(raw ?? ''), [raw])
  // если хранилище недоступно, отметки этого занятия держим в памяти
  const [memory, setMemory] = useState<Store>({})
  const store = useMemo(() => ({ ...stored, ...memory }), [stored, memory])
  const loaded = raw !== null
  const [queue, setQueue] = useState<string[]>([])
  const [flipped, setFlipped] = useState(false)
  const [stats, setStats] = useState({ ok: 0, again: 0 })

  const inRange = useMemo(() => words.filter((w) => w.lesson >= Math.min(from, to) && w.lesson <= Math.max(from, to)), [words, from, to])
  const isDue = (k: string) => !store[k] || store[k].due <= today()
  const dueCount = inRange.filter((w) => isDue(w.key)).length

  const begin = () => {
    const list = (onlyDue ? inRange.filter((w) => isDue(w.key)) : inRange).map((w) => w.key)
    // перемешиваем, чтобы слова не шли в порядке словаря
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[list[i], list[j]] = [list[j], list[i]]
    }
    setQueue(list)
    setFlipped(false)
    setStats({ ok: 0, again: 0 })
  }

  const answer = (remember: boolean) => {
    const k = queue[0]
    if (!k) return
    const prev = store[k]?.box ?? 0
    const box = remember ? Math.min(prev + 1, DAYS.length - 1) : 0
    const next = { ...store, [k]: { box, due: remember ? addDays(DAYS[box]) : today() } }
    setMemory((m) => ({ ...m, [k]: next[k] }))
    save(next)
    setStats((s) => (remember ? { ...s, ok: s.ok + 1 } : { ...s, again: s.again + 1 }))
    // забытое слово вернётся в конце этого же занятия
    setQueue((q) => (remember ? q.slice(1) : [...q.slice(1), k]))
    setFlipped(false)
  }

  const w = words.find((x) => x.key === queue[0])
  const front = w ? (dir === 'ar' ? 'ar' : 'ru') : null

  return (
    <div className="cards-wrap">
      <div className="card cards-controls">
        <label>
          Уроки с
          <select className="input" value={from} onChange={(e) => setFrom(Number(e.target.value))}>
            {lessons.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label>
          по
          <select className="input" value={to} onChange={(e) => setTo(Number(e.target.value))}>
            {lessons.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <div className="chips" style={{ margin: 0 }}>
          <button type="button" className={`chip${dir === 'ar' ? ' active' : ''}`} onClick={() => setDir('ar')}>
            Арабский → русский
          </button>
          <button type="button" className={`chip${dir === 'ru' ? ' active' : ''}`} onClick={() => setDir('ru')}>
            Русский → арабский
          </button>
        </div>
        <label className="cards-check">
          <input type="checkbox" checked={onlyDue} onChange={(e) => setOnlyDue(e.target.checked)} /> Только слова, которые пора повторить
        </label>
        <div className="cards-sum">
          Слов в выбранных уроках: <b>{inRange.length}</b>
          {loaded ? (
            <>
              {' '}
              · пора повторить: <b>{dueCount}</b>
            </>
          ) : null}
        </div>
        <button type="button" className="btn" onClick={begin} disabled={!inRange.length || (onlyDue && loaded && !dueCount)}>
          {queue.length ? 'Начать заново' : 'Начать'}
        </button>
      </div>

      {w ? (
        <div className="flashcard-area">
          <div className="muted cards-left">Осталось карточек: {queue.length}</div>
          <button type="button" className={`flashcard${flipped ? ' flipped' : ''}`} onClick={() => setFlipped(!flipped)} aria-live="polite">
            {w.image && (front === 'ru' ? flipped : true) ? <img src={w.image} alt="" className="flashcard-img" /> : null}
            {front === 'ar' || flipped ? (
              <span className="flashcard-ar ar" lang="ar" dir="rtl">
                {w.word}
              </span>
            ) : null}
            {front === 'ru' || flipped ? <span className="flashcard-ru">{w.translation}</span> : null}
            {flipped ? (
              <span className="flashcard-more">
                {w.root ? <span>Корень: <span className="ar">{w.root}</span></span> : null}
                {w.plural ? <span>Мн. ч.: <span className="ar">{w.plural}</span></span> : null}
                {w.present ? <span>Мудари: <span className="ar">{w.present}</span></span> : null}
                {w.masdar ? <span>Масдар: <span className="ar">{w.masdar}</span></span> : null}
                {w.verb && !w.present && !w.masdar ? <span>Формы: <span className="ar">{w.verb}</span></span> : null}
                <span>Урок {w.lesson}</span>
              </span>
            ) : (
              <span className="flashcard-hint">Нажмите, чтобы перевернуть</span>
            )}
          </button>
          {flipped ? (
            <div className="flashcard-btns">
              <button type="button" className="btn btn-outline" onClick={() => answer(false)}>
                Не помню
              </button>
              <button type="button" className="btn" onClick={() => answer(true)}>
                Помню
              </button>
            </div>
          ) : null}
        </div>
      ) : stats.ok + stats.again > 0 ? (
        <div className="card card-pad cards-done">
          <div className="display" style={{ fontSize: 30, fontWeight: 700, color: 'var(--navy)' }}>
            Повторение окончено
          </div>
          <p className="muted" style={{ margin: 0 }}>
            «Помню»: {stats.ok}, «Не помню»: {stats.again}. Забытые слова вы повторили ещё раз в конце. Когда повторить каждое слово снова, сайт назначит сам.
          </p>
        </div>
      ) : null}
    </div>
  )
}
