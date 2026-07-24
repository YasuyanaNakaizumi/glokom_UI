const fs = require('fs');
const file = 'src/components/EditTaskModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `<div className="flex items-center gap-2">
                              <input 
                                type="text" 
                                value={t.name}`;

const replacement = `<div className="flex items-center gap-2">
                              {t.category && (
                                <span className="text-xs px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold whitespace-nowrap">
                                  {t.category}
                                </span>
                              )}
                              <input 
                                type="text" 
                                value={t.name}`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
console.log('patched EditTaskModal');
