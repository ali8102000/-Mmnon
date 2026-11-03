# Project memory

## Product intent & audience

- Web app includes an interactive map, place search, and taxi-request flow.
- Taxi fare calculation includes weather-related pricing adjustments.
- Weather conditions are determined automatically from the pickup location rather than selected manually by the rider.

## Brand personality & voice

- No established brand voice inferred yet.

## Visual design & UX direction

- Prefer Google Maps when a usable client key is available; use Leaflet as fallback.
- Keep place search functional through free-map search when server-side Google Search configuration is unavailable.
- Map, search, and weather-provider failures should degrade gracefully.
- The taxi request screen omits manual hot/cold/rain controls.
- Automatic weather detection runs from the pickup location and refreshes when that location changes.
- Use Open-Meteo for weather lookup, with seasonal defaults when lookup fails.
- Make the detected weather state and its fare impact visible or understandable without user configuration.

## Decisions, constraints & rationale

- No Google Maps key exists in `.env`; the hosted build previously fell back to Leaflet.
- The legacy Google key came from `mobile/app.json`; `expo-app` references the current Supabase project and was not selected as the migration source.
- The legacy key was added as a build-time fallback so the hosted client can load Google Maps without `.env`.
- Client map display and server-side place search use separate Google configuration. Server search still requires a server-side Google key and platform/API key; free-map search remains the fallback until configured.
- Google credentials should be restricted in Google Cloud by authorized domains/platforms, enabled APIs, quotas, referrers, and billing requirements.
- Weather pricing is retained, but weather selection is no longer user-controlled.
- Weather classification uses live pickup conditions, with seasonal weather as the offline/error fallback.
- The project build succeeded after the weather changes; complete runtime verification of taxi submission and fare calculation remains outstanding.
- GitHub publishing is pending repository confirmation. No changes have been pushed yet.
- Candidate repositories identified for this project are `ali8102000/-Mmnon` and `ali8102000/mumnun`; the intended target and branch still need confirmation before publishing.
- The proposed publish scope is the three modified areas: map configuration, automatic weather handling, and taxi-request screen.

## Open questions & assumptions

- Confirm whether the intended Google Maps key is from `mobile/app.json` or `expo-app`; replace the fallback if `expo-app` is authoritative.
- Determine where server-side Google Search credentials and the required platform key should be configured.
- Confirm the target GitHub repository and branch before pushing.
- Complete runtime testing of map loading, pickup changes, weather lookup, fallback behavior, and final fare calculation.
- Confirm the exact weather thresholds/categories used by the fare library and whether they match product expectations.
- Confirm Open-Meteo availability, rate limits, and whether a production proxy or caching layer is needed.