const fs = require('fs');
const code = fs.readFileSync('src/lib/mock.ts', 'utf8');

const taskBlock = code.substring(code.indexOf('INITIAL_TASKS'), code.indexOf('INITIAL_CONTRACTS') !== -1 ? code.indexOf('INITIAL_CONTRACTS') : code.length);

const fcMatches = [...taskBlock.matchAll(/category:\s*'フィールドキャンペーン'/g)];
console.log('FC tasks count:', fcMatches.length);

const vehiclesBlock = code.substring(code.indexOf('INITIAL_VEHICLES'), code.indexOf('INITIAL_TASKS'));
const vMatches = [...vehiclesBlock.matchAll(/id:\s*'v\d+'/g)];
console.log('Vehicles count:', vMatches.length);
