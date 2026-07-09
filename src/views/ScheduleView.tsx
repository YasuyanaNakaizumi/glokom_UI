import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar as CalIcon, ChevronLeft, ChevronRight, User as UserIcon, AlertTriangle, MapPin, Search, Wrench, Truck, Clock, X, Info, Filter, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { format, addDays, startOfWeek, differenceInDays } from 'date-fns';
import { AddOtherEventModal } from '../components/AddOtherEventModal';


const TASK_GROUPINGS = [
  { id: 'repair', name: '一般修理及び故障', categories: ['故障修理'] },
  { id: 'maintenance', name: '定期メンテナンス', categories: ['定期点検'] },
  { id: 'inspection', name: '特定自主検査', categories: ['車検'] },
  { id: 'patrol', name: '新車定期巡回', categories: ['新車巡回'] },
  { id: 'fc', name: 'フィールドキャンペーン', categories: ['フィールドキャンペーン'] },
  { id: 'stock', name: '在庫管理・納入', categories: ['受け入れ点検', '在庫点検', '納入作業'] },
  { id: 'other', name: 'その他', categories: ['その他予定'] },
];

export const ScheduleView = () => {
  const { staff, tasks, parking, vehicleMasters } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // 'business' means 8:00 - 20:00, '24h' means 0:00 - 23:00
  const [viewMode, setViewMode] = useState<'business' | '24h'>('business');
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('vertical');
  const [verticalViewMode, setVerticalViewMode] = useState<'day' | 'week'>('day');
  const [showMapModal, setShowMapModal] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showAddOtherEventModal, setShowAddOtherEventModal] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Grouped resources
  const specialVehiclesList = useMemo(() => vehicleMasters.filter(m => m.type && m.type.includes('特殊車両')), [vehicleMasters]);

  
  const [selectedTaskGroups, setSelectedTaskGroups] = useState<Set<string>>(new Set(TASK_GROUPINGS.map(g => g.id)));

  const toggleTaskGroup = (id: string) => {
    const next = new Set(selectedTaskGroups);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedTaskGroups(next);
  };

  const [selectedStaffIds, setSelectedStaffIds] = useState<Set<string>>(new Set(staff.map(s => s.id)));
  const [selectedParkingIds, setSelectedParkingIds] = useState<Set<string>>(new Set(parking.map(p => p.id)));
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<Set<string>>(new Set(specialVehiclesList.map(v => v.id)));
  const [showTools, setShowTools] = useState(true);

  const toggleStaff = (id: string) => {
    const next = new Set(selectedStaffIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedStaffIds(next);
  };
  const toggleParking = (id: string) => {
    const next = new Set(selectedParkingIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedParkingIds(next);
  };
  const toggleVehicle = (id: string) => {
    const next = new Set(selectedVehicleIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedVehicleIds(next);
  };

  // Tasks categorized
  const unassignedTasks = useMemo(() => tasks.filter(t => {
    if ((t.staffIds && t.staffIds.length > 0) || t.progress === '完了') return false;
    const group = TASK_GROUPINGS.find(g => g.categories.includes(t.category));
    if (!group) return true;
    return selectedTaskGroups.has(group.id);
  }), [tasks, selectedTaskGroups]);

  // Time grid configuration
  
  const renderTasksOnTimeline = (resourceId: string, resourceType: 'mechanic' | 'parking' | 'special_vehicle') => {
    // Filter tasks that belong to this resource and intersect with currentDate
    const resourceTasks = tasks.filter(t => {
      // Very basic date match (same YYYY-MM-DD)
      const taskDate = t.startDate ? new Date(t.startDate) : t.deadline ? new Date(t.deadline) : new Date();
      if (format(taskDate, 'yyyy-MM-dd') !== format(currentDate, 'yyyy-MM-dd')) return false;

      if (resourceType === 'mechanic') return t.staffIds?.includes(resourceId);
      if (resourceType === 'parking') return t.parkingAreaIds?.includes(resourceId);
      if (resourceType === 'special_vehicle') return false; // assuming special vehicle assignment isn't fully implemented in model
      return false;
    });

    return resourceTasks.map(task => {
      const startD = task.startDate ? new Date(task.startDate) : new Date();
      const endD = task.deadline ? new Date(task.deadline) : new Date(startD.getTime() + 2 * 60 * 60 * 1000); // default 2 hours
      
      const startHour = startD.getHours();
      const endHour = endD.getHours();

      let startIdx = hours.indexOf(startHour);
      if (startIdx === -1) startIdx = 0; // if before view mode
      let endIdx = hours.indexOf(endHour);
      if (endIdx === -1) endIdx = hours.length; // if after view mode
      if (endIdx <= startIdx) endIdx = startIdx + 1; // min 1 slot

      const leftPct = (startIdx / hours.length) * 100;
      const widthPct = ((endIdx - startIdx) / hours.length) * 100;

      let bgColor = 'bg-blue-100 border-blue-300 text-blue-800';
      if (task.category === 'その他予定' || task.isNonWorkingDay) {
        bgColor = 'bg-amber-100 border-amber-300 text-amber-800';
      } else if (task.progress === '完了') {
        bgColor = 'bg-slate-200 border-slate-300 text-slate-600';
      }

      return (
        <div 
          key={task.id}
          className={`absolute top-1 bottom-1 rounded border ${bgColor} shadow-sm px-2 py-1 overflow-hidden cursor-pointer hover:shadow-md transition-shadow z-20 flex flex-col justify-center min-w-0`}
          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
          title={task.title}
        >
          <div className="text-xs font-bold truncate leading-tight">{task.title}</div>
          {task.isNonWorkingDay && <div className="text-[9px] font-bold opacity-70 truncate">非稼働日</div>}
        </div>
      );
    });
  };

  const hours = useMemo(() => {
    const start = viewMode === 'business' ? 8 : 0;
    const end = viewMode === 'business' ? 20 : 23;
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [viewMode]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, resourceType: string, resourceId: string, hour: number) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;
    
    // In a real app, we would dispatch an updateTask action here
    console.log(`Assigned task ${taskId} to ${resourceType} ${resourceId} on ${format(currentDate, 'yyyy/MM/dd')} at ${hour}h`);
    setDraggedTaskId(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4 md:p-6 shrink-0 overflow-hidden relative">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4 shrink-0">
        <div className="flex items-center justify-between w-full lg:w-auto">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <CalIcon className="w-6 h-6 mr-2 text-indigo-600" />
            統合スケジュール
          </h1>
          
          <button
            onClick={() => setShowAddOtherEventModal(true)}
            className="lg:hidden flex items-center px-3 py-1.5 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            予定追加
          </button>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 pb-1 lg:pb-0 relative z-40">
          <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm shrink-0">
            <button
              onClick={() => setOrientation('horizontal')}
              className={cn("px-4 py-1.5 text-sm font-bold rounded-md transition-colors", orientation === 'horizontal' ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-700")}
            >横表示</button>
            <button
              onClick={() => setOrientation('vertical')}
              className={cn("px-4 py-1.5 text-sm font-bold rounded-md transition-colors", orientation === 'vertical' ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-700")}
            >縦表示</button>
          </div>
          {orientation === 'vertical' && (
            <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm shrink-0">
              <button
                onClick={() => setVerticalViewMode('day')}
                className={cn("px-4 py-1.5 text-sm font-bold rounded-md transition-colors", verticalViewMode === 'day' ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-700")}
              >日表示</button>
              <button
                onClick={() => setVerticalViewMode('week')}
                className={cn("px-4 py-1.5 text-sm font-bold rounded-md transition-colors", verticalViewMode === 'week' ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-700")}
              >週表示</button>
            </div>
          )}
          <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm shrink-0">
            <button
              onClick={() => setViewMode('business')}
              className={cn("px-4 py-1.5 text-sm font-bold rounded-md transition-colors", viewMode === 'business' ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-700")}
            >標準(8-20)</button>
            <button
              onClick={() => setViewMode('24h')}
              className={cn("px-4 py-1.5 text-sm font-bold rounded-md transition-colors", viewMode === '24h' ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-slate-700")}
            >24H</button>
          </div>
          
          <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm shrink-0">
            <button onClick={() => setCurrentDate(addDays(currentDate, -1))} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-l-lg border-r border-slate-200">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-4 py-1.5 font-bold text-sm text-slate-700 min-w-[120px] text-center">
              {format(currentDate, 'yyyy/MM/dd')}
            </div>
            <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-r-lg border-l border-slate-200">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={cn("flex items-center px-4 py-2 border rounded-lg text-sm font-bold shadow-sm transition-colors shrink-0", showFilterDropdown ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50")}
            >
              <Filter className="w-4 h-4 mr-2" />
              表示絞り込み
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 max-h-[70vh] overflow-y-auto">
                <div className="mb-4">
                  
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">タスク分類</h4>
                  <div className="space-y-2">
                    {TASK_GROUPINGS.map(g => (
                      <label key={g.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={selectedTaskGroups.has(g.id)} onChange={() => toggleTaskGroup(g.id)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                        {g.name}
                      </label>
                    ))}
                  </div>
                </div>

                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">メカニック</h4>
                  <div className="space-y-2">
                    {staff.map(s => (
                      <label key={s.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={selectedStaffIds.has(s.id)} onChange={() => toggleStaff(s.id)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                        {s.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">作業場・駐車場</h4>
                  <div className="space-y-2">
                    {parking.map(p => (
                      <label key={p.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={selectedParkingIds.has(p.id)} onChange={() => toggleParking(p.id)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                        {p.name}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">特殊車両</h4>
                  <div className="space-y-2">
                    {specialVehiclesList.map(v => (
                      <label key={v.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input type="checkbox" checked={selectedVehicleIds.has(v.id)} onChange={() => toggleVehicle(v.id)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                        {v.modelName}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">工具</h4>
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={showTools} onChange={() => setShowTools(!showTools)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                    工具を表示
                  </label>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowAddOtherEventModal(true)}
            className="hidden lg:flex items-center px-4 py-2 bg-slate-900 hover:bg-slate-800 transition-colors text-white rounded-lg text-sm font-bold shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            予定・休暇登録
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden gap-4">
        
        {/* Left Sidebar: Unassigned Tasks & Alerts */}
        <div className="w-[300px] shrink-0 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden hidden xl:flex">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center text-sm">
              <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
              要アサインタスク
            </h3>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">{unassignedTasks.length}件</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
            {unassignedTasks.map(task => (
              <div 
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id)}
                className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{task.category}</span>
                  {task.deadline && <span className="text-[10px] font-bold text-rose-500 font-mono">期限: {task.deadline.split('T')[0]}</span>}
                </div>
                <h4 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-indigo-600 transition-colors">{task.title}</h4>
                <div className="mt-2 text-xs text-slate-400 flex items-center">
                  <Truck className="w-3 h-3 mr-1" />
                  {task.vehicleId.split('-')[0]}
                </div>
              </div>
            ))}
            {unassignedTasks.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm font-medium">
                すべてアサイン済みです
              </div>
            )}
          </div>
        </div>

        {/* Right Area: Gantt / Timeline */}
        <div className="flex-1 min-w-0 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          
          {/* Header Row */}
          <div className="flex border-b border-slate-200 bg-slate-50 shrink-0 sticky top-0 z-20">
            <div className="w-[180px] lg:w-[200px] shrink-0 border-r border-slate-200 p-3 font-bold text-sm text-slate-600 flex items-center bg-slate-50">
              リソース
            </div>
            <div className="flex-1 flex min-w-[600px] overflow-x-hidden">
              {hours.map(hour => (
                <div key={hour} className="flex-1 border-r border-slate-200 p-2 text-center text-xs font-bold text-slate-500 min-w-[40px]">
                  {hour}:00
                </div>
              ))}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto bg-slate-50/30">
            <div className="min-w-[800px]">
              
              {/* Group: Mechanics */}
              <div className="bg-indigo-50/50 border-b border-slate-200 p-2 sticky left-0 z-10 text-sm font-bold text-indigo-800 flex items-center shadow-sm w-fit min-w-full">
                <UserIcon className="w-4 h-4 mr-2" /> メカニック ({staff.filter(s => selectedStaffIds.has(s.id)).length}名)
              </div>
              {staff.filter(s => selectedStaffIds.has(s.id)).map(person => (
                <div key={person.id} className="flex border-b border-slate-200 group hover:bg-indigo-50/20 transition-colors">
                  <div className="w-[180px] lg:w-[200px] shrink-0 border-r border-slate-200 p-3 flex items-center bg-white sticky left-0 z-10">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold mr-2 shrink-0">
                      {person.name.charAt(0)}
                    </div>
                    <span className="font-bold text-sm text-slate-700 truncate">{person.name}</span>
                  </div>
                  <div className="flex-1 flex relative">
                    {/* Time slots */}
                    {renderTasksOnTimeline(person.id, 'mechanic')}
                    {hours.map((hour, i) => (
                      <div 
                        key={i} 
                        className="flex-1 border-r border-slate-100/50 min-w-[40px]"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'mechanic', person.id, hour)}
                      >
                         {/* Cell drop zone */}
                         <div className="w-full h-full min-h-[48px] opacity-0 hover:opacity-100 hover:bg-indigo-50/50 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Group: Parking */}
              <div className="bg-emerald-50/50 border-b border-slate-200 p-2 sticky left-0 z-10 text-sm font-bold text-emerald-800 flex items-center justify-between shadow-sm w-fit min-w-full pr-4">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" /> 作業場・駐車場 ({parking.filter(p => selectedParkingIds.has(p.id)).length}箇所)
                </div>
                <button 
                  onClick={() => setShowMapModal(true)}
                  className="flex items-center text-[10px] font-bold bg-white text-emerald-700 border border-emerald-200 px-2 py-1 rounded hover:bg-emerald-100 transition shadow-sm sticky right-4"
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  マップを見る
                </button>
              </div>
              {parking.filter(p => selectedParkingIds.has(p.id)).map(p => (
                <div key={p.id} className="flex border-b border-slate-200 group hover:bg-emerald-50/20 transition-colors">
                  <div className="w-[180px] lg:w-[200px] shrink-0 border-r border-slate-200 p-3 flex items-center bg-white sticky left-0 z-10">
                    <span className="font-bold text-sm text-slate-700 truncate">{p.name}</span>
                  </div>
                  <div className="flex-1 flex relative">
                    {renderTasksOnTimeline(p.id, 'parking')}
                    {hours.map((hour, i) => (
                      <div 
                        key={i} 
                        className="flex-1 border-r border-slate-100/50 min-w-[40px]"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'parking', p.id, hour)}
                      >
                         <div className="w-full h-full min-h-[48px] opacity-0 hover:opacity-100 hover:bg-emerald-50/50 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Group: Special Vehicles */}
              <div className="bg-amber-50/50 border-b border-slate-200 p-2 sticky left-0 z-10 text-sm font-bold text-amber-800 flex items-center shadow-sm w-fit min-w-full">
                <Truck className="w-4 h-4 mr-2" /> 特殊車両 ({specialVehiclesList.filter(v => selectedVehicleIds.has(v.id)).length}台)
              </div>
              {specialVehiclesList.filter(v => selectedVehicleIds.has(v.id)).map(v => (
                <div key={v.id} className="flex border-b border-slate-200 group hover:bg-amber-50/20 transition-colors">
                  <div className="w-[180px] lg:w-[200px] shrink-0 border-r border-slate-200 p-3 flex items-center bg-white sticky left-0 z-10">
                    <span className="font-bold text-sm text-slate-700 truncate">{v.modelName}</span>
                  </div>
                  <div className="flex-1 flex relative">
                    {hours.map((hour, i) => (
                      <div 
                        key={i} 
                        className="flex-1 border-r border-slate-100/50 min-w-[40px]"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'special_vehicle', v.id, hour)}
                      >
                         <div className="w-full h-full min-h-[48px] opacity-0 hover:opacity-100 hover:bg-amber-50/50 transition-colors" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Group: Tools */}
              {showTools && (
                <>
                  <div className="bg-slate-100/80 border-b border-slate-200 p-2 sticky left-0 z-10 text-sm font-bold text-slate-600 flex items-center shadow-sm w-fit min-w-full">
                    <Wrench className="w-4 h-4 mr-2" /> 工具
                  </div>
                  <div className="flex border-b border-slate-200">
                      <div className="w-[180px] lg:w-[200px] shrink-0 border-r border-slate-200 p-3 flex items-center bg-white text-slate-400 text-sm italic sticky left-0 z-10">
                        (登録なし)
                      </div>
                      <div className="flex-1 flex bg-slate-50/50 min-h-[48px]">
                        {hours.map((hour, i) => (
                          <div key={i} className="flex-1 border-r border-slate-100/50 min-w-[40px]" />
                        ))}
                      </div>
                  </div>
                </>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {showMapModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
                作業場・駐車場 マップ
              </h2>
              <button onClick={() => setShowMapModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 bg-slate-100 relative min-h-[500px] flex items-center justify-center">
              <div className="absolute inset-4 border-4 border-slate-300 rounded-xl bg-white shadow-inner flex relative overflow-hidden w-full h-[500px]">
                 
                 {/* Decorative floor lines */}
                 <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(45deg, #f8fafc 25%, transparent 25%, transparent 75%, #f8fafc 75%, #f8fafc), linear-gradient(45deg, #f8fafc 25%, transparent 25%, transparent 75%, #f8fafc 75%, #f8fafc)', backgroundSize: '40px 40px', backgroundPosition: '0 0, 20px 20px', opacity: 0.5 }}></div>

                 {parking.map((p, i) => (
                   <div 
                     key={p.id} 
                     className="absolute border-2 border-indigo-200 bg-indigo-50/80 rounded-lg shadow-sm flex flex-col items-center justify-center p-2 hover:border-indigo-400 transition-colors cursor-pointer group"
                     style={{
                       left: `${20 + (i % 3) * 30}%`,
                       top: `${20 + Math.floor(i / 3) * 30}%`,
                       width: '25%',
                       height: '25%'
                     }}
                   >
                      <MapPin className="w-6 h-6 text-indigo-400 mb-1 group-hover:text-indigo-600" />
                      <span className="font-bold text-indigo-900 text-sm text-center">{p.name}</span>
                      <span className="text-[10px] text-indigo-500 font-bold bg-white px-2 py-0.5 rounded-full mt-1 shadow-sm">収容: {p.capacity}台</span>
                   </div>
                 ))}

                 {/* Entrance / Exit indicator */}
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-12 bg-slate-200 border-t-4 border-x-4 border-slate-300 rounded-t-lg flex items-center justify-center text-slate-500 font-bold text-sm">
                   出入口
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showAddOtherEventModal && (
        <AddOtherEventModal onClose={() => setShowAddOtherEventModal(false)} />
      )}
    </div>
  );
};
