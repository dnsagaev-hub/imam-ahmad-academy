'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import { requestGeolocation, resolvePlace, savePrayerPrefs, usePrayerPrefs } from '@/lib/prayerStore'
import {
  CITIES,
  METHODS,
  PRAYER_NAMES,
  PRAYER_ORDER,
  computePrayerTimes,
  formatTime,
  hijriDate,
  nextPrayer,
  nowIn,
  tzOffsetHours,
  type MethodKey,
} from '@/lib/prayerTimes'

export type PrayerDefaults = { city: string; method: MethodKey; hijriOffset: number }

/** Текущее время, обновляется раз в 30 секунд (только в браузере). */
function useNow() {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])
  return now
}

function useTimes(defaults: PrayerDefaults) {
  const prefs = usePrayerPrefs()
  const now = useNow()
  const place = resolvePlace(prefs.place, defaults.city)
  const method: MethodKey = prefs.method ?? defaults.method
  const data = useMemo(() => {
    if (!now) return null
    const local = nowIn(place.tz, now)
    const tz = tzOffsetHours(place.tz, now)
    const times = computePrayerTimes(local.date, place.lat, place.lng, tz, method)
    return { local, times, next: nextPrayer(times, local.hours) }
  }, [now, place.lat, place.lng, place.tz, method])
  return { place, method, data, now, prefs }
}

const inText = (h: number) => {
  const m = Math.max(0, Math.round(h * 60))
  if (m < 60) return `через ${m} мин`
  return `через ${Math.floor(m / 60)} ч ${m % 60} мин`
}

/** Тонкая полоса над шапкой: дата по двум календарям и ближайший намаз. */
export function TopBar({ defaults }: { defaults: PrayerDefaults }) {
  const { place, data, now } = useTimes(defaults)
  const greg = now
    ? new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: place.tz }).format(now)
    : ''
  const hijri = now ? hijriDate(now, defaults.hijriOffset, place.tz) : null

  return (
    <div className="topbar">
      <div className="container topbar-inner">
        <div className="topbar-date" aria-live="off">
          <span className="greg">{greg ? greg.charAt(0).toUpperCase() + greg.slice(1) : ' '}</span>
          {hijri ? (
            <>
              <span className="sep" aria-hidden="true">
                ·
              </span>
              <span>{hijri.ru}</span>
              <span className="ar" lang="ar" dir="rtl">
                {hijri.ar}
              </span>
            </>
          ) : null}
        </div>
        <Link href="/prayer-times" className="topbar-prayer">
          {data ? (
            <>
              <span className="dot" aria-hidden="true" />
              <span>
                {PRAYER_NAMES[data.next.key].ru} <strong>{formatTime(data.times[data.next.key])}</strong>
              </span>
              <span className="muted-light">
                {inText(data.next.inHours)} · {place.label}
              </span>
            </>
          ) : (
            <span>Время намаза</span>
          )}
        </Link>
      </div>
    </div>
  )
}

/** Полный блок: время намазов на сегодня, выбор города, геолокация и метода расчёта. */
export function PrayerTimesPanel({ defaults, compact = false }: { defaults: PrayerDefaults; compact?: boolean }) {
  const { place, method, data, now } = useTimes(defaults)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const hijri = now ? hijriDate(now, defaults.hijriOffset, place.tz) : null

  return (
    <div className="prayer-panel">
      <div className="prayer-head">
        <div>
          <div className="prayer-place">{place.label}</div>
          <div className="prayer-sub">
            {now
              ? new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', timeZone: place.tz }).format(now)
              : ' '}
            {hijri ? ` · ${hijri.ru}` : ''}
          </div>
        </div>
        {data ? (
          <div className="prayer-next">
            <span>Следующий намаз</span>
            <b>
              {PRAYER_NAMES[data.next.key].ru} {formatTime(data.times[data.next.key])}
            </b>
            <span>{inText(data.next.inHours)}</span>
          </div>
        ) : null}
      </div>

      <ol className="prayer-grid">
        {PRAYER_ORDER.map((k) => {
          const isNext = data?.next.key === k
          return (
            <li key={k} className={`prayer-cell${isNext ? ' next' : ''}${k === 'sunrise' ? ' sunrise' : ''}`}>
              <span className="ar" lang="ar" dir="rtl">
                {PRAYER_NAMES[k].ar}
              </span>
              <span className="nm">{PRAYER_NAMES[k].ru}</span>
              <b>{data ? formatTime(data.times[k]) : '—:—'}</b>
            </li>
          )
        })}
      </ol>

      {!compact ? (
        <div className="prayer-controls">
          <label htmlFor="pt-city">Город</label>
          <select
            id="pt-city"
            className="input"
            value={place.isGeo ? '' : place.label}
            onChange={(e) => {
              setGeoError(null)
              savePrayerPrefs({ place: { kind: 'city', name: e.target.value } })
            }}
          >
            {place.isGeo ? <option value="">Ваше местоположение</option> : null}
            {CITIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-outline"
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              const r = await requestGeolocation()
              setBusy(false)
              setGeoError(r.ok ? null : r.error)
            }}
          >
            {busy ? 'Определяем…' : 'Определить по геолокации'}
          </button>
          <label htmlFor="pt-method">Метод расчёта</label>
          <select
            id="pt-method"
            className="input"
            value={method}
            onChange={(e) => savePrayerPrefs({ method: e.target.value as MethodKey })}
          >
            {(Object.keys(METHODS) as MethodKey[]).map((k) => (
              <option key={k} value={k}>
                {METHODS[k].name}
              </option>
            ))}
          </select>
          {geoError ? <p className="notice notice-err" style={{ margin: 0 }}>{geoError}</p> : null}
        </div>
      ) : (
        <Link href="/prayer-times" className="prayer-more">
          Выбрать город или определить по геолокации →
        </Link>
      )}
    </div>
  )
}
