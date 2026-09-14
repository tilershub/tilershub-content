/**
 * Single source of truth for the AdSense publisher ID.
 *
 * Read through `import.meta.env` rather than hardcoded in components so the ID
 * lives in one place. Astro inlines `PUBLIC_`-prefixed values at build time, so
 * this works identically in `.astro` frontmatter (server) and in the React
 * islands (browser).
 *
 * Empty string means "AdSense off": the head tags in Layout.astro and every
 * <AdSlot> render nothing. That keeps dev and preview builds ad-free without a
 * second flag to remember.
 */
export const ADSENSE_CLIENT = import.meta.env.PUBLIC_ADSENSE_CLIENT || ''

/** True when the head script is actually present on the page. */
export const ADSENSE_ENABLED = Boolean(ADSENSE_CLIENT)

/**
 * The ads.txt identifier is the publisher ID without the "ca-" prefix.
 * `public/ads.txt` must carry this same value; Google stops serving ads if the
 * two disagree.
 */
export const ADSENSE_PUB_ID = ADSENSE_CLIENT.replace(/^ca-/, '')
