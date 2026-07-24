const fs = require('fs');
const path = './src/components/LeadDetailsModal.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace("  if (!lead) return null;", "  if (!lead && !showSuccess) return null;");

fs.writeFileSync(path, content, 'utf8');
