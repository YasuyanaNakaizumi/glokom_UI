const fs = require('fs');
const file = 'src/views/CategoryTasksView.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `  const filteredTasks = tasks.filter(t => {\n    if (t.category !== details.category) return false;`,
  `  const filteredTasks = tasks.filter(t => {\n    if (t.parentId) return false;\n    if (t.category !== details.category) return false;`
);

fs.writeFileSync(file, content);
