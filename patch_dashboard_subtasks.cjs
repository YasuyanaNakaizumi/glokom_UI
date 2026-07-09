const fs = require('fs');
const file = 'src/views/DashboardView.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `  const patrolTasks = tasks.filter((t) => t.category === "新車巡回" && !t.isApproved);`,
  `  const patrolTasks = tasks.filter((t) => t.category === "新車巡回" && !t.isApproved && !t.parentId);`
);

content = content.replace(
  `  const fcTasks = tasks.filter((t) => t.category === "フィールドキャンペーン" && !t.isApproved);`,
  `  const fcTasks = tasks.filter((t) => t.category === "フィールドキャンペーン" && !t.isApproved && !t.parentId);`
);

content = content.replace(
  `  const repairTasks = tasks.filter((t) => t.category === "故障修理" && !t.isApproved);`,
  `  const repairTasks = tasks.filter((t) => t.category === "故障修理" && !t.isApproved && !t.parentId);`
);

content = content.replace(
  `  const maintenanceTasks = tasks.filter((t) => t.category === "定期点検" && !t.isApproved);`,
  `  const maintenanceTasks = tasks.filter((t) => t.category === "定期点検" && !t.isApproved && !t.parentId);`
);

content = content.replace(
  `  const inspectionTasks = tasks.filter((t) => t.category === "車検" && !t.isApproved);`,
  `  const inspectionTasks = tasks.filter((t) => t.category === "車検" && !t.isApproved && !t.parentId);`
);

fs.writeFileSync(file, content);
