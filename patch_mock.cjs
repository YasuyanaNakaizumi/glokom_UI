const fs = require('fs');
let content = fs.readFileSync('src/lib/mock.ts', 'utf8');

const newVehicles = `export const INITIAL_VEHICLES: Vehicle[] = [
  { id: 'v1', modelName: 'PC200-11', serialNumber: '10001', status: '在庫', stockStatus: 'フリー在庫', arrivalDate: subDays(now, 5).toISOString() },
  { id: 'v2', modelName: 'WA380-8', serialNumber: '50021', status: '納入済', stockStatus: '納入済', customerName: '山田建設', currentSmr: 1200, deliveryDate: subDays(now, 85).toISOString(), contracts: [{ contractId: 'c1', startDate: subDays(now, 85).toISOString(), startSmr: 0 }] },
  { id: 'v3', modelName: 'HM300-5', serialNumber: '2005', status: '受け入れ予定', stockStatus: 'フリー在庫', shipDate: subDays(now, 2).toISOString(), arrivalDate: addDays(now, 1).toISOString() },
  { id: 'v4', modelName: 'PC138US-11', serialNumber: '30441', status: '搬入済', stockStatus: 'フリー在庫', arrivalDate: subDays(now, 1).toISOString() },
  { id: 'v5', modelName: 'D61PX-24', serialNumber: '40050', status: '納入済', stockStatus: '納入済', customerName: 'ABC開発', currentSmr: 3200, deliveryDate: subDays(now, 325).toISOString(), contracts: [{ contractId: 'c2', startDate: subDays(now, 325).toISOString(), startSmr: 0 }] },
  { id: 'v6', modelName: 'PC200-11', serialNumber: '10002', status: '納入済', stockStatus: '納入済', customerName: '山田建機', currentSmr: 500, deliveryDate: subDays(now, 120).toISOString() },
  { id: 'v7', modelName: 'WA200-8', serialNumber: '60012', status: '納入済', stockStatus: '納入済', customerName: '佐藤建設', currentSmr: 2100, deliveryDate: subDays(now, 400).toISOString() },
  { id: 'v8', modelName: 'PC78US-11', serialNumber: '70055', status: '納入済', stockStatus: '納入済', customerName: '山田建設', currentSmr: 850, deliveryDate: subDays(now, 60).toISOString() }
];`;

content = content.replace(/export const INITIAL_VEHICLES: Vehicle\[\] = \[[\s\S]*?\];/, newVehicles);

const taskInsertPoint = "  { id: 't_maint_2', vehicleId: 'v1', targetModelName: 'PC200-11', title: '在庫維持 定期エンジン始動', category: '定期点検', urgency: '数ヶ月後', progress: '未着手', deadline: addDays(now, 10).toISOString() }";
const newTasks = `  { id: 't_maint_2', vehicleId: 'v1', targetModelName: 'PC200-11', title: '在庫維持 定期エンジン始動', category: '定期点検', urgency: '数ヶ月後', progress: '未着手', deadline: addDays(now, 10).toISOString() },
  { id: 't_rep_2', vehicleId: 'v6', targetModelName: 'PC200-11', title: '油圧ホース交換', category: '故障修理', urgency: '緊急', progress: '進行中', deadline: addDays(now, 2).toISOString(), staffId: 's1' },
  { id: 't_maint_3', vehicleId: 'v7', targetModelName: 'WA200-8', title: '2000時間メンテナンス', category: '定期点検', urgency: '1ヶ月以内', progress: '未着手', deadline: addDays(now, 15).toISOString(), staffId: 's2' },
  { id: 't_insp_1', vehicleId: 'v8', targetModelName: 'PC78US-11', title: '特定自主検査', category: '車検', urgency: '1ヶ月以内', progress: '承認待ち', deadline: subDays(now, 5).toISOString(), staffId: 's1' },
  { id: 't_fc_2', vehicleId: 'v5', targetModelName: 'D61PX-24', title: 'FC-2023-05 ソフトウェアアップデート', category: 'フィールドキャンペーン', urgency: '緊急', progress: '完了', deadline: subDays(now, 30).toISOString(), staffId: 's3' }`;

content = content.replace(taskInsertPoint, newTasks);

fs.writeFileSync('src/lib/mock.ts', content);
