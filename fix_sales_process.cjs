const fs = require('fs');
const file = 'src/components/SalesProcessModal.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('const [isInitialSetup, setIsInitialSetup]')) {
  content = content.replace(
    `const [quote, setQuote] = useState<Partial<SalesQuote>>({`,
    `const [isInitialSetup, setIsInitialSetup] = useState(!quoteId);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [quote, setQuote] = useState<Partial<SalesQuote>>({`
  );

  const initialSetupUI = `
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm rounded-xl">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center text-rose-600 mb-4">
              <Trash2 className="w-6 h-6 mr-2" />
              <h3 className="font-bold text-lg">案件の削除</h3>
            </div>
            <p className="text-slate-600 text-sm mb-6 font-medium">
              この案件を削除しますか？<br/>この操作は取り消せません。
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                キャンセル
              </button>
              <button 
                onClick={() => {
                  if (quoteId) {
                    const { salesQuotes, deleteSalesQuote } = require('../context/AppContext'); // This is hacky, but we can call it from the hook
                  }
                  // We need deleteSalesQuote from context! Let's just use it below
                }}
                className="px-4 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition shadow-sm"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {isInitialSetup ? (
        <div className="bg-white md:rounded-xl shadow-2xl w-full max-w-md p-8 flex flex-col relative overflow-hidden animate-in fade-in zoom-in duration-200">
           <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition"><X className="w-5 h-5"/></button>
           <div className="mb-6">
             <h2 className="text-xl font-black text-slate-800 mb-2 flex items-center">
               <Plus className="w-6 h-6 mr-2 text-indigo-600" />新規案件の作成
             </h2>
             <p className="text-sm text-slate-500 font-bold">先に顧客名と対象機種を入力してください</p>
           </div>
           
           <div className="space-y-4 mb-8">
             <div>
               <label className="block text-sm font-bold text-slate-700 mb-1.5">顧客名 <span className="text-red-500">*</span></label>
               <input 
                 type="text" 
                 value={quote.customerName || ''} 
                 onChange={e => setQuote({...quote, customerName: e.target.value})} 
                 className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm" 
                 placeholder="例: 株式会社サンプル" 
                 autoFocus
               />
             </div>
             <div>
               <label className="block text-sm font-bold text-slate-700 mb-1.5">対象機種 <span className="text-red-500">*</span></label>
               <input 
                 type="text" 
                 value={quote.targetModelName || ''} 
                 onChange={e => setQuote({...quote, targetModelName: e.target.value})} 
                 className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm" 
                 placeholder="例: EX-200" 
               />
             </div>
           </div>
           
           <button 
             onClick={() => {
               if (quote.customerName?.trim() && quote.targetModelName?.trim()) {
                 setIsInitialSetup(false);
               }
             }}
             disabled={!quote.customerName?.trim() || !quote.targetModelName?.trim()}
             className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-sm flex items-center justify-center transition"
           >
             次へ進む <ChevronRight className="w-5 h-5 ml-1" />
           </button>
        </div>
      ) : (
`;

  // We need to add deleteSalesQuote to useApp call in SalesProcessModal!
  content = content.replace(
    'const { salesQuotes, addSalesQuote, updateSalesQuote, contracts, staff, salesPlans, tools } = useApp();',
    'const { salesQuotes, addSalesQuote, updateSalesQuote, deleteSalesQuote, contracts, staff, salesPlans, tools } = useApp();'
  );

  content = content.replace(
    `<div className="bg-white md:rounded-xl shadow-2xl w-full max-w-[98vw] xl:max-w-[1700px] h-[95dvh] flex flex-col relative overflow-hidden animate-in fade-in zoom-in duration-200">`,
    initialSetupUI + `\n<div className="bg-white md:rounded-xl shadow-2xl w-full max-w-[98vw] xl:max-w-[1700px] h-[95dvh] flex flex-col relative overflow-hidden animate-in fade-in zoom-in duration-200">`
  );

  // Close the ternary operator at the end
  content = content.replace(
    `    </div>\n  );\n};\n`,
    `    </div>\n      )} \n    </div>\n  );\n};\n`
  );

  // Update trash button logic in the initialSetupUI to use deleteSalesQuote
  content = content.replace(
    `                  if (quoteId) {
                    const { salesQuotes, deleteSalesQuote } = require('../context/AppContext'); // This is hacky, but we can call it from the hook
                  }
                  // We need deleteSalesQuote from context! Let's just use it below
                }`,
    `                  if (quoteId) {
                    deleteSalesQuote(quoteId);
                  }
                  onClose();
                }`
  );

  // Add the trash button to the header
  const headerTrashButton = `
              {quoteId && (
                <button onClick={() => setShowDeleteConfirm(true)} className="p-2 hover:bg-rose-100 text-rose-500 rounded-full shrink-0 transition-colors bg-rose-50 mr-1" title="案件を削除">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
`;
  content = content.replace(
    `{allCompleted && (`,
    headerTrashButton + `{allCompleted && (`
  );

  fs.writeFileSync(file, content);
}
