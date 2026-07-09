const fs = require('fs');
const file = 'src/components/EditTaskModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const subTasksTabContent = `
              {activeTab === 'sub_tasks' && (
                <div className="max-w-5xl mx-auto w-full space-y-6 md:space-y-8 animate-in fade-in pb-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center">
                      <AlertCircle className="w-6 h-6 mr-2 text-indigo-500" />
                      小タスク管理
                    </h3>
                    {!isReadOnly && (
                      <button 
                        onClick={() => setShowAddSubTaskModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-sm transition"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        小タスクを追加
                      </button>
                    )}
                  </div>
                  
                  {subTasks.length === 0 ? (
                    <div className="text-center p-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                      <h4 className="font-bold text-slate-500 mb-2">小タスクはありません</h4>
                      <p className="text-sm text-slate-400">このタスクに関連する小タスクを作成して、作業を分割できます。</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {subTasks.map(st => (
                        <div key={st.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between hover:border-indigo-300 transition-colors">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">小タスク</span>
                              <span className={\`text-[10px] px-2 py-0.5 rounded font-bold \${
                                st.progress === '未着手' ? 'bg-slate-100 text-slate-600' :
                                st.progress === '進行中' ? 'bg-blue-100 text-blue-700' :
                                st.progress === '承認待ち' ? 'bg-amber-100 text-amber-700' :
                                'bg-emerald-100 text-emerald-700'
                              }\`}>{st.progress}</span>
                            </div>
                            <h4 className="font-bold text-slate-800">{st.title}</h4>
                            {st.deadline && <div className="text-xs text-slate-500 mt-1">期限: {format(new Date(st.deadline), 'yyyy-MM-dd')}</div>}
                          </div>
                          <div>
                            {/* We could add an edit button here, but for now just showing them is enough */}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
`;

content = content.replace(
  `              {activeTab === 'chat' && (`,
  subTasksTabContent + `\n              {activeTab === 'chat' && (`
);

content = content.replace(
  `    </div>\n    </div>\n  );\n}`,
  `    </div>\n\n      {showAddSubTaskModal && (
        <div className="fixed inset-0 z-[60]">
          <AddRepairTaskModal
            onClose={() => setShowAddSubTaskModal(false)}
            initialVehicleId={task?.vehicleId}
            parentId={task?.id}
            initialTitle={\`[\${task?.title}]の小タスク\`}
            onTaskSaved={() => {
              // Usually handled by context automatically
              setShowAddSubTaskModal(false);
            }}
          />
        </div>
      )}\n    </div>\n  );\n}`
);

fs.writeFileSync(file, content);
