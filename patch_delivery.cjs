const fs = require('fs');
const file = 'src/components/SalesProcessModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `import { X, ExternalLink, Plus, Users, Car, Trash2, FileText, Download, UploadCloud, CheckCircle, Package, ShieldCheck, ClipboardList, ChevronRight, MessageSquare, Send, Check, MapPin } from 'lucide-react';`,
  `import { X, ExternalLink, Plus, Users, Car, Trash2, FileText, Download, UploadCloud, CheckCircle, Package, ShieldCheck, ClipboardList, ChevronRight, MessageSquare, Send, Check, MapPin, AlertTriangle } from 'lucide-react';`
);

const target = `                <TaskConfigSection 
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
                />

                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={() => toggleComplete('deliveryProcessCompleted')}
                    className={\`px-6 py-3 rounded-lg font-bold flex items-center transition shadow-sm \${quote.deliveryProcessCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'}\`}
                  >
                    {quote.deliveryProcessCompleted ? (
                      <><CheckCircle className="w-5 h-5 mr-2 text-emerald-600" /> 納入作業 完了済</>
                    ) : (
                      <><Check className="w-5 h-5 mr-2" /> このステップを完了にする</>
                    )}
                  </button>
                </div>`;

const replacement = `                {quote.stockPeriod?.isEndDateUndecided ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center text-amber-800">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-amber-500" />
                    <h4 className="font-bold text-lg mb-2">納入作業の登録はできません</h4>
                    <p className="text-sm font-medium">在庫期間が「未定」に設定されているため、納入作業の計画を立てることができません。<br/>納入作業を登録するには、在庫期間のタブで期間未定のチェックを外してください。</p>
                  </div>
                ) : (
                  <>
                    <TaskConfigSection 
                      title="納入作業・現場設定" 
                      defaultTasks={["納入前点検", "客先説明", "引渡し"]} 
                      tools={tools} 
                      staff={staff} 
                      isReception={false}
                      date={quote.deliveryWork?.date || ''}
                      setDate={(d) => setQuote({...quote, deliveryWork: {...quote.deliveryWork!, date: d}, stockPeriod: {...quote.stockPeriod!, endDate: d}})}
                      staffIds={quote.deliveryWork?.staffIds || []}
                      setStaffIds={(ids) => setQuote({...quote, deliveryWork: {...quote.deliveryWork!, staffIds: ids}})}
                      selectedParkingIds={deliveryParkingIds}
                      toggleParking={toggleDeliveryParking}
                      externalTasks={deliveryTasks}
                      setExternalTasks={setDeliveryTasks}
                    />

                    <div className="mt-8 flex justify-end">
                      <button 
                        onClick={() => toggleComplete('deliveryProcessCompleted')}
                        className={\`px-6 py-3 rounded-lg font-bold flex items-center transition shadow-sm \${quote.deliveryProcessCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'}\`}
                      >
                        {quote.deliveryProcessCompleted ? (
                          <><CheckCircle className="w-5 h-5 mr-2 text-emerald-600" /> 納入作業 完了済</>
                        ) : (
                          <><Check className="w-5 h-5 mr-2" /> このステップを完了にする</>
                        )}
                      </button>
                    </div>
                  </>
                )}`;

content = content.replace(target, replacement);

fs.writeFileSync(file, content);
