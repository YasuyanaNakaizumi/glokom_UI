const fs = require('fs');
const path = './src/views/ScheduleView.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add state variables for orientation and verticalViewMode
const stateVarsMatch = `  const [viewMode, setViewMode] = useState<'business' | '24h'>('business');`;
const newStateVars = `  const [viewMode, setViewMode] = useState<'business' | '24h'>('business');
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('vertical');
  const [verticalViewMode, setVerticalViewMode] = useState<'day' | 'week'>('day');`;

if (content.includes(stateVarsMatch) && !content.includes("orientation, setOrientation")) {
    content = content.replace(stateVarsMatch, newStateVars);
}

// 2. We need to add the buttons in the header
const controlsMatch = `<div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm shrink-0">
            <button
              onClick={() => setViewMode('business')}
              className={cn("px-4 py-1.5 text-sm font-bold rounded-md transition-colors", viewMode === 'business' ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-700")}
            >標準(8-20)</button>
            <button
              onClick={() => setViewMode('24h')}
              className={cn("px-4 py-1.5 text-sm font-bold rounded-md transition-colors", viewMode === '24h' ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-700")}
            >24H</button>
          </div>`;

const newControls = `<div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm shrink-0">
            <button
              onClick={() => setOrientation('horizontal')}
              className={cn("px-4 py-1.5 text-sm font-bold rounded-md transition-colors", orientation === 'horizontal' ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-700")}
            >横表示</button>
            <button
              onClick={() => setOrientation('vertical')}
              className={cn("px-4 py-1.5 text-sm font-bold rounded-md transition-colors", orientation === 'vertical' ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-700")}
            >縦表示</button>
          </div>
          {orientation === 'vertical' && (
            <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm shrink-0">
              <button
                onClick={() => setVerticalViewMode('day')}
                className={cn("px-4 py-1.5 text-sm font-bold rounded-md transition-colors", verticalViewMode === 'day' ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-700")}
              >日表示</button>
              <button
                onClick={() => setVerticalViewMode('week')}
                className={cn("px-4 py-1.5 text-sm font-bold rounded-md transition-colors", verticalViewMode === 'week' ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-700")}
              >週表示</button>
            </div>
          )}
          ${controlsMatch}`;

if (content.includes(controlsMatch) && !content.includes("orientation === 'vertical'")) {
    content = content.replace(controlsMatch, newControls);
}

fs.writeFileSync(path, content, 'utf8');
