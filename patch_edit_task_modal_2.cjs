const fs = require('fs');
let content = fs.readFileSync('src/components/EditTaskModal.tsx', 'utf-8');

content = content.replace(
  "const { tasks, updateTask, deleteTask, staff, tools, vehicles, contracts, parking, vehicleMasters, reportTemplates } = useApp();",
  "const { tasks, updateTask, addTask, deleteTask, staff, tools, vehicles, contracts, parking, vehicleMasters, reportTemplates, alerts } = useApp();"
);

const onSaveLogic = `onSave={(newWorks, selectedTaskIds, selectedAlertIds) => {
            const newLinkedIds = [...(task.linkedTaskIds || [])];
            
            // 1. Process existing tasks
            selectedTaskIds.forEach(id => {
              if (!newLinkedIds.includes(id)) newLinkedIds.push(id);
              const target = tasks.find(t => t.id === id);
              if (target) {
                // Copy info and link back
                updateTask(id, {
                  linkedTaskIds: Array.from(new Set([...(target.linkedTaskIds || []), task.id])),
                  toolIds: Array.from(new Set([...(target.toolIds || []), ...(task.toolIds || [])])),
                  assignments: task.assignments || target.assignments,
                });
              }
            });

            // 2. Process alerts (convert to task and link)
            selectedAlertIds.forEach(id => {
              const alert = alerts.find(a => a.id === id);
              if (alert) {
                const newTaskId = 'task-from-alert-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                newLinkedIds.push(newTaskId);
                addTask({
                  title: alert.title || alert.description,
                  category: task.category,
                  urgency: 'medium',
                  deadline: task.deadline,
                  targetModelName: alert.targetModelName,
                  vehicleId: alert.vehicleId,
                  description: alert.description,
                  linkedTaskIds: [task.id],
                  toolIds: task.toolIds || [],
                  assignments: task.assignments || []
                });
              }
            });

            // 3. Process new blank works
            newWorks.forEach(w => {
              const newTaskId = 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
              newLinkedIds.push(newTaskId);
              
              addTask({
                title: w.title,
                category: w.category,
                urgency: 'low',
                deadline: task.deadline,
                reportFormatId: w.reportFormatId,
                paidServiceId: w.paidServiceId,
                linkedTaskIds: [task.id],
                toolIds: task.toolIds || [],
                assignments: task.assignments || []
              });
            });

            // Update this task
            updateTask(task.id, { linkedTaskIds: newLinkedIds });
            setShowAddWorkModal(false);
          }}`;

content = content.replace(/onSave=\{\(newWorks, selectedTaskIds, selectedAlertIds\) => \{[\s\S]*?setShowAddWorkModal\(false\);\s*\}\}/, onSaveLogic);

fs.writeFileSync('src/components/EditTaskModal.tsx', content, 'utf-8');
console.log('patched EditTaskModal.tsx 2');
