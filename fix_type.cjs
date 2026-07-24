const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf-8');
content = content.replace(
  "export type ServiceCategory = '新車巡回'|'故障修理'|'定期点検'|'車検'|'受け入れ点検'|'フィールドキャンペーン'|'在庫点検'|'納入作業'|'その他予定';",
  "export type ServiceCategory = '新車巡回'|'故障修理'|'定期点検'|'車検'|'受け入れ点検'|'フィールドキャンペーン'|'在庫点検'|'納入作業'|'その他予定' | (string & {});"
);
fs.writeFileSync('src/types.ts', content, 'utf-8');
console.log('patched type');
