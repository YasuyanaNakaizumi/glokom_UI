const fs = require('fs');
let content = fs.readFileSync('src/views/VehicleListView.tsx', 'utf8');

const missingCode = `
  const handleSelectVehicle = (id: string) => {
    setSelectedVehicleId(id);
    setActiveTab('info');
  };

  const renderListItem = (v: Vehicle) => {
    const isSelected = selectedVehicleId === v.id;
    return (
      <button
        key={v.id}
        onClick={() => handleSelectVehicle(v.id)}
        className={\`w-full text-left p-4 border-b border-slate-100 hover:bg-white transition-colors relative \${
          isSelected ? 'bg-white' : ''
        }\`}
      >
        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />}
        <div className="flex justify-between items-start mb-1.5">
          <h4 className={\`font-bold \${isSelected ? 'text-indigo-900' : 'text-slate-800'}\`}>{v.modelName}</h4>
          <span className={\`text-[10px] px-2 py-0.5 rounded font-bold border \${v.status === '在庫' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}\`}>
            {v.status === '在庫' ? '在庫' : '稼働中'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-slate-500 font-mono">
            S/N: {v.serialNumber}
          </div>
        </div>
        {v.customerName && (
          <div className="text-[11px] font-bold text-slate-500 mt-2 flex items-center">
            <Users className="w-3 h-3 mr-1 opacity-70" />
            {v.customerName}
          </div>
        )}
      </button>
    );
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
  const vTasks = selectedVehicle ? tasks.filter(t => t.vehicleId === selectedVehicle.id).sort((a,b) => {
    const dateA = a.deadline || a.startDate || '';
    const dateB = b.deadline || b.startDate || '';
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  }) : [];
  
  const eventCategories = ['新車巡回', '受け入れ点検', '在庫点検', '納入作業', 'その他予定'];
  const serviceCategories = ['故障修理', '定期点検', '車検', 'フィールドキャンペーン'];
  
  const eventTasks = vTasks.filter(t => eventCategories.includes(t.category) || !serviceCategories.includes(t.category));
  const serviceTasks = vTasks.filter(t => serviceCategories.includes(t.category));
`;

content = content.replace("  return (\n    <div", missingCode + "\n  return (\n    <div");

fs.writeFileSync('src/views/VehicleListView.tsx', content);
