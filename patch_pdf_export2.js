const fs = require('fs');

let content = fs.readFileSync('app/(protected)/dashboard/page.tsx', 'utf-8');

content = content.replace(
  'const pdf = new jsPDF({',
  'const pdf = new jsPDF({'
); // Ensure it's there

fs.writeFileSync('app/(protected)/dashboard/page.tsx', content);
