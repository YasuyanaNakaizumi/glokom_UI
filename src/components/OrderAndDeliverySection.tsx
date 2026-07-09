import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, FileSignature, Truck, User, MapPin, Package, CheckCircle, FileText, CheckSquare, Settings, X, ChevronRight, Trash2 } from 'lucide-react';
import { QuoteEditModal } from './QuoteEditModal';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export const OrderAndDeliverySection: React.FC = () => {
  const { salesQuotes, staff, deleteSalesQuote } = useApp();
  
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | undefined>();
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);
  const [newDealType, setNewDealType] = useState<'新車販売' | '中古車販売' | '中古車買取のみ'>('新車販売');
  const [newDealHasTradeIn, setNewDealHasTradeIn] = useState<boolean>(false);
  const [newDealCustomerName, setNewDealCustomerName] = useState<string>('');
  const [newDealTargetModelName, setNewDealTargetModelName] = useState<string>('');
  
  const getStaffName = (task?: any) => {
    if (task?.staffIds && task.staffIds.length > 0) {
      return task.staffIds.map((id: string) => staff.find((s:any) => s.id === id)?.name || '未定').join(', ');
    }
    return staff.find(s => s.id === task?.staffId)?.name || '未定';
  };

  const sortedQuotes = [...salesQuotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleOpenQuote = (id: string, tab?: 'quote'|'contract'|'receiving') => {
    setEditingQuoteId(id);
    setIsQuoteModalOpen(true);
    // Modal could open to a specific tab if we implemented it, but standard edit is fine.
  };

  const handleCreateNewDeal = () => {
    setEditingQuoteId(undefined);
    setIsNewDealModalOpen(false);
    setIsQuoteModalOpen(true);
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 flex flex-col shadow-sm overflow-hidden h-full">
        <div className="p-3 flex items-center justify-between bg-indigo-50 border-b border-indigo-100/50 text-indigo-900">
          <h3 className="font-bold text-sm flex items-center">
            <FileSignature className="w-4 h-4 mr-2 text-indigo-500" />
            契約・納入管理
          </h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleCreateNewDeal}
              className="bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs px-3 py-1.5 rounded flex items-center transition shadow-sm font-bold"
            >
              <Plus className="w-3 h-3 mr-0.5" /> 案件を新規追加
            </button>
            <div className="bg-white border border-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1.5 rounded-full shadow-sm">
              {sortedQuotes.length}
            </div>
          </div>
        </div>
        
        <div className="p-3 space-y-3 flex-1 bg-slate-50 overflow-y-auto min-h-[400px] max-h-[700px]">
          {sortedQuotes.map(quote => {
            const hasReceiving = quote.receivingSettings?.answered;
            const rs = quote.receivingSettings;
            const expectedDate = rs?.expectedDate ? new Date(rs.expectedDate) : null;
            const deliveryDate = rs?.deliveryDate ? new Date(rs.deliveryDate) : null;
            
            let flowDesc = '手配準備中';
            if (expectedDate && deliveryDate) {
              expectedDate.setHours(0,0,0,0);
              deliveryDate.setHours(0,0,0,0);
              const days = Math.round((deliveryDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24));
              if (days === 0) flowDesc = '受け入れ日に即納車';
              else flowDesc = `約${days}日間在庫ののち納車`;
            } else if (expectedDate) {
              flowDesc = '受入後在庫 (納車日未定)';
            }
            
            const isDeliveryStage = quote.status === '承認済・本発注' || quote.status === '出庫手配済' || hasReceiving;

            return (
              <div 
                key={quote.id} 
                onClick={() => handleOpenQuote(quote.id)} 
                className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden relative group"
              >
                <div className={cn("absolute top-0 left-0 w-1 h-full", isDeliveryStage ? "bg-indigo-400" : "bg-emerald-400")}></div>
                
                <div className="flex justify-between items-start mb-2 pl-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold border", 
                        isDeliveryStage ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      )}>
                        {isDeliveryStage ? '納入・受入予定' : '見積・注文手配'}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">ID: {quote.id.split('-')[0]}</span>
                    </div>
                    <span className="font-bold text-slate-900 text-sm block">
                      {quote.targetModelName && (
                        <span className="text-indigo-700 mr-2">{quote.targetModelName}</span>
                      )}
                      {quote.customerName} 様
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded border font-medium whitespace-nowrap",
                      quote.status === '見積作成中' ? 'bg-slate-100 text-slate-700 border-slate-200' :
                      quote.status === '出庫手配済' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' :
                      quote.status === '承認済・本発注' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      'bg-emerald-100 text-emerald-700 border-emerald-200'
                    )}>
                      {quote.status}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteSalesQuote(quote.id); }} 
                      className="text-slate-300 hover:text-red-500 transition-colors p-1"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {!isDeliveryStage ? (
                  <div className="pl-2 mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
                    <span className="font-mono">{new Date(quote.createdAt).toLocaleDateString()} 作成</span>
                    {quote.specialRequest && <span className="text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.5 rounded flex items-center font-bold"><CheckSquare className="w-3 h-3 mr-0.5"/> 申請事項有</span>}
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-100 rounded px-3 py-2 mt-2 ml-2 flex flex-col gap-2">
                    <div className="flex items-start gap-2 border-b border-slate-200 pb-2">
                      <div className="text-indigo-400 mt-0.5 shrink-0"><CheckCircle className="w-3 h-3"/></div>
                      <div className="flex-1">
                        <div className="text-xs text-slate-700 font-bold leading-tight mb-1">
                           {flowDesc}
                        </div>
                        {rs?.targetVehicleModel && (
                          <div className="text-[11px] text-slate-500 font-mono bg-slate-200/50 px-1.5 py-0.5 rounded inline-block">
                            {rs.targetVehicleModel} ({rs.targetSerialNumber || '車台未定'})
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 text-[11px] text-slate-600">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 font-medium"><MapPin className="w-3 h-3 text-emerald-500"/> 工場からの受入（入庫）</div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-700">{rs?.expectedDate ? format(new Date(rs.expectedDate), 'M/d') : '未定'}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1 font-medium"><Truck className="w-3 h-3 text-sky-500"/> お客様への納車</div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-700">{rs?.deliveryDate ? format(new Date(rs.deliveryDate), 'M/d') : '未定'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {sortedQuotes.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm flex flex-col items-center">
              <Package className="w-8 h-8 mb-2 text-slate-300" />
              案件データがありません
            </div>
          )}
        </div>
      </div>

      {isQuoteModalOpen && (
        <QuoteEditModal 
          onClose={() => setIsQuoteModalOpen(false)} 
          quoteId={editingQuoteId} 
          initialDealType={!editingQuoteId ? newDealType : undefined}
          initialHasTradeIn={!editingQuoteId ? newDealHasTradeIn : undefined}
          initialCustomerName={!editingQuoteId ? newDealCustomerName : undefined}
          initialTargetModelName={!editingQuoteId ? newDealTargetModelName : undefined}
        />
      )}

          </>
  );
};

