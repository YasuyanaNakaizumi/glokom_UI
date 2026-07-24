const fs = require('fs');
const path = './src/components/EditTaskModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Initialize scheduleCheckStaffIds to all staff
content = content.replace(
  "const [scheduleCheckStaffIds, setScheduleCheckStaffIds] = useState<string[]>([]);",
  "const [scheduleCheckStaffIds, setScheduleCheckStaffIds] = useState<string[]>(staff.map(s => s.id));"
);

// 2. We need to replace the vertical schedule with a horizontal one.
// Let's find the start of the schedule confirmation block
const startTag = '<div className="bg-slate-50 border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">';
const endTagStr = '      </div>\n    </div>\n  </div>\n'; // end of activeTab === 'assignment_date'

// Let's actually just replace everything from `スケジュールの確認` downwards in `assignment_date`
