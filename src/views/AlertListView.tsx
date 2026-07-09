import React, { useState, useMemo } from 'react';
import { AlertTriangle, Filter, CheckCircle, BellOff, BellRing, Calendar, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';
import { format, subDays, addMonths, subMonths, isSameMonth } from 'date-fns';
import { ja } from 'date-fns/locale';

export const AlertListView: React.FC = () => {
  const { alerts = [], updateAlert, vehicles, addTask } = useApp();
  const [viewMode, setViewMode] = useState<'all' | 'monthly'>('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const filteredAlerts = useMemo(() => {
    let list = alerts;
    if (viewMode === 'monthly') {
      list = list.filter(a => {
        if (!a.date) return false;
        return isSameMonth(new Date(a.date), currentMonth);
      });
    }
    return list;
  }, [alerts, viewMode, currentMonth]);

  const activeAlerts = filteredAlerts.filter(a => !a.isIgnored).sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  const ignoredAlerts = filteredAlerts.filter(a => a.isIgnored).sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

  const firedCount = alerts.filter(a => !a.isIgnored).length;
  const ignoredCount = alerts.filter(a => a.isIgnored).length;

  const handleAssign = (alert: any) => {
    // Basic assignment logic, e.g. open assignment modal, or create task directly
    const v = vehicles.find(v => v.id === alert.vehicleId);
    if (!v) return;
    addTask({
      vehicleId: v.id,
      targetModelName: v.modelName,
      title: 'アラート対応: ' + alert.title,
      category: 'その他',
      urgency: '1ヶ月以内',
      deadline: new Date().toISOString(),
      chatMessages: []
    });
    updateAlert(alert.id, { isIgnored: true });
    console.log('Task created');
  };

  const renderTable = (alertList: import('../types').Alert[], isIgnoredSection: boolean) => (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-8">
      <div className={cn("px-4 py-3 border-b border-slate-200 flex items-center font-bold", isIgnoredSection ? "bg-slate-50 text-slate-600" : "bg-red-50 text-red-800")}>
        {isIgnoredSection ? <BellOff className="w-5 h-5 mr-2" /> : <BellRing className="w-5 h-5 mr-2" />}
        {isIgnoredSection ? "無視・保留済アラート" : "発報中アラート"}
        <span className="ml-2 text-sm font-normal opacity-70">({alertList.length}件)</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-500 text-xs">
            <tr>
              <th className="px-6 py-4 font-bold border-b border-slate-200">車両（機種型式・機番）</th>
              <th className="px-6 py-4 font-bold border-b border-slate-200">ステータス</th>
              <th className="px-6 py-4 font-bold border-b border-slate-200">納期</th>
              <th className="px-6 py-4 font-bold border-b border-slate-200">アラート発報日</th>
              <th className="px-6 py-4 font-bold border-b border-slate-200">内容</th>
              <th className="px-6 py-4 font-bold border-b border-slate-200 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {alertList.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500 font-medium">
                  該当するアラートはありません
                </td>
              </tr>
            ) : (
              alertList.map(alert => {
                const vehicle = vehicles.find(v => v.id === alert.vehicleId);
                return (
                  <tr key={alert.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      {vehicle ? (
                        <div>
                          <div className="font-bold text-slate-800">{vehicle.modelName}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{vehicle.serialNumber}</div>
                        </div>
                      ) : (
                        <div className="font-bold text-slate-800">{alert.targetModelName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {vehicle ? (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">
                          {vehicle.status}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-600">
                        {vehicle?.deliveryDate ? format(new Date(vehicle.deliveryDate), 'yyyy/MM/dd') : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {format(alert.date ? new Date(alert.date) : new Date(), 'yyyy/MM/dd HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-800 mb-0.5">{alert.title}</div>
                      <div className="text-xs text-slate-500 max-w-md truncate" title={alert.description}>{alert.description}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!isIgnoredSection && (
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleAssign(alert)} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-sm font-bold transition shadow-sm whitespace-nowrap"
                          >
                            アサイン
                          </button>
                          <button 
                            onClick={() => updateAlert(alert.id, { isIgnored: true })} 
                            className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded text-sm font-bold transition shadow-sm whitespace-nowrap"
                          >
                            無視
                          </button>
                        </div>
                      )}
                      {isIgnoredSection && (
                         <button 
                         onClick={() => updateAlert(alert.id, { isIgnored: false })} 
                         className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded text-sm font-bold transition shadow-sm whitespace-nowrap"
                       >
                         元に戻す
                       </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 p-6 overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex gap-4">
          <div className="bg-white border border-red-200 p-4 rounded-xl flex items-center shadow-sm min-w-[160px]">
            <div className="bg-red-100 p-2 rounded-lg mr-3">
              <BellRing className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500">全体 発報中</div>
              <div className="text-2xl font-bold text-slate-800">{firedCount}<span className="text-sm font-normal text-slate-500 ml-1">件</span></div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center shadow-sm min-w-[160px]">
            <div className="bg-slate-100 p-2 rounded-lg mr-3">
              <BellOff className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500">全体 無視・保留</div>
              <div className="text-2xl font-bold text-slate-800">{ignoredCount}<span className="text-sm font-normal text-slate-500 ml-1">件</span></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex bg-slate-200 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('all')}
              className={cn("px-4 py-1.5 text-sm font-bold rounded-md transition-colors", viewMode === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
            >
              全件表示
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={cn("px-4 py-1.5 text-sm font-bold rounded-md transition-colors flex items-center", viewMode === 'monthly' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
            >
              <Calendar className="w-4 h-4 mr-1" />
              月別表示
            </button>
          </div>

          {viewMode === 'monthly' && (
            <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm">
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="px-4 py-2 font-bold text-slate-700 min-w-[120px] text-center">
                {format(currentMonth, 'yyyy年M月', { locale: ja })}
              </div>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1">
        {renderTable(activeAlerts, false)}
        {renderTable(ignoredAlerts, true)}
      </div>
    </div>
  );
};
