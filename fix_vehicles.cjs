const fs = require('fs');
let code = fs.readFileSync('src/lib/mock.ts', 'utf8');

code = code.replace(
  "{ id: 'v11', modelName: 'PC200-11', serialNumber: '10011', status: '稼働中', customerName: '佐藤建設', currentSmr: 1520 }",
  "{ id: 'v11', modelName: 'PC200-11', serialNumber: '10011', status: '納入済', stockStatus: '納入済', customerName: '佐藤建設', currentSmr: 1520 }"
);
code = code.replace(
  "{ id: 'v12', modelName: 'WA380-8', serialNumber: '50033', status: '稼働中', customerName: '鈴木建機', currentSmr: 3200 }",
  "{ id: 'v12', modelName: 'WA380-8', serialNumber: '50033', status: '納入済', stockStatus: '納入済', customerName: '鈴木建機', currentSmr: 3200 }"
);
code = code.replace(
  "{ id: 'v13', modelName: 'D61PX-24', serialNumber: '40055', status: '稼働中', customerName: '山田建設', currentSmr: 850 }",
  "{ id: 'v13', modelName: 'D61PX-24', serialNumber: '40055', status: '納入済', stockStatus: '納入済', customerName: '山田建設', currentSmr: 850 }"
);
code = code.replace(
  "{ id: 'v14', modelName: 'HM300-5', serialNumber: '2008', status: '稼働中', customerName: 'ABC開発', currentSmr: 4100 }",
  "{ id: 'v14', modelName: 'HM300-5', serialNumber: '2008', status: '納入済', stockStatus: '納入済', customerName: 'ABC開発', currentSmr: 4100 }"
);
code = code.replace(
  "{ id: 'v15', modelName: 'PC138US-11', serialNumber: '30450', status: '在庫', customerName: '田中工務店', currentSmr: 120 }",
  "{ id: 'v15', modelName: 'PC138US-11', serialNumber: '30450', status: '在庫', stockStatus: 'フリー在庫', customerName: '田中工務店', currentSmr: 120 }"
);
code = code.replace(
  "{ id: 'v16', modelName: 'WA200-8', serialNumber: '60020', status: '稼働中', customerName: '鈴木建機', currentSmr: 2100 }",
  "{ id: 'v16', modelName: 'WA200-8', serialNumber: '60020', status: '納入済', stockStatus: '納入済', customerName: '鈴木建機', currentSmr: 2100 }"
);
code = code.replace(
  "{ id: 'v17', modelName: 'PC78US-11', serialNumber: '70060', status: '稼働中', customerName: '高橋土木', currentSmr: 950 }",
  "{ id: 'v17', modelName: 'PC78US-11', serialNumber: '70060', status: '納入済', stockStatus: '納入済', customerName: '高橋土木', currentSmr: 950 }"
);
code = code.replace(
  "{ id: 'v18', modelName: 'D61PX-24', serialNumber: '40060', status: '在庫', customerName: '佐藤建設', currentSmr: 50 }",
  "{ id: 'v18', modelName: 'D61PX-24', serialNumber: '40060', status: '在庫', stockStatus: 'フリー在庫', customerName: '佐藤建設', currentSmr: 50 }"
);
code = code.replace(
  "{ id: 'v19', modelName: 'PC200-11', serialNumber: '10015', status: '稼働中', customerName: 'ABC開発', currentSmr: 4500 }",
  "{ id: 'v19', modelName: 'PC200-11', serialNumber: '10015', status: '納入済', stockStatus: '納入済', customerName: 'ABC開発', currentSmr: 4500 }"
);
code = code.replace(
  "{ id: 'v20', modelName: 'HM300-5', serialNumber: '2010', status: '稼働中', customerName: '高橋土木', currentSmr: 3800 }",
  "{ id: 'v20', modelName: 'HM300-5', serialNumber: '2010', status: '納入済', stockStatus: '納入済', customerName: '高橋土木', currentSmr: 3800 }"
);

fs.writeFileSync('src/lib/mock.ts', code);
console.log('Fixed vehicles');
