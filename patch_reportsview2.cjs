const fs = require('fs');
const path = './src/views/ReportsView.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the completed tasks mapping
content = content.replace(
  /\{completedTasks\.filter\(([\s\S]*?)\)\.map\(t => \([\s\S]*?<td className="px-4 py-3 text-slate-700">\{t\.title\}<\/td>([\s\S]*?)<\/tr>\s*\)\)\}/,
  `{completedTasks.filter($1).map(t => {
                  const subTasks = tasks.filter(st => st.parentId === t.id);
                  const isExpanded = expandedTaskIds.has(t.id);
                  return (
                    <React.Fragment key={t.id}>
                      <tr className={cn("hover:bg-slate-50 transition border-b border-slate-100", isExpanded && "bg-slate-50 border-b-0")}>
                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">{format(new Date(t.deadline), 'yyyy/MM/dd')}</td>
                        <td className="px-4 py-3 text-xs text-indigo-700 font-bold">{t.category}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{t.targetModelName}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 text-sm">{t.title}</div>
                          {subTasks.length > 0 && (
                            <button 
                              onClick={(e) => toggleExpand(t.id, e)}
                              className="mt-1 flex items-center text-[10px] text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 transition"
                            >
                              {isExpanded ? <ChevronDown className="w-3 h-3 mr-0.5" /> : <ChevronRight className="w-3 h-3 mr-0.5" />}
                              小タスク ({subTasks.filter(st => st.progress === '完了').length}/{subTasks.length})
                            </button>
                          )}
                        </td>$2</tr>
                      {isExpanded && subTasks.length > 0 && (
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
                      )}
                    </React.Fragment>
                  );
                })}`
);

// We need to import cn and React if not already imported
if (!content.includes('import { cn }')) {
  content = content.replace(/import React/, 'import { cn } from "../lib/utils";\nimport React');
}

fs.writeFileSync(path, content, 'utf8');
