const fs = require('fs');
let code = fs.readFileSync('src/components/VehicleDetailPanels.tsx', 'utf8');

const basicInfoGrid = `<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-slate-400 mb-1.5 text-xs font-bold uppercase">現在SMR</div>
            <div className="font-bold text-lg text-slate-800 font-mono">{vehicle.currentSmr?.toLocaleString() || '---'} <span className="text-sm font-normal text-slate-500">h</span></div>
          </div>
          <div>
            <div className="text-slate-400 mb-1.5 text-xs font-bold uppercase">稼働ステータス</div>
            <div className="font-bold text-emerald-600 flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2" />
              正常稼働中
            </div>
          </div>
          <div>
            <div className="text-slate-400 mb-1.5 text-xs font-bold uppercase">最終通信日時</div>
            <div className="font-bold text-slate-800 font-mono text-sm">
              2026-07-07 14:30
            </div>
          </div>
          <div>
            <div className="text-slate-400 mb-1.5 text-xs font-bold uppercase">GPS位置情報</div>
            <div className="font-bold text-indigo-600 cursor-pointer hover:underline flex items-center">
              取得済み <ExternalLink className="w-3 h-3 ml-1" />
            </div>
          </div>
        </div>`;

const newBasicInfoGrid = `<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">
          <div>
            <div className="text-slate-400 mb-1.5 text-xs font-bold uppercase">機種・型式</div>
            <div className="font-bold text-lg text-slate-800">{vehicle.modelName}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-1.5 text-xs font-bold uppercase">S/N</div>
            <div className="font-bold text-lg text-slate-800 font-mono">{vehicle.serialNumber}</div>
          </div>
          <div>
            <div className="text-slate-400 mb-1.5 text-xs font-bold uppercase">現在SMR</div>
            <div className="font-bold text-lg text-slate-800 font-mono">{vehicle.currentSmr?.toLocaleString() || '---'} <span className="text-sm font-normal text-slate-500">h</span></div>
          </div>
          <div>
            <div className="text-slate-400 mb-1.5 text-xs font-bold uppercase">稼働ステータス</div>
            <div className="font-bold text-emerald-600 flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2" />
              正常稼働中
            </div>
          </div>
          <div>
            <div className="text-slate-400 mb-1.5 text-xs font-bold uppercase">最終通信日時</div>
            <div className="font-bold text-slate-800 font-mono text-sm">
              2026-07-07 14:30
            </div>
          </div>
          <div>
            <div className="text-slate-400 mb-1.5 text-xs font-bold uppercase">GPS位置情報</div>
            <div className="font-bold text-indigo-600 cursor-pointer hover:underline flex items-center">
              取得済み <ExternalLink className="w-3 h-3 ml-1" />
            </div>
          </div>
        </div>`;

code = code.replace(basicInfoGrid, newBasicInfoGrid);

// Now wrap the 3 panels in a grid
const parts = code.split('      {/* 2. EVENTS */}');
if (parts.length === 2) {
  const topPart = parts[0];
  const bottomPart = parts[1];
  
  const bottomReplaced = bottomPart.replace('    </div>\n  );\n};\n', '    </div>\n    </div>\n  );\n};\n');
  
  code = topPart + '      {/* LOWER 3 PANELS IN GRID */}\n      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">\n      {/* 2. EVENTS */}' + bottomReplaced;
}

fs.writeFileSync('src/components/VehicleDetailPanels.tsx', code);
