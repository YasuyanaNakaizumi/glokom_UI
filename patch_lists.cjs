const fs = require('fs');

// Patch VehicleListView
let vContent = fs.readFileSync('src/views/VehicleListView.tsx', 'utf8');

const oldRenderListItem = `  const renderListItem = (v: Vehicle) => {
    const isSelected = selectedVehicleId === v.id;
    return (
      <button
        key={v.id}
        onClick={() => handleSelectVehicle(v.id)}
        className={\`w-full text-left px-4 py-3 border-b border-slate-100 hover:bg-white transition-colors relative \${
          isSelected ? 'bg-white' : ''
        }\`}
      >
        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />}
        <div className="flex justify-between items-start mb-1">
          <h4 className={\`font-bold text-sm \${isSelected ? 'text-indigo-900' : 'text-slate-800'}\`}>{v.modelName}</h4>
          <span className={\`text-[10px] px-1.5 py-0.5 rounded font-bold border \${v.status === '在庫' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}\`}>
            {v.status === '在庫' ? '在庫' : '稼働中'}
          </span>
        </div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center text-xs font-bold font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
            S/N: {v.serialNumber}
          </div>
        </div>
        {v.customerName && (
          <div className="text-[11px] font-bold text-slate-500 flex items-center">
            <Users className="w-3 h-3 mr-1 opacity-70" />
            {v.customerName}
          </div>
        )}
      </button>
    );
  };`;

const newRenderListItem = `  const renderListItem = (v: Vehicle) => {
    const isSelected = selectedVehicleId === v.id;
    return (
      <button
        key={v.id}
        onClick={() => handleSelectVehicle(v.id)}
        className={\`w-full text-left px-4 py-2.5 border-b border-slate-100 hover:bg-white transition-colors relative \${
          isSelected ? 'bg-white' : ''
        }\`}
      >
        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />}
        <div className="flex justify-between items-center mb-0.5">
          <div className="flex items-baseline gap-2 overflow-hidden pr-2">
            <h4 className={\`font-bold text-sm truncate \${isSelected ? 'text-indigo-900' : 'text-slate-800'}\`}>{v.modelName}</h4>
            <span className="text-xs font-mono text-slate-500 font-bold shrink-0">{v.serialNumber}</span>
          </div>
          <span className={\`text-[10px] px-1.5 py-0.5 rounded font-bold border shrink-0 \${v.status === '在庫' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}\`}>
            {v.status === '在庫' ? '在庫' : '稼働中'}
          </span>
        </div>
        {v.customerName && (
          <div className="text-[11px] font-bold text-slate-500 flex items-center mt-1">
            <Users className="w-3 h-3 mr-1 opacity-70 shrink-0" />
            <span className="truncate">{v.customerName}</span>
          </div>
        )}
      </button>
    );
  };`;

vContent = vContent.replace(oldRenderListItem, newRenderListItem);
vContent = vContent.replace(
  'className={`w-full md:w-1/3 md:min-w-[320px] md:max-w-[400px] flex-col border-r border-slate-200 bg-slate-50/50 h-full ${selectedVehicleId ? \'hidden md:flex\' : \'flex\'}`}',
  'className={`w-full md:w-[320px] shrink-0 flex-col border-r border-slate-200 bg-slate-50/50 h-full ${selectedVehicleId ? \'hidden md:flex\' : \'flex\'}`}'
);
fs.writeFileSync('src/views/VehicleListView.tsx', vContent);

// Patch CustomerListView
let cContent = fs.readFileSync('src/views/CustomerListView.tsx', 'utf8');
cContent = cContent.replace(
  'className={`w-full md:w-1/3 md:min-w-[320px] md:max-w-[400px] flex-col border-r border-slate-200 bg-slate-50/50 h-full ${selectedCustomerId ? \'hidden md:flex\' : \'flex\'}`}',
  'className={`w-full md:w-[320px] shrink-0 flex-col border-r border-slate-200 bg-slate-50/50 h-full ${selectedCustomerId ? \'hidden md:flex\' : \'flex\'}`}'
);
fs.writeFileSync('src/views/CustomerListView.tsx', cContent);

