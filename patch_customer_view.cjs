const fs = require('fs');
const file = 'src/views/CustomerListView.tsx';
let content = fs.readFileSync(file, 'utf8');

const startIdx = content.indexOf('{/* Detail Header */}');
const endIdx = content.indexOf('{/* TAB: OVERVIEW */}');

const overviewTabStart = content.indexOf('{/* Column 0: Company Overview */}');
const overviewTabEnd = content.indexOf('{/* Column 1: Customer Members */}');

const newHeaderAndTabs = `
            {/* Detail Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
               <div className="flex items-center mb-6 md:hidden">
                  <button onClick={() => setSelectedCustomerId(null)} className="flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 bg-white shadow-sm border border-slate-200 px-3 py-1.5 rounded-lg">
                     <ArrowLeft className="w-4 h-4 mr-1.5" /> 戻る
                  </button>
               </div>
               
               {/* TAB: OVERVIEW */}`;

content = content.substring(0, startIdx) + newHeaderAndTabs + content.substring(endIdx + '{/* TAB: OVERVIEW */}'.length);

const col0Start = content.indexOf('{/* Column 0: Company Overview */}');
const col1Start = content.indexOf('{/* Column 1: Customer Members */}');

const newCompanyOverview = `
                    {/* Company Overview Header */}
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-6 flex flex-col shrink-0">
                       <div className="p-4 border-b border-slate-100 font-bold text-slate-800 flex items-center bg-slate-50/50 rounded-t-xl">
                         <Building2 className="w-4 h-4 mr-2 text-indigo-600"/>
                         会社概要
                       </div>
                       <div className="p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                         <div>
                           <div className="text-[10px] font-bold text-slate-400 mb-1">企業名</div>
                           <div className="font-medium text-slate-800 text-sm">{selectedCustomer.name}</div>
                         </div>
                         <div>
                           <div className="text-[10px] font-bold text-slate-400 mb-1">所在地</div>
                           <div className="font-medium text-slate-800 text-sm">{selectedCustomer.address}</div>
                         </div>
                         <div>
                           <div className="text-[10px] font-bold text-slate-400 mb-1">最終訪問</div>
                           <div className="font-medium text-slate-800 text-sm">
                             {selectedCustomer.lastVisitDate ? format(new Date(selectedCustomer.lastVisitDate), 'yyyy/MM/dd') : '未訪問'}
                           </div>
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
                       </div>
                       <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
                           <div className="text-[10px] font-bold text-slate-400 mb-1">特記事項</div>
                           <div className="font-medium text-slate-800 text-sm">来期より新拠点設立予定。増車の可能性あり。</div>
                       </div>
                    </div>

                    <div className="flex flex-col xl:flex-row gap-6 h-[500px] xl:h-auto xl:flex-1 min-h-0 animate-in fade-in duration-200">
`;

content = content.substring(0, col0Start) + newCompanyOverview + content.substring(col1Start);

// Change col-1, col-2, col-3 to take 1/3 width instead of 1/4
content = content.replace(/className="w-full xl:w-1\/4 flex flex-col min-h-0 bg-white border border-slate-200 rounded-xl shadow-sm"/g, 'className="w-full xl:w-1/3 flex flex-col min-h-0 bg-white border border-slate-200 rounded-xl shadow-sm"');

// Fix the vehicle detail to have a back button and take place of everything
content = content.replace(
  /{activeTab\.startsWith\('vehicle_'\) && \(/,
  `{activeTab.startsWith('vehicle_') && (
                 <div className="space-y-6 animate-in fade-in duration-200">
                   <button onClick={() => setActiveTab('overview')} className="flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 bg-white shadow-sm border border-slate-200 px-3 py-1.5 rounded-lg mb-2">
                     <ArrowLeft className="w-4 h-4 mr-1.5" /> 戻る
                   </button>
`
);

// We need to remove the wrapper `flex flex-col xl:flex-row gap-6 h-full animate-in fade-in duration-200`
// Wait, the previous replacement was:
// <div className="flex flex-col xl:flex-row gap-6 h-full animate-in fade-in duration-200">
// {newCompanyOverview}

const wrapperStartIdx = content.indexOf('<div className="flex flex-col xl:flex-row gap-6 h-full animate-in fade-in duration-200">');
if(wrapperStartIdx !== -1) {
  content = content.substring(0, wrapperStartIdx) + content.substring(wrapperStartIdx + '<div className="flex flex-col xl:flex-row gap-6 h-full animate-in fade-in duration-200">'.length);
}

fs.writeFileSync(file, content);
console.log('patched');
