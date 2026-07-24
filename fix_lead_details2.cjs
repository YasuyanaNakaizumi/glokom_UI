const fs = require('fs');
const path = './src/components/LeadDetailsModal.tsx';
let content = fs.readFileSync(path, 'utf8');

const returnIdx = content.indexOf('  return (\n    <>');
if (returnIdx !== -1) {
  content = content.substring(0, returnIdx) + `  return (
    <>
      {showSuccess ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">受注を確定しました</h3>
            <p className="text-slate-600 mb-8 text-sm font-bold leading-relaxed">
              案件は「見積もり〜納入までの管理」に移動しました。<br/>続けて契約や受入の管理を行いますか？
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openSalesProcess', { detail: { quoteId: createdQuoteId } }));
                  onClose();
                }}
                className="bg-indigo-600 text-white font-bold px-4 py-3.5 rounded-xl hover:bg-indigo-700 transition shadow-sm w-full flex justify-center items-center"
              >
                続けて契約管理に進む
              </button>
              <button 
                onClick={onClose}
                className="bg-slate-100 text-slate-700 font-bold px-4 py-3.5 rounded-xl hover:bg-slate-200 transition shadow-sm w-full"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      ) : (
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          {showLostForm ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center text-rose-600">
                  <AlertTriangle className="w-6 h-6 mr-2" /> 失注処理
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">失注理由 <span className="text-red-500">*</span></label>
                  <textarea 
                    value={lostReason} 
                    onChange={e => setLostReason(e.target.value)} 
                    className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-rose-500 focus:border-rose-500" 
                    rows={3} 
                    placeholder="価格負け、納期、スペック不足など..."
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700">競合会社情報</label>
                    <button 
                      onClick={() => setCompetitors([...competitors, { companyName: '', amount: '' }])}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded font-bold flex items-center transition"
                    >
                      <Plus className="w-3 h-3 mr-1" /> 追加
                    </button>
                  </div>
                  <div className="space-y-2">
                    {competitors.map((comp, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input 
                          type="text" 
                          value={comp.companyName} 
                          onChange={e => {
                            const newC = [...competitors];
                            newC[idx].companyName = e.target.value;
                            setCompetitors(newC);
                          }} 
                          placeholder="会社名" 
                          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-rose-500" 
                        />
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">¥</span>
                          <input 
                            type="number" 
                            value={comp.amount} 
                            onChange={e => {
                              const newC = [...competitors];
                              newC[idx].amount = e.target.value ? Number(e.target.value) : '';
                              setCompetitors(newC);
                            }} 
                            placeholder="金額" 
                            className="w-32 pl-7 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-rose-500" 
                          />
                        </div>
                        {competitors.length > 1 && (
                          <button 
                            onClick={() => setCompetitors(competitors.filter((_, i) => i !== idx))} 
                            className="text-slate-400 hover:text-red-500 transition p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button onClick={() => setShowLostForm(false)} className="px-5 py-2.5 rounded-lg text-slate-600 font-bold hover:bg-slate-100 transition">
                  キャンセル
                </button>
                <button 
                  onClick={handleSaveLost} 
                  disabled={!lostReason.trim()}
                  className="px-5 py-2.5 rounded-lg text-white font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition shadow-sm"
                >
                  失注として確定
                </button>
              </div>
            </div>
          ) : (
            <>
          {/* Header */}
          <div className="px-6 py-5 flex justify-between items-start border-b border-slate-100 bg-slate-50/50">
            <div className="flex-1 mr-4">
              <div className="inline-flex items-center gap-2 mb-2">
                <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider">
                  LEAD CANDIDATE
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="relative group flex items-center">
                <div className="text-slate-400 absolute left-3">
                  <Building className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full font-bold text-slate-900 text-xl md:text-2xl tracking-tight bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-200 focus:border-indigo-300 rounded-lg py-1.5 pl-10 pr-3 transition outline-none"
                  placeholder="顧客名を入力..."
                />
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 p-2 rounded-full transition shadow-sm mt-1">
              <X className="w-5 h-5"/>
            </button>
          </div>
          
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Memo Area */}
            <div className="relative group">
              <div className="absolute top-4 right-4 text-slate-400 pointer-events-none transition-opacity opacity-50 group-hover:opacity-100">
                <Edit3 className="w-4 h-4" />
              </div>
              <textarea 
                value={memo} 
                onChange={e => setMemo(e.target.value)} 
                rows={6}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none shadow-sm"
                placeholder="顧客とのやり取りや検討状況を自由にメモしてください..."
              />
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-2">
              <a href="#" className="flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100 shadow-sm">
                <ExternalLink className="w-3 h-3 mr-1.5" /> 見積もりサイト
              </a>
              <a href="#" className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors border border-amber-100 shadow-sm">
                <ExternalLink className="w-3 h-3 mr-1.5" /> 特注可否申請
              </a>
              <a href="#" className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100 shadow-sm">
                <ExternalLink className="w-3 h-3 mr-1.5" /> 中古車販売サイト
              </a>
              <a href="#" className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100 shadow-sm">
                <ExternalLink className="w-3 h-3 mr-1.5" /> 下取り査定サイト
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Sales Plan Link */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 transition-all hover:border-indigo-300 hover:shadow-md group">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md group-hover:bg-indigo-100 transition-colors">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                  <label className="block text-sm font-bold text-slate-700">販売計画と紐づけ</label>
                </div>
                <select 
                  value={targetId} 
                  onChange={e => setTargetId(e.target.value)} 
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50 hover:bg-white transition-all cursor-pointer"
                >
                  <option value="">-- 指定しない --</option>
                  {salesPlans.flatMap(p => p.salesTargets || []).map(t => (
                    <option key={t.id} value={t.id}>{t.customerName} ({t.productName})</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                  紐づけると、受注額がノルマ達成に自動反映されます。
                </p>
              </div>
              
              {/* Final Amount (Order) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 transition-all hover:border-indigo-300 hover:shadow-md group">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md group-hover:bg-indigo-100 transition-colors">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <label className="block text-sm font-bold text-slate-700">受注完了 (売上金額)</label>
                </div>
                <div className="relative">
                  <input 
                    type="number" 
                    value={finalAmount} 
                    onChange={e => setFinalAmount(e.target.value === '' ? '' : Number(e.target.value))} 
                    className="w-full border border-slate-200 rounded-lg p-2.5 pr-8 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 font-bold text-slate-800 bg-slate-50 hover:bg-white transition-all"
                    placeholder="例: 15000000"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold pointer-events-none">
                    円
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                  金額を入力すると、自動的に「受注済」として扱われます。
                </p>
              </div>

            </div>
          </div>
          
          {/* Footer */}
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
          </div>
          </>
          )}
        </div>
      )}
    </>
  );
};
`
}

fs.writeFileSync(path, content, 'utf8');
