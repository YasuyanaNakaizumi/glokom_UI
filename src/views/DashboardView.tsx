import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  ChevronDown,
  Package,
  Truck,
  CheckSquare, Square,
  Wrench,
  Car,
  MapPin,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  Calendar,
  FileText,
  Plus,
  Maximize2,
  Search,
  Settings,
  ShieldCheck,
  ShieldAlert,
  Briefcase,
  GripVertical,
  Bell,
  X,
} from "lucide-react";
import { cn } from "../lib/utils";
import { format, differenceInMonths } from "date-fns";
import { AddDeliveryModal } from "../components/AddDeliveryModal";
import { EditDeliveryModal } from "../components/EditDeliveryModal";
import { EditTaskModal } from "../components/EditTaskModal";
import { AddRepairTaskModal } from "../components/AddRepairTaskModal";
import { SalesDashboardSection } from "../components/SalesDashboardSection";
import { InventoryInspectionSection } from "../components/InventoryInspectionSection";
import { InventoryListSection } from "../components/InventoryListSection";
import { OrderAndDeliverySection } from "../components/OrderAndDeliverySection";
import { QuotePrepSection } from "../components/QuotePrepSection";
import { SalesProcessSection } from "../components/SalesProcessSection";
import { ContractManagementModal } from "../components/ContractManagementModal";
import { TaskReportApprovalModal } from "../components/TaskReportApprovalModal";
import { ServiceTask } from "../types";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

// Helper component for section layouts
const DashboardSection = ({
  title,
  subtitle,
  icon: Icon,
  children,
  defaultOpen = true,
  dragHandleProps,
}: {
  title: string;
  subtitle?: string;
  icon: any;
  children: React.ReactNode;
  defaultOpen?: boolean;
  dragHandleProps?: any;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-12 bg-white/50 p-2 rounded-2xl">
      <div className="flex items-center mb-2">
        {dragHandleProps && (
          <div {...dragHandleProps} className="p-2 cursor-grab text-slate-400 hover:text-slate-600 active:cursor-grabbing mr-1 flex items-center justify-center">
            <GripVertical className="w-5 h-5" />
          </div>
        )}
        <div
          className="flex items-center cursor-pointer select-none group w-fit"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDown
            className={cn(
              "w-6 h-6 text-indigo-500 transition-transform",
              !isOpen && "-rotate-90",
            )}
          />
          <div className="bg-indigo-50 p-2 rounded-lg mx-2 border border-indigo-100">
            <Icon className="w-5 h-5 text-indigo-700" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {title}
          </h2>
        </div>
      </div>
      {subtitle && (
        <p className="text-sm text-slate-500 ml-16 md:ml-[4.5rem] mb-6">{subtitle}</p>
      )}

      {isOpen && <div className="ml-2 md:ml-[4.5rem]">{children}</div>}
    </div>
  );
};


const SubTasksPreview = ({ subTasks }: { subTasks: any[] }) => {
  if (!subTasks || subTasks.length === 0) return null;
  return (
    <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-1.5 w-full">
      <div className="text-[10px] font-bold text-slate-500 mb-1 flex items-center">
        <CheckSquare className="w-3 h-3 mr-1 text-indigo-400" /> 
        小タスク {subTasks.filter((s: any) => s.progress === '完了').length}/{subTasks.length}
      </div>
      {subTasks.slice(0, 3).map((st: any) => (
        <div key={st.id} className="flex items-center text-[10px] text-slate-600">
          {st.progress === '完了' ? <CheckSquare className="w-3 h-3 mr-1.5 text-indigo-500 shrink-0" /> : <Square className="w-3 h-3 mr-1.5 text-slate-300 shrink-0" />}
          <span className={cn("truncate", st.progress === '完了' && "line-through text-slate-400")}>{st.title}</span>
        </div>
      ))}
      {subTasks.length > 3 && (
        <div className="text-[10px] text-slate-400 pl-[18px]">他 {subTasks.length - 3} 件...</div>
      )}
    </div>
  );
};

export const DashboardView = () => {
  const { vehicles, tasks, setView, staff, contracts, addTask } = useApp();
  const [showAddDeliveryModal, setShowAddDeliveryModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showAddRepairModal, setShowAddRepairModal] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [reportTaskToApprove, setReportTaskToApprove] = useState<ServiceTask | null>(null);

  const [alertType, setAlertType] = useState<'patrol' | 'fc' | 'contract' | 'maintenance' | 'inspection' | null>(null);
  const [assigningAlert, setAssigningAlert] = useState<{vehicleId: string, type: string, description: string, id: string, targetModelName: string} | null>(null);
  const { alerts, updateAlert } = useApp();

  const getActiveAlerts = (type: string) => alerts.filter(a => a.type === type && !a.isIgnored);

  // Categorize vehicles
  const receiveVehicles = vehicles.filter(
    (v) => v.status === "受け入れ予定" || v.status === "出荷済",
  );
  const scheduledVehicles = vehicles.filter(
    (v) =>
      v.status === "搬入済" || v.status === "点検中" || v.status === "点検完了",
  );
  const stockVehicles = vehicles.filter(
    (v) => v.status === "在庫" || v.stockStatus === "フリー在庫",
  );

  // Categorize tasks (filter out approved tasks)
  const patrolTasks = tasks.filter((t) => t.category === "新車巡回" && !t.isApproved && !t.parentId);
  const fcTasks = tasks.filter((t) => t.category === "フィールドキャンペーン" && !t.isApproved && !t.parentId);
  const repairTasks = tasks.filter((t) => t.category === "故障修理" && !t.isApproved && !t.parentId);
  const maintenanceTasks = tasks.filter((t) => t.category === "定期点検" && !t.isApproved && !t.parentId);
  const inspectionTasks = tasks.filter((t) => t.category === "車検" && !t.isApproved && !t.parentId);

  const getStaffName = (staffId?: string) => {
    if (!staffId) return "未割当（アサイン）";
    const s = staff.find((st) => st.id === staffId);
    return s ? s.name : "未割当（アサイン）";
  };

  const [sectionOrder, setSectionOrder] = useState([
    "sales-memo",
    "sales",
    "inventory",
    "after-sales",
    "tasks",
  ]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(sectionOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSectionOrder(items);
  };

  const renderSection = (id: string, dragHandleProps: any) => {
    switch (id) {
      case "sales-memo":
        return (
          <DashboardSection
            title="営業ノルマ及びネタ帳"
            subtitle="営業目標・実績の管理と、受注候補メモを作成・管理します。"
            icon={Briefcase}
            dragHandleProps={dragHandleProps}
          >
            <div className="space-y-6">
              <SalesDashboardSection />
            </div>
          </DashboardSection>
        );
      case "sales":
        return (
          <DashboardSection
            title="新車中古車販売、下取り"
            subtitle="受注候補から見積、注文手配、納車前車両の管理を行います。"
            icon={Package}
            dragHandleProps={dragHandleProps}
          >
            <div className="space-y-6">
              <SalesProcessSection />
            </div>
          </DashboardSection>
        );
      case "inventory":
        return (
          <DashboardSection
            title="在庫管理・点検"
            subtitle="保管中の車両および部品の在庫管理・定期点検を行います。"
            icon={Package}
            dragHandleProps={dragHandleProps}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
              <InventoryInspectionSection
                setEditingTaskId={setEditingTaskId}
                setEditingVehicleId={setEditingVehicleId}
                setReportTaskToApprove={setReportTaskToApprove}
              />

              <InventoryListSection />
            </div>
          </DashboardSection>
        );
      case "after-sales":
        return (
          <DashboardSection
            title="納入後必須管理 (納入後1年未満・必須修理)"
            subtitle="納入後1年間に実施必須の新車巡回とフィールドキャンペーンの該当数を管理します。"
            icon={CheckSquare}
            dragHandleProps={dragHandleProps}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Column 1: 新車定期巡回 */}
              <div className="bg-white rounded-xl border border-slate-200 flex flex-col shadow-sm overflow-hidden">
                <div className="p-3 flex items-center justify-between bg-indigo-50 border-b border-indigo-100/50 text-slate-800">
                  <h3 className="font-bold text-sm flex items-center">
                    新車定期巡回 (1/3/5/11ヶ月)
                  </h3>
                  <div className="flex items-center space-x-2">
                    {getActiveAlerts('patrol').length > 0 && (
                      <button onClick={() => setAlertType('patrol')} className="relative flex items-center justify-center text-rose-500 bg-rose-50 border border-rose-200 w-7 h-7 rounded-full hover:bg-rose-100 transition shadow-sm mr-1">
                        <Bell className="w-3.5 h-3.5 animate-pulse" />
                        <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center shadow-sm">
                          {getActiveAlerts('patrol').length}
                        </span>
                      </button>
                    )}
                    <button onClick={() => setView('tasks_patrol')} className="bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs px-2 py-1 rounded flex items-center transition shadow-sm font-bold">
                      全件表示
                    </button>
                    <div className="bg-white border border-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                      {patrolTasks.length}
                    </div>
                  </div>
                </div>
                <div className="p-3 space-y-3 flex-1 bg-slate-50">
                  {patrolTasks.slice(0, 3).map((t) => {
                    const isCompletedPendingApprove =
                      t.progress === "完了" && !t.isApproved;
                    const subTasks = tasks.filter(st => st.parentId === t.id);
                    return (
                      <div key={t.id} className="relative group cursor-pointer mb-3" onClick={() => setEditingTaskId(t.id)}>
                        
                      <div
                        className={cn(
                          "bg-white border rounded-lg p-3 shadow-sm relative overflow-hidden z-10 transition-transform group-hover:-translate-y-1",
                          isCompletedPendingApprove
                            ? "border-emerald-300 bg-emerald-50/30"
                            : "border-slate-200",
                        )}
                      >
                        {isCompletedPendingApprove && (
                          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500"></div>
                        )}
                        <div className="flex justify-between items-start mb-2 pl-2">
                          <div className="flex flex-col">
                            {isCompletedPendingApprove ? (
                              <div className="flex items-center justify-between w-full mb-1">
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded">
                                  作業完了
                                </span>
                                <span className="text-xs font-bold text-slate-900 ml-2">
                                  {t.targetModelName}
                                </span>
                              </div>
                            ) : (
                              <span className="font-bold text-slate-900 text-sm">
                                {t.targetModelName}{" "}
                                <span className="text-xs font-normal text-slate-500 ml-1">
                                  {t.title}
                                </span>
                              </span>
                            )}
                            {isCompletedPendingApprove && (
                              <span className="font-bold text-slate-800 text-xs mt-1">
                                {t.title}
                              </span>
                            )}
                          </div>
                          {!isCompletedPendingApprove && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold whitespace-nowrap ml-2">
                              納期: {format(new Date(t.deadline), "M/d")}
                            </span>
                          )}
                        </div>
                        {!isCompletedPendingApprove && (
                          <div className="flex justify-between text-xs text-slate-500 pl-2">
                            <span className="flex items-center">
                              <User className="w-3 h-3 mr-1 opacity-70" />{" "}
                              {getStaffName(t.staffId)}
                            </span>
                            <span className="flex items-center font-medium">
                              <Clock className="w-3 h-3 mr-1 opacity-70" />{" "}
                              {format(new Date(t.deadline), "M/d")}
                            </span>
                          </div>
                        )}
                        {isCompletedPendingApprove && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setReportTaskToApprove(t); }}
                            className="mt-3 ml-2 w-[calc(100%-8px)] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded flex items-center justify-center transition shadow-sm"
                          >
                            <CheckSquare className="w-3.5 h-3.5 mr-1.5" />{" "}
                            結果確認及び承認
                          </button>
                        )}
                        <div className="px-2 pb-2"><SubTasksPreview subTasks={subTasks} /></div>
                      </div>
                      </div>
                    );
                  })}
                  {patrolTasks.length > 3 && (
                    <button className="w-full text-center text-sm text-slate-600 bg-white border border-slate-200 py-2 rounded font-medium hover:bg-slate-50 transition">
                      全 {patrolTasks.length} 件を表示
                    </button>
                  )}
                </div>
              </div>

              {/* Column 2: フィールドキャンペーン */}
              <div className="bg-white rounded-xl border border-slate-200 flex flex-col shadow-sm overflow-hidden">
                <div className="p-3 flex items-center justify-between bg-rose-50 border-b border-rose-100/50 text-slate-800">
                  <h3 className="font-bold text-sm flex items-center">
                    フィールドキャンペーン
                  </h3>
                  <div className="flex items-center space-x-2">
                    {getActiveAlerts('fc').length > 0 && (
                      <button onClick={() => setAlertType('fc')} className="relative flex items-center justify-center text-rose-500 bg-rose-50 border border-rose-200 w-7 h-7 rounded-full hover:bg-rose-100 transition shadow-sm mr-1">
                        <Bell className="w-3.5 h-3.5 animate-pulse" />
                        <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center shadow-sm">
                          {getActiveAlerts('fc').length}
                        </span>
                      </button>
                    )}
                    <button onClick={() => setView('tasks_fc')} className="bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs px-2 py-1 rounded flex items-center transition shadow-sm font-bold">
                      全件表示
                    </button>
                    <div className="bg-white border border-rose-100 text-rose-700 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                      {fcTasks.length}
                    </div>
                  </div>
                </div>
                <div className="p-3 space-y-3 flex-1 bg-slate-50">
                  {fcTasks.slice(0, 3).map((t) => {
                    const isCompletedPendingApprove = t.progress === "完了";
                    const subTasks = tasks.filter(st => st.parentId === t.id);
                    return (
                      <div key={t.id} className="relative group cursor-pointer mb-3" onClick={() => setEditingTaskId(t.id)}>
                        
                      <div
                        className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm relative overflow-hidden z-10 transition-transform group-hover:-translate-y-1"
                      >
                        <div className={cn("absolute top-0 left-0 bottom-0 w-1.5", isCompletedPendingApprove ? "bg-emerald-500" : "bg-rose-500")}></div>
                        <div className="flex justify-between items-start pl-2">
                          

                          <div>
                            {isCompletedPendingApprove && (
                              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded mb-1 inline-block">
                                作業完了
                              </span>
                            )}
                            <span className="font-bold text-slate-900 text-sm block">
                              {t.targetModelName}
                            </span>
                            <span className="text-xs text-slate-500 mt-1 block">
                              {t.title}
                            </span>
                          </div>
                          {!isCompletedPendingApprove && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold ml-2">
                              {t.urgency}
                            </span>
                          )}
                        </div>
                        {isCompletedPendingApprove && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setReportTaskToApprove(t); }}
                            className="mt-3 ml-2 w-[calc(100%-8px)] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded flex items-center justify-center transition shadow-sm"
                          >
                            <CheckSquare className="w-3.5 h-3.5 mr-1.5" />{" "}
                            結果確認及び承認
                          </button>
                        )}
                        <div className="px-2 pb-2"><SubTasksPreview subTasks={subTasks} /></div>
                      </div>
                      </div>
                    );
                  })}
                  {fcTasks.length > 3 && (
                    <button className="w-full text-center text-sm text-slate-600 bg-white border border-slate-200 py-2 rounded font-medium hover:bg-slate-50 transition">
                      全 {fcTasks.length} 件を表示
                    </button>
                  )}
                </div>
              </div>

              {/* Column 3: 契約・補償管理 */}
              <div className="bg-white rounded-xl border border-slate-200 flex flex-col shadow-sm overflow-hidden">
                <div className="p-3 flex items-center justify-between bg-purple-50 border-b border-purple-100/50 text-slate-800">
                  <h3 className="font-bold text-sm flex items-center">
                    契約・補償管理
                  </h3>
                  <div className="flex items-center space-x-2">
                    {getActiveAlerts('contract').length > 0 && (
                      <button onClick={() => setAlertType('contract')} className="relative flex items-center justify-center text-rose-500 bg-rose-50 border border-rose-200 w-7 h-7 rounded-full hover:bg-rose-100 transition shadow-sm mr-1">
                        <Bell className="w-3.5 h-3.5 animate-pulse" />
                        <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center shadow-sm">
                          {getActiveAlerts('contract').length}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col items-center justify-center bg-slate-50">
                  <div className="bg-white text-fuchsia-600 p-4 rounded-2xl mb-4 border border-slate-200 shadow-sm">
                    <FileText className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold text-slate-600 mb-6 text-center">
                    車両ごとの延長保証やメンテナンス契約状況
                  </p>
                  <button onClick={() => setShowContractModal(true)} className="w-full text-center text-sm text-slate-700 bg-white border border-slate-300 py-2.5 rounded-lg font-bold hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                    契約状況を確認する
                  </button>
                </div>
              </div>
            </div>
          </DashboardSection>
        );
      case "tasks":
        return (
          <DashboardSection
            title="アフターセールス・タスク"
            subtitle="カテゴリー別のサービス提供状況。緊急度とスタッフアサインを一目で把握できます。"
            icon={Wrench}
            dragHandleProps={dragHandleProps}
          >
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Column 1: 一般修理及び故障 */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full">
                <div className="bg-amber-50 border-b border-amber-100/50 px-4 py-3 flex justify-between items-center text-amber-900">
                  <h3 className="font-bold text-sm flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />{" "}
                    一般修理及び故障
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => setShowAddRepairModal(true)} className="bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 text-xs px-2 py-1 rounded flex items-center transition shadow-sm font-bold">
                      <Plus className="w-3 h-3 mr-0.5" /> 追加
                    </button>
                    <button onClick={() => setView('tasks_repair')} className="bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 text-xs px-2 py-1 rounded flex items-center transition shadow-sm font-bold">
                      全件表示
                    </button>
                    <span className="bg-white border border-amber-100 text-amber-700 font-bold text-xs rounded-full px-2 py-0.5 shadow-sm">
                      {repairTasks.length}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex-1 space-y-3 bg-slate-50">
                  {repairTasks.slice(0, 3).map((t) => {
                    const v = vehicles.find((vh) => vh.id === t.vehicleId);
                    const subTasks = tasks.filter(st => st.parentId === t.id);

                    let hasValidContract = false;
                    let validContracts = [];
                    if (v?.contracts) {
                      validContracts = v.contracts.filter((vc) => {
                        const template = contracts.find(
                          (c) => c.id === vc.contractId,
                        );
                        if (!template) return false;

                        const elapsedMonths = differenceInMonths(
                          new Date(),
                          new Date(vc.startDate),
                        );
                        const elapsedSmr = (v.currentSmr || 0) - (vc.startSmr || 0);

                        if (template.rule === "months")
                          return template.months
                            ? elapsedMonths <= template.months
                            : true;
                        if (template.rule === "smr")
                          return template.smr ? elapsedSmr <= template.smr : true;
                        if (template.rule === "whichever_first") {
                          return (
                            (template.months
                              ? elapsedMonths <= template.months
                              : true) &&
                            (template.smr ? elapsedSmr <= template.smr : true)
                          );
                        }
                        if (template.rule === "custom") return true;
                        return false;
                      });
                      hasValidContract = validContracts.length > 0;
                    }

                    return (
                      <div key={t.id} className="relative group cursor-pointer mb-3" onClick={() => setEditingTaskId(t.id)}>
                        
                      <div
                        className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-col relative overflow-hidden z-10 transition-transform group-hover:-translate-y-1"
                      >
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-400"></div>
                        <div className="pl-1">
                          

                          <span className="font-bold text-sm text-slate-900 block">
                            {t.targetModelName}
                          </span>
                          {v?.customerName && (
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-1 py-0.5 mt-1 rounded font-bold border border-amber-200 inline-block">
                              顧客: {v.customerName}
                            </span>
                          )}
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {hasValidContract ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center">
                                <ShieldCheck className="w-3 h-3 mr-0.5" />{" "}
                                補償適用中
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-100 text-slate-500 border border-slate-200 flex items-center">
                                <ShieldAlert className="w-3 h-3 mr-0.5" />{" "}
                                補償範囲外
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-600 mt-2 block">
                            {t.title}
                          </span>
                          <div className="mt-3 flex justify-between items-center">
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-100 text-amber-800">
                              {t.urgency}
                            </span>
                            <span className="text-[10px] text-slate-500 flex items-center">
                              <User className="w-3 h-3 mr-1 opacity-70" />
                              {getStaffName(t.staffId)}
                            </span>
                          </div>
                        </div>
                        <div className="px-2 pb-2"><SubTasksPreview subTasks={subTasks} /></div>
                      </div>
                      </div>
                    );
                  })}
                  {repairTasks.length > 3 && (
                    <button onClick={() => setView('tasks_repair')} className="w-full text-center text-sm text-slate-600 bg-white border border-slate-200 py-2 rounded font-medium hover:bg-slate-50 transition">
                      全 {repairTasks.length} 件を表示
                    </button>
                  )}
                  {repairTasks.length === 0 && (
                    <div className="text-center text-xs text-slate-400 py-4">
                      該当タスクなし
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2: 部品販売 */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full">
                <div className="bg-blue-50 border-b border-blue-100/50 px-4 py-3 flex justify-between items-center text-blue-900">
                  <h3 className="font-bold text-sm flex items-center">
                    <Package className="w-4 h-4 mr-2 text-blue-500" /> 部品販売
                  </h3>
                </div>
                <div className="p-6 flex-1 flex flex-col items-center justify-center bg-slate-50">
                  <div className="bg-white border border-slate-200 text-blue-600 p-4 rounded-full mb-4 shadow-sm">
                    <Package className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-600 mb-6 text-center">
                    消耗品や修理部品の検索・発注・在庫確認
                  </p>
                  <button className="w-full text-center text-sm text-slate-700 bg-white border border-slate-300 py-2.5 rounded-lg font-bold hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center">
                    <Search className="w-4 h-4 mr-2 text-slate-400" />{" "}
                    部品を検索する
                  </button>
                </div>
              </div>

              {/* Column 3: 定期メンテナンス */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full">
                <div className="bg-teal-50 border-b border-teal-100/50 px-4 py-3 flex justify-between items-center text-teal-900">
                  <h3 className="font-bold text-sm flex items-center">
                    <Settings className="w-4 h-4 mr-2 text-teal-500" />{" "}
                    定期メンテナンス
                  </h3>
                  <div className="flex items-center space-x-2">
                    {getActiveAlerts('maintenance').length > 0 && (
                      <button onClick={() => setAlertType('maintenance')} className="relative flex items-center justify-center text-rose-500 bg-rose-50 border border-rose-200 w-7 h-7 rounded-full hover:bg-rose-100 transition shadow-sm mr-1">
                        <Bell className="w-3.5 h-3.5 animate-pulse" />
                        <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center shadow-sm">
                          {getActiveAlerts('maintenance').length}
                        </span>
                      </button>
                    )}
                    <button onClick={() => setView('tasks_maintenance')} className="bg-white border border-teal-200 text-teal-700 hover:bg-teal-50 text-xs px-2 py-1 rounded flex items-center transition shadow-sm font-bold">
                      全件表示
                    </button>
                    <span className="bg-white border border-teal-100 text-teal-700 font-bold text-xs rounded-full px-2 py-0.5 shadow-sm">
                      {maintenanceTasks.length || 2}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex-1 space-y-3 bg-slate-50">
                  {maintenanceTasks.slice(0, 3).map(t => {
                    const isCompletedPendingApprove = t.progress === '完了';
                    const subTasks = tasks.filter(st => st.parentId === t.id);
                    return (
                      <div key={t.id} className="relative group cursor-pointer mb-3" onClick={() => setEditingTaskId(t.id)}>
                        
                      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm relative overflow-hidden flex flex-col z-10 transition-transform group-hover:-translate-y-1">
                        <div className={cn("absolute top-0 left-0 bottom-0", isCompletedPendingApprove ? "w-1.5 bg-teal-500" : "w-1 bg-transparent group-hover:bg-teal-300 transition-colors")}></div>
                        <div className={isCompletedPendingApprove ? "pl-2" : "pl-1"}>
                          

                          <div className="flex justify-between items-center mb-1">
                            {isCompletedPendingApprove ? (
                              <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
                                作業完了
                              </span>
                            ) : (
                              <span className="font-bold text-sm text-slate-900 block mb-1">
                                {t.title}
                              </span>
                            )}
                            <span className="text-xs font-bold text-slate-600">
                              {t.targetModelName}
                            </span>
                          </div>
                          
                          {isCompletedPendingApprove ? (
                            <span className="font-bold text-sm text-slate-900 block mt-2 mb-3">
                              {t.title}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 block mb-3">
                              {t.description || "詳細なし"}
                            </span>
                          )}
                          
                          {!isCompletedPendingApprove && (
                            <div className="mt-auto flex justify-between items-center pt-2 border-t border-slate-100 divide-x divide-slate-100">
                              <span className="text-[10px] text-slate-500 flex items-center w-1/2">
                                <User className="w-3 h-3 mr-1 opacity-70" />
                                {getStaffName(t.staffId)}
                              </span>
                              <span className="text-[10px] text-slate-500 flex items-center justify-end w-1/2 pr-1">
                                <Clock className="w-3 h-3 mr-1 opacity-70" />
                                {format(new Date(t.deadline), 'M/d')}
                              </span>
                            </div>
                          )}
                        </div>
                        {isCompletedPendingApprove && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setReportTaskToApprove(t); }}
                            className="ml-2 w-[calc(100%-8px)] bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2.5 rounded-md flex items-center justify-center transition shadow-sm mt-auto"
                          >
                            <CheckSquare className="w-3.5 h-3.5 mr-1.5" />{" "}
                            結果確認及び承認
                          </button>
                        )}
                        <div className="px-2 pb-2"><SubTasksPreview subTasks={subTasks} /></div>
                      </div>
                      </div>
                    );
                  })}
                  {maintenanceTasks.length > 3 && (
                    <button onClick={() => setView('tasks_inspection')} className="w-full text-center text-sm text-slate-600 bg-white border border-slate-200 py-2 rounded font-medium hover:bg-slate-50 transition">
                      全 {maintenanceTasks.length} 件を表示
                    </button>
                  )}
                  {maintenanceTasks.length === 0 && (
                    <div className="text-sm text-slate-500 text-center py-4">タスクはありません</div>
                  )}
                </div>
              </div>

              {/* Column 4: 特定自主検査(年次) */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full">
                <div className="bg-purple-50 border-b border-purple-100/50 px-4 py-3 flex justify-between items-center text-purple-900">
                  <h3 className="font-bold text-sm flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-purple-500" />{" "}
                    特定自主検査 (年次)
                  </h3>
                  <div className="flex items-center space-x-2">
                    {getActiveAlerts('inspection').length > 0 && (
                      <button onClick={() => setAlertType('inspection')} className="relative flex items-center justify-center text-rose-500 bg-rose-50 border border-rose-200 w-7 h-7 rounded-full hover:bg-rose-100 transition shadow-sm mr-1">
                        <Bell className="w-3.5 h-3.5 animate-pulse" />
                        <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center shadow-sm">
                          {getActiveAlerts('inspection').length}
                        </span>
                      </button>
                    )}
                    <button onClick={() => setView('tasks_inspection')} className="bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 text-xs px-2 py-1 rounded flex items-center transition shadow-sm font-bold">
                      全件表示
                    </button>
                    <span className="bg-white border border-purple-100 text-purple-700 font-bold text-xs rounded-full px-2 py-0.5 shadow-sm">
                      {inspectionTasks.length || 1}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex-1 space-y-3 bg-slate-50">
                  {/* Mock pending task */}
                  <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden flex flex-col">
                    <div className="pl-1">
                      <span className="font-bold text-sm text-slate-900 block mb-1">
                        特定自主検査 (年次車検)
                      </span>
                      <span className="text-xs text-slate-400 block mb-3">
                        詳細なし
                      </span>
                      <span className="text-xs font-bold text-slate-800 block mb-3">
                        PC200-10 (既存ユーザー機){" "}
                        <span className="font-normal text-slate-400 font-mono">
                          N/A
                        </span>
                      </span>
                      <div className="mt-auto flex justify-between items-center pt-2 border-t border-slate-100 divide-x divide-slate-100">
                        <span className="text-[10px] text-slate-600 flex items-center w-1/2">
                          <User className="w-3 h-3 mr-1 opacity-70" />
                          田中 慎吾
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center justify-end w-1/2 pr-1">
                          <Clock className="w-3 h-3 mr-1 opacity-70" />
                          未定
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DashboardSection>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-full bg-transparent max-w-[1600px] mx-auto">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="dashboard-sections">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {sectionOrder.map((sectionId, index) => (
                // @ts-expect-error React key is required but DraggableProps doesn't include it
                <Draggable key={sectionId} draggableId={sectionId} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      {renderSection(sectionId, provided.dragHandleProps)}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {showAddDeliveryModal && (
        <AddDeliveryModal onClose={() => setShowAddDeliveryModal(false)} />
      )}
      {showAddRepairModal && (
        <AddRepairTaskModal onClose={() => setShowAddRepairModal(false)} />
      )}
      {assigningAlert && (
        <AddRepairTaskModal 
          onClose={() => setAssigningAlert(null)}
          initialVehicleId={assigningAlert.vehicleId}
          initialStep={2}
          initialCategory={assigningAlert.type === 'maintenance' ? '定期点検' : (assigningAlert.type === 'patrol' ? '新車巡回' : (assigningAlert.type === 'fc' ? 'フィールドキャンペーン' : '故障修理'))}
          initialTitle="アラート対応"
          onTaskSaved={() => {
            updateAlert(assigningAlert.id, { isIgnored: true });
          }}
        />
      )}
      {showContractModal && (
        <ContractManagementModal onClose={() => setShowContractModal(false)} />
      )}
      {editingVehicleId && (
        <EditDeliveryModal
          vehicleId={editingVehicleId}
          onClose={() => setEditingVehicleId(null)}
        />
      )}
      {editingTaskId && (
        <EditTaskModal
          taskId={editingTaskId}
          onClose={() => setEditingTaskId(null)}
        />
      )}
      {reportTaskToApprove && (
        <TaskReportApprovalModal
          task={reportTaskToApprove}
          onClose={() => setReportTaskToApprove(null)}
        />
      )}
      {alertType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-rose-50">
              <h3 className="font-bold text-rose-800 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-rose-600" /> 
                {alertType === 'patrol' && '新車定期巡回アラート'}
                {alertType === 'fc' && 'フィールドキャンペーンアラート'}
                {alertType === 'maintenance' && '定期メンテナンスアラート'}
                {alertType === 'inspection' && '特定自主検査アラート'}
                {alertType === 'contract' && '契約・補償管理アラート'}
              </h3>
              <button onClick={() => setAlertType(null)} className="text-rose-400 hover:text-rose-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto bg-slate-50">
              {getActiveAlerts(alertType).length === 0 ? (
                <div className="text-center text-slate-500 py-8 font-medium">現在アラートはありません</div>
              ) : (
                getActiveAlerts(alertType).map(alert => (
                  <div key={alert.id} className="bg-white border border-rose-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900">{alert.targetModelName}</h4>
                      <p className="text-sm text-rose-600 mt-1">{alert.description}</p>
                    </div>
                    <div className="flex items-center space-x-2 w-full md:w-auto">
                      <button 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-sm font-bold transition whitespace-nowrap shadow-sm"
                        onClick={() => {
                          setAssigningAlert(alert);
                        }}
                      >
                        担当者をアサイン
                      </button>
                      <button 
                        onClick={() => updateAlert(alert.id, { isIgnored: true })}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded text-sm font-bold transition whitespace-nowrap"
                      >
                        無視する
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
