import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, Search, Filter, Wrench, Calendar as CalendarIcon, Clock, AlertTriangle, 
  CheckCircle2, AlertCircle, FileText, FileSignature, Truck, HardHat, FileCheck2, Zap, ChevronLeft
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { ServiceTask } from '../types';

export const CategoryTasksView = ({ categoryKey }: { categoryKey: 'patrol' | 'fc' | 'repair' | 'maintenance' | 'inspection' }) => {
  const { tasks, staff, updateTask, vehicles, setView } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 5)); // 2026年6月
  const [activeTab, setActiveTab] = useState<'all' | 'alert' | 'unassigned' | 'pre' | 'in_progress' | 'completed'>('all');
  
  const getCategoryDetails = () => {
    switch (categoryKey) {
      case 'patrol': return { title: '新車定期巡回', category: '新車定期巡回', icon: FileCheck2, color: 'indigo' };
      case 'fc': return { title: 'フィールドキャンペーン', category: 'FC対応', icon: AlertTriangle, color: 'rose' };
      case 'repair': return { title: '一般修理及び故障', category: '一般修理・故障対応', icon: Wrench, color: 'amber' };
      case 'maintenance': return { title: '定期メンテナンス', category: '定期点検', icon: Clock, color: 'teal' };
      case 'inspection': return { title: '特定自主検査 (年次)', category: '特定自主検査', icon: FileSignature, color: 'purple' };
    }
  };

  const details = getCategoryDetails();

  const filteredTasks = tasks.filter(t => {
    if (t.parentId) return false;
    if (t.category !== details.category) return false;

    // Filter by month
    const taskDate = new Date(t.deadline);
    if (taskDate.getMonth() !== currentMonth.getMonth() || taskDate.getFullYear() !== currentMonth.getFullYear()) {
      return false;
    }

    // Filter by tab
    if (activeTab === 'alert') {
      // Mock alert logic: consider '緊急' or high urgency as alert for now
      if (t.urgency !== '緊急' && t.urgency !== '1週間以内') return false;
    } else if (activeTab === 'unassigned') {
      if (t.staffIds.length > 0) return false;
    } else if (activeTab === 'pre') {
      if (t.progress !== '未着手' && t.progress !== '部品待ち') return false;
    } else if (activeTab === 'in_progress') {
      if (t.progress !== '進行中') return false;
    } else if (activeTab === 'completed') {
      if (t.progress !== '完了') return false;
    }

    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.targetModelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  const getProgressColor = (progress: string) => {
    switch (progress) {
      case '未着手': return 'bg-slate-100 text-slate-700 border-slate-200';
      case '部品待ち': return 'bg-amber-50 text-amber-700 border-amber-200';
      case '進行中': return 'bg-blue-50 text-blue-700 border-blue-200';
      case '完了': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case '緊急': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-100"><AlertCircle className="w-3 h-3 mr-1"/>緊急</span>;
      case '1週間以内': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">1週間以内</span>;
      case '1ヶ月以内': return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">1ヶ月以内</span>;
      default: return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200">{urgency}</span>;
    }
  };

  const renderTableHeader = () => {
    switch (categoryKey) {
      case 'patrol':
        return (
          <>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">対象号機 / 顧客</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">タスク名</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ステータス</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">納車日からの期間</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">担当</th>
          </>
        );
      case 'fc':
        return (
          <>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">対象号機 / 顧客</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">FC内容</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ステータス</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">期限</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">部品状態</th>
          </>
        );
      case 'repair':
        return (
          <>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">対象号機 / 顧客</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">故障内容</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ステータス</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">緊急度</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">担当メカニック</th>
          </>
        );
      case 'maintenance':
        return (
          <>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">対象号機 / 顧客</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">点検内容</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ステータス</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">現在稼働時間 / 次回点検</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">担当</th>
          </>
        );
      case 'inspection':
        return (
          <>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">対象号機 / 顧客</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">検査年度</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ステータス</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">有効期限</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">書類状態</th>
          </>
        );
      default:
        return null;
    }
  };

  const renderTableRow = (t: ServiceTask) => {
    const v = vehicles.find((vh) => vh.id === t.vehicleId);
    
    // Default columns as fallback, override per category below
    const subTasks = tasks.filter(st => st.parentId === t.id);
    let col2 = (
      <div className="flex flex-col">
        <div className="text-sm font-bold text-slate-900">{t.title}</div>
        {subTasks.length > 0 && (
          <div className="flex items-center mt-1 text-slate-500 text-[10px]">
             <AlertCircle className="w-3 h-3 mr-0.5" />
             小タスク {subTasks.filter(st => st.progress === '完了').length}/{subTasks.length} 完了
          </div>
        )}
      </div>
    );
    let col4 = <div className="text-sm text-slate-900">{format(new Date(t.deadline), 'yyyy/MM/dd')}</div>;
    let col5 = (
      <div className="flex -space-x-2 overflow-hidden">
        {t.staffIds.map((id) => {
          const s = staff.find((st) => st.id === id);
          return s ? (
            <div key={id} className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600" title={s.name}>
              {s.name.charAt(0)}
            </div>
          ) : null;
        })}
        {t.staffIds.length === 0 && <span className="text-xs text-slate-400">未割当</span>}
      </div>
    );

    switch (categoryKey) {
      case 'patrol':
        col4 = <div className="text-sm text-slate-900">{t.urgency}</div>;
        break;
      case 'fc':
        col4 = <div className="text-sm text-slate-900">{format(new Date(t.deadline), 'yyyy/MM/dd')}</div>;
        col5 = <div className="text-sm text-slate-600">{t.progress !== '完了' ? '手配中' : '完了'}</div>;
        break;
      case 'repair':
        col4 = <div>{getUrgencyBadge(t.urgency)}</div>;
        break;
      case 'maintenance':
        col4 = (
          <div className="text-sm text-slate-900">
            {v?.currentSMR ? `${v.currentSMR}h` : '不明'} / {t.urgency}
          </div>
        );
        break;
      case 'inspection':
        col4 = <div className="text-sm text-slate-900">{format(new Date(t.deadline), 'yyyy/MM/dd')}</div>;
        col5 = <div className="text-sm text-slate-600">{t.progress === '完了' ? '提出済' : '未作成'}</div>;
        break;
    }

    return (
      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg bg-${details.color}-50 text-${details.color}-600 mr-3`}>
              <details.icon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{t.targetModelName}</div>
              <div className="text-xs text-slate-500">{v?.customerName || '-'}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          {col2}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border", getProgressColor(t.progress))}>
            {t.progress}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {col4}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {col5}
        </td>
      </tr>
    );
  };

  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 p-4 md:p-8 shrink-0 overflow-y-auto">
      <div className="mb-4">
        <button onClick={() => setView('home')} className="flex items-center text-slate-500 hover:text-slate-800 transition mb-4 font-bold text-sm w-fit">
          <ChevronLeft className="w-4 h-4 mr-1" /> ホームへ戻る
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 shrink-0">
        <div>
          <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-${details.color}-50 text-${details.color}-700 mb-2 border border-${details.color}-100`}>
            {details.category}一覧
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <details.icon className={`w-6 h-6 mr-2 text-${details.color}-600`} />
            {details.title}
          </h1>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Month Selector */}
          <div className="flex items-center space-x-3 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition">
              <span className="sr-only">前月</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="font-bold text-slate-800 text-sm min-w-[80px] text-center">
              {format(currentMonth, 'yyyy年MM月')}
            </span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 transition">
              <span className="sr-only">翌月</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>

          <div className="relative w-64">
            <input
              type="text"
              placeholder="号機、顧客名で検索..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 shrink-0">
        {[
          { id: 'all', label: 'すべて' },
          { id: 'alert', label: 'アラートが出ているもの' },
          { id: 'unassigned', label: 'メカニックアサイン前' },
          { id: 'pre', label: '実施前' },
          { id: 'in_progress', label: '進行中' },
          { id: 'completed', label: '完了済み' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm",
              activeTab === tab.id 
                ? `bg-${details.color}-600 text-white` 
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1 flex flex-col min-h-[400px]">
        {filteredTasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-8">
            <details.icon className="w-12 h-12 mb-4 text-slate-300" />
            <p className="font-medium text-lg text-slate-600">該当する案件がありません</p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  {renderTableHeader()}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredTasks.map(renderTableRow)}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
