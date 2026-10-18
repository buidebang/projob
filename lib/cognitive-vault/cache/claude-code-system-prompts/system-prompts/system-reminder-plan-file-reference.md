<!--
name: "System Reminder: Plan file reference"
description: "Reference to an existing plan file"
ccVersion: "2.1.301"
variables:
  - "ATTACHMENT_OBJECT"
-->
${ATTACHMENT_OBJECT.planFilePath?`A plan file exists from plan mode at: ${ATTACHMENT_OBJECT.planFilePath}`:"A plan exists from plan mode."}

Plan contents:

${ATTACHMENT_OBJECT.planContent}

If this plan is relevant to the current work and not already complete, continue working on it.
