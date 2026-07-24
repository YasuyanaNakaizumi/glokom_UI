const fs = require('fs');
const path = './src/views/MasterView.tsx';
let content = fs.readFileSync(path, 'utf8');

// Imports
content = content.replace(
  "import { CustomerMasterSection } from '../components/CustomerMasterSection';",
  "import { CustomerMasterSection } from '../components/CustomerMasterSection';\nimport { ToolEditModal } from '../components/ToolEditModal';\nimport { VehicleMasterEditModal } from '../components/VehicleMasterEditModal';"
);

// State additions
content = content.replace(
  "  const [editingReportTemplate, setEditingReportTemplate] = useState<MechanicReportTemplate | 'new' | null>(null);",
  "  const [editingReportTemplate, setEditingReportTemplate] = useState<MechanicReportTemplate | 'new' | null>(null);\n  const [parkingTab, setParkingTab] = useState<'駐車場' | '作業場' | '工具置き場' | '書物棚'>('駐車場');\n  const [editingTool, setEditingTool] = useState<any | 'new' | null>(null);\n  const [editingVehicle, setEditingVehicle] = useState<any | 'new' | null>(null);"
);

fs.writeFileSync(path, content, 'utf8');
