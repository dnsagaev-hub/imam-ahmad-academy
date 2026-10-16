'use client'

/* Выбранное место и метод расчёта намазов — хранятся только в браузере ученика. */
import { useSyncExternalStore } from 'react'

import { CITIES, METHODS, type MethodKey } from './prayerTimes'

export type PrayerPlace =
  | { kind: 'city'; name: string }
  | { kind: 'geo'; lat: number; lng: number; tz: string }

export type PrayerPrefs = { place: PrayerPlace | null; method: MethodKey | null }

const KEY = 'imam-ahmad-academy:prayer:v1'
const EVENT = 'academy-prayer-change'

let cache: PrayerPrefs | null = null
const EMPTY: PrayerPrefs = { place: null, method: null }

function read(): PrayerPrefs {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw) {
      const d = JSON.parse(raw)
      return { place: d.place ?? null, method: d.method && d.method in METHODS ? d.method : null }
    }
  } catch {
    /* нет доступа к хранилищу */
  }
  return EMPTY
}

export function savePrayerPrefs(next: Partial<PrayerPrefs>) {
  const merged = { ...read(), ...next }
  try {
    window.localStorage.setItem(KEY, JSON.stringify(merged))
  } catch {
    /* не удалось сохранить — работаем до перезагрузки */
  }
  cache = merged
  window.dispatchEvent(new Event(EVENT))
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb)
  return () => window.removeEventListener(EVENT, cb)
}

export function usePrayerPrefs(): PrayerPrefs & { ready: boolean } {
  const prefs = useSyncExternalStore(
    subscribe,
    () => (cache ??= read()),
    () => EMPTY,
  )
  const ready = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )
  return { ...prefs, ready }
}

/** Место для расчёта: выбранное учеником или город по умолчанию из настроек сайта. */
export function resolvePlace(place: PrayerPlace | null, defaultCity: string) {
  if (place?.kind === 'geo') {
    return { label: 'Ваше местоположение', lat: place.lat, lng: place.lng, tz: place.tz, isGeo: true }
  }
  const name = place?.kind === 'city' ? place.name : defaultCity
  const city = CITIES.find((c) => c.name === name) ?? CITIES[0]
  return { label: city.name, lat: city.lat, lng: city.lng, tz: city.tz, isGeo: false }
}

/** Запрос геолокации у браузера. Координаты остаются на устройстве и на сервер не отправляются. */
export function requestGeolocation(): Promise<{ ok: true } | { ok: false; error: string }> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) return resolve({ ok: false, error: 'Браузер не поддерживает геолокацию.' })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        savePrayerPrefs({
          place: {
            kind: 'geo',
            lat: Math.round(pos.coords.latitude * 1000) / 1000,
            lng: Math.round(pos.coords.longitude * 1000) / 1000,
            tz,
          },
        })
        resolve({ ok: true })
      },
      (err) =>
        resolve({
          ok: false,
          error:
            err.code === err.PERMISSION_DENIED
              ? 'Доступ к местоположению запрещён. Выберите город из списка.'
              : 'Не удалось определить местоположение. Выберите город из списка.',
        }),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 6 * 3600 * 1000 },
    )
  })
}
