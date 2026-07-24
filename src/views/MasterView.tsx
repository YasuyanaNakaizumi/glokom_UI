import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Wrench, FileText, Truck, Plus, Trash2, Save, Replace, CheckSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { ParkingArea, ContractTemplate, MechanicReportTemplate } from '../types';
import { ContractEditModal } from '../components/ContractEditModal';
import { PartsUpdateModal } from '../components/PartsUpdateModal';
import { ReportTemplateEditModal } from '../components/ReportTemplateEditModal';
import { CustomerMasterSection } from '../components/CustomerMasterSection';
import { ToolEditModal } from '../components/ToolEditModal';
import { VehicleMasterEditModal } from '../components/VehicleMasterEditModal';
import { tLegacyMaster } from '../lib/i18n';

export const MasterView = () => {
  const { 
    parking, tools, setTools, contracts, vehicleMasters, setVehicleMasters, reportTemplates,
    updateParking, t, lang, addContract, updateContract, deleteContract, batchUpdatePart,
    addReportTemplate, updateReportTemplate, deleteReportTemplate
  } = useApp();
  const [tab, setTab] = useState<'parking' | 'tools' | 'contracts' | 'vehicles' | 'reports' | 'customers'>('parking');

  // Parking State
  const [localParking, setLocalParking] = useState<ParkingArea[]>(parking);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Contract Modal State
  const [editingContract, setEditingContract] = useState<ContractTemplate | 'new' | null>(null);
  const [showPartsUpdateModal, setShowPartsUpdateModal] = useState(false);

  // Report Modal State
  const [editingReportTemplate, setEditingReportTemplate] = useState<MechanicReportTemplate | 'new' | null>(null);
  const [parkingTab, setParkingTab] = useState<'駐車場' | '作業場' | '工具置き場' | '書物棚'>('駐車場');
  const [editingTool, setEditingTool] = useState<any | 'new' | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<any | 'new' | null>(null);

  const resolveLabel = (key: string, fallback: string, params?: Record<string, string | number>) => {
    const translated = t(key, params);
    if (translated !== key) return translated;
    if (!params) return fallback;
    return fallback.replace(/\{\{(\w+)\}\}/g, (_, name) => String(params[name] ?? `{{${name}}}`));
  };

  const translateLegacyValue = (
    kind: Parameters<typeof tLegacyMaster>[1],
    item: any,
    field: Parameters<typeof tLegacyMaster>[3],
    fallback: string
  ) => {
    const rawValue = typeof item?.[field] === 'string' ? item[field] : fallback;
    const directTranslated = rawValue ? t(rawValue) : rawValue;
    if (directTranslated !== rawValue) return directTranslated;
    return tLegacyMaster(lang, kind, item.id, field, fallback);
  };

  const getParkingTabLabel = (tabValue: '駐車場' | '作業場' | '工具置き場' | '書物棚') => {
    switch (tabValue) {
      case '駐車場': return resolveLabel('master.parkingSubTabParking', lang === 'ja' ? '駐車場' : 'Parking');
      case '作業場': return resolveLabel('master.parkingSubTabWorkspace', lang === 'ja' ? '作業場' : 'Worksite');
      case '工具置き場': return resolveLabel('master.parkingSubTabToolStorage', lang === 'ja' ? '工具置き場' : 'Tool Storage');
      case '書物棚': return resolveLabel('master.parkingSubTabBookshelf', lang === 'ja' ? '書物棚' : 'Bookshelf');
      default: return tabValue;
    }
  };

  const parkingTabLabel = getParkingTabLabel(parkingTab);

  const getToolName = (tool: any) => translateLegacyValue('tool', tool, 'name', tool.name);
  const getToolDescription = (tool: any) => translateLegacyValue('tool', tool, 'description', tool.description || '—');
  const getContractTitle = (contract: any) => translateLegacyValue('contract', contract, 'name', contract.title);
  const getContractDescription = (contract: any) => translateLegacyValue('contract', contract, 'description', contract.description || '—');
  const getVehicleModelName = (vehicle: any) => translateLegacyValue('vehicleMaster', vehicle, 'name', vehicle.modelName);
  const getVehicleType = (vehicle: any) => translateLegacyValue('vehicleMaster', vehicle, 'type', vehicle.type || '—');
  const getReportTemplateName = (template: any) => translateLegacyValue('reportTemplate', template, 'name', template.name);

  useEffect(() => { setLocalParking(parking); }, [parking]);

  const handlePointerDown = (e: React.PointerEvent, id: string) => {
    e.preventDefault();
    setDraggedId(id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggedId || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - 50; // offset
    const y = e.clientY - rect.top - 50;  // offset
    setLocalParking(prev => prev.map(p => p.id === draggedId ? { ...p, x: Math.max(0, x), y: Math.max(0, y) } : p));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggedId) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setDraggedId(null);
    }
  };

  const saveParking = () => {
    updateParking(localParking);
    alert(resolveLabel('master.saveLayoutSuccess', lang === 'ja' ? '駐車場レイアウトを保存しました' : 'Parking layout saved'));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4 md:p-8 shrink-0 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FileText className="w-6 h-6 mr-2 text-indigo-600" />
          {resolveLabel('masterTab', lang === 'ja' ? 'マスタ管理' : 'Master Data')}
        </h1>
        <p className="text-sm text-gray-500 mt-2">{resolveLabel('master.subtitle', lang === 'ja' ? '作業場・駐車場や工具、契約テンプレート、代理店特殊車両/クレーン等の管理を行います' : 'Manage worksites, parking, tools, contract templates, and dealer special vehicles / cranes.')}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 shrink-0 overflow-x-auto scrollbar-hide">
        <button 
          onClick={() => setTab('parking')} 
          className={cn("px-4 md:px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors", tab === 'parking' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300')}
        >
          {resolveLabel('master.tabParking', lang === 'ja' ? '作業場・駐車場' : 'Worksites / Parking')}
        </button>
        <button 
          onClick={() => setTab('tools')} 
          className={cn("px-4 md:px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors", tab === 'tools' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300')}
        >
          {resolveLabel('master.tabTools', lang === 'ja' ? '工具・器具' : 'Tools / Equipment')}
        </button>
        <button 
          onClick={() => setTab('contracts')} 
          className={cn("px-4 md:px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors", tab === 'contracts' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300')}
        >
          {resolveLabel('master.tabContracts', lang === 'ja' ? '契約テンプレート' : 'Contract Templates')}
        </button>
        <button 
          onClick={() => setTab('vehicles')} 
          className={cn("px-4 md:px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors", tab === 'vehicles' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300')}
        >
          {resolveLabel('master.tabVehicles', lang === 'ja' ? '代理店特殊車両/クレーン等' : 'Dealer Special Vehicles / Cranes')}
        </button>
        <button 
          onClick={() => setTab('reports')} 
          className={cn("px-4 md:px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors", tab === 'reports' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300')}
        >
          {resolveLabel('master.tabReports', lang === 'ja' ? 'メカニック報告様式' : 'Mechanic Report Templates')}
        </button>
        <button 
          onClick={() => setTab('customers')} 
          className={cn("px-4 md:px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors", tab === 'customers' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300')}
        >
          {resolveLabel('master.tabCustomers', lang === 'ja' ? '担当エリア・顧客' : 'Service Area / Customers')}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 relative">
        {tab === 'customers' && (
          <div className="absolute inset-0 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
            <CustomerMasterSection />
          </div>
        )}
        {tab === 'parking' && (
          <div className="flex flex-col lg:flex-row gap-4 h-[600px] lg:h-full">
            <div className="w-full lg:w-48 shrink-0 flex flex-col gap-2">
               <div className="bg-white border border-slate-200 rounded-lg p-2 flex flex-col gap-1 shadow-sm">
                 {(['駐車場', '作業場', '工具置き場', '書物棚'] as const).map(tabValue => (
                    <button 
                      key={tabValue} 
                      onClick={() => setParkingTab(tabValue as any)} 
                      className={`p-3 rounded-md text-left font-bold text-sm transition-colors ${parkingTab === tabValue ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                    >
                      {getParkingTabLabel(tabValue)}
                    </button>
                 ))}
               </div>
            </div>
            
            <div className="flex-1 flex flex-col lg:flex-row gap-6 min-w-0">
              <div className="w-full lg:w-80 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col shrink-0">
                <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-gray-800">{parkingTabLabel}{resolveLabel('master.parkingListSuffix', lang === 'ja' ? 'リスト' : 'List')}</h3>
                  <button onClick={() => setLocalParking([...localParking, { id: 'p' + Date.now(), name: `${resolveLabel('master.addButton', lang === 'ja' ? '追加' : 'Add')} ${parkingTabLabel}`, type: parkingTab as any, capacity: 1, x: 10, y: 10, width: 100, height: 100 }])} className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-2 py-1 rounded font-bold flex items-center transition"><Plus className="w-3 h-3 mr-1"/>{resolveLabel('master.addButton', lang === 'ja' ? '追加' : 'Add')}</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {localParking.filter(p => p.type === parkingTab || (!p.type && parkingTab === '駐車場')).map(p => (
                    <div key={p.id} className="border border-gray-200 p-3 rounded bg-slate-50 relative group">
                      <button onClick={() => setLocalParking(localParking.filter(x => x.id !== p.id))} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-4 h-4"/></button>
                      <input type="text" className="font-bold text-sm bg-transparent border-b border-dashed border-gray-400 focus:outline-none w-3/4 mb-3 text-indigo-900" value={p.name} onChange={e => {
                        const newP = [...localParking];
                        const target = newP.find(x => x.id === p.id);
                        if (target) target.name = e.target.value;
                        setLocalParking(newP);
                      }} />
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        {parkingTab !== '書物棚' && <div>{resolveLabel('master.capacityLabel', lang === 'ja' ? '収容台数' : 'Capacity')}: <input type="number" className="w-16 border rounded px-1" value={p.capacity} onChange={e => { const newP = [...localParking]; const target = newP.find(x => x.id === p.id); if (target) target.capacity = parseInt(e.target.value)||0; setLocalParking(newP); }}/></div>}
                        <div>{resolveLabel('master.widthLabel', lang === 'ja' ? '幅' : 'Width')}: <input type="number" className="w-16 border rounded px-1" value={p.width} onChange={e => { const newP = [...localParking]; const target = newP.find(x => x.id === p.id); if (target) target.width = parseInt(e.target.value)||0; setLocalParking(newP); }}/></div>
                        <div>{resolveLabel('master.heightLabel', lang === 'ja' ? '高さ' : 'Height')}: <input type="number" className="w-16 border rounded px-1" value={p.height} onChange={e => { const newP = [...localParking]; const target = newP.find(x => x.id === p.id); if (target) target.height = parseInt(e.target.value)||0; setLocalParking(newP); }}/></div>
                      </div>
                    </div>
                  ))}
                  {localParking.filter(p => p.type === parkingTab || (!p.type && parkingTab === '駐車場')).length === 0 && (
                    <div className="text-center py-8 text-sm text-slate-400 border border-dashed border-slate-200 rounded-lg">
                      {parkingTabLabel}{resolveLabel('master.noneLabel', lang === 'ja' ? 'がありません' : ' is empty')}
                    </div>
                  )}
                </div>
                <div className="p-4 border-t bg-gray-50">
                  <button onClick={saveParking} className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded font-bold flex items-center justify-center transition"><Save className="w-4 h-4 mr-2"/>{resolveLabel('master.saveLayout', lang === 'ja' ? 'レイアウトを保存' : 'Save Layout')}</button>
                </div>
              </div>

              <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm relative overflow-hidden bg-grid-pattern flex flex-col">
                <div className="p-3 border-b bg-slate-50 shrink-0 flex justify-between items-center">
                  <p className="text-xs text-gray-500 flex items-center"><MapPin className="w-3 h-3 mr-1"/> {resolveLabel('master.layoutTitle', lang === 'ja' ? 'マップ上の矩形をドラッグして位置を調整できます' : 'Drag the rectangles on the map to adjust positions')} ({parkingTabLabel} {resolveLabel('master.mapVisibleSuffix', lang === 'ja' ? 'のみ表示中' : 'visible only')})</p>
                </div>
                <div 
                  className="flex-1 relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] overflow-auto select-none touch-none"
                  ref={mapRef}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                >
                  <div className="min-w-[800px] min-h-[600px] relative">
                    {localParking.filter(p => p.type === parkingTab || (!p.type && parkingTab === '駐車場')).map(p => (
                      <div
                        key={p.id}
                        onPointerDown={(e) => handlePointerDown(e, p.id)}
                        className={cn(
                          "absolute rounded border-2 flex flex-col items-center justify-center cursor-move shadow-md transition-shadow",
                          draggedId === p.id ? "border-indigo-500 bg-indigo-100/80 shadow-xl ring-4 ring-indigo-500/20 z-10" : "border-slate-400 bg-slate-100/80 hover:border-slate-500 hover:bg-slate-200/80"
                        )}
                        style={{
                          left: p.x, top: p.y, width: p.width, height: p.height
                        }}
                      >
                        <span className="font-bold text-xs text-slate-800 text-center px-1 pointer-events-none">{p.name}</span>
                        {parkingTab !== '書物棚' && <span className="text-[10px] text-slate-500 pointer-events-none">{resolveLabel('master.capacityLabel', lang === 'ja' ? '収容台数' : 'Capacity')}: {p.capacity}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'tools' && (
          <div className="bg-white border rounded-lg shadow-sm p-6 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-800">{resolveLabel('master.toolsTitle', lang === 'ja' ? '工具・器具一覧' : 'Tool & Equipment List')}</h3>
              <button onClick={() => setEditingTool('new')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded flex items-center text-sm font-bold transition"><Plus className="w-4 h-4 mr-1"/>{resolveLabel('master.toolAddButton', lang === 'ja' ? '新規追加' : 'Add New')}</button>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr><th className="p-3 border-b">{resolveLabel('master.toolNameHeader', lang === 'ja' ? '工具名' : 'Tool Name')}</th><th className="p-3 border-b">{resolveLabel('master.toolManagerHeader', lang === 'ja' ? '管理者' : 'Manager')}</th><th className="p-3 border-b">{resolveLabel('master.toolDescriptionHeader', lang === 'ja' ? '説明' : 'Description')}</th><th className="p-3 border-b">{resolveLabel('master.toolLocationHeader', lang === 'ja' ? 'デフォルト保管場所' : 'Default Storage')}</th><th className="p-3 border-b text-right">{resolveLabel('master.actionHeader', lang === 'ja' ? '操作' : 'Action')}</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tools.map(tool =>(
                  <tr key={tool.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setEditingTool(tool)}>
                    <td className="p-3 font-bold text-gray-900">{getToolName(tool)}</td>
                    <td className="p-3 text-gray-600">{tool.manager || '—'}</td>
                    <td className="p-3 text-gray-500">{getToolDescription(tool)}</td>
                    <td className="p-3 text-gray-500">
                      {tool.defaultLocationId ? parking.find(p => p.id === tool.defaultLocationId)?.name || resolveLabel('master.unknownLocation', lang === 'ja' ? '不明' : 'Unknown') : '—'}
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={(e) => { e.stopPropagation(); setTools(tools.filter(x => x.id !== tool.id)); }} className="text-red-500 hover:bg-red-50 p-2 rounded transition"><Trash2 className="w-4 h-4"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'contracts' && (
          <div className="bg-white border rounded-lg shadow-sm p-6 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-800">{resolveLabel('master.contractTitle', lang === 'ja' ? '契約テンプレート' : 'Contract Templates')}</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowPartsUpdateModal(true)}
                  className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-3 py-1.5 rounded flex items-center text-sm font-bold transition"
                >
                  <Replace className="w-4 h-4 mr-1"/>{resolveLabel('master.partsUpdateButton', lang === 'ja' ? '部品品番更新' : 'Update Part Numbers')}
                </button>
                <button 
                  onClick={() => setEditingContract('new')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded flex items-center text-sm font-bold transition"
                >
                  <Plus className="w-4 h-4 mr-1"/>{resolveLabel('master.contractAddButton', lang === 'ja' ? '新規追加' : 'Add New')}
                </button>
              </div>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr><th className="p-3 border-b">{resolveLabel('master.contractNameHeader', lang === 'ja' ? 'テンプレート名' : 'Template Name')}</th><th className="p-3 border-b">{resolveLabel('master.contractDescriptionHeader', lang === 'ja' ? '説明' : 'Description')}</th><th className="p-3 border-b">{resolveLabel('master.contractRuleHeader', lang === 'ja' ? 'ルール' : 'Rule')}</th><th className="p-3 border-b">{resolveLabel('master.contractStatusHeader', lang === 'ja' ? '設定状況' : 'Settings Status')}</th><th className="p-3 border-b text-right">{resolveLabel('master.actionHeader', lang === 'ja' ? '操作' : 'Action')}</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contracts.map(c =>(
                  <tr key={c.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setEditingContract(c)}>
                    <td className="p-3 font-bold text-gray-900">{getContractTitle(c)}</td>
                    <td className="p-3 text-gray-600">{getContractDescription(c)}</td>
                    <td className="p-3 text-gray-500"><span className="inline-flex bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-700">{c.rule}</span></td>
                    <td className="p-3 text-gray-500">
                      <div className="flex flex-wrap gap-1">
                        {c.files && c.files.length > 0 && <span className="inline-flex bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold items-center"><FileText className="w-3 h-3 mr-1"/>{c.files.length} {resolveLabel('master.contractFileCountSuffix', lang === 'ja' ? 'ファイル' : 'files')}</span>}
                        {(c.partsConfig || c.reportFormatConfig) && Object.keys({...c.partsConfig, ...c.reportFormatConfig}).length > 0 && <span className="inline-flex bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-bold items-center"><Wrench className="w-3 h-3 mr-1"/>{Object.keys({...c.partsConfig, ...c.reportFormatConfig}).length} {resolveLabel('master.contractModelCountSuffix', lang === 'ja' ? '機種別' : 'models')}</span>}
                        {((c.defaultParts && c.defaultParts.length > 0) || (c.defaultReportFormat && c.defaultReportFormat.length > 0)) && <span className="inline-flex bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold items-center"><CheckSquare className="w-3 h-3 mr-1"/>{resolveLabel('master.contractCommonSettings', lang === 'ja' ? '共通設定' : 'Common Settings')}</span>}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={(e) => { e.stopPropagation(); if(window.confirm(resolveLabel('master.contractDeleteConfirm', lang === 'ja' ? '削除しますか？' : 'Are you sure you want to delete?'))) deleteContract(c.id); }} className="text-red-500 hover:bg-red-50 p-2 rounded transition"><Trash2 className="w-4 h-4"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {editingContract && (
          <ContractEditModal 
            contract={editingContract === 'new' ? undefined : editingContract}
            onClose={() => setEditingContract(null)}
            onSave={(c) => {
              if (editingContract === 'new') {
                addContract(c);
              } else {
                updateContract((c as ContractTemplate).id, c);
              }
            }}
          />
        )}

        {editingReportTemplate && (
          <ReportTemplateEditModal
            template={editingReportTemplate === 'new' ? undefined : editingReportTemplate}
            onClose={() => setEditingReportTemplate(null)}
            onSave={(t) => {
              if (editingReportTemplate === 'new') {
                addReportTemplate(t);
              } else {
                updateReportTemplate((t as MechanicReportTemplate).id, t);
              }
            }}
          />
        )}

        {editingTool && (
          <ToolEditModal
            tool={editingTool === 'new' ? undefined : editingTool}
            onClose={() => setEditingTool(null)}
            onSave={(t) => {
              if (editingTool === 'new') {
                setTools([...tools, t]);
              } else {
                setTools(tools.map(x => x.id === t.id ? t : x));
              }
              setEditingTool(null);
            }}
          />
        )}

        {editingVehicle && (
          <VehicleMasterEditModal
            vehicle={editingVehicle === 'new' ? undefined : editingVehicle}
            onClose={() => setEditingVehicle(null)}
            onSave={(v) => {
              if (editingVehicle === 'new') {
                setVehicleMasters([...vehicleMasters, v]);
              } else {
                setVehicleMasters(vehicleMasters.map(x => x.id === v.id ? v : x));
              }
              setEditingVehicle(null);
            }}
          />
        )}

        {showPartsUpdateModal && (
          <PartsUpdateModal onClose={() => setShowPartsUpdateModal(false)} />
        )}

        {tab === 'vehicles' && (
          <div className="bg-white border rounded-lg shadow-sm p-6 max-w-4xl">
             <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-800">{resolveLabel('master.vehicleTitle', lang === 'ja' ? '代理店特殊車両/クレーン等' : 'Dealer Special Vehicles / Cranes')}</h3>
              <button onClick={() => setEditingVehicle('new')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded flex items-center text-sm font-bold transition"><Plus className="w-4 h-4 mr-1"/>{resolveLabel('master.vehicleAddButton', lang === 'ja' ? '新規追加' : 'Add New')}</button>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr><th className="p-3 border-b">{resolveLabel('master.vehicleModelHeader', lang === 'ja' ? 'モデル名' : 'Model Name')}</th><th className="p-3 border-b">{resolveLabel('master.vehicleMakerHeader', lang === 'ja' ? 'メーカー' : 'Maker')}</th><th className="p-3 border-b">{resolveLabel('master.vehicleTypeHeader', lang === 'ja' ? '種別' : 'Type')}</th><th className="p-3 border-b">{resolveLabel('master.vehicleLocationHeader', lang === 'ja' ? 'デフォルト保管場所' : 'Default Storage')}</th><th className="p-3 border-b text-right">{resolveLabel('master.actionHeader', lang === 'ja' ? '操作' : 'Action')}</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vehicleMasters.map(m =>(
                  <tr key={m.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setEditingVehicle(m)}>
                    <td className="p-3 font-bold text-gray-900">{getVehicleModelName(m)}</td>
                    <td className="p-3 text-gray-600">{m.maker || '—'}</td>
                    <td className="p-3 text-gray-500">{getVehicleType(m)}</td>
                    <td className="p-3 text-gray-500">
                      {m.defaultLocationId ? parking.find(p => p.id === m.defaultLocationId)?.name || resolveLabel('master.unknownLocation', lang === 'ja' ? '不明' : 'Unknown') : '—'}
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={(e) => { e.stopPropagation(); setVehicleMasters(vehicleMasters.filter(x => x.id !== m.id)); }} className="text-red-500 hover:bg-red-50 p-2 rounded transition"><Trash2 className="w-4 h-4"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'reports' && (
          <div className="bg-white border rounded-lg shadow-sm p-6 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-800">{resolveLabel('master.reportTitle', lang === 'ja' ? 'メカニック報告様式' : 'Mechanic Report Templates')}</h3>
              <button onClick={() => setEditingReportTemplate('new')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded flex items-center text-sm font-bold transition"><Plus className="w-4 h-4 mr-1"/>{resolveLabel('master.reportAddButton', lang === 'ja' ? '新規作成' : 'Create New')}</button>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr><th className="p-3 border-b">{resolveLabel('master.reportNameHeader', lang === 'ja' ? '報告様式名' : 'Report Name')}</th><th className="p-3 border-b">{resolveLabel('master.reportFieldCountHeader', lang === 'ja' ? '項目数' : 'Field Count')}</th><th className="p-3 border-b text-right">{resolveLabel('master.actionHeader', lang === 'ja' ? '操作' : 'Action')}</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reportTemplates.map(template =>(
                  <tr key={template.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setEditingReportTemplate(template)}>
                    <td className="p-3 font-bold text-gray-900">{getReportTemplateName(template)}</td>
                    <td className="p-3 text-gray-600">{template.fields.length} {resolveLabel('master.reportFieldCountSuffix', lang === 'ja' ? '項目' : 'fields')}</td>
                    <td className="p-3 text-right">
                      <button onClick={(e) => { e.stopPropagation(); if(window.confirm(resolveLabel('master.reportDeleteConfirm', lang === 'ja' ? '削除しますか？' : 'Are you sure you want to delete?'))) deleteReportTemplate(template.id); }} className="text-red-500 hover:bg-red-50 p-2 rounded transition"><Trash2 className="w-4 h-4"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
