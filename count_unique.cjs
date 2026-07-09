const fs = require('fs');
const code = fs.readFileSync('src/lib/mock.ts', 'utf8');

const taskBlock = code.substring(code.indexOf('INITIAL_TASKS'), code.indexOf('INITIAL_CONTRACTS') !== -1 ? code.indexOf('INITIAL_CONTRACTS') : code.length);

const vehicleIds = new Set();
const matches = [...taskBlock.matchAll(/vehicleId:\s*'([^']+)'[\s\S]*?category:\s*'フィールドキャンペーン'/g)];
for (const match of matches) {
  vehicleIds.add(match[1]);
}
console.log('Unique vehicles with FC tasks:', vehicleIds.size);
console.log('Vehicle IDs:', Array.from(vehicleIds));
