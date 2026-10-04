<!--
name: "System Reminder: Directory sync restored files mismatch"
description: "Lists files whose content in this checkout no longer matches the user's commits after a rewind or rewrite, and directs comparing against HEAD before restoring or reverting a path"
ccVersion: "2.1.283"
variables:
  - "FORMAT_PATH_LIST_FN"
  - "DIRECTORY_SYNC_RESULT"
-->
 These files no longer match the user's commits — your rewound version or your rewrite — here and, as uncommitted changes, on the user's machine: ${FORMAT_PATH_LIST_FN(DIRECTORY_SYNC_RESULT.restored.files,{openEnded:DIRECTORY_SYNC_RESULT.restored.filesTruncated,show:ejs})}. Check `git diff HEAD -- PATH` first (the user may have uncommitted edits of their own there); then `git checkout HEAD -- PATH` puts the user's committed version back (for a file those commits deleted, remove it instead), unless undoing those commits is what the user asked for.
