const fs = require('fs');
const file = 'src/components/EditTaskModal.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('AddRepairTaskModal')) {
  content = content.replace(
    `import { differenceInMonths, format } from 'date-fns';`,
    `import { differenceInMonths, format } from 'date-fns';\nimport { AddRepairTaskModal } from './AddRepairTaskModal';`
  );
  fs.writeFileSync(file, content);
  console.log("Import added");
}
