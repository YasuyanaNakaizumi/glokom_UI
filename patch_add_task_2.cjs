const fs = require('fs');
const file = 'src/components/AddRepairTaskModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `      staffIds: staffIds.length > 0 ? staffIds : undefined,`,
  `      staffIds: staffIds.length > 0 ? staffIds : undefined,\n      parentId: parentId,`
);

fs.writeFileSync(file, content);
