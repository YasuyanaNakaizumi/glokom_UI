const fs = require('fs');
const file = 'src/components/SalesProcessSection.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '契約・納入管理プロセス',
  '見積もり〜納入までの管理'
);

fs.writeFileSync(file, content);
