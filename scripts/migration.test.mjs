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
