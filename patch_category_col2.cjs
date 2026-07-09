const fs = require('fs');
const file = 'src/views/CategoryTasksView.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `    let col2 = <div className="text-sm font-bold text-slate-900">{t.title}</div>;`,
  `    const subTasks = tasks.filter(st => st.parentId === t.id);
    let col2 = (
      <div className="flex flex-col">
        <div className="text-sm font-bold text-slate-900">{t.title}</div>
        {subTasks.length > 0 && (
          <div className="flex items-center mt-1 text-slate-500 text-[10px]">
             <AlertCircle className="w-3 h-3 mr-0.5" />
             小タスク {subTasks.filter(st => st.progress === '完了').length}/{subTasks.length} 完了
          </div>
        )}
      </div>
    );`
);

fs.writeFileSync(file, content);
