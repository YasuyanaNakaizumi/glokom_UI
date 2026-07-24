import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SalesQuote, QuoteItem, SalesFile, ContractTemplate } from '../types';
import { TaskConfigSection } from './AddDeliveryModal';
import { X, Pencil, Truck, Archive, Warehouse, Wrench, XCircle, ExternalLink, Plus, Users, Car, Trash2, FileText, Download, UploadCloud, CheckCircle, Package, ShieldCheck, ClipboardList, ChevronRight, MessageSquare, Send, Check, MapPin, AlertTriangle, Settings } from 'lucide-react';
import { tLegacyMaster } from '../lib/i18n';

export const SalesProcessModal: React.FC<{
  onClose: () => void;
  quoteId?: string;
}> = ({ onClose, quoteId }) => {
  const { salesQuotes, addSalesQuote, updateSalesQuote, deleteSalesQuote, contracts, staff, salesPlans, tools, parking, t, lang } = useApp();
  
  
  const [receiveTasks, setReceiveTasks] = useState([{ name: t('modal.quoteEdit.receivingInspectionTask'), reportFormatId: '', paidServiceId: '' }]);
  const [receiveParkingIds, setReceiveParkingIds] = useState<Set<string>>(new Set());

  const [deliveryTasks, setDeliveryTasks] = useState([{ name: t('modal.quoteEdit.deliveryInspectionTask'), reportFormatId: '', paidServiceId: '' }]);
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

  const [activeTab, setActiveTab] = useState<'quote_prep' | 'initial_contract' | 'settings' | 'acceptance' | 'inventory' | 'delivery'>('quote_prep');
  
  // Settings answers
  const [q1, setQ1] = useState<'immediate' | 'inventory_then_delivery' | 'inventory_only'>('immediate');
  const [q2, setQ2] = useState<'yes' | 'no'>('no');
  const [settingsAnswered, setSettingsAnswered] = useState(false);
  
  const [acceptanceAssembly, setAcceptanceAssembly] = useState(false);

  const handleNextSettings = () => {
    setSettingsAnswered(true);
    setActiveTab('acceptance');
    if (q1 === 'inventory_only') {
      setQuote({...quote, stockPeriod: {...quote.stockPeriod!, isEndDateUndecided: true, endDate: ''}});
    }
  };
  
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
  const getLocalizedSampleCustomerName = (name: string) => {
    const sampleKeyMap: Record<string, string> = {
      '山田建設': 'sample.customer.c1_name',
      'ABC開発': 'sample.customer.c2_name',
      '山田建機': 'sample.customer.c3_name',
      '佐藤建設': 'sample.customer.c4_name',
      '高橋土木': 'sample.customer.c5_name',
      'A社 (山田建機)': 'sales.quoteCustomer',
      'A社 (Yamada Construction Machinery)': 'sales.quoteCustomer',
    };
    const sampleKey = sampleKeyMap[name];
    return sampleKey ? t(sampleKey) : name;
  };

  const renderContractTerms = (template: ContractTemplate) => {
    const parts = [];
    const periodLabel = t('modal.quoteEdit.contractPeriodLabel');
    if (template.contractPeriodRule && template.contractPeriodRule !== 'none') {
      if (template.contractPeriodRule === 'months' || template.contractPeriodRule === 'years') {
         parts.push(`${periodLabel}: ${template.contractPeriodValue}${template.contractPeriodUnit === 'years' ? t('modal.quoteEdit.yearUnit') : t('modal.quoteEdit.monthUnit')}`);
      } else if (template.contractPeriodRule === 'smr') {
         parts.push(`${periodLabel}: ${template.contractPeriodSmr}SMR ${t('modal.quoteEdit.contractUntil')}`);
      } else if (template.contractPeriodRule === 'whichever_first') {
         parts.push(`${periodLabel}: ${template.contractPeriodValue}${template.contractPeriodUnit === 'years' ? t('modal.quoteEdit.yearUnit') : t('modal.quoteEdit.monthUnit')} ${t('modal.quoteEdit.contractOr')} ${template.contractPeriodSmr}SMR ${t('modal.quoteEdit.contractWhicheverFirst')}`);
      }
    } else if (template.months || template.smr) {
      if (template.months && template.smr) {
         parts.push(`${periodLabel}: ${template.months}${t('modal.quoteEdit.monthUnit')} ${t('modal.quoteEdit.contractOr')} ${template.smr}SMR ${t('modal.quoteEdit.contractWhicheverFirst')}`);
      } else if (template.months) {
         parts.push(`${periodLabel}: ${template.months}${t('modal.quoteEdit.monthUnit')}`);
      } else if (template.smr) {
         parts.push(`${periodLabel}: ${template.smr}SMR`);
      }
    }
    return parts.join(' / ') || t('modal.quoteEdit.contractNoSetting');
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

  const EditableHeaderField = ({ 
    label, 
    value, 
    onChange, 
    placeholder,
    colorScheme = 'indigo'
  }: { 
    label: string, 
    value: string, 
    onChange: (val: string) => void, 
    placeholder: string,
    colorScheme?: 'indigo' | 'slate'
  }) => {
    const [isEditing, setIsEditing] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
  
    React.useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isEditing]);
  
    if (isEditing) {
      return (
        <div className="flex items-center text-sm bg-white border border-indigo-400 shadow-[0_0_0_2px_rgba(99,102,241,0.2)] rounded-md px-3 py-1 w-[160px] xl:w-[200px] h-[28px] transition-all">
          <span className="text-slate-400 mr-1.5 text-xs font-medium shrink-0">{label}:</span>
          <input 
            ref={inputRef}
            type="text" 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
            className="font-bold text-slate-800 bg-transparent border-0 focus:ring-0 p-0 w-full text-sm outline-none" 
            placeholder={placeholder} 
          />
        </div>
      );
    }
  
    return (
      <div 
        onClick={() => setIsEditing(true)}
        className={`flex items-center text-sm font-bold rounded-md px-3 py-1 cursor-pointer transition-colors group h-[28px] ${
          colorScheme === 'indigo' 
            ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' 
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        <span className={`mr-1.5 text-xs font-medium shrink-0 ${colorScheme === 'indigo' ? 'text-indigo-400' : 'text-slate-400'}`}>{label}:</span>
        <span className={`truncate max-w-[200px] ${value ? '' : 'opacity-60 font-normal'}`}>
          {value || placeholder}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm rounded-xl">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center text-rose-600 mb-4">
              <Trash2 className="w-6 h-6 mr-2" />
              <h3 className="font-bold text-lg">{t('modal.quoteEdit.deleteConfirmTitle')}</h3>
            </div>
            <p className="text-slate-600 text-sm mb-6 font-medium">
              {t('modal.quoteEdit.deleteConfirmBody')}
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                {t('common.cancel')}
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
                {t('common.delete')}
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
               <Plus className="w-6 h-6 mr-2 text-indigo-600" />{t('modal.quoteEdit.step1Title')}
             </h2>
             <p className="text-sm text-slate-500 font-bold">{t('modal.quoteEdit.step1Description')}</p>
           </div>
           
           <div className="space-y-4 mb-8">
             <div>
               <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('modal.quoteEdit.customerLabel')} <span className="text-red-500">*</span></label>
               <input 
                 type="text" 
                 value={quote.customerName || ''} 
                 onChange={e => setQuote({...quote, customerName: e.target.value})} 
                 className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm" 
                 placeholder={t('modal.quoteEdit.customerPlaceholder')} 
                 autoFocus
               />
             </div>
             <div>
               <label className="block text-sm font-bold text-slate-700 mb-1.5">{t('modal.quoteEdit.modelLabel')} <span className="text-red-500">*</span></label>
               <input 
                 type="text" 
                 value={quote.targetModelName || ''} 
                 onChange={e => setQuote({...quote, targetModelName: e.target.value})} 
                 className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm" 
                 placeholder={t('modal.quoteEdit.modelPlaceholder')} 
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
             {t('common.next')} <ChevronRight className="w-5 h-5 ml-1" />
           </button>
        </div>
      ) : (

<div className="bg-white md:rounded-xl shadow-2xl w-full h-full md:w-[98vw] xl:max-w-[1700px] h-[95dvh] flex flex-col relative overflow-hidden animate-in fade-in zoom-in duration-200">
        <header className="bg-slate-50 px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex flex-col md:flex-row md:justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex flex-col xl:flex-row xl:items-center gap-3">
                <h2 className="text-xl font-black text-slate-800 leading-tight">
                  {t('modal.quoteEdit.headerTitle')}
                </h2>
                <div className="flex flex-wrap gap-2 items-center xl:ml-4">
                  <EditableHeaderField
                    label={t('modal.quoteEdit.customerLabel')}
                    value={quote.customerName || ''}
                    onChange={(val) => setQuote({...quote, customerName: val})}
                    placeholder={t('modal.quoteEdit.customerPlaceholder')}
                  />
                  <EditableHeaderField
                    label={t('modal.quoteEdit.modelLabel')}
                    value={quote.targetModelName || ''}
                    onChange={(val) => setQuote({...quote, targetModelName: val})}
                    placeholder={t('modal.quoteEdit.modelPlaceholder')}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 absolute top-4 right-4 md:static">
              
              {quoteId && (
                <button onClick={() => setShowDeleteConfirm(true)} className="p-2 hover:bg-rose-100 text-rose-500 rounded-full shrink-0 transition-colors bg-rose-50 mr-1" title={t('common.delete')}>
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
{allCompleted && (
                <button onClick={handleCloseProcess} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded font-bold text-sm transition shadow-sm flex items-center">
                  <Check className="w-4 h-4 mr-1" /> {t('modal.quoteEdit.closeProcessButton')}
                </button>
              )}
              <button onClick={() => handleSave(true)} className="p-2 hover:bg-slate-200 rounded-full shrink-0 transition-colors bg-slate-100"><X className="w-5 h-5 text-slate-600" /></button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Left Tabs */}
          <div className="md:w-64 w-full bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col p-4 shrink-0 overflow-y-auto">
            <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
              <button 
                onClick={() => setActiveTab('quote_prep')}
                className={`w-auto md:w-full shrink-0 flex items-center p-3 rounded-lg text-left text-sm font-bold transition-colors ${activeTab === 'quote_prep' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700'}`}
              >
                {renderTabIcon(quote.quotePrepCompleted)}
                {t('views.dashboard.quotePrepTitle')}
              </button>
              <button 
                onClick={() => setActiveTab('initial_contract')}
                className={`w-auto md:w-full shrink-0 flex items-center p-3 rounded-lg text-left text-sm font-bold transition-colors ${activeTab === 'initial_contract' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700'}`}
              >
                {renderTabIcon(quote.initialContractCompleted)}
                {t('modal.quoteEdit.contractsSectionTitle')}
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-auto md:w-full shrink-0 flex items-center p-3 rounded-lg text-left text-sm font-bold transition-colors ${activeTab === 'settings' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700'}`}
              >
                {renderTabIcon(quote.receiveProcessCompleted && quote.stockProcessCompleted && quote.deliveryProcessCompleted)}
                {t('modal.quoteEdit.receivingNoticeTitle')}
              </button>
              
              {settingsAnswered && (
                <div className="flex flex-col gap-1 ml-4 border-l-2 border-indigo-100 pl-2">
                  <button 
                    onClick={() => setActiveTab('acceptance')}
                    className={`w-auto md:w-full shrink-0 flex items-center p-2 rounded-lg text-left text-sm font-bold transition-colors ${activeTab === 'acceptance' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100 text-slate-600'}`}
                  >
                    {renderTabIcon(quote.receiveProcessCompleted)}
                    {t('modal.quoteEdit.receivingWork')}
                  </button>
                  {q1 !== 'immediate' && (
                    <button 
                      onClick={() => setActiveTab('inventory')}
                      className={`w-auto md:w-full shrink-0 flex items-center p-2 rounded-lg text-left text-sm font-bold transition-colors ${activeTab === 'inventory' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100 text-slate-600'}`}
                    >
                      {renderTabIcon(quote.stockProcessCompleted)}
                      {t('modal.quoteEdit.inventorySettings')}
                    </button>
                  )}
                  {q1 !== 'inventory_only' && (
                    <button 
                      onClick={() => setActiveTab('delivery')}
                      className={`w-auto md:w-full shrink-0 flex items-center p-2 rounded-lg text-left text-sm font-bold transition-colors ${activeTab === 'delivery' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100 text-slate-600'}`}
                    >
                      {renderTabIcon(quote.deliveryProcessCompleted)}
                      {t('modal.quoteEdit.deliveryWork')}
                    </button>
                  )}
                </div>
              )}
            </nav>
            <div className="mt-auto pt-6">
              <button onClick={() => handleSave()} className="w-full py-2 bg-indigo-600 text-white rounded font-bold text-sm hover:bg-indigo-700 transition shadow-sm">
                {t('common.save')}
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white overflow-y-auto p-4 md:p-8">
            

            
            {activeTab === 'quote_prep' && (
              <div className="max-w-5xl mx-auto w-full space-y-8 animate-in fade-in">
                <div>
                  <h3 className="text-lg font-black text-slate-800 border-b pb-2 mb-6 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-indigo-600" /> {t('views.dashboard.quotePrepTitle')}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <a href="#" className="flex items-center justify-center p-4 border border-amber-200 rounded-xl bg-amber-50/50 text-amber-800 hover:bg-amber-100 transition shadow-sm group">
                      <ExternalLink className="w-5 h-5 mr-2 text-amber-500 group-hover:text-amber-600" />
                      <span className="font-bold">{t('views.dashboard.quoteSite')}</span>
                    </a>
                    <a href="#" className="flex items-center justify-center p-4 border border-amber-200 rounded-xl bg-amber-50/50 text-amber-800 hover:bg-amber-100 transition shadow-sm group">
                      <ExternalLink className="w-5 h-5 mr-2 text-amber-500 group-hover:text-amber-600" />
                      <span className="font-bold">{t('views.dashboard.specialOrderRequest')}</span>
                    </a>
                    <a href="#" className="flex items-center justify-center p-4 border border-amber-200 rounded-xl bg-amber-50/50 text-amber-800 hover:bg-amber-100 transition shadow-sm group">
                      <ExternalLink className="w-5 h-5 mr-2 text-amber-500 group-hover:text-amber-600" />
                      <span className="font-bold">{t('views.dashboard.usedCarSite')}</span>
                    </a>
                    <a href="#" className="flex items-center justify-center p-4 border border-amber-200 rounded-xl bg-amber-50/50 text-amber-800 hover:bg-amber-100 transition shadow-sm group">
                      <ExternalLink className="w-5 h-5 mr-2 text-amber-500 group-hover:text-amber-600" />
                      <span className="font-bold">{t('views.dashboard.tradeInAppraisalSite')}</span>
                    </a>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-bold text-slate-700 mb-2">{t('modal.quoteEdit.memoLabel')}</label>
                      <textarea
                        value={quote.memo || ''}
                        onChange={e => setQuote({...quote, memo: e.target.value})}
                        className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px]"
                        placeholder={t('modal.quoteEdit.memoPlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">{t('modal.quoteEdit.finalAmountLabel')}</label>
                      <div className="flex items-center">
                        <input 
                          type="number" 
                          value={quote.finalAmount || ''} 
                          onChange={e => setQuote({...quote, finalAmount: Number(e.target.value)})}
                          className="w-full max-w-md border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-right font-mono text-lg font-bold"
                          placeholder={t('modal.quoteEdit.finalAmountPlaceholder')}
                        />
                        <span className="ml-3 font-bold text-slate-500">{t('common.yen')}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">{t('modal.quoteEdit.salesTargetLinkLabel')}</label>
                      <select 
                        value={quote.salesTargetId || ''}
                        onChange={e => setQuote({...quote, salesTargetId: e.target.value})}
                        className="w-full max-w-md border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="">{t('modal.quoteEdit.noLinkOption')}</option>
                        {salesTargets.map(st => (
                          <option key={st.id} value={st.id}>{st.startMonth} - {getLocalizedSampleCustomerName(st.customerName)} ({st.amount.toLocaleString()}{t('common.yen')})</option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-500 mt-2">{t('modal.quoteEdit.salesTargetLinkHelp')}</p>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button 
                      onClick={() => toggleComplete('quotePrepCompleted')}
                      className={`px-6 py-3 rounded-lg font-bold flex items-center transition shadow-sm ${quote.quotePrepCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                    >
                      {quote.quotePrepCompleted ? (
                        <><CheckCircle className="w-5 h-5 mr-2 text-emerald-600" /> {t('modal.quoteEdit.quotePrepCompleted')}</>
                      ) : (
                        <><Check className="w-5 h-5 mr-2" /> {t('modal.quoteEdit.stepCompleteButton')}</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'initial_contract' && (
              <div className="max-w-5xl mx-auto w-full space-y-8 animate-in fade-in">
                <h3 className="text-lg font-black text-slate-800 border-b pb-2 mb-6 flex items-center">
                  <ShieldCheck className="w-5 h-5 mr-2 text-indigo-600" /> {t('modal.quoteEdit.contractsSectionTitle')}
                </h3>
                
                <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-t-4 border-t-emerald-500">
                  <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <div>
                      <h4 className="font-bold text-lg flex items-center text-slate-800">
                        <ShieldCheck className="w-5 h-5 mr-2 text-emerald-600" /> {t('modal.quoteEdit.contractNoticeTitle')}
                      </h4>
                      <p className="text-sm text-slate-500 mt-1">{t('modal.quoteEdit.contractNoticeBody')}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleOpenAddContractModal}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-colors shrink-0 shadow-sm"
                      >
                        <Plus className="w-4 h-4 mr-1" /> {t('common.add')}
                      </button>
                    </div>
                  </div>
                  {(!quote.appliedContracts || quote.appliedContracts.length === 0) ? (
                    <div className="text-center py-10 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      {t('modal.quoteEdit.noAppliedContracts')}
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
                                <Trash2 className="w-4 h-4 mr-1" /> {t('common.delete')}
                              </button>
                            </div>
                            <div className="p-4 bg-white">
                              <div className="text-sm font-medium text-gray-700 mb-2">{t('modal.quoteEdit.evidenceFilesTitle')}</div>
                              <div className="mb-3">
                                <label className="block text-xs font-medium text-gray-700 mb-1">{t('modal.quoteEdit.originalStorageLabel')}</label>
                                <select 
                                  className="w-full border rounded px-2 py-1.5 text-sm"
                                  value={ac.originalDocumentLocationId || ''}
                                  onChange={(e) => {
                                    const updated = quote.appliedContracts!.map(c => c.id === ac.id ? { ...c, originalDocumentLocationId: e.target.value } : c);
                                    setQuote({ ...quote, appliedContracts: updated });
                                  }}
                                >
                                  <option value="">{t('modal.quoteEdit.contractNoSetting')}</option>
                                  {parking.filter(p => p.type === '書物棚').map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                  ))}
                                  {parking.filter(p => p.type !== '書物棚').map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.type || t('modal.quoteEdit.parkingDefaultLabel')})</option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 justify-center items-center relative hover:bg-indigo-50 hover:border-indigo-300 transition-all group mb-3">
                                <input type="file" multiple onChange={(e) => handleContractFileUpload(ac.id, e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <div className="text-center group-hover:text-indigo-600 transition-colors flex flex-col items-center">
                                  <UploadCloud className="w-6 h-6 text-gray-400 mb-1 group-hover:text-indigo-500 transition-colors" />
                                  <span className="text-xs font-medium">{t('modal.quoteEdit.fileAddHint')}</span>
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
                                        <button onClick={() => handleRemoveContractFile(ac.id, f.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors shrink-0">{t('common.delete')}</button>
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
                      <><CheckCircle className="w-5 h-5 mr-2 text-emerald-600" /> {t('modal.quoteEdit.initialContractCompleted')}</>
                    ) : (
                      <><Check className="w-5 h-5 mr-2" /> {t('modal.quoteEdit.stepCompleteButton')}</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-4xl mx-auto w-full animate-in fade-in py-4">
                <h3 className="text-xl font-black text-slate-800 flex items-center justify-center mb-8">
                  <Settings className="w-6 h-6 mr-3 text-indigo-600" />
                  {t('modal.quoteEdit.receivingNoticeTitle')}
                </h3>
                
                <div className="bg-white p-8 md:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-10">
                  {/* Q1 */}
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center mr-3 shrink-0">1</div>
                      <h4 className="text-lg font-bold text-slate-900">{t('modal.quoteEdit.q1Label')}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:pl-11">
                      {[
                        { id: 'immediate', label: t('modal.quoteEdit.q1Immediate'), icon: <Truck className={`w-6 h-6 mb-3 ${q1 === 'immediate' ? 'text-indigo-600' : 'text-slate-400'}`} /> },
                        { id: 'inventory_then_delivery', label: t('modal.quoteEdit.q1InventoryDelivery'), icon: <Archive className={`w-6 h-6 mb-3 ${q1 === 'inventory_then_delivery' ? 'text-indigo-600' : 'text-slate-400'}`} /> },
                        { id: 'inventory_only', label: t('modal.quoteEdit.q1Inventory'), icon: <Warehouse className={`w-6 h-6 mb-3 ${q1 === 'inventory_only' ? 'text-indigo-600' : 'text-slate-400'}`} /> },
                      ].map(opt => (
                        <label key={opt.id} className={`flex flex-col items-center justify-center p-6 border-2 rounded-xl cursor-pointer transition-all ${q1 === opt.id ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}>
                          <input
                            type="radio"
                            name="q1"
                            value={opt.id}
                            checked={q1 === opt.id}
                            onChange={(e) => setQ1(e.target.value as any)}
                            className="sr-only"
                          />
                          {opt.icon}
                          <span className={`font-bold text-sm text-center ${q1 === opt.id ? 'text-indigo-900' : 'text-slate-600'}`}>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Q2 */}
                  <div>
                    <div className="flex items-center mb-6">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center mr-3 shrink-0">2</div>
                      <h4 className="text-lg font-bold text-slate-900">{t('modal.quoteEdit.q2Label')}</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:pl-11">
                      {[
                        { id: 'yes', label: t('modal.quoteEdit.q2Yes'), icon: <Wrench className={`w-5 h-5 mr-3 shrink-0 ${q2 === 'yes' ? 'text-indigo-600' : 'text-slate-400'}`} /> },
                        { id: 'no', label: t('modal.quoteEdit.q2No'), icon: <XCircle className={`w-5 h-5 mr-3 shrink-0 ${q2 === 'no' ? 'text-indigo-600' : 'text-slate-400'}`} /> },
                      ].map(opt => (
                        <label key={opt.id} className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all ${q2 === opt.id ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}>
                          <input
                            type="radio"
                            name="q2"
                            value={opt.id}
                            checked={q2 === opt.id}
                            onChange={(e) => setQ2(e.target.value as any)}
                            className="sr-only"
                          />
                          {opt.icon}
                          <span className={`font-bold ${q2 === opt.id ? 'text-indigo-900' : 'text-slate-600'}`}>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8 flex justify-end">
                    <button
                      onClick={handleNextSettings}
                      className="flex items-center px-8 py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold transition-colors shadow-sm"
                    >
                      {settingsAnswered ? t('common.save') : t('common.next')}
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'acceptance' || activeTab === 'inventory' || activeTab === 'delivery') && (
              <div className="max-w-5xl mx-auto w-full space-y-6 animate-in fade-in">
                {/* タブコンテンツ */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  {activeTab === 'acceptance' && (
                    <div className="space-y-6 animate-in fade-in">
                      <h3 className="text-lg font-black text-slate-800 border-b pb-2 mb-6 flex items-center">
                        <Package className="w-5 h-5 mr-2 text-indigo-600" /> {t('modal.quoteEdit.receivingWork')}
                      </h3>
                      <h4 className="text-md font-bold text-slate-900">{t('modal.quoteEdit.receivingWorkItemTitle')}</h4>
                      <div className="space-y-4">
                        <label className="flex items-start">
                          <div className="flex items-center h-5">
                            <input type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" defaultChecked disabled />
                          </div>
                          <div className="ml-3 text-sm">
                            <span className="font-bold text-slate-900">{t('modal.quoteEdit.receivingWork')}</span>
                            <p className="text-slate-500">{t('modal.quoteEdit.receivingWorkItemDescription')}</p>
                          </div>
                        </label>

                        {q2 === 'yes' && (
                          <label className="flex items-start">
                            <div className="flex items-center h-5">
                              <input type="checkbox" className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                checked={acceptanceAssembly}
                                onChange={(e) => setAcceptanceAssembly(e.target.checked)}
                              />
                            </div>
                            <div className="ml-3 text-sm">
                              <span className="font-bold text-slate-900">{t('modal.quoteEdit.assemblyTitle')}</span>
                              <p className="text-slate-500">{t('modal.quoteEdit.assemblyDescription')}</p>
                            </div>
                          </label>
                        )}
                      </div>
                      
                      <div className="border-t border-slate-200 pt-6 mt-6">
                        <TaskConfigSection 
                          title={t('modal.quoteEdit.receivingWorkSettingTitle')} 
                          defaultTasks={q2 === 'yes' ? [t('modal.quoteEdit.receivingInspectionTask'), t('modal.quoteEdit.washTask'), t('modal.quoteEdit.assemblyTitle')] : [t('modal.quoteEdit.receivingInspectionTask'), t('modal.quoteEdit.washTask')]} 
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
                      </div>
                      
                      <div className="mt-8 flex justify-end">
                        <button 
                          onClick={() => toggleComplete('receiveProcessCompleted')}
                          className={`px-6 py-3 rounded-lg font-bold flex items-center transition shadow-sm ${quote.receiveProcessCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                        >
                          {quote.receiveProcessCompleted ? (
                            <><CheckCircle className="w-5 h-5 mr-2 text-emerald-600" /> {t('modal.quoteEdit.receivingWorkCompleted')}</>
                          ) : (
                            <><Check className="w-5 h-5 mr-2" /> {t('modal.quoteEdit.stepCompleteButton')}</>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'inventory' && (
                    <div className="space-y-6 animate-in fade-in">
                      <h3 className="text-lg font-black text-slate-800 border-b pb-2 mb-6 flex items-center">
                        <Package className="w-5 h-5 mr-2 text-indigo-600" /> {t('modal.quoteEdit.inventorySettings')}
                      </h3>
                      <h4 className="text-md font-bold text-slate-900 mb-6 pb-2">{t('modal.quoteEdit.inventoryPeriodTitle')}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">{t('modal.quoteEdit.inventoryStartDateLabel')}</label>
                          <input type="date" value={quote.stockPeriod?.startDate || quote.receiveWork?.date || ''} onChange={e => setQuote({...quote, stockPeriod: {...quote.stockPeriod!, startDate: e.target.value}})} className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-indigo-500" />
                          <p className="text-xs text-slate-500 mt-1">{t('modal.quoteEdit.inventoryStartDateNote')}</p>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-bold text-slate-700">{t('modal.quoteEdit.inventoryEndDateLabel')}</label>
                            <label className="flex items-center text-sm text-slate-600 cursor-pointer">
                              <input type="checkbox" disabled={q1 === 'inventory_only'} checked={quote.stockPeriod?.isEndDateUndecided || false} onChange={e => setQuote({...quote, stockPeriod: {...quote.stockPeriod!, isEndDateUndecided: e.target.checked, endDate: e.target.checked ? '' : quote.stockPeriod?.endDate || ''}})} className="mr-2 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50" />
                              {t('modal.quoteEdit.inventoryNotDecided')}
                            </label>
                          </div>
                          <input type="date" disabled={quote.stockPeriod?.isEndDateUndecided} value={quote.stockPeriod?.endDate || ''} onChange={e => setQuote({...quote, stockPeriod: {...quote.stockPeriod!, endDate: e.target.value}})} className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400" />
                          {q1 === 'inventory_only' && (
                            <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded mt-2">
                              {t('modal.quoteEdit.inventoryEndDateNote')}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <h4 className="font-bold text-slate-700 mb-2 text-sm flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-indigo-500" />
                        {t('modal.quoteEdit.inventoryLocationLabel')}
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
                        <option value="">{t('modal.quoteEdit.inventoryNoSelection')}</option>
                        {parking.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      
                      <div className="mt-8 flex justify-end">
                        <button 
                          onClick={() => toggleComplete('stockProcessCompleted')}
                          className={`px-6 py-3 rounded-lg font-bold flex items-center transition shadow-sm ${quote.stockProcessCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                        >
                          {quote.stockProcessCompleted ? (
                            <><CheckCircle className="w-5 h-5 mr-2 text-emerald-600" /> {t('modal.quoteEdit.inventoryCompleted')}</>
                          ) : (
                            <><Check className="w-5 h-5 mr-2" /> {t('modal.quoteEdit.stepCompleteButton')}</>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'delivery' && (
                    <div className="space-y-6 animate-in fade-in">
                      <h3 className="text-lg font-black text-slate-800 border-b pb-2 mb-6 flex items-center">
                        <Package className="w-5 h-5 mr-2 text-indigo-600" /> {t('modal.quoteEdit.deliveryWork')}
                      </h3>
                      {quote.stockPeriod?.isEndDateUndecided && q1 !== 'immediate' ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center text-amber-800">
                          <AlertTriangle className="w-8 h-8 mx-auto mb-4 text-amber-500" />
                          <h4 className="font-bold text-lg mb-2">{t('modal.quoteEdit.deliveryUnavailableTitle')}</h4>
                          <p className="text-sm font-medium">{t('modal.quoteEdit.deliveryUnavailableBody')}</p>
                        </div>
                      ) : (
                        <>
                          <TaskConfigSection 
                            title={t('modal.quoteEdit.deliveryWorkSettingTitle')} 
                            defaultTasks={[t('modal.quoteEdit.deliveryInspectionTask'), t('modal.quoteEdit.customerBriefingTask'), t('modal.quoteEdit.handoverTask')]} 
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
                                <><CheckCircle className="w-5 h-5 mr-2 text-emerald-600" /> {t('modal.quoteEdit.deliveryCompleted')}</>
                              ) : (
                                <><Check className="w-5 h-5 mr-2" /> {t('modal.quoteEdit.stepCompleteButton')}</>
                              )}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
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
                {t('modal.quoteEdit.addContractModalTitle')}
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
                    {t('modal.quoteEdit.contractInfoTitle')}
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('modal.quoteEdit.selectContractLabel')} <span className="text-red-500">*</span></label>
                      <select
                        className="w-full border border-gray-300 rounded p-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                        value={pc.templateId}
                        onChange={(e) => handlePendingContractChange(pc.id, e.target.value)}
                      >
                        <option value="" disabled>{t('modal.quoteEdit.choosePlease')}</option>
                        {contracts.map(c => (
                          <option key={c.id} value={c.id}>{tLegacyMaster(lang, 'contract', c.id, 'name', c.title)}</option>
                        ))}
                      </select>
                      {pc.templateId && getContractTemplate(pc.templateId) && (
                        <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-100">
                          {renderContractTerms(getContractTemplate(pc.templateId)!)}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('modal.quoteEdit.contractEvidenceOptional')}</label>
                      <div className="mb-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">{t('modal.quoteEdit.contractOriginalStorageLabel')}</label>
                        <select 
                          className="w-full border rounded px-2 py-1.5 text-sm"
                          value={pc.originalDocumentLocationId || ''}
                          onChange={(e) => {
                            const updated = pendingContracts.map(c => c.id === pc.id ? { ...c, originalDocumentLocationId: e.target.value } : c);
                            setPendingContracts(updated);
                          }}
                        >
                          <option value="">{t('modal.quoteEdit.contractNoSetting')}</option>
                          {parking.filter(p => p.type === '書物棚').map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                          {parking.filter(p => p.type !== '書物棚').map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.type || t('modal.quoteEdit.parkingDefaultLabel')})</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 justify-center items-center relative hover:bg-emerald-50 hover:border-emerald-300 transition-all group">
                        <input type="file" multiple onChange={(e) => handlePendingContractFile(pc.id, e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <div className="text-center group-hover:text-emerald-600 transition-colors flex flex-col items-center">
                          <UploadCloud className="w-6 h-6 text-gray-400 mb-1 group-hover:text-emerald-500 transition-colors" />
                          <span className="text-xs font-medium">{t('modal.quoteEdit.evidenceUpload')}</span>
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
                              <button onClick={() => removePendingContractFile(pc.id, f.id)} className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors shrink-0">{t('common.delete')}</button>
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
                  <Plus className="w-4 h-4 mr-1" /> {t('modal.quoteEdit.addAnotherContract')}
                </button>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-white shrink-0">
              <button
                onClick={() => setIsAddContractModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={savePendingContracts}
                className="px-6 py-2 bg-emerald-600 text-white text-sm font-bold rounded hover:bg-emerald-700 shadow-sm flex items-center transition-transform active:scale-95"
              >
                {t('modal.quoteEdit.saveAdd')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
