# WedaHub / TilersHub migration

## Prepared projects

| Project | Domain | Source branch | Cloudflare Worker |
| --- | --- | --- | --- |
| වැඩHUB marketplace | https://wedahub.lk | codex/wedahub-rebrand | wedahub |
| TilersHub articles, guides and estimator | https://tilershub.lk | codex/tilershub-content | tilershub-content |

The content project now has its own repository, `tilershub/tilershub-content`, on `main`. The original `codex/tilershub-content` branch remains in the marketplace repository as a migration snapshot; do not merge it into that repository's main branch. The original site history is retained in the marketplace repository. The current live Worker and domains have not been changed.

## Routing

- `/blog`, `/blog/<slug>`, `/guides`, `/guides/<slug>` and `/estimator` retain their original TilersHub URLs.
- These paths on WedaHub redirect permanently to TilersHub, preserving query strings.
- Old marketplace paths on TilersHub redirect permanently to the equivalent WedaHub path, preserving query strings.
- `/join-tilershub` redirects to `https://wedahub.lk/join-wedahub`.
- The TilersHub root becomes an editorial homepage; it is not redirected.
- Unknown paths still return 404. `/auth/callback` on the old domain restarts login on WedaHub without forwarding authentication codes between origins.
- WedaHub category pages retain article recommendation metadata with direct TilersHub links, but do not ship article bodies.

## Cutover order

1. Repository transfer is complete: use `tilershub/tilershub-content` branch `main` for the TilersHub deployment.
2. Deploy both builds to their separately named Cloudflare Workers, initially using preview/Workers URLs. Configure the existing Supabase variables and server-side secrets on **wedahub**; the editorial site requires no Supabase access. Keep `PUBLIC_ADSENSE_CLIENT` configured for the content build if using ads.
3. Set Supabase Auth's Site URL to `https://wedahub.lk` and allow the actual login return paths used by the app (`/auth/callback`, `/provider`, `/account`, `/join-wedahub`, including the app's query-string variants). Test each sign-in flow and email template on the new domain. Keep the original domain settings available for rollback. Existing users keep their database accounts, but must sign in on the new origin.
4. Review this branch and merge the marketplace change only when both deployments are ready. The Actions deployment workflow is manual during the migration. Also check Cloudflare dashboard Git builds: they are independent of GitHub Actions and may still auto-deploy on merge.
5. Connect **wedahub.lk** to the **wedahub** Worker, and verify provider pages, login, project posting and account pages. Then move **tilershub.lk** from its existing Worker to **tilershub-content** in the same cutover window. Do not put a whole-domain redirect on tilershub.lk. Configure www variants to canonical apex domains if used.
6. Verify each domain's sitemap and sample links below, then submit both sitemaps in Search Console. This is a partial move because TilersHub remains active: do not use a whole-site Change of Address without assessing that split. Keep the old-path redirects in service for at least a year and monitor 404s and search traffic.

## Validation

Run in each repository:

```sh
npm ci
node --test scripts/migration.test.mjs
npm run build
```

The source checks passed: all existing static blog and guide slugs are retained, and the estimator's JavaScript calculation code is unchanged. Migration tests cover path boundaries, fixed redirect destinations, query strings, registration aliases, and content sitemap separation. Local HTTP checks also passed for both homepages, a blog article, the estimator, redirects with query strings, the old login callback, and a true 404. Browser visual checks and authenticated production flows still require a reachable preview/domain.

Suggested live checks after cutover:

- `https://tilershub.lk/blog/how-to-choose-a-tiler` — 200, canonical on TilersHub.
- `https://tilershub.lk/estimator` — 200, calculator works, project CTA goes to WedaHub.
- `https://tilershub.lk/providers/<existing-slug>` — 301 to equivalent WedaHub provider.
- `https://wedahub.lk/blog/how-to-choose-a-tiler` — 301 to TilersHub.
- Unknown URL on either domain — 404, not a redirect to a homepage.

## Existing blog management limitation

The original public blog routes render `src/lib/blog-posts.js`; the existing admin editor writes to the separate Supabase `blogs` table. They were not connected in the source snapshot. This migration preserves the public articles and the existing database/editor without deleting records or pretending that database-only posts are already public. The editor remains under WedaHub administration and its preview links point to TilersHub. Connecting database publishing to public article rendering is a separate change requiring content sanitization and publication checks.

## Rollback

Keep the current `tilershub` Worker and its last successful version. If cutover checks fail, restore tilershub.lk's prior Worker binding and previous Supabase Site URL/redirect settings. Do not delete the database, users, or old Worker. Retain the previous release until both sites have been verified.

## References

- https://supabase.com/docs/guides/auth/redirect-urls
- https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
