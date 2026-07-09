import React from "react";
import { useApp } from "../context/AppContext";
import {
  Package,
  Calendar,
  Maximize2,
  User,
  Clock,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";

import { ServiceTask } from "../types";

interface InventoryInspectionSectionProps {
  setEditingTaskId: (id: string) => void;
  setEditingVehicleId: (id: string) => void;
  setReportTaskToApprove: (task: ServiceTask) => void;
}

export const InventoryInspectionSection: React.FC<
  InventoryInspectionSectionProps
> = ({ setEditingTaskId, setEditingVehicleId, setReportTaskToApprove }) => {
  const { tasks, vehicles, partStocks, staff, setView } = useApp();

  const getStaffName = (task?: any) => {
    if (task?.staffIds && task.staffIds.length > 0) {
      return task.staffIds.map((id: string) => staff.find((s) => s.id === id)?.name || "未定").join(", ");
    }
    return staff.find((s) => s.id === task?.staffId)?.name || "未定";
  };

  const getVehicleInfo = (vehicleId: string) =>
    vehicles.find((v) => v.id === vehicleId);
  const getPartInfo = (partId: string) =>
    partStocks.find((p) => p.id === partId);

  // カテゴリが在庫点検のもの
  const inspectionTasks = tasks.filter((t) => t.category === "在庫点検" && !t.isApproved);

  return (
    <div className="bg-white rounded-xl border border-slate-200 flex flex-col shadow-sm overflow-hidden h-full">
      <div className="p-3 flex items-center justify-between bg-teal-50 border-b border-teal-100/50 text-teal-900">
        <h3 className="font-bold text-sm flex items-center">
          <Package className="w-4 h-4 mr-2 text-teal-500" /> 在庫点検タスク
          (車両・部品)
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView("stock_calendar")}
            className="bg-white border border-teal-200 text-teal-700 hover:bg-teal-50 text-xs px-2 py-1 rounded flex items-center transition shadow-sm"
          >
            <Calendar className="w-3 h-3 mr-1" /> カレンダー
          </button>
          <div className="bg-white border border-teal-100 text-teal-700 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
            {inspectionTasks.length}
          </div>
        </div>
      </div>
      <div className="p-4 grid grid-cols-1 gap-4 bg-slate-50 flex-1 overflow-y-auto max-h-[600px]">
        {inspectionTasks.map((task) => {
          const isVehicle = !!task.vehicleId;
          const v = isVehicle ? getVehicleInfo(task.vehicleId!) : null;
          const p =
            !isVehicle && task.partStockId
              ? getPartInfo(task.partStockId)
              : null;

          const title = v ? v.modelName : p ? p.partName : task.title;
          const subTitle = v
            ? v.serialNumber
            : p
              ? `部品番号: ${p.partNumber.split("_")[0]}`
              : "";

          return (
            <div
              key={task.id}
              onClick={() => setEditingTaskId(task.id)}
              className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isVehicle ? "bg-indigo-50 text-indigo-700 border border-indigo-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}
                    >
                      {isVehicle ? "車両" : "部品"}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 block mt-1">
                    {title}
                  </span>
                  {subTitle && (
                    <span className="text-xs text-slate-500 font-mono block mt-0.5">
                      {subTitle}
                    </span>
                  )}
                </div>
                <span className="text-xs px-2 py-1 rounded bg-teal-50 text-teal-700 border border-teal-200 font-medium whitespace-nowrap">
                  期限:{" "}
                  {task.deadline
                    ? format(new Date(task.deadline), "M/d")
                    : "未定"}
                </span>
              </div>
              <div className="flex justify-between text-sm text-slate-500 mb-4 bg-slate-50 p-2 rounded border border-slate-100">
                <span className="flex items-center">
                  <User className="w-3.5 h-3.5 mr-1.5 opacity-70" />{" "}
                  {getStaffName(task)}
                </span>
                <span className="flex items-center font-medium">
                  <Clock className="w-3.5 h-3.5 mr-1.5 opacity-70" />{" "}
                  {task.progress}
                </span>
              </div>

              {task.progress === "完了" && !task.isApproved && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setReportTaskToApprove(task); }}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium py-2 rounded flex items-center justify-center transition shadow-sm mt-2"
                >
                  <CheckCircle className="w-4 h-4 mr-1.5" /> 結果確認及び承認
                </button>
              )}
            </div>
          );
        })}
        {inspectionTasks.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400">
            在庫点検の対象はありません
          </div>
        )}
      </div>
    </div>
  );
};
