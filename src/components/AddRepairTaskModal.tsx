import React, { useState, useRef, useEffect } from 'react';
import { X, Search, ChevronRight, CheckCircle, Car, Settings, User, ShieldAlert, ShieldCheck, FileText, Activity, MessageSquare, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { TaskConfigSection } from './AddDeliveryModal';
import { differenceInMonths } from 'date-fns';

export function AddRepairTaskModal({ 
  onClose,
  initialVehicleId,
  initialStep = 1,
  initialCategory,
  initialTitle,
  onTaskSaved,
  parentId
}: { 
  onClose: () => void;
  initialVehicleId?: string;
  initialStep?: 1 | 2;
  initialCategory?: string;
  initialTitle?: string;
  onTaskSaved?: () => void;
  parentId?: string;
}) {
  const { vehicles, staff, tools, addTask, contracts } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(initialVehicleId || null);
  
  const [step, setStep] = useState<1 | 2>(initialStep);
  const [date, setDate] = useState<string>('');
  const [staffIds, setStaffIds] = useState<string[]>([]);
  const [showContractsModal, setShowContractsModal] = useState(false);
  
  const [tasks, setTasks] = useState<Array<{ name: string, reportFormatId: string, paidServiceId: string }>>(() => {
    if (initialCategory === 'フィールドキャンペーン') {
      return [{ name: initialTitle || "FC対応", reportFormatId: "", paidServiceId: "" }];
    } else if (initialCategory === '定期点検' || initialCategory === '新車巡回') {
      return [{ name: initialTitle || "定期点検作業", reportFormatId: "", paidServiceId: "" }];
    } else if (initialCategory === '特定自主検査') {
      return [{ name: "特定自主検査", reportFormatId: "", paidServiceId: "" }];
    }
    return [
      { name: "故障状況の確認", reportFormatId: "", paidServiceId: "" },
      { name: "応急処置・修理", reportFormatId: "", paidServiceId: "" },
      { name: "動作確認", reportFormatId: "", paidServiceId: "" }
    ];
  });
  
  const [chatMessages, setChatMessages] = useState<{id: string, text: string, sender: string, time: string, isSelf: boolean}[]>([
    { id: '1', text: '本件、オイル漏れの疑いがあります。現場での確認をお願いします。', sender: 'フロント 高橋', time: '10:00', isSelf: false }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, step]);

  const filteredVehicles = vehicles.filter(v => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return v.modelName.toLowerCase().includes(term) ||
           v.serialNumber?.toLowerCase().includes(term) ||
           v.customerName?.toLowerCase().includes(term);
  });

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  const getValidContracts = () => {
    if (!selectedVehicle?.contracts) return [];
    return selectedVehicle.contracts.filter(vc => {
      const template = contracts.find(c => c.id === vc.contractId);
      if (!template) return false;
      
      const elapsedMonths = differenceInMonths(new Date(), new Date(vc.startDate));
      const elapsedSmr = (selectedVehicle.currentSmr || 0) - (vc.startSmr || 0);

      if (template.rule === 'months') {
        return template.months ? elapsedMonths <= template.months : true;
      }
      if (template.rule === 'smr') {
        return template.smr ? elapsedSmr <= template.smr : true;
      }
      if (template.rule === 'whichever_first') {
        const validMonths = template.months ? elapsedMonths <= template.months : true;
        const validSmr = template.smr ? elapsedSmr <= template.smr : true;
        return validMonths && validSmr;
      }
      if (template.rule === 'custom') {
        return true;
      }
      return false;
    });
  };

  const validContracts = getValidContracts();
  const hasValidContract = validContracts.length > 0;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    setChatMessages([...chatMessages, {
      id: Date.now().toString(),
      text: chatInput,
      sender: 'あなた',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true
    }]);
    setChatInput('');
  };

  const handleSave = () => {
    if (!selectedVehicleId) return;

    addTask({
      vehicleId: selectedVehicleId,
      targetModelName: selectedVehicle?.modelName || '',
      title: initialTitle || '一般修理・故障対応', // This could be dynamic based on TaskConfigSection if we hoisted state, but kept simple here
      category: (initialCategory as any) || '故障修理',
      urgency: '至急',
      progress: '未着手',
      deadline: date || new Date().toISOString(),
      staffIds: staffIds.length > 0 ? staffIds : undefined,
      parentId: parentId,
    });

    if (onTaskSaved) {
      onTaskSaved();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center sm:p-4 xl:p-8 bg-slate-900/60 backdrop-blur-sm">
      <div className={cn(
        "bg-white sm:rounded-xl shadow-2xl w-full flex flex-col overflow-hidden relative transition-all h-[100dvh] sm:h-[95vh] md:h-[98vh]",
        step > 1 ? "max-w-[98vw] xl:max-w-[1700px] sm:max-h-[98vh]" : "max-w-3xl min-h-[500px]"
      )}>
        <button onClick={onClose} className="absolute top-2 right-2 md:top-4 md:right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 z-20 transition">
          <X className="w-5 h-5 md:w-6 md:h-6"/>
        </button>

        {step === 1 ? (
          <div className="flex-1 flex flex-col pt-12 md:pt-8 bg-slate-50 relative min-h-0">
            <div className="px-4 md:px-8 shrink-0">
              <h2 className="text-lg md:text-2xl font-bold text-slate-800 mb-4 flex items-center">
                <Settings className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-indigo-600" />
                一般修理・故障 案件の追加
              </h2>
              
              <div className="bg-white p-3 md:p-4 shadow-sm border-y md:border md:rounded-xl border-slate-200 mb-0 md:mb-4">
                <label className="block text-xs md:text-sm font-bold text-slate-700 mb-2">対象車両を検索・選択してください</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                  </div>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="機種名、シリアル、顧客名で検索..."
                    className="block w-full pl-9 md:pl-10 pr-3 py-2 md:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm font-bold bg-slate-50 text-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 bg-white md:bg-transparent px-0 md:px-8">
              <div className="border-t border-slate-200 md:border-none divide-y divide-slate-100 md:space-y-2 pb-4">
                {filteredVehicles.map((v, idx) => (
                  <div 
                    key={v.id} 
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={cn(
                      "p-3 md:p-4 transition-all cursor-pointer flex items-center justify-between md:rounded-xl md:border",
                      selectedVehicleId === v.id 
                        ? "bg-indigo-50/80 md:border-indigo-500 md:shadow-sm md:ring-1 ring-indigo-500" 
                        : "bg-white hover:bg-slate-50 md:border-slate-200 md:hover:border-indigo-300"
                    )}
                  >
                    <div className="flex items-center gap-3">
                       <div className={cn(
                         "w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 border",
                         selectedVehicleId === v.id ? "bg-indigo-200 text-indigo-700 border-indigo-300" : "bg-slate-50 text-slate-400 border-slate-200"
                       )}>
                         <Car className="w-5 h-5" />
                       </div>
                       <div className="flex flex-col">
                         <div className="flex items-center flex-wrap gap-1.5 md:gap-2 mb-0.5">
                            <span className="font-bold text-base md:text-lg text-slate-800 leading-tight">{v.modelName}</span>
                            <span className="text-[10px] md:text-sm font-mono text-slate-500 bg-slate-100 px-1.5 md:px-2 py-0.5 rounded border border-slate-200">SN: {v.serialNumber}</span>
                         </div>
                         {v.customerName && (
                           <div className="flex items-center text-[10px] md:text-xs font-bold text-amber-700 mt-0.5">
                             <User className="w-3 h-3 mr-1" />
                             {v.customerName}
                           </div>
                         )}
                       </div>
                    </div>
                    <div className={cn(
                      "w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center shrink-0",
                      selectedVehicleId === v.id ? "border-indigo-500 bg-indigo-500 text-white" : "border-slate-300"
                    )}>
                      {selectedVehicleId === v.id && <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />}
                    </div>
                  </div>
                ))}
              </div>
              {filteredVehicles.length === 0 && (
                <div className="text-center py-10 md:py-16 text-slate-500 font-bold bg-white md:rounded-xl md:border md:border-dashed border-slate-300 mx-0 md:mx-4 my-0 md:my-4">
                  該当する車両がありません
                </div>
              )}
            </div>

            <div className="p-4 md:px-8 bg-white border-t border-slate-200 flex justify-end shrink-0 shadow-sm z-20">
               <button 
                 onClick={() => setStep(2)}
                 disabled={!selectedVehicleId}
                 className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition shadow-md flex items-center justify-center"
               >
                 次へ <ChevronRight className="w-5 h-5 ml-1" />
               </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full bg-slate-50">
            <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between bg-white shrink-0 shadow-sm z-10 gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-500">対象車両</span>
                <div className="px-3 py-1 bg-slate-100 rounded-lg font-mono font-bold text-indigo-900 border border-slate-200 text-lg">
                  {selectedVehicle?.modelName}
                </div>
                {selectedVehicle?.customerName && (
                  <div className="flex items-center text-sm font-bold text-slate-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                    <User className="w-4 h-4 mr-1 text-amber-500" />
                    顧客: {selectedVehicle.customerName}
                  </div>
                )}
                <div className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                  {selectedVehicle?.serialNumber}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                 <button onClick={() => setShowContractsModal(true)} 
                         className={cn("flex items-center text-sm font-bold transition px-3 py-2 rounded border whitespace-nowrap shadow-sm cursor-pointer",
                                       hasValidContract ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200" : "text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200")}>
                   {hasValidContract ? <ShieldCheck className="w-4 h-4 mr-2 text-emerald-500" /> : <ShieldAlert className="w-4 h-4 mr-2 text-amber-500" />}
                   {hasValidContract ? `保証適用中 (${validContracts.length}件)` : `保証範囲外`}
                 </button>
                <button className="flex items-center px-3 py-2 bg-white border border-slate-300 rounded hover:bg-slate-50 text-sm font-bold text-slate-700 shadow-sm transition whitespace-nowrap">
                  <Activity className="w-4 h-4 mr-2 text-indigo-500" />
                  車両状態確認
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto lg:overflow-hidden p-4 lg:p-6 flex flex-col lg:flex-row gap-6">
               <div className="flex-1 w-full min-w-0 mx-auto lg:mx-0 lg:overflow-y-auto lg:pr-2 lg:-mr-2 pb-24 lg:pb-0">
                 <TaskConfigSection 
                    title="作業内容・現場設定" 
                    defaultTasks={["故障状況の確認", "応急処置・修理", "動作確認"]} 
                    tools={tools} 
                    staff={staff} 
                    isReception={false}
                    date={date}
                    setDate={setDate}
                    staffIds={staffIds}
                    setStaffIds={setStaffIds}
                    externalTasks={tasks}
                    setExternalTasks={setTasks}
                 />
               </div>
               
               {/* メンバチャット */}
               <div className="w-full lg:w-96 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-[600px] lg:h-full shrink-0 mx-auto lg:mx-0">
                 <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
                   <h3 className="font-bold text-slate-800 flex items-center text-sm">
                     <MessageSquare className="w-4 h-4 mr-2 text-indigo-500" />
                     連絡・依頼事項
                   </h3>
                   <span className="text-xs text-slate-500 font-bold bg-white px-2 py-1 border border-slate-200 rounded">
                     代理店内メンバチャット
                   </span>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50" ref={chatScrollRef}>
                    {chatMessages.map(msg => (
                      <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.isSelf ? "items-end ml-auto" : "items-start")}>
                         {!msg.isSelf && <span className="text-[10px] text-slate-500 font-bold mb-1 ml-1">{msg.sender}</span>}
                         <div className={cn("px-3 py-2 rounded-2xl text-sm shadow-sm", msg.isSelf ? "bg-indigo-600 text-white rounded-br-none" : "bg-white border border-slate-200 text-slate-700 rounded-bl-none font-bold")}>
                           {msg.text}
                         </div>
                         <span className="text-[10px] text-slate-400 mt-1">{msg.time}</span>
                      </div>
                    ))}
                 </div>
                 
                 <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 shrink-0 flex gap-2">
                    <input 
                      type="text"
                      className="flex-1 border border-slate-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                      placeholder="メッセージを入力..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                    />
                    <button 
                      type="submit"
                      disabled={!chatInput.trim()}
                      className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center shrink-0 w-10 h-10"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                 </form>
               </div>
            </div>

            <div className="px-4 py-4 md:px-6 md:py-5 bg-white border-t border-slate-200 flex flex-col md:flex-row justify-between shrink-0 shadow-sm z-20 gap-3">
              <button type="button" onClick={() => setStep(1)} className="order-2 md:order-1 px-6 py-3 text-slate-600 font-bold rounded-lg hover:bg-slate-100 transition border border-slate-200 w-full md:w-auto text-center">
                 戻る
              </button>
              <button type="button" onClick={handleSave} className="order-1 md:order-2 px-10 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm transition text-lg flex items-center justify-center w-full md:w-auto">
                 登録して保存 <CheckCircle className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}
      </div>

       {showContractsModal && selectedVehicle && (
         <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
             <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 shrink-0">
               <h3 className="text-xl font-bold text-slate-800 flex items-center">
                 <ShieldCheck className="w-6 h-6 mr-2 text-emerald-600" />
                 有効な保証・定期メンテナンス
               </h3>
               <button onClick={() => setShowContractsModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="overflow-y-auto p-6 flex-1 bg-slate-50">
               {selectedVehicle?.contracts && selectedVehicle.contracts.length > 0 ? (
                 <div className="space-y-6">
                   {selectedVehicle.contracts.map((vc: any) => {
                     const template = contracts.find((c: any) => c.id === vc.contractId);
                     if (!template) return null;
                     
                     const isValid = validContracts.some((v: any) => v.contractId === vc.contractId);
                     const modelParts = template.partsConfig?.[selectedVehicle.modelName] || template.defaultParts || [];
                     const modelReportFields = template.reportFormatConfig?.[selectedVehicle.modelName] || template.defaultReportFormat || [];
                     const reportFormat = template.title.includes('延長') || template.title.includes('保証') ? '補償' : '有償定期メンテナンス';
                     
                     const hasMasterData = modelParts.length > 0 || modelReportFields.length > 0;

                     return (
                       <div key={vc.id} className={cn("p-5 rounded-lg border-2 shadow-sm font-bold bg-white", isValid ? "border-emerald-500" : "border-amber-300 opacity-90")}>
                         <div className="flex justify-between items-start mb-4">
                           <div>
                             <div className="flex items-center gap-2 mb-1">
                               <span className="text-lg text-slate-800">{template.title}</span>
                               {isValid ? (
                                 <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded">有効 (期間内)</span>
                               ) : (
                                 <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">期限切れ / 期間外</span>
                               )}
                             </div>
                             <div className="text-sm text-slate-600 font-normal">{template.description}</div>
                           </div>
                         </div>
                         
                         {hasMasterData ? (
                           <div className="grid grid-cols-1 gap-4 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                             {modelReportFields.length > 0 && (
                               <div>
                                 <div className="text-slate-600 text-xs mb-2">{isValid ? "有償/補償 指定報告様式" : "期間外 (有償メンテナンスとして追加可能)"}</div>
                                 <div className="flex flex-wrap gap-2">
                                     <div className="flex items-center justify-between bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-800 min-w-[200px] shadow-sm">
                                       <span>{reportFormat} ({modelReportFields.length}項目)</span>
                                       <button 
                                         onClick={() => {
                                           setTasks([...tasks, { name: isValid ? '規定点検実施・報告' : '有償点検実施・報告', reportFormatId: '', paidServiceId: reportFormat }]);
                                           setShowContractsModal(false);
                                         }}
                                         className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 font-bold rounded border border-indigo-200 transition"
                                       >
                                         タスク追加
                                       </button>
                                     </div>
                                 </div>
                               </div>
                             )}
                             {modelParts.length > 0 && (
                               <div className="mt-2">
                                 <div className="text-slate-600 text-xs mb-2">マスタ登録部品</div>
                                 <div className="flex flex-wrap gap-2">
                                   {modelParts.map((p: any, idx: number) => (
                                     <div key={`part-${idx}`} className="flex flex-col bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-800 min-w-[240px] shadow-sm">
                                       <div className="flex justify-between mb-1">
                                          <span className="font-bold">{p.partName}</span>
                                          <span className="text-xs text-slate-500">x{p.quantity}</span>
                                       </div>
                                       <div className="flex justify-between items-center text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                                         <span>品番: {p.partNumber}</span>
                                         <button 
                                            onClick={() => {
                                              setTasks([...tasks, { name: `部品交換: ${p.partName} (${isValid ? "補償" : "有償"})`, reportFormatId: '', paidServiceId: isValid ? reportFormat : '有償' }]);
                                              setShowContractsModal(false);
                                            }}
                                            className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2 py-1 font-bold rounded border border-indigo-200 transition"
                                         >
                                           タスクとして追加
                                         </button>
                                       </div>
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             )}
                           </div>
                         ) : (
                           <div className="mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-500 text-center">
                             この契約に関連するマスタタスク・部品は登録されていません
                           </div>
                         )}
                       </div>
                     );
                   })}
                 </div>
               ) : (
                 <div className="text-center py-12 text-slate-500 font-bold bg-white rounded-lg border border-dashed border-slate-300">
                   該当する有効な保証・定期メンテナンスはありませんでした
                 </div>
               )}
             </div>
             <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end shrink-0">
               <button onClick={() => setShowContractsModal(false)} className="px-6 py-2 border border-slate-300 hover:bg-slate-50 font-bold rounded-lg transition text-slate-700">
                 閉じる
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
}
