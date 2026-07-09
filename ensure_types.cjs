const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

if (!content.includes('receiveProcessCompleted?: boolean;')) {
  content = content.replace(
    'deliveryProcessCompleted?: boolean;',
    'receiveProcessCompleted?: boolean;\n  stockProcessCompleted?: boolean;\n  deliveryProcessCompleted?: boolean;'
  );
  fs.writeFileSync('src/types.ts', content);
}
