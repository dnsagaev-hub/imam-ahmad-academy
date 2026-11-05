'use client'

import { useEffect } from 'react'

/** На телефоне полоса вкладок листается: показываем открытую вкладку, если она за краем экрана. */
export function ScrollToCurrent() {
  useEffect(() => {
    const bar = document.getElementById('course-tabs')
    const on = bar?.querySelector<HTMLElement>('[aria-current="page"]')
    if (bar && on && bar.scrollWidth > bar.clientWidth) bar.scrollLeft = on.offsetLeft - 16
  }, [])
  return null
}
