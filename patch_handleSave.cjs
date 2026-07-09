const fs = require('fs');
const path = './src/components/EditTaskModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update handleSave
content = content.replace(
  /const handleSave = \(\) => \{\s*\/\/ Save modifications to the task\s*onClose\(\);\s*\};/,
  `const handleSave = () => {
    if (taskId) {
      updateTask(taskId, {
        assignments: assignments.map(a => ({
          staffId: a.staffId,
          plannedStart: a.startDate ? \`\${a.startDate}T\${a.startTime}:00Z\` : undefined,
          plannedEnd: a.endDate ? \`\${a.endDate}T\${a.endTime}:00Z\` : undefined,
        })) as any,
        staffIds: assignments.map(a => a.staffId).filter(id => id),
        deadline: assignments.length > 0 && assignments[0].endDate ? \`\${assignments[0].endDate}T\${assignments[0].endTime}:00Z\` : task?.deadline
      });
    }
    onClose();
  };`
);

fs.writeFileSync(path, content, 'utf8');
