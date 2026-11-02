# Architecture
- Keep the welcome flow in a dedicated `/welcome` route with browser-persisted language and completion preferences; this keeps first-visit presentation separate from authentication and preserves returning-user access.
- Language selection applies to welcome and authentication screens; extend translations explicitly when adding other multilingual screens.
- Preserve `/index` through a narrowly checked splat compatibility route; reject all other unmatched paths so the preview's legacy entry works without a generated index-name collision.
- Browser backend URL/key have a public fallback in `vite.config.ts` `define`; hosted builds do not receive the ignored `.env`, which otherwise crashes the app on load.
