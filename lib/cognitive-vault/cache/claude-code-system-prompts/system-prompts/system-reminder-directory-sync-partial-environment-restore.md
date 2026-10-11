<!--
name: "System Reminder: Directory sync partial environment restore"
description: "Explains that the recreated cloud container could be restored only in part, up to an earlier turn, states the specific reason later work could not be brought back, and directs checking files before relying on memory of that later work"
ccVersion: "2.1.283"
variables:
  - "RESTORE_FAILURE_REASON_MAP"
  - "DIRECTORY_SYNC_RESTORE_EVENT"
-->
Directory sync: this session's cloud environment was REPLACED (the container was recreated) and your earlier work could be RESTORED into this checkout only IN PART — up to one of that environment's earlier uploads; your work after that could not be brought back (${RESTORE_FAILURE_REASON_MAP[DIRECTORY_SYNC_RESTORE_EVENT.why]}) and is NOT here. It comes back only through the user's machine, if it had reached it (its upload for this turn may already have brought it) — check the files before building on them rather than redoing that work from memory, and tell the user plainly which recent changes are missing if they matter now. Not restored either: untracked files sync never carries, installed tools and background processes of the earlier environment.
