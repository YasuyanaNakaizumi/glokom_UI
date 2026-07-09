const fs = require('fs');
let code = fs.readFileSync('src/views/CustomerListView.tsx', 'utf8');

// The block we want to replace starts with {/* TAB: OVERVIEW */} and ends just before {/* Column 1: Customer Members */}
const startMarker = "{/* 会社概要 (Company Overview) */}";
const endMarker = "{/* Column 1: Customer Members */}";

const startIdx = code.indexOf(startMarker);
const endIdx = code.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
  const replacement = `
                    <div className="flex flex-col xl:flex-row gap-6 h-full animate-in fade-in duration-200">
                    
                    {/* Column 0: Company Overview */}
                    <div className="w-full xl:w-1/4 flex flex-col min-h-0 bg-white border border-slate-200 rounded-xl shadow-sm">
                       <div className="p-4 border-b border-slate-100 font-bold text-slate-800 flex items-center bg-slate-50/50 rounded-t-xl">
                         <Building2 className="w-4 h-4 mr-2 text-indigo-600"/>
                         会社概要
                       </div>
                       <div className="p-4 overflow-y-auto flex-1 space-y-4">
                         <div>
                           <div className="text-[10px] font-bold text-slate-400 mb-1">企業名</div>
                           <div className="font-medium text-slate-800 text-sm">{selectedCustomer.name}</div>
                         </div>
                         <div>
                           <div className="text-[10px] font-bold text-slate-400 mb-1">所在地</div>
                           <div className="font-medium text-slate-800 text-sm">{selectedCustomer.address}</div>
                         </div>
                         <div>
                           <div className="text-[10px] font-bold text-slate-400 mb-1">取引開始日</div>
                           <div className="font-medium text-slate-800 text-sm">2015年 4月</div>
                         </div>
                         <div>
                           <div className="text-[10px] font-bold text-slate-400 mb-1">従業員数</div>
                           <div className="font-medium text-slate-800 text-sm">約 150 名</div>
                         </div>
                         <div>
                           <div className="text-[10px] font-bold text-slate-400 mb-1">主要事業</div>
                           <div className="font-medium text-slate-800 text-sm">土木工事、建築工事全般</div>
                         </div>
                         <div>
                           <div className="text-[10px] font-bold text-slate-400 mb-1">特記事項</div>
                           <div className="font-medium text-slate-800 text-sm">来期より新拠点設立予定。増車の可能性あり。</div>
                         </div>
                       </div>
                    </div>

                    `;
                    
  // Replace the exact section
  // Wait, we need to replace from `<div className="flex flex-col gap-6 h-full animate-in fade-in duration-200">`
  
  const containerStart = code.lastIndexOf('<div className="flex flex-col gap-6 h-full animate-in fade-in duration-200">', startIdx);
  if (containerStart !== -1) {
    code = code.substring(0, containerStart) + replacement + code.substring(endIdx);
  }
  
  // Update xl:w-1/3 to xl:w-1/4 for the other 3 columns
  code = code.replace(/xl:w-1\/3/g, 'xl:w-1/4');
  
  fs.writeFileSync('src/views/CustomerListView.tsx', code);
  console.log('Overview patched to 4 columns');
} else {
  console.log('Markers not found');
}
