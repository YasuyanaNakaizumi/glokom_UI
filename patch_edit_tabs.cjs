const fs = require('fs');
const file = 'src/components/EditTaskModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);`,
  `  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);\n  const [showAddSubTaskModal, setShowAddSubTaskModal] = useState(false);\n  const subTasks = tasks.filter(t => t.parentId === taskId);`
);

content = content.replace(
  `  const [activeTab, setActiveTab] = useState<'tasks_parts_tools' | 'assignment_date' | 'delivery_workspace' | 'chat'>('tasks_parts_tools');`,
  `  const [activeTab, setActiveTab] = useState<'tasks_parts_tools' | 'assignment_date' | 'delivery_workspace' | 'sub_tasks' | 'chat'>('tasks_parts_tools');`
);

content = content.replace(
  `              <button 
                onClick={() => setActiveTab('chat')}`,
  `              <button 
                onClick={() => setActiveTab('sub_tasks')}
                className={cn("w-auto md:w-full shrink-0 flex items-center p-3 rounded-lg text-left text-sm font-bold transition-colors", activeTab === 'sub_tasks' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700')}
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                小タスク
                {subTasks.length > 0 && <span className="ml-auto bg-slate-200 text-slate-700 text-xs py-0.5 px-2 rounded-full">{subTasks.length}</span>}
              </button>
              <button 
                onClick={() => setActiveTab('chat')}`
);

fs.writeFileSync(file, content);
