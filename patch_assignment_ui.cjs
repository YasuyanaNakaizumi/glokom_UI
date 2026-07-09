const fs = require('fs');
const path = './src/components/EditTaskModal.tsx';
let content = fs.readFileSync(path, 'utf8');

const replacement = `<div className="bg-slate-50 p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
  <div className="flex items-center justify-between mb-2">
    <label className="block text-sm font-bold text-slate-700">代理店メンバスケジュール</label>
    <div className="flex items-center space-x-2">
      <label className="text-xs font-bold text-slate-600">表示日</label>
      <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="border-slate-300 rounded px-2 py-1 text-sm shadow-sm font-bold text-slate-700" />
    </div>
  </div>
  <div className="bg-white border border-slate-200 rounded-lg p-3 overflow-x-auto shadow-sm">
    <div className="flex text-[10px] font-bold text-slate-500 min-w-[600px] border-b border-slate-100 pb-2 mb-2">
      <div className="w-28 shrink-0">担当者</div>
      <div className="flex-1 flex justify-between px-2">
        {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(h => <div key={h} className="w-8 text-center">{h}:00</div>)}
      </div>
    </div>
    {staff.map((s: any) => {
      // Find tasks assigned to this staff on scheduleDate
      const staffsTasks = tasks.filter(t => t.staffId === s.id && t.deadline && t.deadline.startsWith(scheduleDate) && t.id !== taskId);
      
      return (
      <div key={s.id} className="flex items-center text-sm min-w-[600px] py-1.5 border-b border-slate-50 last:border-0">
        <div className="w-28 shrink-0 font-bold text-slate-700 flex items-center text-xs">
          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] mr-2 shrink-0">
            {s.name.slice(0, 1)}
          </div>
          <span className="truncate">{s.name}</span>
        </div>
        <div className="flex-1 relative h-7 bg-slate-50 rounded ml-2 mr-2 overflow-hidden border border-slate-100">
           {staffsTasks.length > 0 && <div className="absolute top-0.5 bottom-0.5 bg-slate-200 rounded opacity-60 left-[10%] right-[30%] text-[10px] px-1 flex items-center text-slate-600">他タスク</div>}
           {/* Mock schedule block if they have assignments */}
           {assignments.filter(a => a.staffId === s.id && a.startDate === scheduleDate).map((a, idx) => {
             const startHour = parseInt(a.startTime.split(':')[0]) || 9;
             const startMin = parseInt(a.startTime.split(':')[1]) || 0;
             const endHour = parseInt(a.endTime.split(':')[0]) || 18;
             const endMin = parseInt(a.endTime.split(':')[1]) || 0;
             
             const startTotal = Math.max(9, startHour + startMin / 60);
             const endTotal = Math.min(18, endHour + endMin / 60);
             
             const left = Math.max(0, (startTotal - 9) / 9 * 100);
             const right = Math.max(0, 100 - ((endTotal - 9) / 9 * 100));
             return (
               <div key={idx} className="absolute top-0.5 bottom-0.5 bg-indigo-500 rounded text-[10px] text-white font-bold flex items-center px-1.5 overflow-hidden shadow-sm" style={{ left: \`\${left}%\`, right: \`\${right}%\` }}>
                 アサイン
               </div>
             );
           })}
        </div>
      </div>
    )})}
  </div>

  <div className="border-t border-slate-200 pt-6">
    <div className="flex items-center justify-between mb-4">
      <label className="block text-sm font-bold text-slate-700">担当者アサイン・作業日時</label>
      <div className="space-x-2 flex">
        <button onClick={syncAssignments} className="text-xs bg-white border border-slate-300 text-slate-700 font-bold px-3 py-1.5 rounded shadow-sm hover:bg-slate-50 transition">
          全員同じ日時にする
        </button>
        <button onClick={addAssignment} className="text-xs bg-indigo-600 text-white font-bold px-3 py-1.5 rounded shadow-sm hover:bg-indigo-700 transition flex items-center">
          <Plus className="w-3 h-3 mr-1"/> 追加
        </button>
      </div>
    </div>
    
    <div className="space-y-3">
      {assignments.map((a, i) => (
        <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-3 border border-slate-200 rounded-lg shadow-sm relative pr-10">
          <select 
            value={a.staffId} 
            onChange={e => {
              const newA = [...assignments];
              newA[i].staffId = e.target.value;
              setAssignments(newA);
            }} 
            className="border-slate-300 rounded px-3 py-1.5 text-sm font-bold text-slate-700 sm:w-40 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">担当者選択...</option>
            {staff.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={a.startDate} 
              onChange={e => {
                const newA = [...assignments];
                newA[i].startDate = e.target.value;
                setAssignments(newA);
              }} 
              className="border-slate-300 rounded px-2 py-1.5 text-sm text-slate-700 font-medium focus:ring-indigo-500"
            />
            <input 
              type="time" 
              value={a.startTime} 
              onChange={e => {
                const newA = [...assignments];
                newA[i].startTime = e.target.value;
                setAssignments(newA);
              }} 
              className="border-slate-300 rounded px-2 py-1.5 text-sm w-24 text-slate-700 font-medium focus:ring-indigo-500"
            />
          </div>
          
          <span className="text-slate-400 font-bold hidden sm:block">～</span>
          
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={a.endDate} 
              onChange={e => {
                const newA = [...assignments];
                newA[i].endDate = e.target.value;
                setAssignments(newA);
              }} 
              className="border-slate-300 rounded px-2 py-1.5 text-sm text-slate-700 font-medium focus:ring-indigo-500"
            />
            <input 
              type="time" 
              value={a.endTime} 
              onChange={e => {
                const newA = [...assignments];
                newA[i].endTime = e.target.value;
                setAssignments(newA);
              }} 
              className="border-slate-300 rounded px-2 py-1.5 text-sm w-24 text-slate-700 font-medium focus:ring-indigo-500"
            />
          </div>

          <button onClick={() => removeAssignment(i)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1.5 hover:bg-red-50 hover:text-red-500 rounded transition">
            <X className="w-4 h-4"/>
          </button>
        </div>
      ))}
      {assignments.length === 0 && (
        <div className="text-center py-6 text-sm text-slate-500 bg-slate-50 border border-dashed border-slate-300 rounded-lg">
          アサインされていません。追加ボタンから設定してください。
        </div>
      )}
    </div>
  </div>
</div>`;

const targetRegex = /<div className="bg-slate-50 p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">\s*<div>\s*<label className="block text-sm font-bold text-slate-700 mb-2">作業予定日 \/ 期限<\/label>[\s\S]*?<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;

if (targetRegex.test(content)) {
  content = content.replace(targetRegex, replacement);
  fs.writeFileSync(path, content, 'utf8');
  console.log("Successfully replaced UI");
} else {
  console.log("Target UI not found");
}
