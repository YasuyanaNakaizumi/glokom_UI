const fs = require('fs');
const file = 'src/views/DashboardView.tsx';
let content = fs.readFileSync(file, 'utf8');

// The issue: fcTasks, repairTasks, maintenanceTasks maps had an extra `</div>` at the end
// because the replaceAll added them, but the starting wrappers were not correctly injected.

// First, we remove ALL the `</div>\n                      </div>\n                    );\n                  })}`
// and revert to `                      </div>\n                    );\n                  })}`
content = content.replaceAll(
  `                      </div>
                      </div>
                    );
                  })}`,
  `                      </div>
                    );
                  })}`
);

// Now, patrolTasks DOES have the starting wrapper.
// So for patrolTasks, we NEED the extra </div>.
// We'll just manually add `</div>` to patrolTasks where it closes.
content = content.replace(
  `                      </div>
                    );
                  })}
                  {patrolTasks.length > 3`,
  `                      </div>
                      </div>
                    );
                  })}
                  {patrolTasks.length > 3`
);

// Now we need to properly add the starting wrappers for fcTasks, repairTasks, maintenanceTasks.

// fcTasks
let p2 = `                      <div
                        key={t.id}
                        onClick={() => setEditingTaskId(t.id)}
                        className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden cursor-pointer"
                      >`;
let r2 = `                      <div key={t.id} className={cn("relative group cursor-pointer", subTasks.length > 0 && "mb-3")} onClick={() => setEditingTaskId(t.id)}>
                        {subTasks.length > 0 && (
                          <>
                            <div className="absolute -bottom-1.5 left-1.5 right-1.5 h-full bg-white border border-slate-200 rounded-lg z-0 shadow-sm"></div>
                            <div className="absolute -bottom-3 left-3 right-3 h-full bg-white/60 border border-slate-200 rounded-lg z-[-1] shadow-sm"></div>
                          </>
                        )}
                      <div
                        className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col relative overflow-hidden z-10 transition-transform group-hover:-translate-y-1"
                      >`;
if (content.includes(p2)) {
  content = content.replace(p2, r2);
  content = content.replace(
    `                      </div>
                    );
                  })}
                  {fcTasks.length > 3`,
    `                      </div>
                      </div>
                    );
                  })}
                  {fcTasks.length > 3`
  );
}

// repairTasks
let p3 = `                      <div
                        key={t.id}
                        onClick={() => setEditingTaskId(t.id)}
                        className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden cursor-pointer"
                      >`;
if (content.includes(p3)) {
  content = content.replace(p3, r2); // Same wrapper logic as fcTasks
  content = content.replace(
    `                      </div>
                    );
                  })}
                  {repairTasks.length > 3`,
    `                      </div>
                      </div>
                    );
                  })}
                  {repairTasks.length > 3`
  );
}

// maintenanceTasks
let p4 = `                      <div key={t.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden flex flex-col cursor-pointer" onClick={() => setEditingTaskId(t.id)}>`;
let r4 = `                      <div key={t.id} className={cn("relative group cursor-pointer", subTasks.length > 0 && "mb-3")} onClick={() => setEditingTaskId(t.id)}>
                        {subTasks.length > 0 && (
                          <>
                            <div className="absolute -bottom-1.5 left-1.5 right-1.5 h-full bg-white border border-slate-200 rounded-lg z-0 shadow-sm"></div>
                            <div className="absolute -bottom-3 left-3 right-3 h-full bg-white/60 border border-slate-200 rounded-lg z-[-1] shadow-sm"></div>
                          </>
                        )}
                      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm relative overflow-hidden flex flex-col z-10 transition-transform group-hover:-translate-y-1">`;
if (content.includes(p4)) {
  content = content.replace(p4, r4);
  content = content.replace(
    `                      </div>
                    );
                  })}
                  {maintenanceTasks.length > 3`,
    `                      </div>
                      </div>
                    );
                  })}
                  {maintenanceTasks.length > 3`
  );
}

fs.writeFileSync(file, content);
