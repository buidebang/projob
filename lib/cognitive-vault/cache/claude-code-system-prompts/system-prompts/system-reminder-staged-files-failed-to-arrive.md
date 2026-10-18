<!--
name: "System Reminder: Staged files failed to arrive"
description: "Warns that staged file paths may be missing or outdated and adds specific remediation guidance for disk-space and filename-length failures"
ccVersion: "2.1.300"
variables:
  - "FAILED_STAGED_FILE_PATHS"
  - "IS_SINGLE_FAILED_FILE"
  - "MAX_DISPLAYED_FAILED_FILE_PATHS"
  - "HTML_ESCAPE_FN"
  - "OMITTED_FILE_COUNT"
  - "FILE_COPY_FAILURE_REASONS"
-->
${FAILED_STAGED_FILE_PATHS.length} ${IS_SINGLE_FAILED_FILE?"file":"files"} may not have arrived here, so ${IS_SINGLE_FAILED_FILE?"this path":"these paths"} may be missing or hold an older copy: ${FAILED_STAGED_FILE_PATHS.slice(0,MAX_DISPLAYED_FAILED_FILE_PATHS).map(HTML_ESCAPE_FN).join(", ")}${OMITTED_FILE_COUNT>0?`, and ${OMITTED_FILE_COUNT} more`:""}${FILE_COPY_FAILURE_REASONS.has("no_space")?`
At least one of these copies failed with "no space left on device". Make space before the file is sent again. Ask the user before you delete one of their files.`:""}${FILE_COPY_FAILURE_REASONS.has("name_too_long")?`
At least one of these names is too long for the file system here (the usual limit is 255 bytes). That file can arrive only after the name is made shorter.`:""}
