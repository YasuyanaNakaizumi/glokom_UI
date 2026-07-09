const fs = require('fs');
let code = fs.readFileSync('src/lib/mock.ts', 'utf8');

const moreVehicles = `
  { id: 'v11', modelName: 'PC200-11', serialNumber: '10011', status: '稼働中', customerName: '佐藤建設', currentSmr: 1520 },
  { id: 'v12', modelName: 'WA380-8', serialNumber: '50033', status: '稼働中', customerName: '鈴木建機', currentSmr: 3200 },
  { id: 'v13', modelName: 'D61PX-24', serialNumber: '40055', status: '稼働中', customerName: '山田建設', currentSmr: 850 },
  { id: 'v14', modelName: 'HM300-5', serialNumber: '2008', status: '稼働中', customerName: 'ABC開発', currentSmr: 4100 },
  { id: 'v15', modelName: 'PC138US-11', serialNumber: '30450', status: '在庫', customerName: '田中工務店', currentSmr: 120 },
  { id: 'v16', modelName: 'WA200-8', serialNumber: '60020', status: '稼働中', customerName: '鈴木建機', currentSmr: 2100 },
  { id: 'v17', modelName: 'PC78US-11', serialNumber: '70060', status: '稼働中', customerName: '高橋土木', currentSmr: 950 },
  { id: 'v18', modelName: 'D61PX-24', serialNumber: '40060', status: '在庫', customerName: '佐藤建設', currentSmr: 50 },
  { id: 'v19', modelName: 'PC200-11', serialNumber: '10015', status: '稼働中', customerName: 'ABC開発', currentSmr: 4500 },
  { id: 'v20', modelName: 'HM300-5', serialNumber: '2010', status: '稼働中', customerName: '高橋土木', currentSmr: 3800 },
`;

code = code.replace(
  "{ id: 'v8', modelName: 'PC78US-11', serialNumber: '70055', status: '納入済', stockStatus: '納入済', customerName: '山田建設', currentSmr: 850, deliveryDate: subDays(now, 60).toISOString() }",
  "{ id: 'v8', modelName: 'PC78US-11', serialNumber: '70055', status: '納入済', stockStatus: '納入済', customerName: '山田建設', currentSmr: 850, deliveryDate: subDays(now, 60).toISOString() }," + moreVehicles
);

// Add some FC tasks for these new vehicles
const moreTasks = `
  { id: 't_fc_11', vehicleId: 'v11', targetModelName: 'PC200-11', title: 'FC-2023-01 エンジンカバー交換', category: 'フィールドキャンペーン', urgency: '1ヶ月以内', progress: '未着手', deadline: addDays(now, 5).toISOString() },
  { id: 't_fc_12', vehicleId: 'v11', targetModelName: 'PC200-11', title: 'FC-2023-05 ソフトウェアアップデート', category: 'フィールドキャンペーン', urgency: '数ヶ月後', progress: '未着手', deadline: addDays(now, 45).toISOString() },
  { id: 't_fc_13', vehicleId: 'v12', targetModelName: 'WA380-8', title: 'FC-2023-02 油圧センサー交換', category: 'フィールドキャンペーン', urgency: '緊急', progress: '未着手', deadline: subDays(now, 2).toISOString() },
  { id: 't_fc_14', vehicleId: 'v15', targetModelName: 'PC138US-11', title: 'FC-2023-03 モニターファームウェア更新', category: 'フィールドキャンペーン', urgency: '1ヶ月以内', progress: '進行中', deadline: addDays(now, 10).toISOString(), staffId: 's1' },
  { id: 't_fc_15', vehicleId: 'v16', targetModelName: 'WA200-8', title: 'FC-2023-04 燃料パイプ固定ブラケット追加', category: 'フィールドキャンペーン', urgency: '緊急', progress: '未着手', deadline: addDays(now, 1).toISOString() },
  { id: 't_fc_16', vehicleId: 'v17', targetModelName: 'PC78US-11', title: 'FC-2023-07 キャブ内装点検', category: 'フィールドキャンペーン', urgency: '数ヶ月後', progress: '完了', deadline: subDays(now, 5).toISOString(), staffId: 's2' },
  { id: 't_fc_17', vehicleId: 'v19', targetModelName: 'PC200-11', title: 'FC-2023-01 エンジンカバー交換', category: 'フィールドキャンペーン', urgency: '1ヶ月以内', progress: '進行中', deadline: addDays(now, 15).toISOString(), staffId: 's1' },
`;

code = code.replace(
  "  { id: 't_fc_6', vehicleId: 'v1', targetModelName: 'PC200-11', title: 'FC-2023-06 排気管カバー点検', category: 'フィールドキャンペーン', urgency: '1ヶ月以内', progress: '完了', deadline: addDays(now, 20).toISOString(), staffId: 's2' },",
  "  { id: 't_fc_6', vehicleId: 'v1', targetModelName: 'PC200-11', title: 'FC-2023-06 排気管カバー点検', category: 'フィールドキャンペーン', urgency: '1ヶ月以内', progress: '完了', deadline: addDays(now, 20).toISOString(), staffId: 's2' },\n" + moreTasks
);

fs.writeFileSync('src/lib/mock.ts', code);
console.log('Done');
