const fs = require('fs');
let code = fs.readFileSync('src/lib/mock.ts', 'utf8');

// The duplicate tasks are:
const dupTasks = `  { id: 't_fc_11', vehicleId: 'v11', targetModelName: 'PC200-11', title: 'FC-2023-01 エンジンカバー交換', category: 'フィールドキャンペーン', urgency: '1ヶ月以内', progress: '未着手', deadline: addDays(now, 5).toISOString() },
  { id: 't_fc_12', vehicleId: 'v11', targetModelName: 'PC200-11', title: 'FC-2023-05 ソフトウェアアップデート', category: 'フィールドキャンペーン', urgency: '数ヶ月後', progress: '未着手', deadline: addDays(now, 45).toISOString() },
  { id: 't_fc_13', vehicleId: 'v12', targetModelName: 'WA380-8', title: 'FC-2023-02 油圧センサー交換', category: 'フィールドキャンペーン', urgency: '緊急', progress: '未着手', deadline: subDays(now, 2).toISOString() },
  { id: 't_fc_14', vehicleId: 'v15', targetModelName: 'PC138US-11', title: 'FC-2023-03 モニターファームウェア更新', category: 'フィールドキャンペーン', urgency: '1ヶ月以内', progress: '進行中', deadline: addDays(now, 10).toISOString(), staffId: 's1' },
  { id: 't_fc_15', vehicleId: 'v16', targetModelName: 'WA200-8', title: 'FC-2023-04 燃料パイプ固定ブラケット追加', category: 'フィールドキャンペーン', urgency: '緊急', progress: '未着手', deadline: addDays(now, 1).toISOString() },
  { id: 't_fc_16', vehicleId: 'v17', targetModelName: 'PC78US-11', title: 'FC-2023-07 キャブ内装点検', category: 'フィールドキャンペーン', urgency: '数ヶ月後', progress: '完了', deadline: subDays(now, 5).toISOString(), staffId: 's2' },
  { id: 't_fc_17', vehicleId: 'v19', targetModelName: 'PC200-11', title: 'FC-2023-01 エンジンカバー交換', category: 'フィールドキャンペーン', urgency: '1ヶ月以内', progress: '進行中', deadline: addDays(now, 15).toISOString(), staffId: 's1' },
`;

// It might be duplicated. We can split and remove duplicates based on task IDs.
const lines = code.split('\\n');
const seenIds = new Set();
const newLines = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const match = line.match(/id:\\s*'([^']+)'/);
  if (match) {
    const id = match[1];
    if (seenIds.has(id) && id.startsWith('t_fc_1')) {
      // skip
      continue;
    }
    seenIds.add(id);
  }
  newLines.push(line);
}

fs.writeFileSync('src/lib/mock.ts', newLines.join('\\n'));
console.log('Fixed duplicates');
