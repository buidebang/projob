<!--
name: "Tool Description: Artifact publishing and update guidance"
description: "Provides Artifact lookup, update, ownership, watch, content-safety, self-containment, responsive design, theme, favicon, and anti-impersonation requirements"
ccVersion: "2.1.275"
variables:
  - "ARTIFACT_EXTERNAL_RESOURCE_ALLOWLIST"
  - "ARTIFACT_CAPABILITIES_SKILL_NAME"
  - "MAX_ARTIFACT_BYTES"
  - "ARTIFACT_RESPONSIVE_DESIGN_GUIDANCE"
  - "ARTIFACT_THEME_AWARE_STYLING_GUIDANCE"
-->
${ARTIFACT_EXTERNAL_RESOURCE_ALLOWLIST} **How to load a library**: `<script src="https://cdnjs.cloudflare.com/ajax/libs/<lib>/<exact version>/<file>">` — pick the UMD build, which defines a global (e.g. react/18.3.1/umd/react.production.min.js, then react-dom) — placed BEFORE any inline `<script>` that uses it; always pin an exact version. The viewer's sandbox also blocks any download the page starts itself — `<a download>` links (data:/blob: hrefs included) and script-driven saves are inert for viewers — so never offer a file through a plain link. Artifacts render mermaid diagrams natively — markdown via ```mermaid fences, HTML via `<pre class="mermaid">` blocks — no library needed, don't load one.

**Browser storage**: `localStorage` (also `sessionStorage` and IndexedDB) works, but each artifact has its own origin and the data lives only in that viewer's browser — it survives republishes to the same URL and never reaches other viewers, other devices, or Claude. It can come back empty or the accessor can throw (a private window, cleared or blocked site data, previews or thumbnail capture), so wrap every read and write in try/catch and render the page correctly without it. Use it only for per-viewer conveniences (a remembered tab or filter, a collapsed section, an unsent draft), never for state that must persist reliably, be shared between viewers, or be read back by Claude — state like that belongs in a runtime capability when this user has one: load the `${ARTIFACT_CAPABILITIES_SKILL_NAME}` skill before writing the page.

**Size**: The rendered page must be ${MAX_ARTIFACT_BYTES/1024/1024}MB or smaller, and embedded data: URIs count toward that.

${ARTIFACT_RESPONSIVE_DESIGN_GUIDANCE}

${ARTIFACT_THEME_AWARE_STYLING_GUIDANCE}

**Icon** (on every first publish): Pass one short generic word as `icon` (e.g. `"chart"`, `"calendar"`, `"recipe"`) for the artifact's browser-tab icon — a plain signifier for what the page is, never a product or brand name, and never an emoji or markup. It stays the **same** for the life of an artifact, so on a redeploy (the same file path this session, or `url`) omit `icon` and the artifact keeps the one it has; pass a different one only when the user asks.
