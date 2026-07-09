const fs = require('fs');
const path = './src/views/TasksView.tsx';
let content = fs.readFileSync(path, 'utf8');

// We need ChevronRight and ChevronDown
content = content.replace(
  /import \{([^}]+)\} from 'lucide-react';/,
  (match, p1) => {
    let imports = p1.split(',').map(s => s.trim());
    if (!imports.includes('ChevronRight')) imports.push('ChevronRight');
    if (!imports.includes('ChevronDown')) imports.push('ChevronDown');
    return `import { ${imports.join(', ')} } from 'lucide-react';`;
  }
);

fs.writeFileSync(path, content, 'utf8');
