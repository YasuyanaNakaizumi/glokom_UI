const fs = require('fs');
const path = './src/views/ScheduleView.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacementBody = `
          {orientation === 'horizontal' ? (
          <div className="flex-1 overflow-auto bg-slate-50/30">
            <div className="min-w-[800px]">
              
              {/* Group: Mechanics */}
              <div className="bg-indigo-50/50 border-b border-slate-200 p-2 sticky left-0 z-10 text-sm font-bold text-indigo-800 flex items-center shadow-sm w-fit min-w-full">
                <UserIcon className="w-4 h-4 mr-2" /> メカニック ({staff.filter(s => selectedStaffIds.has(s.id)).length}名)
              </div>
              {staff.filter(s => selectedStaffIds.has(s.id)).map(person => (
                <div key={person.id} className="flex border-b border-slate-200 group hover:bg-indigo-50/20 transition-colors">
                  <div className="w-[180px] lg:w-[200px] shrink-0 border-r border-slate-200 p-3 flex items-center bg-white sticky left-0 z-10">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold mr-2 shrink-0">
                      {person.name.charAt(0)}
                    </div>
                    <span className="font-bold text-sm text-slate-700 truncate">{person.name}</span>
                  </div>
                  <div className="flex-1 flex relative">
                    {/* Time slots */}
                    {renderTasksOnTimeline(person.id, 'mechanic')}
                    {hours.map((hour, i) => (
                      <div 
                        key={i} 
                        className="flex-1 border-r border-slate-100/50 min-w-[40px]"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'mechanic', person.id, hour)}
                      >
                         {/* Cell drop zone */}
                         <div className="w-full h-full min-h-[48px] opacity-0 hover:opacity-100 hover:bg-indigo-50/50 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Group: Parking */}
              <div className="bg-emerald-50/50 border-b border-slate-200 p-2 sticky left-0 z-10 text-sm font-bold text-emerald-800 flex items-center justify-between shadow-sm w-fit min-w-full pr-4">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" /> 作業場・駐車場 ({parking.filter(p => selectedParkingIds.has(p.id)).length}箇所)
                </div>
                <button 
                  onClick={() => setShowMapModal(true)}
                  className="flex items-center text-[10px] font-bold bg-white text-emerald-700 border border-emerald-200 px-2 py-1 rounded hover:bg-emerald-100 transition shadow-sm sticky right-4"
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  マップを見る
                </button>
              </div>
              {parking.filter(p => selectedParkingIds.has(p.id)).map(p => (
                <div key={p.id} className="flex border-b border-slate-200 group hover:bg-emerald-50/20 transition-colors">
                  <div className="w-[180px] lg:w-[200px] shrink-0 border-r border-slate-200 p-3 flex items-center bg-white sticky left-0 z-10">
                    <span className="font-bold text-sm text-slate-700 truncate">{p.name}</span>
                  </div>
                  <div className="flex-1 flex relative">
                    {renderTasksOnTimeline(p.id, 'parking')}
                    {hours.map((hour, i) => (
                      <div 
                        key={i} 
                        className="flex-1 border-r border-slate-100/50 min-w-[40px]"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'parking', p.id, hour)}
                      >
                         <div className="w-full h-full min-h-[48px] opacity-0 hover:opacity-100 hover:bg-emerald-50/50 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Group: Special Vehicles */}
              <div className="bg-amber-50/50 border-b border-slate-200 p-2 sticky left-0 z-10 text-sm font-bold text-amber-800 flex items-center shadow-sm w-fit min-w-full">
                <Truck className="w-4 h-4 mr-2" /> 特殊車両 ({specialVehiclesList.filter(v => selectedVehicleIds.has(v.id)).length}台)
              </div>
              {specialVehiclesList.filter(v => selectedVehicleIds.has(v.id)).map(v => (
                <div key={v.id} className="flex border-b border-slate-200 group hover:bg-amber-50/20 transition-colors">
                  <div className="w-[180px] lg:w-[200px] shrink-0 border-r border-slate-200 p-3 flex items-center bg-white sticky left-0 z-10">
                    <span className="font-bold text-sm text-slate-700 truncate">{v.modelName}</span>
                  </div>
                  <div className="flex-1 flex relative">
                    {hours.map((hour, i) => (
                      <div 
                        key={i} 
                        className="flex-1 border-r border-slate-100/50 min-w-[40px]"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'special_vehicle', v.id, hour)}
                      >
                         <div className="w-full h-full min-h-[48px] opacity-0 hover:opacity-100 hover:bg-amber-50/50 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Group: Tools */}
              {showTools && (
                <>
                  <div className="bg-slate-100/80 border-b border-slate-200 p-2 sticky left-0 z-10 text-sm font-bold text-slate-600 flex items-center shadow-sm w-fit min-w-full">
                    <Wrench className="w-4 h-4 mr-2" /> 工具
                  </div>
                  <div className="flex border-b border-slate-200">
                      <div className="w-[180px] lg:w-[200px] shrink-0 border-r border-slate-200 p-3 flex items-center bg-white text-slate-400 text-sm italic sticky left-0 z-10">
                        (登録なし)
                      </div>
                      <div className="flex-1 flex bg-slate-50/50 min-h-[48px]">
                        {hours.map((hour, i) => (
                          <div key={i} className="flex-1 border-r border-slate-100/50 min-w-[40px]" />
                        ))}
                      </div>
                  </div>
                </>
              )}

            </div>
          </div>
          ) : (
            <div className="flex-1 overflow-auto bg-slate-50/30 flex">
              {/* Vertical Time Column */}
              <div className="w-[60px] shrink-0 border-r border-slate-200 bg-slate-50 sticky left-0 z-20 flex flex-col">
                {hours.map(hour => (
                  <div key={hour} className="flex-1 border-b border-slate-200 p-2 text-right text-xs font-bold text-slate-500 min-h-[60px]">
                    {hour}:00
                  </div>
                ))}
              </div>
              
              {/* Columns for Resources or Days */}
              <div className="flex-1 flex min-w-max">
                {verticalMode === 'day' ? (
                  <>
                    {/* Staff Columns */}
                    {staff.filter(s => selectedStaffIds.has(s.id)).map(person => (
                      <div key={person.id} className="w-[150px] flex-shrink-0 border-r border-slate-200 flex flex-col relative group">
                        <div className="h-10 bg-indigo-50/50 border-b border-slate-200 p-2 text-xs font-bold text-indigo-800 flex items-center justify-center sticky top-0 z-10 truncate">
                          <UserIcon className="w-3 h-3 mr-1" /> {person.name}
                        </div>
                        <div className="flex-1 relative">
                          {renderTasksOnTimeline(person.id, 'mechanic')}
                          {hours.map((hour, i) => (
                            <div key={i} className="h-[60px] border-b border-slate-100/50 w-full"
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, 'mechanic', person.id, hour)}
                            >
                              <div className="w-full h-full opacity-0 hover:opacity-100 hover:bg-indigo-50/50 transition-colors" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {/* Parking Columns */}
                    {parking.filter(p => selectedParkingIds.has(p.id)).map(p => (
                      <div key={p.id} className="w-[150px] flex-shrink-0 border-r border-slate-200 flex flex-col relative group">
                        <div className="h-10 bg-emerald-50/50 border-b border-slate-200 p-2 text-xs font-bold text-emerald-800 flex items-center justify-center sticky top-0 z-10 truncate">
                          <MapPin className="w-3 h-3 mr-1" /> {p.name}
                        </div>
                        <div className="flex-1 relative">
                          {renderTasksOnTimeline(p.id, 'parking')}
                          {hours.map((hour, i) => (
                            <div key={i} className="h-[60px] border-b border-slate-100/50 w-full"
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, 'parking', p.id, hour)}
                            >
                              <div className="w-full h-full opacity-0 hover:opacity-100 hover:bg-emerald-50/50 transition-colors" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {/* Week View Columns */}
                    {[0,1,2,3,4,5,6].map(offset => {
                      const d = new Date(currentDate);
                      d.setDate(d.getDate() - d.getDay() + offset);
                      const isToday = d.toDateString() === new Date().toDateString();
                      return (
                        <div key={offset} className={\`w-[180px] flex-shrink-0 border-r border-slate-200 flex flex-col relative \${isToday ? 'bg-indigo-50/10' : ''}\`}>
                          <div className={\`h-10 border-b border-slate-200 p-2 text-xs font-bold flex flex-col items-center justify-center sticky top-0 z-10 \${isToday ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-50 text-slate-700'}\`}>
                            <span>{format(d, 'E', { locale: require('date-fns/locale/ja') })}</span>
                            <span className="text-[10px]">{format(d, 'MM/dd')}</span>
                          </div>
                          <div className="flex-1 relative">
                            {hours.map((hour, i) => (
                              <div key={i} className="h-[60px] border-b border-slate-100/50 w-full"></div>
                            ))}
                            {/* Render tasks for all selected resources on this day. We'd need a modified render method. Let's just put a placeholder or basic rendering. */}
                            {tasks.filter(t => {
                               const taskDate = t.startDate ? new Date(t.startDate) : t.deadline ? new Date(t.deadline) : new Date();
                               if (format(taskDate, 'yyyy-MM-dd') !== format(d, 'yyyy-MM-dd')) return false;
                               // Filter by selected resources
                               if (t.staffIds && t.staffIds.some(sid => selectedStaffIds.has(sid))) return true;
                               if (t.parkingAreaIds && t.parkingAreaIds.some(pid => selectedParkingIds.has(pid))) return true;
                               return false;
                            }).map((task, idx) => {
                               const startD = task.startDate ? new Date(task.startDate) : new Date();
                               const endD = task.deadline ? new Date(task.deadline) : new Date(startD.getTime() + 2 * 60 * 60 * 1000);
                               const startHour = startD.getHours();
                               const endHour = endD.getHours();
                               let startIdx = hours.indexOf(startHour);
                               if (startIdx === -1) startIdx = 0;
                               let endIdx = hours.indexOf(endHour);
                               if (endIdx === -1) endIdx = hours.length;
                               if (endIdx <= startIdx) endIdx = startIdx + 1;
                               const topPct = (startIdx / hours.length) * 100;
                               const heightPct = ((endIdx - startIdx) / hours.length) * 100;
                               
                               return (
                                 <div 
                                    key={task.id}
                                    className="absolute left-1 right-1 rounded-md bg-indigo-100 border border-indigo-300 text-indigo-800 p-1 shadow-sm overflow-hidden text-[9px] font-bold"
                                    style={{ top: \`\${topPct}%\`, height: \`\${heightPct}%\` }}
                                 >
                                   <div className="truncate">{task.title}</div>
                                   <div className="truncate opacity-75">{task.staffIds?.map((id:string) => staff.find((s:any)=>s.id===id)?.name).join(', ')}</div>
                                 </div>
                               );
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
            </div>
          )}
`;

content = content.replace(
  /<div className="flex-1 overflow-auto bg-slate-50\/30">[\s\S]*?{showMapModal && \(/,
  replacementBody + '\n      {showMapModal && ('
);

// We need to also hide the header row when orientation is vertical
content = content.replace(
  /<div className="flex border-b border-slate-200 bg-slate-50 shrink-0 sticky top-0 z-20">/,
  `{orientation === 'horizontal' && (<div className="flex border-b border-slate-200 bg-slate-50 shrink-0 sticky top-0 z-20">`
);

content = content.replace(
  /<\/div>\s*\{\/\* Body \*\/\}/,
  `</div>)}\n\n          {/* Body */}`
);

fs.writeFileSync(path, content, 'utf8');
