const fs = require('fs');
const path = './src/views/ScheduleView.tsx';
let content = fs.readFileSync('schedule_backup.tsx', 'utf8');

// Add state
content = content.replace(
  /const \[viewMode, setViewMode\] = useState<'business' \| '24h'>\('business'\);/,
  `const [viewMode, setViewMode] = useState<'business' | '24h'>('business');
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [verticalMode, setVerticalMode] = useState<'day' | 'week'>('day');`
);

// Add toggle buttons
const toggleReplacement = `
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('business')}
              className={\`px-3 py-1.5 text-xs font-bold rounded-md transition \${viewMode === 'business' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
            >
              営業時間 (9-18)
            </button>
            <button
              onClick={() => setViewMode('24h')}
              className={\`px-3 py-1.5 text-xs font-bold rounded-md transition \${viewMode === '24h' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
            >
              24時間
            </button>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-lg ml-2">
            <button
              onClick={() => setOrientation('horizontal')}
              className={\`px-3 py-1.5 text-xs font-bold rounded-md transition \${orientation === 'horizontal' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
            >
              横表示
            </button>
            <button
              onClick={() => setOrientation('vertical')}
              className={\`px-3 py-1.5 text-xs font-bold rounded-md transition \${orientation === 'vertical' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
            >
              縦表示
            </button>
          </div>
          
          {orientation === 'vertical' && (
            <div className="flex bg-slate-100 p-1 rounded-lg ml-2">
              <button
                onClick={() => setVerticalMode('day')}
                className={\`px-3 py-1.5 text-xs font-bold rounded-md transition \${verticalMode === 'day' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
              >
                日表示
              </button>
              <button
                onClick={() => setVerticalMode('week')}
                className={\`px-3 py-1.5 text-xs font-bold rounded-md transition \${verticalMode === 'week' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
              >
                週表示
              </button>
            </div>
          )}
`;

content = content.replace(
  /<div className="flex bg-slate-100 p-1 rounded-lg">\s*<button\s*onClick=\{\(\) => setViewMode\('business'\)\}[\s\S]*?24時間\s*<\/button>\s*<\/div>/,
  toggleReplacement
);

const oldRenderTasks = `      const leftPct = (startIdx / hours.length) * 100;
      const widthPct = ((endIdx - startIdx) / hours.length) * 100;`;

const newRenderTasks = `      const leftPct = orientation === 'horizontal' ? (startIdx / hours.length) * 100 : 0;
      const widthPct = orientation === 'horizontal' ? ((endIdx - startIdx) / hours.length) * 100 : 100;
      const topPct = orientation === 'vertical' ? (startIdx / hours.length) * 100 : 0;
      const heightPct = orientation === 'vertical' ? ((endIdx - startIdx) / hours.length) * 100 : 100;`;

content = content.replace(oldRenderTasks, newRenderTasks);

// Update the style object
content = content.replace(
  /style=\{\{\s*left: `\$\{leftPct\}%`,\s*width: `\$\{widthPct\}%`,\s*top: '4px',\s*bottom: '4px'\s*\}\}/,
  `style={{
          left: orientation === 'horizontal' ? \`\${leftPct}%\` : '4px',
          width: orientation === 'horizontal' ? \`\${widthPct}%\` : 'calc(100% - 8px)',
          top: orientation === 'vertical' ? \`\${topPct}%\` : '4px',
          height: orientation === 'vertical' ? \`\${heightPct}%\` : 'calc(100% - 8px)',
          bottom: orientation === 'horizontal' ? '4px' : 'auto'
        }}`
);

const horizontalStartStr = '{/* Header Row */}';
const mapModalStr = '{/* Map Modal */}';
const startIdx = content.indexOf(horizontalStartStr);
const endIdx = content.indexOf(mapModalStr);

if (startIdx !== -1 && endIdx !== -1) {
  // we want to include up to right before the last closing </div> of horizontal layout
  const horizontalGrid = content.substring(startIdx, content.lastIndexOf('</div>', endIdx) - 6);
  const remaining = content.substring(content.lastIndexOf('</div>', endIdx) - 6);

  const verticalGrid = `          {/* Vertical View Grid */}
          <div className="flex-1 overflow-auto bg-slate-50/30 flex relative">
            {/* Vertical Time Column */}
            <div className="w-[60px] shrink-0 border-r border-slate-200 bg-slate-50 sticky left-0 z-20 flex flex-col">
              <div className="h-10 border-b border-slate-200 bg-slate-50 shrink-0"></div>
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
                          {/* Render tasks for all selected resources on this day. */}
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
                                 <div className="truncate opacity-75">{task.staffIds?.map((id) => staff.find((s)=>s.id===id)?.name).join(', ')}</div>
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
          </div>`;

  const newGrid = `{orientation === 'horizontal' ? (
    <>
${horizontalGrid}
    </>
  ) : (
    <>
${verticalGrid}
    </>
  )}
`;
  
  const finalContent = content.substring(0, startIdx) + newGrid + remaining;
  fs.writeFileSync(path, finalContent, 'utf8');
}
