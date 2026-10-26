import React, { useState } from 'react';
import { Activity, ExternalLink, History, Wrench, Shield, FileText, Users, Bot, AlertTriangle, MapPin, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Vehicle, ServiceTask } from '../types';
import { useApp } from '../context/AppContext';

export const VehicleDetailPanels: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => {
  const { tasks, parking, t } = useApp();
  const [showLocationModal, setShowLocationModal] = useState(false);

  const getLocalizedSampleCustomerName = (name?: string) => {
    if (!name) return '';
    const sampleKeyMap: Record<string, string> = {
      '山田建設': 'sample.customer.c1_name',
      'ABC開発': 'sample.customer.c2_name',
      '山田建機': 'sample.customer.c3_name',
      '佐藤建設': 'sample.customer.c4_name',
      '高橋土木': 'sample.customer.c5_name',
    };
    const sampleKey = sampleKeyMap[name];
    return sampleKey ? t(sampleKey) : name;
  };

  const getLocalizedTaskProgress = (progress?: string) => {
    const progressMap: Record<string, string> = {
      '承認待ち': 'views.vehicles.taskProgressPending',
      '進行中': 'views.vehicles.taskProgressInProgress',
      '完了': 'views.vehicles.taskProgressCompleted',
      'スキップ': 'views.vehicles.taskProgressSkipped',
    };
    return progress ? t(progressMap[progress] || progress) : '';
  };

  const getLocalizedTaskCategory = (category?: string) => {
    const categoryMap: Record<string, string> = {
      '新車巡回': 'views.vehicles.eventCategoryNewVehiclePatrol',
      '受け入れ点検': 'views.vehicles.eventCategoryReceivingInspection',
      '在庫点検': 'views.vehicles.eventCategoryInventoryInspection',
      '納入作業': 'views.vehicles.eventCategoryDeliveryWork',
      'その他予定': 'views.vehicles.eventCategoryOther',
      '故障修理': 'views.vehicles.serviceCategoryRepair',
      '定期点検': 'views.vehicles.serviceCategoryMaintenance',
      '車検': 'views.vehicles.serviceCategoryInspection',
      'フィールドキャンペーン': 'views.vehicles.serviceCategoryFieldCampaign',
    };
    return category ? t(categoryMap[category] || category) : '';
  };

  const getLocalizedContractStatus = (status?: string) => {
    const statusMap: Record<string, string> = {
      '有効': 'views.vehicles.contractStatusActive',
      '期限切れ': 'views.vehicles.contractStatusExpired',
    };
    return status ? t(statusMap[status] || status) : '';
  };
  
  const vTasks = tasks.filter(t => t.vehicleId === vehicle.id).sort((a,b) => {
    const dateA = a.deadline || a.startDate || '';
    const dateB = b.deadline || b.startDate || '';
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
  
  const eventCategories = ['新車巡回', '受け入れ点検', '在庫点検', '納入作業', 'その他予定'];
  const serviceCategories = ['故障修理', '定期点検', '車検', 'フィールドキャンペーン'];
  
  const eventTasks = vTasks.filter(t => eventCategories.includes(t.category) || !serviceCategories.includes(t.category));
  const serviceTasks = vTasks.filter(t => serviceCategories.includes(t.category));

  return (
    <div className="space-y-8">
      {/* 1. INFO */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
        <div className="flex flex-col flex-wrap sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-3">
            <span>{vehicle.modelName}</span>
            <span className="font-mono text-slate-500 text-base">{vehicle.serialNumber}</span>
            {vehicle.customerName && (
              <span className="flex items-center text-slate-600 font-medium text-base ml-2">
                <Users className="w-5 h-5 mr-1.5 text-slate-400" />
                {getLocalizedSampleCustomerName(vehicle.customerName)}
              </span>
            )}
            <span className={`text-xs px-2 py-1 rounded font-bold ml-2 ${
              vehicle.status === '在庫' ? 'bg-amber-100 text-amber-800' :
              vehicle.status === '稼働中' ? 'bg-emerald-100 text-emerald-800' :
              'bg-slate-100 text-slate-700'
            }`}>{vehicle.status === '在庫' ? t('enum.vehicleStatus.在庫') : t('views.vehicles.inOperation')}</span>
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {vehicle.status === '在庫' && (
              <button 
                onClick={() => setShowLocationModal(true)}
                className="flex items-center justify-center text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg transition group shadow-sm border border-indigo-100"
              >
                <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                {t('views.vehicles.checkStockLocation')}
              </button>
            )}
            <button className="flex items-center justify-center text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-lg transition group">
              <Activity className="w-4 h-4 mr-2" />
              {t('views.vehicles.checkKomfleet')}
              <ExternalLink className="w-3 h-3 ml-2 text-indigo-400 group-hover:text-indigo-600" />
            </button>
            <button className="flex items-center justify-center text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition group shadow-sm" title={t('views.vehicles.aiBotTooltip')}>
              <Bot className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              {t('views.vehicles.openAIBot')}
            </button>
          </div>
        </div>
      </div>

      {/* LOWER 3 PANELS IN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
      {/* 2. EVENTS */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4 animate-in fade-in duration-200">
        <div className="flex flex-col flex-wrap sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <h3 className="font-bold text-slate-800 flex items-center text-lg">
            {t('views.vehicles.eventHistoryTitle')}
            <span className="ml-2 bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">{eventTasks.length}</span>
          </h3>
        </div>
        {eventTasks.length > 0 ? (
           <div className="space-y-3">
              {eventTasks.map(task => (
                 <div key={task.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col flex-wrap sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-200 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold \${
                          task.progress === '承認待ち' ? 'bg-amber-100 text-amber-800' :
                          task.progress === '進行中' ? 'bg-blue-100 text-blue-800' :
                          task.progress === '完了' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'
                        }`}>{getLocalizedTaskProgress(task.progress)}</span>
                        <span className="text-xs font-bold text-slate-400">{getLocalizedTaskCategory(task.category)}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">{task.title}</h4>
                    </div>
                    <div className="text-left sm:text-right">
                       {task.deadline && <div className="text-xs font-bold text-slate-500 font-mono bg-slate-50 px-2 py-1 rounded inline-block">{task.deadline.split('T')[0]}</div>}
                    </div>
                 </div>
              ))}
           </div>
        ) : (
           <div className="text-center p-12 bg-white rounded-xl border border-slate-200 border-dashed">
             <History className="w-10 h-10 text-slate-300 mx-auto mb-4" />
             <p className="font-bold text-slate-500 mb-1">{t('views.vehicles.noEventHistoryTitle')}</p>
             <p className="text-sm text-slate-400">{t('views.vehicles.noEventHistoryDescription')}</p>
           </div>
        )}
      </div>

      {/* 3. SERVICES */}
      <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4 animate-in fade-in duration-200">
        <div className="flex flex-col flex-wrap sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <h3 className="font-bold text-slate-800 flex items-center text-lg">
            {t('views.vehicles.serviceHistoryTitle')}
            <span className="ml-2 bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">{serviceTasks.length}</span>
          </h3>
          <button className="flex items-center justify-center text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition shadow-sm w-full sm:w-auto">
            <Wrench className="w-4 h-4 mr-2" />
            {t('views.vehicles.addServiceRequest')}
          </button>
        </div>
        {serviceTasks.length > 0 ? (
           <div className="space-y-3">
              {serviceTasks.map(task => (
                 <div key={task.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col flex-wrap sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-200 transition-colors">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold \${
                          task.progress === '承認待ち' ? 'bg-amber-100 text-amber-800' :
                          task.progress === '進行中' ? 'bg-blue-100 text-blue-800' :
                          task.progress === '完了' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'
                        }`}>{getLocalizedTaskProgress(task.progress)}</span>
                        <span className="text-xs font-bold text-slate-400">{getLocalizedTaskCategory(task.category)}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">{task.title}</h4>
                    </div>
                    <div className="text-left sm:text-right">
                       {task.deadline && <div className="text-xs font-bold text-slate-500 font-mono bg-slate-50 px-2 py-1 rounded inline-block">{task.deadline.split('T')[0]}</div>}
                    </div>
                 </div>
              ))}
           </div>
        ) : (
           <div className="text-center p-12 bg-white rounded-xl border border-slate-200 border-dashed">
             <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-4" />
             <p className="font-bold text-slate-500 mb-1">{t('views.vehicles.noServiceHistoryTitle')}</p>
             <p className="text-sm text-slate-400">{t('views.vehicles.noServiceHistoryDescription')}</p>
           </div>
        )}
      </div>

      {/* Right Column (Contracts & Alerts) */}
      <div className="space-y-6">
        {/* 4. CONTRACTS */}
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col flex-wrap sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <h3 className="font-bold text-slate-800 text-lg">{t('views.vehicles.contractStatusTitle')}</h3>
            <button className="flex items-center justify-center text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-lg transition shadow-sm w-full sm:w-auto">
              <Shield className="w-4 h-4 mr-2 text-slate-500" />
              {t('views.vehicles.manageContractsButton')}
            </button>
          </div>
          {vehicle.contracts && vehicle.contracts.length > 0 ? (
            <div className="space-y-4">
              {vehicle.contracts.map(c => (
                <div key={c.contractId} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-800 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-slate-400" />
                      {c.contractId}
                    </h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold \${
                      c.status === '有効' ? 'bg-emerald-100 text-emerald-800' :
                      c.status === '期限切れ' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                    }`}>{getLocalizedContractStatus(c.status)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
                     <div>
                       <div className="text-slate-400 text-xs font-bold mb-1">{t('views.vehicles.contractStartDateLabel')}</div>
                       <div className="font-mono font-bold text-slate-700">{c.startDate}</div>
                     </div>
                     <div>
                       <div className="text-slate-400 text-xs font-bold mb-1">{t('views.vehicles.contractEndDateLabel')}</div>
                       <div className="font-mono font-bold text-slate-700">{c.endDate || '---'}</div>
                     </div>
                     <div>
                       <div className="text-slate-400 text-xs font-bold mb-1">{t('views.vehicles.contractStartSmrLabel')}</div>
                       <div className="font-mono font-bold text-slate-700">{c.startSmr?.toLocaleString() || '---'} h</div>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-12 bg-white rounded-xl border border-slate-200 border-dashed">
              <Shield className="w-10 h-10 text-slate-300 mx-auto mb-4" />
              <p className="font-bold text-slate-500 mb-1">{t('views.vehicles.noContractsTitle')}</p>
              <p className="text-sm text-slate-400">{t('views.vehicles.noContractsDescription')}</p>
            </div>
          )}
        </div>

        {/* 5. ALERTS */}
        <div className="bg-rose-50 border border-rose-200 p-6 rounded-xl shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-col flex-wrap sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
            <h3 className="font-bold text-rose-800 text-lg flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {t('views.vehicles.activeAlertsTitle')}
            </h3>
          </div>
          <div className="space-y-3">
             <div className="bg-white border border-rose-200 p-4 rounded-xl shadow-sm flex flex-col gap-2 hover:border-rose-300 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-rose-100 text-rose-800 border border-rose-200">E03</span>
                  <span className="text-xs font-bold text-slate-500 font-mono">2026-07-08 14:30</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{t('views.vehicles.alert1Title')}</h4>
                <p className="text-xs text-slate-600">{t('views.vehicles.alert1Description')}</p>
             </div>
             <div className="bg-white border border-rose-200 p-4 rounded-xl shadow-sm flex flex-col gap-2 hover:border-rose-300 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-100 text-amber-800 border border-amber-200">CA428</span>
                  <span className="text-xs font-bold text-slate-500 font-mono">2026-07-07 09:15</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{t('views.vehicles.alert2Title')}</h4>
                <p className="text-xs text-slate-600">{t('views.vehicles.alert2Description')}</p>
             </div>
          </div>
        </div>
      </div>

    </div>

      {showLocationModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[70] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-indigo-50 shrink-0">
              <h3 className="font-bold text-indigo-900 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
                {t('views.vehicles.stockLocationModalTitle', { name: `${vehicle.modelName} ${vehicle.serialNumber}` })}
              </h3>
              <button onClick={() => setShowLocationModal(false)} className="text-gray-400 hover:bg-white hover:text-gray-600 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
              <div className="h-[400px] w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] rounded-lg border border-slate-200 overflow-hidden relative shadow-inner bg-white">
                {parking.map(p => {
                  const isSelected = vehicle.parkingAreaIds?.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      className={`absolute rounded-lg border-2 flex flex-col items-center justify-center p-2 shadow-md transition-all overflow-hidden ${
                        isSelected ? "border-indigo-500 bg-indigo-50/90 shadow-lg ring-4 ring-indigo-500/20 z-20" : "border-slate-300 bg-slate-50/90"
                      }`}
                      style={{
                        left: p.x, top: p.y, width: p.width, height: p.height
                      }}
                    >
                      <div className={`font-bold text-xs pointer-events-none text-center w-full break-words ${isSelected ? 'text-indigo-800' : 'text-slate-800'}`}>
                        {p.name}
                        {isSelected && <div className="mt-1"><MapPin className="w-4 h-4 mx-auto text-indigo-600" /></div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end shrink-0">
              <button onClick={() => setShowLocationModal(false)} className="px-6 py-2.5 text-slate-600 font-bold rounded-lg hover:bg-slate-100 transition shadow-sm border border-slate-200">
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
