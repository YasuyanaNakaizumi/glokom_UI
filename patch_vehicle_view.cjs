const fs = require('fs');

let code = fs.readFileSync('src/views/VehicleListView.tsx', 'utf8');

if (!code.includes('VehicleDetailPanels')) {
  code = code.replace("import { Vehicle } from '../types';", "import { Vehicle } from '../types';\nimport { VehicleDetailPanels } from '../components/VehicleDetailPanels';");
}

const startTag = '{/* TAB: INFO */}';
const endTag = '</div>\n\n            </div>\n          </div>\n        ) : (';

const startIndex = code.indexOf(startTag);
const endIndex = code.indexOf(endTag);

if (startIndex !== -1 && endIndex !== -1) {
  const replaceStr = '<VehicleDetailPanels vehicle={selectedVehicle} />\n';
  const before = code.substring(0, startIndex);
  const after = code.substring(endIndex);
  code = before + replaceStr + after;
  fs.writeFileSync('src/views/VehicleListView.tsx', code);
  console.log('Patched VehicleListView.tsx');
} else {
  console.log('Could not find tags in VehicleListView.tsx');
  console.log(startIndex, endIndex);
}

