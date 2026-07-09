const fs = require('fs');

const code = `import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, Save, MessageSquare, Send, ShieldCheck, ShieldAlert, Trash2, AlertCircle, RefreshCw, Calendar, MapPin, Truck, User, Wrench, Package, Plus, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { differenceInMonths, format } from 'date-fns';

export function EditTaskModal({ taskId, isReadOnly, onClose }: { taskId: string, isReadOnly?: boolean, onClose: () => void }) {
  const { tasks, updateTask, deleteTask, staff, tools, vehicles, contracts, parking, vehicleMasters, reportTemplates } = useApp();
  const task = tasks.find(t => t.id === taskId);
  const selectedVehicle = vehicles.find(v => v.id === task?.vehicleId);
  const [showContractsModal, setShowContractsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [isRegular, setIsRegular] = useState(false);
  const [taskDate, setTaskDate] = useState(task?.deadline ? format(new Date(task.deadline), 'yyyy-MM-dd') : '');
  const [staffIds, setStaffIds] = useState<string[]>(task?.staffIds || (task?.staffId ? [task.staffId] : []));
  const [activeTab, setActiveTab] = useState<'tasks_parts_tools' | 'assignment_date' | 'delivery_workspace' | 'chat'>('tasks_parts_tools');

  const [localTasks, setLocalTasks] = useState<Array<{ name: string, reportFormatId: string, paidServiceId: string }>>([
    { name: task?.title || "", reportFormatId: "", paidServiceId: "" }
  ]);
  const [selectedTools, setSelectedTools] = useState<any[]>([]);
  const [selectedInternalVehicles, setSelectedInternalVehicles] = useState<any[]>([]);
  const [externalVehicleCount, setExternalVehicleCount] = useState<number>(0);
  const [selectedParkingIds, setSelectedParkingIds] = useState<Set<string>>(new Set());

  const toggleParking = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const next = new Set(selectedParkingIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedParkingIds(next);
  };

  const getValidContracts = () => {
    if (!selectedVehicle?.contracts) return [];
    return selectedVehicle.contracts.filter(vc => {
      const template = contracts.find(c => c.id === vc.contractId);
      if (!template) return false;
      
      const elapsedMonths = differenceInMonths(new Date(), new Date(vc.startDate));
      const elapsedSmr = (selectedVehicle.currentSmr || 0) - (vc.startSmr || 0);

      if (template.rule === 'months') return template.months ? elapsedMonths <= template.months : true;
      if (template.rule === 'smr') return template.smr ? elapsedSmr <= template.smr : true;
      if (template.rule === 'whichever_first') {
        const validMonths = template.months ? elapsedMonths <= template.months : true;
        const validSmr = template.smr ? elapsedSmr <= template.smr : true;
        return validMonths && validSmr;
      }
      if (template.rule === 'custom') return true;
      return false;
    });
  };

  const validContracts = getValidContracts();
  const hasValidContract = validContracts.length > 0;

  const [chatMessages, setChatMessages] = useState<{id: string, text: string, sender: string, time: string, isSelf: boolean}[]>(task?.chatMessages || [
    { id: '1', text: 'こちらのタスクの進捗はいかがでしょうか？', sender: 'フロント 高橋', time: '13:00', isSelf: false }
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
    
    const newMessages = [...chatMessages, {
      id: Date.now().toString(),
      text: chatInput,
      sender: 'あなた',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true
    }];
    setChatMessages(newMessages);
    if (taskId) {
      updateTask(taskId, { chatMessages: newMessages });
    }
    setChatInput('');
  };

  if (!task) return null;

  const handleSave = () => {
    // Save modifications to the task
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm rounded-xl">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center text-rose-600 mb-4">
              <AlertCircle className="w-6 h-6 mr-2" />
              <h3 className="font-bold text-lg">タスクの削除</h3>
            </div>
            <p className="text-slate-600 text-sm mb-6 font-medium">
              このタスクを削除しますか？
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
                  deleteTask(taskId);
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

      {showContractsModal && (
         <div className="absolute inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm rounded-xl p-4 animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
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
               {/* 契約内容 (省略) */}
             </div>
           </div>
         </div>
      )}

      <div className="bg-white md:rounded-xl shadow-2xl w-full max-w-[98vw] xl:max-w-[1700px] h-[100dvh] md:h-[98vh] flex flex-col relative overflow-hidden">
        <header className="bg-slate-50 px-4 md:px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex flex-col md:flex-row md:justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex flex-col xl:flex-row xl:items-center gap-3">
                <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center shrink-0">
                  <CheckCircle className="w-5 h-5 mr-2 text-indigo-500" />
                  タスク詳細の設定・編集
                </h2>
                <div className="flex flex-wrap items-center gap-3 xl:ml-4">
                  <button onClick={() => setShowContractsModal(true)} 
                          className={cn("flex items-center text-sm font-bold transition px-3 py-1.5 rounded border whitespace-nowrap shadow-sm cursor-pointer",
                                        hasValidContract ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200" : "text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200")}>
                    {hasValidContract ? <ShieldCheck className="w-4 h-4 mr-2 text-emerald-500" /> : <ShieldAlert className="w-4 h-4 mr-2 text-amber-500" />}
                    {hasValidContract ? \`保証適用中 (\${validContracts.length}件)\` : \`保証範囲外\`}
                  </button>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-bold rounded">{task.targetModelName}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 absolute top-4 right-4 md:static">
              <button onClick={() => setShowDeleteConfirm(true)} className="p-2 text-slate-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition shrink-0" title="タスク削除">
                <Trash2 className="w-5 h-5"/>
              </button>
              <button onClick={() => handleSave()} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-bold text-sm transition shadow-sm flex items-center shrink-0">
                <Save className="w-4 h-4 mr-1" /> 保存
              </button>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition shrink-0">
                <X className="w-5 h-5"/>
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Tabs */}
          <div className="md:w-64 w-full bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col p-4 shrink-0 overflow-y-auto">
            <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
              <button 
                onClick={() => setActiveTab('tasks_parts_tools')}
                className={cn("w-auto md:w-full shrink-0 flex items-center p-3 rounded-lg text-left text-sm font-bold transition-colors", activeTab === 'tasks_parts_tools' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700')}
              >
                <Wrench className="w-4 h-4 mr-2" />
                作業・部品・工具
              </button>
              <button 
                onClick={() => setActiveTab('assignment_date')}
                className={cn("w-auto md:w-full shrink-0 flex items-center p-3 rounded-lg text-left text-sm font-bold transition-colors", activeTab === 'assignment_date' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700')}
              >
                <User className="w-4 h-4 mr-2" />
                アサイン・作業日時
              </button>
              <button 
                onClick={() => setActiveTab('delivery_workspace')}
                className={cn("w-auto md:w-full shrink-0 flex items-center p-3 rounded-lg text-left text-sm font-bold transition-colors", activeTab === 'delivery_workspace' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700')}
              >
                <Truck className="w-4 h-4 mr-2" />
                搬入・作業場
              </button>
              <button 
                onClick={() => setActiveTab('chat')}
                className={cn("w-auto md:w-full shrink-0 flex items-center p-3 rounded-lg text-left text-sm font-bold transition-colors", activeTab === 'chat' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700')}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                メンバチャット
              </button>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white overflow-y-auto p-4 md:p-8">
            <div className="max-w-5xl mx-auto w-full space-y-8 animate-in fade-in">

              {activeTab === 'tasks_parts_tools' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-slate-800 border-b pb-2 flex items-center">
                    <Wrench className="w-5 h-5 mr-2 text-indigo-600" /> 作業・部品・工具
                  </h3>
                  
                  <div className="p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-bold text-sm text-slate-700 flex items-center"><CheckCircle className="w-5 h-5 mr-2 text-indigo-500" />作業内容</label>
                      <button 
                        onClick={(e) => { e.preventDefault(); setLocalTasks([...localTasks, { name: "", reportFormatId: "", paidServiceId: "" }]); }}
                        className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded font-bold flex items-center shadow-sm"
                      >
                        <Plus className="w-3 h-3 mr-1"/>作業を追加
                      </button>
                    </div>
                    <div className="space-y-3">
                      {localTasks.map((t: any, i: number) => (
                        <div key={i} className="flex gap-2 relative group items-start bg-white p-3 rounded-lg border border-slate-200">
                          <div className="w-6 h-6 flex items-center justify-center shrink-0 bg-slate-100 rounded text-xs font-bold text-slate-500 mt-2">{i+1}</div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <input 
                                type="text" 
                                value={t.name}
                                onChange={(e) => {
                                  const newTasks = [...localTasks];
                                  newTasks[i] = { ...newTasks[i], name: e.target.value };
                                  setLocalTasks(newTasks);
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
                                  const newTasks = [...localTasks];
                                  newTasks[i] = { ...newTasks[i], reportFormatId: e.target.value };
                                  setLocalTasks(newTasks);
                                }}
                                className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 bg-slate-50 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
                              >
                                <option value="">-- 報告様式: 無設定 --</option>
                                {reportTemplates?.map((rt: any) => (
                                  <option key={rt.id} value={rt.id}>{rt.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <button onClick={() => setLocalTasks(localTasks.filter((_: any, idx: number) => idx !== i))} className="text-slate-400 hover:text-red-500 transition mt-2 ml-2">
                            <X className="w-5 h-5"/>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm space-y-4 flex flex-col">
                      <label className="font-bold text-sm text-slate-700 flex items-center"><Wrench className="w-5 h-5 mr-2 text-indigo-500" />使用工具・器具</label>
                      {selectedTools.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {selectedTools.map((t: any) => (
                             <span key={t.id} className="bg-white border border-indigo-200 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-sm">
                               {t.name}
                               <button onClick={() => setSelectedTools(selectedTools.filter((st: any) => st.id !== t.id))} className="ml-2 hover:text-indigo-900"><X className="w-3 h-3"/></button>
                             </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-auto relative">
                        <select 
                          className="w-full py-2.5 md:py-3 border border-dashed border-slate-300 text-indigo-600 font-bold rounded-lg focus:ring-indigo-500 appearance-none bg-white cursor-pointer text-center text-sm md:text-base cursor-pointer hover:bg-slate-50 transition"
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

                    <div className="p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm space-y-4 flex flex-col">
                      <label className="font-bold text-sm text-slate-700 flex items-center"><Package className="w-5 h-5 mr-2 text-indigo-500" />使用部品リスト</label>
                      <div className="mt-auto grid grid-cols-1 gap-3">
                        <button 
                          type="button"
                          className="w-full py-2.5 border border-dashed border-slate-300 text-indigo-600 font-bold rounded-lg focus:ring-indigo-500 bg-white hover:bg-slate-50 transition text-center text-sm shadow-sm"
                        >
                          ＋ パーツブックから登録
                        </button>
                        <button 
                          type="button"
                          className="w-full py-2.5 border border-dashed border-slate-300 text-indigo-600 font-bold rounded-lg focus:ring-indigo-500 bg-white hover:bg-slate-50 transition text-center text-sm shadow-sm"
                        >
                          ＋ 在庫から登録
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'assignment_date' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-slate-800 border-b pb-2 flex items-center">
                    <User className="w-5 h-5 mr-2 text-indigo-600" /> アサイン・作業日時
                  </h3>
                  
                  {task.category === '在庫点検' && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm relative overflow-hidden mb-6">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-1.5">
                            <RefreshCw className="w-5 h-5 text-emerald-600" />
                            毎月の定期在庫点検ルール
                          </h3>
                          <p className="text-[13px] text-slate-600 font-medium leading-relaxed max-w-xl">
                            毎月決まった日にタスクを自動生成します。担当者は未定の状態で生成されるため、月ごとにカレンダーから個別のアサインが可能です。
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1 sm:mt-0">
                          <input type="checkbox" className="sr-only peer" checked={isRegular} onChange={e => setIsRegular(e.target.checked)} />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                          <span className="ml-3 text-sm font-bold text-slate-700 select-none">{isRegular ? '有効' : '無効'}</span>
                        </label>
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-50 p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">作業予定日 / 期限</label>
                        <input 
                          type="date" 
                          value={taskDate}
                          onChange={e => setTaskDate(e.target.value)}
                          className="w-full md:w-auto border-slate-300 rounded-lg px-4 py-2 focus:ring-indigo-500 font-bold text-slate-700 shadow-sm"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">担当者アサイン</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {staff.map((s:any) => (
                            <label key={s.id} className={cn(
                              "flex items-center p-3 rounded-lg border-2 cursor-pointer transition shadow-sm bg-white",
                              staffIds.includes(s.id) ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-indigo-300"
                            )}>
                              <input 
                                type="checkbox" 
                                className="sr-only"
                                checked={staffIds.includes(s.id)}
                                onChange={(e) => {
                                  if (e.target.checked) setStaffIds([...staffIds, s.id]);
                                  else setStaffIds(staffIds.filter(id => id !== s.id));
                                }}
                              />
                              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs mr-3">
                                {s.name.slice(0, 1)}
                              </div>
                              <span className="font-bold text-slate-700 text-sm truncate">{s.name}</span>
                            </label>
                          ))}
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'delivery_workspace' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-slate-800 border-b pb-2 flex items-center">
                    <Truck className="w-5 h-5 mr-2 text-indigo-600" /> 搬入・作業場
                  </h3>
                  
                  <div className="bg-slate-50 p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                    <h4 className="font-bold text-slate-700 flex items-center text-base md:text-lg">
                      <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
                      作業場 / 駐車エリア指定・予約車両
                    </h4>
                    <div className="grid grid-cols-1 gap-6 mb-6">
                      <div>
                        <label className="block text-xs md:text-sm font-bold text-slate-600 mb-2">作業場・搬入エリア</label>
                        <div className="h-[400px] w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] rounded-lg border border-slate-300 overflow-hidden relative mb-2 bg-white">
                          {parking.map(p => {
                            const isSelected = selectedParkingIds.has(p.id);
                            return (
                              <div
                                key={p.id}
                                onClick={(e) => toggleParking(p.id, e)}
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
                          onChange={e => {
                            setSelectedParkingIds(new Set(e.target.value ? [e.target.value] : []));
                          }} 
                          className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-indigo-500 font-bold text-slate-700 shadow-sm"
                        >
                          <option value="">未定 / 指定なし</option>
                          {parking.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-sm mt-6">
                    <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-700 flex items-center">
                        <Truck className="w-4 h-4 mr-2 text-indigo-500" />
                        搬入手段・車両手配
                      </h4>
                    </div>
                    <div className="p-4 md:p-6 space-y-6">
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
                             className="w-24 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 font-bold text-slate-700 text-right shadow-sm bg-white"
                           />
                           <span className="text-sm font-bold text-slate-600">台</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-6 flex flex-col gap-4">
                        <label className="flex items-start cursor-pointer group w-fit">
                          <input type="checkbox" className="mt-0.5 mr-3 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-5 h-5 cursor-pointer shadow-sm transition-all" 
                            checked={localTasks.some(t => t.name === '車両搬入作業')}
                            onChange={(e) => {
                              if (e.target.checked) setLocalTasks([{ name: '車両搬入作業', reportFormatId: "", paidServiceId: "" }, ...localTasks]);
                              else {
                                setLocalTasks(localTasks.filter(t => t.name !== '車両搬入作業'));
                                setSelectedInternalVehicles([]);
                              }
                            }}
                          />
                          <div>
                            <div className="font-bold text-slate-700 text-sm mb-1 group-hover:text-indigo-600 transition-colors">自社手配による車両の搬入(引取等)を行う</div>
                            <div className="text-xs text-slate-500">チェックするとタスクに「車両搬入作業」が追加されます</div>
                          </div>
                        </label>
                        
                        <div className={cn("transition-all duration-300 overflow-hidden", localTasks.some(t => t.name === '車両搬入作業') ? "max-h-96 opacity-100 mt-2" : "max-h-0 opacity-0 mt-0")}>
                          <div className="pl-8">
                             <label className="block text-xs font-bold text-slate-500 mb-2">使用する自社車両 (任意)</label>
                             {selectedInternalVehicles.length > 0 && (
                               <div className="flex flex-wrap gap-2 mb-3">
                                 {selectedInternalVehicles.map(v => (
                                    <span key={v.id} className="bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-md text-xs font-bold flex items-center shadow-sm">
                                      <Truck className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> {v.modelName}
                                      <button onClick={(e) => { e.preventDefault(); setSelectedInternalVehicles(selectedInternalVehicles.filter(sv => sv.id !== v.id))}} className="ml-2 hover:text-slate-900 border-l border-slate-200 pl-2"><X className="w-3.5 h-3.5"/></button>
                                    </span>
                                 ))}
                               </div>
                             )}
                             <select 
                               className="w-full md:w-80 py-2 px-3 border border-dashed border-slate-300 text-slate-600 font-bold rounded-lg focus:ring-indigo-500 appearance-none bg-white cursor-pointer text-sm shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
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
              )}

              {activeTab === 'chat' && (
                <div className="space-y-6 flex flex-col h-[70vh]">
                  <h3 className="text-lg font-black text-slate-800 border-b pb-2 flex items-center shrink-0">
                    <MessageSquare className="w-5 h-5 mr-2 text-indigo-600" /> メンバチャット
                  </h3>
                  
                  <div className="flex-1 flex flex-col bg-slate-50 border border-slate-200 rounded-xl shadow-sm overflow-hidden h-full">
                    <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
                      <span className="text-xs text-slate-500 font-bold bg-white px-2 py-1 border border-slate-200 rounded">
                        代理店内メンバチャット
                      </span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatScrollRef}>
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
                         className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition shrink-0"
                       >
                         <Send className="w-4 h-4 ml-0.5" />
                       </button>
                    </form>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/EditTaskModal.tsx', code);
