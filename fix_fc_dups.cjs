const fs = require('fs');
const code = fs.readFileSync('src/lib/mock.ts', 'utf8');

const lines = code.split('\n');
const seenIds = new Set();
const newLines = [];

for (const line of lines) {
  const match = line.match(/id:\s*'([^']+)'/);
  if (match) {
    const id = match[1];
    if (seenIds.has(id) && id.startsWith('t_fc_')) {
      continue; // Skip duplicates for FC tasks
    }
    seenIds.add(id);
  }
  newLines.push(line);
}

fs.writeFileSync('src/lib/mock.ts', newLines.join('\n'));
console.log('Fixed duplicates in mock.ts');
