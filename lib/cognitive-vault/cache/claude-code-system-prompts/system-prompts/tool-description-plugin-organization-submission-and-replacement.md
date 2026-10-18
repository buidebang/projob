<!--
name: "Tool Description: Plugin organization submission and replacement"
description: "Explains plugin upload and organization review after consent, requiring renewed consent for replacement and user action before retrying an outdated upload"
ccVersion: "2.1.301"
-->
On their yes the plugin is uploaded to the person's own shelf on claude.ai, scanned there, and submitted to the organization: an administrator reviews it, or it is published at once where the organization publishes without review. When the result says a plugin of this name is already in their uploads, ask the person whether to replace it, and only on their yes call again with `replace: true`. When the result says the upload is not the plugin's current version, pass that on and do not call again: publishing again from here would be refused the same way. The person makes the new version current on claude.ai and publishes it from there.
