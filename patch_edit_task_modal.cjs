const fs = require('fs');
let content = fs.readFileSync('src/components/EditTaskModal.tsx', 'utf-8');

// Import AddWorkContentModal
content = content.replace(
  "import { AddRepairTaskModal } from './AddRepairTaskModal';",
  "import { AddRepairTaskModal } from './AddRepairTaskModal';\nimport { AddWorkContentModal } from './AddWorkContentModal';"
);

// Add state for showAddWorkModal
content = content.replace(
  "const [showAddSubTaskModal, setShowAddSubTaskModal] = useState(false);",
  "const [showAddSubTaskModal, setShowAddSubTaskModal] = useState(false);\n  const [showAddWorkModal, setShowAddWorkModal] = useState(false);"
);

// Modify the rendering of "作業内容" section
const targetContent = `<div className="flex items-center justify-between mb-2">
                      <label className="font-bold text-sm text-slate-700 flex items-center"><CheckCircle className="w-5 h-5 mr-2 text-indigo-500" />作業内容</label>
                      <button 
                        onClick={(e) => { e.preventDefault(); setLocalTasks([...localTasks, { name: "", reportFormatId: "", paidServiceId: "" }]); }}
                        className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded font-bold flex items-center shadow-sm"
                      >
                        <Plus className="w-3 h-3 mr-1"/>作業を追加
                      </button>
                    </div>`;

const newTargetContent = `<div className="flex items-center justify-between mb-2">
                      <label className="font-bold text-sm text-slate-700 flex items-center"><CheckCircle className="w-5 h-5 mr-2 text-indigo-500" />作業内容</label>
                      <button 
                        onClick={(e) => { e.preventDefault(); setShowAddWorkModal(true); }}
                        className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded font-bold flex items-center shadow-sm"
                      >
                        <Plus className="w-3 h-3 mr-1"/>作業内容の新規追加
                      </button>
                    </div>`;

content = content.replace(targetContent, newTargetContent);

// Replace localTasks rendering
const oldLocalTasksRender = `<div className="space-y-3">
                      {localTasks.map((t: any, i: number) => (
                        <div key={i} className="flex gap-2 relative group items-start bg-white p-3 rounded-lg border border-slate-200">
                          <div className="w-6 h-6 flex items-center justify-center shrink-0 bg-slate-100 rounded text-xs font-bold text-slate-500 mt-2">{i+1}</div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <input 
                                type="text" 
                                value={t.name}
                                onChange={(e) => {
                                  const newTasks = [...localTasks];
                                  newTasks[i] = { ...newTasks[i], name: e.target.value };
                                  setLocalTasks(newTasks);
                                }}
                                className="flex-1 border-slate-300 rounded-lg px-3 py-2 text-sm font-bold shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50" 
                                placeholder="作業内容を入力"
                              />
                              <button
                                type="button"
                                className="flex items-center justify-center px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-bold transition-colors shadow-sm shrink-0 whitespace-nowrap group-hover:opacity-100 md:opacity-0 opacity-100"
                              >
                                <Sparkles className="w-3.5 h-3.5 mr-1" />
                                AIで詳細を付加
                              </button>
                            </div>
                            <div className="flex gap-2 flex-col md:flex-row">
                              <select 
                                value={t.reportFormatId}
                                onChange={(e) => {
                                  const newTasks = [...localTasks];
                                  newTasks[i] = { ...newTasks[i], reportFormatId: e.target.value };
                                  setLocalTasks(newTasks);
                                }}
                                className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 bg-slate-50 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
                              >
                                <option value="">-- 報告様式: 無設定 --</option>
                                {reportTemplates?.map((rt: any) => (
                                  <option key={rt.id} value={rt.id}>{rt.name}</option>
                                ))}
                              </select>
                              <select 
                                value={t.paidServiceId}
                                onChange={(e) => {
                                  const newTasks = [...localTasks];
                                  newTasks[i] = { ...newTasks[i], paidServiceId: e.target.value };
                                  setLocalTasks(newTasks);
                                }}
                                className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 bg-slate-50 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
                              >
                                <option value="">-- 適用補償・有償: 無設定 --</option>
                                <optgroup label="有償サービス">
                                  <option value="有償定期メンテナンス">有償定期メンテナンス</option>
                                  <option value="有償修理">有償修理</option>
                                </optgroup>
                                <optgroup label="無償サービス (保証適用内)">
                                  <option value="無償定期メンテナンス">無償定期メンテナンス</option>
                                  <option value="無償修理">無償修理</option>
                                </optgroup>
                              </select>
                            </div>
                          </div>
                          <button onClick={() => setLocalTasks(localTasks.filter((_: any, idx: number) => idx !== i))} className="text-slate-400 hover:text-red-500 transition mt-2 ml-2">
                            <X className="w-5 h-5"/>
                          </button>
                        </div>
                      ))}
                    </div>`;

const newLocalTasksRender = `<div className="space-y-3">
                      {(task?.linkedTaskIds || []).length > 0 ? (
                        (task?.linkedTaskIds || []).map((id, i) => {
                          const linkedTask = tasks.find(t => t.id === id);
                          if (!linkedTask) return null;
                          return (
                            <div key={id} className="flex gap-2 items-center bg-white p-3 rounded-lg border border-slate-200">
                              <div className="w-6 h-6 flex items-center justify-center shrink-0 bg-indigo-100 rounded text-xs font-bold text-indigo-600">{i+1}</div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-slate-800">{linkedTask.title}</p>
                                <p className="text-xs text-slate-500">{linkedTask.category} (リンクされた案件)</p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-slate-500 bg-white p-4 rounded-lg border border-slate-200 text-center">作業内容は登録されていません</p>
                      )}
                    </div>`;

content = content.replace(oldLocalTasksRender, newLocalTasksRender);

// Add modal logic to the bottom
const modalComponent = `      {showAddWorkModal && task && (
        <AddWorkContentModal
          onClose={() => setShowAddWorkModal(false)}
          defaultCategory={task.category}
          onSave={(newWorks, selectedTaskIds, selectedAlertIds) => {
            const newLinkedIds = [...(task.linkedTaskIds || [])];
            
            // 1. Process existing tasks
            selectedTaskIds.forEach(id => {
              if (!newLinkedIds.includes(id)) newLinkedIds.push(id);
              const target = tasks.find(t => t.id === id);
              if (target) {
                // Copy info and link back
                updateTask(id, {
                  linkedTaskIds: Array.from(new Set([...(target.linkedTaskIds || []), task.id])),
                  toolIds: Array.from(new Set([...(target.toolIds || []), ...(task.toolIds || [])])),
                  assignments: task.assignments || target.assignments,
                });
              }
            });

            // 2. Process new blank works
            newWorks.forEach(w => {
              const newTaskId = 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
              newLinkedIds.push(newTaskId);
              
              // We need to call a function from AppContext to add task. Wait, useApp only exposes updateTask and deleteTask, does it have addTask?
              // I will check Context first. If it doesn't have addTask, I need to add it or do something else.
            });

            // Update this task
            updateTask(task.id, { linkedTaskIds: newLinkedIds });
            setShowAddWorkModal(false);
          }}
        />
      )}`;

content = content.replace("{showAddSubTaskModal && (", modalComponent + "\n\n      {showAddSubTaskModal && (");

fs.writeFileSync('src/components/EditTaskModal.tsx', content, 'utf-8');
console.log('patched EditTaskModal.tsx');
