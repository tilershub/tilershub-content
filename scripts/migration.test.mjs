import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { migrationRedirect } from '../src/lib/migration.js'
const cases = [["/blog/how-to-choose-a-tiler", null], ["/estimator", null], ["/guides/tiling-cost-guide-sri-lanka", null], ["/", null], ["/not-a-page", null], ["/providers/name?utm_source=old", "https://wedahub.lk/providers/name?utm_source=old"], ["/services/floor-tiling/colombo", "https://wedahub.lk/services/floor-tiling/colombo"], ["/join-tilershub", "https://wedahub.lk/join-wedahub"], ["/jobs/123", "https://wedahub.lk/jobs/123"], ["/provider-not-a-route", null], ["/auth/callback?code=private", null]]
for (const [path, destination] of cases) test(path, () => assert.equal(migrationRedirect(new URL(path, 'https://tilershub.lk')), destination))
test('redirect destination ignores the incoming host', () => {
  const output = migrationRedirect(new URL(cases[0][0], 'https://untrusted.example'))
  assert.equal(output, cases[0][1])
})
test('deployment is explicit during the split', () => {
 const workflow = readFileSync(new URL('../.github/workflows/deploy.yml', import.meta.url), 'utf8')
 assert.match(workflow, /workflow_dispatch/); assert.doesNotMatch(workflow, /branches: \[main\]/)
})
test('sitemap keeps articles and excludes migrated marketplace URLs', async () => {
  const { GET } = await import('../src/pages/sitemap.xml.js')
  const xml = await GET().text()
  assert.ok(xml.includes('https://tilershub.lk/blog/how-to-choose-a-tiler'))
  assert.ok(xml.includes('https://tilershub.lk/estimator'))
  assert.ok(!xml.includes('https://tilershub.lk/providers'))
  assert.ok(!xml.includes('https://wedahub.lk'))
})

// The "/not-a-page" case above asserts that an unknown path is not redirected.
// That only holds at runtime if an unmatched request can reach Astro at all.
// With not_found_handling = "none" it falls through to the Worker, and the
// adapter's no-route-matched branch calls env.ASSETS.fetch() before rendering
// anything — before the middleware, so before migrationRedirect. If [assets]
// does not declare a binding, env.ASSETS is undefined and every path that is
// not an exact route match returns 500 instead of a 404 or one of the 301s
// above — which is what tilershub.lk did for two days after the split, to
// roughly 150 URLs Google still had indexed.
test('[assets] binds ASSETS, so unmatched paths reach the middleware', () => {
  const config = readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8')
  const assets = config.split(/^\[/m).find(section => section.startsWith('assets]')) ?? ''
  if (!/not_found_handling\s*=\s*"none"/.test(assets)) return
  assert.match(assets, /^\s*binding\s*=\s*"ASSETS"/m,
    'wrangler.toml [assets] sets not_found_handling = "none" but does not bind ASSETS')
})
