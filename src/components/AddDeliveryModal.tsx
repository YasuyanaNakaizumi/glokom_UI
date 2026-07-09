import React, { useState } from 'react';
import { X, Calendar, MapPin, User, ChevronRight, Wrench, CheckCircle, Plus, Search, ArrowRight, Package, Truck, Clock, ShieldCheck, Trash2, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { addDays, format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

export function AddDeliveryModal({ onClose }: { onClose: () => void }) {
  const { staff, vehicleMasters, parking, tools, addVehicle, addTask, contracts } = useApp();
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
      const mockCustomers = ['株式会社大林組', '清水建設株式会社', '鹿島建設株式会社', '大成建設株式会社', 'フリー在庫(引当なし)'];
      setCustomerName(flowChoice === 3 ? 'フリー在庫(引当なし)' : mockCustomers[Math.floor(Math.random() * 4)]);
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
    let stockStatus: any = '即納(引当済)';
    
    if (flowChoice === 1) {
      // Immediate delivery
      deliveryDate = arrDate.toISOString();
    } else if (flowChoice === 2) {
      // Keep in stock for 14 days, then deliver
      const delDate = new Date(arrDate);
      delDate.setDate(delDate.getDate() + 14);
      deliveryDate = delDate.toISOString();
      if (!customerName || customerName === 'フリー在庫(引当なし)') {
        stockStatus = 'フリー在庫';
      }
    } else {
      // No delivery date
      stockStatus = 'フリー在庫';
    }

    const sn = 'SN' + Math.floor(Math.random() * 10000);

    const newVehicleId = addVehicle({
      modelName: modelType,
      serialNumber: sn,
      status: '受け入れ予定',
      stockStatus,
      arrivalDate,
      deliveryDate,
      customerName: customerName && customerName !== 'フリー在庫(引当なし)' ? customerName : undefined,
      parkingAreaIds: Array.from(selectedParkingIds),
      contracts: selectedContractIds.length > 0 ? selectedContractIds.map(id => ({ contractId: id, startDate: deliveryDate || arrivalDate || new Date().toISOString(), startSmr: 0 })) : undefined,
    });

    const baseTasks = [];
    if (hasTemporaryAssembly) baseTasks.push('受け入れ点検', '仮組みまたは改造', '仮組みまたは改造後点検');
    else baseTasks.push('受け入れ点検');

    baseTasks.forEach(taskTitle => {
      addTask({
        vehicleId: newVehicleId,
        targetModelName: modelType,
        title: taskTitle,
        category: '受け入れ点検',
        urgency: '1ヶ月以内',
        progress: '未着手',
        deadline: arrivalDate,
        staffIds: staff.length > 0 ? [staff[Math.floor(Math.random() * staff.length)].id] : undefined,
      });
    });

    // Create a mock delivery task if delivery is planned
    if (deliveryDate) {
      addTask({
        vehicleId: newVehicleId,
        targetModelName: modelType,
        title: '納入前点検および納入作業',
        category: '新車巡回', // Using an existing category
        urgency: '1ヶ月以内',
        progress: '未着手',
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
    { id: 'arrival', label: '1. 受入設定', visible: true },
    { id: 'stock', label: '2. 在庫保管', visible: flowChoice === 2 || flowChoice === 3 },
    { id: 'delivery', label: '3. 納車設定', visible: flowChoice === 1 || flowChoice === 2 },
  ];

  const visibleTabs = tabs.filter(t => t.visible);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4 xl:p-8 bg-slate-900/60 backdrop-blur-sm">
      <div className={cn(
        "bg-white md:rounded-xl shadow-2xl w-full flex flex-col overflow-hidden relative transition-all h-[100dvh]",
        "max-w-[98vw] xl:max-w-[1700px] md:h-[98vh] max-h-[100dvh] min-h-[100dvh] md:min-h-[600px]"
      )}>
        <button onClick={onClose} className={cn("absolute top-2 right-2 md:top-4 md:right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition z-50", step === 2 ? "hidden" : "")}>
          <X className="w-5 h-5 md:w-6 md:h-6"/>
        </button>

        {step === 1 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 md:px-10 bg-slate-50 relative overflow-y-auto">
            <div className="w-full max-w-2xl space-y-8 bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-slate-200 relative">

              <h2 className="text-2xl font-bold text-slate-800 text-center">納入予定の追加</h2>
              <form onSubmit={handleStart} className="space-y-8 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">対象の機種型番 <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-slate-400" />
                      </div>
                      <input 
                        autoFocus
                        type="text" 
                        list="machine-models"
                        placeholder="例: PC200-11"
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
                    <label className="block text-sm font-bold text-slate-700 mb-2">納入先顧客名</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-slate-400" />
                      </div>
                      <input 
                        type="text" 
                        placeholder="例: 株式会社〇〇建機"
                        className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base shadow-sm font-bold bg-slate-50 focus:bg-white transition-colors"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2 pt-2 md:pt-0 md:border-none border-t border-slate-100">
                    <label className="block text-sm font-bold text-slate-700">受入後の予定は？ <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button 
                        type="button"
                        onClick={() => setFlowChoice(1)}
                        className={cn("px-4 py-3 border-2 rounded-lg text-sm font-bold flex flex-col items-center justify-center text-center transition", flowChoice === 1 ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-indigo-300 text-slate-600")}
                      >
                        <Wrench className="w-5 h-5 mb-2 shrink-0 text-indigo-500" />
                        <div>即納車</div>
                        <div className="text-[10px] text-slate-500 font-normal mt-1">受入後そのまま納品</div>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFlowChoice(2)}
                        className={cn("px-4 py-3 border-2 rounded-lg text-sm font-bold flex flex-col items-center justify-center text-center transition", flowChoice === 2 ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-indigo-300 text-slate-600")}
                      >
                        <Clock className="w-5 h-5 mb-2 shrink-0 text-indigo-500" />
                        <div>一時保管</div>
                        <div className="text-[10px] text-slate-500 font-normal mt-1">一時保管して納車</div>
                      </button>
                      <button 
                        type="button"
                        onClick={() => setFlowChoice(3)}
                        className={cn("px-4 py-3 border-2 rounded-lg text-sm font-bold flex flex-col items-center justify-center text-center transition", flowChoice === 3 ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-indigo-300 text-slate-600")}
                      >
                        <Package className="w-5 h-5 mb-2 shrink-0 text-indigo-500" />
                        <div>在庫行き</div>
                        <div className="text-[10px] text-slate-500 font-normal mt-1">在庫として保管</div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 md:space-y-2 pt-6 md:pt-4 border-t border-slate-100">
                    <label className="block text-sm font-bold text-slate-700 mb-1">受入時に仮組みや改造はありますか？ <span className="text-red-500">*</span></label>
                    <div className="grid grid-cols-2 gap-3 max-w-sm">
                      <button 
                        type="button"
                        onClick={() => setHasTemporaryAssembly(true)}
                        className={cn("py-2.5 border-2 rounded-lg text-sm font-bold transition flex items-center justify-center", hasTemporaryAssembly === true ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-indigo-300 text-slate-600")}
                      >
                        <div className={cn("w-3 h-3 rounded-full border-2 mr-2 flex items-center justify-center shrink-0", hasTemporaryAssembly === true ? "border-indigo-500" : "border-slate-300")}>
                          {hasTemporaryAssembly === true && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>}
                        </div>
                        あり
                      </button>
                      <button 
                        type="button"
                        onClick={() => setHasTemporaryAssembly(false)}
                        className={cn("py-2.5 border-2 rounded-lg text-sm font-bold transition flex items-center justify-center", hasTemporaryAssembly === false ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 hover:border-indigo-300 text-slate-600")}
                      >
                        <div className={cn("w-3 h-3 rounded-full border-2 mr-2 flex items-center justify-center shrink-0", hasTemporaryAssembly === false ? "border-indigo-500" : "border-slate-300")}>
                          {hasTemporaryAssembly === false && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>}
                        </div>
                        なし
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 md:space-y-2 pt-6 md:pt-4 border-t border-slate-100">
                    <label className="block text-sm font-bold text-slate-700 mb-1">契約・保守プランの適用 <span className="text-slate-400 font-normal ml-1">(任意)</span></label>
                    <div className="flex flex-col gap-2">
                      {selectedContractIds.map(id => {
                        const c = contracts.find(c => c.id === id);
                        if (!c) return null;
                        return (
                          <div key={id} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg bg-slate-50 transition hover:border-slate-300 shadow-sm">
                            <div className="flex items-center">
                              <ShieldCheck className="w-4 h-4 text-emerald-600 mr-2 shrink-0" />
                              <span className="text-sm font-bold text-slate-800">{c.title}</span>
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
                          {selectedContractIds.length === 0 ? "契約・プランを追加する" : "さらにプランを追加する"}
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
                    詳細設定へ進む <ArrowRight className="w-5 h-5 ml-2" />
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
                <h2 className="text-lg md:text-2xl font-bold text-slate-800">詳細の編集</h2>
              </div>
              <div className="flex items-center gap-2 md:gap-4 overflow-x-auto scrollbar-hide pb-1 md:pb-0">
                <div className="px-2 py-1 md:px-3 text-xs md:text-sm bg-indigo-50 rounded-lg font-mono font-bold text-indigo-700 border border-indigo-100 flex-shrink-0">
                  {modelType}
                </div>
                {customerName && customerName !== 'フリー在庫(引当なし)' && (
                  <div className="text-xs md:text-sm font-bold text-slate-500 font-mono flex-shrink-0">
                    {customerName}
                  </div>
                )}
                {customerName === 'フリー在庫(引当なし)' && (
                  <div className="text-xs md:text-sm font-bold text-slate-400 flex-shrink-0">
                     在庫行き
                  </div>
                )}
                <button type="button" onClick={() => setShowContractsModal(true)} className="flex items-center px-2 py-1 md:px-3 py-1.5 md:py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs md:text-sm font-bold transition flex-shrink-0">
                  <ShieldCheck className="w-3 h-3 md:w-4 md:h-4 mr-1 text-indigo-600 flex-shrink-0" />
                  契約・保守プラン<span className="ml-1">({selectedContractIds.length}件)</span>
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
                      title="搬入・受入の設定" 
                      defaultTasks={hasTemporaryAssembly ? ["受け入れ時の外観チェック", "受け入れ時の動作確認", "仮組みまたは改造", "仮組みまたは改造後点検"] : ["受け入れ時の外観チェック", "受け入れ時の動作確認"]} 
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
                       在庫保管の設定
                     </h3>
                     <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-6 space-y-6 md:space-y-8">
                       <div className="space-y-3">
                         <label className="block text-sm font-bold text-slate-700">在庫予定期間</label>
                         {flowChoice === 3 ? (
                           <div className="flex items-center gap-4 text-sm font-bold text-slate-600">
                             <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg pointer-events-none">
                               <input type="checkbox" checked={true} readOnly className="text-indigo-600 rounded focus:ring-indigo-500 border-slate-300 w-4 h-4 cursor-pointer" />
                               期間未定
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
                         <label className="block text-sm font-bold text-slate-700">保管エリア (マップ)</label>
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
                      title="納車作業とアサインの設定" 
                      defaultTasks={["納入前点検", "納入作業", "納入後確認"]} 
                      tools={tools} 
                      staff={staff} 
                      isReception={false} 
                    />
                   </div>
                )}
              </div>
            </div>
            
            {/* Bottom Sticky Action Bar */}
            <div className="px-4 py-4 md:px-6 md:py-5 bg-white border-t border-slate-200 flex flex-col md:flex-row justify-between shrink-0 shadow-sm z-20 gap-3">
              <button onClick={onClose} className="order-2 md:order-1 px-4 py-2 md:px-6 md:py-3 text-slate-600 font-bold rounded-lg hover:bg-slate-100 transition text-sm md:text-base border border-slate-200 md:w-auto w-full text-center">キャンセル</button>
              
              <div className="flex space-x-3 md:space-x-4 order-1 md:order-2 w-full md:w-auto">
                 <button onClick={handleSave} className="w-full md:w-auto px-6 py-3 md:px-10 md:py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm transition text-lg flex items-center justify-center">
                   保存する
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
                追加する契約・保守プランを選択
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
                    <span className="ml-3 text-sm text-slate-800 font-bold">{c.title}</span>
                  </label>
                ))}

                {contracts.length === 0 && (
                   <div className="col-span-1 md:col-span-2 text-center py-8 text-slate-500 font-bold text-sm">
                     追加できるプランがありません
                   </div>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-white flex justify-end shrink-0 gap-3">
              <button type="button" onClick={() => setShowContractsModal(false)} className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-sm">
                追加・適用する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Shared component for Task settings (A and C tabs)

const AssignBlock = ({ isReception, staffIds, setStaffIds, date, setDate, staff }: any) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-end">
    <div>
      <label className="block text-xs md:text-sm font-bold text-slate-600 mb-2">{isReception ? "受入担当者" : "作業担当者"}</label>
      <div className="w-full border-slate-300 border rounded-lg px-2 py-1.5 text-sm bg-white shadow-sm font-bold flex flex-wrap gap-1 min-h-[38px] items-center">
        {(!staffIds || staffIds.length === 0) ? (
          <span className="text-slate-400 px-1">未定</span>
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
          <option value="" disabled>＋ 追加...</option>
          {staff?.filter((s:any) => !staffIds?.includes(s.id)).map((s:any) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
    </div>
    <div className="lg:col-span-2 flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <label className="block text-xs md:text-sm font-bold text-slate-600 mb-2">開始 {isReception && "（搬入）"}</label>
        <input 
          type="date" 
          value={date || ""} 
          onChange={e => setDate && setDate(e.target.value)} 
          className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm bg-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-bold" 
        />
      </div>
      <div className="flex-1">
        <label className="block text-xs md:text-sm font-bold text-slate-600 mb-2">終了</label>
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
  const { parking, vehicleMasters, contracts, reportTemplates } = useApp();
  
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
    <div className="space-y-4 md:space-y-8 animate-in fade-in duration-300 pb-10 md:pb-20">
      <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center">
        {title}
      </h3>
      
      {/* Horizontally aligned Task & Tools & Parts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="p-4 md:p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between mb-2">
            <label className="font-bold text-sm text-slate-700 flex items-center"><CheckCircle className="w-5 h-5 mr-2 text-indigo-500" />作業内容</label>
            <button 
              onClick={(e) => { e.preventDefault(); setTasks([...tasks, { name: "", reportFormatId: "", paidServiceId: "" }]); }}
              className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded font-bold flex items-center shadow-sm"
            >
              <Plus className="w-3 h-3 mr-1"/>作業を追加
            </button>
          </div>
          <div className="space-y-3">
            {tasks.map((t: any, i: number) => (
              <div key={i} className="flex gap-2 relative group items-start">
                <div className="w-6 h-6 flex items-center justify-center shrink-0 bg-slate-100 rounded text-xs font-bold text-slate-500 mt-2">{i+1}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      value={t.name}
                      onChange={(e) => {
                        const newTasks = [...tasks];
                        newTasks[i] = { ...newTasks[i], name: e.target.value };
                        setTasks(newTasks);
                      }}
                      className="flex-1 border-slate-300 rounded-lg px-3 py-2 text-sm font-bold shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50" 
                      placeholder="作業内容を入力"
                    />
                    <button
                      type="button"
                      className="flex items-center justify-center px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-bold transition-colors shadow-sm shrink-0 whitespace-nowrap group-hover:opacity-100 md:opacity-0 opacity-100"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1" />
                      AIで詳細を付加
                    </button>
                  </div>
                  <div className="flex gap-2 flex-col md:flex-row">
                    <select 
                      value={t.reportFormatId}
                      onChange={(e) => {
                        const newTasks = [...tasks];
                        newTasks[i] = { ...newTasks[i], reportFormatId: e.target.value };
                        setTasks(newTasks);
                      }}
                      className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 bg-slate-50 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer p-0"
                    >
                      <option value="">-- 報告様式: 無設定 --</option>
                      {reportTemplates?.map((rt: any) => (
                        <option key={rt.id} value={rt.id}>{rt.name}</option>
                      ))}
                    </select>

                    <select 
                      value={t.paidServiceId}
                      onChange={(e) => {
                        const newTasks = [...tasks];
                        newTasks[i] = { ...newTasks[i], paidServiceId: e.target.value };
                        setTasks(newTasks);
                      }}
                      className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 bg-slate-50 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
                    >
                      <option value="">-- 適用補償・有償: 無設定 --</option>
                      <optgroup label="有償サービス">
                        <option value="有償定期メンテナンス">有償定期メンテナンス</option>
                        <option value="有償修理">有償修理</option>
                      </optgroup>
                      <optgroup label="補償プラン (無償)">
                        {contracts?.map((c: any) => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                        <option value="補償">その他補償</option>
                      </optgroup>
                    </select>
                  </div>
                </div>
                <button onClick={() => setTasks(tasks.filter((_: any, idx: number) => idx !== i))} className="absolute -right-8 top-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition mt-1">
                  <X className="w-4 h-4"/>
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 md:p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4 flex flex-col">
          <label className="font-bold text-sm text-slate-700 flex items-center"><Wrench className="w-5 h-5 mr-2 text-indigo-500" />使用工具・器具</label>
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
              className="w-full py-2.5 md:py-3 border border-dashed border-slate-300 text-indigo-600 font-bold rounded-lg focus:ring-indigo-500 appearance-none bg-slate-50/50 cursor-pointer text-center text-sm md:text-base cursor-pointer"
              onChange={(e) => {
                if(e.target.value === "") return;
                const tl = tools.find((tool:any) => tool.id === e.target.value);
                if (tl && !selectedTools.find((st: any) => st.id === tl.id)) {
                  setSelectedTools([...selectedTools, tl]);
                }
                e.target.value = "";
              }}
            >
              <option value="">＋ マスタから工具を追加</option>
              {tools.map((t:any) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        <div className="p-4 md:p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4 flex flex-col">
          <label className="font-bold text-sm text-slate-700 flex items-center"><Package className="w-5 h-5 mr-2 text-indigo-500" />使用部品リスト</label>
          <div className="mt-auto grid grid-cols-1 xl:grid-cols-2 gap-3">
            <button 
              type="button"
              className="w-full py-2.5 border border-dashed border-slate-300 text-indigo-600 font-bold rounded-lg focus:ring-indigo-500 bg-slate-50/50 hover:bg-slate-100 transition text-center text-sm"
              onClick={() => {}}
            >
              ＋ パーツブックから登録
            </button>
            <button 
              type="button"
              className="w-full py-2.5 border border-dashed border-slate-300 text-indigo-600 font-bold rounded-lg focus:ring-indigo-500 bg-slate-50/50 hover:bg-slate-100 transition text-center text-sm"
              onClick={() => {}}
            >
              ＋ 在庫から登録
            </button>
          </div>
        </div>
      </div>
      
      {/* Workspace & Vehicles */}
      <div className="p-4 md:p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4">
        <h4 className="font-bold text-slate-700 flex items-center text-base md:text-lg">
          <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
          作業場 / 駐車エリア指定・予約車両
        </h4>
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div>
            <label className="block text-xs md:text-sm font-bold text-slate-600 mb-2">作業場・搬入エリア</label>
            <div className="h-[400px] w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] rounded-lg border border-slate-200 overflow-hidden relative mb-2">
              {parking.map(p => {
                const isSelected = selectedParkingIds.has(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={(e) => toggleParking && toggleParking(p.id, e)}
                    className={cn(
                      "absolute rounded-lg border-2 flex flex-col items-center justify-center p-2 shadow-md transition-all cursor-pointer overflow-hidden",
                      isSelected ? "border-indigo-500 bg-indigo-50/90 shadow-lg ring-4 ring-indigo-500/20 z-20" : "border-slate-300 bg-slate-50/90 hover:border-indigo-300 hover:bg-slate-100"
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
              className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:ring-indigo-500 font-bold text-slate-700"
            >
              <option value="">未定 / 指定なし</option>
              {parking.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm mt-6">
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-700 flex items-center">
              <Truck className="w-4 h-4 mr-2 text-indigo-500" />
              搬入手段・車両手配
            </h4>
          </div>
          
          <div className="p-4 md:p-6 space-y-6">
            {/* 外部 */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <div className="font-bold text-slate-700 mb-1 text-sm">外部業者の手配台数</div>
                <div className="text-xs text-slate-500">外部から来場するトラック等の台数を指定します</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                 <input 
                   type="number" 
                   min="0"
                   value={externalVehicleCount} 
                   onChange={e => setExternalVehicleCount(parseInt(e.target.value) || 0)} 
                   className="w-24 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 font-bold text-slate-700 text-right shadow-sm"
                 />
                 <span className="text-sm font-bold text-slate-600">台</span>
              </div>
            </div>

            {/* 自社 */}
            <div className="border-t border-slate-100 pt-6 flex flex-col gap-4">
              <label className="flex items-start cursor-pointer group w-fit">
                <input type="checkbox" className="mt-0.5 mr-3 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-5 h-5 cursor-pointer shadow-sm transition-all" 
                  checked={tasks.some(t => t.name === '車両搬入作業')}
                  onChange={(e) => {
                    if (e.target.checked) setTasks([{ name: '車両搬入作業', reportFormatId: "" }, ...tasks]);
                    else {
                      setTasks(tasks.filter(t => t.name !== '車両搬入作業'));
                      setSelectedInternalVehicles([]);
                    }
                  }}
                />
                <div>
                  <div className="font-bold text-slate-700 text-sm mb-1 group-hover:text-indigo-600 transition-colors">自社手配による車両の搬入(引取等)を行う</div>
                  <div className="text-xs text-slate-500">
                    チェックするとタスクに「車両搬入作業」が追加されます
                  </div>
                </div>
              </label>
              
              {/* 自社車両セレクター (Checked時のみ活性化、または表示する) */}
              <div className={cn("transition-all duration-300 overflow-hidden", tasks.some(t => t.name === '車両搬入作業') ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0")}>
                <div className="pl-8">
                   <label className="block text-xs font-bold text-slate-500 mb-2">使用する自社車両 (任意)</label>
                   {selectedInternalVehicles.length > 0 && (
                     <div className="flex flex-wrap gap-2 mb-3">
                       {selectedInternalVehicles.map(v => (
                          <span key={v.id} className="bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-xs font-bold flex items-center shadow-sm">
                            <Truck className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> {v.modelName}
                            <button onClick={(e) => { e.preventDefault(); setSelectedInternalVehicles(selectedInternalVehicles.filter(sv => sv.id !== v.id))}} className="ml-2 hover:text-slate-900 border-l border-slate-200 pl-2"><X className="w-3.5 h-3.5"/></button>
                          </span>
                       ))}
                     </div>
                   )}
                   <select 
                     className="w-full md:w-80 py-2 px-3 border border-dashed border-slate-300 text-slate-600 font-bold rounded-lg focus:ring-indigo-500 appearance-none bg-slate-50 cursor-pointer text-sm shadow-sm hover:bg-slate-100 disabled:opacity-50 transition-colors"
                     onChange={(e) => {
                       if(e.target.value === "") return;
                       const v = vehicleMasters.find((vm:any) => vm.id === e.target.value);
                       if (v && !selectedInternalVehicles.find(sv => sv.id === v.id)) {
                         setSelectedInternalVehicles([...selectedInternalVehicles, v]);
                       }
                       e.target.value = "";
                     }}
                   >
                     <option value="">＋ 自社車両を追加</option>
                     {vehicleMasters.map((v:any) => <option key={v.id} value={v.id}>{v.modelName}</option>)}
                   </select>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Assignment & Schedule */}
      <div className="p-4 md:p-6 bg-white border border-slate-200 rounded-xl shadow-sm space-y-4 md:space-y-6">
        <h4 className="font-bold text-slate-700 flex items-center text-base md:text-lg"><User className="w-5 h-5 mr-2 text-indigo-500" />アサイン・日時設定</h4>
        
        <div className="relative bg-slate-50 p-4 md:p-5 rounded-xl border border-slate-200 shadow-inner">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={handleOpenScheduleModal}
              className="text-xs py-1.5 px-3 bg-white border border-slate-300 text-slate-700 font-bold rounded hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center"
            >
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-600" /> スケジュールを確認
            </button>
          </div>
          <AssignBlock 
            isReception={isReception} 
            staffIds={staffIds} 
            setStaffIds={setStaffIds} 
            date={date} 
            setDate={setDate} 
            staff={staff} 
          />
        </div>
        
        {/* Map/Note area for delivery/field work */}
        {!isReception && (
          <div className="mt-4 border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
            <div className="p-3 md:p-4 bg-slate-50 border-b border-slate-200">
              <h5 className="font-bold text-slate-700 text-sm flex items-center">
                <div className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
                現場注意点・入り口マップ共有
              </h5>
            </div>
            <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">注意事項・テキストメモ</label>
                <textarea 
                  rows={6}
                  className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm font-bold shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                  placeholder="例：南側の入り口からは大型車が入れないため、北門から入ること。受付は入り口すぐ..."
                ></textarea>
              </div>
              <div className="relative border border-slate-200 rounded-lg overflow-hidden bg-slate-100 flex flex-col items-center justify-center min-h-[200px]">
                {/* Simulated Map Canvas */}
                <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=Tokyo&zoom=14&size=400x400&sensor=false')] bg-cover bg-center opacity-30 grayscale pointer-events-none"></div>
                <div className="relative z-10 text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-500 shadow-sm border-2 border-white">
                    <span className="font-bold text-xl">Map</span>
                  </div>
                  <p className="text-xs font-bold text-slate-500">※マップ上にお絵描き(現在モック)</p>
                  <button className="px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-xs font-bold text-indigo-600 hover:bg-slate-50 transition">
                    マップを開いて手書きメモを追加
                  </button>
                </div>
              </div>
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
              スケジュールを確認してアサイン
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
             />
          </div>
          
          <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 shrink-0 flex items-center">
            <h4 className="text-sm font-bold text-slate-700 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-slate-500" />
              スケジュールの確認
            </h4>
            <span className="ml-3 text-xs text-slate-500 font-medium">※こちらは確認用の表示です</span>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col xl:flex-row bg-white relative">
            <div className="w-full xl:w-64 bg-slate-50 border-b xl:border-b-0 xl:border-r border-slate-200 flex flex-col shrink-0 z-10">
              <div className="p-3 bg-slate-100 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700">スケジュールを確認するメンバー</span>
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
