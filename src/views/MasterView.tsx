import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Wrench, FileText, Truck, Plus, Trash2, Save, Replace, CheckSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { ParkingArea, ContractTemplate, MechanicReportTemplate } from '../types';
import { ContractEditModal } from '../components/ContractEditModal';
import { PartsUpdateModal } from '../components/PartsUpdateModal';
import { ReportTemplateEditModal } from '../components/ReportTemplateEditModal';
import { CustomerMasterSection } from '../components/CustomerMasterSection';

export const MasterView = () => {
  const { 
    parking, tools, contracts, vehicleMasters, reportTemplates,
    updateParking, t, addContract, updateContract, deleteContract, batchUpdatePart,
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
    alert('駐車場レイアウトを保存しました');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4 md:p-8 shrink-0 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FileText className="w-6 h-6 mr-2 text-indigo-600" />
          {t('masterTab')}
        </h1>
        <p className="text-sm text-gray-500 mt-2">作業場・駐車場や工具、契約テンプレート、代理店特殊車両/クレーン等の管理を行います</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 shrink-0 overflow-x-auto scrollbar-hide">
        <button 
          onClick={() => setTab('parking')} 
          className={cn("px-4 md:px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors", tab === 'parking' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300')}
        >
          作業場・駐車場
        </button>
        <button 
          onClick={() => setTab('tools')} 
          className={cn("px-4 md:px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors", tab === 'tools' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300')}
        >
          工具・器具
        </button>
        <button 
          onClick={() => setTab('contracts')} 
          className={cn("px-4 md:px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors", tab === 'contracts' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300')}
        >
          契約テンプレート
        </button>
        <button 
          onClick={() => setTab('vehicles')} 
          className={cn("px-4 md:px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors", tab === 'vehicles' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300')}
        >
          代理店特殊車両/クレーン等
        </button>
        <button 
          onClick={() => setTab('reports')} 
          className={cn("px-4 md:px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors", tab === 'reports' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300')}
        >
          メカニック報告様式
        </button>
        <button 
          onClick={() => setTab('customers')} 
          className={cn("px-4 md:px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors", tab === 'customers' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300')}
        >
          担当エリア・顧客
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
          <div className="flex flex-col lg:flex-row gap-6 h-[600px] lg:h-full">
            <div className="w-full lg:w-96 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col shrink-0">
              <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                <h3 className="font-bold text-gray-800">エリアリスト</h3>
                <button className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-2 py-1 rounded font-bold flex items-center transition"><Plus className="w-3 h-3 mr-1"/>追加</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {localParking.map(p => (
                  <div key={p.id} className="border border-gray-200 p-3 rounded bg-slate-50 relative group">
                    <button className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-4 h-4"/></button>
                    <input type="text" className="font-bold text-sm bg-transparent border-b border-dashed border-gray-400 focus:outline-none w-3/4 mb-2 text-indigo-900" defaultValue={p.name} />
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>収容台数: <input type="number" className="w-16 border rounded px-1" defaultValue={p.capacity}/></div>
                      <div>幅: <input type="number" className="w-16 border rounded px-1" defaultValue={p.width}/></div>
                      <div>高さ: <input type="number" className="w-16 border rounded px-1" defaultValue={p.height}/></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t bg-gray-50">
                <button onClick={saveParking} className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded font-bold flex items-center justify-center transition"><Save className="w-4 h-4 mr-2"/>レイアウトを保存</button>
              </div>
            </div>

            <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm relative overflow-hidden bg-grid-pattern flex flex-col">
              <div className="p-3 border-b bg-slate-50 shrink-0">
                <p className="text-xs text-gray-500 flex items-center"><MapPin className="w-3 h-3 mr-1"/> マップ上の矩形をドラッグして位置を調整できます</p>
              </div>
              <div 
                className="flex-1 relative bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] overflow-auto select-none touch-none"
                ref={mapRef}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                <div className="min-w-[800px] min-h-[600px] relative">
                  {localParking.map(p => (
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
                      <span className="text-[10px] text-slate-500 pointer-events-none">台数: {p.capacity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'tools' && (
          <div className="bg-white border rounded-lg shadow-sm p-6 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-800">工具・器具一覧</h3>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded flex items-center text-sm font-bold transition"><Plus className="w-4 h-4 mr-1"/>新規追加</button>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr><th className="p-3 border-b">工具名</th><th className="p-3 border-b">管理者</th><th className="p-3 border-b">説明</th><th className="p-3 border-b text-right">操作</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tools.map(t =>(
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-gray-900">{t.name}</td>
                    <td className="p-3 text-gray-600">{t.manager || '—'}</td>
                    <td className="p-3 text-gray-500">{t.description || '—'}</td>
                    <td className="p-3 text-right"><button className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4"/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'contracts' && (
          <div className="bg-white border rounded-lg shadow-sm p-6 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-800">契約テンプレート</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowPartsUpdateModal(true)}
                  className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-3 py-1.5 rounded flex items-center text-sm font-bold transition"
                >
                  <Replace className="w-4 h-4 mr-1"/>部品品番更新
                </button>
                <button 
                  onClick={() => setEditingContract('new')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded flex items-center text-sm font-bold transition"
                >
                  <Plus className="w-4 h-4 mr-1"/>新規追加
                </button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {contracts.map(c => (
                <div key={c.id} onClick={() => setEditingContract(c)} className="border border-gray-200 rounded p-4 relative group hover:border-indigo-300 transition cursor-pointer">
                  <button 
                    onClick={(e) => { e.stopPropagation(); if(window.confirm('削除しますか？')) deleteContract(c.id); }} 
                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition p-1"
                  >
                    <Trash2 className="w-4 h-4"/>
                  </button>
                  <h4 className="font-bold text-lg text-indigo-900 mb-1 pr-6">{c.title}</h4>
                  {c.description && <p className="text-sm text-gray-600 mb-3">{c.description}</p>}
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-flex bg-slate-100 px-2 py-1 rounded text-xs font-mono text-slate-700">Rule: {c.rule}</span>
                    {c.files && c.files.length > 0 && (
                      <span className="inline-flex bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold items-center"><FileText className="w-3 h-3 mr-1"/>{c.files.length} ファイル</span>
                    )}
                    {(c.partsConfig || c.reportFormatConfig) && Object.keys({...c.partsConfig, ...c.reportFormatConfig}).length > 0 && (
                      <span className="inline-flex bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs font-bold items-center"><Wrench className="w-3 h-3 mr-1"/>{Object.keys({...c.partsConfig, ...c.reportFormatConfig}).length} 機種別設定</span>
                    )}
                    {((c.defaultParts && c.defaultParts.length > 0) || (c.defaultReportFormat && c.defaultReportFormat.length > 0)) && (
                      <span className="inline-flex bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs font-bold items-center"><CheckSquare className="w-3 h-3 mr-1"/>共通設定あり</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
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

        {showPartsUpdateModal && (
          <PartsUpdateModal onClose={() => setShowPartsUpdateModal(false)} />
        )}

        {tab === 'vehicles' && (
          <div className="bg-white border rounded-lg shadow-sm p-6 max-w-4xl">
             <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-800">代理店特殊車両/クレーン等</h3>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded flex items-center text-sm font-bold transition"><Plus className="w-4 h-4 mr-1"/>新規追加</button>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr><th className="p-3 border-b">モデル名</th><th className="p-3 border-b">メーカー</th><th className="p-3 border-b">種別</th><th className="p-3 border-b text-right">操作</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vehicleMasters.map(m =>(
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-gray-900">{m.modelName}</td>
                    <td className="p-3 text-gray-600">{m.maker || '—'}</td>
                    <td className="p-3 text-gray-500">{m.type || '—'}</td>
                    <td className="p-3 text-right"><button className="text-red-500 hover:text-red-700 p-1"><Trash2 className="w-4 h-4"/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'reports' && (
          <div className="bg-white border rounded-lg shadow-sm p-6 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-800">メカニック報告様式</h3>
              <button onClick={() => setEditingReportTemplate('new')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded flex items-center text-sm font-bold transition"><Plus className="w-4 h-4 mr-1"/>新規作成</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTemplates.map(t => (
                <div key={t.id} className="border border-gray-200 rounded-lg p-4 bg-slate-50 relative group">
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button onClick={() => deleteReportTemplate(t.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-4 h-4"/></button>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 pb-2 border-b">{t.name}</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {t.fields.map((f, i) => (
                      <li key={f.id} className="flex items-center">
                        <span className="text-xs bg-gray-200 rounded px-1 min-w-[50px] text-center mr-2">{f.type === 'checkbox' ? 'チェック' : f.type === 'text' ? 'テキスト' : '画像'}</span>
                        {f.label}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 text-right">
                     <button onClick={() => setEditingReportTemplate(t)} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold">編集</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
