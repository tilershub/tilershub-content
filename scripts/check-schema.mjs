#!/usr/bin/env node
// Verifies that every table.column referenced in src/ actually exists.
//
// Two production outages came from code referencing columns that were never
// in the database (bids.user_id, reviews.user_id) — PostgREST only complains
// at runtime, so nothing caught it until users hit it. This probes each
// referenced column against the REST API and fails the build if one is
// missing.
//
// Read-only: issues GETs with limit=1 and never writes.
//
//   node scripts/check-schema.mjs

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const SRC = 'src'
const EXTS = new Set(['.js', '.jsx', '.ts', '.astro'])
const FILTERS = ['eq', 'neq', 'in', 'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'is', 'order', 'not']

// Public anon credentials — already shipped in the client bundle.
const URL = process.env.SUPABASE_URL || 'https://ginrgwaciblcvxvkbeyd.supabase.co'
const KEY = process.env.SUPABASE_ANON_KEY || readAnonKeyFromSource()

function readAnonKeyFromSource() {
  const m = readFileSync(join(SRC, 'lib', 'supabase.js'), 'utf8')
    .match(/SUPABASE_ANON_KEY\s*=\s*'([^']+)'/)
  return m?.[1]
}

function walk(dir) {
  return readdirSync(dir).flatMap(entry => {
    const p = join(dir, entry)
    if (statSync(p).isDirectory()) return walk(p)
    return EXTS.has(extname(p)) ? [p] : []
  })
}

// Collect { table -> Set(columns) } from .from('t').select(...)/.eq(...) chains.
function collectReferences(files) {
  const refs = new Map()
  const add = (table, col) => {
    if (!refs.has(table)) refs.set(table, new Set())
    if (col) refs.get(table).add(col)
  }

  for (const file of files) {
    const source = readFileSync(file, 'utf8')
    for (const match of source.matchAll(/(\w+)?\.from\('([a-z_]+)'\)/g)) {
      // storage.from('bucket') is a storage bucket, not a table
      if (match[1] === 'storage') continue
      const table = match[2]
      add(table, null)
      // The query chain ends at the next .from(), a statement end, or a blank
      // line — otherwise columns from an adjacent query bleed in.
      let chain = source.slice(match.index + match[0].length, match.index + 700)
      for (const stop of [/\.from\('/, /\n\s*\n/, /\n\s*\]\)/, /;\s*\n/, /\.then\(/]) {
        const hit = chain.search(stop)
        if (hit !== -1) chain = chain.slice(0, hit)
      }

      const select = chain.match(/\.select\(\s*'([^']+)'/)
      if (select) {
        for (const raw of select[1].split(',')) {
          const col = raw.trim()
          // skip '*', embedded relations like providers(*), and aliases
          if (col && col !== '*' && !col.includes('(') && !col.includes(':')) add(table, col)
        }
      }
      for (const method of FILTERS) {
        for (const m of chain.matchAll(new RegExp(`\\.${method}\\('([a-z_]+)'`, 'g'))) {
          add(table, m[1])
        }
      }
    }
  }
  return refs
}

async function columnExists(table, column) {
  const res = await fetch(`${URL}/rest/v1/${table}?select=${column}&limit=1`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  })
  if (res.ok) return { ok: true }
  const body = await res.json().catch(() => ({}))
  const message = body.message || `HTTP ${res.status}`
  // Missing column/table → real failure. Anything else (RLS, auth) is not a schema problem.
  const schemaError = /PGRST204|42703|does not exist|Could not find/i.test(JSON.stringify(body))
  return { ok: !schemaError, message }
}

const files = walk(SRC)
const refs = collectReferences(files)
const problems = []
let checked = 0

for (const [table, columns] of [...refs].sort()) {
  const probe = await columnExists(table, 'count')
  if (probe.message && /relation|find the table/i.test(probe.message)) {
    problems.push(`table  ${table} — ${probe.message}`)
    continue
  }
  for (const column of [...columns].sort()) {
    const result = await columnExists(table, column)
    checked++
    if (!result.ok) problems.push(`column ${table}.${column} — ${result.message}`)
  }
}

console.log(`checked ${checked} column references across ${refs.size} tables in ${files.length} files`)
if (problems.length > 0) {
  console.error(`\n✗ ${problems.length} schema mismatch(es):`)
  for (const p of problems) console.error(`   ${p}`)
  console.error('\nCode references something the database does not have — this fails at runtime.')
  process.exit(1)
}
console.log('✓ every referenced column exists')
