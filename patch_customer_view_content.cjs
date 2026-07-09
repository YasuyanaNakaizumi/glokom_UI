const fs = require('fs');

let content = fs.readFileSync('src/views/CustomerListView.tsx', 'utf8');

// Replace accordion with new tab opening
const oldVehicleButton = `<button 
                                  onClick={() => setExpandedVehicleId(isExpanded ? null : v.id)}
                                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                                >
                                  <div className="flex items-center">
                                    {isExpanded ? (
                                      <ChevronDown className="w-5 h-5 text-indigo-500 mr-3" />
                                    ) : (
                                      <ChevronRight className="w-5 h-5 text-slate-400 mr-3" />
                                    )}
                                    <div className="text-left">
                                      <h4 className="font-bold text-slate-800 text-base">{v.modelName}</h4>
                                      <div className="text-xs font-mono text-slate-500 mt-0.5">S/N: {v.serialNumber}</div>
                                    </div>
                                  </div>
                                  <span className={\`px-2.5 py-1 rounded border text-[10px] font-bold \${v.status === '在庫' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}\`}>
                                     {v.status === '在庫' ? '在庫' : '稼働中'}
                                  </span>
                                </button>
                                
                                {isExpanded && renderVehicleDetails(v)}`;

const newVehicleButton = `<button 
                                  onClick={() => {
                                    if (!openVehicleIds.includes(v.id)) {
                                      setOpenVehicleIds([...openVehicleIds, v.id]);
                                    }
                                    setActiveTab(\`vehicle_\${v.id}\`);
                                  }}
                                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                                >
                                  <div className="flex items-center">
                                    <ChevronRight className="w-5 h-5 text-slate-400 mr-3" />
                                    <div className="text-left">
                                      <h4 className="font-bold text-slate-800 text-base">{v.modelName}</h4>
                                      <div className="text-xs font-mono text-slate-500 mt-0.5">S/N: {v.serialNumber}</div>
                                    </div>
                                  </div>
                                  <span className={\`px-2.5 py-1 rounded border text-[10px] font-bold \${v.status === '在庫' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}\`}>
                                     {v.status === '在庫' ? '在庫' : '稼働中'}
                                  </span>
                                </button>`;

content = content.replace(oldVehicleButton, newVehicleButton);

// Also remove `renderVehicleDetails` definition and `const isExpanded` inside the map to clean up, but it's optional.
// Let's remove `const isExpanded = expandedVehicleId === v.id;` from the map since we don't need it.
content = content.replace("const isExpanded = expandedVehicleId === v.id;\n                            return (", "return (");

fs.writeFileSync('src/views/CustomerListView.tsx', content);
