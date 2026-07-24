const fs = require('fs');
let content = fs.readFileSync('src/views/DashboardView.tsx', 'utf-8');
content = content.replace(/アフターセールス・タスク/g, 'アフターセールス案件');
fs.writeFileSync('src/views/DashboardView.tsx', content, 'utf-8');
console.log('patched DashboardView');
