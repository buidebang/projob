<!--
name: "Data: Cloud session unverified remote branch push notice"
description: "Notice shown when no remote of the checkout could be read, so it could not be checked whether the current branch or detached HEAD commit exists on the remote host, telling the user to push their work to a branch and start a new cloud session from it"
ccVersion: "2.1.301"
variables:
  - "IS_DETACHED_HEAD"
  - "REMOTE_HOST_NAME"
  - "SANITIZE_BRANCH_NAME_FN"
  - "CURRENT_BRANCH_NAME"
  - "CLOUD_SESSION_START_OPTIONS"
-->
${IS_DETACHED_HEAD?`This checkout is on a detached HEAD, and no remote of it could be read, so its commit could not be looked for on ${REMOTE_HOST_NAME}. The cloud session was asked to start from HEAD as ${REMOTE_HOST_NAME} has it, its default branch.`:`Whether branch ${SANITIZE_BRANCH_NAME_FN(CURRENT_BRANCH_NAME)} is on ${REMOTE_HOST_NAME} could not be checked, because no remote of this checkout could be read. The cloud session was asked to start from it by name.`}${CLOUD_SESSION_START_OPTIONS.advisesPush?` ${IS_DETACHED_HEAD?"To start from your work, push it":"If it is not there, push your work"} to a branch and start a new session from that branch.`:""}
