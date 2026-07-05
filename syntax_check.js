const fs = require('fs');
const code = fs.readFileSync('app/(marketing)/page.tsx', 'utf-8');
const { parse } = require('@typescript-eslint/parser');

try {
  parse(code, { sourceType: 'module', ecmaFeatures: { jsx: true } });
  console.log("No syntax errors.");
} catch (e) {
  console.log("Syntax error:");
  console.log(e);
}
