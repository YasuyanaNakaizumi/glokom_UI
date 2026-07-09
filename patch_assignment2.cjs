const fs = require('fs');
const path = './src/components/EditTaskModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update state definition
content = content.replace(
  /const \[assignments, setAssignments\] = useState<Array<\{staffId: string, startDate: string, startTime: string, endDate: string, endTime: string\}>>\(\(\) => \{[\s\S]*?\}\);/m,
  `const [assignmentBlocks, setAssignmentBlocks] = useState<Array<{id: string, staffIds: string[], startDate: string, startTime: string, endDate: string, endTime: string}>>(() => {
    if (task?.assignments && task.assignments.length > 0) {
      // Group by exact same time range
      const blocks: any[] = [];
      task.assignments.forEach(a => {
        const startDate = a.plannedStart ? a.plannedStart.split('T')[0] : '';
        const startTime = a.plannedStart && a.plannedStart.includes('T') ? a.plannedStart.split('T')[1].slice(0, 5) : '';
        const endDate = a.plannedEnd ? a.plannedEnd.split('T')[0] : '';
        const endTime = a.plannedEnd && a.plannedEnd.includes('T') ? a.plannedEnd.split('T')[1].slice(0, 5) : '';
        
        const existing = blocks.find(b => b.startDate === startDate && b.startTime === startTime && b.endDate === endDate && b.endTime === endTime);
        if (existing) {
          if (!existing.staffIds.includes(a.staffId)) {
            existing.staffIds.push(a.staffId);
          }
        } else {
          blocks.push({ id: Math.random().toString(), staffIds: [a.staffId], startDate, startTime, endDate, endTime });
        }
      });
      return blocks;
    }
    // Fallback to legacy
    if (task?.staffIds && task.staffIds.length > 0) {
      return [{
        id: '1',
        staffIds: [...task.staffIds],
        startDate: task?.deadline ? task.deadline.split('T')[0] : format(new Date(), 'yyyy-MM-dd'),
        startTime: '09:00',
        endDate: task?.deadline ? task.deadline.split('T')[0] : format(new Date(), 'yyyy-MM-dd'),
        endTime: '18:00'
      }];
    }
    return [{ id: '1', staffIds: [], startDate: format(new Date(), 'yyyy-MM-dd'), startTime: '09:00', endDate: format(new Date(), 'yyyy-MM-dd'), endTime: '18:00' }];
  });

  const [scheduleViewDate, setScheduleViewDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [scheduleCheckStaffIds, setScheduleCheckStaffIds] = useState<string[]>([]);
`
);

fs.writeFileSync(path, content, 'utf8');
