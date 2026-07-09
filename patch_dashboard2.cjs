const fs = require('fs');
const path = './src/views/DashboardView.tsx';
let content = fs.readFileSync(path, 'utf8');

const subTasksPreviewComponent = `
const SubTasksPreview = ({ subTasks }: { subTasks: any[] }) => {
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
};
`;

content = content.replace(/export const DashboardView = \(\) => \{/, subTasksPreviewComponent + '\nexport const DashboardView = () => {');

fs.writeFileSync(path, content, 'utf8');
