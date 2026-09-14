import { si as sinhalaText } from '../lib/sinhala.js'
import { useEffect, useRef, useState } from 'react'
import { ADSENSE_CLIENT } from '../lib/adsense.js'

/**
 * Current pathname, kept in sync with client-side navigation.
 *
 * TilersHub is an Astro MPA today, so this resolves once and never changes —
 * every navigation is a fresh document. It is written this way so the ad unit
 * stays correct if <ClientRouter> is ever switched on: there, a reused <ins>
 * throws "All 'ins' elements in the DOM with class=adsbygoogle already have ads
 * in them", and remounting on route change is the documented way out.
 */
function useRoutePath() {
  const [path, setPath] = useState(() =>
    typeof window === 'undefined' ? '' : window.location.pathname
  )
  useEffect(() => {
    const sync = () => setPath(window.location.pathname)
    sync()
    document.addEventListener('astro:page-load', sync)
    window.addEventListener('popstate', sync)
    return () => {
      document.removeEventListener('astro:page-load', sync)
      window.removeEventListener('popstate', sync)
    }
  }, [])
  return path
}

/** The <ins> itself. Mounted fresh per route, so the push always has a virgin slot. */
function AdUnit({ slot, format, style, className }) {
  const insRef = useRef(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (!import.meta.env.PROD || !ADSENSE_CLIENT) return
    // StrictMode double-invokes effects; guard so one <ins> is never pushed twice.
    if (pushed.current || !insRef.current) return
    if (insRef.current.getAttribute('data-adsbygoogle-status')) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch (err) {
      // A blocked or failed ad must never take the page down with it.
      console.warn('[AdSlot] adsbygoogle push failed', err)
    }
  }, [])

  return (
    <ins
      ref={insRef}
      className={`adsbygoogle ${className}`.trim()}
      style={{ display: 'block', ...style }}
      data-ad-client={ADSENSE_CLIENT}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  )
}

/**
 * A single AdSense display unit.
 *
 * Usage — the `client:*` directive is required, since the mount effect is what
 * actually asks Google to fill the slot:
 *
 *   <AdSlot slot="1234567890" client:visible />
 *
 * Rendering rules:
 *  - No publisher ID configured → nothing renders at all.
 *  - Dev build → a labelled dashed placeholder, never a real request. Pushing
 *    to adsbygoogle from localhost pollutes reporting and can trip Google's
 *    invalid-traffic detection.
 *  - Production → a real <ins>, pushed once per mount.
 */
export default function AdSlot({ slot, format = 'auto', style, className = '' }) {
  const path = useRoutePath()

  if (!ADSENSE_CLIENT) return null

  if (!import.meta.env.PROD) {
    return (
      <div
        className={className}
        style={{
          display: 'grid',
          placeItems: 'center',
          minHeight: 120,
          padding: 16,
          border: '1px dashed var(--border, #d8d2c8)',
          borderRadius: 12,
          color: 'var(--text-3, #8a8178)',
          font: '600 11px/1.4 system-ui, sans-serif',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          ...style,
        }}
      >
        දැන්වීම් ඉඩ{sinhalaText(slot ? ` · ${slot}` : '')}
      </div>
    )
  }

  return <AdUnit key={path} slot={slot} format={format} style={style} className={className} />
}
