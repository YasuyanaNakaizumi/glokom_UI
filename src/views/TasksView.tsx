import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Search, CheckCircle, Trash2, Edit, Users, FileSignature, CheckSquare, Square, ClipboardList, ChevronLeft, ChevronRight, FileText, ChevronDown } from 'lucide-react';
import { ServiceTask, ServiceCategory, Urgency, TaskProgress } from '../types';
import { cn } from '../lib/utils';
import { format, addMonths, subMonths } from 'date-fns';
import { EditTaskModal } from '../components/EditTaskModal';
import { TaskReportApprovalModal } from '../components/TaskReportApprovalModal';

export const TasksView = () => {
  const { tasks, staff, updateTask, vehicles, t, tEnum } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState<ServiceCategory | 'すべて'>('すべて');
  const [statusFilter, setStatusFilter] = useState<TaskProgress | 'すべて'>('すべて');
  const [viewMode, setViewMode] = useState<'month' | 'all'>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [viewingTaskId, setViewingTaskId] = useState<string | null>(null);
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());
  const [approvingTaskId, setApprovingTaskId] = useState<string | null>(null);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(expandedTaskIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedTaskIds(next);
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, catFilter, statusFilter, viewMode, currentMonth]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter(task => task.progress === '未着手').length,
      inProgress: tasks.filter(task => task.progress === '進行中').length,
      completed: tasks.filter(task => task.progress === '完了').length,
      pendingApproval: tasks.filter(task => task.progress === '承認待ち').length
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (viewMode === 'month') {
        const taskDate = new Date(task.deadline);
        if (taskDate.getFullYear() !== currentMonth.getFullYear() || taskDate.getMonth() !== currentMonth.getMonth()) {
          return false;
        }
      }
      if (catFilter !== 'すべて' && task.category !== catFilter) return false;
      if (statusFilter !== 'すべて' && task.progress !== statusFilter) return false;
      if (searchTerm) {
        const lp = searchTerm.toLowerCase();
        const v = vehicles.find(vh => vh.id === task.vehicleId);
        const serialMatch = v?.serialNumber?.toLowerCase().includes(lp);
        const subTasksMatch = tasks.filter(subTask => subTask.parentId === task.id).some(subTask => subTask.title.toLowerCase().includes(lp));
        if (!(task.title.toLowerCase().includes(lp) || task.targetModelName.toLowerCase().includes(lp) || (task.staffId && staff.find(s=>s.id===task.staffId)?.name.includes(lp)) || serialMatch || subTasksMatch)) return false;
      }
      return true;
    }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [tasks, catFilter, statusFilter, viewMode, currentMonth, searchTerm, staff, vehicles]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / itemsPerPage));
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === paginatedTasks.length && paginatedTasks.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedTasks.map(task => task.id)));
    }
  };

  const StatusBadge = ({ s }: { s: string }) => {
    switch (s) {
      case '未着手': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">{tEnum('taskProgress', s)}</span>;
      case '進行中': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">{tEnum('taskProgress', s)}</span>;
      case '承認待ち': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">{tEnum('taskProgress', s)}</span>;
      case '完了': return <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700 border border-green-200">{tEnum('taskProgress', s)}</span>;
      default: return null;
    }
  };

  // Bulk Actions
  const handleBulkAssign = (staffId: string) => {
    selectedIds.forEach(id => {
      updateTask(id, { staffIds: [staffId], progress: '進行中' });
    });
    setSelectedIds(new Set());
    setShowAssignModal(false);
  };

  const handleBulkApprove = () => {
    selectedIds.forEach(id => {
      updateTask(id, { progress: '完了', isApproved: true, approverName: 'サービスマネージャー' });
    });
    setSelectedIds(new Set());
    setShowApproveModal(false);
  };

  const TaskAssignModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-900">{t('views.tasks.bulkAssignTitle')}</h3>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm border-l-4 border-indigo-500 pl-3">{t('views.tasks.bulkAssignDescription', { count: selectedIds.size })}</p>
          <div>
            <label className="block text-sm font-semibold mb-1 text-slate-800">{t('views.tasks.assigneeLabel')}</label>
            <select id="staff-select" className="w-full border border-gray-300 p-2 rounded focus:ring-1 focus:ring-indigo-500 text-sm">
              <option value="">{t('views.tasks.selectPlease')}</option>
              {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
            </select>
          </div>
        </div>
        <div className="p-4 bg-slate-50 flex justify-end space-x-3">
          <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 hover:bg-slate-200 rounded text-sm text-slate-700">{t('common.cancel')}</button>
          <button onClick={() => {
            const val = (document.getElementById('staff-select') as HTMLSelectElement).value;
            if(val) handleBulkAssign(val);
          }} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-bold">{t('views.tasks.saveAndAssign')}</button>
        </div>
      </div>
    </div>
  );

  const TaskApproveModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        <div className="p-4 border-b bg-slate-50">
          <h3 className="font-bold text-lg text-slate-900 flex items-center"><FileSignature className="w-5 h-5 mr-2 text-green-600"/>{t('views.tasks.bulkApproveTitle')}</h3>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm bg-green-50 p-3 rounded text-green-800 border border-green-100">{t('views.tasks.bulkApproveDescription', { count: selectedIds.size })}</p>
          <div>
            <label className="block text-xs font-bold mb-1 text-slate-500 uppercase">{t('views.tasks.commentLabel')}</label>
            <textarea className="w-full border border-gray-300 p-2 rounded text-sm min-h-[80px]" defaultValue="実作業を確認。点検シート通り。動作に漏れ、がたつき、異常なし。"></textarea>
          </div>
        </div>
        <div className="p-4 bg-slate-50 flex justify-end space-x-3">
          <button onClick={() => setShowApproveModal(false)} className="px-4 py-2 hover:bg-slate-200 rounded text-sm text-slate-700">{t('common.cancel')}</button>
          <button onClick={handleBulkApprove} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-bold">{t('views.tasks.bulkApproveConfirm')}</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4 md:p-8 shrink-0 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <ClipboardList className="w-6 h-6 mr-2 text-indigo-600" /> 
          {t('views.tasks.title')}
        </h1>
        <p className="text-sm text-gray-500 mt-2">{t('views.tasks.description')}</p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 text-sm bg-white p-4 border border-slate-200 rounded-xl shadow-sm md:mb-6 shrink-0">
          <div className="pr-4 border-r border-slate-300"><span className="text-slate-500 font-bold uppercase text-xs">{t('common.total')}</span> <span className="font-bold ml-2 text-lg text-slate-800">{stats.total}</span></div>
          <div className="pr-4 border-r border-slate-300"><span className="text-gray-500 font-bold uppercase text-xs">{tEnum('taskProgress', '未着手')}</span> <span className="font-bold ml-2 text-lg text-gray-800">{stats.pending}</span></div>
          <div className="pr-4 border-r border-slate-300"><span className="text-blue-500 font-bold uppercase text-xs">{tEnum('taskProgress', '進行中')}</span> <span className="font-bold ml-2 text-lg text-blue-800">{stats.inProgress}</span></div>
          <div className="pr-4 border-r border-slate-300"><span className="text-green-500 font-bold uppercase text-xs">{tEnum('taskProgress', '完了')}</span> <span className="font-bold ml-2 text-lg text-green-800">{stats.completed}</span></div>
          <div><span className="text-amber-600 font-bold uppercase text-xs">{tEnum('taskProgress', '承認待ち')}</span> <span className="font-bold ml-2 text-lg text-amber-800">{stats.pendingApproval}</span></div>
        </div>

        {/* Filters and View Toggles */}
        <div className="flex flex-col xl:flex-row gap-4 mb-6 justify-between items-start xl:items-center">
          <div className="flex items-center space-x-1 bg-gray-200/50 p-1 rounded-lg">
            <button 
              onClick={() => setViewMode('month')} 
              className={cn("px-4 py-1.5 rounded-md text-sm font-bold transition", viewMode === 'month' ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-900")}
            >
              {t('views.tasks.monthView')}
            </button>
            <button 
              onClick={() => setViewMode('all')} 
              className={cn("px-4 py-1.5 rounded-md text-sm font-bold transition", viewMode === 'all' ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-900")}
            >
              {t('views.tasks.allView')}
            </button>
          </div>

          {viewMode === 'month' && (
            <div className="flex items-center space-x-3 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="font-bold text-lg text-slate-800 min-w-[100px] text-center">
                {format(currentMonth, 'yyyy年M月')}
              </div>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2 text-sm ml-auto">
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input type="text" placeholder={t('views.tasks.searchPlaceholder')} className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
            </div>
            <select className="border border-gray-300 rounded px-3 py-2 bg-white" value={catFilter} onChange={e=>setCatFilter(e.target.value as any)}>
              <option value="すべて">{t('views.tasks.categoryAll')}</option>
              <option value="受け入れ点検">{tEnum('serviceCategory', '受け入れ点検')}</option>
              <option value="新車巡回">{tEnum('serviceCategory', '新車巡回')}</option>
              <option value="故障修理">{tEnum('serviceCategory', '故障修理')}</option>
              <option value="定期点検">{tEnum('serviceCategory', '定期点検')}</option>
              <option value="フィールドキャンペーン">{tEnum('serviceCategory', 'フィールドキャンペーン')}</option>
            </select>
            <select className="border border-gray-300 rounded px-3 py-2 bg-white" value={statusFilter} onChange={e=>setStatusFilter(e.target.value as any)}>
              <option value="すべて">{t('views.tasks.statusAll')}</option>
              <option value="未着手">{tEnum('taskProgress', '未着手')}</option>
              <option value="進行中">{tEnum('taskProgress', '進行中')}</option>
              <option value="承認待ち">{tEnum('taskProgress', '承認待ち')}</option>
              <option value="完了">{tEnum('taskProgress', '完了')}</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="border border-slate-200 rounded-xl shadow-sm overflow-hidden bg-white flex flex-col min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left align-middle min-w-[900px]">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 w-12 text-center cursor-pointer" onClick={toggleAll}>
                    {selectedIds.size === paginatedTasks.length && paginatedTasks.length > 0 ? <CheckSquare className="w-5 h-5 text-indigo-600 inline" /> : <Square className="w-5 h-5 text-gray-400 inline" />}
                  </th>
                  <th className="px-4 py-3 w-28">{t('views.tasks.tableStatus')}</th>
                  <th className="px-4 py-3 w-28">{t('views.tasks.deadline')}</th>
                  <th className="px-4 py-3 w-28">{t('views.tasks.plannedDate')}</th>
                  <th className="px-4 py-3 w-28">{t('views.tasks.actualDate')}</th>
                  <th className="px-4 py-3">{t('views.tasks.vehicle')}</th>
                  <th className="px-4 py-3">{t('views.tasks.taskContent')}</th>
                  <th className="px-4 py-3">{t('views.tasks.category')}</th>
                  <th className="px-4 py-3">{t('views.tasks.assignee')}</th>
                  <th className="px-4 py-3 text-center">{t('views.tasks.contentConfirm')}</th>
                  <th className="px-4 py-3 text-center">{t('views.tasks.approval')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {paginatedTasks.map(task => {
                  const isSelected = selectedIds.has(task.id);
                  const s = staff.find(st => st.id === task.staffId);
                  const v = vehicles.find(vh => vh.id === task.vehicleId);
                  const isExpanded = expandedTaskIds.has(task.id);
                  const subTasks = tasks.filter(subTask => subTask.parentId === task.id);
                  return (
                    <React.Fragment key={task.id}>
                    <tr className={cn("hover:bg-slate-50 transition border-b border-slate-100", isSelected && "bg-indigo-50/30", isExpanded && "bg-slate-50 border-b-0")}> 
                      <td className="px-4 py-3 text-center cursor-pointer" onClick={() => toggleSelect(task.id)}>
                        {isSelected ? <CheckSquare className="w-5 h-5 text-indigo-600 inline" /> : <Square className="w-5 h-5 text-gray-300 inline" />}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge s={task.progress} />
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {format(new Date(task.deadline), 'yyyy/MM/dd')}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {task.startDate ? format(new Date(task.startDate), 'yyyy/MM/dd') : '-'}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {task.progress === '完了' ? format(new Date(task.deadline), 'yyyy/MM/dd') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-900">{task.targetModelName} <span className="font-mono font-normal text-gray-500 ml-1">{v?.serialNumber || '-'}</span></div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 text-sm">{task.title}</div>
                        {subTasks.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap gap-1 items-center">
                            {subTasks.slice(0, 2).map(subTask => (
                              <span key={subTask.id} className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 max-w-[120px] truncate" title={subTask.title}>
                                {subTask.title}
                              </span>
                            ))}
                            {subTasks.length > 2 && (
                              <div className="relative group">
                                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 cursor-help">
                                  {t('views.tasks.subTaskOthers', { count: subTasks.length - 2 })}
                                </span>
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block w-max max-w-[250px] z-50 bg-slate-800 text-white text-xs rounded p-2.5 shadow-lg font-normal">
                                  <ul className="list-disc pl-3 space-y-1">
                                    {subTasks.map(subTask => (
                                      <li key={subTask.id} className="truncate leading-tight" title={subTask.title}>{subTask.title}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {subTasks.length > 0 && (
                          <button 
                            onClick={(e) => toggleExpand(task.id, e)}
                            className="mt-1.5 flex items-center text-[10px] text-slate-500 hover:text-indigo-600 font-bold bg-white hover:bg-indigo-50 px-1.5 py-0.5 rounded border border-slate-200 hover:border-indigo-200 transition"
                          >
                            {isExpanded ? <ChevronDown className="w-3 h-3 mr-0.5" /> : <ChevronRight className="w-3 h-3 mr-0.5" />}
                            {t('views.tasks.showSubTasks', { done: subTasks.filter(subTask => subTask.progress === '完了').length, total: subTasks.length })}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {tEnum('serviceCategory', task.category)}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="font-semibold text-gray-800">{s ? s.name : <span className="text-red-500">{t('views.tasks.unassigned')}</span>}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button 
                          onClick={() => setViewingTaskId(task.id)}
                          className="inline-flex items-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded text-xs font-bold border border-indigo-200 transition"
                        >
                          <FileText className="w-3 h-3 mr-1" />{t('views.tasks.contentConfirm')}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {task.progress === '完了' ? (
                          <div className="inline-flex items-center text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold border border-green-100">
                            <CheckCircle className="w-3 h-3 mr-1" />{t('views.tasks.approved')}
                          </div>
                        ) : task.progress === '承認待ち' ? (
                          <button 
                            onClick={() => setApprovingTaskId(task.id)}
                            className="inline-flex items-center text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded text-xs font-bold transition shadow-sm"
                          >
                            <FileSignature className="w-3 h-3 mr-1" />{t('views.tasks.approveNow')}
                          </button>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                    {isExpanded && subTasks.length > 0 && subTasks.map((subTask, idx) => {
                      const isLast = idx === subTasks.length - 1;
                      const ss = staff.find(staffMember => staffMember.id === subTask.staffIds?.[0]);
                      return (
                        <tr key={subTask.id} className="bg-slate-50/80 border-b border-slate-200 hover:bg-slate-100 transition group/sub">
                          <td className="px-4 py-3 text-center"></td>
                          <td className="px-4 py-3">
                            <StatusBadge s={subTask.progress} />
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800 text-sm">
                            {subTask.id}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 font-mono">
                            {subTask.deadline ? format(new Date(subTask.deadline), 'yyyy-MM-dd') : '-'}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-4 h-4 border-l-2 border-b-2 border-slate-300 rounded-bl mr-2 -mt-4 opacity-70"></div>
                              <button onClick={() => setViewingTaskId(subTask.id)} className="font-bold text-slate-700 hover:text-indigo-600 transition flex items-center text-sm group-hover/sub:underline">
                                <FileText className="w-3 h-3 mr-1 text-slate-400" />
                                {subTask.title}
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-500 text-sm">
                            {tEnum('serviceCategory', subTask.category)}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <div className="font-semibold text-gray-700">{ss ? ss.name : <span className="text-red-400">{t('views.tasks.unassigned')}</span>}</div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button 
                              onClick={() => setViewingTaskId(subTask.id)}
                              className="inline-flex items-center text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded text-xs font-bold border border-indigo-200 transition"
                            >
                              {t('views.tasks.contentConfirm')}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {subTask.progress === '完了' ? (
                              <div className="inline-flex items-center text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold border border-green-100">
                                <CheckCircle className="w-3 h-3 mr-1" />{t('views.tasks.approved')}
                              </div>
                            ) : subTask.progress === '承認待ち' ? (
                              <button 
                                onClick={() => setApprovingTaskId(subTask.id)}
                                className="inline-flex items-center text-white bg-amber-600 hover:bg-amber-700 px-2 py-1 rounded text-xs font-bold transition shadow-sm"
                              >
                                <FileSignature className="w-3 h-3 mr-1" />{t('views.tasks.approveNow')}
                              </button>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    </React.Fragment>
                  )
                })}
                {paginatedTasks.length === 0 && (
                  <tr><td colSpan={10} className="px-4 py-12 text-center text-gray-500 bg-white">{t('views.tasks.noTasks')}</td></tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-auto px-4 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-sm text-slate-600 font-medium">
                {t('views.tasks.showingRange', { total: filteredTasks.length, start: (currentPage - 1) * itemsPerPage + 1, end: Math.min(currentPage * itemsPerPage, filteredTasks.length) })}
              </span>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex space-x-1 px-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={cn("w-8 h-8 rounded text-sm font-bold flex items-center justify-center transition", currentPage === i + 1 ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200")}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 rounded hover:bg-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

      {/* Bulk Action Bar (Fixed at bottom) */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-0 md:bottom-auto md:top-auto md:absolute md:bottom-4 left-0 md:left-1/2 md:-translate-x-1/2 right-0 md:right-auto md:w-auto p-4 bg-indigo-900 shadow-2xl rounded-t-xl md:rounded-2xl text-white flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-6 z-40 border border-indigo-700">
          <div className="font-bold text-sm bg-indigo-950 px-3 py-1 rounded-full"><span className="text-indigo-300 mr-2">{selectedIds.size}</span>{t('views.tasks.selectedCount', { count: selectedIds.size })}</div>
          <div className="flex space-x-3 w-full sm:w-auto">
            <button onClick={() => setShowAssignModal(true)} className="flex-1 sm:flex-none flex items-center justify-center space-x-1 px-4 py-1.5 bg-indigo-700 hover:bg-indigo-600 rounded font-medium text-sm transition">
              <Users className="w-4 h-4"/> <span>{t('views.tasks.bulkAssign')}</span>
            </button>
            <button onClick={() => setShowApproveModal(true)} className="flex-1 sm:flex-none flex items-center justify-center space-x-1 px-4 py-1.5 bg-green-600 hover:bg-green-500 rounded font-medium text-sm transition">
              <FileSignature className="w-4 h-4"/> <span>{t('views.tasks.bulkApprove')}</span>
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="px-3 hover:text-indigo-300 font-medium text-sm">{t('views.tasks.clearSelection')}</button>
          </div>
        </div>
      )}

      {showAssignModal && <TaskAssignModal />}
      {showApproveModal && <TaskApproveModal />}
      {viewingTaskId && (
        <EditTaskModal 
          taskId={viewingTaskId} 
          isReadOnly={tasks.find(task => task.id === viewingTaskId)?.progress === '完了'} 
          onClose={() => setViewingTaskId(null)} 
        />
      )}
      {approvingTaskId && (
        <TaskReportApprovalModal 
          task={tasks.find(task => task.id === approvingTaskId)!} 
          onClose={() => setApprovingTaskId(null)} 
        />
      )}
    </div>
  );
};
