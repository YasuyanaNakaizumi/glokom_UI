const fs = require('fs');
let paths = [
  'src/components/EditTaskModal.tsx',
  'src/views/DashboardView.tsx',
  'src/views/TasksView.tsx',
  'src/views/CategoryTasksView.tsx',
  'src/views/ReportsView.tsx'
];
paths.forEach(p => {
  let content = fs.readFileSync(p, 'utf-8');
  content = content.replace(/小タスク/g, 'サブ案件');
  fs.writeFileSync(p, content, 'utf-8');
});
console.log('patched subtask');
