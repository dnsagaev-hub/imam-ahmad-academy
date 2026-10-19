/**
 * Превращает обычную ссылку на видео (или целый код для вставки) в ссылку для встраивания.
 * Поддерживает YouTube, Rutube, VK Видео (vk.com / vkvideo.ru), Kinescope.
 * Незнакомую https-ссылку возвращает как есть; всё остальное — null.
 */
export function toEmbedUrl(input?: string | null): string | null {
  if (!input) return null
  let raw = String(input).trim()
  // Вставили целиком <iframe src="…"> — берём адрес из src
  const src = raw.match(/src\s*=\s*["']([^"']+)["']/i)
  if (src) raw = src[1]
  raw = raw.replace(/&amp;/g, '&')
  if (raw.startsWith('//')) raw = 'https:' + raw
  if (!/^https?:\/\//i.test(raw)) raw = 'https://' + raw
  let u: URL
  try {
    u = new URL(raw)
  } catch {
    return null
  }
  const host = u.hostname.replace(/^(www\.|m\.)/, '')
  const path = u.pathname

  // ---- YouTube ----
  if (host === 'youtu.be' || host.endsWith('youtube.com') || host === 'youtube-nocookie.com') {
    let id: string | null = null
    if (host === 'youtu.be') id = path.split('/')[1] || null
    else if (u.searchParams.get('v')) id = u.searchParams.get('v')
    else {
      const m = path.match(/^\/(embed|shorts|live|v)\/([\w-]{6,})/)
      if (m) id = m[2]
    }
    if (!id) return null
    const t = u.searchParams.get('t') || u.searchParams.get('start')
    let start = 0
    if (t) {
      const hms = t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/)
      start = hms ? Number(hms[1] || 0) * 3600 + Number(hms[2] || 0) * 60 + Number(hms[3] || 0) : Number(t) || 0
    }
    return `https://www.youtube.com/embed/${id}${start ? `?start=${start}` : ''}`
  }

  // ---- Rutube ----
  if (host.endsWith('rutube.ru')) {
    if (path.startsWith('/play/embed/')) return u.toString().replace(/^http:/, 'https:')
    const m = path.match(/^\/(?:video|shorts)\/(?:private\/)?([0-9a-f]{20,})/i)
    if (!m) return null
    const p = u.searchParams.get('p')
    return `https://rutube.ru/play/embed/${m[1]}${p ? `?p=${encodeURIComponent(p)}` : ''}`
  }

  // ---- VK Видео ----
  if (host === 'vk.com' || host === 'vk.ru' || host.endsWith('vkvideo.ru')) {
    if (path.startsWith('/video_ext.php')) return `https://vk.com/video_ext.php${u.search}`
    const z = u.searchParams.get('z') || ''
    const m = (path + ' ' + z).match(/(?:video|clip)(-?\d+)_(\d+)/)
    if (!m) return null
    const hash = u.searchParams.get('hash') || u.searchParams.get('list')
    return `https://vk.com/video_ext.php?oid=${m[1]}&id=${m[2]}${hash ? `&hash=${hash}` : ''}&hd=2`
  }

  // ---- Kinescope ----
  if (host.endsWith('kinescope.io')) {
    if (path.startsWith('/embed/')) return `https://kinescope.io${path}`
    const id = path.split('/').filter(Boolean)[0]
    return id ? `https://kinescope.io/embed/${id}` : null
  }

  return u.protocol === 'https:' ? u.toString() : null
}
