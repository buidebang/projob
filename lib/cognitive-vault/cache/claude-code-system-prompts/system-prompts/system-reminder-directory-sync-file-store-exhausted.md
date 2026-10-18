<!--
name: "System Reminder: Directory sync file store exhausted"
description: "Reports that directory sync can no longer upload the agent's changes to the user's machine because the session file store is full or this environment's share of it is used up, and directs telling the user plainly"
ccVersion: "2.1.283"
variables:
  - "FILE_STORE_USAGE_SUMMARY"
-->
Directory sync: nothing more of yours can be uploaded to the user's machine in this session — ${FILE_STORE_USAGE_SUMMARY===null?"this session's file store is full. Your files here are intact, but from now on NOTHING you change reaches their machine through sync, their machine may also lack changes you made shortly before this, and a command you run on their machine sees its files as they are":`this environment has used its share of the session's file store (${FILE_STORE_USAGE_SUMMARY}). Your files here are intact and the user's changes keep arriving, but from now on NOTHING you change reaches their machine through sync, and a command you run on their machine sees their files without your newer edits`}. Tell the user this plainly, so they can decide how to get your further work off this environment.
