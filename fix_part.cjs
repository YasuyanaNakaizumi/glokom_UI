const fs = require('fs');
let content = fs.readFileSync('src/components/EditTaskModal.tsx', 'utf-8');

const targetStr = `                linkedTaskIds: [task.id],
                toolIds: task.toolIds || [],
                assignments: task.assignments || []`;

const replacementStr = `                linkedTaskIds: [task.id],
                toolIds: task.toolIds || [],
                assignments: task.assignments || [],
                partStockId: task.partStockId`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/EditTaskModal.tsx', content, 'utf-8');
console.log('patched fix_part');
