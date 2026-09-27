const fs = require('fs');
const file = 'C:/Users/aryan/.gemini/antigravity/scratch/hire/src/app/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/SECURE ENCRYPTED CHANNEL.*ISO 27001/g, 'SECURE ENCRYPTED CHANNEL');

fs.writeFileSync(file, code);
console.log('Removed ISO 27001');
