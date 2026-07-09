import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SalesLead } from '../types';
import { X, Check, Link as LinkIcon, Trophy, Edit3, Building, ExternalLink } from 'lucide-react';

interface LeadDetailsModalProps {
  lead: SalesLead;
  onClose: () => void;
}

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({ lead, onClose }) => {
  const { updateSalesLead, salesPlans } = useApp();
  
  const [customerName, setCustomerName] = useState<string>(lead.customerName);
  const [memo, setMemo] = useState<string>(lead.memo || '');
  const [finalAmount, setFinalAmount] = useState<number | ''>(lead.finalAmount || '');
  const [targetId, setTargetId] = useState<string>(lead.salesTargetId || '');

  const handleSaveLeadState = () => {
    updateSalesLead(lead.id, {
      customerName: customerName.trim() || lead.customerName,
      memo,
      finalAmount: finalAmount === '' ? undefined : Number(finalAmount),
      salesTargetId: targetId || undefined
    });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          
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
                  className="w-full border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-slate-50 hover:bg-white transition-all cursor-pointer"
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
                    className="w-full border-slate-200 rounded-lg p-2.5 pr-8 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 font-bold text-slate-800 bg-slate-50 hover:bg-white transition-all"
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
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-3">
            <button onClick={onClose} className="text-sm font-bold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">
              キャンセル
            </button>
            <button onClick={handleSaveLeadState} className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-indigo-700 flex items-center shadow-md transition-all active:scale-95">
              <Check className="w-4 h-4 mr-2" /> 保存して閉じる
            </button>
          </div>

        </div>
      </div>
    </>
  );
};
