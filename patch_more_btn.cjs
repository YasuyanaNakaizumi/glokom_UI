const fs = require('fs');
let code = fs.readFileSync('src/views/DashboardView.tsx', 'utf8');

code = code.replace(
  '{repairTasks.length === 0 && (',
  `{repairTasks.length > 3 && (
                    <button onClick={() => setView('tasks_repair')} className="w-full text-center text-sm text-slate-600 bg-white border border-slate-200 py-2 rounded font-medium hover:bg-slate-50 transition">
                      全 {repairTasks.length} 件を表示
                    </button>
                  )}
                  {repairTasks.length === 0 && (`
);

code = code.replace(
  '{maintenanceTasks.length === 0 && (',
  `{maintenanceTasks.length > 3 && (
                    <button onClick={() => setView('tasks_inspection')} className="w-full text-center text-sm text-slate-600 bg-white border border-slate-200 py-2 rounded font-medium hover:bg-slate-50 transition">
                      全 {maintenanceTasks.length} 件を表示
                    </button>
                  )}
                  {maintenanceTasks.length === 0 && (`
);

code = code.replace(
  '{patrolTasks.length > 0 && (',
  '{patrolTasks.length > 3 && ('
);

code = code.replace(
  '{fcTasks.length > 0 && (',
  '{fcTasks.length > 3 && ('
);


fs.writeFileSync('src/views/DashboardView.tsx', code);
console.log('Patched dashboard buttons');
