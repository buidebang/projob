<!--
name: "System Reminder: Directory sync agent commits off branch"
description: "Explains why the agent's unpublished commits, or commits that had stood ahead of the user's history, are no longer on the work branch, where their changes are kept, and how to re-commit or cherry-pick only unpublished work without touching commits already on a remote"
ccVersion: "2.1.281"
variables:
  - "DIRECTORY_SYNC_RESULT"
  - "COMMIT_SHA_FORMATTER_FN"
  - "AGENT_COMMITS_OFF_BRANCH_REASON"
  - "AGENT_COMMITS_UNPUBLISHED_COUNT"
  - "AGENT_COMMITS_REMOTE_MERGE_GUIDANCE"
  - "FORMAT_AGENT_COMMITS_BOOKKEEPING_NOTE_FN"
-->
${DIRECTORY_SYNC_RESULT.agentCommits.reason==="published"?`The ${DIRECTORY_SYNC_RESULT.agentCommits.count} commit(s) up to ${COMMIT_SHA_FORMATTER_FN(DIRECTORY_SYNC_RESULT.agentCommits.tip)} that stood ahead of the user's history here`:`Your ${DIRECTORY_SYNC_RESULT.agentCommits.count} commit(s) up to ${COMMIT_SHA_FORMATTER_FN(DIRECTORY_SYNC_RESULT.agentCommits.tip)}`} are no longer on the work branch because ${AGENT_COMMITS_OFF_BRANCH_REASON}. They are kept at ${DIRECTORY_SYNC_RESULT.agentCommits.ref}; their changes are still in the working tree as uncommitted edits (merged with the user's, the user's lines winning). ${DIRECTORY_SYNC_RESULT.agentCommits.reason==="published"?`Re-commit or cherry-pick only what is your own work among the ${AGENT_COMMITS_UNPUBLISHED_COUNT} that no remote has (git branch -r --contains COMMIT lists the remote branches holding a commit) — not a merge commit a pull made, nor rebased copies of the user's commits; do not re-commit the ones already on a remote. ${AGENT_COMMITS_REMOTE_MERGE_GUIDANCE}`:"Re-commit or cherry-pick as appropriate."}${DIRECTORY_SYNC_RESULT.agentCommitsBookkeeping>0?` (${FORMAT_AGENT_COMMITS_BOOKKEEPING_NOTE_FN(DIRECTORY_SYNC_RESULT.agentCommitsBookkeeping)})`:""}
