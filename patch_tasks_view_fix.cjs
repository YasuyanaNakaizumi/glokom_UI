const fs = require('fs');
const file = 'src/views/TasksView.tsx';
let content = fs.readFileSync(file, 'utf8');

const trEndPattern = `                      </td>
                    </tr>
                  )
                })}`;

const trEndReplacement = `                      </td>
                    </tr>
                    {isExpanded && subTasks.length > 0 && (
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <td colSpan={7} className="p-0">
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
                    )}
                    </React.Fragment>
                  )
                })}`;

content = content.replace(trEndPattern, trEndReplacement);
fs.writeFileSync(file, content);
