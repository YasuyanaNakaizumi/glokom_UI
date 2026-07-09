const fs = require('fs');
let code = fs.readFileSync('src/views/VehicleListView.tsx', 'utf8');

const startTag = '{/* Detail Header */}';
const endTag = '{/* Detail Scrollable Content */}';

const startIndex = code.indexOf(startTag);
const endIndex = code.indexOf(endTag);

if (startIndex !== -1 && endIndex !== -1) {
  const replaceStr = `
            {/* Mobile Back Button (Top) */}
            <div className="pt-6 px-6 md:pt-8 md:px-8 shrink-0 bg-white md:hidden">
               <button onClick={() => setSelectedVehicleId(null)} className="flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                  <ArrowLeft className="w-4 h-4 mr-1.5" /> 戻る
               </button>
            </div>
            
            `;
  const before = code.substring(0, startIndex);
  const after = code.substring(endIndex);
  code = before + replaceStr + after;
  fs.writeFileSync('src/views/VehicleListView.tsx', code);
  console.log('Removed Detail Header');
}
