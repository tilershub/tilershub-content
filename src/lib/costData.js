// Single source of truth for Sri Lankan tiling cost rates (LKR).
// Used by the estimator calculator, its indexable content, and district pages.

export const WASTE_FACTOR = 1.12 // +12% cutting/breakage allowance

export const LABOUR = { min: 100, max: 250, default: 150 } // Rs / sq.ft

export const ADHESIVE_TIERS = [
  { name: 'C1',     rate: 50,  maxTileSqft: 3.875,  sizes: 'Up to 60 × 60 cm',          desc: 'Standard cementitious adhesive for ceramic and small porcelain tiles.' },
  { name: 'C2',     rate: 80,  maxTileSqft: 10.333, sizes: '60 × 60 cm – 120 × 80 cm',  desc: 'Improved adhesive for porcelain and medium-format tiles.' },
  { name: 'C2TE S1', rate: 120, maxTileSqft: Infinity, sizes: 'Above 120 × 80 cm',      desc: 'Deformable, slip-resistant adhesive required for large-format tiles.' },
]

export const EXTRAS = {
  levelClips: 20,          // Rs / sq.ft
  grout: 10,               // Rs / sq.ft
  screed: { min: 100, max: 120, default: 110 }, // Rs / sq.ft
}

// Material consumption for quantity estimates
export const COVERAGE = {
  adhesiveBagKg: 25,
  adhesiveBagSqft: { c1: 35, c2: 35, c2te: 30 }, // sq.ft covered per 25kg bag (~3 bags/100 sq.ft; 3–4 for large format)
  groutSqftPerKg: 35,      // sq.ft per 1kg of grout (2–4 kg per 100 sq.ft)
  screedCementBagsPerSqft: { standard: 0.02, premium: 0.03 }, // 50kg bags: 2 (standard) / 3 (premium) per 100 sq.ft
  screedSandCuftPerSqft: 0.20,   // 20 cu.ft of sand per 100 sq.ft
}

// Levelling clips depend on tile size (wedges are reusable)
export function clipsPerTile(tileSqft) {
  if (tileSqft <= 2) return 3
  if (tileSqft <= 4) return 4
  if (tileSqft <= 11) return 6
  return 8
}

// label → coverage of one tile in sq.ft
export const TILE_SIZES = [
  { label: '30 × 30 cm', sqft: 0.969 },
  { label: '30 × 60 cm', sqft: 1.938 },
  { label: '40 × 40 cm', sqft: 1.722 },
  { label: '60 × 60 cm', sqft: 3.875 },
  { label: '60 × 120 cm', sqft: 7.75 },
  { label: '80 × 80 cm', sqft: 6.889 },
  { label: '80 × 120 cm', sqft: 10.333 },
  { label: '100 × 100 cm', sqft: 10.764 },
  { label: '120 × 120 cm', sqft: 15.5 },
  { label: '160 × 80 cm', sqft: 13.778 },
  { label: '120 × 240 cm', sqft: 31.0 },
  { label: '160 × 320 cm', sqft: 55.111 },
  { label: '240 × 120 cm', sqft: 31.0 },
]

// Typical retail tile price ranges per tile (Rs), for content only
export const TILE_PRICE_RANGES = [
  { size: '30 × 30 cm ceramic', range: 'Rs. 90 – 250' },
  { size: '60 × 60 cm porcelain', range: 'Rs. 550 – 1,800' },
  { size: '60 × 120 cm porcelain', range: 'Rs. 1,800 – 4,500' },
  { size: '120 × 120 cm large format', range: 'Rs. 4,500 – 12,000' },
]

export function tilesNeeded(areaSqft, tileSqft) {
  return Math.ceil((areaSqft / tileSqft) * WASTE_FACTOR)
}

export function adhesiveTier(tileSqft) {
  return ADHESIVE_TIERS.find(t => tileSqft <= t.maxTileSqft) || ADHESIVE_TIERS[ADHESIVE_TIERS.length - 1]
}

// Quick "typical cost" summary for a given area, used on district pages
export function typicalCostPerSqft() {
  const low = LABOUR.min + ADHESIVE_TIERS[0].rate + EXTRAS.grout
  const high = LABOUR.max + ADHESIVE_TIERS[2].rate + EXTRAS.levelClips + EXTRAS.grout + EXTRAS.screed.max
  return { low, high } // excludes tile material itself
}
