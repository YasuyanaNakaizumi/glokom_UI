const fs = require('fs');
const path = './src/views/DashboardView.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /const SubTasksPreview =[\s\S]*?\};\n/;

const newSubTasksPreviewComponent = `const SubTasksPreview = ({ subTasks }: { subTasks: any[] }) => {
  if (!subTasks || subTasks.length === 0) return null;
  
  const completedCount = subTasks.filter((s: any) => s.progress === '完了').length;
  const totalCount = subTasks.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-2.5 w-full shadow-inner">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-bold text-slate-700 flex items-center">
          <CheckSquare className="w-4 h-4 mr-1.5 text-indigo-500" /> 
          内訳・小タスク
        </div>
        <div className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm">
          {completedCount} / {totalCount} 完了
        </div>
      </div>
      
      <div className="w-full bg-slate-200 rounded-full h-1.5 mb-2.5 overflow-hidden">
        <div 
          className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
          style={{ width: \`\${progressPercent}%\` }}
        ></div>
      </div>

      <div className="space-y-1.5">
        {subTasks.slice(0, 3).map((st: any) => (
          <div key={st.id} className="flex items-start text-xs text-slate-600 bg-white p-1.5 rounded border border-slate-100">
            {st.progress === '完了' ? (
              <CheckSquare className="w-3.5 h-3.5 mr-2 text-indigo-500 shrink-0 mt-0.5" /> 
            ) : (
              <Square className="w-3.5 h-3.5 mr-2 text-slate-300 shrink-0 mt-0.5" /> 
            )}
            <span className={cn("truncate leading-snug", st.progress === '完了' && "line-through text-slate-400")}>
              {st.title}
            </span>
          </div>
        ))}
        {subTasks.length > 3 && (
          <div className="text-[10px] text-slate-500 font-medium text-center pt-1">
            他 {subTasks.length - 3} 件の小タスク
          </div>
        )}
      </div>
    </div>
  );
};
`;

content = content.replace(regex, newSubTasksPreviewComponent);
fs.writeFileSync(path, content, 'utf8');
