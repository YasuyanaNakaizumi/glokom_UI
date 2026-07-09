import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, FileText, Calendar, CheckSquare, Clock as ClockIcon, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { format, addMonths, subMonths, isSameMonth } from 'date-fns';

export const ReportsView = () => {
  const { vehicles, tasks, t } = useApp();
  const [tab, setTab] = useState<'vehicle' | 'tasks'>('vehicle');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(expandedTaskIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedTaskIds(next);
  };
  const [currentDate, setCurrentDate] = useState(new Date());

  const completedTasks = tasks.filter(task => task.progress === '完了' || task.isApproved);

  const vehicleFiltered = vehicles.filter(v => 
    (v.modelName + v.serialNumber).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const checkEvent = (vId: string, categories: string[]) => {
    const vT = tasks.find(t => t.vehicleId === vId && categories.includes(t.category) && isSameMonth(new Date(t.deadline), currentDate));
    if (!vT) return 'none';
    if (vT.progress === '完了') return 'done';
    return 'pending';
  };

  const StatusIcon = ({ s }: { s: string }) => {
    if (s === 'done') return <span className="flex items-center text-green-700 bg-green-50 px-2 py-1 rounded w-fit text-xs font-bold border border-green-100"><CheckSquare className="w-3 h-3 mr-1"/>実施済</span>;
    if (s === 'pending') return <span className="flex items-center text-gray-500 bg-gray-50 px-2 py-1 rounded w-fit text-xs font-bold border border-gray-200"><ClockIcon className="w-3 h-3 mr-1"/>未実施</span>;
    return <span className="text-gray-300 px-2">—</span>;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4 md:p-8 shrink-0 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col mb-6 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FileText className="w-6 h-6 mr-2 text-indigo-600" />
          報告一覧
        </h1>
        <p className="text-sm text-gray-500 mt-2">車両ごとの定期点検・巡回実績、およびタスクの完了報告を確認します。</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 shrink-0 overflow-x-auto scrollbar-hide">
        <button 
          onClick={()=>setTab('vehicle')} 
          className={cn("px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors", tab === 'vehicle' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300')}
        >
          車両ごとの実績
        </button>
        <button 
          onClick={()=>setTab('tasks')} 
          className={cn("px-6 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors", tab === 'tasks' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300')}
        >
          タスク結果一覧
        </button>
      </div>

      <div className="flex-1 min-h-0 bg-white border border-slate-200 rounded-xl shadow-sm p-4 md:p-6 overflow-y-auto">
        {/* Control Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6 gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input type="text" placeholder="検索 (モデル、件名...)" className="w-full pl-9 pr-3 py-2 border rounded text-sm focus:ring-1 focus:ring-indigo-500" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} />
          </div>

          {tab === 'vehicle' && (
            <div className="flex items-center space-x-3 bg-white border border-gray-300 rounded p-1">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="px-3 py-1 hover:bg-gray-100 rounded text-sm font-medium text-gray-600 transition">前月</button>
              <span className="font-bold text-gray-800 text-sm w-28 text-center flex items-center justify-center">
                <Calendar className="w-3 h-3 mr-1 text-gray-500" />
                {format(currentDate, 'yyyy年 MM月')}
              </span>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="px-3 py-1 hover:bg-gray-100 rounded text-sm font-medium text-gray-600 transition">次月</button>
            </div>
          )}
        </div>

        {tab === 'vehicle' && (
          <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-sm text-center">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                <tr>
                  <th className="px-4 py-3 text-left">車両・モデル</th>
                  <th className="px-4 py-3">状態</th>
                  <th className="px-4 py-3">新車巡回</th>
                  <th className="px-4 py-3">月齢点検 (定期)</th>
                  <th className="px-4 py-3">在庫点検</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                {vehicleFiltered.map(v => {
                  const isStockLike = ['在庫', '点検中', '搬入済', '点検完了'].includes(v.status);
                  const isDelivered = v.status === '納入済';
                  return (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-left">
                        <span className="font-bold text-slate-900">{v.modelName}</span>
                        <span className="text-slate-500 font-mono text-xs ml-2">{v.serialNumber}</span>
                      </td>
                      <td className="px-4 py-3"><span className="text-[10px] font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-600">{v.status}</span></td>
                      <td className="px-4 py-3">{isDelivered ? <StatusIcon s={checkEvent(v.id, ['新車巡回'])}/> : <StatusIcon s="none" />}</td>
                      <td className="px-4 py-3">{isDelivered ? <StatusIcon s={checkEvent(v.id, ['定期点検', '車検'])}/> : <StatusIcon s="none" />}</td>
                      <td className="px-4 py-3">{isStockLike ? <StatusIcon s={checkEvent(v.id, ['在庫点検'])}/> : <StatusIcon s="none" />}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'tasks' && (
          <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                <tr>
                  <th className="px-4 py-3">完了日</th>
                  <th className="px-4 py-3">カテゴリー</th>
                  <th className="px-4 py-3">車両</th>
                  <th className="px-4 py-3 w-1/4">作業内容</th>
                  <th className="px-4 py-3">担当者</th>
                  <th className="px-4 py-3">承認</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {completedTasks.filter(t => !searchTerm || t.targetModelName.includes(searchTerm) || t.title.includes(searchTerm)).map(t => {
                  const subTasks = tasks.filter(st => st.parentId === t.id);
                  const isExpanded = expandedTaskIds.has(t.id);
                  return (
                    <React.Fragment key={t.id}>
                      <tr className={cn("hover:bg-slate-50 transition border-b border-slate-100", isExpanded && "bg-slate-50 border-b-0")}>
                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">{format(new Date(t.deadline), 'yyyy/MM/dd')}</td>
                        <td className="px-4 py-3 text-xs text-indigo-700 font-bold">{t.category}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{t.targetModelName}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 text-sm">{t.title}</div>
                          {subTasks.length > 0 && (
                            <button 
                              onClick={(e) => toggleExpand(t.id, e)}
                              className="mt-1 flex items-center text-[10px] text-slate-500 hover:text-indigo-600 font-bold bg-slate-100 hover:bg-indigo-50 px-1.5 py-0.5 rounded border border-slate-200 hover:border-indigo-200 transition"
                            >
                              {isExpanded ? <ChevronDown className="w-3 h-3 mr-0.5" /> : <ChevronRight className="w-3 h-3 mr-0.5" />}
                              小タスクを表示 ({subTasks.filter(st => st.progress === '完了').length}/{subTasks.length})
                            </button>
                          )}
                        </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">担当: スタッフID({t.staffId || '—'})</td>
                    <td className="px-4 py-3">
                      {t.isApproved ? (
                        <div className="text-[10px]">
                          <span className="text-green-600 font-bold flex items-center mb-0.5"><CheckSquare className="w-3 h-3 mr-1"/>承認済</span>
                          <span className="text-gray-500">{t.approverName}</span>
                        </div>
                      ) : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                  </tr>
                      {isExpanded && subTasks.length > 0 && subTasks.map((st, idx) => {
                        return (
                          <tr key={st.id} className="bg-slate-50/80 border-b border-slate-200 hover:bg-slate-100 transition group/sub">
                            <td className="px-4 py-3 text-slate-500 font-mono text-xs text-right">
                              {st.deadline ? format(new Date(st.deadline), 'yyyy/MM/dd') : '-'}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500"></td>
                            <td className="px-4 py-3 text-slate-500"></td>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <div className="w-4 h-4 border-l-2 border-b-2 border-slate-300 rounded-bl mr-2 -mt-4 opacity-70"></div>
                                <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold border mr-2", st.progress === '完了' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200")}>
                                  {st.progress}
                                </span>
                                <span className="font-bold text-sm text-slate-700">{st.title}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs">担当: {st.staffIds?.[0] || '—'}</td>
                            <td className="px-4 py-3 text-center"></td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
