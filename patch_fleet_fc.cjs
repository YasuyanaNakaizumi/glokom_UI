const fs = require('fs');
let code = fs.readFileSync('src/views/FleetView.tsx', 'utf8');

// 1. Add expanded state
if (!code.includes('const [expandedFcVehicleId')) {
  code = code.replace(
    "const [fcVehicleFilter, setFcVehicleFilter] = useState(false);",
    "const [fcVehicleFilter, setFcVehicleFilter] = useState(false);\n  const [expandedFcVehicleId, setExpandedFcVehicleId] = useState<string | null>(null);"
  );
}

// 2. Add tasks array to fcVehicleStats
code = code.replace(
  "totalCount: number\n    }> = {};",
  "totalCount: number,\n      tasks: ServiceTask[]\n    }> = {};"
);

code = code.replace(
  "stats[v.id] = { vehicle: v, unexecutedCount: 0, overdueCount: 0, assignedCount: 0, completedAssignedCount: 0, totalCount: 0 };",
  "stats[v.id] = { vehicle: v, unexecutedCount: 0, overdueCount: 0, assignedCount: 0, completedAssignedCount: 0, totalCount: 0, tasks: [] };"
);

code = code.replace(
  "stats[v.id].totalCount++;",
  "stats[v.id].totalCount++;\n      stats[v.id].tasks.push(t);"
);

// We also need to add the ChevronDown/ChevronUp icon import.
if (!code.includes('ChevronDown')) {
  code = code.replace(
    "import { Search, Info, Settings, MoreHorizontal, UserPlus, CheckCircle, Calendar, FileText, AlertTriangle, ShieldCheck, X } from 'lucide-react';",
    "import { Search, Info, Settings, MoreHorizontal, UserPlus, CheckCircle, Calendar, FileText, AlertTriangle, ShieldCheck, X, ChevronDown, ChevronUp } from 'lucide-react';"
  );
}

fs.writeFileSync('src/views/FleetView.tsx', code);
