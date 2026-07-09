const fs = require('fs');
const file = 'src/views/DashboardView.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `import { Clock, CheckCircle, AlertTriangle, ChevronRight, Activity, Calendar, ShieldCheck, PenTool, ShieldAlert, FileSignature, CheckSquare as CheckSquareIcon } from 'lucide-react';`,
  `import { Clock, CheckCircle, AlertTriangle, ChevronRight, Activity, Calendar, ShieldCheck, PenTool, ShieldAlert, FileSignature, CheckSquare } from 'lucide-react';`
);

if (!content.includes('CheckSquare')) {
  content = content.replace(
    `import { Clock,`,
    `import { CheckSquare, Clock,`
  );
}

fs.writeFileSync(file, content);
