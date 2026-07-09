import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Search, Info, Settings, MoreHorizontal, UserPlus, CheckCircle, Calendar, FileText, AlertTriangle, ShieldCheck, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Vehicle, ServiceTask } from '../types';
import { cn } from '../lib/utils';
import { addDays, addMonths, differenceInDays, format, differenceInMonths } from 'date-fns';

type FleetTab = 'required' | 'fc' | 'regular' | 'stock_calendar' | 'alerts';

import { StockCalendarView } from './StockCalendarView';
import { AlertListView } from './AlertListView';
import { TaskReportApprovalModal } from '../components/TaskReportApprovalModal';

export const FleetView = () => {
  const { vehicles, tasks, staff, updateTask, addTask, contracts } = useApp();
  const [tab, setTab] = useState<FleetTab>('required');
  const [searchTerm, setSearchTerm] = useState('');
  const [fcView, setFcView] = useState<'list' | 'vehicle'>('vehicle');
  const [fcVehicleFilter, setFcVehicleFilter] = useState(false);
  const [expandedFcVehicleId, setExpandedFcVehicleId] = useState<string | null>(null);

  const [assignModal, setAssignModal] = useState<{
    vehicle: Vehicle;
    title: string;
    category: string;
    task?: ServiceTask;
    targetDate?: Date;
    targetSmr?: number;
  } | null>(null);

  // Assignment Modal Form State
  const [assignStaffId, setAssignStaffId] = useState<string>('');
  const [assignDate, setAssignDate] = useState<string>('');
  const [approvalModalTask, setApprovalModalTask] = useState<ServiceTask | null>(null);

  const handleAssignSave = () => {
    if (!assignModal) return;
    
    if (assignModal.task) {
      // Update existing task
      updateTask(assignModal.task.id, {
        staffIds: assignStaffId ? [assignStaffId] : undefined,
        startDate: assignDate ? new Date(assignDate).toISOString() : undefined,
        progress: assignStaffId ? (assignModal.task.progress === '承認待ち' ? '承認待ち' : '進行中') : '未着手'
      });
    } else {
      // Create new task
      addTask({
        vehicleId: assignModal.vehicle.id,
        targetModelName: assignModal.vehicle.modelName,
        title: assignModal.title,
        category: assignModal.category as any,
        urgency: '1ヶ月以内',
        progress: assignStaffId ? '進行中' : '未着手',
        deadline: assignModal.targetDate ? assignModal.targetDate.toISOString() : addDays(new Date(), 14).toISOString(),
        staffIds: assignStaffId ? [assignStaffId] : undefined,
        startDate: assignDate ? new Date(assignDate).toISOString() : undefined,
      });
    }
    setAssignModal(null);
  };

  const handleReportSubmit = () => {
    if (!assignModal || !assignModal.task) return;
    updateTask(assignModal.task.id, {
      staffIds: assignStaffId ? [assignStaffId] : undefined,
      startDate: assignDate ? new Date(assignDate).toISOString() : undefined,
      progress: '承認待ち'
    });
    setAssignModal(null);
  };

  const getEventStatus = (
    v: Vehicle,
    vTasks: ServiceTask[],
    expectedTitle: string,
    expectedCategory: string,
    targetDateStr?: string
  ) => {
    // Basic fuzzy match for title and exact for category
    const task = vTasks.find(t => t.category === expectedCategory && (expectedTitle === '' || t.title.includes(expectedTitle)));
    let statusId = 'none';
    if (task) {
      if (task.progress === '完了') statusId = 'completed';
      else if (task.progress === '承認待ち') statusId = 'pending_approval';
      else if (task.staffId || (task.staffIds && task.staffIds.length > 0)) statusId = 'assigned';
      else statusId = 'unassigned';
    } else {
      statusId = 'unassigned';
    }

    let isApproaching = false;
    let targetDate = targetDateStr ? new Date(targetDateStr) : undefined;
    if (targetDate && statusId !== 'completed') {
      const daysDiff = differenceInDays(targetDate, new Date());
      if (daysDiff <= 30) isApproaching = true; // approaching if within 30 days or overdue
    }

    return { task, statusId, isApproaching, targetDate };
  };

  const requiredData = useMemo(() => {
    return vehicles.map(v => {
      const vTasks = tasks.filter(t => t.vehicleId === v.id);
      return {
        v,
        receive: getEventStatus(v, vTasks, '受入', '受け入れ点検', v.arrivalDate),
        delivery: getEventStatus(v, vTasks, '納入', '納入作業', v.deliveryDate),
        patrol1m: getEventStatus(v, vTasks, '1ヶ月', '新車巡回', v.deliveryDate ? addMonths(new Date(v.deliveryDate), 1).toISOString() : undefined),
        patrol3m: getEventStatus(v, vTasks, '3ヶ月', '新車巡回', v.deliveryDate ? addMonths(new Date(v.deliveryDate), 3).toISOString() : undefined),
        patrol5m: getEventStatus(v, vTasks, '5ヶ月', '新車巡回', v.deliveryDate ? addMonths(new Date(v.deliveryDate), 5).toISOString() : undefined),
        patrol11m: getEventStatus(v, vTasks, '11ヶ月', '新車巡回', v.deliveryDate ? addMonths(new Date(v.deliveryDate), 11).toISOString() : undefined),
      };
    }).filter(d => {
      if (!searchTerm) return true;
      return (d.v.modelName + d.v.serialNumber + (d.v.customerName || '')).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [vehicles, tasks, searchTerm]);

  const fcTasks = useMemo(() => {
    return tasks.filter(t => t.category === 'フィールドキャンペーン').map(t => {
      const v = vehicles.find(vh => vh.id === t.vehicleId);
      return { task: t, vehicle: v };
    }).filter(d => {
      if (!searchTerm) return true;
      return d.vehicle && (d.vehicle.modelName + d.vehicle.serialNumber + (d.vehicle.customerName || '') + d.task.title).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [tasks, vehicles, searchTerm]);

  const fcVehicleStats = useMemo(() => {
    const stats: Record<string, {
      vehicle: Vehicle, 
      unexecutedCount: number, 
      overdueCount: number, 
      assignedCount: number, 
      completedAssignedCount: number,
      totalCount: number,
      tasks: ServiceTask[]
    }> = {};

    tasks.filter(t => t.category === 'フィールドキャンペーン').forEach(t => {
      const v = vehicles.find(vh => vh.id === t.vehicleId);
      if (!v) return;
      if (!stats[v.id]) {
        stats[v.id] = { vehicle: v, unexecutedCount: 0, overdueCount: 0, assignedCount: 0, completedAssignedCount: 0, totalCount: 0, tasks: [] };
      }
      
      stats[v.id].totalCount++;
      stats[v.id].tasks.push(t);

      const isCompleted = t.progress === '完了';
      const isAssigned = t.staffIds && t.staffIds.length > 0;
      
      if (!isCompleted) {
        stats[v.id].unexecutedCount++;
        const isOverdue = differenceInDays(new Date(t.deadline), new Date()) < 0;
        if (isOverdue) {
          stats[v.id].overdueCount++;
        }
      }

      if (isAssigned) {
        stats[v.id].assignedCount++;
        if (isCompleted) {
          stats[v.id].completedAssignedCount++;
        }
      }
    });

    let results = Object.values(stats);
    if (fcVehicleFilter) {
      results = results.filter(s => s.unexecutedCount > 0);
    }
    if (searchTerm) {
      results = results.filter(s => (s.vehicle.modelName + s.vehicle.serialNumber + (s.vehicle.customerName || '')).toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Sort by unexecutedCount (descending) then overdueCount (descending)
    return results.sort((a, b) => b.unexecutedCount - a.unexecutedCount || b.overdueCount - a.overdueCount);
  }, [tasks, vehicles, searchTerm, fcVehicleFilter]);

  const regularData = useMemo(() => {
    const data: any[] = [];
    vehicles.forEach(v => {
      const currentSmr = v.currentSmr || 0;
      const vTasks = tasks.filter(t => t.vehicleId === v.id);

      // Default 500H maintenance for all vehicles
      const interval = 500;
      const defaultTargetSmr = Math.ceil((currentSmr + 1) / interval) * interval;
      const defaultRemainingSmr = defaultTargetSmr - currentSmr;
      const defaultProgressPercentSmr = ((currentSmr % interval) / interval) * 100;
      const defaultMaintenanceTask = getEventStatus(v, vTasks, '', '500H 定期メンテナンス');
      
      data.push({
        v, currentSmr, 
        targetSmr: defaultTargetSmr, 
        remainingSmr: defaultRemainingSmr, 
        progressPercentSmr: defaultProgressPercentSmr, 
        remainingMonths: null,
        maintenanceTask: defaultMaintenanceTask, 
        isApproaching: defaultRemainingSmr <= 50, 
        contract: { id: 'default-500h', title: '500H 定期メンテナンス', rule: 'smr', smr: 500 }
      });

      if (v.contracts && v.contracts.length > 0) {
        v.contracts.forEach(vc => {
          const c = contracts.find(ct => ct.id === vc.contractId);
          if (!c || c.rule === 'none' || c.rule === 'custom') return;

        let remainingSmr: number | null = null;
        let targetSmr: number | null = null;
        let progressPercentSmr = 0;

        let remainingMonths: number | null = null;
        let targetDate: Date | null = null;
        let progressPercentMonths = 0;

        if (c.rule === 'smr' || c.rule === 'whichever_first') {
          if (c.smr) {
            const interval = c.smr;
            const smrPassed = currentSmr - vc.startSmr;
            const intervalsPassed = Math.max(0, Math.floor(smrPassed / interval));
            targetSmr = vc.startSmr + (intervalsPassed + 1) * interval;
            remainingSmr = targetSmr - currentSmr;
            progressPercentSmr = ((interval - Math.min(interval, remainingSmr)) / interval) * 100;
          }
        }

        if (c.rule === 'months' || c.rule === 'whichever_first') {
          if (c.months) {
            const intervalMonths = c.months;
            const start = new Date(vc.startDate);
            const now = new Date();
            const msPerMonth = 30.44 * 24 * 60 * 60 * 1000; // approximate month length
            const monthsPassed = (now.getTime() - start.getTime()) / msPerMonth;
            const intervalsPassed = Math.max(0, Math.floor(monthsPassed / intervalMonths));
            
            targetDate = new Date(start);
            targetDate.setMonth(start.getMonth() + (intervalsPassed + 1) * intervalMonths);
            
            remainingMonths = (targetDate.getTime() - now.getTime()) / msPerMonth;
            progressPercentMonths = ((intervalMonths - Math.min(intervalMonths, Math.max(0, remainingMonths))) / intervalMonths) * 100;
          }
        }

        const isApproachingSmr = remainingSmr !== null && remainingSmr <= 50;
        const isApproachingMonths = remainingMonths !== null && remainingMonths <= 1; // 1 month diff
        const isApproaching = isApproachingSmr || isApproachingMonths;
        const maintenanceTask = getEventStatus(v, vTasks, '', c.title);

        data.push({
          v,
          contract: c,
          currentSmr,
          targetSmr,
          remainingSmr,
          progressPercentSmr: isNaN(progressPercentSmr) ? 0 : progressPercentSmr,
          targetDate,
          remainingMonths: remainingMonths !== null ? Math.ceil(remainingMonths * 10) / 10 : null,
          progressPercentMonths: isNaN(progressPercentMonths) ? 0 : progressPercentMonths,
          isApproaching,
          maintenanceTask
        });
      });
      }
    });

    return data.filter(d => {
      if (!searchTerm) return true;
      return (d.v.modelName + d.v.serialNumber + (d.v.customerName || '') + (d.contract?.title || '')).toLowerCase().includes(searchTerm.toLowerCase());
    }).sort((a, b) => {
      const aMin = Math.min(
        a.remainingSmr !== null && a.contract.smr ? (a.remainingSmr / a.contract.smr) : 2, 
        a.remainingMonths !== null && a.contract.months ? (a.remainingMonths / a.contract.months) : 2
      );
      const bMin = Math.min(
        b.remainingSmr !== null && b.contract.smr ? (b.remainingSmr / b.contract.smr) : 2, 
        b.remainingMonths !== null && b.contract.months ? (b.remainingMonths / b.contract.months) : 2
      );
      return aMin - bMin;
    });
  }, [vehicles, tasks, searchTerm, contracts]);

  const EventCell = ({ event, title, category, v }: { event: any, title: string, category: string, v: Vehicle }) => {
    const isCompleted = event.statusId === 'completed';
    const isPendingApproval = event.statusId === 'pending_approval';
    const isAssigned = event.statusId === 'assigned';
    const isApproaching = event.isApproaching;

    const taskDateStr = event.task?.deadline ? event.task.deadline : event.task?.startDate;
    const dateValue = taskDateStr ? new Date(taskDateStr) : event.targetDate;
    const dateStr = dateValue ? format(dateValue, 'yyyy-MM-dd') : '未定';
    
    // Also derive staff name
    const staffName = event.task?.staffId 
       ? staff.find(s => s.id === event.task.staffId)?.name || '未定' 
       : '未定';

    const showDeliveryInfo = category === '新車巡回';
    const deliveryDateStr = v.deliveryDate ? format(new Date(v.deliveryDate), 'MM/dd') : '未定';

    const onClick = () => {
      if (isPendingApproval && event.task) {
        setApprovalModalTask(event.task);
      } else if (!isCompleted && !isPendingApproval) {
        setAssignModal({ vehicle: v, title, category, task: event.task, targetDate: event.targetDate });
        setAssignStaffId(event.task?.staffId || '');
        setAssignDate(event.task?.startDate?.split('T')[0] || '');
      }
    };

    if (isCompleted) {
      return (
        <div 
          onClick={onClick}
          className="flex flex-col items-center justify-center p-2 rounded-xl border border-emerald-200 bg-emerald-50/80 cursor-pointer hover:bg-emerald-100 transition h-full text-emerald-700 min-h-[95px]"
        >
          <CheckCircle className="w-5 h-5 mb-1 text-emerald-500 shrink-0" />
          <span className="text-[12px] font-bold">完了</span>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 font-mono">{dateStr}</span>
          <span className="text-[10px] text-emerald-700/80 mt-1 truncate w-full px-1 text-center">{staffName}</span>
          {showDeliveryInfo && <span className="text-[9px] text-emerald-600/60 mt-0.5">納期:{deliveryDateStr}</span>}
        </div>
      );
    }

    if (isPendingApproval) {
      return (
        <div 
          onClick={onClick}
          className="flex flex-col items-center justify-center p-2 rounded-xl border border-amber-300 bg-amber-50 cursor-pointer hover:bg-amber-100 transition h-full text-amber-800 min-h-[95px] shadow-sm relative"
        >
          <span className="text-[12px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded animate-pulse shadow-sm">承認待ち</span>
          <span className="text-[11px] font-bold mt-1.5 font-mono text-amber-900">{dateStr}</span>
          <span className="text-[10px] text-amber-700 mt-1 truncate w-full px-1 text-center font-bold">{staffName}</span>
          {showDeliveryInfo && <span className="text-[9px] text-amber-600/60 mt-0.5">納期:{deliveryDateStr}</span>}
        </div>
      );
    }

    if (isAssigned) {
       return (
         <div 
           onClick={onClick}
           className="flex flex-col items-center justify-center p-2 rounded-xl border border-indigo-200 bg-indigo-50/80 cursor-pointer hover:bg-indigo-100 transition h-full text-indigo-700 min-h-[95px] relative"
         >
           {isApproaching && (
             <div className="absolute -top-1 -right-1 bg-amber-500 w-3 h-3 rounded-full border-2 border-white animate-pulse"></div>
           )}
           <span className="text-[12px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded shadow-sm">アサイン済</span>
           <span className="text-[11px] font-bold mt-1.5 font-mono text-indigo-800">{dateStr}</span>
           <span className="text-[10px] text-indigo-600 mt-1 truncate w-full px-1 text-center font-bold">{staffName}</span>
           {showDeliveryInfo && <span className="text-[9px] text-indigo-600/60 mt-0.5">納期:{deliveryDateStr}</span>}
         </div>
       );
    }

    // Unassigned
    return (
      <div 
        onClick={onClick}
        className={cn(
          "flex flex-col items-center justify-center p-2 rounded-xl border cursor-pointer transition h-full min-h-[95px] relative",
          isApproaching 
            ? "border-amber-300 bg-amber-50/50 hover:bg-amber-100 text-amber-700" 
            : "border-dashed border-slate-300 bg-white hover:border-slate-400 text-slate-500"
        )}
      >
        {isApproaching ? (
           <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-1.5 flex items-center rounded shadow-sm"><AlertTriangle className="w-3 h-3 mr-0.5"/>近接</span>
        ) : (
           <span className="text-[11px] font-bold text-slate-500">未実施</span>
        )}
        <span className={cn("text-[11px] font-bold mt-1.5 font-mono", isApproaching ? "text-amber-800" : "text-slate-600")}>{dateStr}</span>
        <span className={cn("text-[10px] mt-1 truncate w-full px-1 text-center font-bold", isApproaching ? "text-amber-700" : "text-slate-500")}>担当: 未定</span>
        {showDeliveryInfo && <span className={cn("text-[9px] mt-0.5", isApproaching ? "text-amber-600/70" : "text-slate-400")}>納期:{deliveryDateStr}</span>}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4 md:p-6 overflow-hidden">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 shrink-0">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center">
          <Calendar className="w-6 h-6 mr-3 text-indigo-600" />
          イベント管理
        </h1>
        
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="車両、顧客名で絞り込み..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition shadow-sm font-medium text-slate-700"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex border-b border-slate-200 mb-6 shrink-0 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setTab('required')}
          className={cn("px-4 md:px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors", tab === 'required' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300')}
        >
          納入/納入後イベント管理
        </button>
        <button
          onClick={() => setTab('stock_calendar')}
          className={cn("px-4 md:px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors", tab === 'stock_calendar' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300')}
        >
          在庫点検カレンダー
        </button>
        <button
          onClick={() => setTab('fc')}
          className={cn("px-4 md:px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors", tab === 'fc' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300')}
        >
          FC管理
        </button>
        <button
          onClick={() => setTab('regular')}
          className={cn("px-4 md:px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors", tab === 'regular' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300')}
        >
          定期イベント管理
        </button>
        <button
          onClick={() => setTab('alerts')}
          className={cn("px-4 md:px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors flex items-center", tab === 'alerts' ? 'border-red-600 text-red-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300')}
        >
          <AlertTriangle className="w-4 h-4 mr-1.5" />
          アラートリスト
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col min-h-0">
        {tab === 'required' && (
          <div className="overflow-auto flex-1">
            <table className="w-full text-sm text-center border-collapse whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-700 sticky top-0 shadow-[0_1px_0_rgba(200,200,200,1)] z-10">
                <tr>
                  <th className="px-4 py-4 text-left font-bold text-xs tracking-wider border-b border-slate-200 sticky left-0 bg-slate-50 z-20">車両 / 顧客名</th>
                  <th className="px-3 py-4 font-bold text-xs tracking-wider border-b border-slate-200">受入作業</th>
                  <th className="px-3 py-4 font-bold text-xs tracking-wider border-b border-slate-200">納入作業</th>
                  <th className="px-3 py-4 font-bold text-xs tracking-wider border-b border-slate-200">1ヶ月目 新車巡回</th>
                  <th className="px-3 py-4 font-bold text-xs tracking-wider border-b border-slate-200">3ヶ月目 新車巡回</th>
                  <th className="px-3 py-4 font-bold text-xs tracking-wider border-b border-slate-200">5ヶ月目 新車巡回</th>
                  <th className="px-3 py-4 font-bold text-xs tracking-wider border-b border-slate-200">11ヶ月目 新車巡回</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requiredData.map((d) => (
                  <tr key={d.v.id} className="hover:bg-indigo-50/30 transition group">
                    <td className="px-4 py-3 text-left sticky left-0 bg-white group-hover:bg-indigo-50/10 z-10 border-r border-slate-100">
                      <div className="font-bold text-slate-900">{d.v.modelName} <span className="text-slate-400 font-normal text-xs ml-1">{d.v.serialNumber}</span></div>
                      <div className="text-slate-500 mt-0.5 text-xs font-medium">{d.v.customerName || <span className="text-slate-300">在庫</span>}</div>
                    </td>
                    <td className="px-3 py-3"><EventCell event={d.receive} title="受入作業" category="受け入れ点検" v={d.v} /></td>
                    <td className="px-3 py-3"><EventCell event={d.delivery} title="納入作業" category="納入作業" v={d.v} /></td>
                    <td className="px-3 py-3 border-l border-slate-100/50 bg-slate-50/30"><EventCell event={d.patrol1m} title="1ヶ月目 新車巡回" category="新車巡回" v={d.v} /></td>
                    <td className="px-3 py-3 bg-slate-50/30"><EventCell event={d.patrol3m} title="3ヶ月目 新車巡回" category="新車巡回" v={d.v} /></td>
                    <td className="px-3 py-3 bg-slate-50/30"><EventCell event={d.patrol5m} title="5ヶ月目 新車巡回" category="新車巡回" v={d.v} /></td>
                    <td className="px-3 py-3 bg-slate-50/30"><EventCell event={d.patrol11m} title="11ヶ月目 新車巡回" category="新車巡回" v={d.v} /></td>
                  </tr>
                ))}
                {requiredData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-slate-400 font-bold text-center">該当する車両がありません</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'fc' && (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="px-6 py-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50">
              <div className="flex bg-slate-200 p-1 rounded-lg">
                <button
                  onClick={() => setFcView('vehicle')}
                  className={cn("px-4 py-1.5 text-sm font-bold rounded-md transition-all", fcView === 'vehicle' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                >
                  車両リスト
                </button>
                <button
                  onClick={() => setFcView('list')}
                  className={cn("px-4 py-1.5 text-sm font-bold rounded-md transition-all", fcView === 'list' ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                >
                  FCリスト
                </button>
              </div>
              
              {fcView === 'vehicle' && (
                <label className="flex items-center space-x-2 text-sm font-bold text-slate-700 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={fcVehicleFilter} 
                    onChange={e => setFcVehicleFilter(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>未実施FCありのみ表示</span>
                </label>
              )}
            </div>

            <div className="overflow-auto flex-1 p-6">
              {fcView === 'list' ? (
                <div className="grid gap-4">
                  {fcTasks.map(({ task, vehicle }) => {
                    if (!vehicle) return null;
                    const isApproaching = differenceInDays(new Date(task.deadline), new Date()) <= 30 && task.progress !== '完了';
                    
                    return (
                      <div key={task.id} className="bg-white border resize-none border-slate-200 p-5 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm hover:border-indigo-300 transition group">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-black border border-indigo-200">FIELD CAMPAIGN</span>
                            {isApproaching && (
                              <span className="text-indigo-600 font-bold text-xs flex items-center"><AlertTriangle className="w-3 h-3 mr-1" />実施近接・超過</span>
                            )}
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 mb-1">{task.title}</h3>
                          <div className="text-sm font-medium text-slate-500 flex items-center gap-3">
                            <span className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{vehicle.modelName} ({vehicle.serialNumber})</span>
                            {vehicle.customerName && <span>顧客: {vehicle.customerName}</span>}
                            <span>期限: <span className="font-bold text-slate-700">{format(new Date(task.deadline), 'yyyy/MM/dd')}</span></span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 shrink-0 w-full md:w-auto">
                          <div className="text-right flex-1 md:flex-none">
                            <div className="text-xs text-slate-400 font-bold mb-1">ステータス</div>
                            <div className="font-bold text-slate-800 flex items-center justify-end">
                               {task.progress === '完了' ? <span className="text-indigo-600 flex items-center"><CheckCircle className="w-4 h-4 mr-1"/>完了</span> : 
                                task.staffIds && task.staffIds.length > 0 ? <span className="text-indigo-400">アサイン済</span> : 
                                <span className="text-slate-500">未実施</span>}
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setAssignModal({ vehicle, title: task.title, category: 'フィールドキャンペーン', task, targetDate: new Date(task.deadline) });
                              setAssignStaffId(task.staffIds?.[0] || '');
                              setAssignDate(task.startDate?.split('T')[0] || '');
                            }}
                            disabled={task.progress === '完了'}
                            className="px-4 py-2 bg-slate-900 text-white font-bold text-sm rounded-lg hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                          >
                            詳細・アサイン
                          </button>
                        </div>
                      </div>
                    )
                  })}
                  {fcTasks.length === 0 && (
                    <div className="text-center py-12 text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-xl">
                      FC対象のタスクはありません
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {/* Table Header */}
                  <div className="hidden lg:grid grid-cols-[300px_1fr_120px_120px_50px] gap-6 px-5 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <div>車両情報</div>
                    <div>進捗状況</div>
                    <div className="text-right">未実施</div>
                    <div className="text-right">期限超過</div>
                    <div></div>
                  </div>

                  {fcVehicleStats.map(stat => {
                    const isExpanded = expandedFcVehicleId === stat.vehicle.id;
                    
                    // Progress calculations
                    const pctCompleted = stat.totalCount > 0 ? (stat.completedAssignedCount / stat.totalCount) * 100 : 0;
                    const pctAssigned = stat.totalCount > 0 ? ((stat.assignedCount - stat.completedAssignedCount) / stat.totalCount) * 100 : 0;
                    const pctOverdue = stat.totalCount > 0 ? (stat.overdueCount / stat.totalCount) * 100 : 0;
                    const pctUnassigned = stat.totalCount > 0 ? ((stat.unexecutedCount - stat.overdueCount - (stat.assignedCount - stat.completedAssignedCount)) / stat.totalCount) * 100 : 0;

                    return (
                      <div key={stat.vehicle.id} className={cn("relative bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] transition-all overflow-hidden border border-slate-100 group", isExpanded ? "ring-2 ring-indigo-500 shadow-md" : "hover:shadow-md hover:border-indigo-200")}>
                        {/* Status Left Border */}
                        <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", stat.unexecutedCount > 0 || stat.overdueCount > 0 ? "bg-indigo-400" : "bg-indigo-600")} />
                        
                        {/* Summary Row (Clickable) */}
                        <div 
                          className="pl-6 pr-4 py-5 flex flex-col lg:flex-row items-start lg:items-center gap-6 cursor-pointer bg-white group-hover:bg-slate-50/30 transition-colors"
                          onClick={() => setExpandedFcVehicleId(isExpanded ? null : stat.vehicle.id)}
                        >
                          {/* 1. Vehicle Info */}
                          <div className="flex flex-col min-w-[280px]">
                            <div className="flex items-center gap-3 mb-1.5">
                              <span className="font-black text-lg text-slate-800 tracking-tight">{stat.vehicle.modelName}</span>
                              <span className="text-slate-400 font-mono text-sm bg-slate-100 px-2 py-0.5 rounded-md">{stat.vehicle.serialNumber}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              {stat.vehicle.customerName ? (
                                <span className="flex items-center text-slate-600 text-sm font-medium">
                                  <UserPlus className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                  {stat.vehicle.customerName}
                                </span>
                              ) : (
                                <span className="text-slate-300 text-sm">顧客未設定</span>
                              )}
                              {stat.unexecutedCount > 0 && <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ring-indigo-200 ring-inset">未実施あり</span>}
                            </div>
                          </div>

                          {/* 2. Progress & Stats Bento Box */}
                          <div className="flex-1 w-full grid grid-cols-3 lg:grid-cols-[1fr_auto_auto] gap-4 lg:gap-8 items-center bg-slate-50/50 rounded-xl p-3 lg:p-0 lg:bg-transparent">
                            
                            {/* Progress Bar */}
                            <div className="col-span-3 lg:col-span-1 flex flex-col justify-center">
                              <div className="flex items-end justify-between mb-2">
                                <span className="text-xs font-bold text-slate-500">対象 <span className="text-slate-700 text-sm">{stat.totalCount}</span> 件</span>
                                <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">{stat.completedAssignedCount}件 完了</span>
                              </div>
                              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                                <div style={{ width: `${pctCompleted}%` }} className="bg-indigo-500 transition-all duration-500" title="完了" />
                              </div>
                            </div>

                            {/* Unexecuted Counter */}
                            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-sm border border-slate-100 min-w-[100px]">
                               <span className="text-[10px] font-bold text-slate-400 mb-1">未実施</span>
                               <span className={cn("text-2xl leading-none font-black font-mono", stat.unexecutedCount > 0 ? "text-indigo-600" : "text-slate-300")}>
                                 {stat.unexecutedCount}
                               </span>
                            </div>

                            {/* Overdue Counter */}
                            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-sm border border-slate-100 min-w-[100px]">
                               <span className="text-[10px] font-bold text-slate-400 mb-1 flex items-center">
                                 {stat.overdueCount > 0 && <AlertTriangle className="w-3 h-3 text-indigo-500 mr-1" />} 期限超過
                               </span>
                               <span className={cn("text-2xl leading-none font-black font-mono", stat.overdueCount > 0 ? "text-indigo-600" : "text-slate-300")}>
                                 {stat.overdueCount}
                               </span>
                            </div>

                          </div>

                          {/* 5. Chevron */}
                          <div className="hidden lg:flex justify-end pl-4">
                            <div className={cn("p-2 rounded-full transition-colors border shadow-sm", isExpanded ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-400 border-slate-200 group-hover:border-indigo-300 group-hover:text-indigo-600")}>
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Tasks List */}
                        {isExpanded && (
                          <div className="bg-slate-50/80 p-5 lg:p-6 border-t border-slate-100">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-black text-slate-800 flex items-center">
                                <div className="w-1.5 h-4 bg-indigo-500 rounded-full mr-2" />
                                対象フィールドキャンペーン
                                <span className="ml-2 bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-bold">{stat.tasks.length}件</span>
                              </h4>
                            </div>
                            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                              {stat.tasks.map(task => {
                                const isApproaching = differenceInDays(new Date(task.deadline), new Date()) <= 30 && task.progress !== '完了';
                                return (
                                  <div key={task.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-4 shadow-sm hover:shadow hover:border-indigo-300 transition group/task">
                                     <div>
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-2">
                                            {task.progress === '完了' ? (
                                              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-1 rounded flex items-center"><CheckCircle className="w-3 h-3 mr-1"/>完了</span>
                                            ) : task.staffIds && task.staffIds.length > 0 ? (
                                              <span className="text-[10px] font-bold border border-indigo-200 text-indigo-600 bg-white px-2 py-1 rounded">アサイン済</span>
                                            ) : (
                                              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded">未実施</span>
                                            )}
                                            {isApproaching && <span className="text-[10px] font-bold text-indigo-600 flex items-center bg-indigo-50 px-2 py-1 rounded"><AlertTriangle className="w-3 h-3 mr-1" />近接/超過</span>}
                                          </div>
                                          <div className="text-xs text-slate-500 font-mono bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                            期限: <span className={cn("font-bold ml-1", isApproaching ? "text-indigo-700" : "text-slate-700")}>{format(new Date(task.deadline), 'yyyy/MM/dd')}</span>
                                          </div>
                                        </div>
                                        <div className="font-bold text-slate-800 text-sm mt-1 group-hover/task:text-indigo-700 transition-colors">{task.title}</div>
                                     </div>
                                     <button
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         setAssignModal({ vehicle: stat.vehicle, title: task.title, category: 'フィールドキャンペーン', task, targetDate: new Date(task.deadline) });
                                         setAssignStaffId(task.staffIds?.[0] || '');
                                         setAssignDate(task.startDate?.split('T')[0] || '');
                                       }}
                                       disabled={task.progress === '完了'}
                                       className="w-full px-4 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
                                     >
                                       {task.progress === '完了' ? (
                                         <><CheckCircle className="w-4 h-4" /> 完了済み</>
                                       ) : (
                                         <><Calendar className="w-4 h-4" /> 詳細・アサイン</>
                                       )}
                                     </button>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {fcVehicleStats.length === 0 && (
                    <div className="text-center py-12 text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-xl">
                      該当する車両がありません
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'regular' && (
          <div className="overflow-auto flex-1 p-6">
            <div className="grid gap-5">
              {regularData.map((d) => {
                const isApproaching = d.isApproaching;
                return (
                  <div key={`${d.v.id}-${d.contract?.id || 'default'}`} className="bg-white border resize-none border-slate-200 p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm hover:border-indigo-300 transition group">
                    <div className="w-full md:w-1/3 shrink-0 flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-lg text-slate-800">{d.v.modelName}</span>
                        <span className="text-slate-400 font-mono text-sm">{d.v.serialNumber}</span>
                      </div>
                      {d.v.customerName && <div className="text-sm font-bold text-slate-500 mb-2">{d.v.customerName}</div>}
                    </div>
                    
                    <div className="flex-1 w-full flex flex-col justify-center px-4">
                      <div className="text-xs font-bold text-slate-500 mb-2 pb-1 border-b">
                        {d.contract?.title || '定期点検'}
                        {d.contract?.rule === 'whichever_first' && ` (${d.contract?.smr}H または ${d.contract?.months}ヶ月 の早い方)`}
                        {d.contract?.rule === 'smr' && ` (${d.contract?.smr}H 毎)`}
                        {d.contract?.rule === 'months' && ` (${d.contract?.months}ヶ月 毎)`}
                      </div>

                      {d.remainingSmr !== null && (
                        <div className={cn("mb-2", d.remainingMonths !== null ? "" : "mb-0")}>
                          <div className="flex justify-between items-end mb-1">
                            <div className="font-bold text-slate-600 text-xs">
                              SMR ({d.targetSmr}H): 現在 <span className="text-slate-900 font-bold">{d.currentSmr}</span>H
                            </div>
                            <div className={cn("text-right text-xs font-black flex items-center", d.remainingSmr <= 50 ? "text-amber-600 animate-pulse" : "text-indigo-600")}>
                              残り {d.remainingSmr} H {d.remainingSmr <= 50 && <AlertTriangle className="w-3 h-3 ml-1" />}
                            </div>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                            <div 
                              className={cn("h-full transition-all duration-1000", d.remainingSmr <= 50 ? "bg-amber-500" : "bg-indigo-500")}
                              style={{ width: `${Math.max(2, d.progressPercentSmr)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {d.remainingMonths !== null && (
                        <div>
                          <div className="flex justify-between items-end mb-1">
                            <div className="font-bold text-slate-600 text-xs">
                              期間 ({d.targetDate ? format(d.targetDate, 'yyyy/MM') : ''}):
                            </div>
                            <div className={cn("text-right text-xs font-black flex items-center", d.remainingMonths <= 1 ? "text-amber-600 animate-pulse" : "text-indigo-600")}>
                              残り {d.remainingMonths} ヶ月 {d.remainingMonths <= 1 && <AlertTriangle className="w-3 h-3 ml-1" />}
                            </div>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                            <div 
                              className={cn("h-full transition-all duration-1000", d.remainingMonths <= 1 ? "bg-amber-500" : "bg-indigo-500")}
                              style={{ width: `${Math.max(2, d.progressPercentMonths)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="w-full md:w-auto shrink-0 flex justify-end">
                      <button 
                        onClick={() => {
                          setAssignModal({ vehicle: d.v, title: d.contract?.title || '定期点検', category: '定期点検', task: d.maintenanceTask.task, targetSmr: d.targetSmr });
                          setAssignStaffId(d.maintenanceTask.task?.staffId || '');
                          setAssignDate(d.maintenanceTask.task?.startDate?.split('T')[0] || '');
                        }}
                        className="px-6 py-2.5 bg-white border-2 border-indigo-600 text-indigo-700 font-black text-sm rounded-lg hover:bg-indigo-50 transition shadow-sm w-full md:w-auto"
                      >
                        作業アサイン
                      </button>
                    </div>
                  </div>
                )
              })}
              {regularData.length === 0 && (
                <div className="text-center py-12 text-slate-400 font-bold border-2 border-dashed border-slate-200 rounded-xl">
                  定期点検対象の車両がありません
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'stock_calendar' && (
          <div className="flex-1 overflow-auto bg-slate-50/50 p-6">
             <StockCalendarView isEmbedded={true} />
          </div>
        )}
        {tab === 'alerts' && (
          <div className="flex-1 overflow-auto h-full">
            <AlertListView />
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setAssignModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
             <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
               <h3 className="font-black text-xl text-slate-800 flex items-center">
                 <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                 イベント詳細とアサイン
               </h3>
               <button onClick={() => setAssignModal(null)} className="text-slate-400 hover:text-slate-600 bg-slate-200/50 p-2 rounded-full hover:bg-slate-200 transition">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="p-6 space-y-6">
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                  <div className="text-xs font-bold text-indigo-400 mb-1">{assignModal.category}</div>
                  <div className="text-lg font-black text-indigo-900 mb-2">{assignModal.title}</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-white text-slate-700 border border-slate-200 px-2 py-1 rounded text-xs font-bold shadow-sm">
                      車両: {assignModal.vehicle.modelName} ({assignModal.vehicle.serialNumber})
                    </span>
                    {assignModal.targetDate && (
                      <span className="bg-white text-slate-700 border border-slate-200 px-2 py-1 rounded text-xs font-bold shadow-sm">
                        予定期限: {format(assignModal.targetDate, 'yyyy/MM/dd')}
                      </span>
                    )}
                    {assignModal.targetSmr && (
                      <span className="bg-white text-slate-700 border border-slate-200 px-2 py-1 rounded text-xs font-bold shadow-sm">
                        目標SMR: {assignModal.targetSmr} H
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-slate-400" />
                      実施予定日
                    </label>
                    <input 
                      type="date"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={assignDate}
                      onChange={e => setAssignDate(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center">
                      <UserPlus className="w-4 h-4 mr-1 text-slate-400" />
                      担当者アサイン
                    </label>
                    <select 
                      className="w-full border border-slate-300 rounded-lg px-4 py-2.5 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={assignStaffId}
                      onChange={e => setAssignStaffId(e.target.value)}
                    >
                      <option value="">未定 (アサインしない)</option>
                      {staff.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                      ))}
                    </select>
                  </div>
                </div>
             </div>
             
             <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
               <button 
                 onClick={() => setAssignModal(null)}
                 className="px-5 py-2.5 text-slate-600 font-bold rounded-lg hover:bg-slate-200 transition"
               >
                 キャンセル
               </button>
               <button 
                 onClick={handleAssignSave}
                 className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition shadow-sm"
               >
                 保存する
               </button>
               {assignModal.task && assignModal.task.progress !== '承認待ち' && (
                 <button 
                   onClick={handleReportSubmit}
                   className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-md shadow-indigo-200 flex items-center"
                 >
                   <CheckCircle className="w-4 h-4 mr-2" />
                   完了報告 (承認待ちへ)
                 </button>
               )}
             </div>
          </div>
        </div>
      )}

      {approvalModalTask && (
        <TaskReportApprovalModal
          task={approvalModalTask}
          onClose={() => setApprovalModalTask(null)}
        />
      )}

    </div>
  );
};

