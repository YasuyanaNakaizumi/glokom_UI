const fs = require('fs');

let content = fs.readFileSync('src/views/CustomerListView.tsx', 'utf8');

const vehicleTabCode = `
               {/* TAB: VEHICLE DETAIL */}
               {activeTab.startsWith('vehicle_') && (
                 <div className="space-y-6 animate-in fade-in duration-200">
                   {(() => {
                     const vid = activeTab.replace('vehicle_', '');
                     const v = vehicles.find(vh => vh.id === vid);
                     if (!v) return null;
                     return (
                       <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                           <h3 className="font-bold text-slate-800 text-lg flex items-center">
                             <Car className="w-5 h-5 mr-2 text-indigo-600" />
                             {v.modelName} (S/N: {v.serialNumber})
                           </h3>
                           <button className="flex items-center justify-center text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg transition group">
                             <Activity className="w-4 h-4 mr-2" />
                             KomFleetで稼働状況を確認
                             <ExternalLink className="w-3 h-3 ml-2 text-indigo-400 group-hover:text-indigo-600" />
                           </button>
                         </div>
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                           <div>
                             <div className="text-slate-400 mb-1.5 text-xs font-bold uppercase">現在SMR</div>
                             <div className="font-bold text-lg text-slate-800 font-mono">{v.currentSmr?.toLocaleString() || '---'} <span className="text-sm font-normal text-slate-500">h</span></div>
                           </div>
                           <div>
                             <div className="text-slate-400 mb-1.5 text-xs font-bold uppercase">稼働ステータス</div>
                             <div className="font-bold text-emerald-600 flex items-center">
                               <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2" />
                               正常稼働中
                             </div>
                           </div>
                           <div>
                             <div className="text-slate-400 mb-1.5 text-xs font-bold uppercase">最終通信日時</div>
                             <div className="font-bold text-slate-800 font-mono text-sm">
                               2026-07-07 14:30
                             </div>
                           </div>
                           <div>
                             <div className="text-slate-400 mb-1.5 text-xs font-bold uppercase">GPS位置情報</div>
                             <div className="font-bold text-indigo-600 cursor-pointer hover:underline flex items-center">
                               取得済み <ExternalLink className="w-3 h-3 ml-1" />
                             </div>
                           </div>
                         </div>
                       </div>
                     );
                   })()}
                 </div>
               )}
`;

content = content.replace("            </div>\n          </div>\n        ) : (\n          <div className=\"flex-1 flex flex-col items-center justify-center text-slate-400\">", vehicleTabCode + "\n            </div>\n          </div>\n        ) : (\n          <div className=\"flex-1 flex flex-col items-center justify-center text-slate-400\">");

fs.writeFileSync('src/views/CustomerListView.tsx', content);
