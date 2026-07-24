import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, Search, ChevronRight, CheckCircle, Car, Settings, User, ShieldAlert, ShieldCheck, Activity, MessageSquare, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { TaskConfigSection } from './AddDeliveryModal';
import { differenceInMonths } from 'date-fns';

type RepairTask = {
  name: string;
  reportFormatId: string;
  paidServiceId: string;
};

export function AddRepairTaskModal({
  onClose,
  initialVehicleId,
  initialStep = 1,
  initialCategory,
  initialTitle,
  onTaskSaved,
  parentId,
}: {
  onClose: () => void;
  initialVehicleId?: string;
  initialStep?: 1 | 2;
  initialCategory?: string;
  initialTitle?: string;
  onTaskSaved?: () => void;
  parentId?: string;
}) {
  const { vehicles, staff, tools, addTask, contracts, t } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(initialVehicleId || null);
  const [step, setStep] = useState<1 | 2>(initialStep);
  const [date, setDate] = useState<string>('');
  const [staffIds, setStaffIds] = useState<string[]>([]);
  const [showContractsModal, setShowContractsModal] = useState(false);
  const [tasks, setTasks] = useState<RepairTask[]>(() => {
    if (initialCategory === 'フィールドキャンペーン') {
      return [{ name: initialTitle || t('modal.addRepairTask.fcTask'), reportFormatId: '', paidServiceId: '' }];
    }
    if (initialCategory === '定期点検' || initialCategory === '新車巡回') {
      return [{ name: initialTitle || t('modal.addRepairTask.periodicInspectionTask'), reportFormatId: '', paidServiceId: '' }];
    }
    if (initialCategory === '特定自主検査') {
      return [{ name: t('modal.addRepairTask.specialInspectionTask'), reportFormatId: '', paidServiceId: '' }];
    }
    return t('modal.addRepairTask.defaultFaultTasks').split(' / ').map((name) => ({ name, reportFormatId: '', paidServiceId: '' }));
  });
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; text: string; sender: string; time: string; isSelf: boolean }>>([
    { id: '1', text: t('chat.stockBatteryWeak'), sender: 'フロント 高橋', time: '10:00', isSelf: false },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, step]);

  const filteredVehicles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return vehicles;
    return vehicles.filter((v) => {
      return (
        v.modelName.toLowerCase().includes(term) ||
        v.serialNumber?.toLowerCase().includes(term) ||
        v.customerName?.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, vehicles]);

  const selectedVehicle = useMemo(() => vehicles.find((v) => v.id === selectedVehicleId), [selectedVehicleId, vehicles]);

  const validContracts = useMemo(() => {
    if (!selectedVehicle?.contracts) return [];
    return selectedVehicle.contracts.filter((vc) => {
      const template = contracts.find((c) => c.id === vc.contractId);
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
  }, [contracts, selectedVehicle]);

  const hasValidContract = validContracts.length > 0;
  const defaultFaultTasks = t('modal.addRepairTask.defaultFaultTasks').split(' / ');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: chatInput,
        sender: t('chat.selfLabel'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSelf: true,
      },
    ]);
    setChatInput('');
  };

  const handleSave = () => {
    if (!selectedVehicleId) return;

    addTask({
      vehicleId: selectedVehicleId,
      targetModelName: selectedVehicle?.modelName || '',
      title: initialTitle || t('modal.addRepairTask.repairTitle'),
      category: (initialCategory as any) || '故障修理',
      urgency: '至急',
      progress: '未着手',
      deadline: date || new Date().toISOString(),
      staffIds: staffIds.length > 0 ? staffIds : undefined,
      parentId,
    });

    onTaskSaved?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center sm:p-4 xl:p-8 bg-slate-900/60 backdrop-blur-sm">
      <div
        className={cn(
          'bg-white sm:rounded-xl shadow-2xl w-full flex flex-col overflow-hidden relative transition-all h-full sm:h-[95vh] md:h-[98vh]',
          step > 1 ? 'md:w-[98vw] xl:max-w-[1700px] sm:max-h-[98vh]' : 'max-w-3xl min-h-[500px]',
        )}
      >
        <button onClick={onClose} className="absolute top-2 right-2 md:top-4 md:right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 z-20 transition">
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {step === 1 ? (
          <div className="flex-1 flex flex-col pt-12 md:pt-8 bg-slate-50 relative min-h-0">
            <div className="px-4 md:px-8 shrink-0">
              <h2 className="text-lg md:text-2xl font-bold text-slate-800 mb-4 flex items-center">
                <Settings className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 text-indigo-600" />
                {t('modal.addRepairTask.title')}
              </h2>

              <div className="bg-white p-3 md:p-4 shadow-sm border-y md:border md:rounded-xl border-slate-200 mb-0 md:mb-4">
                <label className="block text-xs md:text-sm font-bold text-slate-700 mb-2">{t('modal.addRepairTask.searchLabel')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                  </div>
                  <input
                    autoFocus
                    type="text"
                    placeholder={t('modal.addRepairTask.searchPlaceholder')}
                    className="block w-full pl-9 md:pl-10 pr-3 py-2 md:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm font-bold bg-slate-50 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 bg-white md:bg-transparent px-0 md:px-8">
              <div className="border-t border-slate-200 md:border-none divide-y divide-slate-100 md:space-y-2 pb-4">
                {filteredVehicles.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setSelectedVehicleId(v.id)}
                    className={cn(
                      'p-3 md:p-4 transition-all cursor-pointer flex items-center justify-between md:rounded-xl md:border',
                      selectedVehicleId === v.id
                        ? 'bg-indigo-50/80 md:border-indigo-500 md:shadow-sm md:ring-1 ring-indigo-500'
                        : 'bg-white hover:bg-slate-50 md:border-slate-200 md:hover:border-indigo-300',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 border',
                          selectedVehicleId === v.id ? 'bg-indigo-200 text-indigo-700 border-indigo-300' : 'bg-slate-50 text-slate-400 border-slate-200',
                        )}
                      >
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
                    <div
                      className={cn(
                        'w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center shrink-0',
                        selectedVehicleId === v.id ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-slate-300',
                      )}
                    >
                      {selectedVehicleId === v.id && <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />}
                    </div>
                  </div>
                ))}
              </div>
              {filteredVehicles.length === 0 && (
                <div className="text-center py-10 md:py-16 text-slate-500 font-bold bg-white md:rounded-xl md:border md:border-dashed border-slate-300 mx-0 md:mx-4 my-0 md:my-4">{t('modal.addRepairTask.noVehicles')}</div>
              )}
            </div>

            <div className="p-4 md:px-8 bg-white border-t border-slate-200 flex justify-end shrink-0 shadow-sm z-20">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedVehicleId}
                className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition shadow-md flex items-center justify-center"
              >
                {t('common.next')} <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full bg-slate-50">
            <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between bg-white shrink-0 shadow-sm z-10 gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm font-bold text-slate-500">{t('modal.addRepairTask.targetVehicleLabel')}</span>
                <div className="px-3 py-1 bg-slate-100 rounded-lg font-mono font-bold text-indigo-900 border border-slate-200 text-lg">{selectedVehicle?.modelName}</div>
                {selectedVehicle?.customerName && (
                  <div className="flex items-center text-sm font-bold text-slate-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                    <User className="w-4 h-4 mr-1 text-amber-500" />
                    {t('modal.addRepairTask.customerPrefix')} {selectedVehicle.customerName}
                  </div>
                )}
                <div className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">{selectedVehicle?.serialNumber}</div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowContractsModal(true)}
                  className={cn(
                    'flex items-center text-sm font-bold transition px-3 py-2 rounded border whitespace-nowrap shadow-sm cursor-pointer',
                    hasValidContract ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200' : 'text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200',
                  )}
                >
                  {hasValidContract ? <ShieldCheck className="w-4 h-4 mr-2 text-emerald-500" /> : <ShieldAlert className="w-4 h-4 mr-2 text-amber-500" />}
                  {hasValidContract ? t('modal.addRepairTask.warrantyActive', { count: validContracts.length }) : t('modal.addRepairTask.warrantyInactive')}
                </button>
                <button className="flex items-center px-3 py-2 bg-white border border-slate-300 rounded hover:bg-slate-50 text-sm font-bold text-slate-700 shadow-sm transition whitespace-nowrap">
                  <Activity className="w-4 h-4 mr-2 text-indigo-500" />
                  {t('modal.addRepairTask.vehicleStatusButton')}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto lg:overflow-hidden p-4 lg:p-6 flex flex-col lg:flex-row gap-6">
              <div className="flex-1 w-full min-w-0 mx-auto lg:mx-0 lg:overflow-y-auto lg:pr-2 lg:-mr-2 pb-24 lg:pb-0">
                <TaskConfigSection
                  title={t('modal.addRepairTask.taskSectionTitle')}
                  defaultTasks={defaultFaultTasks}
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

              <div className="w-full lg:w-96 flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden h-[600px] lg:h-full shrink-0 mx-auto lg:mx-0">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
                  <h3 className="font-bold text-slate-800 flex items-center text-sm">
                    <MessageSquare className="w-4 h-4 mr-2 text-indigo-500" />
                    {t('modal.addRepairTask.chatTitle')}
                  </h3>
                  <span className="text-xs text-slate-500 font-bold bg-white px-2 py-1 border border-slate-200 rounded">{t('modal.addRepairTask.chatBadge')}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50" ref={chatScrollRef}>
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={cn('flex flex-col max-w-[85%]', msg.isSelf ? 'items-end ml-auto' : 'items-start')}>
                      {!msg.isSelf && <span className="text-[10px] text-slate-500 font-bold mb-1 ml-1">{msg.sender}</span>}
                      <div className={cn('px-3 py-2 rounded-2xl text-sm shadow-sm', msg.isSelf ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none font-bold')}>
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
                    placeholder={t('modal.addRepairTask.messagePlaceholder')}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                  />
                  <button type="submit" disabled={!chatInput.trim()} className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center shrink-0 w-10 h-10">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            <div className="px-4 py-4 md:px-6 md:py-5 bg-white border-t border-slate-200 flex flex-col md:flex-row justify-between shrink-0 shadow-sm z-20 gap-3">
              <button type="button" onClick={() => setStep(1)} className="order-2 md:order-1 px-6 py-3 text-slate-600 font-bold rounded-lg hover:bg-slate-100 transition border border-slate-200 w-full md:w-auto text-center">{t('modal.addRepairTask.back')}</button>
              <button type="button" onClick={handleSave} className="order-1 md:order-2 px-10 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-sm transition text-lg flex items-center justify-center w-full md:w-auto">
                {t('modal.addRepairTask.saveAndClose')} <CheckCircle className="w-5 h-5 ml-2" />
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
                {t('modal.addRepairTask.contractsTitle')}
              </h3>
              <button onClick={() => setShowContractsModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 flex-1 bg-slate-50">
              {selectedVehicle.contracts && selectedVehicle.contracts.length > 0 ? (
                <div className="space-y-6">
                  {selectedVehicle.contracts.map((vc: any) => {
                    const template = contracts.find((c) => c.id === vc.contractId);
                    if (!template) return null;

                    const isValid = validContracts.some((v: any) => v.contractId === vc.contractId);
                    const modelParts = template.partsConfig?.[selectedVehicle.modelName] || template.defaultParts || [];
                    const modelReportFields = template.reportFormatConfig?.[selectedVehicle.modelName] || template.defaultReportFormat || [];

                    return (
                      <div key={vc.id} className={cn('p-5 rounded-lg border-2 shadow-sm font-bold bg-white', isValid ? 'border-emerald-500' : 'border-amber-300 opacity-90')}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-lg text-slate-800">{template.title}</span>
                              {isValid ? (
                                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded">{t('modal.addRepairTask.activeBadge')}</span>
                              ) : (
                                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded">{t('modal.addRepairTask.inactiveBadge')}</span>
                              )}
                            </div>
                            <div className="text-sm text-slate-600 font-normal">{template.description}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                          {modelReportFields.length > 0 && (
                            <div>
                              <div className="text-slate-600 text-xs mb-2">
                                {isValid ? t('modal.addRepairTask.reportFormatValid') : t('modal.addRepairTask.reportFormatInactive')}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                <div className="flex items-center justify-between bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-800 min-w-[200px] shadow-sm">
                                  <span>{template.title} ({modelReportFields.length})</span>
                                  <button
                                    onClick={() => {
                                      setTasks((prev) => [
                                        ...prev,
                                        {
                                          name: isValid ? t('modal.addRepairTask.inspectionReportTaskValid') : t('modal.addRepairTask.inspectionReportTaskPaid'),
                                          reportFormatId: '',
                                          paidServiceId: template.title,
                                        },
                                      ]);
                                      setShowContractsModal(false);
                                    }}
                                    className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 font-bold rounded border border-indigo-200 transition"
                                  >
                                    {t('modal.addRepairTask.addTask')}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {modelParts.length > 0 && (
                            <div className="mt-2">
                              <div className="text-slate-600 text-xs mb-2">{t('modal.addRepairTask.masterParts')}</div>
                              <div className="flex flex-wrap gap-2">
                                {modelParts.map((p: any, idx: number) => (
                                  <div key={`part-${idx}`} className="flex flex-col bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-800 min-w-[240px] shadow-sm">
                                    <div className="flex justify-between mb-1">
                                      <span className="font-bold">{p.partName}</span>
                                      <span className="text-xs text-slate-500">x{p.quantity}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                                      <span>{t('modal.inventoryList.partNumberHeader')}: {p.partNumber}</span>
                                      <button
                                        onClick={() => {
                                          setTasks((prev) => [
                                            ...prev,
                                            {
                                              name: t('modal.addRepairTask.partExchangeTitle', {
                                                name: p.partName,
                                                service: isValid ? t('modal.addRepairTask.activeBadge') : t('modal.addRepairTask.reportFormatValid'),
                                              }),
                                              reportFormatId: '',
                                              paidServiceId: template.title,
                                            },
                                          ]);
                                          setShowContractsModal(false);
                                        }}
                                        className="text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2 py-1 font-bold rounded border border-indigo-200 transition"
                                      >
                                        {t('modal.addRepairTask.addTask')}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 font-bold bg-white rounded-lg border border-dashed border-slate-300">
                  {t('modal.addRepairTask.noValidContracts')}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end shrink-0">
              <button onClick={() => setShowContractsModal(false)} className="px-6 py-2 border border-slate-300 hover:bg-slate-50 font-bold rounded-lg transition text-slate-700">
                {t('modal.addRepairTask.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
