// Check the built Worker the way Cloudflare runs it.
//
// The other check scripts talk to `astro dev`, which uses a different runtime
// and a different router. The bug this script exists to catch — an unmatched
// path returning 500 because the adapter called env.ASSETS.fetch() with no
// ASSETS binding — is invisible to all of them, because in dev there is no
// binding layer to get wrong. So this one boots the real Worker from dist/.
//
// Run `npm run build` first.
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import { fileURLToPath } from 'node:url'
import { createServer } from 'node:net'

// Pick a free port at run time. A fixed one is a trap: workerd can outlive an
// interrupted run, and an orphan holding the port accepts connections without
// answering them, so probes time out instead of failing fast and the run looks
// like a slow boot for minutes.
const PORT = await new Promise((resolve, reject) => {
  const probe = createServer()
  probe.on('error', reject)
  probe.listen(0, '127.0.0.1', () => {
    const { port } = probe.address()
    probe.close(() => resolve(port))
  })
})
const BASE = `http://127.0.0.1:${PORT}`

// [path, expected status, expected Location (substring) if a redirect]
const CASES = [
  ['/', 200],
  ['/blog', 200],
  ['/blog/how-to-choose-a-tiler', 200],
  ['/guides', 200],
  ['/estimator', 200],
  // Unmatched paths must render the 404 page, not throw. Google reads a
  // sustained 5xx as "site is down" and stops processing the URL; a 404 or a
  // 301 is information it can act on.
  ['/nope-xyz', 404],
  ['/deep/unknown/path', 404],
  ['/blog/no-such-article', 404],
  // Marketplace routes that moved to wedahub.lk in the split. These are the
  // URLs Google already has indexed, so they must 301 rather than 404.
  ['/providers', 301, 'https://wedahub.lk/providers'],
  ['/providers/some-tiler', 301, 'https://wedahub.lk/providers/some-tiler'],
  ['/jobs', 301, 'https://wedahub.lk/jobs'],
  ['/tilers/colombo', 301, 'https://wedahub.lk/tilers/colombo'],
  ['/services/floor-tiling/colombo', 301, 'https://wedahub.lk/services/floor-tiling/colombo'],
  ['/post-project', 301, 'https://wedahub.lk/post-project'],
  ['/join-tilershub', 301, 'https://wedahub.lk/join-wedahub'],
]

// Spawn the installed binary rather than going through npx: npx wants a TTY to
// resolve the package and hangs without one, silently. WRANGLER_SEND_METRICS
// and CI suppress wrangler's own first-run prompt for the same reason.
const bin = fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url))
const worker = spawn(process.execPath, [bin, 'dev', '--port', String(PORT), '--local'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  detached: true, // own process group, so stop() can take workerd down with it
  cwd: fileURLToPath(new URL('..', import.meta.url)),
  env: { ...process.env, WRANGLER_SEND_METRICS: 'false', CI: 'true' },
})
let log = ''
worker.stdout.on('data', d => { log += d })
worker.stderr.on('data', d => { log += d })

// Signal the group, not just wrangler: wrangler spawns workerd as a child and
// killing the parent alone leaves it holding the port.
const stop = () => { try { process.kill(-worker.pid, 'SIGKILL') } catch { try { worker.kill('SIGKILL') } catch {} } }
process.on('exit', stop)

// Every response body must be consumed or cancelled. undici keeps a socket
// checked out of the pool until the body is settled, so a handful of ignored
// bodies is enough to deadlock the run with no error and no output.
async function request(path, follow) {
  // 200 cases follow redirects: prerendered routes are served from a directory,
  // so Cloudflare's asset layer 307s /a/b to /a/b/ and the check should be
  // measuring whether the page is reachable, not which spelling it settles on.
  // Redirect and 404 cases stay manual, because there the status is the point.
  const res = await fetch(BASE + path, {
    redirect: follow ? 'follow' : 'manual',
    signal: AbortSignal.timeout(30000),
  })
  const body = res.status >= 500 ? await res.text() : (await res.body?.cancel(), '')
  return { status: res.status, location: res.headers.get('location') || '', body }
}

async function waitForReady() {
  for (let i = 0; i < 60; i++) {
    try {
      await request('/')
      return true
    } catch { await sleep(1000) }
  }
  return false
}

if (!await waitForReady()) {
  console.error('worker never came up. wrangler output:\n' + log)
  stop()
  process.exit(1)
}

const failures = []
for (const [path, status, location] of CASES) {
  let res
  try {
    res = await request(path, status === 200)
  } catch (e) {
    failures.push(`${path} — request failed: ${e.message}`)
    continue
  }
  if (res.status !== status) {
    const detail = res.body ? ` — ${res.body.split('\n')[0]}` : ''
    failures.push(`${path} — expected ${status}, got ${res.status}${detail}`)
    continue
  }
  if (location && res.location !== location) {
    failures.push(`${path} — expected Location ${location}, got ${res.location || '(none)'}`)
  } else {
    console.log(`  ok  ${status}  ${path}${res.location ? ' → ' + res.location : ''}`)
  }
}

stop()

if (failures.length) {
  console.error(`\n${failures.length} failure(s):`)
  for (const f of failures) console.error('  ✗ ' + f)
  process.exit(1)
}
console.log(`\nall ${CASES.length} checks passed`)
