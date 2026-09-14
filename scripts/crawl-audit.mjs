// Crawl the site the way a reviewer or Googlebot would: follow every internal
// link, flag anything that does not return 200, and check that each page
// carries a sane canonical, title and description.
import { chromium } from 'playwright-core'

const BASE = 'http://localhost:4321'
const SEEDS = ['/', '/blog', '/guides', '/providers', '/jobs', '/tile', '/bathrooms', '/tools',
  '/categories', '/estimator', '/about', '/contact', '/privacy-policy', '/terms', '/post-project',
  '/join-tilershub']

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } })
await ctx.addInitScript(() => {
  try { localStorage.setItem('th_lang', 'en'); localStorage.setItem('th_consent', 'essential') } catch {}
})
const page = await ctx.newPage()

const seen = new Set()
const queue = [...SEEDS]
const problems = []
const meta = []

function normalise(href) {
  try {
    const u = new URL(href, BASE)
    if (u.origin !== BASE) return null
    if (/^\/(api|auth)\//.test(u.pathname)) return null
    return u.pathname + u.search
  } catch { return null }
}

while (queue.length && seen.size < 160) {
  const path = queue.shift()
  if (!path || seen.has(path)) continue
  seen.add(path)

  const res = await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 45000 })
    .catch(e => ({ status: () => 0, _err: e.message }))
  const status = res.status()
  if (status !== 200) { problems.push(`${status || 'ERR'}  ${path}`); continue }
  await page.waitForTimeout(250)

  const info = await page.evaluate(() => ({
    title: document.title,
    desc: document.querySelector('meta[name="description"]')?.content || '',
    canonical: document.querySelector('link[rel="canonical"]')?.href || '',
    robots: document.querySelector('meta[name="robots"]')?.content || '',
    h1: [...document.querySelectorAll('h1')].map(h => h.textContent.trim()).filter(Boolean),
    links: [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')),
    text: document.body.innerText.replace(/\s+/g, ' ').trim().length,
  }))
  meta.push({ path, ...info })

  for (const href of info.links) {
    const n = normalise(href)
    if (n && !seen.has(n) && !queue.includes(n)) queue.push(n)
  }
}

console.log(`crawled ${seen.size} pages\n`)

console.log('── Non-200 responses ──')
console.log(problems.length ? problems.join('\n') : '  none')

const noCanon = meta.filter(m => !m.canonical)
const badCanon = meta.filter(m => m.canonical && !m.canonical.startsWith('https://tilershub.lk'))
const noDesc = meta.filter(m => !m.desc)
const noH1 = meta.filter(m => m.h1.length === 0 && !/noindex/.test(m.robots))
const multiH1 = meta.filter(m => m.h1.length > 1)
const thin = meta.filter(m => m.text < 600 && !/noindex/.test(m.robots))
const dupTitle = Object.entries(
  meta.reduce((a, m) => { (a[m.title] ??= []).push(m.path); return a }, {})
).filter(([, v]) => v.length > 1)

const report = (label, rows, fmt = r => '  ' + r.path) => {
  console.log(`\n── ${label} (${rows.length}) ──`)
  if (!rows.length) { console.log('  none'); return }
  console.log(rows.slice(0, 12).map(fmt).join('\n'))
  if (rows.length > 12) console.log(`  … +${rows.length - 12} more`)
}

report('Missing canonical', noCanon)
report('Canonical not on production origin', badCanon, r => `  ${r.path} → ${r.canonical}`)
report('Missing meta description', noDesc)
report('No <h1> (and indexable)', noH1)
report('More than one <h1>', multiH1, r => `  ${r.path} (${r.h1.length})`)
report('Thin: under 600 chars of text and indexable', thin, r => `  ${r.path} (${r.text} chars)`)
report('Duplicate <title>', dupTitle, ([t, v]) => `  "${t.slice(0, 50)}" ×${v.length}: ${v.slice(0, 3).join(', ')}`)

const noindexed = meta.filter(m => /noindex/.test(m.robots))
console.log(`\n── Indexable: ${meta.length - noindexed.length} / ${meta.length} crawled ──`)

await b.close()
const fail = problems.length + noCanon.length + badCanon.length + noDesc.length + noH1.length
process.exit(fail ? 1 : 0)
