const fs = require('fs');
const file = 'src/views/TasksView.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `  const [viewingTaskId, setViewingTaskId] = useState<string | null>(null);`,
  `  const [viewingTaskId, setViewingTaskId] = useState<string | null>(null);\n  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());`
);

content = content.replace(
  `  // Reset page when filters change`,
  `  const toggleExpand = (id: string, e: React.MouseEvent) => {\n    e.stopPropagation();\n    const next = new Set(expandedTaskIds);\n    if (next.has(id)) next.delete(id);\n    else next.add(id);\n    setExpandedTaskIds(next);\n  };\n\n  // Reset page when filters change`
);

content = content.replace(
  `  const filteredTasks = tasks.filter(t => {`,
  `  const filteredTasks = tasks.filter(t => {\n    if (t.parentId) return false; // Hide sub-tasks from the main list`
);

const trRenderPattern = `                {paginatedTasks.map(t => {
                  const isSelected = selectedIds.has(t.id);
                  const s = staff.find(st => st.id === t.staffId);
                  const v = vehicles.find(vh => vh.id === t.vehicleId);
                  return (
                    <tr key={t.id} className={cn("hover:bg-slate-50 transition", isSelected && "bg-indigo-50/30")}>`;

const trReplacement = `                {paginatedTasks.map(t => {
                  const isSelected = selectedIds.has(t.id);
                  const s = staff.find(st => st.id === t.staffId);
                  const v = vehicles.find(vh => vh.id === t.vehicleId);
                  const isExpanded = expandedTaskIds.has(t.id);
                  const subTasks = tasks.filter(st => st.parentId === t.id);
                  return (
                    <React.Fragment key={t.id}>
                    <tr className={cn("hover:bg-slate-50 transition border-b border-slate-100", isSelected && "bg-indigo-50/30", isExpanded && "bg-slate-50 border-b-0")}>`;

content = content.replace(trRenderPattern, trReplacement);

// Now the end of the `tr`
const trEndPattern = `                      </td>
                    </tr>
                  );
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
                  );
                })}`;

content = content.replace(trEndPattern, trEndReplacement);

// Add the chevron and badge to the title column
const titleColumnPattern = `                        <td className="px-4 py-3">
                          <button onClick={() => setViewingTaskId(t.id)} className="font-bold text-sm text-slate-800 hover:text-indigo-600 text-left line-clamp-2">
                            {t.title}
                          </button>
                        </td>`;

const titleColumnReplacement = `                        <td className="px-4 py-3">
                          <div className="flex items-start gap-2">
                            {subTasks.length > 0 ? (
                              <button onClick={(e) => toggleExpand(t.id, e)} className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-transform">
                                <ChevronRight className={cn("w-4 h-4 transition-transform", isExpanded && "rotate-90")} />
                              </button>
                            ) : (
                              <div className="w-4 h-4 mt-0.5" />
                            )}
                            <div>
                              <button onClick={() => setViewingTaskId(t.id)} className="font-bold text-sm text-slate-800 hover:text-indigo-600 text-left line-clamp-2">
                                {t.title}
                              </button>
                              {subTasks.length > 0 && (
                                <div className="mt-1 flex items-center text-xs">
                                  <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium border border-slate-200 flex items-center">
                                    <CheckSquare className="w-3 h-3 mr-1" />
                                    小タスク ({subTasks.filter(s => s.progress === '完了').length}/{subTasks.length})
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>`;

content = content.replace(titleColumnPattern, titleColumnReplacement);

fs.writeFileSync(file, content);
