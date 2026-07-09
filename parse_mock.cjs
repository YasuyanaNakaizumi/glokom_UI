const fs = require('fs');
const code = fs.readFileSync('src/lib/mock.ts', 'utf8');

// just grep lines with id: 't_fc_
const lines = code.split('\n');
const vehicleIds = new Set();
for (const line of lines) {
  if (line.includes("'フィールドキャンペーン'")) {
    const vMatch = line.match(/vehicleId:\s*'([^']+)'/);
    if (vMatch) {
      vehicleIds.add(vMatch[1]);
    }
  }
}
console.log('Unique vehicles with FC tasks:', vehicleIds.size);
console.log('Vehicle IDs:', Array.from(vehicleIds));
