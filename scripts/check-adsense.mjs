import { chromium } from 'playwright-core'

const BASE = 'http://localhost:4321'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
let fail = 0
const ok = (c, m) => { if (!c) fail++; console.log(`${c ? '·' : '✗'} ${m}`) }

// 1. Brand-new visitor: no GTM, no analytics cookie, language sheet first.
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } })
  const p = await ctx.newPage()
  const gtm = []
  p.on('request', r => { if (/googletagmanager\.com/.test(r.url())) gtm.push(r.url()) })
  await p.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 60000 })
  await p.waitForTimeout(1500)
  ok(gtm.length === 0, `first visit loads no GTM (saw ${gtm.length})`)
  ok(await p.isVisible('#lang-chooser'), 'language chooser shown first')
  ok(!(await p.isVisible('#cookie-banner')), 'cookie banner waits its turn')

  await p.click('[data-pick="en"]')
  await p.waitForTimeout(600)
  ok(await p.isVisible('#cookie-banner'), 'cookie banner appears after language choice')

  const consentDefault = await p.evaluate(() =>
    (window.dataLayer || []).filter(a => a[0] === 'consent' && a[1] === 'default').length)
  ok(consentDefault === 1, 'consent default pushed before any tag')

  await p.click('#cookie-reject')
  await p.waitForTimeout(900)
  const denied = await p.evaluate(() => {
    const u = (window.dataLayer || []).filter(a => a[0] === 'consent' && a[1] === 'update').pop()
    return u && u[2].analytics_storage === 'denied' && u[2].ad_storage === 'denied'
  })
  ok(denied, '"Essential only" denies analytics + ad storage')
  ok(await p.evaluate(() => localStorage.getItem('th_consent')) === 'essential', 'choice persisted')
  await ctx.close()
}

// 2. Returning visitor who accepted: GTM loads.
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } })
  await ctx.addInitScript(() => {
    try { localStorage.setItem('th_lang', 'en'); localStorage.setItem('th_consent', 'all') } catch {}
  })
  const p = await ctx.newPage()
  const gtm = []
  p.on('request', r => { if (/googletagmanager\.com/.test(r.url())) gtm.push(r.url()) })
  await p.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 60000 })
  await p.waitForTimeout(1500)
  ok(gtm.length > 0, 'GTM loads once consent is on file')
  ok(!(await p.isVisible('#cookie-banner')), 'banner not shown again')
  await ctx.close()
}

// 3. Legal pages render, are indexable, and are linked from the footer.
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } })
  await ctx.addInitScript(() => {
    try { localStorage.setItem('th_lang', 'en'); localStorage.setItem('th_consent', 'all') } catch {}
  })
  const p = await ctx.newPage()
  for (const [path, needles] of [
    ['/privacy-policy', ['google.com/settings/ads', 'aboutads.info/choices', 'Third-party vendors, including Google']],
    ['/terms', ['introduction service', 'Governing law']],
  ]) {
    const errs = []
    p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) })
    await p.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 60000 })
    await p.waitForTimeout(800)
    const html = await p.content()
    for (const n of needles) ok(html.includes(n), `${path} contains "${n.slice(0, 38)}"`)
    const robots = await p.getAttribute('meta[name="robots"]', 'content')
    ok(/index/.test(robots) && !/noindex/.test(robots), `${path} is indexable (${robots})`)
    const real = errs.filter(e => !/favicon|gtm|googletagmanager|sw\.js|fonts\.|net::ERR/i.test(e))
    ok(real.length === 0, `${path} no console errors${real.length ? ': ' + real[0] : ''}`)
    errs.length = 0
  }
  await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(800)
  const footer = await p.content()
  ok(footer.includes('href="/privacy-policy"'), 'Privacy linked from footer')
  ok(footer.includes('href="/terms"'), 'Terms linked from footer')
  await ctx.close()
}

// 4. Empty district pages are noindex; covered ones are not.
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } })
  await ctx.addInitScript(() => {
    try { localStorage.setItem('th_lang', 'en'); localStorage.setItem('th_consent', 'all') } catch {}
  })
  const p = await ctx.newPage()
  for (const [path, expectNoindex] of [
    ['/tilers/mullaitivu', true],
    ['/services/floor-tiling/mullaitivu', true],
    ['/tilers/gampaha', false],
  ]) {
    await p.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 60000 })
    const robots = await p.getAttribute('meta[name="robots"]', 'content')
    const isNo = /noindex/.test(robots)
    ok(isNo === expectNoindex, `${path} robots="${robots}" (expected ${expectNoindex ? 'noindex' : 'index'})`)
  }
  await ctx.close()
}

// 5. Sitemap only advertises districts that have something on them.
{
  const xml = await (await fetch(BASE + '/sitemap.xml')).text()
  const districts = [...xml.matchAll(/\/tilers\/([a-z-]+)</g)].map(m => m[1])
  ok(districts.includes('gampaha'), `sitemap lists covered district gampaha`)
  ok(!districts.includes('mullaitivu'), 'sitemap omits empty district mullaitivu')
  ok(xml.includes('/privacy-policy'), 'sitemap lists /privacy-policy')
  ok(!/<loc>[^<]*\/privacy<\/loc>/.test(xml), 'sitemap does not also list the old /privacy')
  ok(xml.includes('/terms'), 'sitemap lists /terms')
  console.log(`  sitemap district pages: ${districts.length} (was 25)`)
}

// 6. AdSense tags, checked against the production build rather than the dev
//    server: PUBLIC_ADSENSE_CLIENT lives in .env.production, so `astro dev`
//    is deliberately ad-free and would always "pass" here.
{
  const { readFileSync, existsSync } = await import('node:fs')
  const blog = 'dist/blog/how-to-choose-a-tiler/index.html'
  if (!existsSync(blog)) {
    console.log('· ad tag ordering skipped — run `npm run build` first')
  } else {
    const html = readFileSync(blog, 'utf8')
    const ads = html.indexOf('adsbygoogle.js')
    const consent = html.indexOf("gtag('consent', 'default'")
    ok(ads !== -1, 'built blog page carries the ad script')
    ok(consent !== -1 && consent < ads, 'consent defaults are registered before the ad script')
    for (const page of ['dist/post-project/index.html', 'dist/login/index.html']) {
      if (!existsSync(page)) continue
      ok(!readFileSync(page, 'utf8').includes('adsbygoogle.js'), `${page} carries no ad script`)
    }
  }
}

await b.close()
console.log(fail ? `\n${fail} FAILURES` : '\nAll checks passed')
process.exit(fail ? 1 : 0)
