const fs = require('fs');
const file = 'src/components/SalesProcessModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">在庫開始日</label>
                      <input type="date" value={quote.stockPeriod?.startDate || ''} onChange={e => setQuote({...quote, stockPeriod: {...quote.stockPeriod!, startDate: e.target.value}})} className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">在庫終了予定日</label>
                      <input type="date" value={quote.stockPeriod?.endDate || ''} onChange={e => setQuote({...quote, stockPeriod: {...quote.stockPeriod!, endDate: e.target.value}})} className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-indigo-500" />
                    </div>`;

const replacement = `                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">在庫開始日</label>
                      <input type="date" value={quote.stockPeriod?.startDate || quote.receiveWork?.date || ''} onChange={e => setQuote({...quote, stockPeriod: {...quote.stockPeriod!, startDate: e.target.value}})} className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-indigo-500" />
                      <p className="text-xs text-slate-500 mt-1">※開始日は受け入れ点検日と同じ値が入ることに注意してください</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-bold text-slate-700">在庫終了予定日</label>
                        <label className="flex items-center text-sm text-slate-600 cursor-pointer">
                          <input type="checkbox" checked={quote.stockPeriod?.isEndDateUndecided || false} onChange={e => setQuote({...quote, stockPeriod: {...quote.stockPeriod!, isEndDateUndecided: e.target.checked, endDate: e.target.checked ? '' : quote.stockPeriod?.endDate || ''}})} className="mr-2 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                          期間未定
                        </label>
                      </div>
                      <input type="date" disabled={quote.stockPeriod?.isEndDateUndecided} value={quote.stockPeriod?.endDate || ''} onChange={e => setQuote({...quote, stockPeriod: {...quote.stockPeriod!, endDate: e.target.value}})} className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400" />
                    </div>`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
