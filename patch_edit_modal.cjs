const fs = require('fs');
const file = 'src/components/EditTaskModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `              <button 
                onClick={() => setActiveTab('sub_tasks')}
                className={cn("w-auto md:w-full shrink-0 flex items-center p-3 rounded-lg text-left text-sm font-bold transition-colors", activeTab === 'sub_tasks' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700')}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                小タスク
                {subTasks.length > 0 && <span className="ml-auto bg-slate-200 text-slate-700 text-xs py-0.5 px-2 rounded-full">{subTasks.length}</span>}
              </button>`;

const replacement1 = `              {!task?.parentId && (
                <button 
                  onClick={() => setActiveTab('sub_tasks')}
                  className={cn("w-auto md:w-full shrink-0 flex items-center p-3 rounded-lg text-left text-sm font-bold transition-colors", activeTab === 'sub_tasks' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700')}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  小タスク
                  {subTasks.length > 0 && <span className="ml-auto bg-slate-200 text-slate-700 text-xs py-0.5 px-2 rounded-full">{subTasks.length}</span>}
                </button>
              )}`;

content = content.replace(target1, replacement1);
fs.writeFileSync(file, content);
