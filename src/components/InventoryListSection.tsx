import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Package, Plus, Save, X, History, Box, Car } from "lucide-react";
import { PartStockItem } from "../types";
import { format, addMonths } from "date-fns";

interface PartInputRow {
  id: string;
  partNumber: string;
  partName: string;
  quantity: string;
  needsInspection: boolean;
  inspectionIntervalMonths: string;
}

export const InventoryListSection = () => {
  const { partStocks, updatePartStocks, vehicles, addTask, addVehicle, updateVehicle } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ modelName: "", serialNumber: "" });
  const [inputs, setInputs] = useState<PartInputRow[]>([
    {
      id: "1",
      partNumber: "",
      partName: "",
      quantity: "1",
      needsInspection: false,
      inspectionIntervalMonths: "6",
    },
  ]);
  const [historyModalItem, setHistoryModalItem] =
    useState<PartStockItem | null>(null);
  const [activeTab, setActiveTab] = useState<"vehicle" | "part">("vehicle");
  const [deliveryPromptVehicle, setDeliveryPromptVehicle] = useState<import("../types").Vehicle | null>(null);

  const stockVehicles = vehicles.filter(
    (v) => (v.status === "在庫" || v.stockStatus === "フリー在庫") && v.status !== "出荷済",
  );

  const handleAddVehicle = () => {
    if (!newVehicle.modelName || !newVehicle.serialNumber) return;
    
    addVehicle({
      modelName: newVehicle.modelName,
      serialNumber: newVehicle.serialNumber,
      status: '納車前整備待',
      stockStatus: '在庫',
      currentSmr: 0,
      tasks: [],
      history: []
    });
    
    setNewVehicle({ modelName: "", serialNumber: "" });
    setShowAddVehicleModal(false);
  };

  const handleAddRow = () => {
    setInputs((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        partNumber: "",
        partName: "",
        quantity: "1",
        needsInspection: false,
        inspectionIntervalMonths: "6",
      },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    setInputs((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSubmit = () => {
    const validInputs = inputs.filter(
      (i) => i.partNumber.trim() && parseInt(i.quantity) > 0,
    );
    if (validInputs.length === 0) return;

    validInputs.forEach((input) => {
      const isExisting = partStocks.some(
        (p) => p.partNumber === input.partNumber.trim(),
      );
      let finalId = "";

      if (isExisting) {
        const msg = `以下の品番は既に在庫に存在します。\n${input.partNumber.trim()}\n\n同じ在庫がある場合、個数を増やしますか？\n[OK] = 個数を増やす\n[キャンセル] = 新しく別行で追加する`;
        const isIncrease = window.confirm(msg);

        if (isIncrease) {
          updatePartStocks([
            {
              partNumber: input.partNumber.trim(),
              partName: input.partName.trim(),
              quantity: parseInt(input.quantity),
            },
          ]);
          // We can't easily retrieve the id after updatePartStocks for existing parts right now to add task.
          // In a real app we'd fetch it. For now, schedule task without explicit partStockId or use find.
        } else {
          finalId = `p${Date.now()}_${Math.random().toString(36).substring(7)}`;
          updatePartStocks([
            {
              id: finalId,
              partNumber:
                input.partNumber.trim() +
                "_" +
                Math.random().toString(36).substring(7),
              partName: input.partName.trim(),
              quantity: parseInt(input.quantity),
            },
          ]);
        }
      } else {
        finalId = `p${Date.now()}_${Math.random().toString(36).substring(7)}`;
        updatePartStocks([
          {
            id: finalId,
            partNumber: input.partNumber.trim(),
            partName: input.partName.trim(),
            quantity: parseInt(input.quantity),
          },
        ]);
      }

      // Add inspection task if needed
      if (input.needsInspection) {
        const months = parseInt(input.inspectionIntervalMonths) || 6;
        const deadline = format(addMonths(new Date(), months), "yyyy-MM-dd");

        // Find partId if we increased existing (heuristic)
        const pId =
          finalId ||
          partStocks.find((p) => p.partNumber === input.partNumber.trim())?.id;

        addTask({
          title: `定期在庫点検: ${input.partName.trim()}`,
          category: "在庫点検",
          description: `在庫数および状態の確認を行ってください。品番: ${input.partNumber.trim()}`,
          urgency: "中",
          deadline: deadline,
          partStockId: pId,
        });
      }
    });

    setShowAddModal(false);
    setInputs([
      {
        id: "1",
        partNumber: "",
        partName: "",
        quantity: "1",
        needsInspection: false,
        inspectionIntervalMonths: "6",
      },
    ]);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 flex flex-col shadow-sm overflow-hidden h-full">
      <div className="bg-slate-50 border-b border-slate-200 p-2 flex justify-between items-center">
        <div className="flex space-x-1 p-1 bg-slate-200/50 rounded-lg">
          <button
            onClick={() => setActiveTab("vehicle")}
            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${
              activeTab === "vehicle"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            <div className="flex items-center">
              <Car className="w-4 h-4 mr-1.5" /> 車両在庫 (
              {stockVehicles.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("part")}
            className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${
              activeTab === "part"
                ? "bg-white text-amber-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            <div className="flex items-center">
              <Box className="w-4 h-4 mr-1.5" /> 部品在庫 ({partStocks.length})
            </div>
          </button>
        </div>

        {activeTab === "part" && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 text-xs px-3 py-1.5 rounded flex items-center transition shadow-sm font-bold"
          >
            <Plus className="w-3 h-3 mr-1" /> 在庫追加
          </button>
        )}
        {activeTab === "vehicle" && (
          <button
            onClick={() => setShowAddVehicleModal(true)}
            className="bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs px-3 py-1.5 rounded flex items-center transition shadow-sm font-bold"
          >
            <Plus className="w-3 h-3 mr-1" /> 在庫追加
          </button>
        )}
      </div>

      <div className="p-0 overflow-y-auto max-h-[600px] flex-1">
        {activeTab === "vehicle" ? (
          stockVehicles.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              車両在庫がありません
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">モデル</th>
                  <th className="py-3 px-4">車台番号</th>
                  <th className="py-3 px-4">ステータス</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {stockVehicles.map((v) => (
                  <tr
                    key={v.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setDeliveryPromptVehicle(v)}
                  >
                    <td className="py-3 px-4 font-bold">{v.modelName}</td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">
                      {v.serialNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] px-2 py-0.5 rounded border bg-indigo-50 text-indigo-700 border-indigo-200 font-medium">
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : partStocks.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            部品在庫がありません
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">部品番号</th>
                <th className="py-3 px-4">部品名</th>
                <th className="py-3 px-4 text-right">在庫数</th>
                <th className="py-3 px-4">最終仕入日</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {partStocks.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-mono">
                    {p.partNumber.split("_")[0]}
                  </td>
                  <td className="py-3 px-4">{p.partName}</td>
                  <td className="py-3 px-4 text-right font-bold">
                    {p.quantity}
                  </td>
                  <td className="py-3 px-4">
                    {p.lastPurchaseDate ? (
                      <button
                        onClick={() => setHistoryModalItem(p)}
                        className="text-amber-600 hover:text-amber-700 underline underline-offset-2 flex items-center"
                      >
                        {format(new Date(p.lastPurchaseDate), "yyyy/MM/dd")}
                        <History className="w-3 h-3 ml-1" />
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Part Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center">
                <Box className="w-5 h-5 mr-2 text-amber-500" />
                在庫（部品）の追加
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-50/50 space-y-4">
              {inputs.map((row, idx) => (
                <div
                  key={row.id}
                  className="flex flex-col gap-3 bg-white p-4 rounded border border-slate-200 shadow-sm relative"
                >
                  <div className="flex gap-3 items-start pr-8">
                    <div className="flex-[2]">
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        部品番号 (品番)
                      </label>
                      <input
                        type="text"
                        value={row.partNumber}
                        onChange={(e) => {
                          const n = [...inputs];
                          n[idx].partNumber = e.target.value;
                          setInputs(n);
                        }}
                        className="w-full border-slate-300 rounded-md text-sm p-2"
                        placeholder="例: P-10293"
                      />
                    </div>
                    <div className="flex-[3]">
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        部品名
                      </label>
                      <input
                        type="text"
                        value={row.partName}
                        onChange={(e) => {
                          const n = [...inputs];
                          n[idx].partName = e.target.value;
                          setInputs(n);
                        }}
                        className="w-full border-slate-300 rounded-md text-sm p-2"
                        placeholder="例: オイルフィルター"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        個数
                      </label>
                      <input
                        type="number"
                        value={row.quantity}
                        onChange={(e) => {
                          const n = [...inputs];
                          n[idx].quantity = e.target.value;
                          setInputs(n);
                        }}
                        className="w-full border-slate-300 rounded-md text-sm p-2 text-right"
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Inspection Settings */}
                  <div className="flex items-center gap-4 bg-amber-50/50 p-3 rounded-lg border border-amber-100/50">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4 mr-2"
                        checked={row.needsInspection}
                        onChange={(e) => {
                          const n = [...inputs];
                          n[idx].needsInspection = e.target.checked;
                          setInputs(n);
                        }}
                      />
                      <span className="text-sm font-bold text-amber-900">
                        在庫点検をスケジュールする
                      </span>
                    </label>
                    {row.needsInspection && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-amber-700">
                          点検間隔:
                        </span>
                        <input
                          type="number"
                          className="w-16 border-amber-200 rounded text-xs p-1 text-right focus:border-amber-400 focus:ring-amber-400"
                          value={row.inspectionIntervalMonths}
                          onChange={(e) => {
                            const n = [...inputs];
                            n[idx].inspectionIntervalMonths = e.target.value;
                            setInputs(n);
                          }}
                          min="1"
                        />
                        <span className="text-xs text-amber-700">ヶ月後</span>
                      </div>
                    )}
                  </div>

                  {inputs.length > 1 && (
                    <button
                      onClick={() => handleRemoveRow(row.id)}
                      className="absolute right-4 top-4 text-red-400 hover:text-red-600 bg-red-50 p-1 rounded-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={handleAddRow}
                className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 font-medium text-sm rounded-lg hover:border-slate-300 hover:text-slate-700 hover:bg-slate-50 transition"
              >
                + 別の部品行を追加する
              </button>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-white">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                キャンセル
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg shadow-sm flex items-center transition"
              >
                <Save className="w-4 h-4 mr-2" /> 追加を保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {historyModalItem && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-amber-50">
              <h3 className="font-bold text-amber-900">
                仕入履歴: {historyModalItem.partName}
              </h3>
              <button
                onClick={() => setHistoryModalItem(null)}
                className="text-amber-500 hover:text-amber-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-0 max-h-[60vh] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                  <tr>
                    <th className="py-2 px-4">日付</th>
                    <th className="py-2 px-4 text-right">追加個数</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyModalItem.history?.map((h, i) => (
                    <tr key={i}>
                      <td className="py-2 px-4">
                        {format(new Date(h.date), "yyyy/MM/dd")}
                      </td>
                      <td className="py-2 px-4 text-right">+{h.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      
      {deliveryPromptVehicle && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-indigo-50">
              <h3 className="font-bold text-slate-800 flex items-center">
                <Car className="w-5 h-5 mr-2 text-indigo-500" />
                納入のアサイン
              </h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                この車両（{deliveryPromptVehicle.modelName} / {deliveryPromptVehicle.serialNumber}）の納入作業をスケジュールしますか？
              </p>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setDeliveryPromptVehicle(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  addTask({
                    vehicleId: deliveryPromptVehicle.id,
                    targetModelName: deliveryPromptVehicle.modelName,
                    title: '納入作業',
                    category: '出庫・納入',
                    urgency: '1ヶ月以内',
                    deadline: addMonths(new Date(), 1).toISOString(),
                    chatMessages: []
                  });
                  updateVehicle(deliveryPromptVehicle.id, { status: '出荷予定' });
                  setDeliveryPromptVehicle(null);
                }}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm flex items-center transition"
              >
                はい
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-indigo-50">
              <h3 className="font-bold text-slate-800 flex items-center">
                <Car className="w-5 h-5 mr-2 text-indigo-500" />
                車両在庫の追加
              </h3>
              <button
                onClick={() => setShowAddVehicleModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  モデル名・型式 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newVehicle.modelName}
                  onChange={(e) => setNewVehicle({ ...newVehicle, modelName: e.target.value })}
                  className="w-full border-slate-300 rounded-lg p-2"
                  placeholder="例: FG25T-7"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  車台番号 (シリアル) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newVehicle.serialNumber}
                  onChange={(e) => setNewVehicle({ ...newVehicle, serialNumber: e.target.value })}
                  className="w-full border-slate-300 rounded-lg p-2 font-mono"
                  placeholder="例: 12345"
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setShowAddVehicleModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddVehicle}
                disabled={!newVehicle.modelName || !newVehicle.serialNumber}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow-sm flex items-center transition"
              >
                <Save className="w-4 h-4 mr-2" /> 追加を保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
