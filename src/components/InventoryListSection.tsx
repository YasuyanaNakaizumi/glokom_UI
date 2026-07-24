import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Package, Plus, Save, X, History, Box, Car, MapPin } from "lucide-react";
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
  const { partStocks, updatePartStocks, vehicles, addTask, addVehicle, updateVehicle, t, tEnum } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ modelName: "", serialNumber: "" });
  const [locationModalItem, setLocationModalItem] = useState<PartStockItem | null>(null);
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
        const msg = t('modal.inventoryList.existingPartConfirmMessage', { partNumber: input.partNumber.trim() });
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
          title: `${t('modal.inventoryList.inventoryInspectionPrefix')}: ${input.partName.trim()}`,
          category: "在庫点検",
          description: `${t('modal.inventoryList.inventoryInspectionDescription')} ${t('modal.inventoryList.partNumberHeader')}: ${input.partNumber.trim()}`,
          urgency: "数ヶ月後",
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
              <Car className="w-4 h-4 mr-1.5" /> {t('modal.inventoryList.vehicleTab')} (
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
              <Box className="w-4 h-4 mr-1.5" /> {t('modal.inventoryList.partTab')} ({partStocks.length})
            </div>
          </button>
        </div>

        {activeTab === "part" && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 text-xs px-3 py-1.5 rounded flex items-center transition shadow-sm font-bold"
          >
            <Plus className="w-3 h-3 mr-1" /> {t('modal.inventoryList.addPartStock')}
          </button>
        )}
        {activeTab === "vehicle" && (
          <button
            onClick={() => setShowAddVehicleModal(true)}
            className="bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-xs px-3 py-1.5 rounded flex items-center transition shadow-sm font-bold"
          >
            <Plus className="w-3 h-3 mr-1" /> {t('modal.inventoryList.addVehicleStock')}
          </button>
        )}
      </div>

      <div className="p-0 overflow-y-auto max-h-[600px] flex-1">
        {activeTab === "vehicle" ? (
          stockVehicles.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              {t('modal.inventoryList.noVehicleStock')}
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{t('modal.inventoryList.modelHeader')}</th>
                  <th className="py-3 px-4">{t('modal.inventoryList.chassisHeader')}</th>
                  <th className="py-3 px-4">{t('modal.inventoryList.statusHeader')}</th>
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
                        {tEnum('vehicleStatus', v.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : partStocks.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            {t('modal.inventoryList.noPartStock')}
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">{t('modal.inventoryList.partNumberHeader')}</th>
                <th className="py-3 px-4">{t('modal.inventoryList.partNameHeader')}</th>
                <th className="py-3 px-4 text-right">{t('modal.inventoryList.quantityHeader')}</th>
                <th className="py-3 px-4">{t('modal.inventoryList.lastPurchaseDateHeader')}</th>
                <th className="py-3 px-4 text-center">{t('modal.inventoryList.locationHeader')}</th>
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
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setLocationModalItem(p)}
                      className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title={t('modal.inventoryList.locationTooltip')}
                    >
                      <MapPin className="w-5 h-5" />
                    </button>
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
                {t('modal.inventoryList.addPartModalTitle')}
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
                        {t('modal.inventoryList.partNumberLabel')}
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
                        placeholder={t('modal.inventoryList.partNumberExample')}
                      />
                    </div>
                    <div className="flex-[3]">
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        {t('modal.inventoryList.partNameLabel')}
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
                        placeholder={t('modal.inventoryList.partNameExample')}
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-bold text-slate-500 mb-1">
                        {t('modal.inventoryList.quantityLabel')}
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
                        {t('modal.inventoryList.scheduleInspection')}
                      </span>
                    </label>
                    {row.needsInspection && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-amber-700">
                          {t('modal.inventoryList.inspectionIntervalLabel')}
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
                        <span className="text-xs text-amber-700">{t('modal.inventoryList.monthsLater')}</span>
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
                {t('modal.inventoryList.addAnotherRow')}
              </button>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-white">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg shadow-sm flex items-center transition"
              >
                <Save className="w-4 h-4 mr-2" /> {t('modal.inventoryList.saveAdd')}
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
                {t('modal.inventoryList.historyTitle', { name: historyModalItem.partName })}
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
                    <th className="py-2 px-4">{t('modal.inventoryList.historyDateHeader')}</th>
                    <th className="py-2 px-4 text-right">{t('modal.inventoryList.historyQuantityHeader')}</th>
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
                {t('modal.inventoryList.deliveryAssignTitle')}
              </h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4">
                {t('modal.inventoryList.deliveryAssignBody', { model: deliveryPromptVehicle.modelName, serial: deliveryPromptVehicle.serialNumber })}
              </p>
            </div>
            <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setDeliveryPromptVehicle(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  addTask({
                    vehicleId: deliveryPromptVehicle.id,
                    targetModelName: deliveryPromptVehicle.modelName,
                    title: t('modal.inventoryList.deliveryTaskTitle'),
                    category: '納入作業',
                    urgency: '1ヶ月以内',
                    deadline: addMonths(new Date(), 1).toISOString(),
                    chatMessages: []
                  });
                  updateVehicle(deliveryPromptVehicle.id, { status: '出荷予定' });
                  setDeliveryPromptVehicle(null);
                }}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg shadow-sm flex items-center transition"
              >
                {t('common.yes')}
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
                {t('modal.inventoryList.vehicleAddTitle')}
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
                  {t('modal.inventoryList.modelNameLabel')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newVehicle.modelName}
                  onChange={(e) => setNewVehicle({ ...newVehicle, modelName: e.target.value })}
                  className="w-full border-slate-300 rounded-lg p-2"
                  placeholder={t('modal.inventoryList.modelNameExample')}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {t('modal.inventoryList.chassisNumberLabel')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newVehicle.serialNumber}
                  onChange={(e) => setNewVehicle({ ...newVehicle, serialNumber: e.target.value })}
                  className="w-full border-slate-300 rounded-lg p-2 font-mono"
                  placeholder={t('modal.inventoryList.chassisNumberExample')}
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50">
              <button
                onClick={() => setShowAddVehicleModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleAddVehicle}
                disabled={!newVehicle.modelName || !newVehicle.serialNumber}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-lg shadow-sm flex items-center transition"
              >
                <Save className="w-4 h-4 mr-2" /> {t('modal.inventoryList.saveAdd')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Modal */}
      {locationModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
                {t('modal.inventoryList.locationConfirmTitle')}
              </h3>
              <button
                onClick={() => setLocationModalItem(null)}
                className="text-slate-400 hover:text-slate-600 hover:bg-white rounded-full p-1 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="text-xs text-slate-500 font-bold mb-1">{t('modal.inventoryList.partNameField')}</div>
                <div className="text-slate-800 font-medium">{locationModalItem.partName}</div>
              </div>
              <div className="mb-6">
                <div className="text-xs text-slate-500 font-bold mb-1">{t('modal.inventoryList.currentLocation')}</div>
                <div className="text-lg font-bold text-indigo-700 bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex items-center justify-center">
                  {locationModalItem.locationId ? (
                    // 実際にはparking情報などから名前を引くか、ここでは単純に表示する
                    // モックとして「第1倉庫 棚A-3」等を表示
                    locationModalItem.locationId
                  ) : (
                    t('modal.inventoryList.notSet')
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setLocationModalItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
