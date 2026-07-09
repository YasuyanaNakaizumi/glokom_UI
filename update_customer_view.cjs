const fs = require('fs');

let content = fs.readFileSync('src/views/CustomerListView.tsx', 'utf8');

// 1. Add import
if (!content.includes('VehicleDetailPanels')) {
  content = content.replace("import { Vehicle } from '../types';", "import { Vehicle } from '../types';\nimport { VehicleDetailPanels } from '../components/VehicleDetailPanels';");
}

// 2. Add state
content = content.replace("const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);", "const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);\n  const [detailVehicleId, setDetailVehicleId] = useState<string | null>(null);");

// 3. Clear state on select customer
content = content.replace("setSelectedCustomerId(id);\n  };", "setSelectedCustomerId(id);\n    setDetailVehicleId(null);\n  };");

const startStr = '{/* Column 1: Customer Members */}';
const endStr = '</div>\n            </div>\n          </div>\n        ) : (';

const startIdx = content.indexOf(startStr);
const endIdx = content.indexOf(endStr);

if (startIdx === -1 || endIdx === -1) {
  console.log("Indices not found", startIdx, endIdx);
  process.exit(1);
}

const beforeCols = content.substring(0, startIdx);
// Note: we need to find the opening <div className="flex flex-col xl:flex-row ...> which is just above startStr
const wrapperStartStr = '<div className="flex flex-col xl:flex-row gap-6 h-[500px] xl:h-auto xl:flex-1 min-h-0 animate-in fade-in duration-200">';
const realStartIdx = content.indexOf(wrapperStartStr);

const oldCols = content.substring(realStartIdx, endIdx);

let newCols = `{!detailVehicleId ? (
                 ` + oldCols + `
               ) : (
                 <div className="space-y-6 animate-in fade-in duration-200">
                   <button onClick={() => setDetailVehicleId(null)} className="flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 bg-white shadow-sm border border-slate-200 px-3 py-1.5 rounded-lg mb-2">
                     <ArrowLeft className="w-4 h-4 mr-1.5" /> 戻る
                   </button>
                   {(() => {
                     const v = vehicles.find(vh => vh.id === detailVehicleId);
                     if (!v) return null;
                     return <VehicleDetailPanels vehicle={v} />;
                   })()}
                 </div>
               )}
`;

// Replace the vehicle card with a button
newCols = newCols.replace(
  /<div\n\s*key=\{v\.id\}\n\s*className="w-full flex flex-col p-3 rounded-lg border border-slate-200 bg-white text-left group"/g,
  '<button\n                            key={v.id}\n                            onClick={() => setDetailVehicleId(v.id)}\n                            className="w-full flex flex-col p-3 rounded-lg border border-slate-200 bg-white text-left group hover:border-indigo-300 hover:shadow-md transition-all"'
);
newCols = newCols.replace(
  /<\/div>\n\s*\)\)\n\s*\) : \(/g,
  '</button>\n                        ))\n                      ) : ('
);

content = content.substring(0, realStartIdx) + newCols + content.substring(endIdx);

fs.writeFileSync('src/views/CustomerListView.tsx', content);
console.log("Done");
