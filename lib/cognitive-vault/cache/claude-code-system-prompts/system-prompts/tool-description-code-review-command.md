<!--
name: "Tool Description: Code review command"
description: "Describes the code review command, its effort levels, PR comment mode, fix mode, and --max-findings limit, with optional ultra cloud review and post-flag notes"
ccVersion: "2.1.288"
variables:
  - "ULTRA_CLOUD_REVIEW_CLAUSE"
  - "ULTRA_POST_FLAG_NOTE"
-->
Review the current diff, or a PR number/branch/path target, for correctness bugs (plus reuse/simplification/efficiency cleanups where the model's review recipe covers them) at the given effort level (low/medium: fewer, high-confidence findings; high→max: broader coverage, may include uncertain findings${ULTRA_CLOUD_REVIEW_CLAUSE}); with no level given, it reuses the level you typed last. Pass --comment to post findings as inline PR comments, or --fix to apply the findings to the working tree after the review. Pass --max-findings <n> to report up to n findings, or --max-findings all for every finding. The choice stays until you pass --max-findings default.${ULTRA_POST_FLAG_NOTE}
