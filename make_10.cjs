const fs = require('fs');
let code = fs.readFileSync('src/lib/mock.ts', 'utf8');

// remove t_fc_17 which is for v19
code = code.replace(
  "  { id: 't_fc_17', vehicleId: 'v19', targetModelName: 'PC200-11', title: 'FC-2023-01 エンジンカバー交換', category: 'フィールドキャンペーン', urgency: '1ヶ月以内', progress: '進行中', deadline: addDays(now, 15).toISOString(), staffId: 's1' },\n",
  ""
);

fs.writeFileSync('src/lib/mock.ts', code);
console.log('Removed t_fc_17');
