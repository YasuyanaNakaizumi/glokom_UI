const fs = require('fs');
let content = fs.readFileSync('src/views/DashboardView.tsx', 'utf-8');

// Update SubTasksPreview component to also render linkedTasks
const oldSubTasksPreview = `const SubTasksPreview = ({ subTasks }: { subTasks: any[] }) => {
  if (!subTasks || subTasks.length === 0) return null;
  return (
    <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-1.5 w-full">
      <div className="text-[10px] font-bold text-slate-500 mb-1 flex items-center">
        <CheckSquare className="w-3 h-3 mr-1 text-indigo-400" /> 
        小タスク {subTasks.filter((s: any) => s.progress === '完了').length}/{subTasks.length}
      </div>
      {subTasks.slice(0, 3).map((st: any) => (
        <div key={st.id} className="flex items-center text-[10px] text-slate-600">
          {st.progress === '完了' ? <CheckSquare className="w-3 h-3 mr-1.5 text-indigo-500 shrink-0" /> : <Square className="w-3 h-3 mr-1.5 text-slate-300 shrink-0" />}
          <span className={cn("truncate", st.progress === '完了' && "line-through text-slate-400")}>{st.title}</span>
        </div>
      ))}
      {subTasks.length > 3 && (
        <div className="text-[10px] text-slate-400 pl-[18px]">他 {subTasks.length - 3} 件...</div>
      )}
    </div>
  );
};`;

const newSubTasksPreview = `const SubTasksPreview = ({ subTasks, linkedTasks = [] }: { subTasks: any[], linkedTasks?: any[] }) => {
  if ((!subTasks || subTasks.length === 0) && (!linkedTasks || linkedTasks.length === 0)) return null;
  return (
    <div className="mt-2.5 pt-2.5 border-t border-slate-100 w-full flex flex-col gap-2">
      {subTasks && subTasks.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-slate-500 flex items-center">
            <CheckSquare className="w-3 h-3 mr-1 text-indigo-400" /> 
            小タスク {subTasks.filter((s: any) => s.progress === '完了').length}/{subTasks.length}
          </div>
          {subTasks.slice(0, 3).map((st: any) => (
            <div key={st.id} className="flex items-center text-[10px] text-slate-600">
              {st.progress === '完了' ? <CheckSquare className="w-3 h-3 mr-1.5 text-indigo-500 shrink-0" /> : <Square className="w-3 h-3 mr-1.5 text-slate-300 shrink-0" />}
              <span className={cn("truncate", st.progress === '完了' && "line-through text-slate-400")}>{st.title}</span>
            </div>
          ))}
          {subTasks.length > 3 && (
            <div className="text-[10px] text-slate-400 pl-[18px]">他 {subTasks.length - 3} 件...</div>
          )}
        </div>
      )}
      {linkedTasks && linkedTasks.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t border-slate-50 border-dashed">
          <div className="text-[10px] font-bold text-slate-500 flex items-center">
            <CheckSquare className="w-3 h-3 mr-1 text-indigo-400" /> 
            リンクされた案件 {linkedTasks.length}
          </div>
          {linkedTasks.slice(0, 3).map((lt: any) => (
            <div key={lt.id} className="flex items-center text-[10px] text-slate-600">
              <span className="truncate">{lt.title}</span>
            </div>
          ))}
          {linkedTasks.length > 3 && (
            <div className="text-[10px] text-slate-400 pl-[18px]">他 {linkedTasks.length - 3} 件...</div>
          )}
        </div>
      )}
    </div>
  );
};`;

content = content.replace(oldSubTasksPreview, newSubTasksPreview);

// Also need to pass linkedTasks in DashboardView.tsx
// Find `const subTasks = tasks.filter(st => st.parentId === t.id);`
// Replace with `const subTasks = tasks.filter(st => st.parentId === t.id); const linkedTasks = (t.linkedTaskIds || []).map(id => tasks.find(tsk => tsk.id === id)).filter(Boolean);`
content = content.replace(/const subTasks = tasks\.filter\(st => st\.parentId === t\.id\);/g, "const subTasks = tasks.filter(st => st.parentId === t.id);\n                    const linkedTasks = (t.linkedTaskIds || []).map(id => tasks.find(tsk => tsk.id === id)).filter(Boolean);");

// Replace `<SubTasksPreview subTasks={subTasks} />` with `<SubTasksPreview subTasks={subTasks} linkedTasks={linkedTasks} />`
content = content.replace(/<SubTasksPreview subTasks=\{subTasks\} \/>/g, "<SubTasksPreview subTasks={subTasks} linkedTasks={linkedTasks} />");

fs.writeFileSync('src/views/DashboardView.tsx', content, 'utf-8');
console.log('patched DashboardView.tsx');
