const fs = require('fs');
let content = fs.readFileSync('src/components/EditTaskModal.tsx', 'utf-8');

const targetStr = `                  toolIds: Array.from(new Set([...(target.toolIds || []), ...(task.toolIds || [])])),
                  assignments: task.assignments || target.assignments,`;

const replacementStr = `                  toolIds: Array.from(new Set([...(target.toolIds || []), ...(task.toolIds || [])])),
                  assignments: task.assignments || target.assignments,
                  partStockId: task.partStockId || target.partStockId,`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/EditTaskModal.tsx', content, 'utf-8');
console.log('patched update_copy_logic');
