const fs = require('fs');
const path = './src/components/LeadDetailsModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// fix height
content = content.replace(
  /<div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">/,
  '<div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">'
);

content = content.replace(
  /<div className="p-6 space-y-6 max-h-\[70vh\] overflow-y-auto">/,
  '<div className="p-6 space-y-6 flex-1 overflow-y-auto min-h-0">'
);

// fix footer layout
const oldFooter = `          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex flex-col md:flex-row justify-between items-center gap-4">
            <button 
              onClick={handleConfirmOrder} 
              className="w-full md:w-auto bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-emerald-700 flex items-center shadow-md transition-all active:scale-95"
            >
              <Trophy className="w-4 h-4 mr-2" /> 受注を確定して納入管理に進む
            </button>
            <div className="flex gap-3 w-full md:w-auto justify-end mt-4 md:mt-0">
              <button 
                onClick={() => setShowLostForm(true)} 
                className="bg-white border border-rose-200 text-rose-600 font-bold px-4 py-2.5 rounded-lg hover:bg-rose-50 flex items-center transition-colors mr-auto"
              >
                失注
              </button>
              <button onClick={onClose} className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">
                キャンセル
              </button>
              <button onClick={handleSaveLeadState} className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-indigo-700 flex items-center shadow-md transition-all active:scale-95">
                <Check className="w-4 h-4 mr-2" /> 保存して閉じる
              </button>
            </div>
          </div>`;

const newFooter = `          {/* Footer */}
          <div className="px-4 py-4 md:px-6 border-t border-slate-100 bg-slate-50/80 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 shrink-0">
            <button 
              onClick={handleConfirmOrder} 
              className="w-full md:w-auto bg-emerald-600 text-white font-bold px-4 md:px-6 py-3 md:py-2.5 rounded-xl md:rounded-lg hover:bg-emerald-700 flex items-center justify-center shadow-md transition-all active:scale-95 mb-2 md:mb-0"
            >
              <Trophy className="w-4 h-4 mr-2" /> 受注を確定
            </button>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto sm:justify-end">
              <button 
                onClick={() => setShowLostForm(true)} 
                className="bg-white border border-rose-200 text-rose-600 font-bold px-4 py-3 md:py-2.5 rounded-xl md:rounded-lg hover:bg-rose-50 flex items-center justify-center transition-colors sm:mr-auto"
              >
                失注
              </button>
              <button onClick={onClose} className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-3 md:py-2 rounded-xl md:rounded-lg bg-white sm:bg-transparent border border-slate-200 sm:border-transparent hover:bg-slate-200 transition-colors w-full sm:w-auto text-center">
                キャンセル
              </button>
              <button onClick={handleSaveLeadState} className="bg-indigo-600 text-white font-bold px-6 py-3 md:py-2.5 rounded-xl md:rounded-lg hover:bg-indigo-700 flex items-center justify-center shadow-md transition-all active:scale-95 w-full sm:w-auto">
                <Check className="w-4 h-4 mr-2" /> 保存して閉じる
              </button>
            </div>
          </div>`;

content = content.replace(oldFooter, newFooter);

fs.writeFileSync(path, content, 'utf8');
