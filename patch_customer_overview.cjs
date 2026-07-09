const fs = require('fs');
let code = fs.readFileSync('src/views/CustomerListView.tsx', 'utf8');

if (!code.includes('Building2')) {
  code = code.replace(/import \{([^}]+)\} from 'lucide-react';/, "import {$1, Building2} from 'lucide-react';");
}

const contentStart = code.indexOf('{/* TAB: OVERVIEW */}');
const rowStart = code.indexOf('<div className="flex flex-col xl:flex-row gap-6 h-full animate-in fade-in duration-200">');

if (rowStart !== -1) {
  const newRowStart = `<div className="flex flex-col gap-6 h-full animate-in fade-in duration-200">
                    {/* 会社概要 (Company Overview) */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 shrink-0">
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                        <Building2 className="w-5 h-5 mr-2 text-indigo-600" />
                        会社概要
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        <div>
                          <div className="text-xs font-bold text-slate-400 mb-1">企業名</div>
                          <div className="font-medium text-slate-800">{selectedCustomer.name}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-400 mb-1">所在地</div>
                          <div className="font-medium text-slate-800">{selectedCustomer.address}</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-400 mb-1">取引開始日</div>
                          <div className="font-medium text-slate-800">2015年 4月</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-400 mb-1">従業員数</div>
                          <div className="font-medium text-slate-800">約 150 名</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-400 mb-1">主要事業</div>
                          <div className="font-medium text-slate-800">土木工事、建築工事全般</div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-400 mb-1">特記事項</div>
                          <div className="font-medium text-slate-800 text-sm">来期より新拠点設立予定。増車の可能性あり。</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col xl:flex-row gap-6 flex-1 min-h-0">`;
  
  code = code.substring(0, rowStart) + newRowStart + code.substring(rowStart + '<div className="flex flex-col xl:flex-row gap-6 h-full animate-in fade-in duration-200">'.length);
}

fs.writeFileSync('src/views/CustomerListView.tsx', code);
console.log('Customer overview patched');
