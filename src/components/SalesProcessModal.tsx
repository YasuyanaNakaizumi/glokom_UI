import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SalesQuote, QuoteItem, SalesFile, ContractTemplate } from '../types';
import { TaskConfigSection } from './AddDeliveryModal';
import { X, ExternalLink, Plus, Users, Car, Trash2, FileText, Download, UploadCloud, CheckCircle, Package, ShieldCheck, ClipboardList, ChevronRight, MessageSquare, Send, Check, MapPin, AlertTriangle } from 'lucide-react';

export const SalesProcessModal: React.FC<{
  onClose: () => void;
  quoteId?: string;
}> = ({ onClose, quoteId }) => {
  const { salesQuotes, addSalesQuote, updateSalesQuote, deleteSalesQuote, contracts, staff, salesPlans, tools, parking } = useApp();
  
  
  const [receiveTasks, setReceiveTasks] = useState([{ name: '受入点検', reportFormatId: '', paidServiceId: '' }]);
  const [receiveParkingIds, setReceiveParkingIds] = useState<Set<string>>(new Set());

  const [deliveryTasks, setDeliveryTasks] = useState([{ name: '納入前点検', reportFormatId: '', paidServiceId: '' }]);
  const [deliveryParkingIds, setDeliveryParkingIds] = useState<Set<string>>(new Set());

  const toggleReceiveParking = (id: string) => {
    setReceiveParkingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleDeliveryParking = (id: string) => {
    setDeliveryParkingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const [activeTab, setActiveTab] = useState<'quote_prep' | 'initial_contract' | 'receive_process' | 'stock_process' | 'delivery_process' | 'system_registration'>('quote_prep');
  
  const [isAddContractModalOpen, setIsAddContractModalOpen] = useState(false);
  const [pendingContracts, setPendingContracts] = useState<{id: string, templateId: string, files: SalesFile[]}[]>([]);

  const [isInitialSetup, setIsInitialSetup] = useState(!quoteId);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [quote, setQuote] = useState<Partial<SalesQuote>>({
    customerName: '',
    targetModelName: '',
    status: '見積作成中',
    quotePrepCompleted: false,
    initialContractCompleted: false,
    receiveProcessCompleted: false,
    stockProcessCompleted: false,
    deliveryProcessCompleted: false,
    systemRegistrationCompleted: false,
    finalAmount: 0,
    salesTargetId: '',
    appliedContracts: [],
    receiveWork: { date: '', staffIds: [] },
    stockPeriod: { startDate: '', endDate: '' },
    deliveryWork: { date: '', staffIds: [] }
  });

  useEffect(() => {
    if (quoteId) {
      const q = salesQuotes.find(sq => sq.id === quoteId);
      if (q) setQuote({ ...q });
    }
  }, [quoteId, salesQuotes]);

  const handleSave = (closeAfter = false) => {
    if (quoteId) {
      updateSalesQuote(quoteId, quote);
    } else {
      const newQ = {
        ...quote,
        id: `sq${Date.now()}`,
        revision: 1,
        items: [],
        services: [],
        files: [],
        createdAt: new Date().toISOString()
      } as SalesQuote;
      addSalesQuote(newQ);
    }
    if (closeAfter) onClose();
  };

  const handleCloseProcess = () => {
    if (quoteId) {
      updateSalesQuote(quoteId, { ...quote, status: '完了' });
    }
    onClose();
  };

  const toggleComplete = (field: 'quotePrepCompleted' | 'initialContractCompleted' | 'receiveProcessCompleted' | 'stockProcessCompleted' | 'deliveryProcessCompleted' | 'systemRegistrationCompleted') => {
    const val = !quote[field];
    setQuote({ ...quote, [field]: val });
    
    if (quoteId) {
      updateSalesQuote(quoteId, { [field]: val });
    }
  };

  const allCompleted = quote.quotePrepCompleted && quote.initialContractCompleted && quote.receiveProcessCompleted && quote.stockProcessCompleted && quote.deliveryProcessCompleted && quote.systemRegistrationCompleted;

  const salesTargets = salesPlans.flatMap(p => p.salesTargets || []);

  const renderTabIcon = (completed?: boolean) => {
    if (completed) return <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />;
    return <div className="w-4 h-4 mr-2 rounded-full border-2 border-slate-300" />;
  };

  const getContractTemplate = (id: string) => contracts.find(c => c.id === id);
  const renderContractTerms = (template: ContractTemplate) => {
    const parts = [];
    if (template.contractPeriodRule && template.contractPeriodRule !== 'none') {
      if (template.contractPeriodRule === 'months' || template.contractPeriodRule === 'years') {
         parts.push(`契約期間: ${template.contractPeriodValue}${template.contractPeriodUnit === 'years' ? '年' : 'ヶ月'}`);
      } else if (template.contractPeriodRule === 'smr') {
         parts.push(`契約期間: ${template.contractPeriodSmr}SMRまで`);
      } else if (template.contractPeriodRule === 'whichever_first') {
         parts.push(`契約期間: ${template.contractPeriodValue}${template.contractPeriodUnit === 'years' ? '年' : 'ヶ月'} または ${template.contractPeriodSmr}SMR のいずれか早い方`);
      }
    } else if (template.months || template.smr) {
      if (template.months && template.smr) {
         parts.push(`契約期間: ${template.months}ヶ月 または ${template.smr}SMR のいずれか早い方`);
      } else if (template.months) {
         parts.push(`契約期間: ${template.months}ヶ月`);
      } else if (template.smr) {
         parts.push(`契約期間: ${template.smr}SMR`);
      }
    }
    return parts.join(' / ') || '期間指定なし';
  };

  const handleOpenAddContractModal = () => {
    setPendingContracts([{ id: Math.random().toString(36).substr(2, 9), templateId: '', files: [] }]);
    setIsAddContractModalOpen(true);
  };
  const handlePendingContractChange = (id: string, templateId: string) => {
    setPendingContracts(prev => prev.map(c => c.id === id ? { ...c, templateId } : c));
  };
  const handlePendingContractFile = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file: File) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type
      }));
      setPendingContracts(prev => prev.map(c => 
        c.id === id ? { ...c, files: [...c.files, ...newFiles] } : c
      ));
    }
  };
  const removePendingContractFile = (contractId: string, fileId: string) => {
    setPendingContracts(prev => prev.map(c => 
      c.id === contractId ? { ...c, files: c.files.filter(f => f.id !== fileId) } : c
    ));
  };
  const removePendingContract = (id: string) => {
    setPendingContracts(prev => prev.filter(c => c.id !== id));
  };
  const addAnotherPendingContract = () => {
    setPendingContracts(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), templateId: '', files: [] }]);
  };
  const savePendingContracts = () => {
    const validContracts = pendingContracts.filter(c => c.templateId);
    if (validContracts.length > 0) {
      setQuote(prev => ({
        ...prev,
        appliedContracts: [...(prev.appliedContracts || []), ...validContracts]
      }));
    }
    setIsAddContractModalOpen(false);
  };
  const handleContractFileUpload = (contractId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((file: File) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type
      }));
      setQuote(prev => ({
        ...prev,
        appliedContracts: (prev.appliedContracts || []).map(ac => 
          ac.id === contractId ? { ...ac, files: [...ac.files, ...newFiles] } : ac
        )
      }));
    }
  };
  const handleRemoveContractFile = (contractId: string, fileId: string) => {
    setQuote(prev => ({
      ...prev,
      appliedContracts: (prev.appliedContracts || []).map(ac => 
        ac.id === contractId ? { ...ac, files: ac.files.filter(f => f.id !== fileId) } : ac
      )
    }));
  };
  const handleRemoveAppliedContract = (id: string) => {
    setQuote(prev => ({
      ...prev,
      appliedContracts: (prev.appliedContracts || []).filter(ac => ac.id !== id)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      
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
                    deleteSalesQuote(quoteId);
                  }
                  onClose();
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

<div className="bg-white md:rounded-xl shadow-2xl w-full max-w-[98vw] xl:max-w-[1700px] h-[95dvh] flex flex-col relative overflow-hidden animate-in fade-in zoom-in duration-200">
        <header className="bg-slate-50 px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex flex-col md:flex-row md:justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex flex-col xl:flex-row xl:items-center gap-3">
                <h2 className="text-xl font-black text-slate-800 leading-tight">
                  契約及び受入納車管理
                </h2>
                <div className="flex flex-wrap gap-2 items-center xl:ml-4">
                  <div className="flex items-center text-sm bg-white border border-slate-300 rounded-md shadow-sm overflow-hidden">
                    <span className="text-gray-500 pl-3 py-1.5 mr-1 whitespace-nowrap text-xs">顧客:</span>
                    <input type="text" value={quote.customerName || ''} onChange={e => setQuote({...quote, customerName: e.target.value})} className="font-bold text-slate-800 bg-transparent border-0 focus:ring-0 p-0 py-1.5 pr-3 w-[140px] text-sm outline-none" placeholder="未入力" />
                  </div>
                  <div className="flex items-center text-sm bg-white border border-slate-300 rounded-md shadow-sm overflow-hidden">
                    <span className="text-gray-500 pl-3 py-1.5 mr-1 whitespace-nowrap text-xs">機種:</span>
                    <input type="text" value={quote.targetModelName || ''} onChange={e => setQuote({...quote, targetModelName: e.target.value})} className="font-bold text-slate-800 bg-transparent border-0 focus:ring-0 p-0 py-1.5 pr-3 w-[140px] text-sm outline-none" placeholder="未入力" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 absolute top-4 right-4 md:static">
              
              {quoteId && (
                <button onClick={() => setShowDeleteConfirm(true)} className="p-2 hover:bg-rose-100 text-rose-500 rounded-full shrink-0 transition-colors bg-rose-50 mr-1" title="案件を削除">
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
{allCompleted && (
                <button onClick={handleCloseProcess} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-bold text-sm transition shadow-sm flex items-center">
                  <Check className="w-4 h-4 mr-1" /> プロセス完了してクローズ
                </button>
              )}
              <button onClick={() => handleSave(true)} className="p-2 hover:bg-slate-200 rounded-full shrink-0 transition-colors bg-slate-100"><X className="w-5 h-5 text-slate-600" /></button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Tabs */}
          <div className="md:w-64 w-full bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col p-4 shrink-0 overflow-y-auto">
            <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
              <button 
                onClick={() => setActiveTab('quote_prep')}
                className={`w-auto md:w-full shrink-0 flex items-center p-3 rounded-lg text-left text-sm font-bold transition-colors ${activeTab === 'quote_prep' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700'}`}
              >
                {renderTabIcon(quote.quotePrepCompleted)}
                見積・文書準備
              </button>
              <button 
                onClick={() => setActiveTab('initial_contract')}
                className={`w-auto md:w-full shrink-0 flex items-center p-3 rounded-lg text-left text-sm font-bold transition-colors ${activeTab === 'initial_contract' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700'}`}
              >
                {renderTabIcon(quote.initialContractCompleted)}
                初期契約
              </button>
              <button 
                onClick={() => setActiveTab('receive_process')}
                className={`w-auto md:w-full shrink-0 flex items-center p-3 rounded-lg text-left text-sm font-bold transition-colors ${activeTab === 'receive_process' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700'}`}
              >
                {renderTabIcon(quote.receiveProcessCompleted)}
                受入作業
              </button>
              <button 
                onClick={() => setActiveTab('stock_process')}
                className={`w-auto md:w-full shrink-0 flex items-center p-3 rounded-lg text-left text-sm font-bold transition-colors ${activeTab === 'stock_process' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700'}`}
              >
                {renderTabIcon(quote.stockProcessCompleted)}
                在庫期間
              </button>
              <button 
                onClick={() => setActiveTab('delivery_process')}
                className={`w-auto md:w-full shrink-0 flex items-center p-3 rounded-lg text-left text-sm font-bold transition-colors ${activeTab === 'delivery_process' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700'}`}
              >
                {renderTabIcon(quote.deliveryProcessCompleted)}
                納入作業
              </button>
              <button 
                onClick={() => setActiveTab('system_registration')}
                className={`w-auto md:w-full shrink-0 flex items-center p-3 rounded-lg text-left text-sm font-bold transition-colors ${activeTab === 'system_registration' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700'}`}
              >
                {renderTabIcon(quote.systemRegistrationCompleted)}
                システム登録
              </button>
            </nav>
            <div className="mt-auto pt-6">
              <button onClick={() => handleSave()} className="w-full py-2 bg-indigo-600 text-white rounded font-bold text-sm hover:bg-indigo-700 transition shadow-sm">
                状態を保存
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white overflow-y-auto p-4 md:p-8">
            
            {activeTab === 'quote_prep' && (
              <div className="max-w-5xl mx-auto w-full space-y-8 animate-in fade-in">
                <div>
                  <h3 className="text-lg font-black text-slate-800 border-b pb-2 mb-6 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-indigo-600" /> 見積・文書準備
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <a href="#" className="flex items-center justify-center p-4 border border-amber-200 rounded-xl bg-amber-50/50 text-amber-800 hover:bg-amber-100 transition shadow-sm group">
                      <ExternalLink className="w-5 h-5 mr-2 text-amber-500 group-hover:text-amber-600" />
                      <span className="font-bold">見積もりサイト</span>
                    </a>
                    <a href="#" className="flex items-center justify-center p-4 border border-amber-200 rounded-xl bg-amber-50/50 text-amber-800 hover:bg-amber-100 transition shadow-sm group">
                      <ExternalLink className="w-5 h-5 mr-2 text-amber-500 group-hover:text-amber-600" />
                      <span className="font-bold">特注可否申請</span>
                    </a>
                    <a href="#" className="flex items-center justify-center p-4 border border-amber-200 rounded-xl bg-amber-50/50 text-amber-800 hover:bg-amber-100 transition shadow-sm group">
                      <ExternalLink className="w-5 h-5 mr-2 text-amber-500 group-hover:text-amber-600" />
                      <span className="font-bold">中古車販売サイト</span>
                    </a>
                    <a href="#" className="flex items-center justify-center p-4 border border-amber-200 rounded-xl bg-amber-50/50 text-amber-800 hover:bg-amber-100 transition shadow-sm group">
                      <ExternalLink className="w-5 h-5 mr-2 text-amber-500 group-hover:text-amber-600" />
                      <span className="font-bold">下取り査定サイト</span>
                    </a>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">受注金額</label>
                      <div className="flex items-center">
                        <input 
                          type="number" 
                          value={quote.finalAmount || ''} 
                          onChange={e => setQuote({...quote, finalAmount: Number(e.target.value)})}
                          className="w-full max-w-md border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-right font-mono text-lg font-bold"
                          placeholder="例: 15000000"
                        />
                        <span className="ml-3 font-bold text-slate-500">円</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">売上目標との紐づけ</label>
                      <select 
                        value={quote.salesTargetId || ''}
                        onChange={e => setQuote({...quote, salesTargetId: e.target.value})}
                        className="w-full max-w-md border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="">-- 紐づけない --</option>
                        {salesTargets.map(st => (
                          <option key={st.id} value={st.id}>{st.startMonth} - {st.customerName} ({st.amount.toLocaleString()}円)</option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-500 mt-2">紐づけることで売上目標の達成率に自動反映されます。</p>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button 
                      onClick={() => toggleComplete('quotePrepCompleted')}
                      className={`px-6 py-3 rounded-lg font-bold flex items-center transition shadow-sm ${quote.quotePrepCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                    >
                      {quote.quotePrepCompleted ? (
                        <><CheckCircle className="w-5 h-5 mr-2 text-emerald-600" /> 見積・文書準備 完了済</>
                      ) : (
                        <><Check className="w-5 h-5 mr-2" /> このステップを完了にする</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'initial_contract' && (
              <div className="max-w-5xl mx-auto w-full space-y-8 animate-in fade-in">
                <h3 className="text-lg font-black text-slate-800 border-b pb-2 mb-6 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2 text-indigo-600" /> 初期契約
                </h3>
                
                <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-t-4 border-t-emerald-500">
                  <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <div>
                      <h4 className="font-bold text-lg flex items-center text-slate-800">
                        <ShieldCheck className="w-5 h-5 mr-2 text-emerald-600" /> 契約・証跡の管理
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">お客様との契約内容（有償サービス、保証、定期メンテナンス）の適用と証跡PDFを保管します。</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleOpenAddContractModal}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-colors shrink-0 shadow-sm"
                      >
                        <Plus className="w-4 h-4 mr-1" /> 追加
                      </button>
                    </div>
                  </div>
                  {(!quote.appliedContracts || quote.appliedContracts.length === 0) ? (
                    <div className="text-center py-10 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      契約が追加されていません。右上の「追加」ボタンから追加してください。
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {quote.appliedContracts.map(ac => {
                        const template = getContractTemplate(ac.templateId);
                        if (!template) return null;
                        return (
                          <div key={ac.id} className="border border-emerald-200 rounded-lg overflow-hidden bg-white shadow-sm">
                            <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-100 flex justify-between items-start">
                              <div>
                                <div className="font-bold text-emerald-900 mb-1">{template.title}</div>
                                <div className="text-xs text-emerald-700 font-medium bg-emerald-100/50 inline-block px-2 py-1 rounded">
                                  {renderContractTerms(template)}
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveAppliedContract(ac.id)}
                                className="text-red-500 hover:bg-red-50 p-1.5 rounded text-sm transition-colors flex items-center shrink-0 ml-2"
                              >
                                <Trash2 className="w-4 h-4 mr-1" /> 削除
                              </button>
                            </div>
                            <div className="p-4 bg-white">
                              <div className="text-sm font-medium text-gray-700 mb-2">証跡ファイル (契約書・合意書など)</div>
                              <div className="flex border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 justify-center items-center relative hover:bg-indigo-50 hover:border-indigo-300 transition-all group mb-3">
                                <input type="file" multiple onChange={(e) => handleContractFileUpload(ac.id, e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <div className="text-center group-hover:text-indigo-600 transition-colors flex flex-col items-center">
                                  <UploadCloud className="w-6 h-6 text-gray-400 mb-1 group-hover:text-indigo-500 transition-colors" />
                                  <span className="text-xs font-medium">クリックまたはドラッグ＆ドロップでファイルを追加</span>
                                </div>
                              </div>
                              {ac.files && ac.files.length > 0 && (
                                <ul className="space-y-2">
                                  {ac.files.map(f => (
                                    <li key={f.id} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded text-xs hover:bg-gray-100 transition-colors">
                                      <div className="flex items-center font-medium text-slate-700 truncate mr-2">
                                        <FileText className="w-4 h-4 text-indigo-500 mr-2 shrink-0" />
                                        <span className="truncate">{f.name}</span>
                                      </div>
                                      <div className="flex items-center">
                                        <button className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded transition-colors mr-1">
                                          <Download className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => handleRemoveContractFile(ac.id, f.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors shrink-0">削除</button>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={() => toggleComplete('initialContractCompleted')}
                    className={`px-6 py-3 rounded-lg font-bold flex items-center transition shadow-sm ${quote.initialContractCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                  >
                    {quote.initialContractCompleted ? (
                      <><CheckCircle className="w-5 h-5 mr-2 text-emerald-600" /> 初期契約 完了済</>
                    ) : (
                      <><Check className="w-5 h-5 mr-2" /> このステップを完了にする</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'receive_process' && (
              <div className="w-full space-y-8 animate-in fade-in">
                <h3 className="text-lg font-black text-slate-800 border-b pb-2 mb-6 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-indigo-600" /> 受入作業
                </h3>
                
                <TaskConfigSection 
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
                />

                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={() => toggleComplete('receiveProcessCompleted')}
                    className={`px-6 py-3 rounded-lg font-bold flex items-center transition shadow-sm ${quote.receiveProcessCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                  >
                    {quote.receiveProcessCompleted ? (
                      <><CheckCircle className="w-5 h-5 mr-2 text-emerald-600" /> 受入作業 完了済</>
                    ) : (
                      <><Check className="w-5 h-5 mr-2" /> このステップを完了にする</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'stock_process' && (
              <div className="max-w-5xl mx-auto w-full space-y-8 animate-in fade-in">
                <h3 className="text-lg font-black text-slate-800 border-b pb-2 mb-6 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-indigo-600" /> 在庫期間
                </h3>
                
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                  <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">在庫期間の入力</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
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
                    </div>
                  </div>
                  <h4 className="font-bold text-slate-700 mb-2 text-sm flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-indigo-500" />
                    駐車エリアの指定
                  </h4>
                  <div className="h-[300px] w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] rounded-lg border border-slate-200 overflow-hidden relative mb-2">
                    {parking.map(p => {
                      const isSelected = quote.stockPeriod?.parkingId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setQuote({...quote, stockPeriod: {...quote.stockPeriod!, parkingId: p.id}})}
                          className={`absolute rounded-lg border-2 flex flex-col items-center justify-center p-2 shadow-md transition-all cursor-pointer overflow-hidden ${
                            isSelected ? "border-indigo-500 bg-indigo-50/90 shadow-lg ring-4 ring-indigo-500/20 z-20" : "border-slate-300 bg-slate-50/90 hover:border-indigo-300 hover:bg-slate-100"
                          }`}
                          style={{
                            left: p.x, top: p.y, width: p.width, height: p.height
                          }}
                        >
                          <div className="font-bold text-xs pointer-events-none text-center w-full text-slate-800 break-words">{p.name}</div>
                        </div>
                      )
                    })}
                  </div>
                  <select 
                     value={quote.stockPeriod?.parkingId || ""} 
                     onChange={e => setQuote({...quote, stockPeriod: {...quote.stockPeriod!, parkingId: e.target.value}})} 
                     className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-indigo-500 font-bold text-slate-700"
                  >
                    <option value="">未定 / 指定なし</option>
                    {parking.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={() => toggleComplete('stockProcessCompleted')}
                    className={`px-6 py-3 rounded-lg font-bold flex items-center transition shadow-sm ${quote.stockProcessCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                  >
                    {quote.stockProcessCompleted ? (
                      <><CheckCircle className="w-5 h-5 mr-2 text-emerald-600" /> 在庫期間 完了済</>
                    ) : (
                      <><Check className="w-5 h-5 mr-2" /> このステップを完了にする</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'delivery_process' && (
              <div className="w-full space-y-8 animate-in fade-in">
                <h3 className="text-lg font-black text-slate-800 border-b pb-2 mb-6 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-indigo-600" /> 納入作業
                </h3>
                
                {quote.stockPeriod?.isEndDateUndecided ? (
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
                        className={`px-6 py-3 rounded-lg font-bold flex items-center transition shadow-sm ${quote.deliveryProcessCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                      >
                        {quote.deliveryProcessCompleted ? (
                          <><CheckCircle className="w-5 h-5 mr-2 text-emerald-600" /> 納入作業 完了済</>
                        ) : (
                          <><Check className="w-5 h-5 mr-2" /> このステップを完了にする</>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'system_registration' && (
              <div className="max-w-5xl mx-auto w-full space-y-8 animate-in fade-in">
                <h3 className="text-lg font-black text-slate-800 border-b pb-2 mb-6 flex items-center">
                  <ClipboardList className="w-5 h-5 mr-2 text-indigo-600" /> システム登録
                </h3>
                
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
                   <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-emerald-500">
                     <Package className="w-8 h-8" />
                   </div>
                   <h4 className="font-bold text-emerald-900 text-lg mb-2">納入完了車両のシステム本登録</h4>
                   <p className="text-emerald-700 mb-6 text-sm">各種マスタデータへ車両情報を連携・登録します。</p>
                   
                   <button className="bg-emerald-600 text-white font-bold px-8 py-3 rounded-lg hover:bg-emerald-700 transition shadow-sm">
                     システム登録を実行する
                   </button>
                </div>

                <div className="mt-8 flex justify-end">
                  <button 
                    onClick={() => toggleComplete('systemRegistrationCompleted')}
                    className={`px-6 py-3 rounded-lg font-bold flex items-center transition shadow-sm ${quote.systemRegistrationCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                  >
                    {quote.systemRegistrationCompleted ? (
                      <><CheckCircle className="w-5 h-5 mr-2 text-emerald-600" /> システム登録 完了済</>
                    ) : (
                      <><Check className="w-5 h-5 mr-2" /> このステップを完了にする</>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      )}
      {/* Pending Contracts Modal */}
      {isAddContractModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-emerald-50 shrink-0">
              <h3 className="font-bold text-emerald-900 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-emerald-600" />
                契約・保証・定期メンテの追加
              </h3>
              <button
                onClick={() => setIsAddContractModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-gray-50/50">
              {pendingContracts.map((pc, index) => (
                <div key={pc.id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm relative">
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => removePendingContract(pc.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                    <span className="bg-emerald-100 text-emerald-800 w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2">
                      {index + 1}
                    </span>
                    契約情報の入力
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">マスタから契約を選択 <span className="text-red-500">*</span></label>
                      <select
                        className="w-full border border-gray-300 rounded p-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                        value={pc.templateId}
                        onChange={(e) => handlePendingContractChange(pc.id, e.target.value)}
                      >
                        <option value="" disabled>選択してください...</option>
                        {contracts.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                      {pc.templateId && getContractTemplate(pc.templateId) && (
                        <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-100">
                          {renderContractTerms(getContractTemplate(pc.templateId)!)}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">証跡ファイル (任意)</label>
                      <div className="flex border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 justify-center items-center relative hover:bg-emerald-50 hover:border-emerald-300 transition-all group">
                        <input type="file" multiple onChange={(e) => handlePendingContractFile(pc.id, e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <div className="text-center group-hover:text-emerald-600 transition-colors flex flex-col items-center">
                          <UploadCloud className="w-6 h-6 text-gray-400 mb-1 group-hover:text-emerald-500 transition-colors" />
                          <span className="text-xs font-medium">ファイルを追加</span>
                        </div>
                      </div>
                      {pc.files && pc.files.length > 0 && (
                        <ul className="mt-2 space-y-2">
                          {pc.files.map(f => (
                            <li key={f.id} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded text-xs hover:bg-gray-100 transition-colors">
                              <div className="flex items-center font-medium text-slate-700 truncate mr-2">
                                <FileText className="w-3 h-3 text-emerald-500 mr-2 shrink-0" />
                                 <span className="truncate">{f.name}</span>
                              </div>
                              <button onClick={() => removePendingContractFile(pc.id, f.id)} className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors shrink-0">削除</button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center pt-2">
                <button
                  onClick={addAnotherPendingContract}
                  className="text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-lg transition-colors border border-emerald-200 shadow-sm flex items-center justify-center mx-auto bg-white"
                >
                  <Plus className="w-4 h-4 mr-1" /> さらに契約を追加する
                </button>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-white shrink-0">
              <button
                onClick={() => setIsAddContractModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={savePendingContracts}
                className="px-6 py-2 bg-emerald-600 text-white text-sm font-bold rounded hover:bg-emerald-700 shadow-sm flex items-center transition-transform active:scale-95"
              >
                追加を保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
