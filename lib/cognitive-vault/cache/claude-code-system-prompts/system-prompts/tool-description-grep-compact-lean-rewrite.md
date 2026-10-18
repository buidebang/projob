<!--
name: "Tool Description: Grep compact (lean rewrite)"
description: "Describes compact ripgrep-backed search with explicit Claude Code permission UI and file-link integration for lean-rewrite models"
ccVersion: "2.1.301"
variables:
  - "BASH_TOOL_NAME"
-->
Content search built on ripgrep. Prefer this over `grep`/`rg` via ${BASH_TOOL_NAME}, because its results integrate with the permission UI and file links in Claude Code.

- Full regex syntax (e.g. "log.*Error", "function\s+\w+"). Ripgrep, not grep, so escape literal braces (`interface\{\}`).
- Filter with `glob` (e.g. "**/*.tsx") or `type` (e.g. "js", "py", "rust").
- `output_mode`: "content" (matching lines), "files_with_matches" (paths only, default), or "count".
- `multiline: true` for patterns that span lines.
