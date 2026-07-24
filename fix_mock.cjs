const fs = require('fs');
let content = fs.readFileSync('src/lib/mock.ts', 'utf-8');

// Undo t1_2 change
content = content.replace(
  "category: '在庫点検・定期点検', urgency: '1ヶ月以内', progress: '進行中'",
  "category: '在庫点検', urgency: '1ヶ月以内', progress: '進行中'"
);

// Do t_insp_1 change (the 車検 one)
content = content.replace(
  "category: '車検', urgency: '1ヶ月以内', progress: '承認待ち'",
  "category: '車検・定期点検', urgency: '1ヶ月以内', progress: '承認待ち'"
);

fs.writeFileSync('src/lib/mock.ts', content, 'utf-8');
console.log('patched mock.ts');
