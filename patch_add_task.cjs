const fs = require('fs');
const file = 'src/components/AddRepairTaskModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `  initialTitle,\n  onTaskSaved\n}: { `,
  `  initialTitle,\n  onTaskSaved,\n  parentId\n}: { `
);

content = content.replace(
  `  initialTitle?: string;\n  onTaskSaved?: () => void;\n}) {`,
  `  initialTitle?: string;\n  onTaskSaved?: () => void;\n  parentId?: string;\n}) {`
);

content = content.replace(
  `      id: \`task\${Date.now()}\`,`,
  `      id: \`task\${Date.now()}\`,\n      parentId: parentId,`
);

fs.writeFileSync(file, content);
