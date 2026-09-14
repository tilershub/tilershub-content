import messages from './sinhala.json'

const foldedMessages = Object.fromEntries(
  Object.entries(messages).map(([key, value]) => [key.toLowerCase(), value])
)

// Localize display strings only; callers retain database keys and form values.
// Unknown text passes through, including names and user-submitted descriptions.
export function si(value) {
  if (typeof value !== 'string') return value
  const key = value.replace(/\s+/g, ' ').trim()
  const translated = messages[key] ?? foldedMessages[key.toLowerCase()]
  if (translated) return translated
  const ago = key.match(/^(\d+)\s*(m|h|d|w|mo|y|mins?|hours?|days?|weeks?|months?|years?) ago$/)
  if (ago) {
    const unit = { m: 'මිනිත්තු', h: 'පැය', d: 'දින', w: 'සති', mo: 'මාස', y: 'වසර', min: 'මිනිත්තු', mins: 'මිනිත්තු', hour: 'පැය', hours: 'පැය', day: 'දින', days: 'දින', week: 'සති', weeks: 'සති', month: 'මාස', months: 'මාස', year: 'වසර', years: 'වසර' }[ago[2]]
    return `${unit} ${ago[1]}කට පෙර`
  }
  return value
}
