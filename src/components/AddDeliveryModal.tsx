import React, { useState } from 'react';
import { X, Calendar, MapPin, User, ChevronRight, Wrench, CheckCircle, Plus, Search, ArrowRight, Package, Truck, Clock, ShieldCheck, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { addDays, format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { tLegacyMaster } from '../lib/i18n';

export function AddDeliveryModal({ onClose }: { onClose: () => void }) {
  const { staff, vehicleMasters, parking, tools, addVehicle, addTask, contracts, t, lang } = useApp();
  const [modelTypeInput, setModelTypeInput] = useState('');
  const [modelType, setModelType] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [selectedContractIds, setSelectedContractIds] = useState<string[]>([]);
  
  const [step, setStep] = useState<1 | 2>(1);
  const [flowChoice, setFlowChoice] = useState<1 | 2 | 3 | null>(null);
  const [hasTemporaryAssembly, setHasTemporaryAssembly] = useState<boolean | null>(null);
  
  const [activeTab, setActiveTab] = useState<'arrival' | 'stock' | 'delivery'>('arrival');
  const [showContractsModal, setShowContractsModal] = useState(false);

  const [selectedParkingIds, setSelectedParkingIds] = useState<Set<string>>(new Set());
  const [isPeriodUnspecified, setIsPeriodUnspecified] = useState(true);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (modelTypeInput.trim() && flowChoice !== null && hasTemporaryAssembly !== null) {
      setModelType(modelTypeInput.trim());
      const mockCustomers = [t('modal.addDelivery.mockCustomer1'), t('modal.addDelivery.mockCustomer2'), t('modal.addDelivery.mockCustomer3'), t('modal.addDelivery.mockCustomer4'), t('modal.addDelivery.freeStockCustomer')];
      setCustomerName(flowChoice === 3 ? t('modal.addDelivery.freeStockCustomer') : mockCustomers[Math.floor(Math.random() * 4)]);
      setStep(2);
      setActiveTab('arrival');
    }
  };

  const handleSave = () => {
    // Determine dates based on flowChoice
    const today = new Date();
    const arrDate = new Date(today);
    arrDate.setDate(today.getDate() + 1); // tomorrow
    const arrivalDate = arrDate.toISOString();
    
    let deliveryDate: string | undefined = undefined;
    let stockStatus: any = t('modal.addDelivery.stockStatusImmediate');
    
    if (flowChoice === 1) {
      // Immediate delivery
      deliveryDate = arrDate.toISOString();
    } else if (flowChoice === 2) {
      // Keep in stock for 14 days, then deliver
      const delDate = new Date(arrDate);
      delDate.setDate(delDate.getDate() + 14);
      deliveryDate = delDate.toISOString();
      if (!customerName || customerName === t('modal.addDelivery.freeStockCustomer')) {
        stockStatus = t('modal.addDelivery.stockStatusFree');
      }
    } else {
      // No delivery date
      stockStatus = t('modal.addDelivery.stockStatusFree');
    }

    const sn = 'SN' + Math.floor(Math.random() * 10000);

    const newVehicleId = addVehicle({
      modelName: modelType,
      serialNumber: sn,
      status: t('modal.addDelivery.vehicleStatusPlanned') as any,
      stockStatus,
      arrivalDate,
      deliveryDate,
      customerName: customerName && customerName !== t('modal.addDelivery.freeStockCustomer') ? customerName : undefined,
      parkingAreaIds: Array.from(selectedParkingIds),
      contracts: selectedContractIds.length > 0 ? selectedContractIds.map(id => ({ contractId: id, startDate: deliveryDate || arrivalDate || new Date().toISOString(), startSmr: 0 })) : undefined,
    });

    const baseTasks = [];
    if (hasTemporaryAssembly) baseTasks.push(t('modal.addDelivery.arrivalTaskInspection'), t('modal.addDelivery.arrivalTaskAssembly'), t('modal.addDelivery.arrivalTaskAfterAssembly'));
    else baseTasks.push(t('modal.addDelivery.arrivalTaskInspection'));

    baseTasks.forEach(taskTitle => {
      addTask({
        vehicleId: newVehicleId,
        targetModelName: modelType,
        title: taskTitle,
        category: t('modal.addDelivery.arrivalCategory') as any,
        urgency: t('modal.addDelivery.withinOneMonth') as any,
        progress: t('modal.addDelivery.notStarted') as any,
        deadline: arrivalDate,
        staffIds: staff.length > 0 ? [staff[Math.floor(Math.random() * staff.length)].id] : undefined,
      });
    });

    // Create a mock delivery task if delivery is planned
    if (deliveryDate) {
      addTask({
        vehicleId: newVehicleId,
        targetModelName: modelType,
        title: t('modal.addDelivery.deliveryTaskTitle'),
        category: t('modal.addDelivery.deliveryCategory') as any, // Using an existing category
        urgency: t('modal.addDelivery.withinOneMonth') as any,
        progress: t('modal.addDelivery.notStarted') as any,
        deadline: deliveryDate,
        staffIds: staff.length > 0 ? [staff[Math.floor(Math.random() * staff.length)].id] : undefined,
      });
    }

    onClose();
  };

  const toggleParking = (id: string, e?: React.MouseEvent) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const newSet = new Set(selectedParkingIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedParkingIds(newSet);
  };

  const tabs: { id: 'arrival' | 'stock' | 'delivery', label: string, visible: boolean }[] = [
    { id: 'arrival', label: t('modal.addDelivery.arrivalTab'), visible: true },
    { id: 'stock', label: t('modal.addDelivery.stockTab'), visible: flowChoice === 2 || flowChoice === 3 },
    { id: 'delivery', label: t('modal.addDelivery.deliveryTab'), visible: flowChoice === 1 || flowChoice === 2 },
  ];

  const visibleTabs = tabs.filter(t => t.visible);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4 xl:p-8 bg-slate-900/60 backdrop-blur-sm">
      <div className={cn(
        "bg-white md:rounded-xl shadow-2xl w-full flex flex-col overflow-hidden relative transition-all h-full",
        "md:w-[98vw] xl:max-w-[1700px] md:h-[98vh] max-h-full min-h-full md:min-h-[600px]"
      )}>
        <button onClick={onClose} className={cn("absolute top-2 right-2 md:top-4 md:right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition z-50", step === 2 ? "hidden" : "")}>
          <X className="w-5 h-5 md:w-6 md:h-6"/>
        </button>

        {step === 1 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 md:px-10 bg-slate-50 relative overflow-y-auto">
            <div className="w-full max-w-2xl space-y-8 bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-200 relative">

              <h2 className="text-2xl font-bold text-slate-800 text-center">{t('modal.addDelivery.title')}</h2>
              <form onSubmit={handleStart} className="space-y-8 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('modal.addDelivery.modelLabel')} <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                      </div>
                      <input 
                        autoFocus
                        type="text" 
                        list="machine-models"
                        placeholder={t('modal.addDelivery.modelPlaceholder')}
                        className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base shadow-sm font-bold bg-slate-50 focus:bg-white transition-colors"
                        value={modelTypeInput}
                        onChange={e => setModelTypeInput(e.target.value)}
                      />
                      <datalist id="machine-models">
                        {['PC78US-11', 'PC128US-11', 'PC138US-11', 'PC200-11', 'PC350-11', 'WA100-8', 'WA270-8', 'WA380-8', 'WA470-8', 'HM300-5', 'HM400-5', 'D39PX-24', 'D61PX-24', 'D155AX-8'].map(m => (
                          <option key={m} value={m} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('modal.addDelivery.customerLabel')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-slate-400" />
                      </div>
                      <input 
                        type="text" 
                        placeholder={t('modal.addDelivery.customerPlaceholder')}
                        className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base shadow-sm font-bold bg-slate-50 focus:bg-white transition-colors"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2 pt-2 md:pt-0 md:border-none border-t border-slate-100">
                    <label className="block text-sm font-bold text-slate-700">{t('modal.addDelivery.flowQuestion')} <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button 
                        type="button"
                        onClick={() => setFlowChoice(1)}
                        className={cn("px-4 py-3 border-2 rounded-lg text-sm font-bold flex flex-col items-center justify-center text-center transition", flowChoice === 1 ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-indigo-300 text-slate-600")}
                      >
                        <Wrench className="w-5 h-5 mb-2 shrink-0 text-indigo-500" />
                        <div>{t('modal.addDelivery.flowImmediate')}</div>
                        <div className="text-[10px] text-slate-500 font-normal mt-1">{t('modal.addDelivery.flowImmediateDesc')}</div>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFlowChoice(2)}
                        className={cn("px-4 py-3 border-2 rounded-lg text-sm font-bold flex flex-col items-center justify-center text-center transition", flowChoice === 2 ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-indigo-300 text-slate-600")}
                      >
                        <Clock className="w-5 h-5 mb-2 shrink-0 text-indigo-500" />
                        <div>{t('modal.addDelivery.flowStock')}</div>
                        <div className="text-[10px] text-slate-500 font-normal mt-1">{t('modal.addDelivery.flowStockDesc')}</div>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFlowChoice(3)}
                        className={cn("px-4 py-3 border-2 rounded-lg text-sm font-bold flex flex-col items-center justify-center text-center transition", flowChoice === 3 ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-indigo-300 text-slate-600")}
                      >
                        <Package className="w-5 h-5 mb-2 shrink-0 text-indigo-500" />
                        <div>{t('modal.addDelivery.flowInventory')}</div>
                        <div className="text-[10px] text-slate-500 font-normal mt-1">{t('modal.addDelivery.flowInventoryDesc')}</div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 md:space-y-2 pt-6 md:pt-4 border-t border-slate-100">
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('modal.addDelivery.temporaryAssemblyQuestion')} <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-3 max-w-sm">
                      <button 
                        type="button"
                        onClick={() => setHasTemporaryAssembly(true)}
                        className={cn("py-2.5 border-2 rounded-lg text-sm font-bold transition flex items-center justify-center", hasTemporaryAssembly === true ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-indigo-300 text-slate-600")}
                      >
                        <div className={cn("w-3 h-3 rounded-full border-2 mr-2 flex items-center justify-center shrink-0", hasTemporaryAssembly === true ? "border-indigo-500" : "border-slate-300")}>
                          {hasTemporaryAssembly === true && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>}
                        </div>
                        {t('common.yes')}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setHasTemporaryAssembly(false)}
                        className={cn("py-2.5 border-2 rounded-lg text-sm font-bold transition flex items-center justify-center", hasTemporaryAssembly === false ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-indigo-300 text-slate-600")}
                      >
                        <div className={cn("w-3 h-3 rounded-full border-2 mr-2 flex items-center justify-center shrink-0", hasTemporaryAssembly === false ? "border-indigo-500" : "border-slate-300")}>
                          {hasTemporaryAssembly === false && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>}
                        </div>
                        {t('common.no')}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 md:space-y-2 pt-6 md:pt-4 border-t border-slate-100">
                    <label className="block text-sm font-bold text-slate-700 mb-1">{t('modal.addDelivery.applyContractsLabel')} <span className="text-slate-400 font-normal ml-1">{t('common.optional')}</span></label>
                    <div className="flex flex-col gap-2">
                      {selectedContractIds.map(id => {
                        const c = contracts.find(c => c.id === id);
                        if (!c) return null;
                        return (
                          <div key={id} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg bg-slate-50 transition hover:border-slate-300 shadow-sm">
                            <div className="flex items-center">
                              <ShieldCheck className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                              <span className="text-sm font-bold text-slate-800">{tLegacyMaster(lang, 'contract', c.id, 'name', c.title)}</span>
                            </div>
                            <button type="button" onClick={() => setSelectedContractIds(selectedContractIds.filter(i => i !== id))} className="text-slate-400 hover:text-red-500 transition p-1.5 hover:bg-white rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}

                      {contracts.length > selectedContractIds.length && (
                        <button
                          type="button"
                          onClick={() => setShowContractsModal(true)}
                          className="flex items-center justify-center p-3 border border-dashed border-slate-300 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition text-sm font-bold w-full bg-white shadow-sm"
                        >
                          <Plus className="w-4 h-4 mr-1 shrink-0" />
                          {selectedContractIds.length === 0 ? t('modal.addDelivery.addContractButton') : t('modal.addDelivery.addMoreContractButton')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-8 mt-8 border-t border-slate-100 flex justify-center">
                  <button 
                    type="submit"
                    disabled={!modelTypeInput.trim() || flowChoice === null || hasTemporaryAssembly === null}
                    className="w-full max-w-md py-4 bg-slate-800 text-white rounded-lg font-bold text-base hover:bg-slate-900 disabled:opacity-50 disabled:bg-slate-400 transition shadow-md flex items-center justify-center"
                  >
                    {t('modal.addDelivery.goToDetails')} <ArrowRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <>
            <div className="px-4 pt-4 pb-2 md:px-8 md:pt-6 md:pb-4 flex flex-col md:flex-row md:items-center justify-between bg-white shrink-0 z-10 gap-4">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 mr-2 text-indigo-600" />
                <h2 className="text-lg md:text-2xl font-bold text-slate-800">{t('modal.addDelivery.detailsTitle')}</h2>
              </div>
              <div className="flex items-center gap-2 md:gap-4 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
                <div className="px-2 py-1 md:px-3 text-xs md:text-sm bg-indigo-50 rounded-lg font-mono font-bold text-indigo-700 border border-indigo-100 flex-shrink-0">
                  {modelType}
                </div>
                {customerName && customerName !== t('modal.addDelivery.freeStockCustomer') && (
                  <div className="text-xs md:text-sm font-bold text-slate-500 font-mono flex-shrink-0">
                    {customerName}
                  </div>
                )}
                {customerName === t('modal.addDelivery.freeStockCustomer') && (
                  <div className="text-xs md:text-sm font-bold text-slate-400 flex-shrink-0">
                     {t('modal.addDelivery.flowInventory')}
                  </div>
                )}
                <button type="button" onClick={() => setShowContractsModal(true)} className="flex items-center px-2 py-1 md:px-3 py-1.5 md:py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs md:text-sm font-bold transition flex-shrink-0">
                  <ShieldCheck className="w-3 h-3 md:w-4 md:h-4 mr-1 text-indigo-600 flex-shrink-0" />
                  {t('modal.addDelivery.contractBadge', { count: selectedContractIds.length })}
                </button>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 md:p-2 rounded-full hover:bg-slate-100 transition flex-shrink-0 ml-1">
                  <X className="w-4 h-4 md:w-5 md:h-5"/>
                </button>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-white px-4 md:px-8 shrink-0 relative z-10 shadow-sm overflow-x-auto scrollbar-hide">
                 {visibleTabs.map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "px-4 py-3 md:px-6 md:py-4 text-sm md:text-base font-bold whitespace-nowrap border-b-2 transition-colors",
                        activeTab === tab.id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                      )}
                    >
                      {tab.label}
                    </button>
                 ))}
            </div>
            
            <div className="flex-1 overflow-y-auto min-h-0 bg-slate-50 flex justify-center">
              <div className="w-full p-4 lg:p-8">
                {activeTab === 'arrival' && (
                  <div className="animate-in fade-in duration-300 min-h-full">
                     <TaskConfigSection 
                      title={t('modal.addDelivery.arrivalSectionTitle')} 
                      defaultTasks={hasTemporaryAssembly ? [t('modal.addDelivery.arrivalTaskVisual'), t('modal.addDelivery.arrivalTaskFunction'), t('modal.addDelivery.arrivalTaskAssembly'), t('modal.addDelivery.arrivalTaskAfterAssembly')] : [t('modal.addDelivery.arrivalTaskVisual'), t('modal.addDelivery.arrivalTaskFunction')]} 
                      tools={tools} 
                      staff={staff} 
                      isReception={true} 
                      selectedParkingIds={selectedParkingIds}
                      toggleParking={toggleParking}
                    />
                  </div>
                )}
                
                {activeTab === 'stock' && (flowChoice === 2 || flowChoice === 3) && (
                   <div className="animate-in fade-in duration-300 min-h-full space-y-6 md:space-y-8">
                     <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center">
                       <Package className="w-6 h-6 md:w-7 md:h-7 mr-2 md:mr-3 text-indigo-500"/>
                       {t('modal.addDelivery.stockSectionTitle')}
                     </h3>
                     <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6 space-y-6 md:space-y-8">
                       <div className="space-y-3">
                         <label className="block text-sm font-bold text-slate-700">{t('modal.addDelivery.stockPeriodLabel')}</label>
                         {flowChoice === 3 ? (
                           <div className="flex items-center gap-4 text-sm font-bold text-slate-600">
                             <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg pointer-events-none">
                               <input type="checkbox" checked={true} readOnly className="text-indigo-600 rounded focus:ring-indigo-500 border-slate-300 w-4 h-4 cursor-pointer" />
                               {t('modal.addDelivery.periodUndecided')}
                             </label>
                           </div>
                         ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                             <input type="date" className="border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:ring-indigo-500 font-bold text-slate-700 w-full sm:w-auto"/>
                             <span className="text-slate-400 font-bold hidden sm:inline">〜</span>
                             <input type="date" className="border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:ring-indigo-500 font-bold text-slate-700 w-full sm:w-auto"/>
                           </div>
                         )}
                       </div>
                       
                       <div className="space-y-3">
                         <label className="block text-sm font-bold text-slate-700">{t('modal.addDelivery.storageAreaLabel')}</label>
                         <div className="h-[300px] md:h-[400px] w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] rounded-lg border border-slate-200 overflow-hidden relative">
                             {parking.map(p => {
                               const isSelected = selectedParkingIds.has(p.id);
                               return (
                                 <div
                                   key={p.id}
                                   onClick={() => toggleParking(p.id)}
                                   className={cn(
                                     "absolute rounded-lg border-2 flex flex-col items-center justify-center p-2 shadow-md transition-all cursor-pointer overflow-hidden",
                                     isSelected ? "border-indigo-500 bg-indigo-50/90 shadow-lg ring-4 ring-indigo-500/20 z-20" : "border-slate-300 bg-slate-50/90 hover:border-indigo-300 hover:bg-slate-100"
                                   )}
                                   style={{ left: p.x, top: p.y, width: p.width, height: p.height }}
                                 >
                                   <div className="font-bold text-xs pointer-events-none text-center truncate w-full text-slate-800">{p.name}</div>
                                 </div>
                               );
                             })}
                         </div>
                       </div>
                     </div>
                   </div>
                )}
                
                {activeTab === 'delivery' && (flowChoice === 1 || flowChoice === 2) && (
                   <div className="animate-in fade-in duration-300 min-h-full">
                     <TaskConfigSection 
                      title={t('modal.addDelivery.deliverySectionTitle')} 
                      defaultTasks={[t('modal.addDelivery.deliveryTaskInspection'), t('modal.addDelivery.deliveryTaskDelivery'), t('modal.addDelivery.deliveryTaskAfterDelivery')]} 
                      tools={tools} 
                      staff={staff} 
                      isReception={false} 
                      t={t}
                    />
                   </div>
                )}
              </div>
            </div>
            
            {/* Bottom Sticky Action Bar */}
            <div className="px-4 py-4 md:px-6 md:py-5 bg-white border-t border-slate-200 flex flex-col md:flex-row justify-between shrink-0 shadow-sm z-20 gap-3">
              <button onClick={onClose} className="order-2 md:order-1 px-4 py-2 md:px-6 md:py-3 text-slate-600 font-bold rounded-lg hover:bg-slate-100 transition text-sm md:text-base border border-slate-200 md:w-auto w-full text-center">{t('common.cancel')}</button>
              
              <div className="flex space-x-3 md:space-x-4 order-1 md:order-2 w-full md:w-auto">
                 <button onClick={handleSave} className="w-full md:w-auto px-6 py-3 md:px-10 md:py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm transition text-lg flex items-center justify-center">
                   {t('common.save')}
                 </button>
              </div>
            </div>
          </>
        )}
      </div>

    {showContractsModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowContractsModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 shrink-0 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <ShieldCheck className="w-5 h-5 text-indigo-600 mr-2" />
                {t('modal.addDelivery.contractSelectionTitle')}
              </h3>
              <button type="button" onClick={() => setShowContractsModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {contracts.map(c => (
                  <label 
                    key={c.id} 
                    className={cn(
                      "flex items-center p-4 border rounded-xl cursor-pointer transition shadow-sm",
                      selectedContractIds.includes(c.id) 
                        ? "bg-indigo-50/50 border-indigo-200" 
                        : "bg-white hover:bg-slate-50 border-slate-200"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      checked={selectedContractIds.includes(c.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedContractIds([...selectedContractIds, c.id]);
                        } else {
                          setSelectedContractIds(selectedContractIds.filter(id => id !== c.id));
                        }
                      }}
                    />
                    <span className="ml-3 text-sm text-slate-800 font-bold">{tLegacyMaster(lang, 'contract', c.id, 'name', c.title)}</span>
                  </label>
                ))}

                {contracts.length === 0 && (
                   <div className="col-span-1 md:col-span-2 text-center py-8 text-slate-500 font-bold text-sm">
                     {t('modal.addDelivery.noContracts')}
                   </div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-white flex justify-end shrink-0 gap-3">
              <button type="button" onClick={() => setShowContractsModal(false)} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-sm">
                {t('modal.addDelivery.applyContractsButton')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Shared component for Task settings (A and C tabs)

const AssignBlock = ({ isReception, staffIds, setStaffIds, date, setDate, staff, t }: any) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-end">
    <div>
      <label className="block text-xs md:text-sm font-bold text-slate-600 mb-2">{isReception ? t('modal.addDelivery.receptionAssigneeLabel') : t('modal.addDelivery.workAssigneeLabel')}</label>
      <div className="w-full border-slate-300 border rounded-lg px-2 py-1.5 text-sm bg-white shadow-sm font-bold flex flex-wrap gap-1 min-h-[38px] items-center">
        {(!staffIds || staffIds.length === 0) ? (
          <span className="text-slate-400 px-1">{t('common.notSet')}</span>
        ) : (
          staffIds.map((id: string) => {
            const s = staff?.find((s:any) => s.id === id);
            return s ? (
              <span key={id} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded flex items-center text-xs">
                {s.name}
                <button onClick={() => setStaffIds && setStaffIds(staffIds.filter((i:any) => i !== id))} className="ml-1 text-indigo-400 hover:text-indigo-600">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ) : null;
          })
        )}
        <select 
          className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-sm font-bold min-w-[100px] cursor-pointer text-slate-500"
          value=""
          onChange={(e) => {
            if (e.target.value && !staffIds?.includes(e.target.value)) {
              setStaffIds && setStaffIds([...(staffIds || []), e.target.value]);
            }
          }}
        >
          <option value="" disabled>{t('modal.addDelivery.addAssigneePlaceholder')}</option>
          {staff?.filter((s:any) => !staffIds?.includes(s.id)).map((s:any) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
    </div>
    <div className="lg:col-span-2 flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <label className="block text-xs md:text-sm font-bold text-slate-600 mb-2">{isReception ? t('modal.addDelivery.startReceptionLabel') : t('modal.addDelivery.startLabel')}</label>
        <input 
          type="date" 
          value={date || ""} 
          onChange={e => setDate && setDate(e.target.value)} 
          className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-bold" 
        />
      </div>
      <div className="flex-1">
        <label className="block text-xs md:text-sm font-bold text-slate-600 mb-2">{t('modal.addDelivery.endLabel')}</label>
        <input 
          type="date" 
          value={date || ""} 
          onChange={e => setDate && setDate(e.target.value)} 
          className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-bold" 
        />
      </div>
    </div>
  </div>
);

export function TaskConfigSection({ title, defaultTasks, tools, staff, isReception, date, setDate, staffIds, setStaffIds, selectedParkingIds = new Set(), toggleParking, externalTasks, setExternalTasks, isReadOnly }: any) {
  const { parking, vehicleMasters, contracts, reportTemplates, t, lang } = useApp();
  
  // Convert default tasks from string to object format if necessary
  const initialTasks = Array.isArray(defaultTasks) ? defaultTasks.map(t => 
    typeof t === 'string' ? { name: t, reportFormatId: "", paidServiceId: "" } : t
  ) : [];

  const [localTasks, setLocalTasks] = useState<Array<{ name: string, reportFormatId: string, paidServiceId: string }>>(initialTasks);
  const tasks = externalTasks !== undefined ? externalTasks : localTasks;
  const setTasks = setExternalTasks !== undefined ? setExternalTasks : setLocalTasks;
  const [selectedTools, setSelectedTools] = useState<any[]>([]);
  const [selectedInternalVehicles, setSelectedInternalVehicles] = useState<any[]>([]);
  const [externalVehicleCount, setExternalVehicleCount] = useState<number>(0);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [tempStaffIds, setTempStaffIds] = useState<string[]>([]);
  const [tempDate, setTempDate] = useState<string>('');
  const [viewStaffIds, setViewStaffIds] = useState<Set<string>>(new Set(staff?.slice(0,4)?.map((s:any) => s.id) || []));

  const [activeConfigTab, setActiveConfigTab] = useState('details');
  const [subTasks, setSubTasks] = useState<any[]>([]);
  const [showAddSubTaskModal, setShowAddSubTaskModal] = useState(false);

  const handleOpenScheduleModal = () => {
    setTempStaffIds([...(staffIds || [])]);
    setTempDate(date || '');
    setIsScheduleModalOpen(true);
  };

  const handleSaveScheduleAssign = () => {
    if (setStaffIds) setStaffIds(tempStaffIds);
    if (setDate) setDate(tempDate);
    setIsScheduleModalOpen(false);
  };

  const toggleViewStaff = (id: string) => {
    const next = new Set(viewStaffIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setViewStaffIds(next);
  };

  return (
    <>
    <div className="flex flex-col md:flex-row h-auto md:h-[650px] border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm mb-10 md:mb-20 animate-in fade-in duration-300">
      
      {/* Left Sidebar for Config */}
      <div className="md:w-56 w-full bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col p-3 shrink-0 overflow-y-auto">
        <h3 className="text-sm font-black text-slate-800 mb-4 px-2 hidden md:block mt-2">
          {title}
        </h3>
        <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0">
           <button 
             onClick={(e) => { e.preventDefault(); setActiveConfigTab('details'); }}
             className={`w-auto md:w-full shrink-0 flex items-center p-2.5 rounded-lg text-left text-sm font-bold transition-colors ${activeConfigTab === 'details' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700'}`}
           >
             <CheckCircle className="w-4 h-4 mr-2" />
             {t('modal.addDelivery.taskDetailsTab')}
           </button>
           <button 
             onClick={(e) => { e.preventDefault(); setActiveConfigTab('assignment'); }}
             className={`w-auto md:w-full shrink-0 flex items-center p-2.5 rounded-lg text-left text-sm font-bold transition-colors ${activeConfigTab === 'assignment' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700'}`}
           >
             <User className="w-4 h-4 mr-2" />
             {t('modal.addDelivery.assignmentTab')}
           </button>
           <button 
             onClick={(e) => { e.preventDefault(); setActiveConfigTab('workspace'); }}
             className={`w-auto md:w-full shrink-0 flex items-center p-2.5 rounded-lg text-left text-sm font-bold transition-colors ${activeConfigTab === 'workspace' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700'}`}
           >
             <MapPin className="w-4 h-4 mr-2" />
             {t('modal.addDelivery.workspaceTab')}
           </button>
           <button 
             onClick={(e) => { e.preventDefault(); setActiveConfigTab('subtasks'); }}
             className={`w-auto md:w-full shrink-0 flex items-center p-2.5 rounded-lg text-left text-sm font-bold transition-colors ${activeConfigTab === 'subtasks' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700'}`}
           >
             <AlertCircle className="w-4 h-4 mr-2" />
             {t('modal.addDelivery.subtasksTab')}
           </button>
        </nav>
      </div>
      
      {/* Right Content */}
      <div className="flex-1 bg-white overflow-y-auto p-4 md:p-6 relative">
        {activeConfigTab === 'details' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="grid grid-cols-1 gap-6">
              <div className="p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-sm text-slate-700 flex items-center"><CheckCircle className="w-5 h-5 mr-2 text-indigo-500" />{t('modal.addDelivery.taskContentLabel')}</label>
                  <button 
                    onClick={(e) => { e.preventDefault(); setTasks([...tasks, { name: "", reportFormatId: "", paidServiceId: "" }]); }}
                    className="text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1.5 rounded font-bold flex items-center shadow-sm transition-colors"
                  >
                    <Plus className="w-3 h-3 mr-1"/>{t('modal.addDelivery.addTaskButton')}
                  </button>
                </div>
                <div className="space-y-3">
                  {tasks.map((task: any, i: number) => (
                    <div key={i} className="flex gap-2 relative group items-start bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      <div className="w-6 h-6 flex items-center justify-center shrink-0 bg-slate-100 rounded text-xs font-bold text-slate-500 mt-2">{i+1}</div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <input 
                            type="text" 
                            value={task.name}
                            onChange={(e) => {
                              const newTasks = [...tasks];
                              newTasks[i] = { ...newTasks[i], name: e.target.value };
                              setTasks(newTasks);
                            }}
                            className="flex-1 border-slate-300 rounded-lg px-3 py-2 text-sm font-bold shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50" 
                            placeholder={t('modal.addDelivery.taskPlaceholder')}
                          />
                          <button
                            type="button"
                            className="flex items-center justify-center px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-bold transition-colors shadow-sm shrink-0 whitespace-nowrap group-hover:opacity-100 md:opacity-0 opacity-100"
                          >
                            <Sparkles className="w-3.5 h-3.5 mr-1" />
                            {t('modal.addDelivery.aiAssistButton')}
                          </button>
                        </div>
                        <div className="flex gap-2 flex-col md:flex-row">
                          <select 
                            value={task.reportFormatId}
                            onChange={(e) => {
                              const newTasks = [...tasks];
                              newTasks[i] = { ...newTasks[i], reportFormatId: e.target.value };
                              setTasks(newTasks);
                            }}
                            className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 bg-slate-50 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer p-0"
                          >
                            <option value="">{t('modal.addDelivery.noReportFormat')}</option>
                            {reportTemplates?.map((rt: any) => (
                              <option key={rt.id} value={rt.id}>{tLegacyMaster(lang, 'reportTemplate', rt.id, 'name', rt.name)}</option>
                            ))}
                          </select>

                          <select 
                            value={task.paidServiceId}
                            onChange={(e) => {
                              const newTasks = [...tasks];
                              newTasks[i] = { ...newTasks[i], paidServiceId: e.target.value };
                              setTasks(newTasks);
                            }}
                            className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 bg-slate-50 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
                          >
                            <option value="">{t('modal.addDelivery.noPaidService')}</option>
                            <optgroup label={t('modal.addDelivery.paidServiceGroup')}>
                              <option value="有償定期メンテナンス">{t('modal.addDelivery.paidPeriodicMaintenance')}</option>
                              <option value="有償修理">{t('modal.addDelivery.paidRepair')}</option>
                            </optgroup>
                            <optgroup label={t('modal.addDelivery.warrantyGroup')}>
                              {contracts?.map((c: any) => (
                                <option key={c.id} value={c.id}>{tLegacyMaster(lang, 'contract', c.id, 'name', c.title)}</option>
                              ))}
                              <option value="補償">{t('modal.addDelivery.otherWarranty')}</option>
                            </optgroup>
                          </select>
                        </div>
                      </div>
                      <button onClick={() => setTasks(tasks.filter((_: any, idx: number) => idx !== i))} className="absolute -right-3 -top-3 bg-white border border-slate-200 rounded-full p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition shadow-sm">
                        <X className="w-4 h-4"/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm space-y-4 flex flex-col">
                  <label className="font-bold text-sm text-slate-700 flex items-center"><Wrench className="w-5 h-5 mr-2 text-indigo-500" />{t('modal.addDelivery.toolsSectionTitle')}</label>
                  {selectedTools.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedTools.map((t: any) => (
                        <span key={t.id} className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                          {t.name}
                          <button onClick={() => setSelectedTools(selectedTools.filter((st: any) => st.id !== t.id))} className="ml-2 hover:text-indigo-900"><X className="w-3 h-3"/></button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto relative">
                    <select 
                      className="w-full py-2.5 md:py-3 border border-dashed border-slate-300 text-indigo-600 font-bold rounded-lg focus:ring-indigo-500 appearance-none bg-white cursor-pointer text-center text-sm md:text-base hover:bg-slate-50 transition-colors"
                      onChange={(e) => {
                        if(e.target.value === "") return;
                        const tl = tools.find((tool:any) => tool.id === e.target.value);
                        if (tl && !selectedTools.find((st: any) => st.id === tl.id)) {
                          setSelectedTools([...selectedTools, tl]);
                        }
                        e.target.value = "";
                      }}
                    >
                      <option value="">{t('modal.addDelivery.addToolFromMaster')}</option>
                      {tools.map((t:any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm space-y-4 flex flex-col">
                  <label className="font-bold text-sm text-slate-700 flex items-center"><Package className="w-5 h-5 mr-2 text-indigo-500" />{t('modal.addDelivery.partsSectionTitle')}</label>
                  <div className="mt-auto grid grid-cols-1 xl:grid-cols-2 gap-3">
                    <button 
                      type="button"
                      className="w-full py-2.5 border border-dashed border-slate-300 text-indigo-600 font-bold rounded-lg focus:ring-indigo-500 bg-white hover:bg-slate-50 transition-colors text-center text-sm"
                      onClick={() => {}}
                    >
                      {t('modal.addDelivery.addPartFromBook')}
                    </button>
                    <button 
                      type="button"
                      className="w-full py-2.5 border border-dashed border-slate-300 text-indigo-600 font-bold rounded-lg focus:ring-indigo-500 bg-white hover:bg-slate-50 transition-colors text-center text-sm"
                      onClick={() => {}}
                    >
                      {t('modal.addDelivery.addPartFromStock')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeConfigTab === 'assignment' && (
          <div className="space-y-6 animate-in fade-in h-full">
            <h4 className="font-bold text-slate-800 flex items-center text-base md:text-lg border-b pb-2"><User className="w-5 h-5 mr-2 text-indigo-500" />{t('modal.addDelivery.assignmentSettingsTitle')}</h4>
            <div className="relative bg-slate-50 p-4 md:p-6 rounded-xl border border-slate-200 shadow-inner min-h-[400px]">
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={handleOpenScheduleModal}
                  className="text-xs py-1.5 px-3 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center"
                >
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-600" /> {t('modal.addDelivery.checkScheduleButton')}
                </button>
              </div>
              <AssignBlock 
                isReception={isReception} 
                staffIds={staffIds} 
                setStaffIds={setStaffIds} 
                date={date} 
                setDate={setDate} 
                staff={staff} 
                t={t}
              />
            </div>
          </div>
        )}

        {activeConfigTab === 'workspace' && (
          <div className="space-y-6 animate-in fade-in h-full">
            <h4 className="font-bold text-slate-800 flex items-center text-base md:text-lg border-b pb-2">
              <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
              {t('modal.addDelivery.workspaceVehicleTitle')}
            </h4>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
              <div className="flex flex-col">
                <label className="block text-xs md:text-sm font-bold text-slate-600 mb-2">{t('modal.addDelivery.workspaceAreaLabel')}</label>
                <div className="flex-1 min-h-[300px] w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] rounded-lg border border-slate-200 overflow-hidden relative mb-3">
                  {parking.map(p => {
                    const isSelected = selectedParkingIds.has(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={(e) => toggleParking && toggleParking(p.id, e)}
                        className={cn(
                          "absolute rounded-lg border-2 flex flex-col items-center justify-center p-2 shadow-md transition-all cursor-pointer overflow-hidden",
                          isSelected ? "border-indigo-500 bg-indigo-50/90 shadow-lg ring-4 ring-indigo-500/20 z-20" : "border-slate-300 bg-white/90 hover:border-indigo-300 hover:bg-slate-50"
                        )}
                        style={{
                          left: p.x, top: p.y, width: p.width, height: p.height
                        }}
                      >
                        <div className="font-bold text-xs pointer-events-none text-center truncate w-full text-slate-800">{p.name}</div>
                      </div>
                    )
                  })}
                </div>
                <select 
                  value={Array.from(selectedParkingIds)[0] || ""} 
                  onChange={e => toggleParking && toggleParking(e.target.value)} 
                  className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:ring-indigo-500 font-bold text-slate-700 shadow-sm"
                >
                  <option value="">{t('common.notSet')}</option>
                  {parking.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-6">
                <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-sm flex-1">
                  <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-700 flex items-center">
                      <Truck className="w-4 h-4 mr-2 text-indigo-500" />
                      {t('modal.addDelivery.transportAndVehicleTitle')}
                    </h4>
                  </div>
                  
                  <div className="p-4 md:p-6 space-y-6">
                    {/* 外部 */}
                    <div className="flex flex-col md:flex-row md:items-start xl:flex-col gap-2 md:gap-4 xl:gap-2">
                      <div className="flex-1">
                        <div className="font-bold text-slate-800 mb-1 text-sm">{t('modal.addDelivery.externalCountLabel')}</div>
                        <div className="text-xs text-slate-500 leading-tight">{t('modal.addDelivery.externalCountDescription')}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                         <input 
                           type="number" 
                           min="0"
                           value={externalVehicleCount} 
                           onChange={e => setExternalVehicleCount(parseInt(e.target.value) || 0)} 
                           className="w-20 border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-indigo-500 font-bold text-slate-700 text-right shadow-sm bg-white"
                         />
                         <span className="text-sm font-bold text-slate-600">{t('common.unitCar')}</span>
                      </div>
                    </div>

                    {/* 自社 */}
                    <div className="border-t border-slate-200 pt-6 flex flex-col gap-4">
                      <label className="flex items-start cursor-pointer group w-fit">
                        <input type="checkbox" className="mt-0.5 mr-3 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-5 h-5 cursor-pointer shadow-sm transition-all bg-white" 
                          checked={tasks.some((task: any) => task.name === t('modal.addDelivery.internalTransportTask'))}
                          onChange={(e) => {
                            if (e.target.checked) setTasks([{ name: t('modal.addDelivery.internalTransportTask'), reportFormatId: "" }, ...tasks]);
                            else {
                              setTasks(tasks.filter((task: any) => task.name !== t('modal.addDelivery.internalTransportTask')));
                              setSelectedInternalVehicles([]);
                            }
                          }}
                        />
                        <div>
                          <div className="font-bold text-slate-800 text-sm mb-1 group-hover:text-indigo-600 transition-colors">{t('modal.addDelivery.internalTransportLabel')}</div>
                          <div className="text-xs text-slate-500 leading-tight">{t('modal.addDelivery.internalTransportDescription')}</div>
                        </div>
                      </label>
                      
                      {/* 自社車両セレクター (Checked時のみ活性化、または表示する) */}
                      <div className={cn("transition-all duration-300 overflow-hidden", tasks.some((task: any) => task.name === t('modal.addDelivery.internalTransportTask')) ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0")}>
                        <div className="pl-8 bg-white p-4 rounded-lg border border-slate-200 shadow-sm ml-2">
                           <label className="block text-xs font-bold text-slate-600 mb-2">{t('modal.addDelivery.internalVehicleLabel')}</label>
                           {selectedInternalVehicles.length > 0 && (
                             <div className="flex flex-wrap gap-2 mb-3">
                               {selectedInternalVehicles.map(v => (
                                  <span key={v.id} className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-xs font-bold flex items-center shadow-sm">
                                    <Truck className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> {v.modelName}
                                    <button onClick={(e) => { e.preventDefault(); setSelectedInternalVehicles(selectedInternalVehicles.filter(sv => sv.id !== v.id))}} className="ml-2 hover:text-slate-900 border-l border-slate-200 pl-2"><X className="w-3.5 h-3.5"/></button>
                                  </span>
                               ))}
                             </div>
                           )}
                           <select 
                             className="w-full py-2 px-3 border border-dashed border-slate-300 text-slate-600 font-bold rounded-lg focus:ring-indigo-500 appearance-none bg-slate-50 cursor-pointer text-sm shadow-sm hover:bg-slate-100 disabled:opacity-50 transition-colors"
                             onChange={(e) => {
                               if(e.target.value === "") return;
                               const v = vehicleMasters.find((vm:any) => vm.id === e.target.value);
                               if (v && !selectedInternalVehicles.find(sv => sv.id === v.id)) {
                                 setSelectedInternalVehicles([...selectedInternalVehicles, v]);
                               }
                               e.target.value = "";
                             }}
                           >
                             <option value="">{t('modal.addDelivery.addInternalVehicle')}</option>
                             {vehicleMasters.map((v:any) => <option key={v.id} value={v.id}>{tLegacyMaster(lang, 'vehicleMaster', v.id, 'name', v.modelName)}</option>)}
                           </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map/Note area for delivery/field work */}
                {!isReception && (
                  <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden flex-1 flex flex-col">
                    <div className="p-3 md:p-4 bg-slate-50 border-b border-slate-200">
                      <h5 className="font-bold text-slate-800 text-sm flex items-center">
                        <div className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
                        {t('modal.addDelivery.siteNotesTitle')}
                      </h5>
                    </div>
                    <div className="p-4 flex flex-col gap-4 flex-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">{t('modal.addDelivery.siteMemoLabel')}</label>
                        <textarea 
                          rows={3}
                          className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm font-bold shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                          placeholder={t('modal.addDelivery.siteMemoPlaceholder')}
                        ></textarea>
                      </div>
                      <div className="relative border border-slate-200 rounded-lg overflow-hidden bg-slate-100 flex flex-col items-center justify-center flex-1 min-h-[120px]">
                        {/* Simulated Map Canvas */}
                        <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Tokyo&zoom=14&size=400x400&sensor=false')] bg-cover bg-center opacity-30 grayscale pointer-events-none"></div>
                        <div className="relative z-10 text-center space-y-2 p-2 bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200 shadow-sm mx-4">
                          <p className="text-[10px] font-bold text-slate-600 leading-tight">{t('modal.addDelivery.siteMapMockText')}</p>
                          <button className="px-3 py-1.5 bg-white border border-slate-200 shadow-sm rounded text-xs font-bold text-indigo-600 hover:bg-slate-50 transition w-full">
                            {t('modal.addDelivery.siteMapOpenButton')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeConfigTab === 'subtasks' && (
          <div className="space-y-6 animate-in fade-in h-full flex flex-col">
            <h4 className="font-bold text-slate-800 flex items-center justify-between text-base md:text-lg border-b pb-2">
              <span className="flex items-center"><AlertCircle className="w-5 h-5 mr-2 text-indigo-500" />{t('modal.addDelivery.subtasksTitle')}</span>
              {!isReadOnly && (
                <button 
                  onClick={() => setShowAddSubTaskModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 rounded-lg flex items-center shadow-sm transition text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  {t('modal.addDelivery.addSubtaskButton')}
                </button>
              )}
            </h4>
            
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 md:p-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-bold text-sm mb-2">{t('modal.addDelivery.noSubtasks')}</p>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">{t('modal.addDelivery.subtasksDescription')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
    {isScheduleModalOpen && (
      <div className="fixed inset-0 bg-slate-900/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setIsScheduleModalOpen(false)}>
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
            <h3 className="font-bold text-slate-800 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
              {t('modal.addDelivery.scheduleModalTitle')}
            </h3>
            <button onClick={() => setIsScheduleModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
          </div>
          
          <div className="p-4 md:p-6 bg-white border-b border-slate-200 shrink-0">
             <AssignBlock 
               isReception={isReception} 
               staffIds={tempStaffIds} 
               setStaffIds={setTempStaffIds} 
               date={tempDate} 
               setDate={setTempDate} 
               staff={staff} 
               t={t}
             />
          </div>
          
          <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 shrink-0 flex items-center">
            <h4 className="text-sm font-bold text-slate-700 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-slate-500" />
              {t('modal.addDelivery.scheduleConfirmTitle')}
            </h4>
            <span className="ml-3 text-xs text-slate-500 font-medium">{t('modal.addDelivery.scheduleConfirmNote')}</span>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col xl:flex-row bg-white relative">
            <div className="w-full xl:w-64 bg-slate-50 border-b xl:border-b-0 xl:border-r border-slate-200 flex flex-col shrink-0 z-10">
              <div className="p-3 bg-slate-100 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700">{t('modal.addDelivery.scheduleMembersLabel')}</span>
              </div>
              <div className="overflow-x-auto xl:overflow-y-auto flex xl:flex-col p-2 gap-2">
                {staff.map((s:any) => (
                  <label key={s.id} className="flex items-center p-2 hover:bg-white rounded cursor-pointer transition select-none flex-shrink-0 xl:flex-shrink">
                    <input type="checkbox" checked={viewStaffIds.has(s.id)} onChange={() => toggleViewStaff(s.id)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" />
                    <div className="ml-2 truncate flex-1 flex justify-between items-center">
                      <p className="text-xs font-bold text-slate-800 truncate">{s.name}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-x-auto bg-white flex flex-col relative min-h-[300px]">
              <div className="flex-1 overflow-y-auto p-2 bg-slate-50/50">
                <div className="inline-block min-w-full rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-10">
                    <div className="w-16 shrink-0 border-r border-slate-200 bg-slate-100 px-1 flex items-center justify-center text-[10px] font-bold text-slate-500">時間</div>
                    {Array.from({length: 7}, (_, i) => {
                      const d = date ? new Date(date) : new Date();
                      d.setDate(d.getDate() + i);
                      return d;
                    }).map((d, i) => (
                      <div key={i} className="flex-1 min-w-[120px] py-1.5 text-center border-r border-slate-200">
                        <p className="font-bold text-slate-800 text-[10px] truncate">{d.getMonth() + 1}/{d.getDate()}</p>
                        <p className="text-[9px] text-slate-500">{['日', '月', '火', '水', '木', '金', '土'][d.getDay()]}</p>
                      </div>
                    ))}
                  </div>
                  <div className="relative">
                    {Array.from({length: 11}, (_, i) => i + 8).map((hour) => (
                      <div key={hour} className="flex min-h-[64px] border-b border-slate-100/50">
                        <div className="w-16 shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col items-center justify-start py-2 px-1">
                          <p className="font-bold text-slate-500 text-[10px] text-center w-full">{hour}:00</p>
                        </div>
                        {Array.from({length: 7}).map((_, i) => (
                          <div key={i} className="flex-1 min-w-[120px] border-r border-slate-100/50 relative hover:bg-indigo-50/30 transition p-1">
                             {/* Temporary mocked tasks for visualization */}
                             {hour === 10 && i === 0 && viewStaffIds.has('1') && (
                               <div className="bg-blue-100 border-l-2 border-blue-500 rounded p-1.5 shadow-sm overflow-hidden w-full h-full min-h-[40px] flex flex-col justify-start">
                                  <p className="text-[10px] font-bold text-blue-900 truncate">ZX135US 入庫</p>
                                  <p className="text-[9px] text-blue-700 truncate mt-0.5">{staff.find((s:any) => s.id === '1')?.name}</p>
                               </div>
                             )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end shrink-0 gap-3">
            <button onClick={() => setIsScheduleModalOpen(false)} className="px-4 py-2 font-bold text-sm text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">キャンセル</button>
            <button onClick={handleSaveScheduleAssign} className="px-6 py-2 bg-indigo-600 text-white font-bold text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
              アサインを確定する
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  )
}
