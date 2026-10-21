'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import { importQuranCollection, type ImportState } from '@/app/(frontend)/quran/import/actions'

/** Форма загрузки сборника переводов (страница /quran/import, только для администратора). */
export function QuranImportForm() {
  const [state, action, pending] = useActionState<ImportState, FormData>(importQuranCollection, null)
  return (
    <form action={action} className="qimport">
      <label className="qimport-field">
        <span>Файл Word (.docx) с несколькими сурами</span>
        <input type="file" name="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required />
      </label>
      <label className="qimport-field qimport-num">
        <span>С какой суры начинается файл</span>
        <input type="number" name="first" min={1} max={114} placeholder="например, 78" required />
      </label>
      <button type="submit" className="btn" style={{ alignSelf: 'flex-start' }} disabled={pending}>
        {pending ? 'Загружаю…' : 'Загрузить переводы'}
      </button>

      {state?.error ? (
        <div className="qimport-msg bad" role="alert">
          <p>{state.error}</p>
          {state.problems?.length ? (
            <ul>
              {state.problems.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
      {state?.done ? (
        <div className="qimport-msg good" role="status">
          <p>Готово: сохранено сур — {state.done.length}.</p>
          <ul>
            {state.done.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <p>
            <Link href="/quran">Открыть список сур</Link>
          </p>
        </div>
      ) : null}
    </form>
  )
}
