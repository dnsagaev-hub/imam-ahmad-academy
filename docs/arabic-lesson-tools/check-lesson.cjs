// Проверка урока на запущенном сайте: node check-lesson.cjs <slug> <ответы теста через запятую, 1–4>
// Пример: node check-lesson.cjs arabskiy-urok-21 3,1,4,2,3,4,1,2,4,3,1,2,3,1,4
// Печатает ширину страницы (горизонтальная прокрутка), разделы, результат теста; снимки — в текущей папке.
const { chromium } = require('playwright')
const SLUG = process.argv[2]
const ANS = (process.argv[3] || '').split(',').map(Number)
;(async () => {
  const br = await chromium.launch()
  const attempts = Array.from({ length: 300 }, (_, i) => ({ lessonId: String(i + 1), lessonTitle: 'x', score: 100, passed: true, attempt: 1, date: new Date().toISOString() }))
  for (const [name, w, h] of [['desk', 1440, 900], ['phone', 390, 844]]) {
    const ctx = await br.newContext({ viewport: { width: w, height: h } })
    await ctx.addInitScript((v) => localStorage.setItem('imam-ahmad-academy:progress:v1', v), JSON.stringify({ v: 1, attempts }))
    const p = await ctx.newPage()
    await p.goto('http://127.0.0.1:3000/lessons/' + SLUG, { waitUntil: 'networkidle' })
    const sw = await p.evaluate(() => document.documentElement.scrollWidth)
    console.log(name, 'scrollWidth', sw, sw > w ? 'ГОРИЗОНТАЛЬНАЯ ПРОКРУТКА' : 'ok')
    console.log('headings:', await p.locator('.ar-h').allInnerTexts())
    await p.locator('#slovar').screenshot({ path: `${SLUG}_${name}_slovar.png` })
    await p.locator('.ar-grammar').screenshot({ path: `${SLUG}_${name}_grammar.png` })
    await p.locator('#text-h').locator('xpath=..').screenshot({ path: `${SLUG}_${name}_text.png` })
    await p.locator('#keys summary').click()
    await p.locator('#keys').screenshot({ path: `${SLUG}_${name}_keys.png` })
    if (name === 'desk') {
      const C = ANS
      const Z = () => p.locator('.q-text').last().locator('xpath=..')
      for (let i = 0; i < C.length; i++) {
        await Z().locator('button.opt').nth(C[i] - 1).click()
        await Z().locator('button.btn', { hasText: 'Ответить' }).click()
        await p.waitForTimeout(250)
        const txt = await Z().innerText()
        if (!/Верно/.test(txt)) console.log('Q', i + 1, 'NOT RIGHT?', txt.slice(0, 200))
        const nb = Z().locator('button.btn', { hasText: /Следующий вопрос|Завершить|Результат/ })
        if (await nb.count()) await nb.first().click()
        await p.waitForTimeout(250)
      }
      await p.waitForTimeout(800)
      console.log('result:', (await p.locator('body').innerText()).match(/\d+\s*%[^\n]*/g)?.slice(-3))
      await p.screenshot({ path: SLUG + '_quiz_end.png' })
    }
    await ctx.close()
  }
  await br.close()
})()
