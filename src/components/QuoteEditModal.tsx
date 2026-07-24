import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { SalesQuote, QuoteItem, SalesFile, ContractTemplate } from '../types';
import { X, ExternalLink, Plus, Users, Car, Trash2, FileText, Download, UploadCloud, CheckCircle, Package, ShieldCheck, ClipboardList, ChevronRight, MessageSquare, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import { TaskConfigSection } from './AddDeliveryModal';
import { tLegacyMaster } from '../lib/i18n';

export const QuoteEditModal: React.FC<{ 
  onClose: () => void; 
  quoteId?: string; 
  leadId?: string;
  initialDealType?: '新車販売' | '中古車販売' | '中古車買取のみ';
  initialHasTradeIn?: boolean;
  initialCustomerName?: string;
  initialTargetModelName?: string;
}> = ({ onClose, quoteId, leadId, initialDealType, initialHasTradeIn, initialCustomerName, initialTargetModelName }) => {
  const { salesQuotes, salesLeads, addSalesQuote, updateSalesQuote, contracts, tools, staff, t, lang } = useApp();

  const [step, setStep] = useState<1 | 2>(quoteId ? 2 : 1);
  const [activeTab, setActiveTab] = useState<'initial_contract' | 'delivery'>('initial_contract');
  const [subTab, setSubTab] = useState<'receiving' | 'inventory' | 'delivery'>('receiving');

  const [receivingDate, setReceivingDate] = useState('');
  const [receivingStaffIds, setReceivingStaffIds] = useState<string[]>([]);
  const [receivingTasks, setReceivingTasks] = useState([{ name: t('modal.quoteEdit.receivingWork'), reportFormatId: 'receiving_inspection', paidServiceId: '' }]);

  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryStaffIds, setDeliveryStaffIds] = useState<string[]>([]);
  const [deliveryTasks, setDeliveryTasks] = useState([{ name: t('modal.quoteEdit.deliveryWork'), reportFormatId: 'delivery_inspection', paidServiceId: '' }]);

  const [isAddContractModalOpen, setIsAddContractModalOpen] = useState(false);
  const [pendingContracts, setPendingContracts] = useState<{id: string, templateId: string, files: SalesFile[]}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = React.useRef<HTMLDivElement>(null);

  const [quote, setQuote] = useState<Partial<SalesQuote>>({
    customerName: initialCustomerName || '',
    targetModelName: initialTargetModelName || '',
    status: '見積作成中',
    dealType: initialDealType || '新車販売',
    hasTradeIn: initialHasTradeIn || false,
    items: [],
    services: [],
    appliedContracts: [],
    files: [],
    createdAt: new Date().toISOString()
  });

  const [chatMessages, setChatMessages] = useState<{id: string, text: string, sender: string, time: string, isSelf: boolean}[]>([]);

  useEffect(() => {
    if (quote.chatMessages) {
      setChatMessages(quote.chatMessages);
    }
  }, [quote.chatMessages]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, activeTab]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = {
      id: Math.random().toString(36).substr(2, 9),
      text: chatInput,
      sender: t('tasks.chatSelfSender'),
      time: new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }),
      isSelf: true
    };
    setChatMessages([...chatMessages, newMsg]);
    setQuote(prev => ({ ...prev, chatMessages: [...chatMessages, newMsg] }));
    setChatInput("");
  };

  useEffect(() => {
    if (quoteId) {
      const existing = salesQuotes.find(q => q.id === quoteId);
      if (existing) setQuote(existing);
    } else if (leadId) {
      const lead = salesLeads.find(l => l.id === leadId);
      const existingQuotes = salesQuotes.filter(q => q.leadId === leadId);
      const nextRevision = existingQuotes.length > 0 ? Math.max(...existingQuotes.map(q => q.revision || 1)) + 1 : 1;
      
      if (lead) {
        setQuote(prev => ({ ...prev, leadId: lead.id, customerName: lead.customerName, revision: nextRevision }));
      }
    }
  }, [quoteId, leadId, salesQuotes, salesLeads]);

  const handleSave = () => {
    if (quoteId) {
      updateSalesQuote(quoteId, quote);
    } else {
      addSalesQuote(quote as Omit<SalesQuote, 'id'>);
    }
    onClose();
  };

  const addItem = () => {
    setQuote(prev => ({
      ...prev,
      items: [...(prev.items || []), { id: `i${Date.now()}`, name: '', originalPrice: 0, finalPrice: 0 }]
    }));
  };

  const removeItem = (id: string) => {
    setQuote(prev => ({
      ...prev,
      items: (prev.items || []).filter(i => i.id !== id)
    }));
  };

  const updateItem = (id: string, updates: Partial<QuoteItem>) => {
    setQuote(prev => ({
      ...prev,
      items: (prev.items || []).map(i => i.id === id ? { ...i, ...updates } : i)
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setQuote(prev => ({
        ...prev,
        files: [...(prev.files || []), { id: `f${Date.now()}`, name: file.name, type: file.type }]
      }));
    }
  };

  const removeFile = (id: string) => {
    setQuote(prev => ({
      ...prev,
      files: (prev.files || []).filter(f => f.id !== id)
    }));
  };

  const toggleService = (title: string) => {
    setQuote(prev => {
      const services = prev.services || [];
      if (services.includes(title)) {
        return { ...prev, services: services.filter(s => s !== title) };
      } else {
        return { ...prev, services: [...services, title] };
      }
    });
  };

  const changeStatus = (newStatus: SalesQuote['status']) => {
    setQuote(prev => ({ ...prev, status: newStatus }));
  };

  const updateReceivingSetting = (key: string, value: any) => {
    setQuote(prev => ({
      ...prev,
      receivingSettings: {
        ...(prev.receivingSettings || { answered: false, deliveryType: 'immediate', isImmediateDelivery: true, needsAssembly: false }),
        [key]: value
      }
    }));
  };

  const handleAddAppliedContract = (templateId: string) => {
    if (!templateId) return;
    const newApplied = {
      id: Math.random().toString(36).substr(2, 9),
      templateId,
      files: []
    };
    setQuote(prev => ({
      ...prev,
      appliedContracts: [...(prev.appliedContracts || []), newApplied]
    }));
  };

  const handleRemoveAppliedContract = (id: string) => {
    setQuote(prev => ({
      ...prev,
      appliedContracts: (prev.appliedContracts || []).filter(ac => ac.id !== id)
    }));
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

  const addAnotherPendingContract = () => {
    setPendingContracts(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), templateId: '', files: [] }]);
  };

  const removePendingContract = (id: string) => {
    setPendingContracts(prev => prev.filter(c => c.id !== id));
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
          ac.id === contractId ? { ...ac, files: [...(ac.files || []), ...newFiles] } : ac
        )
      }));
    }
  };

  const handleRemoveContractFile = (contractId: string, fileId: string) => {
    setQuote(prev => ({
      ...prev,
      appliedContracts: (prev.appliedContracts || []).map(ac => 
        ac.id === contractId ? { ...ac, files: (ac.files || []).filter(f => f.id !== fileId) } : ac
      )
    }));
  };

  const getContractTemplate = (id: string) => contracts.find(c => c.id === id);

  const renderContractTerms = (template: ContractTemplate) => {
    const parts = [];
    if (template.contractPeriodRule && template.contractPeriodRule !== 'none') {
      if (template.contractPeriodRule === 'months' || template.contractPeriodRule === 'years') {
         parts.push(`${t('modal.quoteEdit.contractPeriodLabel')}: ${template.contractPeriodValue}${template.contractPeriodUnit === 'years' ? t('modal.quoteEdit.yearUnit') : t('modal.quoteEdit.monthUnit')}`);
      } else if (template.contractPeriodRule === 'smr') {
         parts.push(`${t('modal.quoteEdit.contractPeriodLabel')}: ${template.contractPeriodSmr}SMR${t('modal.quoteEdit.contractUntil')}`);
      } else if (template.contractPeriodRule === 'whichever_first') {
         parts.push(`${t('modal.quoteEdit.contractPeriodLabel')}: ${template.contractPeriodValue}${template.contractPeriodUnit === 'years' ? t('modal.quoteEdit.yearUnit') : t('modal.quoteEdit.monthUnit')} ${t('modal.quoteEdit.contractOr')} ${template.contractPeriodSmr}SMR ${t('modal.quoteEdit.contractWhicheverFirst')}`);
      }
    } else if (template.months || template.smr) {
      if (template.months && template.smr) {
         parts.push(`${t('modal.quoteEdit.contractPeriodLabel')}: ${template.months}${t('modal.quoteEdit.monthUnit')} ${t('modal.quoteEdit.contractOr')} ${template.smr}SMR ${t('modal.quoteEdit.contractWhicheverFirst')}`);
      } else if (template.months) {
         parts.push(`${t('modal.quoteEdit.contractPeriodLabel')}: ${template.months}${t('modal.quoteEdit.monthUnit')}`);
      } else if (template.smr) {
         parts.push(`${t('modal.quoteEdit.contractPeriodLabel')}: ${template.smr}SMR${t('modal.quoteEdit.contractUntil')}`);
      }
    }
    
    if (template.maintenancePeriodRule && template.maintenancePeriodRule !== 'none') {
      if (template.maintenancePeriodRule === 'months' || template.maintenancePeriodRule === 'years') {
         parts.push(`${t('modal.quoteEdit.maintenancePeriodLabel')}: ${template.maintenancePeriodValue}${template.maintenancePeriodUnit === 'years' ? t('modal.quoteEdit.yearUnit') : t('modal.quoteEdit.monthUnit')}${t('modal.quoteEdit.contractEvery')}`);
      } else if (template.maintenancePeriodRule === 'smr') {
         parts.push(`${t('modal.quoteEdit.maintenancePeriodLabel')}: ${template.maintenancePeriodSmr}${t('modal.quoteEdit.hourUnit')}${t('modal.quoteEdit.contractEvery')}`);
      } else if (template.maintenancePeriodRule === 'whichever_first') {
         parts.push(`${t('modal.quoteEdit.maintenancePeriodLabel')}: ${template.maintenancePeriodValue}${template.maintenancePeriodUnit === 'years' ? t('modal.quoteEdit.yearUnit') : t('modal.quoteEdit.monthUnit')} ${t('modal.quoteEdit.contractOr')} ${template.maintenancePeriodSmr}${t('modal.quoteEdit.hourUnit')} ${t('modal.quoteEdit.contractWhicheverFirst')}`);
      }
    }
    
    return parts.length > 0 ? parts.join(" / ") : t('modal.quoteEdit.contractNoSetting');
  };

  const answered = quote.receivingSettings?.answered;
  const deliveryType = quote.receivingSettings?.deliveryType || 'immediate';

  return (
    <>
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white md:rounded-xl shadow-2xl w-full h-full md:w-[98vw] xl:max-w-[1700px] h-full md:h-[98vh] flex flex-col relative overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        <header className="bg-slate-50 px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex flex-col md:flex-row md:justify-between items-start mb-4 gap-4">
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <h2 className="text-lg md:text-xl font-bold leading-tight">
                  {t('modal.quoteEdit.headerTitle')}
                </h2>
                <div className="flex flex-wrap gap-2 items-center">
                   <span className="px-2.5 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-md flex items-center">
                     <Users className="w-3 h-3 mr-1" />
                     {quote.customerName || t('modal.quoteEdit.customerBadge')}
                   </span>
                   <span className="px-2.5 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded-md flex items-center">
                     <Car className="w-3 h-3 mr-1" />
                     {quote.targetModelName || t('modal.quoteEdit.modelBadge')}
                   </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full shrink-0 absolute top-4 right-4 md:static"><X className="w-6 h-6" /></button>
          </div>
          
          {step === 2 && (
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg overflow-x-auto">
            <button
              onClick={() => setActiveTab('initial_contract')}
              className={`whitespace-nowrap flex-1 py-2 text-sm font-bold rounded-md transition-colors flex items-center justify-center ${activeTab === 'initial_contract' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'} `}
            >
              <ShieldCheck className="w-4 h-4 mr-2" /> {t('modal.quoteEdit.contractNoticeTitle')}
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`whitespace-nowrap flex-1 py-2 text-sm font-bold rounded-md transition-colors flex items-center justify-center ${activeTab === 'delivery' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'} `}
            >
              <Package className="w-4 h-4 mr-2" /> {t('modal.quoteEdit.receivingNoticeTitle')}
            </button>
          </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row">
          <div className="flex-1 lg:overflow-y-auto p-4 md:p-6 space-y-6 md:space-y-8 bg-slate-50/50">
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl mx-auto w-full pt-10">
              <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
                <Package className="w-12 h-12 text-indigo-200 mx-auto mb-4" />
                <h3 className="text-lg font-black text-slate-800 mb-2">{t('modal.quoteEdit.step1Title')}</h3>
                <p className="text-slate-500 text-sm mb-8">{t('modal.quoteEdit.step1Description')}</p>
                
                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('modal.quoteEdit.customerLabel')} <span className="text-red-500 text-xs ml-1">{t('common.required')}</span></label>
                    <input 
                      type="text" 
                      value={quote.customerName || ''} 
                      onChange={e => setQuote({...quote, customerName: e.target.value})} 
                      className="w-full border-gray-300 rounded p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-colors" 
                      placeholder={t('modal.quoteEdit.customerPlaceholder')} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('modal.quoteEdit.modelLabel')} <span className="text-red-500 text-xs ml-1">{t('common.required')}</span></label>
                    <input 
                      type="text" 
                      value={quote.targetModelName || ''} 
                      onChange={e => setQuote({...quote, targetModelName: e.target.value})} 
                      className="w-full border-gray-300 rounded p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-colors" 
                      placeholder={t('modal.quoteEdit.modelPlaceholder')} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('modal.quoteEdit.machineLabel')} <span className="text-gray-400 text-xs ml-1">{t('common.optional')}</span></label>
                    <input 
                      type="text" 
                      value={quote.targetMachineNumber || ''} 
                      onChange={e => setQuote({...quote, targetMachineNumber: e.target.value})} 
                      className="w-full border-gray-300 rounded p-3 text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 focus:bg-white transition-colors" 
                      placeholder={t('modal.quoteEdit.machinePlaceholder')} 
                    />
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!quote.customerName || !quote.targetModelName}
                    
                    className="w-full py-3 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 shadow-sm flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('common.next')} <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </section>
            </div>
          )}
          {step === 2 && activeTab === 'initial_contract' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-lg text-sm flex items-start border border-emerald-200">
                <ShieldCheck className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-900 mb-1">{t('modal.quoteEdit.contractNoticeTitle')}</p>
                  <p>{t('modal.quoteEdit.contractNoticeBody')}</p>
                </div>
              </div>

              {/* 付帯サービスと証跡・書類 */}
              <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm border-t-4 border-t-emerald-500">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                  <h3 className="font-bold">{t('modal.quoteEdit.contractsSectionTitle')}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleOpenAddContractModal}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded text-sm font-bold flex items-center transition-colors shrink-0 shadow-sm"
                    >
                      <Plus className="w-4 h-4 mr-1" /> {t('common.add')}
                    </button>
                  </div>
                </div>

                {(!quote.appliedContracts || quote.appliedContracts.length === 0) ? (
                  <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-300">
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
                            <div className="flex border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 justify-center items-center relative hover:bg-indigo-50 hover:border-indigo-300 transition-all group mb-3">
                              <input type="file" multiple onChange={(e) => handleContractFileUpload(ac.id, e)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                              <div className="text-center group-hover:text-indigo-600 transition-colors flex flex-col items-center">
                                <UploadCloud className="w-6 h-6 text-gray-400 mb-1 group-hover:text-indigo-500 transition-colors" />
                                <span className="text-xs font-medium">{t('modal.quoteEdit.evidenceUpload')}</span>
                              </div>
                            </div>
                            
                            {ac.files && ac.files.length > 0 && (
                              <ul className="space-y-2">
                                {ac.files.map(f => (
                                  <li key={f.id} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded text-xs hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center font-medium text-slate-700 truncate mr-2">
                                      <FileText className="w-3 h-3 text-indigo-500 mr-2 shrink-0" /> 
                                      <span className="truncate">{f.name}</span>
                                    </div>
                                    <button onClick={() => handleRemoveContractFile(ac.id, f.id)} className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors shrink-0">{t('common.delete')}</button>
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
            </div>
          )}

          {step === 2 && activeTab === 'delivery' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm flex items-start border border-blue-200">
                <ClipboardList className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-900 mb-1">{t('modal.quoteEdit.receivingNoticeTitle')}</p>
                  <p>{t('modal.quoteEdit.receivingNoticeBody')}</p>
                </div>
              </div>

                <div className="space-y-6">
                  {!quote.receivingSettings?.answered ? (
                    <section className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-t-4 border-t-blue-500 space-y-6">
                      <div className="bg-blue-50 text-blue-800 p-4 rounded-lg text-sm mb-2">
                        {t('modal.quoteEdit.inventoryPrompt')}
                      </div>

                      <div>
                        <label className="block font-bold text-gray-800 mb-2">{t('modal.quoteEdit.q1Label')}</label>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <label className="flex items-center space-x-2 border p-3 rounded-lg flex-1 cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400 transition-all">
                            <input type="radio" name="deliveryType" checked={quote.receivingSettings?.deliveryType === 'immediate'} onChange={() => updateReceivingSetting('deliveryType', 'immediate')} className="text-blue-500 focus:ring-blue-500" />
                            <span className="font-medium text-slate-700 text-sm">{t('modal.quoteEdit.q1Immediate')}<br/><span className="text-xs text-gray-500 font-normal">{t('modal.quoteEdit.q1ImmediateDesc')}</span></span>
                          </label>
                          <label className="flex items-center space-x-2 border p-3 rounded-lg flex-1 cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400 transition-all">
                            <input type="radio" name="deliveryType" checked={quote.receivingSettings?.deliveryType === 'inventory_delivery'} onChange={() => updateReceivingSetting('deliveryType', 'inventory_delivery')} className="text-blue-500 focus:ring-blue-500" />
                            <span className="font-medium text-slate-700 text-sm">{t('modal.quoteEdit.q1InventoryDelivery')}<br/><span className="text-xs text-gray-500 font-normal">{t('modal.quoteEdit.q1InventoryDeliveryDesc')}</span></span>
                          </label>
                          <label className="flex items-center space-x-2 border p-3 rounded-lg flex-1 cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400 transition-all">
                            <input type="radio" name="deliveryType" checked={quote.receivingSettings?.deliveryType === 'inventory'} onChange={() => updateReceivingSetting('deliveryType', 'inventory')} className="text-blue-500 focus:ring-blue-500" />
                            <span className="font-medium text-slate-700 text-sm">{t('modal.quoteEdit.q1Inventory')}<br/><span className="text-xs text-gray-500 font-normal">{t('modal.quoteEdit.q1InventoryDesc')}</span></span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-800 mb-2">{t('modal.quoteEdit.q2Label')}</label>
                        <div className="flex space-x-4">
                          <label className="flex items-center space-x-2 border p-3 rounded-lg flex-1 cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400 transition-all">
                            <input type="radio" name="assembly" checked={quote.receivingSettings?.needsAssembly === true} onChange={() => updateReceivingSetting('needsAssembly', true)} className="text-blue-500 focus:ring-blue-500" />
                            <span className="font-medium text-slate-700 text-sm">{t('modal.quoteEdit.q2Yes')}</span>
                          </label>
                          <label className="flex items-center space-x-2 border p-3 rounded-lg flex-1 cursor-pointer has-[:checked]:bg-blue-50 has-[:checked]:border-blue-400 transition-all">
                            <input type="radio" name="assembly" checked={quote.receivingSettings?.needsAssembly === false} onChange={() => updateReceivingSetting('needsAssembly', false)} className="text-blue-500 focus:ring-blue-500" />
                            <span className="font-medium text-slate-700 text-sm">{t('modal.quoteEdit.q2No')}</span>
                          </label>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-100 flex justify-center">
                        <button
                          onClick={() => {
                            if (!quote.receivingSettings?.deliveryType || quote.receivingSettings?.needsAssembly === undefined) {
                              alert(t('modal.quoteEdit.q1Q2Required'));
                              return;
                            }
                            updateReceivingSetting('answered', true);
                            setSubTab('receiving');
                          }}
                          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow hover:bg-blue-700 transition-colors"
                        >
                          {t('modal.quoteEdit.confirmSettings')}
                        </button>
                      </div>
                    </section>
                  ) : (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-sm gap-4">
                        <div className="text-sm">
                          <span className="font-bold text-gray-700 mr-2">{t('modal.quoteEdit.basicSettings')}</span>
                          <span className="mr-4 inline-block bg-gray-100 px-2 py-1 rounded">
                            {quote.receivingSettings?.deliveryType === 'immediate' ? t('modal.quoteEdit.q1Immediate') : quote.receivingSettings?.deliveryType === 'inventory_delivery' ? t('modal.quoteEdit.q1InventoryDelivery') : t('modal.quoteEdit.q1Inventory')}
                          </span>
                          <span className="mr-4 inline-block bg-gray-100 px-2 py-1 rounded">
                            {t('modal.quoteEdit.q2Label')} {quote.receivingSettings?.needsAssembly ? t('modal.quoteEdit.q2Yes') : t('modal.quoteEdit.q2No')}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(t('modal.quoteEdit.changeSettingsConfirm'))) {
                              updateReceivingSetting('answered', false);
                            }
                          }}
                          className="text-slate-600 hover:text-slate-800 text-sm font-bold bg-white px-4 py-2 rounded-lg border border-slate-300 shadow-sm transition-colors whitespace-nowrap"
                        >
                          {t('modal.quoteEdit.changeSettings')}
                        </button>
                      </div>

                      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="flex border-b border-gray-200 bg-gray-50">
                          <button 
                            onClick={() => setSubTab('receiving')}
                            className={`flex-1 py-3 font-bold text-sm transition-colors ${subTab === 'receiving' ? 'bg-white border-t-2 border-t-blue-500 text-blue-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                          >
                            {t('modal.quoteEdit.receivingWork')}
                          </button>
                          
                          {(quote.receivingSettings?.deliveryType === 'inventory_delivery' || quote.receivingSettings?.deliveryType === 'inventory') && (
                            <button 
                              onClick={() => setSubTab('inventory')}
                              className={`flex-1 py-3 font-bold text-sm transition-colors border-l border-gray-200 ${subTab === 'inventory' ? 'bg-white border-t-2 border-t-purple-500 text-purple-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                            >
                              {t('modal.quoteEdit.inventorySettings')}
                            </button>
                          )}
    
                          {(quote.receivingSettings?.deliveryType === 'immediate' || quote.receivingSettings?.deliveryType === 'inventory_delivery') && (
                            <button 
                              onClick={() => setSubTab('delivery')}
                              className={`flex-1 py-3 font-bold text-sm transition-colors border-l border-gray-200 ${subTab === 'delivery' ? 'bg-white border-t-2 border-t-rose-500 text-rose-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                            >
                              {t('modal.quoteEdit.deliveryWork')}
                            </button>
                          )}
                        </div>
                        
                        <div className="p-6">
                          {subTab === 'receiving' && (
                            <div className="animate-in fade-in zoom-in-95 duration-300">
                              <TaskConfigSection 
                                title={t('modal.quoteEdit.receivingWork')} 
                                defaultTasks={[t('modal.quoteEdit.receivingWork')]} 
                                tools={tools} 
                                staff={staff} 
                                isReception={false}
                                date={receivingDate}
                                setDate={setReceivingDate}
                                staffIds={receivingStaffIds}
                                setStaffIds={setReceivingStaffIds}
                                externalTasks={receivingTasks}
                                setExternalTasks={setReceivingTasks}
                              />
                            </div>
                          )}
    
                          {subTab === 'inventory' && (quote.receivingSettings?.deliveryType === 'inventory' || quote.receivingSettings?.deliveryType === 'inventory_delivery') && (
                            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                              <p className="text-sm text-gray-600">{t('modal.quoteEdit.inventorySettingsBody')}</p>
                              <div className="grid grid-cols-1 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('modal.quoteEdit.inventoryPeriodLabel')}</label>
                                  <select 
                                    className="w-full border-gray-300 rounded p-2 text-sm"
                                    value={quote.receivingSettings?.inventoryPeriod || ""}
                                    onChange={(e) => updateReceivingSetting('inventoryPeriod', e.target.value)}
                                  >
                                    <option value="">{t('modal.quoteEdit.inventoryNotDecided')}</option>
                                    <option value="1month">{t('modal.quoteEdit.inventoryPeriod1month')}</option>
                                    <option value="3months">{t('modal.quoteEdit.inventoryPeriod3months')}</option>
                                    <option value="6months">{t('modal.quoteEdit.inventoryPeriod6months')}</option>
                                    <option value="1year">{t('modal.quoteEdit.inventoryPeriod1year')}</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('modal.quoteEdit.inventoryLocationLabel')}</label>
                                  <select 
                                    className="w-full border-gray-300 rounded p-2 text-sm"
                                    value={quote.receivingSettings?.inventoryLocation || ""}
                                    onChange={(e) => updateReceivingSetting('inventoryLocation', e.target.value)}
                                  >
                                    <option value="">{t('modal.quoteEdit.inventoryNotDecided')}</option>
                                    <option value="area_a">{t('modal.quoteEdit.inventoryLocationA')}</option>
                                    <option value="area_b">{t('modal.quoteEdit.inventoryLocationB')}</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('modal.quoteEdit.inventoryCheckScheduleLabel')}</label>
                                  <select 
                                    className="w-full border-gray-300 rounded p-2 text-sm"
                                    value={quote.receivingSettings?.inventoryCheckSchedule || "monthly"}
                                    onChange={(e) => updateReceivingSetting('inventoryCheckSchedule', e.target.value)}
                                  >
                                    <option value="monthly">{t('modal.quoteEdit.inventoryCheckMonthly')}</option>
                                    <option value="quarterly">{t('modal.quoteEdit.inventoryCheckQuarterly')}</option>
                                    <option value="none">{t('modal.quoteEdit.inventoryCheckNone')}</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          )}
    
                          {subTab === 'delivery' && (quote.receivingSettings?.deliveryType === 'immediate' || quote.receivingSettings?.deliveryType === 'inventory_delivery') && (
                            <div className="animate-in fade-in zoom-in-95 duration-300">
                              <TaskConfigSection 
                                title={t('modal.quoteEdit.deliveryWork')} 
                                defaultTasks={[t('modal.quoteEdit.deliveryWork')]} 
                                tools={tools} 
                                staff={staff} 
                                isReception={false}
                                date={deliveryDate}
                                setDate={setDeliveryDate}
                                staffIds={deliveryStaffIds}
                                setStaffIds={setDeliveryStaffIds}
                                externalTasks={deliveryTasks}
                                setExternalTasks={setDeliveryTasks}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
            </div>
          )}

        </div>

                  {/* メンバチャット */}
          <div className="w-full lg:w-96 flex flex-col bg-white border-t lg:border-t-0 lg:border-l border-slate-200 shadow-sm overflow-hidden h-[500px] lg:h-full shrink-0">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-slate-800 flex items-center text-sm">
                <MessageSquare className="w-4 h-4 mr-2 text-indigo-500" />
                {t('modal.quoteEdit.chatTitle')}
              </h3>
              <span className="text-xs text-slate-500 font-bold bg-white px-2 py-1 border border-slate-200 rounded">
                {t('modal.quoteEdit.chatBadge')}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50" ref={chatScrollRef}>
               {(chatMessages || []).map(msg => (
                 <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.isSelf ? "items-end ml-auto" : "items-start")}>
                    {!msg.isSelf && <span className="text-[10px] text-slate-500 font-bold mb-1 ml-1">{msg.sender}</span>}
                    <div className={cn("px-3 py-2 rounded-2xl text-sm shadow-sm", msg.isSelf ? "bg-indigo-600 text-white rounded-br-none" : "bg-white border border-slate-200 text-slate-700 rounded-bl-none font-bold")}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">{msg.time}</span>
                 </div>
               ))}
               {(chatMessages || []).length === 0 && (
                 <div className="text-center text-slate-400 text-sm mt-10">
                   {t('modal.quoteEdit.noMessages')}
                 </div>
               )}
            </div>
            
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 shrink-0 flex gap-2">
               <input
                 type="text"
                 className="flex-1 border border-slate-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                 placeholder={t('modal.quoteEdit.chatPlaceholder')}
                 value={chatInput}
                 onChange={e => setChatInput(e.target.value)}
               />
               <button
                 type="submit"
                 disabled={!chatInput.trim()}
                 className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700  transition flex items-center justify-center shrink-0 w-10 h-10"
               >
                 <Send className="w-4 h-4" />
               </button>
            </form>
          </div>
        </div>
        <footer className="bg-white p-4 border-t flex justify-end space-x-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors">{t('common.cancel')}</button>
          <button onClick={handleSave} className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded hover:bg-indigo-700 shadow-sm flex items-center transition-transform active:scale-95">
            {t('common.save')}
          </button>
        </footer>
      </div>
    </div>

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
                    {t('modal.quoteEdit.contractEntryTitle')}
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('modal.quoteEdit.contractSelectLabel')} <span className="text-red-500">*</span></label>
                      <select
                        className="w-full border border-gray-300 rounded p-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        value={pc.templateId}
                        onChange={(e) => handlePendingContractChange(pc.id, e.target.value)}
                      >
                        <option value="" disabled>{t('common.selectPlaceholder')}</option>
                        {contracts.map(c => (
                          <option key={c.id} value={c.id}>{tLegacyMaster(lang, 'contract', c.id, 'name', c.title)}</option>
                        ))}
                      </select>
                      {pc.templateId && getContractTemplate(pc.templateId) && (
                        <div className="mt-2 text-xs text-emerald-700 bg-emerald-50 p-2 rounded">
                          {renderContractTerms(getContractTemplate(pc.templateId)!)}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{t('modal.quoteEdit.evidenceFilesOptional')}</label>
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
                  className="text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-lg transition-colors border border-emerald-200 shadow-sm flex items-center justify-center mx-auto"
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
                {t('modal.quoteEdit.saveAddedContracts')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
