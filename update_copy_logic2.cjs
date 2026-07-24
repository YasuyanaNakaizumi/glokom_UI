const fs = require('fs');
let content = fs.readFileSync('src/components/EditTaskModal.tsx', 'utf-8');

const targetStr1 = `                  linkedTaskIds: [task.id],
                  toolIds: task.toolIds || [],
                  assignments: task.assignments || []`;

const replacementStr1 = `                  linkedTaskIds: [task.id],
                  toolIds: task.toolIds || [],
                  assignments: task.assignments || [],
                  partStockId: task.partStockId,`;

content = content.replace(targetStr1, replacementStr1); // first match (alert)
content = content.replace(targetStr1, replacementStr1); // second match (blank)

fs.writeFileSync('src/components/EditTaskModal.tsx', content, 'utf-8');
console.log('patched update_copy_logic2');
