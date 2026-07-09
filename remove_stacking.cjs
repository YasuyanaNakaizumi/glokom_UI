const fs = require('fs');
const path = './src/views/DashboardView.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove the stacking cards
content = content.replace(
  /\{subTasks\.length > 0 && \(\s*<>\s*<div className="absolute -bottom-1\.5[^>]+><\/div>\s*<div className="absolute -bottom-3[^>]+><\/div>\s*<\/>\s*\)\}/g,
  ''
);

// Also remove mb-3 from the wrapper if subTasks.length > 0
content = content.replace(
  /className=\{cn\("relative group cursor-pointer", subTasks\.length > 0 && "mb-3"\)\}/g,
  'className="relative group cursor-pointer mb-3"'
);

fs.writeFileSync(path, content, 'utf8');
