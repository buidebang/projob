const fs = require('fs');

let content = fs.readFileSync('app/api/orchestrator/route.ts', 'utf8');

// The git history likely got corrupted with duplicate diff lines from my previous regex
// Let's just restore the file completely from HEAD and do a clean replace using replace_with_git_merge_diff
// or simple AST manipulation. Wait, `git restore` restored it to HEAD, which had 598 lines previously and 694 lines now.
// Something is very wrong. Let me do `git checkout HEAD app/api/orchestrator/route.ts`.
