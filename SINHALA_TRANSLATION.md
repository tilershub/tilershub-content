# Sinhala translation update

Prepared on branch `codex/sinhala-all-content`, based on main commit `6705398`.

The site now defaults to Sinhala for both server rendering and client hydration. Navigation, forms, dashboards, administration screens, service and district pages, calculator copy, provider page labels, metadata, legal pages, six guides, and seven bundled blog articles have Sinhala translations. The installable app description and shortcuts are also translated. Typography uses Noto Sans Sinhala with additional line spacing.

Display labels are localized through `src/lib/sinhala.js` and its local message catalogue. Database identifiers, URLs, submitted option values, prices, and calculation inputs retain their original values. Brand names and technical specification identifiers are preserved. The existing English governing legal originals are available under `public/legal/`.

User-submitted descriptions, reviews, projects, names, and externally stored CMS content are not rewritten. Unknown text remains as submitted; the catalogue is not an automatic translation service.

Validation:

- `npm run build` passes, including 14 prerendered pages and the server bundle.
- All 86 React dropdown option values match the original code.
- `git diff --check` passes.
- Source and generated editorial pages were checked for remaining English display copy.
- Browser layout verification could not be completed: the remote browser could not reach the local preview.

Publication: changes are prepared for the `codex/sinhala-all-content` review branch. Updating the live site requires merging into main and a successful deployment.
