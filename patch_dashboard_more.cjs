const fs = require('fs');
let code = fs.readFileSync('src/views/DashboardView.tsx', 'utf8');

code = code.replace('{repairTasks.map((t) => {', '{repairTasks.slice(0, 3).map((t) => {');
code = code.replace('{maintenanceTasks.map(t => {', '{maintenanceTasks.slice(0, 3).map(t => {');

fs.writeFileSync('src/views/DashboardView.tsx', code);
console.log('Patched more dashboard lists to max 3 items');
