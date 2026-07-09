const fs = require('fs');
let content = fs.readFileSync('src/components/QuoteEditModal.tsx', 'utf8');

const oldHeader = `          <div className="flex justify-between items-start mb-4 gap-4">
            <div className="flex-1">
              <h2 className="text-lg md:text-xl font-bold leading-tight">
                契約及び受入納車管理
              </h2>
              <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-3">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-500">ステータス:</span>
                  <select 
                    value={quote.status}
                    onChange={(e) => changeStatus(e.target.value as SalesQuote['status'])}
                    className="text-sm font-bold bg-indigo-50 text-indigo-700 border-none rounded py-1 pl-2 pr-8"
                  >
                    <option value="見積作成中">見積作成中</option>
                    <option value="見積提示済">見積提示済</option>
                    <option value="注文書作成中">注文書作成中</option>
                    <option value="社内承認回付中">社内承認回付中</option>
                    <option value="承認済・本発注">承認済・本発注</option>
                    <option value="出庫手配済">出庫手配済</option>
                  </select>
                </div>
                <div className="flex items-center text-sm bg-white border border-slate-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 overflow-hidden">
                  <input type="text" value={quote.customerName || ''} onChange={e => setQuote({...quote, customerName: e.target.value})} className="font-bold text-slate-800 bg-transparent border-0 focus:ring-0 p-0 py-1.5 pr-3 w-full sm:w-[160px] text-sm outline-none" placeholder="未入力" />
                </div>
                <div className="flex items-center text-sm bg-white border border-slate-300 rounded-md shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 overflow-hidden">
                  <span className="text-gray-500 pl-3 py-1.5 mr-1 whitespace-nowrap">機種:</span>
                  <input type="text" value={quote.targetModelName || ''} onChange={e => setQuote({...quote, targetModelName: e.target.value})} className="font-bold text-slate-800 bg-transparent border-0 focus:ring-0 p-0 py-1.5 pr-3 w-full sm:w-[160px] text-sm outline-none" placeholder="未入力" />
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full shrink-0"><X className="w-6 h-6" /></button>
          </div>`;

const newHeader = `          <div className="flex justify-between items-start mb-4 gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-lg md:text-xl font-bold leading-tight">
                  契約及び受入納車管理
                </h2>
                <div className="flex gap-2 items-center">
                   <span className="px-2.5 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-md flex items-center">
                     <Users className="w-3 h-3 mr-1" />
                     {quote.customerName || '顧客未定'}
                   </span>
                   <span className="px-2.5 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-md flex items-center">
                     <Car className="w-3 h-3 mr-1" />
                     {quote.targetModelName || '機種未定'}
                   </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full shrink-0"><X className="w-6 h-6" /></button>
          </div>`;

content = content.replace(oldHeader, newHeader);
content = content.replace('X, ExternalLink, Plus,', 'X, ExternalLink, Plus, Users, Car,');

fs.writeFileSync('src/components/QuoteEditModal.tsx', content);
