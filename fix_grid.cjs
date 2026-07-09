const fs = require('fs');
let code = fs.readFileSync('src/components/VehicleDetailPanels.tsx', 'utf8');

const targetStr = `{/* LOWER 3 PANELS IN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* LOWER 3 PANELS IN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`;

const replaceStr = `{/* LOWER 3 PANELS IN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">`;

if (code.includes(targetStr)) {
  code = code.replace(targetStr, replaceStr);
  
  // also fix closing tags at the bottom. We have one extra closing tag probably.
  // Wait, let's just see how many closing tags are at the bottom.
  
  fs.writeFileSync('src/components/VehicleDetailPanels.tsx', code);
  console.log('Fixed double grid');
} else {
  console.log('Target string not found');
}
