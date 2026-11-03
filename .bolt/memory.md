# Project memory

## Product intent & audience

- Web app includes an interactive map, place search, and taxi-request flow.
- Taxi fares include weather-related pricing adjustments.
- Weather is determined automatically from the pickup location, not selected manually by the rider.

## Brand personality & voice

- No established brand voice inferred yet.

## Visual design & UX direction

- Prefer Google Maps when a usable client key is available; retain Leaflet as fallback.
- Keep place search functional through free-map search when server-side Google Search configuration is unavailable.
- Map, search, and weather-provider failures should degrade gracefully.
- Taxi request omits manual rain/heat/cold controls.
- Refresh automatic weather detection when the pickup location changes.
- Use Open-Meteo for weather lookup, with seasonal defaults on failure.
- Make detected weather and its fare impact understandable without requiring user configuration.

## Decisions, constraints & rationale

- The intended GitHub repository is confirmed as `ali8102000/-Mmnon`; changes were reported as uploaded to `main`.
- Published scope covered map configuration, automatic weather handling, and the taxi-request screen.
- Google Maps client configuration uses the legacy key from `mobile/app.json`; no `.env` key was available.
- Client map display and server-side place search use separate Google configuration. Server search still requires an appropriate server-side key and platform/API configuration; free-map search remains the fallback.
- The repository is public, so the Google key and database key are exposed. Google credentials should be restricted by domains/platforms, APIs, quotas, referrers, and billing requirements; exposed secrets should be reviewed and rotated if necessary.
- Weather pricing remains enabled, but weather selection is no longer user-controlled.
- Weather classification uses live pickup conditions, with seasonal fallback when lookup fails.
- Build completion and end-to-end taxi-flow verification were not confirmed after publishing.

## Open questions & assumptions

- Confirm that the legacy key from `mobile/app.json` is the correct production Google Maps credential; replace it if another project is authoritative.
- Determine where server-side Google Search credentials and the required platform key should be configured.
- Verify the repository’s pushed commits and confirm no intended changes are missing.
- Complete runtime testing of map loading, pickup changes, weather lookup, fallback behavior, taxi submission, and final fare calculation.
- Confirm the exact weather thresholds/categories used by the fare library and whether they match product expectations.
- Confirm Open-Meteo availability, rate limits, and whether production proxying or caching is needed.
- Audit public repository history and deployment configuration for exposed credentials.