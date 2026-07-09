const fs = require('fs');

let lines = fs.readFileSync('src/views/VehicleListView.tsx', 'utf8').split('\n');
let inTabs = false;
let newLines = [];
let closingBracketsToRemove = [214, 252, 290, 344]; // Approximate, let's find dynamically instead.

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{/* Tabs */}')) {
    inTabs = true;
    continue;
  }
  if (inTabs) {
    if (lines[i].includes('</div>')) {
      inTabs = false;
    }
    continue;
  }
  
  if (lines[i].includes("{activeTab === 'info' && (")) continue;
  if (lines[i].includes("{activeTab === 'events' && (")) continue;
  if (lines[i].includes("{activeTab === 'services' && (")) continue;
  if (lines[i].includes("{activeTab === 'contracts' && (")) continue;

  newLines.push(lines[i]);
}

let result = newLines.join('\n');
result = result.replace(
  "const [activeTab, setActiveTab] = useState<'info' | 'events' | 'services' | 'contracts'>('info');", 
  ""
);
result = result.replace(
  "setActiveTab('info');",
  ""
);

fs.writeFileSync('src/views/VehicleListView.tsx', result);
