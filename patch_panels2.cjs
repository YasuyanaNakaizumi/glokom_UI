const fs = require('fs');
let code = fs.readFileSync('src/components/VehicleDetailPanels.tsx', 'utf8');

const targetStr = `{/* 2. EVENTS */}`;
const replaceStr = `{/* LOWER 3 PANELS IN GRID */}\n      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">\n      {/* 2. EVENTS */}`;

code = code.replace(targetStr, replaceStr);

const endStr = `    </div>\n  );\n};\n`;
const replaceEndStr = `    </div>\n    </div>\n  );\n};\n`;
if (code.endsWith(endStr)) {
  code = code.substring(0, code.length - endStr.length) + replaceEndStr;
}

fs.writeFileSync('src/components/VehicleDetailPanels.tsx', code);
