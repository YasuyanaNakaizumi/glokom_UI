import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Search, MapPin, Calendar, Activity, Wrench, History, CheckCircle, Car, ArrowLeft, ExternalLink, Bot, Shield, FileText, Clock, ChevronDown, ChevronRight, X , Building2} from 'lucide-react';
import { format } from 'date-fns';
import { Vehicle } from '../types';
import { VehicleDetailPanels } from '../components/VehicleDetailPanels';

export const CustomerListView = () => {
  const { customers, vehicles, tasks } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [detailVehicleId, setDetailVehicleId] = useState<string | null>(null);
      
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
              };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  
  const customerVehicles = selectedCustomer ? vehicles.filter(v => v.customerName === selectedCustomer.name) : [];
  const customerVehicleIds = customerVehicles.map(v => v.id);
  const customerTasks = tasks.filter(t => t.vehicleId && customerVehicleIds.includes(t.vehicleId)).sort((a,b) => {
    const dateA = a.deadline || a.startDate || '';
    const dateB = b.deadline || b.startDate || '';
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });
  
  const serviceCategories = ['故障修理', '定期点検', '車検', 'フィールドキャンペーン'];
  const customerServiceTasks = customerTasks.filter(t => serviceCategories.includes(t.category));

  const renderVehicleDetails = (v: Vehicle) => {
    const vTasks = tasks.filter(t => t.vehicleId === v.id).sort((a,b) => {
      const dateA = a.deadline || a.startDate || '';
      const dateB = b.deadline || b.startDate || '';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
    const serviceTasks = vTasks.filter(t => serviceCategories.includes(t.category));

    return (
      <div className="bg-slate-50 p-5 border-t border-slate-200 animate-in fade-in slide-in-from-top-2">
        <h4 className="font-bold text-slate-700 mb-3 text-sm flex items-center">
          <Activity className="w-4 h-4 mr-2 text-indigo-500" /> 車両概要
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div>
            <div className="text-slate-400 text-xs font-bold mb-1">メーカー</div>
            <div className="font-bold text-slate-700">コマツ</div>
          </div>
          <div>
            <div className="text-slate-400 text-xs font-bold mb-1">現在SMR</div>
            <div className="font-bold text-slate-700 font-mono">{v.currentSmr?.toLocaleString() || '---'} <span className="text-slate-400 text-xs">h</span></div>
          </div>
          <div>
            <div className="text-slate-400 text-xs font-bold mb-1">ステータス</div>
            <div className="font-bold text-emerald-600 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
              正常稼働中
            </div>
          </div>
          <div>
             <div className="text-slate-400 text-xs font-bold mb-1">KomFleet</div>
             <a href="#" className="font-bold text-indigo-600 hover:underline flex items-center text-xs">
                詳細を確認 <ExternalLink className="w-3 h-3 ml-1" />
             </a>
          </div>
        </div>

        <h4 className="font-bold text-slate-700 mb-3 text-sm flex items-center">
          <Wrench className="w-4 h-4 mr-2 text-indigo-500" /> サービス履歴 ({serviceTasks.length})
        </h4>
        {serviceTasks.length > 0 ? (
          <div className="space-y-2">
            {serviceTasks.map(t => (
               <div key={t.id} className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-indigo-200 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        t.progress === '承認待ち' ? 'bg-amber-100 text-amber-800' :
                        t.progress === '進行中' ? 'bg-blue-100 text-blue-800' :
                        t.progress === '完了' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'
                      }`}>{t.progress}</span>
                      <span className="text-xs font-bold text-slate-400">{t.category}</span>
                    </div>
                    <h5 className="font-bold text-slate-800 text-sm">{t.title}</h5>
                  </div>
                  <div className="text-left sm:text-right">
                     {t.deadline && <div className="text-xs font-bold text-slate-500 font-mono bg-slate-50 px-2 py-1 rounded inline-block">{t.deadline.split('T')[0]}</div>}
                  </div>
               </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 bg-white rounded-lg border border-slate-200 border-dashed">
            <p className="text-sm text-slate-400">サービス履歴はありません</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden bg-white">
      {/* Left Pane: Customer List */}
      <div className={`w-full md:w-[260px] shrink-0 flex-col border-r border-slate-200 bg-slate-50/50 h-full ${selectedCustomerId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-5 border-b border-slate-200 shrink-0 bg-white z-10 shadow-sm">
          <h1 className="text-xl font-black text-slate-800 flex items-center mb-5">
            <Users className="w-5 h-5 mr-2 text-indigo-600" />
            顧客リスト
          </h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="顧客名、住所で検索..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50 focus:bg-white transition-colors"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredCustomers.map(c => {
            const isSelected = selectedCustomerId === c.id;
            const cVehicles = vehicles.filter(v => v.customerName === c.name);
            return (
              <button
                key={c.id}
                onClick={() => handleSelectCustomer(c.id)}
                className={`w-full text-left p-4 border-b border-slate-100 hover:bg-white transition-colors relative ${
                  isSelected ? 'bg-white' : ''
                }`}
              >
                {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />}
                <div className="flex justify-between items-start mb-1.5">
                  <h4 className={`font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>{c.name}</h4>
                </div>
                <div className="flex items-center text-xs text-slate-500 mb-2">
                  <MapPin className="w-3 h-3 mr-1 shrink-0" />
                  <span className="truncate">{c.address}</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-600 border border-slate-200">
                     保有車両: {cVehicles.length}台
                   </span>
                </div>
              </button>
            );
          })}
          {filteredCustomers.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">顧客が見つかりません</div>
          )}
        </div>
      </div>

      {/* Right Pane: Customer Details */}
      <div className={`w-full flex-1 flex-col bg-slate-50 h-full ${selectedCustomerId ? 'flex' : 'hidden md:flex'}`}>
        {selectedCustomer ? (
          <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-200">
            {/* Detail Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
               {/* Mobile Back Button */}
               <div className="flex items-center mb-6 md:hidden">
                  <button onClick={() => setSelectedCustomerId(null)} className="flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 bg-white shadow-sm border border-slate-200 px-3 py-1.5 rounded-lg">
                     <ArrowLeft className="w-4 h-4 mr-1.5" /> 戻る
                  </button>
               </div>
               
               {/* Company Overview Header */}
               <div className="bg-white border border-slate-200 rounded-xl shadow-sm mb-6 flex flex-col shrink-0">
                  <div className="p-4 border-b border-slate-100 font-bold text-slate-800 flex items-center bg-slate-50/50 rounded-t-xl">
                    <Building2 className="w-4 h-4 mr-2 text-indigo-600"/>
                    会社概要
                  </div>
                  <div className="p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 mb-1">企業名</div>
                      <div className="font-medium text-slate-800 text-sm">{selectedCustomer.name}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 mb-1">所在地</div>
                      <div className="font-medium text-slate-800 text-sm">{selectedCustomer.address}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 mb-1">最終訪問</div>
                      <div className="font-medium text-slate-800 text-sm">
                        {selectedCustomer.lastVisitDate ? format(new Date(selectedCustomer.lastVisitDate), 'yyyy/MM/dd') : '未訪問'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 mb-1">取引開始日</div>
                      <div className="font-medium text-slate-800 text-sm">2015年 4月</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 mb-1">従業員数</div>
                      <div className="font-medium text-slate-800 text-sm">約 150 名</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 mb-1">主要事業</div>
                      <div className="font-medium text-slate-800 text-sm">土木工事、建築工事全般</div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl">
                      <div className="text-[10px] font-bold text-slate-400 mb-1">特記事項</div>
                      <div className="font-medium text-slate-800 text-sm">来期より新拠点設立予定。増車の可能性あり。</div>
                  </div>
               </div>

               {!detailVehicleId ? (
                 <div className="flex flex-col xl:flex-row gap-6 h-[500px] xl:h-auto xl:flex-1 min-h-0 animate-in fade-in duration-200">
                    {/* Column 1: Customer Members */}
                    <div className="w-full xl:w-1/3 flex flex-col min-h-0 bg-white border border-slate-200 rounded-xl shadow-sm">
                      <div className="p-4 border-b border-slate-100 font-bold text-slate-800 flex items-center bg-slate-50/50 rounded-t-xl">
                        <Users className="w-4 h-4 mr-2 text-indigo-600"/>
                        顧客メンバリスト
                      </div>
                      <div className="p-4 overflow-y-auto flex-1 space-y-3">
                        {[
                          { role: '代表取締役', name: '山田 太郎', phone: '090-1234-5678', email: 'taro.y@example.com' },
                          { role: '整備部長', name: '鈴木 一郎', phone: '080-9876-5432', email: 'ichiro.s@example.com' },
                          { role: '現場監督', name: '佐藤 次郎', phone: '070-1111-2222', email: 'jiro.s@example.com' }
                        ].map((member, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-slate-400">{member.role}</div>
                              <div className="font-bold text-sm text-slate-800 mb-1">{member.name}</div>
                              <div className="text-xs text-slate-500 font-mono">{member.phone}</div>
                              <div className="text-xs text-slate-500">{member.email}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 2: Vehicles */}
                    <div className="w-full xl:w-1/3 flex flex-col min-h-0 bg-white border border-slate-200 rounded-xl shadow-sm">
                      <div className="p-4 border-b border-slate-100 font-bold text-slate-800 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
                        <div className="flex items-center">
                          <Car className="w-4 h-4 mr-2 text-indigo-600"/>
                          保有車両
                          <span className="ml-2 bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">{customerVehicles.length}</span>
                        </div>
                      </div>
                      <div className="p-4 overflow-y-auto flex-1 space-y-3">
                        {customerVehicles.length > 0 ? (
                          customerVehicles.map(v => (
                            <button
                              key={v.id}
                              onClick={() => setDetailVehicleId(v.id)}
                              className="w-full flex flex-col p-3 rounded-lg border border-slate-200 bg-white text-left group hover:border-indigo-300 hover:shadow-md transition-all"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-700 transition-colors">{v.modelName}</h4>
                                  <div className="text-xs font-mono text-slate-500 mt-0.5">S/N: {v.serialNumber}</div>
                                </div>
                                <div className="flex items-center">
                                  <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${v.status === '在庫' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                                    {v.status === '在庫' ? '在庫' : '稼働中'}
                                  </span>
                                  <ChevronRight className="w-4 h-4 text-slate-300 ml-2 group-hover:text-indigo-500" />
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="text-center p-8 text-slate-400 text-sm border border-dashed rounded-lg">保有車両はありません</div>
                        )}
                      </div>
                    </div>

                    {/* Column 3: Service History */}
                    <div className="w-full xl:w-1/3 flex flex-col min-h-0 bg-white border border-slate-200 rounded-xl shadow-sm">
                      <div className="p-4 border-b border-slate-100 font-bold text-slate-800 flex items-center justify-between bg-slate-50/50 rounded-t-xl">
                        <div className="flex items-center">
                          <Wrench className="w-4 h-4 mr-2 text-indigo-600"/>
                          サービス履歴
                          <span className="ml-2 bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs">{customerServiceTasks.length}</span>
                        </div>
                      </div>
                      <div className="p-4 overflow-y-auto flex-1 space-y-3">
                        {customerServiceTasks.length > 0 ? (
                          customerServiceTasks.map(t => {
                            const v = vehicles.find(vh => vh.id === t.vehicleId);
                            return (
                              <div key={t.id} className="p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                                 <div className="flex items-center gap-2 mb-1.5">
                                   <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                     t.progress === '承認待ち' ? 'bg-amber-100 text-amber-800' :
                                     t.progress === '進行中' ? 'bg-blue-100 text-blue-800' :
                                     t.progress === '完了' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'
                                   }`}>{t.progress}</span>
                                   <span className="text-[10px] font-bold text-slate-500">{t.category}</span>
                                 </div>
                                 <h4 className="font-bold text-slate-800 text-sm mb-1">{t.title}</h4>
                                 <div className="flex items-center justify-between mt-2">
                                   {v ? (
                                     <div className="text-[10px] font-bold text-indigo-600 flex items-center">
                                       <Car className="w-3 h-3 mr-1" />
                                       {v.modelName}
                                     </div>
                                   ) : <div/>}
                                   {t.deadline && <div className="text-[10px] font-bold text-slate-400 font-mono">{t.deadline.split('T')[0]}</div>}
                                 </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center p-8 text-slate-400 text-sm border border-dashed rounded-lg">サービス履歴はありません</div>
                        )}
                      </div>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-6 animate-in fade-in duration-200">
                   <button onClick={() => setDetailVehicleId(null)} className="flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 bg-white shadow-sm border border-slate-200 px-3 py-1.5 rounded-lg mb-2">
                     <ArrowLeft className="w-4 h-4 mr-1.5" /> 戻る
                   </button>
                   {(() => {
                     const v = vehicles.find(vh => vh.id === detailVehicleId);
                     if (!v) return null;
                     return <VehicleDetailPanels vehicle={v} />;
                   })()}
                 </div>
               )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-slate-300" />
            </div>
            <p className="font-bold text-xl text-slate-500 mb-2">顧客を選択してください</p>
            <p className="text-sm">左側のリストから顧客を選ぶと詳細が表示されます</p>
          </div>
        )}
      </div>
    </div>
  );
};
