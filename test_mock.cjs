require('ts-node/register');
const { INITIAL_TASKS, INITIAL_VEHICLES } = require('./src/lib/mock.ts');

const fcTasks = INITIAL_TASKS.filter(t => t.category === 'フィールドキャンペーン');
const vIds = new Set(fcTasks.map(t => t.vehicleId));
console.log('FC tasks count:', fcTasks.length);
console.log('Vehicles with FC tasks count:', vIds.size);
console.log('Vehicle IDs:', Array.from(vIds));
