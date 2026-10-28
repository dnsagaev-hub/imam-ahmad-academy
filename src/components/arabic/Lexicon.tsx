'use client'

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { buildIndex, lookup, showStage, tokenize, type LexEntry, type LexIndex, type Stage } from '@/lib/arabic'

/*
 * Подсказки к словам урока арабского: слово, которое ученик уже проходил (в этом уроке или раньше),
 * подчёркнуто пунктиром; наведение или нажатие показывает перевод, корень и формы.
 * Здесь же переключатель «Показать огласовку» для уроков, где огласовка снята.
 */

// Место слова — в координатах страницы (не окна): при увеличении страницы карточка остаётся над словом
type Pop = { entry: LexEntry; x: number; top: number; bottom: number; pinned: boolean }

type Ctx = {
  index: LexIndex
  stage: Stage
  full: boolean
  setFull: (v: boolean) => void
  show: (entry: LexEntry, el: HTMLElement, pinned: boolean) => void
  hide: (force?: boolean) => void
}

const LexCtx = createContext<Ctx | null>(null)

export function LexiconProvider({ entries, stage, children }: { entries: LexEntry[]; stage: Stage; children: React.ReactNode }) {
  const index = useMemo(() => buildIndex(entries), [entries])
  const [full, setFull] = useState(false)
  const [pop, setPop] = useState<Pop | null>(null)

  const show = useCallback((entry: LexEntry, el: HTMLElement, pinned: boolean) => {
    const r = el.getBoundingClientRect()
    const x = r.left + r.width / 2 + window.scrollX
    setPop((p) => (p?.pinned && !pinned ? p : { entry, x, top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, pinned }))
  }, [])
  const hide = useCallback((force = false) => setPop((p) => (p && (force || !p.pinned) ? null : p)), [])

  useEffect(() => {
    if (!pop) return
    const close = (e: Event) => {
      if (e.type === 'keydown' && (e as KeyboardEvent).key !== 'Escape') return
      if (e.type === 'pointerdown' && (e.target as HTMLElement)?.closest?.('.ar-w, .ar-pop')) return
      setPop(null)
    }
    window.addEventListener('pointerdown', close)
    window.addEventListener('keydown', close)
    window.addEventListener('scroll', close, { passive: true })
    return () => {
      window.removeEventListener('pointerdown', close)
      window.removeEventListener('keydown', close)
      window.removeEventListener('scroll', close)
    }
  }, [pop])

  return (
    <LexCtx.Provider value={{ index, stage, full, setFull, show, hide }}>
      {children}
      {pop ? <WordPopover pop={pop} /> : null}
    </LexCtx.Provider>
  )
}

function WordPopover({ pop }: { pop: Pop }) {
  const e = pop.entry
  const width = 260
  const ref = useRef<HTMLDivElement>(null)
  const [at, setAt] = useState<{ left: number; top: number; w: number } | null>(null)
  // Видимая часть страницы (при увеличении жестом она меньше окна): карточка над словом и не выходит за её края
  useLayoutEffect(() => {
    const h = ref.current?.offsetHeight ?? 0
    const vv = window.visualViewport
    const viewLeft = vv ? vv.pageLeft : window.scrollX
    const viewTop = vv ? vv.pageTop : window.scrollY
    const viewWidth = vv ? vv.width : document.documentElement.clientWidth
    const w = Math.min(width, viewWidth - 16)
    const left = Math.max(viewLeft + 8, Math.min(pop.x - w / 2, viewLeft + viewWidth - w - 8))
    const above = pop.top - 8 - h
    setAt({ left, top: above >= viewTop + 8 ? above : pop.bottom + 8, w })
  }, [pop])
  return createPortal(
    <div
      ref={ref}
      className="ar-pop"
      role="tooltip"
      style={{ left: at?.left ?? 0, top: at?.top ?? pop.bottom + 8, width: at?.w ?? width, visibility: at ? 'visible' : 'hidden' }}
    >
      <div className="ar-pop-w ar" lang="ar" dir="rtl">
        {e.w}
      </div>
      <div className="ar-pop-t">{e.t}</div>
      {e.r ? (
        <div className="ar-pop-row">
          Корень: <span className="ar" lang="ar" dir="rtl">{e.r}</span>
        </div>
      ) : null}
      {e.pl ? (
        <div className="ar-pop-row">
          Мн. ч.: <span className="ar" lang="ar" dir="rtl">{e.pl}</span>
        </div>
      ) : null}
      {e.v ? (
        <div className="ar-pop-row">
          Формы: <span className="ar" lang="ar" dir="rtl">{e.v}</span>
        </div>
      ) : null}
      <div className="ar-pop-n">Слово урока {e.n}</div>
    </div>,
    document.body,
  )
}

/** Арабский текст с подсказками и огласовкой по этапу урока. `tips={false}` — без подсказок (в заданиях). */
export function ArText({ text, tips = true, className }: { text: string; tips?: boolean; className?: string }) {
  const ctx = useContext(LexCtx)
  const stage: Stage = ctx && !ctx.full ? ctx.stage : 'full'
  if (!ctx || !tips) return <span className={className}>{showStage(text, stage)}</span>
  return (
    <span className={className}>
      {tokenize(text).map((t, i) => {
        const shown = stage === 'full' ? t.text : showStage(t.text, stage)
        if (!t.word) return <span key={i}>{shown}</span>
        const at = lookup(ctx.index, t.text)
        if (at === undefined) return <span key={i}>{shown}</span>
        const entry = ctx.index.entries[at]
        return (
          <span
            key={i}
            className="ar-w"
            tabIndex={0}
            role="button"
            aria-label={`${shown.trim()} — ${entry.t}`}
            onMouseEnter={(e) => ctx.show(entry, e.currentTarget, false)}
            onMouseLeave={() => ctx.hide()}
            onFocus={(e) => ctx.show(entry, e.currentTarget, false)}
            onBlur={() => ctx.hide()}
            onClick={(e) => ctx.show(entry, e.currentTarget, true)}
          >
            {shown}
          </span>
        )
      })}
    </span>
  )
}

/** Кнопка «Показать огласовку» — только на уроках, где огласовка снята полностью или частично. */
export function VowelToggle() {
  const ctx = useContext(LexCtx)
  if (!ctx || ctx.stage === 'full') return null
  return (
    <button type="button" className={`chip${ctx.full ? ' active' : ''}`} onClick={() => ctx.setFull(!ctx.full)} aria-pressed={ctx.full}>
      {ctx.full ? 'Скрыть огласовку' : 'Показать огласовку'}
    </button>
  )
}
