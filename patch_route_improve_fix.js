const fs = require('fs');
let content = fs.readFileSync('app/api/improve/route.ts', 'utf-8');

// I replaced the import statement, but I need to be careful with the way I did it
// The typescript compiler complained about AIOrchestrator not being found, but I added it...
// Let's just use `require` or add it to the top properly.

// Let's check what imports are there
console.log(content.match(/import .* from '.*';/g));
