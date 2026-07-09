const fs = require('fs');
const path = './src/components/EditTaskModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add assignments state
content = content.replace(
  /const \[staffIds, setStaffIds\] = useState<string\[\]>\(task\?\.staffIds \|\| \(task\?\.staffId \? \[task\.staffId\] : \[\]\)\);/,
  `const [staffIds, setStaffIds] = useState<string[]>(task?.staffIds || (task?.staffId ? [task.staffId] : []));
  const [scheduleDate, setScheduleDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [assignments, setAssignments] = useState<Array<{staffId: string, startDate: string, startTime: string, endDate: string, endTime: string}>>(() => {
    if (task?.assignments && task.assignments.length > 0) {
      return task.assignments.map(a => ({
        staffId: a.staffId,
        startDate: a.plannedStart ? a.plannedStart.split('T')[0] : '',
        startTime: a.plannedStart && a.plannedStart.includes('T') ? a.plannedStart.split('T')[1].slice(0, 5) : '',
        endDate: a.plannedEnd ? a.plannedEnd.split('T')[0] : '',
        endTime: a.plannedEnd && a.plannedEnd.includes('T') ? a.plannedEnd.split('T')[1].slice(0, 5) : ''
      }));
    }
    // Fallback to legacy
    if (task?.staffIds && task.staffIds.length > 0) {
      return task.staffIds.map(id => ({
        staffId: id,
        startDate: task?.deadline ? task.deadline.split('T')[0] : '',
        startTime: '09:00',
        endDate: task?.deadline ? task.deadline.split('T')[0] : '',
        endTime: '18:00'
      }));
    }
    return [];
  });

  const addAssignment = () => {
    setAssignments([...assignments, { staffId: '', startDate: scheduleDate, startTime: '09:00', endDate: scheduleDate, endTime: '12:00' }]);
  };
  
  const removeAssignment = (index: number) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };
  
  const syncAssignments = () => {
    if (assignments.length > 0) {
      const first = assignments[0];
      setAssignments(assignments.map(a => ({
        ...a,
        startDate: first.startDate,
        startTime: first.startTime,
        endDate: first.endDate,
        endTime: first.endTime
      })));
    }
  };`
);

fs.writeFileSync(path, content, 'utf8');
