import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Car, Search, List, Users, Shield, Wrench, Activity, Bot, ExternalLink, History, ArrowLeft, FileText } from 'lucide-react';
import { ContractManagementModal } from '../components/ContractManagementModal';
import { AddRepairTaskModal } from '../components/AddRepairTaskModal';
import { Vehicle } from '../types';
import { VehicleDetailPanels } from '../components/VehicleDetailPanels';

export const VehicleListView = () => {
  const { vehicles, customers, tasks } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  
  
  const [selectedContractVehicleId, setSelectedContractVehicleId] = useState<string | null>(null);
  const [selectedRepairVehicleId, setSelectedRepairVehicleId] = useState<string | null>(null);

  const filteredVehicles = vehicles.filter(v => 
    v.modelName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectVehicle = (id: string) => {
    setSelectedVehicleId(id);
    
  };

  const renderListItem = (v: Vehicle) => {
    const isSelected = selectedVehicleId === v.id;
    return (
      <button
        key={v.id}
        onClick={() => handleSelectVehicle(v.id)}
        className={`w-full text-left px-4 py-2.5 border-b border-slate-100 hover:bg-white transition-colors relative ${
          isSelected ? 'bg-white' : ''
        }`}
      >
        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600" />}
        <div className="flex justify-between items-center mb-0.5">
          <div className="flex items-baseline gap-2 overflow-hidden pr-2">
            <h4 className={`font-bold text-sm truncate ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>{v.modelName}</h4>
            <span className="text-xs font-mono text-slate-500 font-bold shrink-0">{v.serialNumber}</span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border shrink-0 ${v.status === '在庫' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
            {v.status === '在庫' ? '在庫' : '稼働中'}
          </span>
        </div>
        {v.customerName && (
          <div className="text-[11px] font-bold text-slate-500 flex items-center mt-1">
            <Users className="w-3 h-3 mr-1 opacity-70 shrink-0" />
            <span className="truncate">{v.customerName}</span>
          </div>
        )}
      </button>
    );
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden bg-white">
      {/* Left Pane: List */}
      <div className={`w-full md:w-[260px] shrink-0 flex-col border-r border-slate-200 bg-slate-50/50 h-full ${selectedVehicleId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-200 shrink-0 bg-white z-10 shadow-sm relative">
          <h1 className="text-lg font-black text-slate-800 flex items-center mb-3">
            <Car className="w-5 h-5 mr-2 text-indigo-600" />
            車両リスト
          </h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="モデル、S/N、顧客名..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm bg-slate-50 focus:bg-white transition-colors"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredVehicles.map(renderListItem)}
          {filteredVehicles.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">車両が見つかりません</div>
          )}
        </div>
      </div>

      {/* Right Pane: Details */}
      <div className={`w-full flex-1 flex-col bg-slate-50 h-full ${selectedVehicleId ? 'flex' : 'hidden md:flex'}`}>
        {selectedVehicle ? (
          <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-200 relative">
            
            {/* Mobile Back Button (Top) */}
            <div className="pt-6 px-6 md:pt-8 md:px-8 shrink-0 bg-white md:hidden">
               <button onClick={() => setSelectedVehicleId(null)} className="flex items-center text-sm font-bold text-slate-500 hover:text-indigo-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                  <ArrowLeft className="w-4 h-4 mr-1.5" /> 戻る
               </button>
            </div>
            
            {/* Detail Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
               
               <VehicleDetailPanels vehicle={selectedVehicle} />

            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
              <Car className="w-10 h-10 text-slate-300" />
            </div>
            <p className="font-bold text-xl text-slate-500 mb-2">車両を選択してください</p>
            <p className="text-sm">左側のリストから車両を選ぶと詳細が表示されます</p>
          </div>
        )}
      </div>

      {selectedContractVehicleId && (
        <ContractManagementModal 
          onClose={() => setSelectedContractVehicleId(null)} 
          initialVehicleId={selectedContractVehicleId} 
        />
      )}
      {selectedRepairVehicleId && (
        <AddRepairTaskModal
          onClose={() => setSelectedRepairVehicleId(null)}
          initialVehicleId={selectedRepairVehicleId}
        />
      )}
    </div>
  );
};
