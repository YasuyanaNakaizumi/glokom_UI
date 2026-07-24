import React, { useState, useEffect, useRef } from 'react';
import { X, CheckCircle, Save, MessageSquare, Send, ShieldCheck, ShieldAlert, Trash2, AlertCircle, RefreshCw, Calendar, MapPin, Truck, User, Wrench, Package, Plus, Sparkles, Car } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { differenceInMonths, format, addDays, startOfWeek } from 'date-fns';
import { AddRepairTaskModal } from './AddRepairTaskModal';
import { AddWorkContentModal } from './AddWorkContentModal';
import { tLegacyMaster } from '../lib/i18n';

export function EditTaskModal({ taskId, isReadOnly, onClose }: { taskId: string, isReadOnly?: boolean, onClose: () => void }) {
  const { tasks, updateTask, addTask, deleteTask, staff, tools, vehicles, contracts, parking, vehicleMasters, reportTemplates, alerts, t, tEnum, lang } = useApp();
  const task = tasks.find(t => t.id === taskId);
  const selectedVehicle = vehicles.find(v => v.id === task?.vehicleId);
  const [showContractsModal, setShowContractsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddSubTaskModal, setShowAddSubTaskModal] = useState(false);
  const [showAddWorkModal, setShowAddWorkModal] = useState(false);
  const subTasks = tasks.filter(t => t.parentId === taskId);
  
  const [isRegular, setIsRegular] = useState(false);
  const [taskDate, setTaskDate] = useState(task?.deadline ? format(new Date(task.deadline), 'yyyy-MM-dd') : '');
  const [staffIds, setStaffIds] = useState<string[]>(task?.staffIds || (task?.staffId ? [task.staffId] : []));
  const [syncAllTimes, setSyncAllTimes] = useState(false);
  const [scheduleViewMode, setScheduleViewMode] = useState<'day' | 'week'>('day');
  const [scheduleDate, setScheduleDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [assignmentBlocks, setAssignmentBlocks] = useState<Array<{id: string, staffId: string, startDate: string, startTime: string, endDate: string, endTime: string}>>(() => {
    if (task?.assignments && task.assignments.length > 0) {
      return task.assignments.map(a => {
        const startDate = a.plannedStart ? a.plannedStart.split('T')[0] : '';
        const startTime = a.plannedStart && a.plannedStart.includes('T') ? a.plannedStart.split('T')[1].slice(0, 5) : '';
        const endDate = a.plannedEnd ? a.plannedEnd.split('T')[0] : '';
        const endTime = a.plannedEnd && a.plannedEnd.includes('T') ? a.plannedEnd.split('T')[1].slice(0, 5) : '';
        return { id: Math.random().toString(), staffId: a.staffId, startDate, startTime, endDate, endTime };
      });
    }
    if (task?.staffIds && task.staffIds.length > 0) {
      return task.staffIds.map((id, i) => ({
        id: i.toString(),
        staffId: id,
        startDate: task?.deadline ? task.deadline.split('T')[0] : format(new Date(), 'yyyy-MM-dd'),
        startTime: '09:00',
        endDate: task?.deadline ? task.deadline.split('T')[0] : format(new Date(), 'yyyy-MM-dd'),
        endTime: '18:00'
      }));
    }
    return [{ id: '1', staffId: '', startDate: format(new Date(), 'yyyy-MM-dd'), startTime: '09:00', endDate: format(new Date(), 'yyyy-MM-dd'), endTime: '18:00' }];
  });

  const [scheduleViewDate, setScheduleViewDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [scheduleCheckStaffIds, setScheduleCheckStaffIds] = useState<string[]>([]);


  const addAssignmentBlock = () => {
    setAssignmentBlocks([...assignmentBlocks, { id: Math.random().toString(), staffId: '', startDate: format(new Date(), 'yyyy-MM-dd'), startTime: '09:00', endDate: format(new Date(), 'yyyy-MM-dd'), endTime: '18:00' }]);
  };
  
  const removeAssignmentBlock = (id: string) => {
    setAssignmentBlocks(assignmentBlocks.filter(b => b.id !== id));
  };

  const updateAssignmentBlock = (id: string, field: string, value: any) => {
    let newBlocks = assignmentBlocks.map(b => b.id === id ? { ...b, [field]: value } : b);
    if (syncAllTimes && assignmentBlocks.length > 0 && id === assignmentBlocks[0].id) {
       if (['startDate', 'startTime', 'endDate', 'endTime'].includes(field)) {
          newBlocks = newBlocks.map((b, idx) => {
             if (idx === 0) return b;
             return { ...b, startDate: newBlocks[0].startDate, startTime: newBlocks[0].startTime, endDate: newBlocks[0].endDate, endTime: newBlocks[0].endTime };
          });
       }
    }
    setAssignmentBlocks(newBlocks);
  };


  const [activeTab, setActiveTab] = useState<'tasks_parts_tools' | 'assignment_date' | 'delivery_workspace' | 'sub_tasks' | 'chat'>('tasks_parts_tools');
  const [workspaceType, setWorkspaceType] = useState<'agency' | 'customer'>('agency');
  const [externalContractors, setExternalContractors] = useState<Array<{id: string, company: string, driver: string, count: number}>>([]);
  const [siteNotes, setSiteNotes] = useState('');
  

  const [localTasks, setLocalTasks] = useState<Array<{ name: string, reportFormatId: string, paidServiceId: string, category?: string }>>([
    { name: task?.title || "", reportFormatId: "", paidServiceId: "", category: task?.category }
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
    { id: '1', text: t('views.tasks.chatDefaultMessage'), sender: t('views.tasks.chatDefaultSender'), time: '13:00', isSelf: false }
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
      sender: t('views.tasks.chatSelfSender'),
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
    if (taskId) {
      const flatAssignments: any[] = [];
      const allStaffIds = new Set<string>();
      assignmentBlocks.forEach(b => {
        if (!b.staffId) return;
        allStaffIds.add(b.staffId);
        flatAssignments.push({
          staffId: b.staffId,
          plannedStart: b.startDate ? `${b.startDate}T${b.startTime}:00Z` : undefined,
          plannedEnd: b.endDate ? `${b.endDate}T${b.endTime}:00Z` : undefined,
        });
      });
      
      updateTask(taskId, {
        assignments: flatAssignments,
        staffIds: Array.from(allStaffIds),
        deadline: assignmentBlocks.length > 0 && assignmentBlocks[0].endDate ? `${assignmentBlocks[0].endDate}T${assignmentBlocks[0].endTime}:00Z` : task?.deadline
      });
    }
    onClose();
  };

  return (
    <>
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4 bg-slate-900/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm rounded-xl">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center text-rose-600 mb-4">
              <AlertCircle className="w-6 h-6 mr-2" />
              <h3 className="font-bold text-lg">{t('views.tasks.deleteTitle')}</h3>
            </div>
            <p className="text-slate-600 text-sm mb-6 font-medium">
              {t('views.tasks.deleteConfirm')}
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
                  deleteTask(taskId);
                  onClose();
                }}
                className="px-4 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition shadow-sm"
              >
                {t('views.tasks.deleteAction')}
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
                 {t('views.tasks.contractsTitle')}
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

      <div className="bg-white md:rounded-xl shadow-2xl w-full h-full md:w-[98vw] xl:max-w-[1700px] md:h-[98vh] flex flex-col relative overflow-hidden">
        <header className="bg-slate-50 px-4 md:px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex flex-col md:flex-row md:justify-between items-start gap-4">
            <div className="flex-1">
              <div className="flex flex-col xl:flex-row xl:items-center gap-3">
                <h2 className="text-lg md:text-xl font-bold text-slate-800 flex items-center shrink-0">
                  <CheckCircle className="w-5 h-5 mr-2 text-indigo-500" />
                  {t('views.tasks.editTitle')}
                </h2>
                <div className="flex flex-wrap items-center gap-3 xl:ml-4">
                  <button onClick={() => setShowContractsModal(true)} 
                          className={cn("flex items-center text-sm font-bold transition px-3 py-1.5 rounded border whitespace-nowrap shadow-sm cursor-pointer",
                                        hasValidContract ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200" : "text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200")}>
                    {hasValidContract ? <ShieldCheck className="w-4 h-4 mr-2 text-emerald-500" /> : <ShieldAlert className="w-4 h-4 mr-2 text-amber-500" />}
                    {hasValidContract ? t('views.tasks.warrantyActive', { count: validContracts.length }) : t('views.tasks.warrantyInactive')}
                  </button>
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-bold rounded">{task.targetModelName}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 absolute top-4 right-4 md:static">
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition shrink-0">
                <X className="w-5 h-5"/>
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          {/* Left Tabs */}
          <div className="md:w-64 w-full bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col p-2 md:p-4 shrink-0 overflow-hidden md:overflow-y-auto min-h-0 md:min-h-full">
            <nav className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              <button 
                onClick={() => setActiveTab('tasks_parts_tools')}
                className={cn("w-auto md:w-full shrink-0 flex items-center p-3 rounded-lg text-left text-sm font-bold transition-colors", activeTab === 'tasks_parts_tools' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700')}
              >
                <Wrench className="w-4 h-4 mr-2" />
                {t('views.tasks.tabWorkPartsTools')}
              </button>
              <button 
                onClick={() => setActiveTab('assignment_date')}
                className={cn("w-auto md:w-full shrink-0 flex items-center p-3 rounded-lg text-left text-sm font-bold transition-colors", activeTab === 'assignment_date' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700')}
              >
                <User className="w-4 h-4 mr-2" />
                {t('views.tasks.tabAssignmentDate')}
              </button>
              <button 
                onClick={() => setActiveTab('delivery_workspace')}
                className={cn("w-auto md:w-full shrink-0 flex items-center p-3 rounded-lg text-left text-sm font-bold transition-colors", activeTab === 'delivery_workspace' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700')}
              >
                <Truck className="w-4 h-4 mr-2" />
                {t('views.tasks.tabDeliveryWorkspace')}
              </button>
              {!task?.parentId && (
                <button 
                  onClick={() => setActiveTab('sub_tasks')}
                  className={cn("w-auto md:w-full shrink-0 flex items-center p-3 rounded-lg text-left text-sm font-bold transition-colors", activeTab === 'sub_tasks' ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700')}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {t('views.tasks.tabSubTasks')}
                  {subTasks.length > 0 && <span className="ml-auto bg-slate-200 text-slate-700 text-xs py-0.5 px-2 rounded-full">{subTasks.length}</span>}
                </button>
              )}
              <button 
                onClick={() => setActiveTab('chat')}
                className={cn("w-auto md:w-full shrink-0 flex md:hidden items-center p-3 rounded-lg text-left text-sm font-bold transition-colors", activeTab === 'chat' as any ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-slate-100 text-slate-700')}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {t('views.tasks.tabChat')}
              </button>
              
            </nav>
          </div>

          {/* Main Content Area */}
          <div className={cn("flex-1 bg-white relative flex-col min-w-0 min-h-0", activeTab === 'chat' ? 'hidden md:flex' : 'flex')}>
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-5xl mx-auto w-full space-y-8 animate-in fade-in">

              {activeTab === 'tasks_parts_tools' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-slate-800 border-b pb-2 flex items-center">
                    <Wrench className="w-5 h-5 mr-2 text-indigo-600" /> {t('views.tasks.workContentSectionTitle')}
                  </h3>
                  
                  <div className="p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="font-bold text-sm text-slate-700 flex items-center"><CheckCircle className="w-5 h-5 mr-2 text-indigo-500" />{t('views.tasks.workContentLabel')}</label>
                      <button 
                        onClick={(e) => { e.preventDefault(); setShowAddWorkModal(true); }}
                        className="text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded font-bold flex items-center shadow-sm"
                      >
                        <Plus className="w-3 h-3 mr-1"/>{t('views.tasks.addWorkContent')}
                      </button>
                    </div>
                    <div className="space-y-3">
                      {localTasks.map((workTask: any, i: number) => (
                        <div key={i} className="flex gap-2 relative group items-start bg-white p-3 rounded-lg border border-slate-200">
                          <div className="w-6 h-6 flex items-center justify-center shrink-0 bg-slate-100 rounded text-xs font-bold text-slate-500 mt-2">{i+1}</div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              {workTask.category && (
                                <span className="text-xs px-2 py-1 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold whitespace-nowrap">
                                  {workTask.category}
                                </span>
                              )}
                              <input 
                                type="text" 
                                value={workTask.name}
                                onChange={(e) => {
                                  const newTasks = [...localTasks];
                                  newTasks[i] = { ...newTasks[i], name: e.target.value };
                                  setLocalTasks(newTasks);
                                }}
                                className="flex-1 border-slate-300 rounded-lg px-3 py-2 text-sm font-bold shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50" 
                                placeholder={t('views.tasks.workContentPlaceholder')}
                              />
                              <button
                                type="button"
                                className="flex items-center justify-center px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-bold transition-colors shadow-sm shrink-0 whitespace-nowrap group-hover:opacity-100 md:opacity-0 opacity-100"
                              >
                                <Sparkles className="w-3.5 h-3.5 mr-1" />
                                {t('views.tasks.aiAppendDetails')}
                              </button>
                            </div>
                            <div className="flex gap-2 flex-col md:flex-row">
                              <select 
                                value={workTask.reportFormatId}
                                onChange={(e) => {
                                  const newTasks = [...localTasks];
                                  newTasks[i] = { ...newTasks[i], reportFormatId: e.target.value };
                                  setLocalTasks(newTasks);
                                }}
                                className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 bg-slate-50 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
                              >
                                <option value="">{t('views.tasks.reportFormatPlaceholder')}</option>
                                {reportTemplates?.map((rt: any) => (
                                  <option key={rt.id} value={rt.id}>{rt.name}</option>
                                ))}
                              </select>
                              <select 
                                value={workTask.paidServiceId}
                                onChange={(e) => {
                                  const newTasks = [...localTasks];
                                  newTasks[i] = { ...newTasks[i], paidServiceId: e.target.value };
                                  setLocalTasks(newTasks);
                                }}
                                className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 bg-slate-50 focus:ring-indigo-500 focus:border-indigo-500 appearance-none cursor-pointer"
                              >
                                <option value="">{t('views.tasks.paidServicePlaceholder')}</option>
                                <optgroup label={t('views.tasks.paidServiceLabel')}>
                                  <option value="有償定期メンテナンス">有償定期メンテナンス</option>
                                  <option value="有償修理">有償修理</option>
                                </optgroup>
                                <optgroup label={t('views.tasks.warrantyLabel')}>
                                  {contracts?.map((c: any) => (
                                    <option key={c.id} value={c.id}>{tLegacyMaster(lang, 'contract', c.id, 'name', c.title)}</option>
                                  ))}
                                  <option value="補償">{t('views.tasks.otherWarranty')}</option>
                                </optgroup>
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
                      <label className="font-bold text-sm text-slate-700 flex items-center"><Wrench className="w-5 h-5 mr-2 text-indigo-500" />{t('views.tasks.toolsLabel')}</label>
                      {selectedTools.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {selectedTools.map((tool: any) => (
                             <span key={tool.id} className="bg-white border border-indigo-200 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-sm">
                               {tLegacyMaster(lang, 'tool', tool.id, 'name', tool.name)}
                               <button onClick={() => setSelectedTools(selectedTools.filter((st: any) => st.id !== tool.id))} className="ml-2 hover:text-indigo-900"><X className="w-3 h-3"/></button>
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
                          <option value="">{t('views.tasks.addToolFromMaster')}</option>
                          {tools.map((tool:any) => <option key={tool.id} value={tool.id}>{tLegacyMaster(lang, 'tool', tool.id, 'name', tool.name)}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="p-4 md:p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm space-y-4 flex flex-col">
                      <label className="font-bold text-sm text-slate-700 flex items-center"><Package className="w-5 h-5 mr-2 text-indigo-500" />{t('views.tasks.partsLabel2')}</label>
                      <div className="mt-auto grid grid-cols-1 gap-3">
                        <button 
                          type="button"
                          className="w-full py-2.5 border border-dashed border-slate-300 text-indigo-600 font-bold rounded-lg focus:ring-indigo-500 bg-white hover:bg-slate-50 transition text-center text-sm shadow-sm"
                        >
                          {t('views.tasks.addFromPartsBook')}
                        </button>
                        <button 
                          type="button"
                          className="w-full py-2.5 border border-dashed border-slate-300 text-indigo-600 font-bold rounded-lg focus:ring-indigo-500 bg-white hover:bg-slate-50 transition text-center text-sm shadow-sm"
                        >
                          {t('views.tasks.addFromInventory')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'assignment_date' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-slate-800 border-b pb-2 flex items-center">
                    <User className="w-5 h-5 mr-2 text-indigo-600" /> {t('views.tasks.assignmentSectionTitle')}
                  </h3>
                  
                  {task.category === '在庫点検' && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-sm relative overflow-hidden mb-6">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-1.5">
                            <RefreshCw className="w-5 h-5 text-emerald-600" />
                            {t('views.tasks.monthlyInspectionRuleTitle')}
                          </h3>
                          <p className="text-[13px] text-slate-600 font-medium leading-relaxed max-w-xl">
                            {t('views.tasks.monthlyInspectionRuleDescription')}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1 sm:mt-0">
                          <input type="checkbox" className="sr-only peer" checked={isRegular} onChange={e => setIsRegular(e.target.checked)} />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                          <span className="ml-3 text-sm font-bold text-slate-700 select-none">{isRegular ? t('views.tasks.regularEnabled') : t('views.tasks.regularDisabled')}</span>
                        </label>
                      </div>
                    </div>
                  )}

                  
  <div className="space-y-4">
    <div className="flex justify-end mb-2">
      <label className="flex items-center cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 transition">
        <input 
          type="checkbox" 
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 mr-2"
          checked={syncAllTimes}
          onChange={(e) => {
            const checked = e.target.checked;
            setSyncAllTimes(checked);
            if (checked && assignmentBlocks.length > 0) {
              const first = assignmentBlocks[0];
              setAssignmentBlocks(assignmentBlocks.map((b, idx) => {
                 if (idx === 0) return b;
                 return { ...b, startDate: first.startDate, startTime: first.startTime, endDate: first.endDate, endTime: first.endTime };
              }));
            }
          }}
        />
        <span className="text-sm font-bold text-slate-700 select-none">{t('views.tasks.syncAllTimes')}</span>
      </label>
    </div>
    {assignmentBlocks.map((b, i) => (
      <div key={b.id} className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 relative group hover:border-indigo-200 transition-colors">
        {assignmentBlocks.length > 1 && (
          <button onClick={() => removeAssignmentBlock(b.id)} className="absolute right-2 top-2 text-slate-400 hover:text-red-500 transition bg-slate-50 hover:bg-red-50 p-1.5 rounded-lg opacity-0 group-hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        )}
        
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-500 mb-1">{t('views.tasks.staffAssignmentLabel')}</label>
            <select 
              className="w-full bg-white border border-slate-300 text-slate-700 text-sm rounded-lg px-3 py-2 font-bold focus:ring-indigo-500 transition shadow-sm outline-none"
              value={b.staffId}
              onChange={(e) => updateAssignmentBlock(b.id, 'staffId', e.target.value)}
            >
              <option value="">{t('views.tasks.selectAssignee')}</option>
              {staff.map((s:any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4 shrink-0">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">{t('views.tasks.startLabel')}</label>
              <div className="flex items-center gap-1.5">
                <input 
                  type="date" 
                  value={b.startDate} 
                  onChange={e => updateAssignmentBlock(b.id, 'startDate', e.target.value)} 
                  className="w-[125px] border-slate-300 rounded text-sm px-2 py-1.5 focus:ring-indigo-500 font-bold text-slate-700 shadow-sm"
                  disabled={syncAllTimes && i > 0}
                />
                <input 
                  type="time" 
                  value={b.startTime} 
                  onChange={e => updateAssignmentBlock(b.id, 'startTime', e.target.value)} 
                  className="w-[85px] border-slate-300 rounded text-sm px-2 py-1.5 focus:ring-indigo-500 font-bold text-slate-700 shadow-sm"
                  disabled={syncAllTimes && i > 0}
                />
              </div>
            </div>
            <div className="text-slate-300 font-bold mt-5">-</div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">{t('views.tasks.endLabel')}</label>
              <div className="flex items-center gap-1.5">
                <input 
                  type="date" 
                  value={b.endDate} 
                  onChange={e => updateAssignmentBlock(b.id, 'endDate', e.target.value)} 
                  className="w-[125px] border-slate-300 rounded text-sm px-2 py-1.5 focus:ring-indigo-500 font-bold text-slate-700 shadow-sm"
                  disabled={syncAllTimes && i > 0}
                />
                <input 
                  type="time" 
                  value={b.endTime} 
                  onChange={e => updateAssignmentBlock(b.id, 'endTime', e.target.value)} 
                  className="w-[85px] border-slate-300 rounded text-sm px-2 py-1.5 focus:ring-indigo-500 font-bold text-slate-700 shadow-sm"
                  disabled={syncAllTimes && i > 0}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}

    <button onClick={addAssignmentBlock} className="w-full py-3 border-2 border-dashed border-indigo-200 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition flex items-center justify-center shadow-sm bg-white">
      <Plus className="w-5 h-5 mr-1" /> {t('views.tasks.addAnotherAssignment')}
    </button>
  </div>

  <div className="bg-slate-50 border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-6">
    <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
      <h4 className="font-bold text-slate-700 flex items-center text-sm">
        <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
        {t('views.tasks.schedulePreviewTitle')} <span className="text-xs font-normal text-slate-500 ml-2">{t('views.tasks.schedulePreviewNote')}</span>
      </h4>
      <div className="flex items-center gap-3">
        <input type="date" value={scheduleViewDate} onChange={e => setScheduleViewDate(e.target.value)} className="text-xs border-slate-300 rounded-lg px-2 py-1.5 shadow-sm font-bold text-slate-700 focus:ring-indigo-500" />
      </div>
    </div>
    
    <div className="flex-1 overflow-x-auto bg-white flex flex-col relative min-h-[300px] max-h-[500px]">
      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4">
        <div className="inline-block min-w-[700px] w-full rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Header Row */}
          <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-40 shadow-sm">
            <div className="w-16 shrink-0 border-r border-slate-200 bg-slate-100 px-1 flex items-center justify-center text-[10px] font-bold text-slate-500">{t('views.tasks.timeLabel')}</div>
            {Array.from({length: 7}, (_, i) => {
              const start = startOfWeek(new Date(scheduleViewDate), { weekStartsOn: 1 });
              return addDays(start, i);
            }).map((d, i) => (
              <div key={i} className="flex-1 min-w-[100px] py-2 text-center border-r border-slate-200">
                <p className="font-bold text-slate-800 text-xs truncate">{d.getMonth() + 1}/{d.getDate()} <span className="text-[10px] font-normal text-slate-500">({['日', '月', '火', '水', '木', '金', '土'][d.getDay()]})</span></p>
              </div>
            ))}
          </div>
          
          {/* Body */}
          <div className="flex relative">
            {/* Time labels column */}
            <div className="w-16 shrink-0 border-r border-slate-200 bg-slate-50 flex flex-col z-10 sticky left-0">
              {Array.from({length: 13}, (_, i) => i + 8).map((hour) => (
                <div key={hour} className="h-[60px] border-b border-slate-200 flex flex-col items-center justify-start py-1.5 px-1">
                  <p className="font-bold text-slate-500 text-[10px] text-center w-full">{hour}:00</p>
                </div>
              ))}
            </div>
            
            {/* Grid columns */}
            <div className="flex-1 flex relative">
              {/* Background horizontal lines */}
              <div className="absolute inset-0 flex flex-col pointer-events-none">
                {Array.from({length: 13}, (_, i) => i + 8).map((hour) => (
                  <div key={hour} className="h-[60px] border-b border-slate-100 w-full" />
                ))}
              </div>
              
              {/* Day columns with tasks */}
              {Array.from({length: 7}).map((_, i) => {
                const start = startOfWeek(new Date(scheduleViewDate), { weekStartsOn: 1 });
                const d = addDays(start, i);
                const dateStr = format(d, 'yyyy-MM-dd');
                
                // Filter tasks assigned to staff in assignmentBlocks + staffIds
                const targetStaffIds = new Set([...assignmentBlocks.map(b => b.staffId), ...staffIds]);
                
                const dateTasks = tasks.filter(dayTask => {
                  if (dayTask.id === taskId) return false;
                  const taskDateStr = dayTask.startDate ? dayTask.startDate.split('T')[0] : dayTask.deadline ? dayTask.deadline.split('T')[0] : '';
                  if (taskDateStr !== dateStr) return false;
                  
                  return dayTask.staffIds?.some(id => targetStaffIds.has(id)) || 
                         dayTask.assignments?.some(a => targetStaffIds.has(a.staffId) && a.plannedStart?.startsWith(dateStr));
                });
                
                // Plus editingBlocks for this date
                const dateEditingBlocks = assignmentBlocks.filter(b => b.startDate === dateStr);

                return (
                  <div key={i} className="flex-1 min-w-[100px] border-r border-slate-100/50 relative hover:bg-indigo-50/20 transition-colors">
                    {dateTasks.map((dayTask, idx) => {
                      let startHour = 9; let startMin = 0; let endHour = 18; let endMin = 0;
                      const assign = dayTask.assignments?.find(a => targetStaffIds.has(a.staffId) && a.plannedStart?.startsWith(dateStr));
                      if (assign && assign.plannedStart && assign.plannedEnd) {
                        const stMatch = assign.plannedStart.match(/T(\d{2}):(\d{2})/);
                        if (stMatch) { startHour = parseInt(stMatch[1], 10); startMin = parseInt(stMatch[2], 10); }
                        const edMatch = assign.plannedEnd.match(/T(\d{2}):(\d{2})/);
                        if (edMatch) { endHour = parseInt(edMatch[1], 10); endMin = parseInt(edMatch[2], 10); }
                      } else if (dayTask.deadline) {
                        const dt = new Date(dayTask.deadline);
                        endHour = dt.getHours();
                        endMin = dt.getMinutes();
                        startHour = endHour - 2;
                        if (startHour < 8) startHour = 8;
                      }
                      
                      const viewStartHour = 8;
                      const viewEndHour = 21;
                      
                      let sTotal = startHour + startMin / 60;
                      let eTotal = endHour + endMin / 60;
                      if (sTotal < viewStartHour) sTotal = viewStartHour;
                      if (eTotal > viewEndHour) eTotal = viewEndHour;
                      if (eTotal <= sTotal) eTotal = sTotal + 1;
                      
                      const topPx = (sTotal - viewStartHour) * 60;
                      const heightPx = (eTotal - sTotal) * 60;
                      
                      let bgColor = 'bg-blue-100 border-blue-300 text-blue-800';
                      if (dayTask.category === 'その他予定' || dayTask.isNonWorkingDay) {
                        bgColor = 'bg-amber-100 border-amber-300 text-amber-800';
                      } else if (dayTask.progress === '完了') {
                        bgColor = 'bg-slate-200 border-slate-300 text-slate-600';
                      }
                      
                      const offset = (idx % 3) * 6;
                      const relevantStaffIds = (dayTask.staffIds || []).filter(sid => targetStaffIds.has(sid));
                      const assignStaff = dayTask.assignments?.filter(a => targetStaffIds.has(a.staffId) && a.plannedStart?.startsWith(dateStr)).map(a => a.staffId) || [];
                      const allRelevant = Array.from(new Set([...relevantStaffIds, ...assignStaff]));
                      
                      return (
                        <div 
                          key={`task-${idx}`}
                          className={`absolute rounded border ${bgColor} shadow-sm px-1.5 py-1 overflow-hidden z-20 flex flex-col justify-start opacity-90 hover:opacity-100 hover:z-30 transition-all cursor-default`}
                          style={{ top: `${topPx}px`, height: `${heightPx}px`, left: `${2 + offset}px`, right: `${2}px` }}
                          title={`${dayTask.title}\n${allRelevant.map(sid => staff.find(s => s.id === sid)?.name).join(', ')}`}
                        >
                          <div className="text-[10px] font-bold truncate leading-tight">{dayTask.title}</div>
                          <div className="text-[9px] opacity-80 truncate">{allRelevant.map(sid => staff.find(s => s.id === sid)?.name).join(', ')}</div>
                        </div>
                      );
                    })}
                    
                    {dateEditingBlocks.map((b, idx) => {
                      const startHour = parseInt(b.startTime.split(':')[0], 10) || 9;
                      const startMin = parseInt(b.startTime.split(':')[1], 10) || 0;
                      const endHour = parseInt(b.endTime.split(':')[0], 10) || 18;
                      const endMin = parseInt(b.endTime.split(':')[1], 10) || 0;
                      
                      const viewStartHour = 8;
                      const viewEndHour = 21;
                      
                      let sTotal = startHour + startMin / 60;
                      let eTotal = endHour + endMin / 60;
                      if (sTotal < viewStartHour) sTotal = viewStartHour;
                      if (eTotal > viewEndHour) eTotal = viewEndHour;
                      if (eTotal <= sTotal) eTotal = sTotal + 1;
                      
                      const topPx = (sTotal - viewStartHour) * 60;
                      const heightPx = (eTotal - sTotal) * 60;
                      
                      const offset = ((dateTasks.length + idx) % 3) * 6;
                      
                      return (
                        <div 
                          key={`edit-${idx}`}
                          className="absolute rounded border-2 border-indigo-500 bg-indigo-500/90 text-white shadow-md px-1.5 py-1 overflow-hidden z-30 flex flex-col justify-start"
                          style={{ top: `${topPx}px`, height: `${heightPx}px`, left: `${2 + offset}px`, right: `${2}px` }}
                        >
                          <div className="text-[10px] font-black truncate leading-tight">{t('views.tasks.editingBadge')}</div>
                          <div className="text-[9px] opacity-90 truncate">{staff.find(s => s.id === b.staffId)?.name}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
                </div>
              )}

              {activeTab === 'delivery_workspace' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-slate-800 border-b pb-2 flex items-center">
                    <Truck className="w-5 h-5 mr-2 text-indigo-600" /> {t('views.tasks.deliveryWorkspaceTitle')}
                  </h3>
                  
                  <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-sm">
                    <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                      <h4 className="font-bold text-sm text-slate-700 flex items-center">
                        <Truck className="w-4 h-4 mr-2 text-indigo-500" />
                        {t('views.tasks.deliveryMethodTitle')}
                      </h4>
                    </div>
                    <div className="p-4 md:p-6 space-y-6">
                        <div className="space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="font-bold text-slate-700 text-sm whitespace-nowrap min-w-[140px]">{t('views.tasks.internalVehicleLabel')}</div>
                          <div className="flex-1 flex flex-wrap items-center gap-2">
                             {selectedInternalVehicles.map(v => (
                                <span key={v.id} className="bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-md text-xs font-bold flex items-center shadow-sm">
                                  <Truck className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> {v.modelName}
                                  <button onClick={(e) => { e.preventDefault(); setSelectedInternalVehicles(selectedInternalVehicles.filter(sv => sv.id !== v.id))}} className="ml-2 hover:text-slate-900 border-l border-slate-200 pl-2"><X className="w-3.5 h-3.5"/></button>
                                </span>
                             ))}
                             <select
                               className="bg-white border border-slate-300 text-slate-600 text-sm rounded-md px-3 py-1.5 font-bold shadow-sm outline-none focus:ring-indigo-500"
                               value=""
                               onChange={(e) => {
                                 const v = vehicleMasters.find(x => x.id === e.target.value);
                                 if (v && !selectedInternalVehicles.some(sv => sv.id === v.id)) {
                                   setSelectedInternalVehicles([...selectedInternalVehicles, v]);
                                 }
                               }}
                             >
                               <option value="">{t('views.tasks.addInternalVehicle')}</option>
                               {vehicleMasters.filter(v => !selectedInternalVehicles.some(sv => sv.id === v.id)).map(v => (
                                 <option key={v.id} value={v.id}>{v.modelName}</option>
                               ))}
                             </select>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-6">
                        <div className="flex justify-between items-center mb-4">
                           <div className="font-bold text-slate-700 text-sm">{t('views.tasks.externalArrangementsTitle')}</div>
                           <button onClick={(e) => { e.preventDefault(); setExternalContractors([...externalContractors, {id: Math.random().toString(), company: '', driver: '', count: 1}])}} className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center bg-indigo-50 px-2 py-1 rounded">
                             <Plus className="w-3 h-3 mr-1"/> {t('views.tasks.addContractor')}
                           </button>
                        </div>
                        
                        {externalContractors.length === 0 ? (
                           <div className="text-xs text-slate-500">{t('views.tasks.noExternalArrangements')}</div>
                        ) : (
                           <div className="space-y-3">
                             {externalContractors.map(contractor => (
                                <div key={contractor.id} className="flex flex-col md:flex-row gap-3 items-center bg-white border border-slate-200 p-3 rounded-lg shadow-sm">
                                   <div className="flex-1 w-full">
                                      <label className="text-[10px] font-bold text-slate-500 mb-1 block">{t('views.tasks.contractorNameLabel')}</label>
                                      <select value={contractor.company} onChange={(e) => setExternalContractors(externalContractors.map(c => c.id === contractor.id ? {...c, company: e.target.value} : c))} className="w-full text-sm border-slate-300 rounded focus:ring-indigo-500 font-medium bg-white">
                                        <option value="">{t('views.tasks.selectContractor')}</option>
                                        <option value="株式会社 陸送サービス">株式会社 陸送サービス</option>
                                        <option value="関東車両運搬">関東車両運搬</option>
                                        <option value="スピード配送便">スピード配送便</option>
                                      </select>
                                   </div>
                                   <div className="w-24 shrink-0">
                                      <label className="text-[10px] font-bold text-slate-500 mb-1 block">{t('views.tasks.vehicleCountLabel')}</label>
                                      <input type="number" min="1" value={contractor.count} onChange={(e) => setExternalContractors(externalContractors.map(c => c.id === contractor.id ? {...c, count: parseInt(e.target.value)||1} : c))} className="w-full text-sm border-slate-300 rounded focus:ring-indigo-500 font-bold" />
                                   </div>
                                   <button onClick={() => setExternalContractors(externalContractors.filter(c => c.id !== contractor.id))} className="text-slate-400 hover:text-red-500 mt-4 md:mt-0 p-1">
                                      <X className="w-4 h-4" />
                                   </button>
                                </div>
                             ))}
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center border-b border-slate-200 pb-4">
                      <h4 className="font-bold text-slate-700 flex items-center text-base md:text-lg">
                        <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
                        {t('views.tasks.worksiteTitle')}
                      </h4>
                      <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-hidden">
                         <button 
                           onClick={(e) => { e.preventDefault(); setWorkspaceType('agency'); }} 
                           className={`flex-1 px-4 py-2 text-sm font-bold transition-all rounded-md ${workspaceType === 'agency' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                         >
                           {t('views.tasks.agencyWorksiteOption')}
                         </button>
                         <button 
                           onClick={(e) => { e.preventDefault(); setWorkspaceType('customer'); }} 
                           className={`flex-1 px-4 py-2 text-sm font-bold transition-all rounded-md ${workspaceType === 'customer' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                         >
                           {t('views.tasks.customerWorksiteOption')}
                         </button>
                      </div>
                    </div>
                    
                    {workspaceType === 'agency' && (
                      <div>
                        <h4 className="font-bold text-slate-700 text-sm mb-3">{t('views.tasks.agencyWorksiteAreaTitle')}</h4>
                        <div className="grid grid-cols-1 gap-6 mb-6">
                          <div>
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
                            <div className="text-xs text-slate-500">{t('views.tasks.clickToSelectArea')}</div>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <h5 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
                               <Car className="w-4 h-4 mr-2 text-slate-500"/> {t('views.tasks.selectedParkingVehicle')}
                            </h5>
                            <select className="w-full border-slate-300 rounded-lg text-sm bg-slate-50">
                              <option value="">{t('views.tasks.undecidedOrUnassigned')}</option>
                              {parking.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div>
                       <h4 className="font-bold text-slate-700 text-sm mb-2">{t('views.tasks.siteNotesTitle')}</h4>
                       <textarea
                         value={siteNotes}
                         onChange={e => setSiteNotes(e.target.value)}
                         placeholder={t('views.tasks.siteNotesPlaceholder')}
                         className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-indigo-500 font-medium text-slate-700 shadow-sm min-h-[100px]"
                       />
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'sub_tasks' && (
                <div className="max-w-5xl mx-auto w-full space-y-6 md:space-y-8 animate-in fade-in pb-10">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center">
                      <AlertCircle className="w-6 h-6 mr-2 text-indigo-500" />
                      {t('views.tasks.subTasksManagementTitle')}
                    </h3>
                    {!isReadOnly && (
                      <button 
                        onClick={() => setShowAddSubTaskModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center shadow-sm transition"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        {t('views.tasks.addSubTask')}
                      </button>
                    )}
                  </div>
                  
                  {subTasks.length === 0 ? (
                    <div className="text-center p-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                      <h4 className="font-bold text-slate-500 mb-2">{t('views.tasks.noSubTasksTitle')}</h4>
                      <p className="text-sm text-slate-400">{t('views.tasks.noSubTasksDescription')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {subTasks.map(st => (
                        <div key={st.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between hover:border-indigo-300 transition-colors">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{t('views.tasks.subTaskTag')}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                st.progress === '未着手' ? 'bg-slate-100 text-slate-600' :
                                st.progress === '進行中' ? 'bg-blue-100 text-blue-700' :
                                st.progress === '承認待ち' ? 'bg-amber-100 text-amber-700' :
                                'bg-emerald-100 text-emerald-700'
                              }`}>{tEnum('taskProgress', st.progress)}</span>
                            </div>
                            <h4 className="font-bold text-slate-800">{st.title}</h4>
                            {st.deadline && <div className="text-xs text-slate-500 mt-1">{t('views.tasks.deadlineLabel', { date: format(new Date(st.deadline), 'yyyy-MM-dd') })}</div>}
                          </div>
                          <div>
                            {/* We could add an edit button here, but for now just showing them is enough */}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              

            </div>
            </div>
              
              
          </div>

          {/* Chat Panel (Right Side) */}
          <div className={cn("w-full md:w-80 lg:w-[350px] xl:w-[400px] bg-slate-50 border-l border-slate-200 p-4 flex-col shrink-0 h-full", activeTab === 'chat' ? 'flex' : 'hidden md:flex')}>
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-800">{t('views.tasks.chatTitle')}</h3>
                </div>
                <span className="text-[10px] text-slate-500 font-bold border border-slate-200 rounded px-2 py-1">
                  {t('views.tasks.chatBadge')}
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
                 placeholder={t('views.tasks.chatInputPlaceholder')}
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
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-white p-4 flex items-center justify-between shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition shadow-sm">
            {t('views.tasks.footerBack')}
          </button>
          <div className="flex items-center gap-3">
             <button onClick={() => setShowDeleteConfirm(true)} className="p-2.5 text-slate-400 hover:text-rose-600 border border-slate-200 rounded-lg hover:bg-rose-50 transition" title={t('views.tasks.deleteTooltip')}>
               <Trash2 className="w-5 h-5"/>
             </button>
             <button onClick={() => handleSave()} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center transition shadow-sm">
               {t('views.tasks.footerSave')} <CheckCircle className="w-4 h-4 ml-2" />
             </button>
          </div>
        </div>
      </div>

          </div>
      {showAddWorkModal && task && (
        <AddWorkContentModal
          onClose={() => setShowAddWorkModal(false)}
          defaultCategory={task.category}
          onSave={(newWorks, selectedTaskIds, selectedAlertIds) => {
            const newLinkedIds = [...(task.linkedTaskIds || [])];
            
            // 1. Process existing tasks
            selectedTaskIds.forEach(id => {
              if (!newLinkedIds.includes(id)) newLinkedIds.push(id);
              const target = tasks.find(t => t.id === id);
              if (target) {
                // Copy info and link back
                updateTask(id, {
                  linkedTaskIds: Array.from(new Set([...(target.linkedTaskIds || []), task.id])),
                  toolIds: Array.from(new Set([...(target.toolIds || []), ...(task.toolIds || [])])),
                  assignments: task.assignments || target.assignments,
                  partStockId: task.partStockId || target.partStockId,
                });
              }
            });

            // 2. Process alerts (convert to task and link)
            selectedAlertIds.forEach(id => {
              const alert = alerts.find(a => a.id === id);
              if (alert) {
                const newTaskId = 'task-from-alert-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                newLinkedIds.push(newTaskId);
                addTask({
                  title: alert.title || alert.description,
                  category: task.category,
                  urgency: 'medium',
                  deadline: task.deadline,
                  targetModelName: alert.targetModelName,
                  vehicleId: alert.vehicleId,
                  description: alert.description,
                  linkedTaskIds: [task.id],
                  toolIds: task.toolIds || [],
                  assignments: task.assignments || [],
                  partStockId: task.partStockId,
                });
              }
            });

            // 3. Process new blank works
            newWorks.forEach(w => {
              const newTaskId = 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
              newLinkedIds.push(newTaskId);
              
              addTask({
                title: w.title,
                category: w.category,
                urgency: 'low',
                deadline: task.deadline,
                reportFormatId: w.reportFormatId,
                paidServiceId: w.paidServiceId,
                linkedTaskIds: [task.id],
                toolIds: task.toolIds || [],
                assignments: task.assignments || [],
                partStockId: task.partStockId
              });
            });

            // Update this task
            updateTask(task.id, { linkedTaskIds: newLinkedIds });
            setShowAddWorkModal(false);
          }}
        />
      )}

      {showAddSubTaskModal && (
        <div className="fixed inset-0 z-[60]">
          <AddRepairTaskModal
            onClose={() => setShowAddSubTaskModal(false)}
            initialVehicleId={task?.vehicleId}
            parentId={task?.id}
            initialTitle={t('views.tasks.subTaskInitialTitle', { title: task?.title || '' })}
            onTaskSaved={() => {
              // Usually handled by context automatically
              setShowAddSubTaskModal(false);
            }}
          />
        </div>
      )}
    </>
  );
}
