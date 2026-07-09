const fs = require('fs');
const code = fs.readFileSync('src/lib/mock.ts', 'utf8');

const taskBlock = code.substring(code.indexOf('INITIAL_TASKS'), code.indexOf('INITIAL_CONTRACTS') !== -1 ? code.indexOf('INITIAL_CONTRACTS') : code.length);

const fcMatches = [...taskBlock.matchAll(/category:\s*'フィールドキャンペーン'/g)];
console.log('FC tasks in mock.ts:', fcMatches.length);

