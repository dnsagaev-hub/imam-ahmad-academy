// Снимки схем урока: node check-schemes.cjs <slug> <ширина, обычно 390>; печатает число схем и есть ли прокрутка вбок.
const { chromium } = require('playwright')
;(async () => {
  const [slug, w, prefix] = [process.argv[2], +process.argv[3], process.argv[4] || 'sch']
  const br = await chromium.launch()
  const ctx = await br.newContext({ viewport: { width: w, height: 900 } })
  const attempts = Array.from({ length: 300 }, (_, i) => ({ lessonId: String(i + 1), lessonTitle: 'x', score: 100, passed: true, attempt: 1, date: new Date().toISOString() }))
  await ctx.addInitScript((v) => localStorage.setItem('imam-ahmad-academy:progress:v1', v), JSON.stringify({ v: 1, attempts }))
  const p = await ctx.newPage()
  await p.goto(`http://127.0.0.1:3000/lessons/${slug}`, { waitUntil: 'networkidle' })
  const n = await p.locator('.sch').count()
  console.log('schemes', n, 'hscroll', await p.evaluate(() => document.documentElement.scrollWidth > innerWidth))
  for (let i = 0; i < n; i++) await p.locator('.sch').nth(i).screenshot({ path: `${prefix}_${slug}_${w}_${i}.png` })
  await br.close()
})()
