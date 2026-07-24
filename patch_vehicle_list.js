const fs = require('fs');
const content = fs.readFileSync('src/views/VehicleListView.tsx', 'utf8');

let newContent = content.replace(
  "const [activeTab, setActiveTab] = useState<'info' | 'tasks' | 'contracts'>('info');",
  "const [activeTab, setActiveTab] = useState<'info' | 'events' | 'services' | 'contracts'>('info');"
);

newContent = newContent.replace(
  "const vTasks = selectedVehicle ? tasks.filter(t => t.vehicleId === selectedVehicle.id).sort((a,b) => {",
  `const vTasks = selectedVehicle ? tasks.filter(t => t.vehicleId === selectedVehicle.id).sort((a,b) => {
    const dateA = a.deadline || a.startDate || '';
    const dateB = b.deadline || b.startDate || '';
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  }) : [];
  
  const eventCategories = ['新車巡回', '受け入れ点検', '在庫点検', '納入作業', 'その他予定'];
  const serviceCategories = ['故障修理', '定期点検', '車検', 'フィールドキャンペーン'];
  
  const eventTasks = vTasks.filter(t => eventCategories.includes(t.category) || !serviceCategories.includes(t.category));
  const serviceTasks = vTasks.filter(t => serviceCategories.includes(t.category));
  
  // ignore this to replace the existing sort block`
);

// We need to carefully replace the old vTasks sort block.
