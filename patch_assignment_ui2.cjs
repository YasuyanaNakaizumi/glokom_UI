const fs = require('fs');
const path = './src/components/EditTaskModal.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacementUI = `
  <div className="space-y-4">
    {assignmentBlocks.map((b, i) => (
      <div key={b.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6 relative">
        {assignmentBlocks.length > 1 && (
          <button onClick={() => removeAssignmentBlock(b.id)} className="absolute right-3 top-3 text-slate-400 hover:text-red-500 transition bg-slate-50 hover:bg-red-50 p-1.5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        )}
        
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">作業担当者</label>
            <div className="flex flex-wrap gap-2 items-center">
              {b.staffIds.map(sid => {
                const s = staff.find((x:any) => x.id === sid);
                return s ? (
                  <div key={sid} className="flex items-center bg-indigo-50 text-indigo-700 px-2 py-1.5 rounded text-sm font-bold border border-indigo-200">
                    {s.name}
                    <button onClick={() => toggleStaffInBlock(b.id, sid)} className="ml-2 text-indigo-400 hover:text-indigo-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : null;
              })}
              
              <select 
                className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded px-3 py-1.5 font-bold hover:bg-slate-100 transition outline-none"
                value=""
                onChange={(e) => {
                  if(e.target.value) toggleStaffInBlock(b.id, e.target.value);
                }}
              >
                <option value="">＋ 追加...</option>
                {staff.filter((s:any) => !b.staffIds.includes(s.id)).map((s:any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">開始</label>
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={b.startDate} 
                  onChange={e => updateAssignmentBlock(b.id, 'startDate', e.target.value)} 
                  className="w-full border-slate-300 rounded-lg px-3 py-2 focus:ring-indigo-500 font-bold text-slate-700 shadow-sm"
                />
                <input 
                  type="time" 
                  value={b.startTime} 
                  onChange={e => updateAssignmentBlock(b.id, 'startTime', e.target.value)} 
                  className="w-24 border-slate-300 rounded-lg px-2 py-2 focus:ring-indigo-500 font-bold text-slate-700 shadow-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">終了</label>
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={b.endDate} 
                  onChange={e => updateAssignmentBlock(b.id, 'endDate', e.target.value)} 
                  className="w-full border-slate-300 rounded-lg px-3 py-2 focus:ring-indigo-500 font-bold text-slate-700 shadow-sm"
                />
                <input 
                  type="time" 
                  value={b.endTime} 
                  onChange={e => updateAssignmentBlock(b.id, 'endTime', e.target.value)} 
                  className="w-24 border-slate-300 rounded-lg px-2 py-2 focus:ring-indigo-500 font-bold text-slate-700 shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}

    <button onClick={addAssignmentBlock} className="w-full py-3 border-2 border-dashed border-indigo-200 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition flex items-center justify-center shadow-sm bg-white">
      <Plus className="w-5 h-5 mr-1" /> 別の日時・担当者を追加
    </button>
  </div>

  <div className="bg-slate-50 border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">
    <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
      <h4 className="font-bold text-slate-700 flex items-center text-sm">
        <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
        スケジュールの確認 <span className="text-xs font-normal text-slate-500 ml-2">※こちらは確認用の表示です</span>
      </h4>
      <input type="date" value={scheduleViewDate} onChange={e => setScheduleViewDate(e.target.value)} className="text-xs border-slate-300 rounded px-2 py-1 shadow-sm font-bold text-slate-700" />
    </div>
    
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-2">スケジュールを確認するメンバー</label>
        <div className="flex flex-wrap gap-3">
          {staff.map((s:any) => (
            <label key={s.id} className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                checked={scheduleCheckStaffIds.includes(s.id)}
                onChange={(e) => {
                  if (e.target.checked) setScheduleCheckStaffIds([...scheduleCheckStaffIds, s.id]);
                  else setScheduleCheckStaffIds(scheduleCheckStaffIds.filter(id => id !== s.id));
                }}
              />
              <span className="ml-1.5 text-sm font-bold text-slate-700">{s.name}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-lg p-3 overflow-x-auto shadow-sm">
        <div className="flex text-[10px] font-bold text-slate-500 min-w-[600px] border-b border-slate-100 pb-2 mb-2">
          <div className="w-24 shrink-0">時間</div>
          <div className="flex-1 flex justify-between px-2">
            {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(h => <div key={h} className="w-8 text-center">{h}:00</div>)}
          </div>
        </div>
        {staff.filter((s:any) => scheduleCheckStaffIds.includes(s.id)).map((s: any) => {
          // Find tasks assigned to this staff on scheduleDate
          const staffsTasks = tasks.filter(t => {
            if (t.id === taskId) return false;
            if (t.assignments && t.assignments.length > 0) {
              return t.assignments.some(a => a.staffId === s.id && a.plannedStart && a.plannedStart.startsWith(scheduleViewDate));
            }
            return t.staffIds?.includes(s.id) && t.deadline && t.deadline.startsWith(scheduleViewDate);
          });
          
          return (
          <div key={s.id} className="flex items-center text-sm min-w-[600px] py-2 border-b border-slate-50 last:border-0">
            <div className="w-24 shrink-0 font-bold text-slate-700 flex items-center text-xs">
              <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[9px] mr-1.5 shrink-0">
                {s.name.slice(0, 1)}
              </div>
              <span className="truncate pr-2">{s.name}</span>
            </div>
            <div className="flex-1 relative h-8 bg-slate-50 rounded ml-2 mr-2 border border-slate-100">
               {staffsTasks.map((t, idx) => {
                  let startHour = 9; let startMin = 0; let endHour = 18; let endMin = 0;
                  const assign = t.assignments?.find(a => a.staffId === s.id && a.plannedStart?.startsWith(scheduleViewDate));
                  if (assign && assign.plannedStart && assign.plannedEnd) {
                    const stMatch = assign.plannedStart.match(/T(\\d{2}):(\\d{2})/);
                    if (stMatch) { startHour = parseInt(stMatch[1]); startMin = parseInt(stMatch[2]); }
                    const edMatch = assign.plannedEnd.match(/T(\\d{2}):(\\d{2})/);
                    if (edMatch) { endHour = parseInt(edMatch[1]); endMin = parseInt(edMatch[2]); }
                  }
                  const startTotal = Math.max(9, startHour + startMin / 60);
                  const endTotal = Math.min(18, endHour + endMin / 60);
                  const left = Math.max(0, (startTotal - 9) / 9 * 100);
                  const right = Math.max(0, 100 - ((endTotal - 9) / 9 * 100));
                  return (
                    <div key={idx} className="absolute top-1 bottom-1 bg-slate-300 rounded text-[9px] text-slate-700 font-bold flex items-center px-1.5 overflow-hidden shadow-sm whitespace-nowrap" style={{ left: \`\${left}%\`, right: \`\${right}%\` }}>
                      {t.title}
                    </div>
                  );
               })}
               {/* Show currently editing block as preview */}
               {assignmentBlocks.filter(b => b.staffIds.includes(s.id) && b.startDate === scheduleViewDate).map((b, idx) => {
                 const startHour = parseInt(b.startTime.split(':')[0]) || 9;
                 const startMin = parseInt(b.startTime.split(':')[1]) || 0;
                 const endHour = parseInt(b.endTime.split(':')[0]) || 18;
                 const endMin = parseInt(b.endTime.split(':')[1]) || 0;
                 
                 const startTotal = Math.max(9, startHour + startMin / 60);
                 const endTotal = Math.min(18, endHour + endMin / 60);
                 
                 const left = Math.max(0, (startTotal - 9) / 9 * 100);
                 const right = Math.max(0, 100 - ((endTotal - 9) / 9 * 100));
                 return (
                   <div key={\`edit-\${idx}\`} className="absolute top-1 bottom-1 bg-indigo-500 rounded text-[9px] text-white font-bold flex items-center px-1.5 overflow-hidden shadow-sm whitespace-nowrap z-10" style={{ left: \`\${left}%\`, right: \`\${right}%\` }}>
                     編集中
                   </div>
                 );
               })}
            </div>
          </div>
        )})}
        {scheduleCheckStaffIds.length === 0 && (
          <div className="py-4 text-center text-xs text-slate-500 bg-slate-50 rounded">メンバーを選択してください</div>
        )}
      </div>
    </div>
  </div>`;

// Replace from <div className="bg-slate-50 p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm space-y-6"> to the end of activeTab === 'assignment_date'
const regex = /<div className="bg-slate-50 p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/;

if (regex.test(content)) {
  content = content.replace(regex, replacementUI + '\n                </div>\n              )}');
  fs.writeFileSync(path, content, 'utf8');
  console.log("Replaced UI");
} else {
  console.log("Could not find regex");
}
