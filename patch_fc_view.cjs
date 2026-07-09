const fs = require('fs');
let code = fs.readFileSync('src/views/FleetView.tsx', 'utf8');

const targetStr = `              ) : (
                <div className="flex flex-col gap-3">
                  {fcVehicleStats.map(stat => {
                    const isExpanded = expandedFcVehicleId === stat.vehicle.id;
                    return (
                      <div key={stat.vehicle.id} className={cn("bg-white border rounded-xl shadow-sm transition-all overflow-hidden", isExpanded ? "border-indigo-400 ring-1 ring-indigo-400" : "border-slate-200 hover:border-indigo-300")}>
                        {/* Summary Row (Clickable) */}
                        <div 
                          className="p-3 sm:p-4 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                          onClick={() => setExpandedFcVehicleId(isExpanded ? null : stat.vehicle.id)}
                        >
                          <div className="flex-1 min-w-0 flex flex-col xl:flex-row xl:items-center gap-4 xl:gap-8 w-full">
                             <div className="flex items-center gap-3 flex-wrap min-w-[300px]">
                               <span className="font-bold text-lg text-slate-800">{stat.vehicle.modelName}</span>
                               <span className="text-slate-500 font-mono text-sm">{stat.vehicle.serialNumber}</span>
                               {stat.vehicle.customerName && <span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600 font-bold">{stat.vehicle.customerName}</span>}
                               {stat.unexecutedCount > 0 && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">未実施あり</span>}
                             </div>
                             <div className="flex items-center gap-8 text-sm flex-1">
                               <div className="flex flex-col">
                                 <span className="text-[10px] font-bold text-slate-400">対象件数</span>
                                 <span className="font-bold text-slate-700">{stat.totalCount}</span>
                               </div>
                               <div className="flex flex-col">
                                 <span className={cn("text-[10px] font-bold", stat.unexecutedCount > 0 ? "text-amber-600" : "text-slate-400")}>未実施</span>
                                 <span className={cn("font-bold", stat.unexecutedCount > 0 ? "text-amber-700" : "text-slate-700")}>{stat.unexecutedCount}</span>
                               </div>
                               <div className="flex flex-col">
                                 <span className={cn("text-[10px] font-bold", stat.overdueCount > 0 ? "text-rose-600" : "text-slate-400")}>期限超過</span>
                                 <span className={cn("font-bold", stat.overdueCount > 0 ? "text-rose-700" : "text-slate-700")}>{stat.overdueCount}</span>
                               </div>
                               <div className="flex flex-col">
                                 <span className="text-[10px] font-bold text-slate-400">アサイン済</span>
                                 <span className="font-bold text-blue-700">{stat.completedAssignedCount} <span className="text-slate-400 text-xs">/ {stat.assignedCount}</span></span>
                               </div>
                             </div>
                          </div>
                          <div className="shrink-0 flex items-center">
                            <div className={cn("p-2 rounded-full transition-colors", isExpanded ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-500")}>
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                          </div>
                        </div>`;

const replaceStr = `              ) : (
                <div className="flex flex-col gap-3">
                  {/* Table Header */}
                  <div className="hidden lg:grid grid-cols-[300px_1fr_120px_120px_50px] gap-6 px-5 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <div>車両情報</div>
                    <div>進捗状況</div>
                    <div className="text-right">未実施</div>
                    <div className="text-right">期限超過</div>
                    <div></div>
                  </div>

                  {fcVehicleStats.map(stat => {
                    const isExpanded = expandedFcVehicleId === stat.vehicle.id;
                    
                    // Progress calculations
                    const pctCompleted = stat.totalCount > 0 ? (stat.completedAssignedCount / stat.totalCount) * 100 : 0;
                    const pctAssigned = stat.totalCount > 0 ? ((stat.assignedCount - stat.completedAssignedCount) / stat.totalCount) * 100 : 0;
                    const pctOverdue = stat.totalCount > 0 ? (stat.overdueCount / stat.totalCount) * 100 : 0;
                    const pctUnassigned = stat.totalCount > 0 ? ((stat.unexecutedCount - stat.overdueCount - (stat.assignedCount - stat.completedAssignedCount)) / stat.totalCount) * 100 : 0;

                    return (
                      <div key={stat.vehicle.id} className={cn("bg-white border rounded-xl shadow-sm transition-all overflow-hidden", isExpanded ? "border-indigo-400 ring-1 ring-indigo-400" : "border-slate-200 hover:border-indigo-300")}>
                        {/* Summary Row (Clickable) */}
                        <div 
                          className="p-4 lg:p-5 flex flex-col lg:grid lg:grid-cols-[300px_1fr_120px_120px_50px] items-start lg:items-center gap-4 lg:gap-6 cursor-pointer hover:bg-slate-50/50 transition-colors"
                          onClick={() => setExpandedFcVehicleId(isExpanded ? null : stat.vehicle.id)}
                        >
                          {/* 1. Vehicle Info */}
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-base text-slate-800 truncate">{stat.vehicle.modelName}</span>
                              <span className="text-slate-400 font-mono text-xs">{stat.vehicle.serialNumber}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {stat.vehicle.customerName ? (
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold truncate">{stat.vehicle.customerName}</span>
                              ) : (
                                <span className="text-slate-300 text-xs">---</span>
                              )}
                              {stat.unexecutedCount > 0 && <span className="text-amber-600 text-[10px] font-bold">未実施あり</span>}
                            </div>
                          </div>

                          {/* 2. Progress Bar */}
                          <div className="w-full flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-1.5 text-xs">
                              <span className="font-bold text-slate-500">対象 {stat.totalCount}件</span>
                              <span className="text-slate-400">{stat.completedAssignedCount}件 完了</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                              <div style={{ width: \`\${pctCompleted}%\` }} className="bg-emerald-500 transition-all duration-500" title="完了" />
                              <div style={{ width: \`\${pctAssigned}%\` }} className="bg-blue-400 transition-all duration-500" title="アサイン済（未完了）" />
                              <div style={{ width: \`\${pctUnassigned}%\` }} className="bg-amber-300 transition-all duration-500" title="未アサイン" />
                              <div style={{ width: \`\${pctOverdue}%\` }} className="bg-rose-500 transition-all duration-500" title="期限超過" />
                            </div>
                          </div>

                          {/* 3. Unexecuted Count */}
                          <div className="flex lg:flex-col items-center justify-between lg:justify-center w-full lg:text-right">
                             <span className="lg:hidden text-xs font-bold text-slate-400">未実施</span>
                             <span className={cn("text-lg font-bold font-mono", stat.unexecutedCount > 0 ? "text-amber-600" : "text-slate-300")}>
                               {stat.unexecutedCount}
                             </span>
                          </div>

                          {/* 4. Overdue Count */}
                          <div className="flex lg:flex-col items-center justify-between lg:justify-center w-full lg:text-right">
                             <span className="lg:hidden text-xs font-bold text-slate-400">期限超過</span>
                             <span className={cn("text-lg font-bold font-mono", stat.overdueCount > 0 ? "text-rose-600" : "text-slate-300")}>
                               {stat.overdueCount}
                             </span>
                          </div>

                          {/* 5. Chevron */}
                          <div className="hidden lg:flex justify-end">
                            <div className={cn("p-1.5 rounded-full transition-colors", isExpanded ? "bg-indigo-100 text-indigo-700" : "text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600")}>
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                          </div>
                        </div>`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('src/views/FleetView.tsx', code);
  console.log('Successfully updated FC view block');
} else {
  console.log('Target string not found');
}
