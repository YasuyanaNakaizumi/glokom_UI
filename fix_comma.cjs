const fs = require('fs');
let content = fs.readFileSync('src/components/EditTaskModal.tsx', 'utf-8');

content = content.replace(/partStockId: task\.partStockId,,/g, 'partStockId: task.partStockId');
content = content.replace(/partStockId: task\.partStockId,,\n\s*partStockId: task\.partStockId,/g, 'partStockId: task.partStockId,');

fs.writeFileSync('src/components/EditTaskModal.tsx', content, 'utf-8');
