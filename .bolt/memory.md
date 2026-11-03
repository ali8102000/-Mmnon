# Project memory

## Product intent & audience

- Web app includes an interactive map and place search.
- Existing project is being migrated from or aligned with an older project’s Google Maps configuration.

## Brand personality & voice

- No established brand voice inferred yet.

## Visual design & UX direction

- Map experience should prefer Google Maps when a usable client key is available.
- Leaflet remains the fallback map implementation.
- Place search should remain functional through free-map search fallback when server-side Google Search configuration is unavailable.
- Map provider failures should degrade gracefully rather than block the app.

## Decisions, constraints & rationale

- The current repository does not have a Google Maps key in `.env`; the hosted build therefore previously fell back to Leaflet.
- The old Google Maps key was taken from `mobile/app.json`, because that project references a different Supabase backend and was treated as the legacy project.
- The legacy key was added as a build-time fallback alongside existing Supabase-related configuration so the hosted client can load Google Maps without requiring `.env`.
- `expo-app` contains another Google key and uses the current Supabase project; its key was not selected because the migration target was inferred to be the legacy `mobile/` configuration.
- The client build succeeded. The server build was terminated before completion, so the full build is not verified.
- The app could not be opened for runtime confirmation that the map loads.
- Client map display and server-side place search require separate Google configuration. Server search still needs a server-side Google key and a platform/API key; until then, free-map search remains the fallback.
- The Google key is now present in source/build configuration and should be restricted in Google Cloud to the app’s authorized domain/platforms.

## Open questions & assumptions

- Confirm whether the intended migrated key is from `mobile/app.json` or `expo-app`; swap the fallback if the latter is authoritative.
- Determine where server-side Google Search credentials and the required platform key should be configured.
- Complete a full client/server build and verify the map provider at runtime.
- Confirm the Google key’s API restrictions, referrers, quotas, and billing status.