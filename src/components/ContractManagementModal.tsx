import React, { useState } from 'react';
import { X, Shield, History, Plus, AlertCircle, FileText, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VehicleContract, Vehicle } from '../types';
import { tLegacyMaster } from '../lib/i18n';

interface ContractManagementModalProps {
  onClose: () => void;
  initialVehicleId?: string;
}

export const ContractManagementModal: React.FC<ContractManagementModalProps> = ({ onClose, initialVehicleId }) => {
  const { vehicles, updateVehicle, contracts, t, lang } = useApp();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(initialVehicleId || null);
  
  // For adding a new contract
  const [showAddContract, setShowAddContract] = useState(false);
  const [newContractId, setNewContractId] = useState('');
  const [newContractStartDate, setNewContractStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newContractStartSmr, setNewContractStartSmr] = useState<number>(0);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  const handleExpireContract = (vehicleId: string, contractIdx: number) => {
    if (!window.confirm(t('master.contractManagementExpireConfirm'))) return;
    const v = vehicles.find(v => v.id === vehicleId);
    if (!v) return;
    
    const newContracts = [...(v.contracts || [])];
    newContracts[contractIdx] = {
      ...newContracts[contractIdx],
      status: 'expired',
      endDate: new Date().toISOString()
    };
    
    updateVehicle(vehicleId, { contracts: newContracts });
  };

  const handleRenewContract = (vehicleId: string, oldContract: VehicleContract) => {
    if (!window.confirm(t('master.contractManagementRenewConfirm'))) return;
    
    // Instead of directly updating, maybe prepopulate the "Add Contract" form
    setNewContractId(oldContract.contractId);
    setNewContractStartDate(new Date().toISOString().split('T')[0]);
    // Optionally fetch current SMR, assuming selectedVehicle.currentSmr exists
    setNewContractStartSmr(selectedVehicle?.currentSmr || 0);
    setShowAddContract(true);
  };

  const handleAddContract = () => {
    if (!selectedVehicleId || !newContractId) {
      alert(t('master.contractManagementSelectTemplateAlert'));
      return;
    }
    const v = vehicles.find(v => v.id === selectedVehicleId);
    if (!v) return;

    const newContract: VehicleContract = {
      contractId: newContractId,
      startDate: new Date(newContractStartDate).toISOString(),
      startSmr: newContractStartSmr,
      status: 'active'
    };

    updateVehicle(selectedVehicleId, { contracts: [...(v.contracts || []), newContract] });
    setShowAddContract(false);
    setNewContractId('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-indigo-500" />
            {t('master.contractManagementTitle')}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition"><X className="w-5 h-5"/></button>
        </div>
        
        <div className="flex flex-1 min-h-0">
          {/* Left: Vehicle List */}
          <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50">
            <div className="p-4 border-b border-slate-200">
              <h4 className="font-bold text-sm text-slate-700">{t('master.contractManagementVehicleListTitle')}</h4>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {vehicles.map(v => (
                <button
                  key={v.id}
                  onClick={() => {
                    setSelectedVehicleId(v.id);
                    setShowAddContract(false);
                  }}
                  className={`w-full text-left p-3 rounded-lg text-sm transition ${
                    selectedVehicleId === v.id 
                      ? 'bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold shadow-sm' 
                      : 'hover:bg-slate-100 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-bold">{v.modelName}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{v.serialNumber}</div>
                    </div>
                    {v.contracts && v.contracts.filter(c => c.status !== 'expired').length > 0 && (
                      <span className="bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                        {v.contracts.filter(c => c.status !== 'expired').length}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Contract Details */}
          <div className="w-2/3 flex flex-col bg-white">
            {!selectedVehicle ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <FileText className="w-12 h-12 mb-4 text-slate-200" />
                <p>{t('master.contractManagementSelectVehicleHint')}</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">{selectedVehicle.modelName}</h2>
                      <p className="text-sm text-slate-500 font-mono mt-1">S/N: {selectedVehicle.serialNumber}</p>
                    </div>
                    <button 
                      onClick={() => setShowAddContract(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition flex items-center shadow-sm"
                    >
                      <Plus className="w-4 h-4 mr-1" /> {t('master.contractManagementAddButton')}
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                  {showAddContract && (
                    <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm mb-6 animate-in fade-in slide-in-from-top-4">
                      <h4 className="font-bold text-indigo-900 mb-4 flex items-center">
                        <Plus className="w-4 h-4 mr-1" /> {t('master.contractManagementAddFormTitle')}
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">{t('master.contractManagementTemplateLabel')}</label>
                          <select 
                            value={newContractId}
                            onChange={e => setNewContractId(e.target.value)}
                            className="w-full border-slate-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="">{t('master.contractManagementSelectPlaceholder')}</option>
                            {contracts.map(c => (
                              <option key={c.id} value={c.id}>{tLegacyMaster(lang, 'contract', c.id, 'name', c.title)}</option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">{t('master.contractManagementStartDateLabel')}</label>
                            <input 
                              type="date" 
                              value={newContractStartDate}
                              onChange={e => setNewContractStartDate(e.target.value)}
                              className="w-full border-slate-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">{t('master.contractManagementStartSmrLabel')}</label>
                            <input 
                              type="number" 
                              value={newContractStartSmr}
                              onChange={e => setNewContractStartSmr(Number(e.target.value))}
                              className="w-full border-slate-300 rounded-lg p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                          <button 
                            onClick={() => setShowAddContract(false)}
                            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50"
                          >
                            {t('common.cancel')}
                          </button>
                          <button 
                            onClick={handleAddContract}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold"
                          >
                            {t('master.contractManagementAddUpdateButton')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                    <History className="w-4 h-4 mr-2 text-slate-500" />
                    {t('master.contractManagementHistoryTitle')}
                  </h3>

                  {(!selectedVehicle.contracts || selectedVehicle.contracts.length === 0) ? (
                    <div className="text-center p-8 bg-white border border-slate-200 border-dashed rounded-xl">
                      <p className="text-sm text-slate-500">{t('master.contractManagementNoContracts')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedVehicle.contracts.map((vc, idx) => {
                        const template = contracts.find(c => c.id === vc.contractId);
                        const isExpired = vc.status === 'expired';
                        
                        return (
                          <div key={`${vc.contractId}-${idx}`} className={`p-4 rounded-xl border ${isExpired ? 'bg-slate-50 border-slate-200' : 'bg-white border-indigo-100 shadow-sm'} transition`}>
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className={`font-bold ${isExpired ? 'text-slate-500' : 'text-indigo-900'} flex items-center`}>
                                  {template?.title || t('master.contractManagementUnknownContract')}
                                  {isExpired && (
                                    <span className="ml-2 bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded font-bold">
                                      {t('master.contractManagementExpiredBadge')}
                                    </span>
                                  )}
                                  {!isExpired && (
                                    <span className="ml-2 bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded font-bold flex items-center">
                                      <CheckCircle className="w-3 h-3 mr-1" /> {t('master.contractManagementActiveBadge')}
                                    </span>
                                  )}
                                </h4>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{template?.description}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-50 p-3 rounded-lg text-sm">
                              <div>
                                <p className="text-xs text-slate-500 mb-1">{t('master.contractManagementStartDateLabel')}</p>
                                <p className="font-bold text-slate-700">{new Date(vc.startDate).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 mb-1">{t('master.contractManagementStartSmrLabel')}</p>
                                <p className="font-bold text-slate-700">{vc.startSmr.toLocaleString()} h</p>
                              </div>
                              {isExpired && vc.endDate && (
                                <div className="col-span-2 border-t border-slate-200 pt-2 mt-1">
                                  <p className="text-xs text-slate-500 mb-1">{t('master.contractManagementEndDateLabel')}</p>
                                  <p className="font-bold text-slate-700">{new Date(vc.endDate).toLocaleDateString()}</p>
                                </div>
                              )}
                            </div>

                            <div className="flex justify-end space-x-2 border-t border-slate-100 pt-3">
                              {!isExpired && (
                                <>
                                  <button 
                                    onClick={() => handleExpireContract(selectedVehicle.id, idx)}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-bold rounded-lg transition"
                                  >
                                    {t('master.contractManagementExpireButton')}
                                  </button>
                                </>
                              )}
                              <button 
                                onClick={() => handleRenewContract(selectedVehicle.id, vc)}
                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition"
                              >
                                {t('master.contractManagementRenewButton')}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
