# Project memory

## Product intent & audience

- Web app includes an interactive map, place search, and taxi-request flow.
- Taxi fare calculation includes weather-related pricing adjustments.
- Weather conditions should be determined automatically from the pickup location rather than selected by the rider.

## Brand personality & voice

- No established brand voice inferred yet.

## Visual design & UX direction

- Map experience should prefer Google Maps when a usable client key is available, with Leaflet as fallback.
- Place search should remain functional through free-map search when server-side Google Search configuration is unavailable.
- Map and search provider failures should degrade gracefully.
- The taxi request screen no longer presents manual hot/cold/rain weather controls.
- Automatic weather detection runs from the pickup location and updates when that location changes.
- Weather lookup uses Open-Meteo; seasonal defaults provide a fallback when the lookup fails.
- Weather state and its fare effect should be visible or otherwise understandable without requiring user configuration.

## Decisions, constraints & rationale

- The current repository does not have a Google Maps key in `.env`; the hosted build previously fell back to Leaflet.
- The legacy Google key was taken from `mobile/app.json`, while `expo-app` references the current Supabase project and was not selected as the migration source.
- The legacy key was added as a build-time fallback so the hosted client can load Google Maps without requiring `.env`.
- Client map display and server-side place search use separate Google configuration. Server search still needs a server-side Google key and platform/API key; free-map search remains the fallback until configured.
- The Google key should be restricted in Google Cloud to authorized domains/platforms, APIs, quotas, referrers, and billing requirements.
- Weather pricing is retained, but weather selection is no longer user-controlled.
- Automatic weather classification is based on live conditions at the pickup point; seasonal weather is used as the offline/error fallback.
- The project build succeeded after the weather changes. Runtime verification of a complete taxi request and resulting fare was not performed.

## Open questions & assumptions

- Confirm whether the intended Google Maps key is from `mobile/app.json` or `expo-app`; replace the fallback if `expo-app` is authoritative.
- Determine where server-side Google Search credentials and the required platform key should be configured.
- Complete runtime testing of map loading, pickup changes, weather lookup, fallback behavior, and final fare calculation.
- Confirm the exact weather thresholds/categories used by the fare library and whether they match product expectations.
- Confirm Open-Meteo availability, rate limits, and whether a production proxy or caching layer is needed.