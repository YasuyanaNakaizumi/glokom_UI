import { Vehicle, ServiceTask, Staff, Tool, ParkingArea, ContractTemplate, VehicleMaster, MechanicReportTemplate } from '../types';
import { addDays, subDays, format } from 'date-fns';

const now = new Date();

export const INITIAL_VEHICLES: Vehicle[] = [
  { id: 'v1', modelName: 'PC200-11', serialNumber: '10001', status: '在庫', stockStatus: 'フリー在庫', arrivalDate: subDays(now, 5).toISOString() },
  { id: 'v2', modelName: 'WA380-8', serialNumber: '50021', status: '納入済', stockStatus: '納入済', customerName: '山田建設', currentSmr: 1200, deliveryDate: subDays(now, 85).toISOString(), contracts: [{ contractId: 'c1', startDate: subDays(now, 85).toISOString(), startSmr: 0 }] },
  { id: 'v3', modelName: 'HM300-5', serialNumber: '2005', status: '受け入れ予定', stockStatus: 'フリー在庫', shipDate: subDays(now, 2).toISOString(), arrivalDate: addDays(now, 1).toISOString() },
  { id: 'v4', modelName: 'PC138US-11', serialNumber: '30441', status: '搬入済', stockStatus: 'フリー在庫', arrivalDate: subDays(now, 1).toISOString() },
  { id: 'v5', modelName: 'D61PX-24', serialNumber: '40050', status: '納入済', stockStatus: '納入済', customerName: 'ABC開発', currentSmr: 3200, deliveryDate: subDays(now, 325).toISOString(), contracts: [{ contractId: 'c2', startDate: subDays(now, 325).toISOString(), startSmr: 0 }] },
  { id: 'v6', modelName: 'PC200-11', serialNumber: '10002', status: '納入済', stockStatus: '納入済', customerName: '山田建機', currentSmr: 500, deliveryDate: subDays(now, 120).toISOString() },
  { id: 'v7', modelName: 'WA200-8', serialNumber: '60012', status: '納入済', stockStatus: '納入済', customerName: '佐藤建設', currentSmr: 2100, deliveryDate: subDays(now, 400).toISOString() },
  { id: 'v8', modelName: 'PC78US-11', serialNumber: '70055', status: '納入済', stockStatus: '納入済', customerName: '山田建設', currentSmr: 850, deliveryDate: subDays(now, 60).toISOString() },
  { id: 'v11', modelName: 'PC200-11', serialNumber: '10011', status: '納入済', stockStatus: '納入済', customerName: '佐藤建設', currentSmr: 1520 },
  { id: 'v12', modelName: 'WA380-8', serialNumber: '50033', status: '納入済', stockStatus: '納入済', customerName: '鈴木建機', currentSmr: 3200 },
  { id: 'v13', modelName: 'D61PX-24', serialNumber: '40055', status: '納入済', stockStatus: '納入済', customerName: '山田建設', currentSmr: 850 },
  { id: 'v14', modelName: 'HM300-5', serialNumber: '2008', status: '納入済', stockStatus: '納入済', customerName: 'ABC開発', currentSmr: 4100 },
  { id: 'v15', modelName: 'PC138US-11', serialNumber: '30450', status: '在庫', stockStatus: 'フリー在庫', customerName: '田中工務店', currentSmr: 120 },
  { id: 'v16', modelName: 'WA200-8', serialNumber: '60020', status: '納入済', stockStatus: '納入済', customerName: '鈴木建機', currentSmr: 2100 },
  { id: 'v17', modelName: 'PC78US-11', serialNumber: '70060', status: '納入済', stockStatus: '納入済', customerName: '高橋土木', currentSmr: 950 },
  { id: 'v18', modelName: 'D61PX-24', serialNumber: '40060', status: '在庫', stockStatus: 'フリー在庫', customerName: '佐藤建設', currentSmr: 50 },
  { id: 'v19', modelName: 'PC200-11', serialNumber: '10015', status: '納入済', stockStatus: '納入済', customerName: 'ABC開発', currentSmr: 4500 },
  { id: 'v20', modelName: 'HM300-5', serialNumber: '2010', status: '納入済', stockStatus: '納入済', customerName: '高橋土木', currentSmr: 3800 },

];

export const INITIAL_TASKS: ServiceTask[] = [
  // v1 (PC200-11, 在庫)
  { id: 't1_1', vehicleId: 'v1', targetModelName: 'PC200-11', title: '受入点検', category: '受け入れ点検', urgency: '1ヶ月以内', progress: '完了', deadline: subDays(now, 4).toISOString(), staffId: 's1' },
  { id: 't1_2', vehicleId: 'v1', targetModelName: 'PC200-11', title: '在庫点検 (月次)', category: '在庫点検', urgency: '1ヶ月以内', progress: '進行中', deadline: addDays(now, 10).toISOString(), staffId: 's2', chatMessages: [
    { id: '1', text: '今月の在庫点検、バッテリーが弱っている車両があります。', sender: '鈴木一郎', time: '09:00', isSelf: false },
    { id: '2', text: '了解しました。部品の手配を進めますか？', sender: 'あなた', time: '09:15', isSelf: true }
  ] },

  // v2 (WA380-8, 納入済, delivered 85 days ago)
  { id: 't2_1', vehicleId: 'v2', targetModelName: 'WA380-8', title: '受入点検', category: '受け入れ点検', urgency: '緊急', progress: '完了', deadline: subDays(now, 95).toISOString(), staffId: 's1' },
  { id: 't2_2', vehicleId: 'v2', targetModelName: 'WA380-8', title: '納入作業', category: '納入作業', urgency: '緊急', progress: '完了', deadline: subDays(now, 85).toISOString(), staffId: 's2' },
  { id: 't2_3', vehicleId: 'v2', targetModelName: 'WA380-8', title: '1ヶ月 新車巡回', category: '新車巡回', urgency: '緊急', progress: '完了', deadline: subDays(now, 55).toISOString(), staffId: 's1' },
  // 3ヶ月 is approaching (target is ~91 days after delivery -> in 6 days), not assigned -> 近接

  // v3 (HM300-5, 受け入れ予定)
  { id: 't3_1', vehicleId: 'v3', targetModelName: 'HM300-5', title: '受入点検', category: '受け入れ点検', urgency: '緊急', progress: '未着手', deadline: addDays(now, 2).toISOString(), staffId: 's1' },

  // v4 (PC138US-11, 搬入済)
  // No tasks assigned yet -> 未実施

  // v5 (D61PX-24, 納入済, delivered 325 days ago)
  { id: 't5_1', vehicleId: 'v5', targetModelName: 'D61PX-24', title: '受入点検', category: '受け入れ点検', urgency: '緊急', progress: '完了', deadline: subDays(now, 335).toISOString(), staffId: 's1' },
  { id: 't5_2', vehicleId: 'v5', targetModelName: 'D61PX-24', title: '納入作業', category: '納入作業', urgency: '緊急', progress: '完了', deadline: subDays(now, 325).toISOString(), staffId: 's2' },
  { id: 't5_3', vehicleId: 'v5', targetModelName: 'D61PX-24', title: '1ヶ月 新車巡回', category: '新車巡回', urgency: '緊急', progress: '完了', deadline: subDays(now, 295).toISOString(), staffId: 's1' },
  { id: 't5_4', vehicleId: 'v5', targetModelName: 'D61PX-24', title: '3ヶ月 新車巡回', category: '新車巡回', urgency: '緊急', progress: '完了', deadline: subDays(now, 235).toISOString(), staffId: 's1' },
  { id: 't5_5', vehicleId: 'v5', targetModelName: 'D61PX-24', title: '5ヶ月 新車巡回', category: '新車巡回', urgency: '緊急', progress: '完了', deadline: subDays(now, 175).toISOString(), staffId: 's2' },
  // 11ヶ月 -> delivered 325 days ago + 335 days = +10 days from now -> approaching. Let's make it assigned!
  { id: 't5_6', vehicleId: 'v5', targetModelName: 'D61PX-24', title: '11ヶ月 新車巡回', category: '新車巡回', urgency: '1ヶ月以内', progress: '未着手', deadline: addDays(now, 10).toISOString(), staffId: 's3' },
  
  // Others
  { id: 't_fc', vehicleId: 'v5', targetModelName: 'D61PX-24', title: 'FC-2023-01 エンジンカバー交換', category: 'フィールドキャンペーン', urgency: '緊急', progress: '未着手', deadline: addDays(now, 5).toISOString(), chatMessages: [
    { id: '3', text: 'カバーの部品は入荷しましたか？', sender: '佐藤健太', time: '11:20', isSelf: false },
    { id: '4', text: 'はい、昨日入荷済みです。午後の作業お願いします。', sender: 'あなた', time: '11:25', isSelf: true }
  ] },
  { id: 't_fc_3', vehicleId: 'v2', targetModelName: 'WA380-8', title: 'FC-2023-02 油圧センサー交換', category: 'フィールドキャンペーン', urgency: '緊急', progress: '未着手', deadline: addDays(now, 12).toISOString() },
  { id: 't_fc_4', vehicleId: 'v4', targetModelName: 'PC138US-11', title: 'FC-2023-03 モニターファームウェア更新', category: 'フィールドキャンペーン', urgency: '1ヶ月以内', progress: '承認待ち', deadline: subDays(now, 2).toISOString(), staffId: 's1' },
  { id: 't_fc_5', vehicleId: 'v7', targetModelName: 'WA200-8', title: 'FC-2023-04 燃料パイプ固定ブラケット追加', category: 'フィールドキャンペーン', urgency: '緊急', progress: '未着手', deadline: subDays(now, 10).toISOString() },
  { id: 't_fc_6', vehicleId: 'v1', targetModelName: 'PC200-11', title: 'FC-2023-06 排気管カバー点検', category: 'フィールドキャンペーン', urgency: '1ヶ月以内', progress: '完了', deadline: addDays(now, 20).toISOString(), staffId: 's2' },

  { id: 't_fc_11', vehicleId: 'v11', targetModelName: 'PC200-11', title: 'FC-2023-01 エンジンカバー交換', category: 'フィールドキャンペーン', urgency: '1ヶ月以内', progress: '未着手', deadline: addDays(now, 5).toISOString() },
  { id: 't_fc_12', vehicleId: 'v11', targetModelName: 'PC200-11', title: 'FC-2023-05 ソフトウェアアップデート', category: 'フィールドキャンペーン', urgency: '数ヶ月後', progress: '未着手', deadline: addDays(now, 45).toISOString() },
  { id: 't_fc_13', vehicleId: 'v12', targetModelName: 'WA380-8', title: 'FC-2023-02 油圧センサー交換', category: 'フィールドキャンペーン', urgency: '緊急', progress: '未着手', deadline: subDays(now, 2).toISOString() },
  { id: 't_fc_14', vehicleId: 'v15', targetModelName: 'PC138US-11', title: 'FC-2023-03 モニターファームウェア更新', category: 'フィールドキャンペーン', urgency: '1ヶ月以内', progress: '進行中', deadline: addDays(now, 10).toISOString(), staffId: 's1' },
  { id: 't_fc_15', vehicleId: 'v16', targetModelName: 'WA200-8', title: 'FC-2023-04 燃料パイプ固定ブラケット追加', category: 'フィールドキャンペーン', urgency: '緊急', progress: '未着手', deadline: addDays(now, 1).toISOString() },
  { id: 't_fc_16', vehicleId: 'v17', targetModelName: 'PC78US-11', title: 'FC-2023-07 キャブ内装点検', category: 'フィールドキャンペーン', urgency: '数ヶ月後', progress: '完了', deadline: subDays(now, 5).toISOString(), staffId: 's2' },

  { id: 't_fc_17', vehicleId: 'v19', targetModelName: 'PC200-11', title: 'FC-2023-01 エンジンカバー交換', category: 'フィールドキャンペーン', urgency: '1ヶ月以内', progress: '進行中', deadline: addDays(now, 15).toISOString(), staffId: 's1' },

  { id: 't_rep', vehicleId: 'v2', targetModelName: 'WA380-8', title: 'オイル漏れ修理', category: '故障修理', urgency: '緊急', progress: '完了', deadline: subDays(now, 1).toISOString(), isApproved: false, staffId: 's2' },
  { id: 't_maint_1', vehicleId: 'v4', targetModelName: 'PC138US-11', title: 'エンジンオイル交換', category: '定期点検', urgency: '数ヶ月後', progress: '完了', deadline: subDays(now, 2).toISOString(), isApproved: false, staffId: 's1' },
  { id: 't_maint_2', vehicleId: 'v1', targetModelName: 'PC200-11', title: '在庫維持 定期エンジン始動', category: '定期点検', urgency: '数ヶ月後', progress: '未着手', deadline: addDays(now, 10).toISOString() },
  { id: 't_rep_2', vehicleId: 'v6', targetModelName: 'PC200-11', title: '油圧ホース交換', category: '故障修理', urgency: '緊急', progress: '進行中', deadline: addDays(now, 2).toISOString(), staffId: 's1' },
  { id: 't_maint_3', vehicleId: 'v7', targetModelName: 'WA200-8', title: '2000時間メンテナンス', category: '定期点検', urgency: '1ヶ月以内', progress: '未着手', deadline: addDays(now, 15).toISOString(), staffId: 's2' },
  { id: 't_insp_1', vehicleId: 'v8', targetModelName: 'PC78US-11', title: '特定自主検査', category: '車検', urgency: '1ヶ月以内', progress: '承認待ち', deadline: subDays(now, 5).toISOString(), staffId: 's1' },
  { id: 't_fc_2', vehicleId: 'v5', targetModelName: 'D61PX-24', title: 'FC-2023-05 ソフトウェアアップデート', category: 'フィールドキャンペーン', urgency: '緊急', progress: '完了', deadline: subDays(now, 30).toISOString(), staffId: 's3' }
];

export const INITIAL_STAFF: Staff[] = [
  { id: 's1', name: '佐藤健太', role: 'サービス技師' },
  { id: 's2', name: '鈴木一郎', role: 'マイスター' },
  { id: 's3', name: '高橋美咲', role: 'フロント' }
];

export const INITIAL_PARKING: ParkingArea[] = [
  { id: 'p1', name: '第1駐車場 (搬入待機)', capacity: 10, x: 50, y: 50, width: 200, height: 150 },
  { id: 'p2', name: '第2駐車場 (在庫用)', capacity: 30, x: 300, y: 50, width: 300, height: 200 },
  { id: 'p3', name: '作業ベイ A', capacity: 2, x: 50, y: 250, width: 100, height: 100 }
];

export const INITIAL_TOOLS: Tool[] = [
  { id: 'tool1', name: '油圧テストキット', description: '高圧ラインの圧力測定用', manager: '整備1課' },
  { id: 'tool2', name: 'PC診断ツール', description: 'ECUエラー読み取り', manager: 'フロント' }
];

export const INITIAL_CONTRACTS: ContractTemplate[] = [
  { id: 'c1', title: '3年間 新車保証プラン', description: '購入から3年間または10000SMR', rule: 'whichever_first', months: 36, smr: 10000,
    partsConfig: {
      'WA380-8': [{ partNumber: 'FIL-1001', partName: 'エンジンオイルフィルター', quantity: 1 }],
      'PC200-11': [{ partNumber: 'FIL-2001', partName: '作動油フィルター', quantity: 2 }]
    },
    defaultParts: [{ partNumber: 'DEF-100', partName: '汎用点検キット', quantity: 1 }]
  },
  { id: 'c2', title: '5年間 延長保証プラン', description: '購入から5年間または15000SMR', rule: 'whichever_first', months: 60, smr: 15000,
    partsConfig: {
      'D61PX-24': [{ partNumber: 'BAT-1001', partName: 'バッテリー', quantity: 1 }]
    }
  },
  { id: 'c3', title: '1年間 中古車ライト保証', description: '購入から1年間', rule: 'months', months: 12 },
  { id: 'c4', title: '特別修理サポート', description: 'カスタム条件での保証（要個別確認）', rule: 'custom' },
  { id: 'c5', title: '5000SMR 限度保証', description: '5000SMRまでの部品交換保証', rule: 'smr', smr: 5000 }
];

export const INITIAL_VEHICLE_MASTERS: VehicleMaster[] = [
  { id: 'm1', modelName: '軽トラック (ハイゼット)', maker: 'ダイハツ', type: '代理店特殊車両/クレーン等' },
  { id: 'm2', modelName: 'クレーン付きトラック (レンジャー)', maker: '日野', type: '代理店特殊車両/クレーン等' },
  { id: 'm3', modelName: 'サービスカー (ハイエース)', maker: 'トヨタ', type: '代理店特殊車両/クレーン等' },
  { id: 'm4', modelName: '大型キャリアカー (プロフィア)', maker: '日野', type: '代理店特殊車両/クレーン等' }
];

export const INITIAL_REPORT_TEMPLATES: MechanicReportTemplate[] = [
  {
    id: 'rt1',
    name: '新車巡回',
    fields: [
      { id: 'f1', type: 'checkbox', label: '外観に傷がないか確認' },
      { id: 'f2', type: 'checkbox', label: 'オイル漏れの有無' },
      { id: 'f3', type: 'text', label: 'お客様からのヒアリング（症状や気になるところ）' },
      { id: 'f4', type: 'image', label: '車体全体の写真' }
    ]
  },
  {
    id: 'rt2',
    name: '一般修理',
    fields: [
      { id: 'f5', type: 'text', label: '故障の詳細な症状' },
      { id: 'f6', type: 'checkbox', label: '応急処置の実施' },
      { id: 'f7', type: 'image', label: '故障部位の写真' }
    ]
  }
];

export const INITIAL_SALES_REPORTS: any[] = [
  {
    id: 'sr1',
    date: format(new Date(), 'yyyy-MM-dd'),
    staffId: 's1',
    visits: [
      { customerName: '山田建機', memo: '新型油圧ショベルの買い替え提案を実施。前向きな回答。' },
      { customerName: '佐藤建設', memo: '定期訪問。稼働状況の確認。' }
    ]
  },
  {
    id: 'sr2',
    date: format(subDays(now, 1), 'yyyy-MM-dd'),
    staffId: 's2',
    visits: [
      { customerName: '高橋土木', memo: 'リースの満了に伴う後継機の説明。' }
    ]
  }
];
export const INITIAL_SALES_PLANS: any[] = [
  {
    id: 'sp1',
    staffId: 's1',
    title: '上半期営業計画',
    visitPlans: [
      { id: 'vp1', startMonth: format(new Date(), 'yyyy-MM'), endMonth: format(new Date(), 'yyyy-MM'), customerName: '山田建機', targetVisits: 5, plannedDates: [] },
      { id: 'vp2', startMonth: format(new Date(), 'yyyy-MM'), endMonth: format(new Date(), 'yyyy-MM'), customerName: '佐藤建設', targetVisits: 3, plannedDates: [] }
    ],
    salesTargets: [
      { id: 'st1', startMonth: format(new Date(), 'yyyy-MM'), endMonth: format(new Date(), 'yyyy-MM'), customerName: '山田建機', productName: 'PC200-11', amount: 15000000 },
      { id: 'st2', startMonth: format(new Date(), 'yyyy-MM'), endMonth: format(new Date(), 'yyyy-MM'), customerName: '鈴木工業', productName: 'WA200-8', amount: 12000000 }
    ]
  }
];

export const INITIAL_SALES_LEADS: any[] = [
  {
    id: 'sl1',
    customerName: '山田建機 (PC200買い替え)',
    memo: '新型油圧ショベルの買い替え検討。\n社長は前向き。\n来週見積もり提出予定。',
    createdAt: format(subDays(now, 2), 'yyyy-MM-dd'),
    salesTargetId: 'st1'
  },
  {
    id: 'sl2',
    customerName: '高橋土木 (リース満了)',
    memo: '3月リース満了に伴い、新車購入の可能性あり。',
    createdAt: format(subDays(now, 5), 'yyyy-MM-dd'),
    finalAmount: 11000000
  }
];

export const INITIAL_SALES_QUOTES = [
  {
    id: 'sq1',
    leadId: 'sl1',
    customerName: 'A社 (山田建機)',
    status: '見積提示済',
    specialRequest: '特注アタッチメント（解体用フォーク）付き。\n希望納期: 2026/09/01',
    specialRequestDeadline: '2026/09/01',
    cpqLinked: true,
    items: [
      { id: 'i1', name: 'PC200-11 本体', originalPrice: 15000000, finalPrice: 14500000 },
      { id: 'i2', name: '特注フォーク', originalPrice: 1200000, finalPrice: 1200000 }
    ],
    modificationInstruction: 'アタッチメント配管追加、およびグリスアップ自動化キットの取り付け',
    services: ['3年間 新車保証プラン'],
    files: [
      { id: 'f1', name: 'リース契約書.pdf', type: 'application/pdf' }
    ],
    createdAt: subDays(now, 1).toISOString()
  }
];

export const INITIAL_PART_STOCKS: import('../types').PartStockItem[] = [
  { id: 'p1', partNumber: '10W-30', partName: 'エンジンオイル 10W-30', quantity: 50, lastPurchaseDate: '2023-10-01', history: [] },
  { id: 'p2', partNumber: 'X-12', partName: 'オイルフィルター X-12', quantity: 120, lastPurchaseDate: '2023-11-15', history: [] },
  { id: 'p3', partNumber: '6.00-9', partName: 'ノーパンクタイヤ 6.00-9', quantity: 24, lastPurchaseDate: '2023-12-05', history: [] },
  { id: 'p4', partNumber: '48V', partName: 'バッテリー 48V', quantity: 5, lastPurchaseDate: '2024-01-20', history: [] },
];
