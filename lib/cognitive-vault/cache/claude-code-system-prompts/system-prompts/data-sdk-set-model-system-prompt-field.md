<!--
name: "Data: SDK set model system prompt field"
description: "Schema description for the internal set_model system_prompt field, including next-turn application with unchanged tool definitions, non-empty updates, feature overrides, and compatibility behavior"
ccVersion: "2.1.274"
-->
@internal Replaces the custom system prompt (the --system-prompt / initialize systemPrompt slot); the new text is sent from the next turn on, and the tool definitions already sent do not change. Applied only when the model request is accepted; must be non-empty (there is no revert-to-built-in form); re-send the current model for a prompt-only update; sending the text already in effect changes nothing. The CLAUDE_CODE_SYSTEM_PROMPT_GB_FEATURE per-turn read, where configured, still wins. Transports that do not implement it, and older builds, ack success without applying it.
