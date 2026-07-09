const fs = require('fs');
let content = fs.readFileSync('src/views/VehicleListView.tsx', 'utf8');

// 1. Remove viewMode state
content = content.replace(
  "  const [viewMode, setViewMode] = useState<'vehicle' | 'customer'>('vehicle');\n",
  ""
);

// 2. Remove groupedByCustomer block
const groupedByCustomerRegex = /  const groupedByCustomer = customers\.map[\s\S]*?\)\);\n\n/;
content = content.replace(groupedByCustomerRegex, '');

// 3. Update renderListItem customer condition
content = content.replace(
  "{viewMode === 'vehicle' && v.customerName && (",
  "{v.customerName && ("
);

// 4. Remove toggle buttons
const toggleButtonsRegex = /<div className="flex bg-slate-100 p-1 rounded-lg mb-4">[\s\S]*?<\/div>\n\n/;
content = content.replace(toggleButtonsRegex, '');

// 5. Replace list rendering
const listRenderingRegex = /<div className="flex-1 overflow-y-auto">[\s\S]*?(?=      \{\/\* Right Pane: Details \*\/)/;
const newListRendering = `<div className="flex-1 overflow-y-auto">
          {filteredVehicles.map(renderListItem)}
          {filteredVehicles.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">車両が見つかりません</div>
          )}
        </div>
`;
content = content.replace(listRenderingRegex, newListRendering);

fs.writeFileSync('src/views/VehicleListView.tsx', content);
