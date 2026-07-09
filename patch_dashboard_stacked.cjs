const fs = require('fs');
const file = 'src/views/DashboardView.tsx';
let content = fs.readFileSync(file, 'utf8');

// We will target each map separately.
// 1. patrolTasks
let p1 = `                    return (
                      <div
                        key={t.id}
                        onClick={() => setEditingTaskId(t.id)}
                        className={cn(
                          "bg-white border rounded-lg p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden cursor-pointer",
                          isCompletedPendingApprove
                            ? "border-emerald-300 bg-emerald-50/30"
                            : "border-slate-200",
                        )}
                      >`;
let r1 = `                    return (
                      <div key={t.id} className={cn("relative group cursor-pointer", subTasks.length > 0 && "mb-3")} onClick={() => setEditingTaskId(t.id)}>
                        {subTasks.length > 0 && (
                          <>
                            <div className="absolute -bottom-1.5 left-1.5 right-1.5 h-full bg-white border border-slate-200 rounded-lg z-0 shadow-sm"></div>
                            <div className="absolute -bottom-3 left-3 right-3 h-full bg-white/60 border border-slate-200 rounded-lg z-[-1] shadow-sm"></div>
                          </>
                        )}
                      <div
                        className={cn(
                          "bg-white border rounded-lg p-3 shadow-sm relative overflow-hidden z-10 transition-transform group-hover:-translate-y-1",
                          isCompletedPendingApprove
                            ? "border-emerald-300 bg-emerald-50/30"
                            : "border-slate-200",
                        )}
                      >`;
content = content.replace(p1, r1);

// 2. fcTasks
let p2 = `                    return (
                      <div
                        key={t.id}
                        onClick={() => setEditingTaskId(t.id)}
                        className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden cursor-pointer"
                      >`;
let r2 = `                    return (
                      <div key={t.id} className={cn("relative group cursor-pointer", subTasks.length > 0 && "mb-3")} onClick={() => setEditingTaskId(t.id)}>
                        {subTasks.length > 0 && (
                          <>
                            <div className="absolute -bottom-1.5 left-1.5 right-1.5 h-full bg-white border border-slate-200 rounded-lg z-0 shadow-sm"></div>
                            <div className="absolute -bottom-3 left-3 right-3 h-full bg-white/60 border border-slate-200 rounded-lg z-[-1] shadow-sm"></div>
                          </>
                        )}
                      <div
                        className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm relative overflow-hidden z-10 transition-transform group-hover:-translate-y-1"
                      >`;
content = content.replace(p2, r2);

// 3. repairTasks
let p3 = `                    return (
                      <div
                        key={t.id}
                        onClick={() => setEditingTaskId(t.id)}
                        className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden cursor-pointer"
                      >`;
let r3 = `                    return (
                      <div key={t.id} className={cn("relative group cursor-pointer", subTasks.length > 0 && "mb-3")} onClick={() => setEditingTaskId(t.id)}>
                        {subTasks.length > 0 && (
                          <>
                            <div className="absolute -bottom-1.5 left-1.5 right-1.5 h-full bg-white border border-slate-200 rounded-lg z-0 shadow-sm"></div>
                            <div className="absolute -bottom-3 left-3 right-3 h-full bg-white/60 border border-slate-200 rounded-lg z-[-1] shadow-sm"></div>
                          </>
                        )}
                      <div
                        className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm relative overflow-hidden z-10 transition-transform group-hover:-translate-y-1"
                      >`;
content = content.replace(p3, r3);

// 4. maintenanceTasks
let p4 = `                    return (
                      <div key={t.id} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden flex flex-col cursor-pointer" onClick={() => setEditingTaskId(t.id)}>`;
let r4 = `                    return (
                      <div key={t.id} className={cn("relative group cursor-pointer", subTasks.length > 0 && "mb-3")} onClick={() => setEditingTaskId(t.id)}>
                        {subTasks.length > 0 && (
                          <>
                            <div className="absolute -bottom-1.5 left-1.5 right-1.5 h-full bg-white border border-slate-200 rounded-lg z-0 shadow-sm"></div>
                            <div className="absolute -bottom-3 left-3 right-3 h-full bg-white/60 border border-slate-200 rounded-lg z-[-1] shadow-sm"></div>
                          </>
                        )}
                      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm relative overflow-hidden flex flex-col z-10 transition-transform group-hover:-translate-y-1">`;
content = content.replace(p4, r4);

// We need to close the outer div for each task card.
// We can find the closing div of the card by looking for the end of the return statement.
// Since each map return is followed by `                    );`, we can replace that with `</div>\n                    );` for the wrapper.

content = content.replaceAll(
  `                      </div>
                    );
                  })}`,
  `                      </div>
                      </div>
                    );
                  })}`
);


fs.writeFileSync(file, content);
