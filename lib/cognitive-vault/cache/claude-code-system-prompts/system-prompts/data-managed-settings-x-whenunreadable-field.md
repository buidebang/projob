<!--
name: "Data: Managed settings x-whenUnreadable field"
description: "Describes managed-settings schema behavior for invalid present values, including fallback values, unusable keys, and default treatment as unset"
ccVersion: "2.1.300"
-->
 A key node's `x-whenUnreadable` says what Claude Desktop does when the key is present but its value is invalid (wrong type, malformed, or no usable entry; `null` and a blank string count as not set): `{"applies": value}` means it applies that value; `{"unusable": true}` means it treats the key as set but unusable (an invalid managed MCP server list keeps plugin-provided servers' tools blocked rather than allowing them), and a server that mirrors the app should do the same. A key node without it is treated as not set in that case.
