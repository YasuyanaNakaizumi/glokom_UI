const fs = require('fs');

let content = fs.readFileSync('src/components/SalesProcessModal.tsx', 'utf8');

const receiveOld = `<div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                  <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">受入情報の入力</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">受入予定日</label>
                      <input type="date" value={quote.receiveWork?.date || ''} onChange={e => setQuote({...quote, receiveWork: {...quote.receiveWork!, date: e.target.value}})} className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">担当者</label>
                      <select className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-indigo-500">
                        <option value="">-- 未定 --</option>
                        {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>`;

const receiveNew = `<TaskConfigSection 
                  title="受入作業・現場設定" 
                  defaultTasks={["受入点検", "洗車"]} 
                  tools={tools} 
                  staff={staff} 
                  isReception={false}
                  date={quote.receiveWork?.date || ''}
                  setDate={(d) => setQuote({...quote, receiveWork: {...quote.receiveWork!, date: d}})}
                  staffIds={quote.receiveWork?.staffIds || []}
                  setStaffIds={(ids) => setQuote({...quote, receiveWork: {...quote.receiveWork!, staffIds: ids}})}
                  selectedParkingIds={receiveParkingIds}
                  toggleParking={toggleReceiveParking}
                  externalTasks={receiveTasks}
                  setExternalTasks={setReceiveTasks}
                />`;

const deliveryOld = `<div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                  <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">納入情報の入力</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">納入予定日</label>
                      <input type="date" value={quote.deliveryWork?.date || ''} onChange={e => setQuote({...quote, deliveryWork: {...quote.deliveryWork!, date: e.target.value}})} className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">担当者</label>
                      <select className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-indigo-500">
                        <option value="">-- 未定 --</option>
                        {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>`;

const deliveryNew = `<TaskConfigSection 
                  title="納入作業・現場設定" 
                  defaultTasks={["納入前点検", "客先説明", "引渡し"]} 
                  tools={tools} 
                  staff={staff} 
                  isReception={false}
                  date={quote.deliveryWork?.date || ''}
                  setDate={(d) => setQuote({...quote, deliveryWork: {...quote.deliveryWork!, date: d}})}
                  staffIds={quote.deliveryWork?.staffIds || []}
                  setStaffIds={(ids) => setQuote({...quote, deliveryWork: {...quote.deliveryWork!, staffIds: ids}})}
                  selectedParkingIds={deliveryParkingIds}
                  toggleParking={toggleDeliveryParking}
                  externalTasks={deliveryTasks}
                  setExternalTasks={setDeliveryTasks}
                />`;

content = content.replace(receiveOld, receiveNew);
content = content.replace(deliveryOld, deliveryNew);

fs.writeFileSync('src/components/SalesProcessModal.tsx', content);
