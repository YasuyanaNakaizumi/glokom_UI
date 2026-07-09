const fs = require('fs');
let code = fs.readFileSync('src/views/FleetView.tsx', 'utf8');

const targetStr = `              ) : (
                <div className="grid gap-4">
                  {fcVehicleStats.map(stat => (
                    <div key={stat.vehicle.id} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex-1 w-full flex flex-col">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-lg text-slate-800">{stat.vehicle.modelName}</span>
                          <span className="text-slate-500 font-mono text-sm">{stat.vehicle.serialNumber}</span>
                          {stat.vehicle.customerName && <span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600 font-bold">{stat.vehicle.customerName}</span>}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col">
                            <span className="text-[10px] text-slate-500 font-bold mb-1">対象FC件数</span>
                            <span className="text-lg font-bold text-slate-800">{stat.totalCount} <span className="text-xs font-normal text-slate-500">件</span></span>
                          </div>
                          <div className={cn("p-3 rounded-lg border flex flex-col", stat.unexecutedCount > 0 ? "bg-amber-50 border-amber-100" : "bg-slate-50 border-slate-100")}>
                            <span className={cn("text-[10px] font-bold mb-1", stat.unexecutedCount > 0 ? "text-amber-700" : "text-slate-500")}>未実施FC</span>
                            <span className={cn("text-lg font-bold", stat.unexecutedCount > 0 ? "text-amber-800" : "text-slate-800")}>{stat.unexecutedCount} <span className="text-xs font-normal">件</span></span>
                          </div>
                          <div className={cn("p-3 rounded-lg border flex flex-col", stat.overdueCount > 0 ? "bg-rose-50 border-rose-100" : "bg-slate-50 border-slate-100")}>
                            <span className={cn("text-[10px] font-bold mb-1", stat.overdueCount > 0 ? "text-rose-700" : "text-slate-500")}>期限超過 (未実施)</span>
                            <span className={cn("text-lg font-bold", stat.overdueCount > 0 ? "text-rose-800" : "text-slate-800")}>{stat.overdueCount} <span className="text-xs font-normal">件</span></span>
                          </div>
                          <div className={cn("p-3 rounded-lg border flex flex-col", stat.assignedCount > 0 ? "bg-blue-50 border-blue-100" : "bg-slate-50 border-slate-100")}>
                            <span className={cn("text-[10px] font-bold mb-1", stat.assignedCount > 0 ? "text-blue-700" : "text-slate-500")}>アサイン中 (完了 / 全体)</span>
                            <span className={cn("text-lg font-bold", stat.assignedCount > 0 ? "text-blue-800" : "text-slate-800")}>{stat.completedAssignedCount} <span className="text-sm">/ {stat.assignedCount}</span> <span className="text-xs font-normal">件</span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {fcVehicleStats.length === 0 && (
                    <div className="text-center py-12 text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-xl">
                      該当する車両がありません
                    </div>
                  )}
                </div>
              )}`;

const replacementStr = `              ) : (
                <div className="flex flex-col gap-3">
                  {fcVehicleStats.map(stat => {
                    const isExpanded = expandedFcVehicleId === stat.vehicle.id;
                    return (
                      <div key={stat.vehicle.id} className={cn("bg-white border rounded-xl shadow-sm transition-all overflow-hidden", isExpanded ? "border-indigo-400 ring-1 ring-indigo-400" : "border-slate-200 hover:border-indigo-300")}>
                        {/* Summary Row (Clickable) */}
                        <div 
                          className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                          onClick={() => setExpandedFcVehicleId(isExpanded ? null : stat.vehicle.id)}
                        >
                          <div className="flex-1 min-w-0 flex flex-col">
                             <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                               <span className="font-bold text-lg text-slate-800">{stat.vehicle.modelName}</span>
                               <span className="text-slate-500 font-mono text-sm">{stat.vehicle.serialNumber}</span>
                               {stat.vehicle.customerName && <span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600 font-bold">{stat.vehicle.customerName}</span>}
                               {stat.unexecutedCount > 0 && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">未実施あり</span>}
                             </div>
                             <div className="flex items-center gap-6 text-sm">
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
                        </div>

                        {/* Expanded Tasks List */}
                        {isExpanded && (
                          <div className="border-t border-indigo-100 bg-indigo-50/30 p-4 sm:p-5">
                            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
                              対象フィールドキャンペーン一覧
                              <span className="ml-2 bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">{stat.tasks.length}</span>
                            </h4>
                            <div className="grid gap-3">
                              {stat.tasks.map(task => {
                                const isApproaching = differenceInDays(new Date(task.deadline), new Date()) <= 30 && task.progress !== '完了';
                                return (
                                  <div key={task.id} className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm hover:border-indigo-300 transition">
                                     <div>
                                        <div className="flex items-center gap-2 mb-1">
                                          {task.progress === '完了' ? (
                                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center"><CheckCircle className="w-3 h-3 mr-1"/>完了</span>
                                          ) : task.staffIds && task.staffIds.length > 0 ? (
                                            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">アサイン済</span>
                                          ) : (
                                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">未実施</span>
                                          )}
                                          {isApproaching && <span className="text-[10px] font-bold text-amber-600 flex items-center animate-pulse"><AlertTriangle className="w-3 h-3 mr-0.5" />近接/超過</span>}
                                        </div>
                                        <div className="font-bold text-slate-800 text-sm">{task.title}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">期限: <span className={cn("font-bold", isApproaching ? "text-amber-700" : "text-slate-600")}>{format(new Date(task.deadline), 'yyyy/MM/dd')}</span></div>
                                     </div>
                                     <button
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         setAssignModal({ vehicle: stat.vehicle, title: task.title, category: 'フィールドキャンペーン', task, targetDate: new Date(task.deadline) });
                                         setAssignStaffId(task.staffIds?.[0] || '');
                                         setAssignDate(task.startDate?.split('T')[0] || '');
                                       }}
                                       disabled={task.progress === '完了'}
                                       className="w-full sm:w-auto px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shrink-0"
                                     >
                                       詳細・アサイン
                                     </button>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {fcVehicleStats.length === 0 && (
                    <div className="text-center py-12 text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-xl">
                      該当する車両がありません
                    </div>
                  )}
                </div>
              )}`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replacementStr);
  fs.writeFileSync('src/views/FleetView.tsx', code);
  console.log("Successfully replaced fcView vehicle block");
} else {
  console.log("Could not find target block to replace");
}
