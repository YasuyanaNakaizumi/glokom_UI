import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MapContainer, TileLayer, Marker, Popup, Circle, FeatureGroup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Plus, Edit2, Check, X, Search, User, AlertCircle, Save, Trash2 } from 'lucide-react';
import { Customer } from '../types';

// Fix Leaflet's default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icons for visited vs unvisited
const getMarkerIcon = (lastVisitDate?: string) => {
  const isUnvisitedOrOld = !lastVisitDate || (new Date().getTime() - new Date(lastVisitDate).getTime()) > 30 * 24 * 60 * 60 * 1000;
  return new L.Icon({
    iconUrl: isUnvisitedOrOld 
      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png'
      : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

export const CustomerMasterSection: React.FC = () => {
  const { customers, setCustomers, staff } = useApp();
  const [subTab, setSubTab] = useState<'list' | 'territory'>('list');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({ name: '', address: '', lat: 35.6895, lng: 139.6917 });

  const handleSaveCustomer = () => {
    if (!newCustomer.name || !newCustomer.address) {
      alert("顧客名と住所は必須です。");
      return;
    }
    const customerToAdd: Customer = {
      id: `c${Date.now()}`,
      name: newCustomer.name,
      address: newCustomer.address,
      lat: newCustomer.lat || 35.6895,
      lng: newCustomer.lng || 139.6917,
      assignedStaffId: newCustomer.assignedStaffId || selectedStaffId,
      lastVisitDate: newCustomer.lastVisitDate
    };
    setCustomers([...customers, customerToAdd]);
    setIsCustomerModalOpen(false);
    setNewCustomer({ name: '', address: '', lat: 35.6895, lng: 139.6917 });
  };

  const [showOnlyAssigned, setShowOnlyAssigned] = useState(false);

  const mapCustomers = selectedStaffId 
    ? customers.filter(c => c.assignedStaffId === selectedStaffId)
    : customers;
    
  const listCustomers = showOnlyAssigned && selectedStaffId
    ? customers.filter(c => c.assignedStaffId === selectedStaffId)
    : customers;

  const unvisitedCustomers = mapCustomers.filter(c => !c.lastVisitDate || (new Date().getTime() - new Date(c.lastVisitDate).getTime()) > 30 * 24 * 60 * 60 * 1000);

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 mb-6 bg-white rounded-t-lg px-4 pt-4 shadow-sm shrink-0">
        <button
          onClick={() => setSubTab('list')}
          className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${subTab === 'list' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          顧客リスト
        </button>
        <button
          onClick={() => setSubTab('territory')}
          className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${subTab === 'territory' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
        >
          担当顧客管理
        </button>
      </div>

      {subTab === 'list' && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6 flex-1 overflow-y-auto min-h-0">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-slate-800">顧客マスタ</h3>
            <button onClick={() => setIsCustomerModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded flex items-center text-sm font-bold transition shadow-sm">
              <Plus className="w-4 h-4 mr-1"/> 新規顧客を登録
            </button>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-3 font-semibold">顧客名</th>
                <th className="p-3 font-semibold">住所</th>
                <th className="p-3 font-semibold">担当営業</th>
                <th className="p-3 font-semibold">最終訪問</th>
                <th className="p-3 font-semibold text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{c.name}</td>
                  <td className="p-3 text-slate-600">{c.address}</td>
                  <td className="p-3 text-slate-600">
                    {staff.find(s => s.id === c.assignedStaffId)?.name || '未設定'}
                  </td>
                  <td className="p-3 text-slate-600">
                    {c.lastVisitDate ? new Date(c.lastVisitDate).toLocaleDateString() : '未訪問'}
                  </td>
                  <td className="p-3 text-right">
                    <button 
                      onClick={() => { if(window.confirm('削除しますか？')) setCustomers(customers.filter(cust => cust.id !== c.id)); }} 
                      className="text-slate-400 hover:text-rose-500 p-1 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'territory' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 shrink-0 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div>
              <h2 className="font-bold text-slate-800 flex items-center">
                <User className="w-5 h-5 mr-2 text-indigo-500" />
                担当者を選択
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                担当者を選んで、顧客を割り当てます。他担当がついている顧客は追加できません。
              </p>
            </div>
            <div className="w-full sm:w-64">
              <select 
                value={selectedStaffId} 
                onChange={e => setSelectedStaffId(e.target.value)}
                className="w-full border-slate-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">担当者を選択...</option>
                {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
            {!selectedStaffId ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <User className="w-12 h-12 mb-4 text-slate-300" />
                <p>上のメニューから担当者を選択してください</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800">担当中の顧客</h3>
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded-full">
                      {mapCustomers.length} 件
                    </span>
                  </div>
                  {mapCustomers.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4 bg-white rounded-lg border border-dashed border-slate-300">
                      担当している顧客はいません
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {mapCustomers.map(c => (
                        <div key={c.id} className="p-3 border border-indigo-200 bg-white rounded-lg shadow-sm flex flex-col justify-between">
                          <div>
                            <p className="font-bold text-sm text-slate-900">{c.name}</p>
                            <p className="text-xs text-slate-500 mt-1">{c.address}</p>
                          </div>
                          <div className="mt-3 text-right">
                            <button 
                              onClick={() => {
                                const updated = customers.map(cust => cust.id === c.id ? { ...cust, assignedStaffId: undefined } : cust);
                                setCustomers(updated);
                              }}
                              className="text-slate-500 hover:text-rose-600 text-xs font-bold transition flex items-center justify-end w-full"
                            >
                              <X className="w-3 h-3 mr-1" /> 担当から外す
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-bold text-slate-800 mb-4">未割当 / 他の担当者の顧客</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {customers.filter(c => c.assignedStaffId !== selectedStaffId).map(c => {
                      const isOtherAssigned = !!c.assignedStaffId;
                      return (
                        <div key={c.id} className={`p-3 border rounded-lg flex flex-col justify-between shadow-sm ${isOtherAssigned ? 'bg-slate-50 border-slate-200 opacity-70' : 'bg-white border-slate-200'}`}>
                          <div>
                            <div className="flex justify-between items-start">
                              <p className="font-bold text-sm text-slate-900">{c.name}</p>
                              {isOtherAssigned && (
                                <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                                  他担当
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{c.address}</p>
                            {isOtherAssigned && (
                              <p className="text-xs text-slate-400 mt-1">
                                担当: {staff.find(s => s.id === c.assignedStaffId)?.name}
                              </p>
                            )}
                          </div>
                          <div className="mt-3">
                            {!isOtherAssigned ? (
                              <button 
                                onClick={() => {
                                  const updated = customers.map(cust => cust.id === c.id ? { ...cust, assignedStaffId: selectedStaffId } : cust);
                                  setCustomers(updated);
                                }}
                                className="w-full bg-indigo-50 text-indigo-700 hover:bg-indigo-100 py-1.5 rounded text-xs font-bold transition flex items-center justify-center"
                              >
                                <Plus className="w-3 h-3 mr-1" /> 担当に追加
                              </button>
                            ) : (
                              <button disabled className="w-full bg-slate-100 text-slate-400 py-1.5 rounded text-xs font-bold cursor-not-allowed">
                                追加不可
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">新規顧客の登録</h3>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">顧客名 <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={newCustomer.name} 
                  onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} 
                  className="w-full border-slate-300 rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">住所 <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  value={newCustomer.address} 
                  onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} 
                  className="w-full border-slate-300 rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  placeholder="東京都..."
                />
                <p className="text-xs text-slate-500 mt-1">※実際の運用では住所から自動で緯度経度を取得しますが、モックとして固定値(新宿周辺)を使用します。</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">担当営業</label>
                <select 
                  value={newCustomer.assignedStaffId || ''} 
                  onChange={e => setNewCustomer({...newCustomer, assignedStaffId: e.target.value})}
                  className="w-full border-slate-300 rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">担当なし</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex justify-end space-x-2">
              <button onClick={() => setIsCustomerModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">キャンセル</button>
              <button onClick={handleSaveCustomer} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700">登録する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
