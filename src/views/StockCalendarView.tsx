import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, Search, CheckCircle2, AlertTriangle, Package, ChevronLeft, ChevronRight, X, Trash2, CheckCircle, Truck, Box, Info, FileText, UserPlus } from 'lucide-react';
import { addMonths, subMonths, format, startOfMonth, isSameMonth, isBefore } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { ServiceTask, Vehicle } from '../types';
import { EventCaseActions } from '../components/EventCaseActions';
import { getStockInspectionDateForMonth, getStockInspectionPlan } from '../lib/stockInspection';
import { isTaskResolved } from '../lib/workflow';

export const StockCalendarView = ({ isEmbedded = false, focusVehicleId }: { isEmbedded?: boolean, focusVehicleId?: string }) => {
  const { vehicles, tasks, setView, t, staff, lang, tEnum } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState(startOfMonth(new Date()));
  const [selectedTaskContext, setSelectedTaskContext] = useState<{vehicleId: string, month: Date, taskId?: string, plannedDate?: Date} | null>(null);
  
  const [inventoryType, setInventoryType] = useState<'vehicle' | 'parts'>('vehicle');

  useEffect(() => {
    if (!focusVehicleId) return;
    const focusedVehicle = vehicles.find(vehicle => vehicle.id === focusVehicleId);
    setInventoryType('vehicle');
    setSearchTerm(focusedVehicle?.serialNumber || '');
    if (focusedVehicle) {
      const plan = getStockInspectionPlan(focusedVehicle, tasks);
      if (plan.dueDates[0]) {
        const focusDate = plan.isProvisional && isBefore(plan.dueDates[0], new Date())
          ? new Date()
          : plan.dueDates[0];
        setCurrentDate(startOfMonth(focusDate));
      }
    }
  }, [focusVehicleId, vehicles]);

  const [assignModalData, setAssignModalData] = useState<{type: 'vehicle' | 'parts', id: string, name: string} | null>(null);
  const [parts, setParts] = useState([
    { id: 'p1', name: 'エンジンオイル 10W-30', qty: 50, arrivalDate: '2023-10-01' },
    { id: 'p2', name: 'オイルフィルター X-12', qty: 120, arrivalDate: '2023-11-15' },
    { id: 'p3', name: 'ノーパンクタイヤ 6.00-9', qty: 24, arrivalDate: '2023-12-05' },
    { id: 'p4', name: 'バッテリー 48V', qty: 5, arrivalDate: '2024-01-20' },
  ]);

  // If delivery is undecided, schedule one inspection a month after receiving.
  // Once delivery is planned, apply the two-full-month stock rule.
  const targetVehicles = vehicles
    .filter(vehicle => getStockInspectionPlan(vehicle, tasks).isEligible)
    .filter(vehicle =>
      (vehicle.modelName + vehicle.serialNumber).toLowerCase().includes(searchTerm.toLowerCase())
    );

  const targetParts = parts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const monthLocale = lang === 'ja' ? ja : enUS;
  const monthFormat = lang === 'ja' ? 'yyyy年M月' : 'MMM yyyy';

  const months = [
    subMonths(currentDate, 1),
    currentDate,
    addMonths(currentDate, 1),
    addMonths(currentDate, 2)
  ];

  const getTaskForMonth = (vehicleId: string, targetMonth: Date) => {
    return tasks.find(t => 
      t.vehicleId === vehicleId && 
      t.category === '在庫点検' && 
      isSameMonth(new Date(t.deadline), targetMonth)
    );
  };

  const getScheduledDateForMonth = (vehicle: Vehicle, targetMonth: Date) => {
    return getStockInspectionDateForMonth(getStockInspectionPlan(vehicle, tasks), targetMonth);
  };

  const renderCellStatus = (task: ServiceTask | undefined, targetMonth: Date, vehicle: Vehicle, scheduledDate?: Date, isProvisional = false) => {
    const assignedStaffId = task?.staffIds?.[0] || task?.staffId;
    const staffName = assignedStaffId ? staff.find(s => s.id === assignedStaffId)?.name || t('common.notSet') : t('common.notSet');

    if (!task && !scheduledDate) {
      return (
        <div className="flex min-h-[90px] h-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-slate-400">
          <span className="text-[11px] font-bold">{t('fleet.stockCalendar.outsideStockPeriod')}</span>
        </div>
      );
    }

    const isReceivingResolved = tasks.some(receivingTask =>
      receivingTask.vehicleId === vehicle.id &&
      receivingTask.category === '受け入れ点検' &&
      isTaskResolved(receivingTask)
    );

    if (!isReceivingResolved) {
      return (
        <div
          onClick={() => setSelectedTaskContext({ vehicleId: vehicle.id, month: targetMonth, taskId: task?.id, plannedDate: scheduledDate })}
          className="flex min-h-[90px] h-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-3 text-slate-500 transition hover:border-slate-400"
        >
          <span className="text-[11px] font-bold">{t('fleet.event.notExecuted')}</span>
          <span className="mt-1.5 font-mono text-[11px] font-bold text-slate-600">
            {format(task ? new Date(task.deadline) : scheduledDate!, 'yyyy-MM-dd')}
          </span>
          <span className="mt-1 max-w-full truncate px-1 text-[10px]">{t('fleet.event.assigneePrefix')} {staffName}</span>
        </div>
      );
    }

    if (!task) {
      return (
        <div 
          onClick={() => setSelectedTaskContext({ vehicleId: vehicle.id, month: targetMonth, plannedDate: scheduledDate })}
          className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border border-dashed border-slate-300 bg-white hover:border-slate-400 cursor-pointer transition h-full text-slate-500 min-h-[90px]"
        >
          <Calendar className="w-5 h-5 mb-1 text-slate-400" />
          <span className="text-[13px] font-bold text-slate-600">
            {isProvisional ? t('fleet.stockCalendar.provisionalScheduledLabel') : t('fleet.stockCalendar.scheduledLabel')}
          </span>
          <span className="text-[11px] font-bold mt-1 font-mono text-slate-600">{format(scheduledDate!, 'yyyy-MM-dd')}</span>
          <span className="text-[10px] text-slate-500 mt-1 truncate max-w-full px-1">{staffName}</span>
        </div>
      );
    }
    
    if (task.progress === '完了') {
      return (
        <div 
          onClick={() => setSelectedTaskContext({ vehicleId: vehicle.id, month: targetMonth, taskId: task.id, plannedDate: scheduledDate })}
          className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border border-emerald-200 bg-emerald-50/80 cursor-pointer hover:bg-emerald-100 transition h-full text-emerald-700 min-h-[90px]"
        >
          <CheckCircle2 className="w-5 h-5 mb-1 text-emerald-500" />
          <span className="text-[13px] font-bold">{tEnum('taskProgress', '完了')}</span>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 font-mono">{format(new Date(task.deadline), 'yyyy-MM-dd')}</span>
          <span className="text-[10px] text-emerald-700/80 mt-1 truncate max-w-full px-1">{staffName}</span>
        </div>
      );
    }

    if (task.progress === 'スキップ') {
      return (
        <div
          onClick={() => setSelectedTaskContext({ vehicleId: vehicle.id, month: targetMonth, taskId: task.id, plannedDate: scheduledDate })}
          className="flex min-h-[90px] h-full cursor-pointer flex-col items-center justify-center rounded-xl border border-slate-300 bg-slate-100 p-3 text-slate-600 transition hover:bg-slate-200"
        >
          <span className="rounded bg-slate-200 px-2 py-0.5 text-[13px] font-black">{tEnum('taskProgress', 'スキップ')}</span>
          <span className="mt-1 font-mono text-[11px] font-bold text-slate-500">{format(new Date(task.deadline), 'yyyy-MM-dd')}</span>
        </div>
      );
    }
    
    const isOverdue = isBefore(new Date(task.deadline), new Date());

    if (isOverdue) {
      return (
        <div 
          onClick={() => setSelectedTaskContext({ vehicleId: vehicle.id, month: targetMonth, taskId: task.id, plannedDate: scheduledDate })}
          className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border border-red-200 bg-red-50/80 cursor-pointer hover:bg-red-100 transition h-full text-red-700 min-h-[90px]"
        >
          <AlertTriangle className="w-5 h-5 mb-1 text-red-500" />
          <span className="text-[13px] font-bold">{t('fleet.stockCalendar.overdueLabel')}</span>
          <span className="text-[11px] text-red-600 font-bold mt-1 font-mono">{format(new Date(task.deadline), 'yyyy-MM-dd')}</span>
          <span className="text-[10px] text-red-700/80 mt-1 truncate max-w-full px-1">{staffName}</span>
        </div>
      );
    }

    return (
      <div 
        onClick={() => setSelectedTaskContext({ vehicleId: vehicle.id, month: targetMonth, taskId: task.id, plannedDate: scheduledDate })}
        className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border border-dashed border-slate-300 bg-white hover:border-slate-400 cursor-pointer transition h-full text-slate-500 min-h-[90px]"
      >
        <Calendar className="w-5 h-5 mb-1 text-slate-400" />
        <span className="text-[13px] font-bold text-slate-600">{t('fleet.stockCalendar.scheduledLabel')}</span>
        <span className="text-[11px] font-bold mt-1 font-mono text-slate-600">{format(new Date(task.deadline), 'yyyy-MM-dd')}</span>
        <span className="text-[10px] text-slate-500 mt-1 truncate max-w-full px-1">{staffName}</span>
      </div>
    );
  };

  const removePart = (id: string) => {
    setParts(parts.filter(p => p.id !== id));
    setAssignModalData(null);
  };

  return (
    <div className={cn(!isEmbedded ? "bg-white p-4 md:p-8 space-y-6 min-h-full" : "space-y-4 min-h-full flex flex-col")}>
      {/* Header */}
      {!isEmbedded && (
        <div className="flex flex-col border-b border-slate-200 pb-5">
          <button 
            onClick={() => setView('home')}
            className="flex items-center text-slate-500 hover:text-slate-800 transition mb-4 w-fit font-bold text-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {t('fleet.stockCalendar.backToHome')}
          </button>
          <div>
            <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 mb-2 border border-emerald-100">
              {t('fleet.stockCalendar.badge')}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-emerald-600" />
              {t('fleet.stockCalendar.title')}
            </h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">{t('fleet.stockCalendar.description')}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('fleet.stockCalendar.searchPlaceholder')}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>
          
          <div className="flex bg-white rounded-lg border border-slate-300 p-0.5">
            <button 
              onClick={() => setInventoryType('vehicle')}
              className={cn("px-3 py-1.5 text-sm font-bold rounded-md flex items-center transition", inventoryType === 'vehicle' ? "bg-emerald-100 text-emerald-800" : "text-slate-500 hover:text-slate-700")}
            >
              <Truck className="w-4 h-4 mr-1.5" />
              {t('fleet.stockCalendar.vehicleInventoryTab')}
            </button>
            <button 
              onClick={() => setInventoryType('parts')}
              className={cn("px-3 py-1.5 text-sm font-bold rounded-md flex items-center transition", inventoryType === 'parts' ? "bg-emerald-100 text-emerald-800" : "text-slate-500 hover:text-slate-700")}
            >
              <Box className="w-4 h-4 mr-1.5" />
              {t('fleet.stockCalendar.partsInventoryTab')}
            </button>
          </div>
        </div>

        {inventoryType === 'vehicle' && (
          <div className="flex items-center space-x-3 bg-white px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm">
            <button 
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="font-bold text-slate-800 text-sm min-w-[100px] text-center">
              {format(currentDate, monthFormat, { locale: monthLocale })}
            </div>
            <button 
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentDate(startOfMonth(new Date()))}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 px-2 py-1 rounded border border-emerald-200 hover:bg-emerald-50 transition ml-2"
            >
              {t('fleet.stockCalendar.currentMonth')}
            </button>
          </div>
        )}
      </div>

      {/* Inventory Matrix Table */}
      {inventoryType === 'vehicle' ? (
        <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm bg-white mt-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="px-5 py-4 align-bottom border-r font-bold text-slate-800 text-[15px] bg-slate-50 w-[240px]">
                  {t('fleet.stockCalendar.vehicleTableHeader')}
                </th>
                {months.map((m, i) => {
                  const isCurrent = isSameMonth(m, new Date());
                  return (
                    <th key={i} className={cn(
                      "p-0 text-center relative font-bold text-slate-800 border-r last:border-r-0",
                      isCurrent ? "bg-emerald-50/50" : "bg-slate-50"
                    )}>
                      <div className={cn(
                        "py-4 flex flex-col items-center justify-center h-full",
                        isCurrent ? "border-b-[3px] border-emerald-400" : "border-b-[3px] border-transparent"
                      )}>
                        <span className="text-[15px]">{format(m, monthFormat, { locale: monthLocale })}</span>
                        {isCurrent && <span className="text-[10px] text-emerald-600 font-bold tracking-wider mt-0.5 uppercase">{t('fleet.stockCalendar.currentMonthBadge')}</span>}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="bg-white">
              {targetVehicles.map((v) => {
                const plan = getStockInspectionPlan(v, tasks);
                return (
                  <tr
                    key={v.id}
                    className={cn(
                      "transition border-t border-slate-200",
                      focusVehicleId === v.id && "bg-emerald-50/50 ring-2 ring-inset ring-emerald-300"
                    )}
                  >
                    <td className="px-5 py-4 border-r align-top">
                      <div
                        className="cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded transition-colors group"
                        onClick={() => setAssignModalData({ type: 'vehicle', id: v.id, name: v.modelName })}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-baseline gap-2">
                            <div className="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition-colors">{v.modelName}</div>
                            <div className="font-mono text-[13px] font-bold text-slate-500">{v.serialNumber}</div>
                          </div>
                          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                            {t('fleet.stockCalendar.stockTreatment')}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 flex items-center font-medium mt-1.5">
                          <Package className="w-3.5 h-3.5 mr-1" />
                          {t('fleet.stockCalendar.stockPeriod', {
                            start: plan.receivingDate ? format(plan.receivingDate, 'yyyy-MM-dd') : t('common.notSet'),
                            end: plan.deliveryDate ? format(plan.deliveryDate, 'yyyy-MM-dd') : t('fleet.stockCalendar.deliveryUndecided'),
                          })}
                        </div>
                        <div className="mt-1.5 text-[11px] font-bold text-emerald-700">
                          {plan.isProvisional
                            ? t('fleet.stockCalendar.provisionalInspectionCount')
                            : t('fleet.stockCalendar.inspectionCount', { count: plan.dueDates.length })}
                        </div>
                        <div className="text-xs text-indigo-500 mt-2 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                          <Calendar className="w-3 h-3 mr-1" /> {t('fleet.stockCalendar.assignAction')}
                        </div>
                      </div>
                    </td>
                    {months.map((m, i) => {
                      const scheduledDate = getScheduledDateForMonth(v, m);
                      const task = scheduledDate ? getTaskForMonth(v.id, m) : undefined;
                      const isCurrent = isSameMonth(m, new Date());
                      return (
                        <td key={i} className={cn(
                          "p-3 align-middle border-r last:border-r-0",
                          isCurrent ? "bg-emerald-50/10" : ""
                        )}>
                          {renderCellStatus(task, m, v, scheduledDate, plan.isProvisional)}
                        </td>
                      )
                    })}
                  </tr>
                );
              })}
              {targetVehicles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                    {t('fleet.stockCalendar.noVehicleData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-2xl shadow-sm bg-white mt-4 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-4 font-bold text-slate-500 text-xs">{t('fleet.stockCalendar.partsHeaders.name')}</th>
                <th className="px-5 py-4 font-bold text-slate-500 text-xs text-right">{t('fleet.stockCalendar.partsHeaders.qty')}</th>
                <th className="px-5 py-4 font-bold text-slate-500 text-xs">{t('fleet.stockCalendar.partsHeaders.arrival')}</th>
                <th className="px-5 py-4 font-bold text-slate-500 text-xs text-right">{t('fleet.stockCalendar.partsHeaders.action')}</th>
              </tr>
            </thead>
            <tbody>
              {targetParts.map(p => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-bold text-slate-800">{p.name}</td>
                  <td className="px-5 py-4 text-right font-mono text-sm">{p.qty}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{p.arrivalDate}</td>
                  <td className="px-5 py-4 text-right">
                    <button 
                      onClick={() => setAssignModalData({ type: 'parts', id: p.id, name: p.name })}
                      className="text-xs font-bold bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
                    >
                      {t('fleet.stockCalendar.assignAction')}
                    </button>
                  </td>
                </tr>
              ))}
              {targetParts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                    {t('fleet.stockCalendar.noPartData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedTaskContext && (
        <StockInspectionModal
          context={selectedTaskContext}
          onClose={() => setSelectedTaskContext(null)}
        />
      )}

      {assignModalData && (
        <div className="fixed inset-0 bg-slate-900/50 z-[70] flex items-center justify-center p-4" onClick={() => setAssignModalData(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">{t('fleet.stockCalendar.modalOperationTitle', { name: assignModalData.name })}</h3>
              <button onClick={() => setAssignModalData(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {assignModalData.type === 'vehicle' ? (
                <>
                  <button 
                    onClick={() => {
                      if (assignModalData.type === 'vehicle') {
                        const vehicle = vehicles.find(item => item.id === assignModalData.id);
                        const plannedDate = vehicle ? getStockInspectionPlan(vehicle, tasks).dueDates[0] : undefined;
                        setSelectedTaskContext({
                          vehicleId: assignModalData.id,
                          month: plannedDate || new Date(),
                          plannedDate,
                        });
                      } else {
                        alert(t('fleet.stockCalendar.partAssignAlert'));
                      }
                      setAssignModalData(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {t('fleet.stockCalendar.stockAssignButton')}
                  </button>
                  <button 
                    onClick={() => {
                      alert(t('fleet.stockCalendar.deliveryAssignAlert'));
                      setAssignModalData(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <Truck className="w-5 h-5" />
                    {t('fleet.stockCalendar.deliveryAssignButton')}
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      if (assignModalData.type === 'vehicle') {
                        setSelectedTaskContext({ vehicleId: assignModalData.id, month: new Date() });
                      } else {
                        alert(t('fleet.stockCalendar.partAssignAlert'));
                      }
                      setAssignModalData(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {t('fleet.stockCalendar.stockAssignButton')}
                  </button>
                  <button 
                    onClick={() => removePart(assignModalData.id)}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 font-bold rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    {t('fleet.stockCalendar.removePartButton')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function StockInspectionModal({ context, onClose }: { context: {vehicleId: string, month: Date, taskId?: string, plannedDate?: Date}, onClose: () => void }) {
  const { vehicles, tasks, staff, addTask, updateTask, deleteTask, t, lang } = useApp();
  const selectedVehicle = vehicles.find(v => v.id === context.vehicleId);
  const existingTask = tasks.find(task => context.taskId
    ? task.id === context.taskId
    : task.vehicleId === context.vehicleId && task.category === '在庫点検' && isSameMonth(new Date(task.deadline), context.month)
  );
  const isReceivingResolved = tasks.some(task =>
    task.vehicleId === context.vehicleId &&
    task.category === '受け入れ点検' &&
    isTaskResolved(task)
  );
  const monthLocale = lang === 'ja' ? ja : enUS;
  const monthFormat = lang === 'ja' ? 'yyyy年M月' : 'MMM yyyy';
  
  const plannedDeadline = context.plannedDate || (existingTask ? new Date(existingTask.deadline) : new Date(context.month.getFullYear(), context.month.getMonth(), 25));
  const [date, setDate] = React.useState(existingTask?.deadline ? format(new Date(existingTask.deadline), 'yyyy-MM-dd') : format(plannedDeadline, 'yyyy-MM-dd'));
  const [staffId, setStaffId] = React.useState(existingTask?.staffIds?.[0] || existingTask?.staffId || '');
  const isCompleted = existingTask?.progress === '完了';
  const isSkipped = existingTask?.progress === 'スキップ';
  const isPendingApproval = existingTask?.progress === '承認待ち';
  const isAssigned = Boolean(existingTask?.staffIds?.length || existingTask?.staffId);
  const caseAction = !isReceivingResolved
    ? 'create'
    : isSkipped || isPendingApproval
      ? undefined
      : isCompleted || isAssigned ? 'detail' : 'create';

  if (!selectedVehicle) return null;

  const handleSave = () => {
    if (!date) return;
    const deadline = new Date(`${date}T00:00:00`).toISOString();
    if (existingTask) {
      updateTask(existingTask.id, {
        deadline,
        startDate: deadline,
        staffId: staffId || undefined,
        staffIds: staffId ? [staffId] : undefined,
        progress: isCompleted || isSkipped || isPendingApproval
          ? existingTask.progress
          : staffId ? '進行中' : '未着手',
      });
    } else {
      addTask({
        vehicleId: selectedVehicle.id,
        targetModelName: selectedVehicle.modelName,
        title: t('fleet.stockCalendar.taskTitle', { month: format(context.month, monthFormat, { locale: monthLocale }) }),
        category: '在庫点検',
        progress: staffId ? '進行中' : '未着手',
        urgency: '1ヶ月以内',
        deadline,
        startDate: deadline,
        staffId: staffId || undefined,
        staffIds: staffId ? [staffId] : undefined,
      });
    }
    onClose();
  };

  const handleSkip = () => {
    if (!isReceivingResolved || isCompleted || isSkipped || isPendingApproval || !date) return;
    const deadline = new Date(`${date}T00:00:00`).toISOString();

    if (existingTask) {
      updateTask(existingTask.id, {
        progress: 'スキップ',
        deadline,
        isApproved: false,
      });
    } else {
      addTask({
        vehicleId: selectedVehicle.id,
        targetModelName: selectedVehicle.modelName,
        title: t('fleet.stockCalendar.taskTitle', { month: format(context.month, monthFormat, { locale: monthLocale }) }),
        category: '在庫点検',
        progress: 'スキップ',
        urgency: '1ヶ月以内',
        deadline,
      });
    }

    onClose();
  };

  const handleReportSubmit = () => {
    if (!existingTask || !isReceivingResolved || isCompleted || isSkipped || isPendingApproval || !date) return;
    const deadline = new Date(`${date}T00:00:00`).toISOString();
    updateTask(existingTask.id, {
      deadline,
      startDate: deadline,
      staffId: staffId || undefined,
      staffIds: staffId ? [staffId] : undefined,
      progress: '承認待ち',
    });
    onClose();
  };

  const handleDelete = () => {
    if (!existingTask || !window.confirm(t('fleet.stockCalendar.deleteInspectionConfirm'))) return;
    deleteTask(existingTask.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="stock-inspection-modal-title" className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-5">
          <h3 id="stock-inspection-modal-title" className="flex items-center text-xl font-black text-slate-800">
            <FileText className="mr-2 h-5 w-5 shrink-0 text-indigo-600" />
            {t('fleet.event.modalTitle')}
          </h3>
          <button type="button" aria-label={t('common.close')} onClick={onClose} className="rounded-full bg-slate-200/50 p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="space-y-6">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <div className="mb-1 text-xs font-bold text-indigo-400">{t('fleet.requiredHeaders.stockInspection')}</div>
              <div className="mb-2 text-lg font-black text-indigo-900">
                {existingTask?.title || t('fleet.stockCalendar.taskTitle', { month: format(context.month, monthFormat, { locale: monthLocale }) })}
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 shadow-sm">
                  {t('fleet.event.vehicleLabel')}: {selectedVehicle.modelName} ({selectedVehicle.serialNumber})
                </span>
                <span className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700 shadow-sm">
                  {t('fleet.event.targetDateLabel')}: {format(plannedDeadline, 'yyyy/MM/dd')}
                </span>
              </div>
            </div>

            {!isReceivingResolved && (
              <div className="flex items-start rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-700">
                <Info className="mr-3 mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />
                <div>
                  <p className="text-sm font-black">{t('fleet.event.workflowGuidanceTitle')}</p>
                  <p className="mt-1 text-xs font-medium leading-relaxed">
                    {t('fleet.event.completionBlockedDescription', { step: t('fleet.requiredHeaders.receiving') })}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="stock-inspection-date" className="mb-2 flex items-center text-sm font-bold text-slate-700">
                  <Calendar className="mr-1 h-4 w-4 text-slate-400" />
                  {t('fleet.event.scheduledDateLabel')}
                </label>
                <input 
                  id="stock-inspection-date"
                  type="date" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="stock-inspection-staff" className="mb-2 flex items-center text-sm font-bold text-slate-700">
                  <UserPlus className="mr-1 h-4 w-4 text-slate-400" />
                  {t('fleet.event.assigneeLabel')}
                </label>
                <select 
                  id="stock-inspection-staff"
                  value={staffId}
                  onChange={e => setStaffId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">{t('fleet.event.noAssigneeOption')}</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>
            </div>
            
            {caseAction && <EventCaseActions action={caseAction} />}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {existingTask && (
              <button
                type="button"
                onClick={handleDelete}
                className="whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
              >
                {t('common.delete')}
              </button>
            )}
            <button
              type="button"
              onClick={handleSkip}
              disabled={!isReceivingResolved || isCompleted || isSkipped || isPendingApproval || !date}
              className="whitespace-nowrap rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t('fleet.event.skipStep')}
            </button>
          </div>
          <div className="ml-auto flex flex-wrap justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="whitespace-nowrap rounded-lg px-5 py-2.5 font-bold text-slate-600 transition hover:bg-slate-200"
            >
              {t('common.cancel')}
            </button>
            <button 
              type="button"
              onClick={handleSave}
              disabled={!date}
              className="whitespace-nowrap rounded-lg bg-slate-800 px-6 py-2.5 font-bold text-white shadow-sm transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t('fleet.event.saveButton')}
            </button>
            {existingTask && isReceivingResolved && !isCompleted && !isSkipped && !isPendingApproval && (
              <button
                type="button"
                onClick={handleReportSubmit}
                disabled={!date}
                className="flex items-center whitespace-nowrap rounded-lg bg-indigo-600 px-6 py-2.5 font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {t('fleet.event.reportSubmitButton')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
