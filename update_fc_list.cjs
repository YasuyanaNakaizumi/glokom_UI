const fs = require('fs');
let code = fs.readFileSync('src/views/FleetView.tsx', 'utf8');

const targetStr = `                        <div 
                          className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                          onClick={() => setExpandedFcVehicleId(isExpanded ? null : stat.vehicle.id)}
                        >
                          <div className="flex-1 min-w-0 flex flex-col">
                             <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                               <span className="font-bold text-lg text-slate-800">{stat.vehicle.modelName}</span>
                               <span className="text-slate-500 font-mono text-sm">{stat.vehicle.serialNumber}</span>
                               {stat.vehicle.customerName && <span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600 font-bold">{stat.vehicle.customerName}</span>}
                               {stat.unexecutedCount > 0 && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">未実施あり</span>}
                             </div>
                             <div className="flex items-center gap-6 text-sm">`;

const replaceStr = `                        <div 
                          className="p-3 sm:p-4 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                          onClick={() => setExpandedFcVehicleId(isExpanded ? null : stat.vehicle.id)}
                        >
                          <div className="flex-1 min-w-0 flex flex-col xl:flex-row xl:items-center gap-4 xl:gap-8 w-full">
                             <div className="flex items-center gap-3 flex-wrap min-w-[300px]">
                               <span className="font-bold text-lg text-slate-800">{stat.vehicle.modelName}</span>
                               <span className="text-slate-500 font-mono text-sm">{stat.vehicle.serialNumber}</span>
                               {stat.vehicle.customerName && <span className="bg-slate-100 px-2 py-0.5 rounded text-xs text-slate-600 font-bold">{stat.vehicle.customerName}</span>}
                               {stat.unexecutedCount > 0 && <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">未実施あり</span>}
                             </div>
                             <div className="flex items-center gap-8 text-sm flex-1">`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  fs.writeFileSync('src/views/FleetView.tsx', code);
  console.log('Updated successfully');
} else {
  console.log('Target string not found');
}
