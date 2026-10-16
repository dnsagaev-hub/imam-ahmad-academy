/*
 * Расчёт времени намазов по координатам — полностью в браузере, без внешних сервисов.
 * Основано на открытом алгоритме PrayTimes.org (Hamid Zarrabi-Zadeh, лицензия LGPL).
 * Аср — по мнению большинства, в т.ч. ханбалитов: когда тень предмета равна его длине (+ тень зенита).
 */

export type MethodKey = 'MWL' | 'ISNA' | 'Egypt' | 'Makkah' | 'Karachi' | 'North'

export const METHODS: Record<MethodKey, { name: string; fajr: number; isha: number | { minutes: number } }> = {
  MWL: { name: 'Всемирная исламская лига (18° / 17°)', fajr: 18, isha: 17 },
  Makkah: { name: 'Умм аль-Кура, Мекка (18,5° / 90 мин)', fajr: 18.5, isha: { minutes: 90 } },
  Egypt: { name: 'Египетское управление (19,5° / 17,5°)', fajr: 19.5, isha: 17.5 },
  Karachi: { name: 'Университет Карачи (18° / 18°)', fajr: 18, isha: 18 },
  ISNA: { name: 'ISNA, Северная Америка (15° / 15°)', fajr: 15, isha: 15 },
  North: { name: 'Мягкие углы для северных широт (16° / 15°)', fajr: 16, isha: 15 },
}

export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'

export const PRAYER_NAMES: Record<PrayerKey, { ru: string; ar: string }> = {
  fajr: { ru: 'Фаджр', ar: 'الفجر' },
  sunrise: { ru: 'Восход', ar: 'الشروق' },
  dhuhr: { ru: 'Зухр', ar: 'الظهر' },
  asr: { ru: 'Аср', ar: 'العصر' },
  maghrib: { ru: 'Магриб', ar: 'المغرب' },
  isha: { ru: 'Иша', ar: 'العشاء' },
}

export const PRAYER_ORDER: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']

const dtr = (d: number) => (d * Math.PI) / 180
const rtd = (r: number) => (r * 180) / Math.PI
const sin = (d: number) => Math.sin(dtr(d))
const cos = (d: number) => Math.cos(dtr(d))
const tan = (d: number) => Math.tan(dtr(d))
const arcsin = (x: number) => rtd(Math.asin(x))
const arccos = (x: number) => rtd(Math.acos(x))
const arctan2 = (y: number, x: number) => rtd(Math.atan2(y, x))
const arccot = (x: number) => rtd(Math.atan(1 / x))
const fix = (a: number, b: number) => {
  a = a - b * Math.floor(a / b)
  return a < 0 ? a + b : a
}
const fixAngle = (a: number) => fix(a, 360)
const fixHour = (a: number) => fix(a, 24)
const timeDiff = (t1: number, t2: number) => fixHour(t2 - t1)

function julian(year: number, month: number, day: number) {
  if (month <= 2) {
    year -= 1
    month += 12
  }
  const A = Math.floor(year / 100)
  const B = 2 - A + Math.floor(A / 4)
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5
}

function sunPosition(jd: number) {
  const D = jd - 2451545.0
  const g = fixAngle(357.529 + 0.98560028 * D)
  const q = fixAngle(280.459 + 0.98564736 * D)
  const L = fixAngle(q + 1.915 * sin(g) + 0.02 * sin(2 * g))
  const e = 23.439 - 0.00000036 * D
  const RA = arctan2(cos(e) * sin(L), cos(L)) / 15
  const eqt = q / 15 - fixHour(RA)
  const decl = arcsin(sin(e) * sin(L))
  return { declination: decl, equation: eqt }
}

export type PrayerTimes = Record<PrayerKey, number> // часы от полуночи по местному времени (NaN, если не определено)

/**
 * @param date  календарная дата (год, месяц 1–12, день) в месте расчёта
 * @param lat,lng  координаты
 * @param tzHours  смещение часового пояса места, ч (Москва = 3)
 */
export function computePrayerTimes(
  date: { year: number; month: number; day: number },
  lat: number,
  lng: number,
  tzHours: number,
  methodKey: MethodKey = 'MWL',
): PrayerTimes {
  const method = METHODS[methodKey]
  const jDate = julian(date.year, date.month, date.day) - lng / (15 * 24)

  const midDay = (time: number) => fixHour(12 - sunPosition(jDate + time).equation)
  const sunAngleTime = (angle: number, time: number, ccw = false) => {
    const decl = sunPosition(jDate + time).declination
    const noon = midDay(time)
    const t = (1 / 15) * arccos((-sin(angle) - sin(decl) * sin(lat)) / (cos(decl) * cos(lat)))
    return noon + (ccw ? -t : t)
  }
  const asrTime = (factor: number, time: number) => {
    const decl = sunPosition(jDate + time).declination
    const angle = -arccot(factor + tan(Math.abs(lat - decl)))
    return sunAngleTime(angle, time)
  }

  const riseSet = 0.833
  // Первое приближение (часы), затем уточнение по нему
  let t = { fajr: 5, sunrise: 6, dhuhr: 12, asr: 13, sunset: 18, isha: 18 }
  for (let i = 0; i < 2; i++) {
    const p = Object.fromEntries(Object.entries(t).map(([k, v]) => [k, v / 24])) as typeof t
    t = {
      fajr: sunAngleTime(method.fajr, p.fajr, true),
      sunrise: sunAngleTime(riseSet, p.sunrise, true),
      dhuhr: midDay(p.dhuhr),
      asr: asrTime(1, p.asr),
      sunset: sunAngleTime(riseSet, p.sunset),
      isha: typeof method.isha === 'number' ? sunAngleTime(method.isha, p.isha) : NaN,
    }
  }

  // Перевод в местное время
  const shift = tzHours - lng / 15
  const r = {
    fajr: t.fajr + shift,
    sunrise: t.sunrise + shift,
    dhuhr: t.dhuhr + shift,
    asr: t.asr + shift,
    maghrib: t.sunset + shift,
    isha: t.isha + shift,
  }
  if (typeof method.isha !== 'number') r.isha = r.maghrib + method.isha.minutes / 60

  // Высокие широты (летом на севере сумерки не заканчиваются): правило «середины ночи»
  if (Number.isFinite(r.sunrise) && Number.isFinite(r.maghrib)) {
    const night = timeDiff(r.maghrib, r.sunrise)
    const portion = night / 2
    if (!Number.isFinite(r.fajr) || timeDiff(r.fajr, r.sunrise) > portion) r.fajr = r.sunrise - portion
    if (typeof method.isha === 'number' && (!Number.isFinite(r.isha) || timeDiff(r.maghrib, r.isha) > portion)) {
      r.isha = r.maghrib + portion
    }
  }

  return {
    fajr: fixHour(r.fajr),
    sunrise: fixHour(r.sunrise),
    dhuhr: fixHour(r.dhuhr),
    asr: fixHour(r.asr),
    maghrib: fixHour(r.maghrib),
    isha: fixHour(r.isha),
  }
}

export function formatTime(hours: number): string {
  if (!Number.isFinite(hours)) return '—'
  const total = Math.round(fixHour(hours) * 60) % (24 * 60)
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Смещение часового пояса (ч) для IANA-зоны на момент `at`. */
export function tzOffsetHours(timeZone: string, at: Date = new Date()): number {
  try {
    const part = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
      .formatToParts(at)
      .find((p) => p.type === 'timeZoneName')?.value
    const m = part?.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/)
    if (!m) return 0
    const v = Number(m[2]) + (m[3] ? Number(m[3]) / 60 : 0)
    return m[1] === '-' ? -v : v
  } catch {
    return -at.getTimezoneOffset() / 60
  }
}

/** Дата (год/месяц/день) и время (ч) «сейчас» в заданном часовом поясе. */
export function nowIn(timeZone: string, at: Date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(at)
  const n = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0)
  return {
    date: { year: n('year'), month: n('month'), day: n('day') },
    hours: n('hour') + n('minute') / 60 + n('second') / 3600,
  }
}

/** Ближайший намаз (восход не считается намазом). */
export function nextPrayer(times: PrayerTimes, nowHours: number): { key: PrayerKey; inHours: number } {
  const order: PrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
  for (const k of order) if (Number.isFinite(times[k]) && times[k] > nowHours) return { key: k, inHours: times[k] - nowHours }
  return { key: 'fajr', inHours: 24 - nowHours + times.fajr }
}

export type City = { name: string; lat: number; lng: number; tz: string }

export const CITIES: City[] = [
  { name: 'Москва', lat: 55.7558, lng: 37.6173, tz: 'Europe/Moscow' },
  { name: 'Санкт-Петербург', lat: 59.9343, lng: 30.3351, tz: 'Europe/Moscow' },
  { name: 'Казань', lat: 55.7963, lng: 49.1088, tz: 'Europe/Moscow' },
  { name: 'Нижний Новгород', lat: 56.2965, lng: 43.9361, tz: 'Europe/Moscow' },
  { name: 'Махачкала', lat: 42.9849, lng: 47.5047, tz: 'Europe/Moscow' },
  { name: 'Грозный', lat: 43.3178, lng: 45.6949, tz: 'Europe/Moscow' },
  { name: 'Нальчик', lat: 43.4853, lng: 43.6071, tz: 'Europe/Moscow' },
  { name: 'Черкесск', lat: 44.2233, lng: 42.0578, tz: 'Europe/Moscow' },
  { name: 'Назрань', lat: 43.2257, lng: 44.7645, tz: 'Europe/Moscow' },
  { name: 'Астрахань', lat: 46.3497, lng: 48.0408, tz: 'Europe/Astrakhan' },
  { name: 'Уфа', lat: 54.7388, lng: 55.9721, tz: 'Asia/Yekaterinburg' },
  { name: 'Екатеринбург', lat: 56.8389, lng: 60.6057, tz: 'Asia/Yekaterinburg' },
  { name: 'Тюмень', lat: 57.1522, lng: 65.5272, tz: 'Asia/Yekaterinburg' },
  { name: 'Новосибирск', lat: 55.0084, lng: 82.9357, tz: 'Asia/Novosibirsk' },
  { name: 'Алматы', lat: 43.222, lng: 76.8512, tz: 'Asia/Almaty' },
  { name: 'Ташкент', lat: 41.2995, lng: 69.2401, tz: 'Asia/Tashkent' },
  { name: 'Бишкек', lat: 42.8746, lng: 74.5698, tz: 'Asia/Bishkek' },
  { name: 'Баку', lat: 40.4093, lng: 49.8671, tz: 'Asia/Baku' },
  { name: 'Стамбул', lat: 41.0082, lng: 28.9784, tz: 'Europe/Istanbul' },
  { name: 'Мекка', lat: 21.3891, lng: 39.8579, tz: 'Asia/Riyadh' },
  { name: 'Медина', lat: 24.5247, lng: 39.5692, tz: 'Asia/Riyadh' },
]

/* ---------- Хиджра ---------- */

export const HIJRI_MONTHS = [
  'мухаррама',
  'сафара',
  'раби аль-авваля',
  'раби ас-сани',
  'джумады аль-уля',
  'джумады ас-сании',
  'раджаба',
  'шаабана',
  'рамадана',
  'шавваля',
  'зуль-каады',
  'зуль-хиджи',
]

const HIJRI_MONTHS_AR = [
  'محرم',
  'صفر',
  'ربيع الأول',
  'ربيع الآخر',
  'جمادى الأولى',
  'جمادى الآخرة',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذو القعدة',
  'ذو الحجة',
]

/** Дата по хиджре (календарь Умм аль-Кура) с поправкой в днях. */
export function hijriDate(at: Date, offsetDays = 0, timeZone?: string) {
  const d = new Date(at.getTime() + offsetDays * 86400000)
  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      timeZone,
    }).formatToParts(d)
    const n = (t: string) => Number(parts.find((p) => p.type === t)?.value)
    const day = n('day')
    const month = n('month')
    const year = n('year')
    if (!day || !month || !year) return null
    return {
      day,
      month,
      year,
      ru: `${day} ${HIJRI_MONTHS[month - 1]} ${year} г. х.`,
      ar: `${day} ${HIJRI_MONTHS_AR[month - 1]} ${year} هـ`,
    }
  } catch {
    return null
  }
}
