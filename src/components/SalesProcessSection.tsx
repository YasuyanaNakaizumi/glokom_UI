import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Package, ChevronRight, FileText, CheckCircle } from 'lucide-react';
import { SalesProcessModal } from './SalesProcessModal';

export const SalesProcessSection: React.FC = () => {
  const { salesQuotes, t } = useApp();
  const [editingQuoteId, setEditingQuoteId] = useState<string | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenProcess = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.quoteId) {
        setEditingQuoteId(customEvent.detail.quoteId);
        setIsModalOpen(true);
      }
    };
    window.addEventListener('openSalesProcess', handleOpenProcess);
    return () => window.removeEventListener('openSalesProcess', handleOpenProcess);
  }, []);

  const activeQuotes = salesQuotes.filter(q => q.status !== '完了' && q.status !== '次ステップへ移行済');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full min-h-[500px]">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-indigo-50/50">
        <h3 className="font-bold text-slate-800 flex items-center">
          <Package className="w-5 h-5 mr-2 text-indigo-600" />
          {t('views.dashboard.salesProcessTitle')}
        </h3>
        <button 
          onClick={() => { setEditingQuoteId(undefined); setIsModalOpen(true); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition flex items-center shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1" /> {t('views.dashboard.addDeal')}
        </button>
      </div>
      <div className="p-4 space-y-3 flex-1 overflow-y-auto">
        {activeQuotes.map(quote => {
          const completedCount = [quote.quotePrepCompleted, quote.initialContractCompleted, quote.deliveryProcessCompleted, quote.systemRegistrationCompleted].filter(Boolean).length;
          return (
            <div 
              key={quote.id} 
              onClick={() => { setEditingQuoteId(quote.id); setIsModalOpen(true); }}
              className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition cursor-pointer bg-white group flex items-center justify-between"
            >
              <div>
                <div className="flex items-center mb-2">
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold font-mono mr-2">ID: {quote.id}</span>
                  <span className="text-xs text-slate-500 font-mono">{t('views.dashboard.createdAt', { date: new Date(quote.createdAt).toLocaleDateString() })}</span>
                </div>
                <h4 className="font-bold text-lg text-slate-800">{quote.customerName ? t('views.dashboard.customerWithSuffix', { name: quote.customerName }) : t('views.dashboard.customerUndecided')}</h4>
                <div className="text-sm text-slate-600 mt-1 font-bold flex items-center">
                  <Package className="w-4 h-4 mr-1 opacity-70" /> {quote.targetModelName || t('views.dashboard.modelUndecided')}
                </div>
              </div>
              <div className="flex items-center">
                <div className="mr-6 flex gap-1">
                   {[1,2,3,4].map(step => (
                     <div key={step} className={`w-2.5 h-2.5 rounded-full ${step <= completedCount ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                   ))}
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition" />
              </div>
            </div>
          );
        })}
        {activeQuotes.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">
            {t('views.dashboard.noActiveDeals')}
          </div>
        )}
      </div>

      {isModalOpen && (
        <SalesProcessModal 
          quoteId={editingQuoteId}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};
