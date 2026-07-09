import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, User, CheckCircle, Save, AlertCircle, ArrowLeft, Package, MapPin, MessageSquare, Send, Trash2, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { TaskConfigSection } from './AddDeliveryModal';

export function EditDeliveryModal({ vehicleId, onClose }: { vehicleId: string, onClose: () => void }) {
  const { vehicles, tasks, staff, tools, parking, updateVehicle, updateTask, deleteVehicle, contracts } = useApp();
  
  const vehicle = vehicles.find(v => v.id === vehicleId);
  const vehicleTasks = tasks.filter(t => t.vehicleId === vehicleId);
  const recTask = vehicleTasks.find(t => t.title.includes('受入') || t.title.includes('点検') || t.title.includes('作業'));
  const delTask = vehicleTasks.find(t => t.title.includes('納入'));
  
  const [arrivalDate, setArrivalDate] = useState(vehicle?.arrivalDate ? format(new Date(vehicle.arrivalDate), 'yyyy-MM-dd') : '');
  const [deliveryDate, setDeliveryDate] = useState(vehicle?.deliveryDate ? format(new Date(vehicle.deliveryDate), 'yyyy-MM-dd') : '');
  const [recStaffIds, setRecStaffIds] = useState<string[]>(recTask?.staffIds || (recTask?.staffId ? [recTask.staffId] : []));
  const [delStaffIds, setDelStaffIds] = useState<string[]>(delTask?.staffIds || (delTask?.staffId ? [delTask.staffId] : []));
  const [selectedContractIds, setSelectedContractIds] = useState<Set<string>>(new Set(vehicle?.contracts?.map(c => c.contractId) || []));
  const [showContractsModal, setShowContractsModal] = useState(false);

  const [isPeriodUnspecified, setIsPeriodUnspecified] = useState(false);
  const [selectedParkingIds, setSelectedParkingIds] = useState<Set<string>>(new Set(vehicle?.parkingAreaIds || []));

  const [isDirty, setIsDirty] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [activeTab, setActiveTab] = useState<'arrival' | 'stock' | 'delivery'>('arrival');

  const [chatMessages, setChatMessages] = useState<{id: string, text: string, sender: string, time: string, isSelf: boolean}[]>([
    { id: '1', text: '納入予定日が決定しました。ご確認お願いします。', sender: 'フロント 高橋', time: '10:00', isSelf: false }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, activeTab]);

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

  useEffect(() => {
    const origArr = vehicle?.arrivalDate ? format(new Date(vehicle.arrivalDate), 'yyyy-MM-dd') : '';
    const origDel = vehicle?.deliveryDate ? format(new Date(vehicle.deliveryDate), 'yyyy-MM-dd') : '';
    const origRecStaff = recTask?.staffIds?.join(",") || recTask?.staffId || '';
    const origDelStaff = delTask?.staffIds?.join(",") || delTask?.staffId || '';
    
    // Check parking equality
    const origParkings = vehicle?.parkingAreaIds || [];
    let parkingsChanged = origParkings.length !== selectedParkingIds.size;
    if (!parkingsChanged) {
      for (const id of origParkings) {
        if (!selectedParkingIds.has(id)) {
           parkingsChanged = true;
           break;
        }
      }
    }

    const origContractIds = new Set(vehicle?.contracts?.map(c => c.contractId) || []);
    const contractsChanged = selectedContractIds.size !== origContractIds.size || [...selectedContractIds].some(id => !origContractIds.has(id));
    
    setIsDirty(
      arrivalDate !== origArr || 
      deliveryDate !== origDel || 
      recStaffIds.join(",") !== origRecStaff || 
      delStaffIds.join(",") !== origDelStaff ||
      parkingsChanged ||
      contractsChanged
    );
  }, [arrivalDate, deliveryDate, recStaffIds, delStaffIds, selectedParkingIds, selectedContractIds, vehicle, recTask, delTask]);

  const handleClose = () => {
    if (isDirty) {
      setShowConfirm(true);
    } else {
      onClose();
    }
  };

  const handleForceClose = () => {
    onClose();
  };

  const handleSave = () => {
    updateVehicle(vehicleId, {
      arrivalDate: arrivalDate ? new Date(arrivalDate).toISOString() : undefined,
      deliveryDate: deliveryDate ? new Date(deliveryDate).toISOString() : undefined,
      parkingAreaIds: Array.from(selectedParkingIds),
      contracts: selectedContractIds.size > 0 ? Array.from(selectedContractIds).map(id => {
        const existing = vehicle?.contracts?.find(c => c.contractId === id);
        if (existing) return existing;
        return {
          contractId: id,
          startDate: deliveryDate ? new Date(deliveryDate).toISOString() : (arrivalDate ? new Date(arrivalDate).toISOString() : new Date().toISOString()),
          startSmr: vehicle?.currentSmr || 0
        };
      }) : undefined,
    });
    
    if (recTask) {
      updateTask(recTask.id, { 
        staffIds: recStaffIds, 
        deadline: arrivalDate ? new Date(arrivalDate).toISOString() : undefined 
      });
    }
    if (delTask) {
      updateTask(delTask.id, { 
        staffIds: delStaffIds, 
        deadline: deliveryDate ? new Date(deliveryDate).toISOString() : undefined 
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

  if (!vehicle) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm"
         onClick={(e) => {
           if (e.target === e.currentTarget) handleClose();
         }}>
      
      {showConfirm && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm rounded-xl">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center text-amber-600 mb-4">
              <AlertCircle className="w-6 h-6 mr-2" />
              <h3 className="font-bold text-lg">変更が破棄されます</h3>
            </div>
            <p className="text-slate-600 text-sm mb-6 font-medium">
              保存されていない変更があります。このまま閉じると変更内容は失われます。よろしいですか？
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              >
                キャンセル
              </button>
              <button 
                onClick={handleForceClose}
                className="px-4 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-sm"
              >
                破棄して閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm rounded-xl">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center text-rose-600 mb-4">
              <AlertCircle className="w-6 h-6 mr-2" />
              <h3 className="font-bold text-lg">カードの削除</h3>
            </div>
            <p className="text-slate-600 text-sm mb-6 font-medium">
              このカードを削除しますか？<br/>（関連するすべてのタスクも削除されます）
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
                  deleteVehicle(vehicleId);
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

      <div className="bg-white md:rounded-xl shadow-2xl w-full max-w-[98vw] xl:max-w-[1700px] h-[100dvh] md:h-[98vh] flex flex-col overflow-hidden relative">
        <div className="px-4 md:px-6 py-4 flex flex-wrap items-center justify-between border-b border-slate-100 bg-slate-50 shrink-0 gap-3">
          <h2 className="text-lg font-bold text-slate-800 flex items-center shrink-0">
            <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
            詳細の編集
          </h2>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-900 font-bold rounded-lg font-mono text-sm">
              {vehicle.modelName}
            </div>
            {vehicle.customerName && (
              <div className="flex items-center px-2 py-1 bg-amber-50 border border-amber-200 text-amber-800 font-bold rounded-lg text-xs">
                <User className="w-3 h-3 mr-1 text-amber-500" />
                {vehicle.customerName}
              </div>
            )}
            <div className="text-xs font-mono text-slate-500 font-bold">
              {vehicle.serialNumber}
            </div>
            <button onClick={() => setShowContractsModal(true)} 
                    className="flex items-center text-sm font-bold transition px-3 py-1.5 rounded-lg border whitespace-nowrap shadow-sm cursor-pointer text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200 ml-2">
              <ShieldCheck className="w-4 h-4 mr-2" />
              契約・保守プラン ({selectedContractIds.size}件)
            </button>
            <button onClick={handleClose} className="ml-2 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition">
              <X className="w-5 h-5"/>
            </button>
          </div>
        </div>

        <div className="flex border-b border-slate-200 shrink-0 bg-white">
          <button 
            onClick={() => setActiveTab('arrival')}
            className={cn("flex-1 py-3 text-sm font-bold border-b-2 transition-colors", activeTab === 'arrival' ? "border-indigo-500 text-indigo-600 bg-indigo-50/30" : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700")}
          >
            1. 受入設定
          </button>
          <button 
            onClick={() => setActiveTab('stock')}
            className={cn("flex-1 py-3 text-sm font-bold border-b-2 transition-colors", activeTab === 'stock' ? "border-indigo-500 text-indigo-600 bg-indigo-50/30" : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700")}
          >
            2. 在庫保管
          </button>
          <button 
            onClick={() => setActiveTab('delivery')}
            className={cn("flex-1 py-3 text-sm font-bold border-b-2 transition-colors relative", 
              activeTab === 'delivery' ? "border-indigo-500 text-indigo-600 bg-indigo-50/30" : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            )}
          >
            3. 納車設定
          </button>
        </div>

        <div className="flex-1 overflow-y-auto lg:overflow-hidden p-4 lg:p-6 bg-slate-50 flex flex-col lg:flex-row gap-6">
          <div className="flex-1 w-full min-w-0 mx-auto lg:mx-0 lg:overflow-y-auto lg:pr-2 lg:-mr-2 pb-10 lg:pb-0">
            {activeTab === 'arrival' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                 <TaskConfigSection 
                   title="搬入・受入の設定" 
                   defaultTasks={["受入時の外観チェック", "受入時の動作確認"]} 
                   tools={tools} 
                   staff={staff} 
                   isReception={true} 
                   date={arrivalDate}
                   setDate={setArrivalDate}
                   staffIds={recStaffIds}
                   setStaffIds={setRecStaffIds}
                   selectedParkingIds={selectedParkingIds}
                   toggleParking={toggleParking}
                 />
              </div>
            )}

            {activeTab === 'stock' && (
              <div className="space-y-8 animate-in fade-in duration-300 pb-24">
                 <h3 className="text-2xl font-bold text-slate-800 flex items-center">
                   <Package className="w-6 h-6 mr-2 text-indigo-500"/>
                   在庫保管の設定
                 </h3>
                 <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-8">
                   <div className="space-y-3">
                     <label className="block text-sm font-bold text-slate-700">在庫予定期間</label>
                     
                     <div className="flex items-center gap-4 mt-2">
                       <input type="date" className="border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:ring-indigo-500 font-bold text-slate-700"/>
                       <span className="text-slate-400 font-bold">〜</span>
                       <input type="date" className="border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50 focus:ring-indigo-500 font-bold text-slate-700"/>
                     </div>
                   </div>
                   
                   <div className="space-y-3">
                     <label className="block text-sm font-bold text-slate-700">保管エリア</label>
                     <div className="h-[400px] w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] rounded-lg border border-slate-200 overflow-hidden relative">
                         {parking.map(p => (
                           <div
                             key={p.id}
                             onClick={(e) => toggleParking(p.id, e)}
                             className={cn(
                               "absolute rounded-lg border-2 flex flex-col items-center justify-center p-3 shadow-sm cursor-pointer transition-colors",
                               selectedParkingIds.has(p.id) ? "border-indigo-500 bg-indigo-50/90 shadow-lg ring-4 ring-indigo-500/20 z-20" : "border-slate-300 bg-slate-50/90 hover:border-indigo-400 hover:bg-slate-100"
                             )}
                             style={{ left: p.x, top: p.y, width: p.width, height: p.height }}
                           >
                             <div className="font-bold text-sm text-slate-800 pointer-events-none text-center">{p.name}</div>
                           </div>
                         ))}
                     </div>
                   </div>
                 </div>
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                 <TaskConfigSection 
                   title="納入作業のアサイン・設定" 
                   defaultTasks={["納入前点検", "納入作業", "納入後確認"]} 
                   tools={tools} 
                   staff={staff} 
                   isReception={false} 
                   date={deliveryDate}
                   setDate={setDeliveryDate}
                   staffIds={delStaffIds}
                   setStaffIds={setDelStaffIds}
                 />
              </div>
            )}
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

        <div className="px-6 py-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 rounded-b-xl">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-bold rounded-lg transition text-sm flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            削除
          </button>
          
          <div className="flex gap-3">
            <button 
              onClick={handleClose} 
              className="px-5 py-2.5 text-slate-600 font-bold rounded-lg hover:bg-slate-100 transition text-sm bg-white shadow-sm"
            >
              キャンセル
            </button>
            <button 
              onClick={handleSave}
              disabled={!isDirty}
              className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm transition flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              保存する
            </button>
          </div>
        </div>
      </div>

      {showContractsModal && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowContractsModal(false)}>
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 shrink-0">
               <h3 className="font-bold text-lg text-slate-800 flex items-center">
                 <ShieldCheck className="w-5 h-5 mr-2 text-indigo-500" />
                 契約・保守プラン設定
               </h3>
               <button onClick={() => setShowContractsModal(false)} className="p-2 text-slate-400 hover:text-slate-600 transition">
                 <X className="w-5 h-5" />
               </button>
            </div>
            <div className="overflow-y-auto pr-2 pb-4 flex-1">
              <label className="block text-sm font-bold text-slate-600 mb-4">適用する契約書や保守プランを選択 (複数選択可)</label>
              <div className="grid grid-cols-1 gap-3">
                {contracts.map(c => (
                  <label key={c.id} className={cn("flex items-center p-4 border-2 rounded-xl shadow-sm cursor-pointer transition", selectedContractIds.has(c.id) ? "border-indigo-500 bg-indigo-50" : "hover:border-indigo-300 hover:bg-slate-50 border-slate-200")}>
                    <input
                      type="checkbox"
                      checked={selectedContractIds.has(c.id)}
                      onChange={(e) => {
                        const next = new Set(selectedContractIds);
                        if (e.target.checked) next.add(c.id);
                        else next.delete(c.id);
                        setSelectedContractIds(next);
                        setIsDirty(true);
                      }}
                      className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 mr-4 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="block text-sm font-bold text-slate-800">{c.title}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div className="shrink-0 pt-4 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setShowContractsModal(false)}
                className="px-6 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
              >
                完了して閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
