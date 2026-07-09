import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, ChevronRight, ArrowRightLeft, FileText, Package, Briefcase, FileSignature, CheckSquare, Target, X, Settings, Calendar, MapPin, Trash2, Users } from 'lucide-react';
import { LeadDetailsModal } from './LeadDetailsModal';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { format } from 'date-fns';

export const SalesDashboardSection: React.FC = () => {
  const { salesReports, salesPlans, salesLeads, salesQuotes, addSalesReport, addSalesPlan, updateSalesPlan, addSalesLead, staff, updateSalesQuote, customers } = useApp();

  // Modal States
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [historyCustomerName, setHistoryCustomerName] = useState<string | null>(null);

  // Daily Report State
  const [reportDate, setReportDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reportStaffId, setReportStaffId] = useState(staff[0]?.id || '');
  const [reportVisits, setReportVisits] = useState<{customerName: string, memo: string}[]>([{customerName: '', memo: ''}]);

  // Plan State
  const [planStaffId, setPlanStaffId] = useState(staff[0]?.id || '');
  const [planPeriod, setPlanPeriod] = useState({ startMonth: format(new Date(), 'yyyy-MM'), endMonth: format(new Date(), 'yyyy-MM') });
  const [totalSalesTarget, setTotalSalesTarget] = useState<number>(0);
  const [totalVisitTarget, setTotalVisitTarget] = useState<number>(0);
  const [planItems, setPlanItems] = useState<{customerName: string, targetVisits: number}[]>([]);
  const [salesTargetItems, setSalesTargetItems] = useState<{customerName: string, productName: string, amount: number}[]>([]);

  // Lead State
  const [newLeadName, setNewLeadName] = useState('');
  const [newLeadMemo, setNewLeadMemo] = useState('');
  const [newLeadTargetId, setNewLeadTargetId] = useState('');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  const [showAllStats, setShowAllStats] = useState(false);
  const [showAllReports, setShowAllReports] = useState(false);
  const [showAllLeads, setShowAllLeads] = useState(false);

  const visitStats = useMemo(() => {
    const stats: Record<string, { staffId: string, totalPlanned: number, totalVisited: number, staffName: string }> = {};
    const currentMonthPrefix = format(new Date(), 'yyyy-MM');
    
    salesPlans.forEach(plan => {
      if (!stats[plan.staffId]) {
        stats[plan.staffId] = { staffId: plan.staffId, totalPlanned: 0, totalVisited: 0, staffName: staff.find(s => s.id === plan.staffId)?.name || '不明' };
      }
      const currentMonthVisitPlans = (plan.visitPlans || []).filter(p => p.startMonth <= currentMonthPrefix && p.endMonth >= currentMonthPrefix);
      currentMonthVisitPlans.forEach(p => {
        stats[plan.staffId].totalPlanned += p.targetVisits;
      });
    });

    salesReports.filter(r => r.date.startsWith(currentMonthPrefix)).forEach(report => {
      if (!stats[report.staffId]) {
        stats[report.staffId] = { staffId: report.staffId, totalPlanned: 0, totalVisited: 0, staffName: staff.find(s => s.id === report.staffId)?.name || '不明' };
      }
      stats[report.staffId].totalVisited += (report.visits?.length || 0);
    });

    return Object.values(stats);
  }, [salesPlans, salesReports, staff]);

  const handleAddReport = () => {
    const validVisits = reportVisits.filter(v => v.customerName.trim() !== '');
    if (validVisits.length === 0) return;

    addSalesReport({
      date: reportDate,
      staffId: reportStaffId,
      visits: validVisits.map(v => ({ ...v, id: `v${Date.now()}${Math.random()}` }))
    });
    setReportVisits([{customerName: '', memo: ''}]);
    setIsReportModalOpen(false);
  };

  const handleAddPlan = () => {
    const validVisitPlans = planItems.filter(p => p.customerName.trim() !== '');
    const validSalesTargets = salesTargetItems.filter(t => t.customerName.trim() !== '' && t.productName.trim() !== '');
    
    if (!totalSalesTarget && !totalVisitTarget && validVisitPlans.length === 0 && validSalesTargets.length === 0) return;

    const existingPlan = salesPlans.find(p => p.staffId === planStaffId);
    if (existingPlan) {
      updateSalesPlan(existingPlan.id, {
        startMonth: planPeriod.startMonth,
        endMonth: planPeriod.endMonth,
        totalSalesAmount: totalSalesTarget,
        totalVisitCount: totalVisitTarget,
        visitPlans: [...(existingPlan.visitPlans || []), ...validVisitPlans.map(p => ({ ...p, startMonth: planPeriod.startMonth, endMonth: planPeriod.endMonth, id: `vp${Date.now()}${Math.random()}`, plannedDates: [] }))],
        salesTargets: [...(existingPlan.salesTargets || []), ...validSalesTargets.map(t => ({ ...t, startMonth: planPeriod.startMonth, endMonth: planPeriod.endMonth, id: `st${Date.now()}${Math.random()}` }))]
      });
    } else {
      addSalesPlan({
        staffId: planStaffId,
        startMonth: planPeriod.startMonth,
        endMonth: planPeriod.endMonth,
        totalSalesAmount: totalSalesTarget,
        totalVisitCount: totalVisitTarget,
        visitPlans: validVisitPlans.map(p => ({ ...p, startMonth: planPeriod.startMonth, endMonth: planPeriod.endMonth, id: `vp${Date.now()}${Math.random()}`, plannedDates: [] })),
        salesTargets: validSalesTargets.map(t => ({ ...t, startMonth: planPeriod.startMonth, endMonth: planPeriod.endMonth, id: `st${Date.now()}${Math.random()}` }))
      });
    }
    setPlanItems([]);
    setSalesTargetItems([]);
    setTotalSalesTarget(0);
    setTotalVisitTarget(0);
    setIsPlanModalOpen(false);
  };

  const handleAddLead = () => {
    if (!newLeadName) return;
    addSalesLead({
      customerName: newLeadName,
      memo: newLeadMemo,
      createdAt: new Date().toISOString(),
      salesTargetId: newLeadTargetId || undefined,
    });
    setNewLeadName('');
    setNewLeadMemo('');
    setNewLeadTargetId('');
    setIsLeadModalOpen(false);
  };

  const handlePromoteToLead = (memoContext: string) => {
    setNewLeadName('新規顧客 (日報から生成)');
    setNewLeadMemo(memoContext);
    setIsLeadModalOpen(true);
  };

  return (
    <>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Column 1: 営業ノルマ・実施管理 */}
        <div className="bg-white rounded-xl border border-slate-200 flex flex-col shadow-sm overflow-hidden">
          <div className="p-4 flex items-center justify-between bg-slate-50 border-b border-slate-200 text-slate-800">
            <h3 className="font-bold text-sm flex items-center">
              <Target className="w-4 h-4 mr-2 text-slate-500" />
              訪問計画・日報管理
            </h3>
            <div className="flex gap-2">
              <button onClick={() => setIsPlanModalOpen(true)} className="flex items-center text-xs font-bold text-slate-600 bg-white border border-slate-300 px-2 py-1 rounded hover:bg-slate-50 transition">
                <Settings className="w-3 h-3 mr-1" />
                ノルマ設定
              </button>
              
            </div>
          </div>
          <div className="p-4 space-y-4 flex-1 bg-slate-50/50 overflow-y-auto max-h-[600px]">
            {/* Sales Targets */}
            <div className="grid grid-cols-1 gap-3 mt-2">
              {(() => {
                const myPlan = salesPlans.find(p => p.staffId === 's1');
                if (!myPlan || !myPlan.salesTargets || myPlan.salesTargets.length === 0) {
                  return <div className="text-center py-4 text-slate-500 text-xs bg-slate-50 rounded-xl border border-slate-200">売上目標は設定されていません</div>;
                }
                const targets = myPlan.salesTargets;
                const totalTargetAmount = targets.reduce((sum, t) => sum + t.amount, 0);
                const achievedAmount = salesLeads
                  .filter(l => l.finalAmount && targets.some(t => t.id === l.salesTargetId))
                  .reduce((sum, l) => sum + (l.finalAmount || 0), 0);
                const progress = totalTargetAmount > 0 ? (achievedAmount / totalTargetAmount) * 100 : 0;
                
                const startMonths = targets.map(t => t.startMonth).sort();
                const endMonths = targets.map(t => t.endMonth).sort().reverse();
                const periodStr = `${startMonths[0]} 〜 ${endMonths[0]}`;
                
                return (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-slate-800 text-sm">売上目標</h4>
                      <span className="font-mono text-slate-500 text-sm">{periodStr}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
                        <span className="text-xs font-bold text-slate-600">目標金額</span>
                        <span className="font-bold text-slate-800 text-lg">{totalTargetAmount.toLocaleString()} 円</span>
                      </div>
                      <div className="flex justify-between items-baseline pt-1">
                        <span className="text-xs font-bold text-slate-600">現在実績</span>
                        <span className="font-bold text-indigo-700 text-lg">{achievedAmount.toLocaleString()} 円</span>
                      </div>
                      <div className="flex justify-between items-baseline mt-1">
                        <span className="text-[10px] text-slate-500">達成率</span>
                        <span className="text-[10px] font-bold text-indigo-500">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 mt-1 overflow-hidden">
                        <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, progress)}%` }}></div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4">
              <div className="grid grid-cols-1 gap-3">
                {(() => {
                  const myStat = visitStats.find(s => s.staffId === 's1') || { totalPlanned: 0, totalVisited: 0 };
                  const myPlan = salesPlans.find(p => p.staffId === 's1');
                  
                  const startMonths = myPlan ? (myPlan.visitPlans || []).map(p => p.startMonth).sort() : [];
                  const endMonths = myPlan ? (myPlan.visitPlans || []).map(p => p.endMonth).sort().reverse() : [];
                  const periodStr = startMonths.length > 0 ? `${startMonths[0]} 〜 ${endMonths[0]}` : '今月';
                  const progress = myStat.totalPlanned > 0 ? (myStat.totalVisited / myStat.totalPlanned) * 100 : 0;

                  return (
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-slate-800 text-sm">訪問回数目標</h4>
                        <span className="font-mono text-slate-500 text-sm">{periodStr}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-baseline border-b border-slate-100 pb-2">
                          <span className="text-xs font-bold text-slate-600">目標回数</span>
                          <span className="font-bold text-slate-800 text-lg">{myStat.totalPlanned} 回</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-1">
                          <span className="text-xs font-bold text-slate-600">現在実績</span>
                          <span className="font-bold text-indigo-700 text-lg">{myStat.totalVisited} 回</span>
                        </div>
                        <div className="flex justify-between items-baseline mt-1">
                          <span className="text-[10px] text-slate-500">残り {Math.max(0, myStat.totalPlanned - myStat.totalVisited)} 回</span>
                          <span className="text-[10px] font-bold text-indigo-500">{progress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 mt-1 overflow-hidden">
                          <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, progress)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            </div></div>
        {/* Column 2: 受注候補メモ */}
        <div className="bg-white rounded-xl border border-slate-200 flex flex-col shadow-sm overflow-hidden">
          <div className="p-4 flex items-center justify-between bg-indigo-50 border-b border-slate-200 text-indigo-900">
            <h3 className="font-bold text-sm flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-indigo-500" />
              受注候補メモ
            </h3>
            <button onClick={() => setIsLeadModalOpen(true)} className="flex items-center text-xs font-bold text-indigo-600 bg-white border border-indigo-200 px-2 py-1 rounded hover:bg-indigo-50 transition shadow-sm">
              <Plus className="w-3 h-3 mr-1" />
              追加
            </button>
          </div>
          <div className="p-4 space-y-4 flex-1 bg-slate-50 overflow-y-auto max-h-[600px]">


            <div className="space-y-3">
              {(showAllLeads ? salesLeads : salesLeads.slice(0, 3)).map(lead => {
                return (
                  <div 
                    key={lead.id} 
                    onClick={() => setSelectedLeadId(lead.id)}
                    className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 flex flex-col hover:shadow-md hover:border-indigo-300 transition cursor-pointer relative overflow-hidden"
                  >
                    <div className="flex-1 mb-2 relative z-10">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-900 text-sm">
                          {lead.customerName}
                        </h4>
                        <div className="flex gap-1 flex-wrap justify-end">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${ 
                            lead.finalAmount ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {lead.finalAmount ? '受注済' : '受注候補'}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 mb-1.5">{new Date(lead.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-700 whitespace-pre-wrap line-clamp-2">{lead.memo || '(メモなし)'}</p>
                      {lead.finalAmount && (
                        <p className="text-xs font-bold text-indigo-700 mt-2">最終受注額: {lead.finalAmount.toLocaleString()} 円</p>
                      )}
                    </div>
                  </div>
                );
              })}
              {salesLeads.length > 3 && (
                <button 
                  onClick={() => setShowAllLeads(!showAllLeads)} 
                  className="w-full text-center py-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition"
                >
                  {showAllLeads ? '閉じる' : `他 ${salesLeads.length - 3} 件の候補を表示`}
                </button>
              )}
            </div>
          </div>
        </div>
        {/* 最近の日報 */}
        <div className="bg-white rounded-xl border border-slate-200 flex flex-col shadow-sm overflow-hidden">
          <div className="p-4 flex items-center justify-between bg-slate-50 border-b border-slate-200 text-slate-800">
            <h3 className="font-bold text-sm flex items-center">
              <FileText className="w-4 h-4 mr-2 text-slate-500" />
              最近の日報 (今月)
            </h3>
            <button onClick={() => setIsReportModalOpen(true)} className="flex items-center text-xs font-bold text-white bg-indigo-600 px-2 py-1 rounded hover:bg-indigo-700 transition shadow-sm">
              <Plus className="w-3 h-3 mr-1" />
              日報登録
            </button>
          </div>
          <div className="p-4 space-y-4 flex-1 bg-slate-50/50 overflow-y-auto max-h-[600px]">
            
              <div className="space-y-2">
                {(showAllReports ? salesReports.filter(r => r.date.startsWith(format(new Date(), 'yyyy-MM'))) : salesReports.filter(r => r.date.startsWith(format(new Date(), 'yyyy-MM'))).slice(0, 1)).map(report => (
                  <div key={report.id} className="bg-white p-2.5 rounded-lg shadow-sm border border-slate-200 hover:border-indigo-300 transition">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-700 font-mono flex items-center">
                          <Calendar className="w-3 h-3 mr-1.5 text-slate-400"/> {report.date}
                        </span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-bold">登録済み</span>
                        <button 
                          onClick={() => console.log('登録内容確認', report)}
                          className="text-[10px] text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded font-bold flex items-center transition border border-indigo-200"
                        >
                          登録内容確認
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {salesReports.filter(r => r.date.startsWith(format(new Date(), 'yyyy-MM'))).length > 1 && (
                  <button 
                    onClick={() => setShowAllReports(!showAllReports)} 
                    className="w-full text-center py-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition mt-2"
                  >
                    {showAllReports ? '閉じる' : `他 ${salesReports.filter(r => r.date.startsWith(format(new Date(), 'yyyy-MM'))).length - 1} 件の日報を表示`}
                  </button>
                )}
              
          </div>
        </div>
        </div>
        {/* Column 3: 機種比較 */}
        <div className="bg-white rounded-xl border border-slate-200 flex flex-col shadow-sm overflow-hidden">
          <div className="p-4 flex items-center justify-between bg-slate-50 border-b border-slate-200 text-slate-800">
            <h3 className="font-bold text-sm flex items-center">
              <Package className="w-4 h-4 mr-2 text-slate-500" />
              機種比較
            </h3>
          </div>
          <div className="p-4 flex-1 bg-slate-50 flex items-center justify-center">
            <button className="w-full bg-white border-2 border-dashed border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-100 py-6 rounded-xl font-bold flex flex-col items-center justify-center transition-all shadow-sm">
              <ArrowRightLeft className="w-8 h-8 mb-3 text-slate-400" />
              機種比較を実施する
            </button>
          </div>
        </div>
      </div>
      
      {/* Territory Map Section */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
        <div className="p-4 flex items-center justify-between bg-slate-50 border-b border-slate-200">
          <h3 className="font-bold text-slate-800 flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
            最近の訪問状況マップ
          </h3>
          <div className="flex gap-4 text-xs font-bold">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-emerald-500 mr-1" fill="currentColor" />
              <span>最近訪問</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-amber-500 mr-1" fill="currentColor" />
              <span className="text-amber-600">2週間以上未訪問</span>
            </div>
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-rose-500 mr-1" fill="currentColor" />
              <span className="text-rose-600">1ヶ月以上未訪問</span>
            </div>
          </div>
        </div>
        <div className="flex-1 relative z-0">
          <MapContainer center={[35.6895, 139.6917]} zoom={10} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {customers.filter(c => c.lat !== undefined && c.lng !== undefined).map(c => {
              const daysSinceVisit = !c.lastVisitDate ? Infinity : (new Date().getTime() - new Date(c.lastVisitDate).getTime()) / (1000 * 60 * 60 * 24);
              let statusColor = "#10b981"; // green
              if (daysSinceVisit >= 30) {
                statusColor = "#e11d48"; // red
              } else if (daysSinceVisit >= 14) {
                statusColor = "#f59e0b"; // yellow
              }

              const iconHtml = `<div style="color: ${statusColor}; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>
              </div>`;
              const customIcon = L.divIcon({
                html: iconHtml,
                className: 'custom-pin-icon',
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
              });

              return (
                <Marker
                  key={c.id}
                  position={[c.lat, c.lng]}
                  icon={customIcon}
                >
                  <Popup>
                    <div className="font-bold">{c.name}</div>
                    <div className="text-xs mt-1">{c.address}</div>
                    <div className="text-xs mt-2 font-medium">
                      最終訪問: {c.lastVisitDate ? new Date(c.lastVisitDate).toLocaleDateString() : "未訪問"}
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setHistoryCustomerName(c.name); }}
                      className="mt-3 text-[11px] w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 px-2 rounded flex items-center justify-center transition-colors border border-slate-300 shadow-sm"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      訪問履歴を見る
                    </button>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
        </div>
      
      {/* Plan Modal */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">営業目標（ノルマ）を設定する</h3>
              <button onClick={() => setIsPlanModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">担当者</label>
                <select value={planStaffId} onChange={e => setPlanStaffId(e.target.value)} className="w-1/2 border-slate-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-4 mb-4">
                <div className="flex items-center space-x-1">
                  <input type="month" value={planPeriod.startMonth} onChange={e => setPlanPeriod({...planPeriod, startMonth: e.target.value})} className="w-32 border-slate-300 rounded p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                  <span className="text-slate-500 text-xs">〜</span>
                  <input type="month" value={planPeriod.endMonth} onChange={e => setPlanPeriod({...planPeriod, endMonth: e.target.value})} className="w-32 border-slate-300 rounded p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <span className="text-xs font-bold text-slate-600 ml-2">期間目標設定</span>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 border-b border-indigo-100 pb-2">
                  <label className="block text-sm font-bold text-indigo-700">売上金額目標 (期間全体)</label>
                  <div className="flex items-center mt-2 md:mt-0">
                    <input type="number" min="0" step="10000" placeholder="総合計目標額" value={totalSalesTarget || ''} onChange={e => setTotalSalesTarget(Number(e.target.value))} className="w-40 border-slate-300 rounded p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 text-right font-bold" />
                    <span className="text-xs text-slate-500 ml-1 whitespace-nowrap font-bold">円</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 font-medium">詳細目標 (オプション)</p>
                  {salesTargetItems.map((item, index) => (
                    <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-2">
                      <input type="text" placeholder="どこで (顧客名)" value={item.customerName} onChange={e => { const newItems = [...salesTargetItems]; newItems[index].customerName = e.target.value; setSalesTargetItems(newItems); }} className="flex-1 border-slate-300 rounded p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                      <input type="text" placeholder="何を (商材)" value={item.productName} onChange={e => { const newItems = [...salesTargetItems]; newItems[index].productName = e.target.value; setSalesTargetItems(newItems); }} className="flex-1 border-slate-300 rounded p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                      <div className="flex items-center">
                        <input type="number" min="0" step="10000" placeholder="いくらで (円)" value={item.amount || ''} onChange={e => { const newItems = [...salesTargetItems]; newItems[index].amount = Number(e.target.value); setSalesTargetItems(newItems); }} className="w-32 border-slate-300 rounded p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 text-right" />
                        <span className="text-xs text-slate-500 ml-1 whitespace-nowrap">円</span>
                      </div>
                      <button onClick={() => { setSalesTargetItems(salesTargetItems.filter((_, i) => i !== index)); }} className="p-1 text-slate-400 hover:text-rose-500 transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button onClick={() => setSalesTargetItems([...salesTargetItems, {customerName: '', productName: '', amount: 0}])} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center mt-2"><Plus className="w-3 h-3 mr-1" /> 詳細な売上目標を追加</button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 border-b border-indigo-100 pb-2">
                  <label className="block text-sm font-bold text-indigo-700">顧客訪問回数目標 (期間全体)</label>
                  <div className="flex items-center mt-2 md:mt-0">
                    <input type="number" min="0" placeholder="総合計訪問回数" value={totalVisitTarget || ''} onChange={e => setTotalVisitTarget(Number(e.target.value))} className="w-32 border-slate-300 rounded p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 text-right font-bold" />
                    <span className="text-xs text-slate-500 ml-1 whitespace-nowrap font-bold">回</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 font-medium">詳細目標 (オプション)</p>
                  {planItems.map((item, index) => (
                    <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-2">
                      <input type="text" placeholder="どこへ (顧客名)" value={item.customerName} onChange={e => { const newItems = [...planItems]; newItems[index].customerName = e.target.value; setPlanItems(newItems); }} className="flex-1 border-slate-300 rounded p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                      <div className="flex items-center">
                        <input type="number" min="1" value={item.targetVisits} onChange={e => { const newItems = [...planItems]; newItems[index].targetVisits = Number(e.target.value); setPlanItems(newItems); }} className="w-20 border-slate-300 rounded p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 text-right" />
                        <span className="text-xs text-slate-500 ml-1 whitespace-nowrap">回</span>
                      </div>
                      <button onClick={() => { setPlanItems(planItems.filter((_, i) => i !== index)); }} className="p-1 text-slate-400 hover:text-rose-500 transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button onClick={() => setPlanItems([...planItems, {customerName: '', targetVisits: 1}])} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center mt-2"><Plus className="w-3 h-3 mr-1" /> 詳細な訪問目標を追加</button>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button onClick={handleAddPlan} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm">
                設定を保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">日報を登録する</h3>
              <button onClick={() => setIsReportModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">日付</label>
                  <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} className="w-full border-slate-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">担当者</label>
                  <select value={reportStaffId} onChange={e => setReportStaffId(e.target.value)} className="w-full border-slate-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                    {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">訪問記録</label>
                <div className="space-y-4">
                  {reportVisits.map((visit, index) => (
                    <div key={index} className="bg-slate-50 p-3 rounded-lg border border-slate-200 relative">
                      <button 
                        onClick={() => {
                          if (reportVisits.length > 1) {
                            setReportVisits(reportVisits.filter((_, i) => i !== index));
                          }
                        }}
                        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="mb-2 pr-6">
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">訪問先</label>
                        <input 
                          type="text" 
                          placeholder="A社 (山田建機)" 
                          value={visit.customerName}
                          onChange={e => {
                            const newVisits = [...reportVisits];
                            newVisits[index].customerName = e.target.value;
                            setReportVisits(newVisits);
                          }}
                          className="w-full border-slate-300 rounded p-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">活動内容・メモ</label>
                        <textarea 
                          rows={2}
                          placeholder="PC200-11の買い替え提案..." 
                          value={visit.memo}
                          onChange={e => {
                            const newVisits = [...reportVisits];
                            newVisits[index].memo = e.target.value;
                            setReportVisits(newVisits);
                          }}
                          className="w-full border-slate-300 rounded p-1.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => setReportVisits([...reportVisits, {customerName: '', memo: ''}])}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
                  >
                    <Plus className="w-3 h-3 mr-1" /> 訪問記録を追加
                  </button>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button onClick={handleAddReport} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm">
                登録する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Modal */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">受注候補を追加する</h3>
              <button onClick={() => setIsLeadModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">顧客名 / 案件名</label>
                <input type="text" value={newLeadName} onChange={e => setNewLeadName(e.target.value)} className="w-full border-slate-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="A社 (山田建機)" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">紐づける販売計画 (任意)</label>
                <select value={newLeadTargetId} onChange={e => setNewLeadTargetId(e.target.value)} className="w-full border-slate-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">-- 指定なし --</option>
                  {salesPlans.flatMap(p => p.salesTargets || []).map(t => (
                    <option key={t.id} value={t.id}>{t.customerName} ({t.productName})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">メモ・詳細</label>
                <textarea rows={4} value={newLeadMemo} onChange={e => setNewLeadMemo(e.target.value)} className="w-full border-slate-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="PC200-11 買い替え検討中..." />
              </div>
            </div>
            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button 
                onClick={handleAddLead} 
                disabled={!newLeadName}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                追加する
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedLeadId && (
        <LeadDetailsModal
          lead={salesLeads.find(l => l.id === selectedLeadId)!}
          onClose={() => setSelectedLeadId(null)}
        />
      )}
      {/* Visit History Modal */}
      {historyCustomerName && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-500" />
                {historyCustomerName} 様の訪問履歴
              </h3>
              <button onClick={() => setHistoryCustomerName(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[70vh] bg-slate-50/50 space-y-4">
              {(() => {
                // Find reports containing this customer
                const history = salesReports.flatMap(report => {
                  const visits = report.visits.filter(v => v.customerName === historyCustomerName);
                  if (visits.length === 0) return [];
                  const staffName = staff.find(s => s.id === report.staffId)?.name || '不明';
                  return visits.map(v => ({
                    date: report.date,
                    staffName,
                    memo: v.memo
                  }));
                }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                if (history.length === 0) {
                  return (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      訪問履歴がありません
                    </div>
                  );
                }

                return history.map((item, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-slate-700 flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                        {item.date}
                      </div>
                      <div className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                        {item.staffName}
                      </div>
                    </div>
                    <p className="text-slate-600 whitespace-pre-wrap">{item.memo || '(メモなし)'}</p>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

