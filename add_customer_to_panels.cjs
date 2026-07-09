const fs = require('fs');
let code = fs.readFileSync('src/components/VehicleDetailPanels.tsx', 'utf8');

const importTarget = "import { Activity, ExternalLink, History, Wrench, Shield, FileText";
if (!code.includes("import { Activity, ExternalLink, History, Wrench, Shield, FileText, Users }")) {
   code = code.replace(importTarget, importTarget + ", Users");
}

const oldGrid = `<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-6">`;
const newGrid = `<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          <div>
            <div className="text-slate-400 mb-1.5 text-xs font-bold uppercase">顧客名</div>
            <div className="font-bold text-base text-slate-800 flex items-center">
              <Users className="w-4 h-4 mr-1.5 text-slate-400" />
              {vehicle.customerName || '---'}
            </div>
          </div>`;

code = code.replace(oldGrid, newGrid);
fs.writeFileSync('src/components/VehicleDetailPanels.tsx', code);
