const fs = require('fs');
const path = './src/components/EditTaskModal.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /const addAssignment = \(\) => \{[\s\S]*?const syncAssignments = \(\) => \{[\s\S]*?\}\s*\};\s*/,
  `const addAssignmentBlock = () => {
    setAssignmentBlocks([...assignmentBlocks, { id: Math.random().toString(), staffIds: [], startDate: format(new Date(), 'yyyy-MM-dd'), startTime: '09:00', endDate: format(new Date(), 'yyyy-MM-dd'), endTime: '18:00' }]);
  };
  
  const removeAssignmentBlock = (id: string) => {
    setAssignmentBlocks(assignmentBlocks.filter(b => b.id !== id));
  };

  const updateAssignmentBlock = (id: string, field: string, value: any) => {
    setAssignmentBlocks(assignmentBlocks.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const toggleStaffInBlock = (blockId: string, staffId: string) => {
    setAssignmentBlocks(assignmentBlocks.map(b => {
      if (b.id !== blockId) return b;
      if (b.staffIds.includes(staffId)) {
        return { ...b, staffIds: b.staffIds.filter(id => id !== staffId) };
      }
      return { ...b, staffIds: [...b.staffIds, staffId] };
    }));
  };
  `
);

content = content.replace(
  /const handleSave = \(\) => \{[\s\S]*?updateTask\(taskId, \{[\s\S]*?\}\);/m,
  `const handleSave = () => {
    if (taskId) {
      const flatAssignments: any[] = [];
      const allStaffIds = new Set<string>();
      assignmentBlocks.forEach(b => {
        b.staffIds.forEach(sid => {
          allStaffIds.add(sid);
          flatAssignments.push({
            staffId: sid,
            plannedStart: b.startDate ? \`\${b.startDate}T\${b.startTime}:00Z\` : undefined,
            plannedEnd: b.endDate ? \`\${b.endDate}T\${b.endTime}:00Z\` : undefined,
          });
        });
      });
      
      updateTask(taskId, {
        assignments: flatAssignments,
        staffIds: Array.from(allStaffIds),
        deadline: assignmentBlocks.length > 0 && assignmentBlocks[0].endDate ? \`\${assignmentBlocks[0].endDate}T\${assignmentBlocks[0].endTime}:00Z\` : task?.deadline
      });`
);

fs.writeFileSync(path, content, 'utf8');
