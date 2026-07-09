const fs = require('fs');
const path = './src/views/TasksView.tsx';
let content = fs.readFileSync(path, 'utf8');

// We are going to replace the current expanded row logic with indented table rows.

// First, remove the old expand row
const oldExpandRow = `                    {isExpanded && subTasks.length > 0 && (
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <td colSpan={11} className="p-0">
                          <div className="pl-14 pr-4 py-3 pb-4">
                            <h5 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center"><ChevronRight className="w-3 h-3 mr-1" />小タスク</h5>
                            <div className="space-y-2">
                              {subTasks.map(st => (
                                <div key={st.id} className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between shadow-sm cursor-pointer hover:border-indigo-300 transition" onClick={() => setViewingTaskId(st.id)}>
                                  <div className="flex items-center gap-3">
                                    <StatusBadge s={st.progress} />
                                    <span className="font-bold text-sm text-slate-800">{st.title}</span>
                                  </div>
                                  {st.deadline && <span className="text-xs font-mono text-slate-500">{format(new Date(st.deadline), 'yyyy-MM-dd')}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}`;

const newExpandRow = `                    {isExpanded && subTasks.length > 0 && subTasks.map((st, idx) => {
                      const isLast = idx === subTasks.length - 1;
                      const ss = staff.find(staffMember => staffMember.id === st.staffIds?.[0]);
                      return (
                        <tr key={st.id} className="bg-slate-50/80 border-b border-slate-200 hover:bg-slate-100 transition group/sub">
                          <td className="px-4 py-3 text-center"></td>
                          <td className="px-4 py-3">
                            <StatusBadge s={st.progress} />
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800 text-sm">
                            {st.id}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 font-mono">
                            {st.deadline ? format(new Date(st.deadline), 'yyyy-MM-dd') : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-4 h-4 border-l-2 border-b-2 border-slate-300 rounded-bl mr-2 -mt-4 opacity-70"></div>
                              <button onClick={() => setViewingTaskId(st.id)} className="font-bold text-slate-700 hover:text-indigo-600 transition flex items-center text-sm group-hover/sub:underline">
                                <FileText className="w-3 h-3 mr-1 text-slate-400" />
                                {st.title}
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-500 text-sm">
                            {st.category}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <div className="font-semibold text-gray-700">{ss ? ss.name : <span className="text-red-400">未割当</span>}</div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button 
                              onClick={() => setViewingTaskId(st.id)}
                              className="inline-flex items-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded text-xs font-bold border border-indigo-200 transition"
                            >
                              内容確認
                            </button>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {st.progress === '完了' ? (
                              <div className="inline-flex items-center text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold border border-green-100">
                                <CheckCircle className="w-3 h-3 mr-1" />承認済
                              </div>
                            ) : st.progress === '承認待ち' ? (
                              <button 
                                onClick={() => setApprovingTaskId(st.id)}
                                className="inline-flex items-center text-white bg-amber-600 hover:bg-amber-700 px-2 py-1 rounded text-xs font-bold transition shadow-sm"
                              >
                                <FileSignature className="w-3 h-3 mr-1" />承認する
                              </button>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}`;

content = content.replace(oldExpandRow, newExpandRow);

// Find the toggleExpand button
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
