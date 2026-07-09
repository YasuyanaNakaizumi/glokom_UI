import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Calendar, Search, CheckCircle2, AlertTriangle, Clock, Package, ChevronLeft, ChevronRight, X, User, RefreshCw, MessageSquare, Send, Trash2, AlertCircle, CheckCircle, Save, ShieldCheck, ShieldAlert, Truck, Box, Info } from 'lucide-react';
import { addMonths, subMonths, format, startOfMonth, isSameMonth, isBefore, isAfter, differenceInMonths } from 'date-fns';
import { cn } from '../lib/utils';
import { ServiceTask, Vehicle } from '../types';
import { TaskConfigSection } from '../components/AddDeliveryModal';

export const StockCalendarView = ({ isEmbedded = false }: { isEmbedded?: boolean }) => {
  const { vehicles, tasks, setView, t, staff } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState(startOfMonth(new Date()));
  const [selectedTaskContext, setSelectedTaskContext] = useState<{vehicleId: string, month: Date, taskId?: string} | null>(null);
  
  const [inventoryType, setInventoryType] = useState<'vehicle' | 'parts'>('vehicle');

  const [assignModalData, setAssignModalData] = useState<{type: 'vehicle' | 'parts', id: string, name: string} | null>(null);
  const [parts, setParts] = useState([
    { id: 'p1', name: 'エンジンオイル 10W-30', qty: 50, arrivalDate: '2023-10-01' },
    { id: 'p2', name: 'オイルフィルター X-12', qty: 120, arrivalDate: '2023-11-15' },
    { id: 'p3', name: 'ノーパンクタイヤ 6.00-9', qty: 24, arrivalDate: '2023-12-05' },
    { id: 'p4', name: 'バッテリー 48V', qty: 5, arrivalDate: '2024-01-20' },
  ]);

  // Target vehicles: 在庫, 点検中, 搬入済, 出荷済, 点検完了 (exclude 納入済)
  const targetVehicles = vehicles.filter(v => 
    ['在庫', '点検中', '搬入済', '出荷済', '点検完了', '受け入れ予定'].includes(v.status)
  ).filter(v => 
    (v.modelName + v.serialNumber).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const targetParts = parts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

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

  const renderCellStatus = (task: ServiceTask | undefined, targetMonth: Date, vehicle: Vehicle) => {
    const staffName = task?.staffId ? staff.find(s => s.id === task.staffId)?.name || '未定' : '未定';
    const mockDeadline = format(new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 25), 'yyyy-MM-dd');

    if (!task) {
      return (
        <div 
          onClick={() => setSelectedTaskContext({ vehicleId: vehicle.id, month: targetMonth })}
          className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border border-dashed border-slate-300 bg-white hover:border-slate-400 cursor-pointer transition h-full text-slate-500 min-h-[90px]"
        >
          <Calendar className="w-5 h-5 mb-1 text-slate-400" />
          <span className="text-[13px] font-bold text-slate-600">予定日</span>
          <span className="text-[11px] font-bold mt-1 font-mono text-slate-600">{mockDeadline}</span>
          <span className="text-[10px] text-slate-500 mt-1 truncate max-w-full px-1">{staffName}</span>
        </div>
      );
    }
    
    if (task.progress === '完了') {
      return (
        <div 
          onClick={() => setSelectedTaskContext({ vehicleId: vehicle.id, month: targetMonth, taskId: task.id })}
          className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border border-emerald-200 bg-emerald-50/80 cursor-pointer hover:bg-emerald-100 transition h-full text-emerald-700 min-h-[90px]"
        >
          <CheckCircle2 className="w-5 h-5 mb-1 text-emerald-500" />
          <span className="text-[13px] font-bold">点検実績</span>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 font-mono">{format(new Date(task.deadline), 'yyyy-MM-dd')}</span>
          <span className="text-[10px] text-emerald-700/80 mt-1 truncate max-w-full px-1">{staffName}</span>
        </div>
      );
    }
    
    const isOverdue = isBefore(new Date(task.deadline), new Date());

    if (isOverdue) {
      return (
        <div 
          onClick={() => setSelectedTaskContext({ vehicleId: vehicle.id, month: targetMonth, taskId: task.id })}
          className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border border-red-200 bg-red-50/80 cursor-pointer hover:bg-red-100 transition h-full text-red-700 min-h-[90px]"
        >
          <AlertTriangle className="w-5 h-5 mb-1 text-red-500" />
          <span className="text-[13px] font-bold">期限切れ</span>
          <span className="text-[11px] text-red-600 font-bold mt-1 font-mono">{format(new Date(task.deadline), 'yyyy-MM-dd')}</span>
          <span className="text-[10px] text-red-700/80 mt-1 truncate max-w-full px-1">{staffName}</span>
        </div>
      );
    }

    return (
      <div 
        onClick={() => setSelectedTaskContext({ vehicleId: vehicle.id, month: targetMonth, taskId: task.id })}
        className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border border-dashed border-slate-300 bg-white hover:border-slate-400 cursor-pointer transition h-full text-slate-500 min-h-[90px]"
      >
        <Calendar className="w-5 h-5 mb-1 text-slate-400" />
        <span className="text-[13px] font-bold text-slate-600">予定日</span>
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
            ホームへ戻る
          </button>
          <div>
            <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 mb-2 border border-emerald-100">
              在庫・納車待機 車両管理
            </div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center">
              <Calendar className="w-6 h-6 mr-2 text-emerald-600" />
              在庫点検カレンダー
            </h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">車両ごとの定期的な在庫維持点検状況を月次マトリクスで確認します。実績セルをクリックすると詳細を確認できます。</p>
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
              placeholder="機種や型式で検索..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>
          
          <div className="flex bg-white rounded-lg border border-slate-300 p-0.5">
            <button 
              onClick={() => setInventoryType('vehicle')}
              className={cn("px-3 py-1.5 text-sm font-bold rounded-md flex items-center transition", inventoryType === 'vehicle' ? "bg-emerald-100 text-emerald-800" : "text-slate-500 hover:text-slate-700")}
            >
              <Truck className="w-4 h-4 mr-1.5" />
              車両在庫
            </button>
            <button 
              onClick={() => setInventoryType('parts')}
              className={cn("px-3 py-1.5 text-sm font-bold rounded-md flex items-center transition", inventoryType === 'parts' ? "bg-emerald-100 text-emerald-800" : "text-slate-500 hover:text-slate-700")}
            >
              <Box className="w-4 h-4 mr-1.5" />
              部品在庫
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
              {format(currentDate, 'yyyy年M月')}
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
              今月
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
                  在庫車両・モデル
                </th>
                {months.map((m, i) => {
                  const isCurrent = i === 1;
                  return (
                    <th key={i} className={cn(
                      "p-0 text-center relative font-bold text-slate-800 border-r last:border-r-0",
                      isCurrent ? "bg-emerald-50/50" : "bg-slate-50"
                    )}>
                      <div className={cn(
                        "py-4 flex flex-col items-center justify-center h-full",
                        isCurrent ? "border-b-[3px] border-emerald-400" : "border-b-[3px] border-transparent"
                      )}>
                        <span className="text-[15px]">{format(m, 'yyyy年M月')}</span>
                        {isCurrent && <span className="text-[10px] text-emerald-600 font-bold tracking-wider mt-0.5 uppercase">Current Month</span>}
                      </div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="bg-white">
              {targetVehicles.map((v, rowIndex) => (
                <tr key={v.id} className="transition border-t border-slate-200">
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
                        <span className={cn(
                          "inline-flex px-2 py-0.5 text-[11px] font-bold rounded-full border",
                          v.status === '在庫' ? "border-green-200 text-green-700 bg-green-50" :
                          v.status === '点検中' ? "border-blue-200 text-blue-700 bg-blue-50" :
                          v.status === '出荷済' || v.status === '搬入済' ? "border-slate-200 text-slate-700 bg-slate-50" :
                          "border-gray-200 text-gray-700 bg-gray-50"
                        )}>
                          {v.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center font-medium mt-1.5">
                        <Package className="w-3.5 h-3.5 mr-1" />
                        入庫: {format(new Date(v.arrivalDate || new Date()), 'yyyy-MM-dd')}
                      </div>
                      <div className="text-xs text-indigo-500 mt-2 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                        <Calendar className="w-3 h-3 mr-1" /> アサインする
                      </div>
                    </div>
                  </td>
                  {months.map((m, i) => {
                    const task = getTaskForMonth(v.id, m);
                    const isCurrent = i === 1;
                    return (
                      <td key={i} className={cn(
                        "p-3 align-middle border-r last:border-r-0",
                        isCurrent ? "bg-emerald-50/10" : ""
                      )}>
                        {renderCellStatus(task, m, v)}
                      </td>
                    )
                  })}
                </tr>
              ))}
              {targetVehicles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-medium">
                    該当する車両データがありません
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
                <th className="px-5 py-4 font-bold text-slate-500 text-xs">部品名</th>
                <th className="px-5 py-4 font-bold text-slate-500 text-xs text-right">在庫数</th>
                <th className="px-5 py-4 font-bold text-slate-500 text-xs">入庫日</th>
                <th className="px-5 py-4 font-bold text-slate-500 text-xs text-right">アクション</th>
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
                      アサインする
                    </button>
                  </td>
                </tr>
              ))}
              {targetParts.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">
                    該当する部品データがありません
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
              <h3 className="font-bold text-slate-800">{assignModalData.name} の操作</h3>
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
                        setSelectedTaskContext({ vehicleId: assignModalData.id, month: new Date() });
                      } else {
                        alert('部品の在庫点検をアサインしました');
                      }
                      setAssignModalData(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    在庫点検のアサイン
                  </button>
                  <button 
                    onClick={() => {
                      alert('納入のアサイン画面を開きます');
                      setAssignModalData(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    <Truck className="w-5 h-5" />
                    納入のアサイン
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      if (assignModalData.type === 'vehicle') {
                        setSelectedTaskContext({ vehicleId: assignModalData.id, month: new Date() });
                      } else {
                        alert('部品の在庫点検をアサインしました');
                      }
                      setAssignModalData(null);
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <CheckCircle className="w-5 h-5" />
                    在庫点検のアサイン
                  </button>
                  <button 
                    onClick={() => removePart(assignModalData.id)}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 font-bold rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    販売完了 (登録を消す)
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

function StockInspectionModal({ context, onClose }: { context: {vehicleId: string, month: Date, taskId?: string}, onClose: () => void }) {
  const { vehicles, tasks, staff, tools, contracts, addTask, updateTask, deleteTask } = useApp();
  const selectedVehicle = vehicles.find(v => v.id === context.vehicleId);
  const existingTask = context.taskId ? tasks.find(t => t.id === context.taskId) : null;
  
  const mockDeadline = format(new Date(context.month.getFullYear(), context.month.getMonth(), 25), 'yyyy-MM-dd');
  const [date, setDate] = React.useState(existingTask?.deadline ? format(new Date(existingTask.deadline), 'yyyy-MM-dd') : mockDeadline);
  const [staffId, setStaffId] = React.useState(existingTask?.staffId || '');
  const [isRegular, setIsRegular] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  if (!selectedVehicle) return null;

  const handleSave = () => {
    if (existingTask) {
      updateTask(existingTask.id, {
        deadline: new Date(date).toISOString(),
        staffId: staffId || undefined,
        progress: staffId ? (existingTask.progress === '完了' ? '完了' : '進行中') : '未着手'
      });
    } else {
      addTask({
        vehicleId: selectedVehicle.id,
        targetModelName: selectedVehicle.modelName,
        title: `${format(context.month, 'M月')} 在庫点検`,
        category: '在庫点検',
        progress: staffId ? '進行中' : '未着手',
        urgency: '1ヶ月以内',
        deadline: new Date(date).toISOString(),
        staffId: staffId || undefined,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex justify-center items-center z-[60] p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-indigo-500" />
              {format(context.month, 'yyyy年 M月')} 在庫維持点検
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-mono">{selectedVehicle.modelName} ({selectedVehicle.serialNumber})</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition p-2 rounded-full hover:bg-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="space-y-6">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex items-start">
              <Info className="w-5 h-5 text-indigo-500 mr-3 shrink-0 mt-0.5" />
              <div className="text-sm text-indigo-900">
                <p className="font-bold mb-1">在庫維持点検について</p>
                <p>長期在庫車両に対する定期的な動作確認、バッテリー充電、外観確認を実施します。アサインするとタスク一覧に反映されます。</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">点検予定日 (締切)</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">担当者アサイン</label>
                <select 
                  value={staffId}
                  onChange={e => setStaffId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="">未定 (アサインなし)</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
              </div>
            </div>
            
            <TaskConfigSection 
              task={{
                name: '在庫維持点検',
                reportFormatId: 'stock_inspection',
                paidServiceId: ''
              }}
              updateTask={() => {}}
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-between shrink-0">
          {existingTask ? (
            <button 
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              削除
            </button>
          ) : (
            <div></div>
          )}
          <div className="flex space-x-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition"
            >
              キャンセル
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm"
            >
              保存してアサイン
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
