const fs = require('fs');
let code = fs.readFileSync('src/views/CustomerListView.tsx', 'utf8');

// Change default activeTab
code = code.replace("useState<string>('vehicles')", "useState<string>('overview')");
code = code.replace("setActiveTab('vehicles')", "setActiveTab('overview')");

// We need to replace the tabs section
const tabsStart = code.indexOf('{/* Tabs */}');
const tabsEnd = code.indexOf('</div>\n            </div>', tabsStart);

const newTabs = `{/* Tabs */}
               <div className="flex gap-6 mt-4 overflow-x-auto no-scrollbar">
                 <button 
                    onClick={() => setActiveTab('overview')}
                    className={\`pb-3 font-bold text-sm border-b-2 transition-colors flex items-center shrink-0 \${activeTab === 'overview' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
                 >
                    <Activity className={\`w-4 h-4 mr-2 \${activeTab === 'overview' ? 'text-indigo-600' : 'text-slate-400'}\`} />
                    概要
                 </button>
                 {openVehicleIds.map(id => {
                   const v = vehicles.find(vh => vh.id === id);
                   if (!v) return null;
                   const isActive = activeTab === \`vehicle_\${id}\`;
                   return (
                     <button
                       key={id}
                       onClick={() => setActiveTab(\`vehicle_\${id}\`)}
                       className={\`pb-3 font-bold text-sm border-b-2 transition-colors flex items-center shrink-0 \${isActive ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
                     >
                       <Car className={\`w-4 h-4 mr-2 \${isActive ? 'text-indigo-600' : 'text-slate-400'}\`} />
                       {v.modelName}
                       <span
                         onClick={(e) => {
                           e.stopPropagation();
                           setOpenVehicleIds(prev => prev.filter(vid => vid !== id));
                           if (isActive) setActiveTab('overview');
                         }}
                         className="ml-2 hover:bg-slate-200 hover:text-slate-900 text-slate-400 rounded-full p-0.5 transition-colors"
                       >
                         <X className="w-3 h-3" />
                       </span>
                     </button>
                   );
                 })}
               </div>`;

code = code.substring(0, tabsStart) + newTabs + code.substring(tabsEnd);

// Now replace the content area (TAB: VEHICLES and TAB: SERVICES)
const contentStart = code.indexOf('{/* TAB: VEHICLES */}');
const contentEnd = code.indexOf('{/* TAB: VEHICLE DETAIL */}');

const newContent = `{/* TAB: OVERVIEW */}
               {activeTab === 'overview' && (
                 <div className="flex flex-col xl:flex-row gap-6 h-full animate-in fade-in duration-200">
                    
                    {/* Column 1: Customer Members */}
                    <div className="w-full xl:w-1/3 flex flex-col min-h-0 bg-white border border-slate-200 rounded-xl shadow-sm">
                       <div className="p-4 border-b border-slate-100 font-bold text-slate-800 flex items-center bg-slate-50/50 rounded-t-xl">
                         <Users className="w-4 h-4 mr-2 text-indigo-600"/>
                         顧客メンバリスト
                       </div>
                       <div className="p-4 overflow-y-auto flex-1 space-y-3">
                         {[
                           { role: '代表取締役', name: '山田 太郎', phone: '090-1234-5678', email: 'taro.y@example.com' },
                           { role: '整備部長', name: '鈴木 一郎', phone: '080-9876-5432', email: 'ichiro.s@example.com' },
                           { role: '現場監督', name: '佐藤 次郎', phone: '070-1111-2222', email: 'jiro.s@example.com' }
                         ].map((member, i) => (
                           <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                             <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                               {member.name.charAt(0)}
                             </div>
                             <div>
                               <div className="text-[10px] font-bold text-slate-400">{member.role}</div>
                               <div className="font-bold text-sm text-slate-800 mb-1">{member.name}</div>
                               <div className="text-xs text-slate-500 font-mono">{member.phone}</div>
                               <div className="text-xs text-slate-500">{member.email}</div>
                             </div>
                           </div>
                         ))}
                       </div>
                    </div>

                    {/* Column 2: Vehicles */}
                    <div className="w-full xl:w-1/3 flex flex-col min-h-0 bg-white border border-slate-200 rounded-xl shadow-sm">
                       <div className="p-4 border-b border-slate-100 font-bold text-slate-800 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
                         <div className="flex items-center">
                           <Car className="w-4 h-4 mr-2 text-indigo-600"/>
                           保有車両
                           <span className="ml-2 bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">{customerVehicles.length}</span>
                         </div>
                       </div>
                       <div className="p-4 overflow-y-auto flex-1 space-y-3">
                         {customerVehicles.length > 0 ? (
                           customerVehicles.map(v => (
                             <button
                               key={v.id}
                               onClick={() => {
                                 if (!openVehicleIds.includes(v.id)) {
                                   setOpenVehicleIds([...openVehicleIds, v.id]);
                                 }
                                 setActiveTab(\`vehicle_\${v.id}\`);
                               }}
                               className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all bg-white text-left group"
                             >
                               <div>
                                 <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">{v.modelName}</h4>
                                 <div className="text-xs font-mono text-slate-500 mt-0.5">S/N: {v.serialNumber}</div>
                               </div>
                               <div className="flex items-center">
                                 <span className={\`px-2 py-0.5 rounded border text-[10px] font-bold \${v.status === '在庫' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}\`}>
                                   {v.status === '在庫' ? '在庫' : '稼働中'}
                                 </span>
                                 <ChevronRight className="w-4 h-4 text-slate-300 ml-2 group-hover:text-indigo-400 transition-colors" />
                               </div>
                             </button>
                           ))
                         ) : (
                           <div className="text-center p-8 text-slate-400 text-sm border border-dashed rounded-lg">保有車両はありません</div>
                         )}
                       </div>
                    </div>

                    {/* Column 3: Service History */}
                    <div className="w-full xl:w-1/3 flex flex-col min-h-0 bg-white border border-slate-200 rounded-xl shadow-sm">
                       <div className="p-4 border-b border-slate-100 font-bold text-slate-800 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
                         <div className="flex items-center">
                           <Wrench className="w-4 h-4 mr-2 text-indigo-600"/>
                           サービス履歴
                           <span className="ml-2 bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">{customerServiceTasks.length}</span>
                         </div>
                       </div>
                       <div className="p-4 overflow-y-auto flex-1 space-y-3">
                         {customerServiceTasks.length > 0 ? (
                           customerServiceTasks.map(t => {
                             const v = vehicles.find(vh => vh.id === t.vehicleId);
                             return (
                               <div key={t.id} className="p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className={\`text-[10px] px-1.5 py-0.5 rounded font-bold \${
                                      t.progress === '承認待ち' ? 'bg-amber-100 text-amber-800' :
                                      t.progress === '進行中' ? 'bg-blue-100 text-blue-800' :
                                      t.progress === '完了' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'
                                    }\`}>{t.progress}</span>
                                    <span className="text-[10px] font-bold text-slate-500">{t.category}</span>
                                  </div>
                                  <h4 className="font-bold text-slate-800 text-sm mb-1">{t.title}</h4>
                                  <div className="flex items-center justify-between mt-2">
                                    {v ? (
                                      <div className="text-[10px] font-bold text-indigo-600 flex items-center">
                                        <Car className="w-3 h-3 mr-1" />
                                        {v.modelName}
                                      </div>
                                    ) : <div/>}
                                    {t.deadline && <div className="text-[10px] font-bold text-slate-400 font-mono">{t.deadline.split('T')[0]}</div>}
                                  </div>
                               </div>
                             );
                           })
                         ) : (
                           <div className="text-center p-8 text-slate-400 text-sm border border-dashed rounded-lg">サービス履歴はありません</div>
                         )}
                       </div>
                    </div>

                 </div>
               )}

               `;

code = code.substring(0, contentStart) + newContent + code.substring(contentEnd);

fs.writeFileSync('src/views/CustomerListView.tsx', code);
console.log('CustomerListView patched successfully');
