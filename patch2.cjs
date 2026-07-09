const fs = require('fs');
const path = './src/components/EditTaskModal.tsx';
let content = fs.readFileSync(path, 'utf8');

const regex = /<select\s+value=\{t\.reportFormatId\}[\s\S]*?<\/select>/;

const replacement = `<select 
                                value={t.reportFormatId}
                                onChange={(e) => {
                                  const newTasks = [...localTasks];
                                  newTasks[i] = { ...newTasks[i], reportFormatId: e.target.value };
                                  setLocalTasks(newTasks);
                                }}
                                className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 bg-slate-50 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
                              >
                                <option value="">-- 報告様式: 無設定 --</option>
                                {reportTemplates?.map((rt: any) => (
                                  <option key={rt.id} value={rt.id}>{rt.name}</option>
                                ))}
                              </select>
                              <select 
                                value={t.paidServiceId}
                                onChange={(e) => {
                                  const newTasks = [...localTasks];
                                  newTasks[i] = { ...newTasks[i], paidServiceId: e.target.value };
                                  setLocalTasks(newTasks);
                                }}
                                className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 bg-slate-50 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
                              >
                                <option value="">-- 適用補償・有償: 無設定 --</option>
                                <optgroup label="有償サービス">
                                  <option value="有償定期メンテナンス">有償定期メンテナンス</option>
                                  <option value="有償修理">有償修理</option>
                                </optgroup>
                                <optgroup label="補償プラン (無償)">
                                  {contracts?.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                  ))}
                                  <option value="補償">その他補償</option>
                                </optgroup>
                              </select>`;

if(regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(path, content, 'utf8');
  console.log("Replaced!");
} else {
  console.log("Not found.");
}
