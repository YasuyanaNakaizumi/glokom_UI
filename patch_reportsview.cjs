const fs = require('fs');
const path = './src/views/ReportsView.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldExpandRow = `                      {isExpanded && subTasks.length > 0 && (
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <td colSpan={6} className="p-0">
                            <div className="pl-14 pr-4 py-3 pb-4">
                              <h5 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center"><ChevronRight className="w-3 h-3 mr-1" />小タスク</h5>
                              <div className="space-y-2">
                                {subTasks.map(st => (
                                  <div key={st.id} className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold border", st.progress === '完了' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200")}>
                                        {st.progress}
                                      </span>
                                      <span className="font-bold text-sm text-slate-800">{st.title}</span>
                                    </div>
                                    {st.deadline && <span className="text-xs font-mono text-slate-500">{format(new Date(st.deadline), 'yyyy/MM/dd')}</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}`;

const newExpandRow = `                      {isExpanded && subTasks.length > 0 && subTasks.map((st, idx) => {
                        return (
                          <tr key={st.id} className="bg-slate-50/80 border-b border-slate-200 hover:bg-slate-100 transition group/sub">
                            <td className="px-4 py-3 text-slate-500 font-mono text-xs text-right">
                              {st.deadline ? format(new Date(st.deadline), 'yyyy/MM/dd') : '-'}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500"></td>
                            <td className="px-4 py-3 text-slate-500"></td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <div className="w-4 h-4 border-l-2 border-b-2 border-slate-300 rounded-bl mr-2 -mt-4 opacity-70"></div>
                                <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold border mr-2", st.progress === '完了' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200")}>
                                  {st.progress}
                                </span>
                                <span className="font-bold text-sm text-slate-700">{st.title}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs">担当: {st.staffIds?.[0] || '—'}</td>
                            <td className="px-4 py-3 text-center"></td>
                          </tr>
                        );
                      })}`;

content = content.replace(oldExpandRow, newExpandRow);

// Also replace the button for expand/collapse
const oldToggle = `<button 
                              onClick={(e) => toggleExpand(t.id, e)}
                              className="mt-1 flex items-center text-[10px] text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 transition"
                            >
                              {isExpanded ? <ChevronDown className="w-3 h-3 mr-0.5" /> : <ChevronRight className="w-3 h-3 mr-0.5" />}
                              小タスク ({subTasks.filter(st => st.progress === '完了').length}/{subTasks.length})
                            </button>`;

const newToggle = `<button 
                              onClick={(e) => toggleExpand(t.id, e)}
                              className="mt-1 flex items-center text-[10px] text-slate-500 hover:text-indigo-600 font-bold bg-slate-100 hover:bg-indigo-50 px-1.5 py-0.5 rounded border border-slate-200 hover:border-indigo-200 transition"
                            >
                              {isExpanded ? <ChevronDown className="w-3 h-3 mr-0.5" /> : <ChevronRight className="w-3 h-3 mr-0.5" />}
                              小タスクを表示 ({subTasks.filter(st => st.progress === '完了').length}/{subTasks.length})
                            </button>`;

content = content.replace(oldToggle, newToggle);

fs.writeFileSync(path, content, 'utf8');
