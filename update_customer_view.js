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

// 4. Wrap the columns in conditional
const colsStart = `<div className="flex flex-col xl:flex-row gap-6 h-[500px] xl:h-auto xl:flex-1 min-h-0 animate-in fade-in duration-200">`;
const colsEnd = `</div>\n               </div>\n            </div>`; // End of the columns + end of Customer Overview wrap

const newColsWrap = `
               {!detailVehicleId ? (
                 <div className="flex flex-col xl:flex-row gap-6 h-[500px] xl:h-auto xl:flex-1 min-h-0 animate-in fade-in duration-200">
`;

// It's safer to just replace everything from <div className="flex flex-col xl:flex-row ...> down to the end of selectedCustomer block.

