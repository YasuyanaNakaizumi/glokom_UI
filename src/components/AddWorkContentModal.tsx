import React, { useState } from 'react';
import { X, Plus, Check, AlertCircle, FileText, CheckSquare, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ServiceCategory } from '../types';

interface AddWorkContentModalProps {
  onClose: () => void;
  defaultCategory: ServiceCategory;
  onSave: (
    newWorks: { title: string; reportFormatId: string; paidServiceId: string; category: ServiceCategory }[],
    selectedTaskIds: string[],
    selectedAlertIds: string[]
  ) => void;
}

export function AddWorkContentModal({ onClose, defaultCategory, onSave }: AddWorkContentModalProps) {
  const { tasks, alerts, reportTemplates, t, tEnum } = useApp();
  const [tab, setTab] = useState<'new' | 'existing'>('new');
  
  const [newWorks, setNewWorks] = useState([{ title: '', reportFormatId: '', paidServiceId: '' }]);
  
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [selectedAlertIds, setSelectedAlertIds] = useState<string[]>([]);

  const [showConfirm, setShowConfirm] = useState(false);

  const handleAddBlank = () => {
    setNewWorks([...newWorks, { title: '', reportFormatId: '', paidServiceId: '' }]);
  };

  const handleRemoveBlank = (index: number) => {
    setNewWorks(newWorks.filter((_, i) => i !== index));
  };

  const updateBlank = (index: number, field: string, value: string) => {
    const updated = [...newWorks];
    updated[index] = { ...updated[index], [field]: value };
    setNewWorks(updated);
  };

  const handleRegisterClick = () => {
    if (tab === 'existing' && (selectedTaskIds.length > 0 || selectedAlertIds.length > 0)) {
      setShowConfirm(true);
    } else {
      doSave();
    }
  };

  const doSave = () => {
    const validNewWorks = newWorks.filter(w => w.title.trim()).map(w => ({ ...w, category: defaultCategory }));
    onSave(
      tab === 'new' ? validNewWorks : [], 
      tab === 'existing' ? selectedTaskIds : [], 
      tab === 'existing' ? selectedAlertIds : []
    );
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {showConfirm && (
        <div className="absolute inset-0 z-[80] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 rounded-xl">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full">
            <h3 className="font-bold text-lg text-slate-800 mb-3 flex items-center"><AlertCircle className="w-5 h-5 mr-2 text-indigo-500"/> {t('modal.addWorkContent.confirmTitle')}</h3>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              {t('modal.addWorkContent.confirmBodyTop')}<br/>{t('modal.addWorkContent.confirmBodyBottom')}
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">{t('common.cancel')}</button>
              <button onClick={doSave} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700">{t('modal.addWorkContent.confirmOk')}</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-indigo-600" />
            {t('modal.addWorkContent.title')}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-6 pt-4 border-b border-slate-100 shrink-0">
          <div className="flex space-x-6">
            <button
              onClick={() => setTab('new')}
              className={`pb-3 font-bold text-sm transition-colors border-b-2 ${tab === 'new' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {t('modal.addWorkContent.newTab')}
            </button>
            <button
              onClick={() => setTab('existing')}
              className={`pb-3 font-bold text-sm transition-colors border-b-2 ${tab === 'existing' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              {t('modal.addWorkContent.existingTab')}
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto min-h-0 flex-1 bg-slate-50">
          {tab === 'new' ? (
            <div className="space-y-4">
              {newWorks.map((work, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative group">
                  {newWorks.length > 1 && (
                    <button onClick={() => handleRemoveBlank(idx)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 transition-colors">
                      <X className="w-5 h-5"/>
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 mb-1">{t('modal.addWorkContent.categoryLabel')}</label>
                      <input type="text" value={tEnum('serviceCategory', defaultCategory)} disabled className="w-full bg-slate-100 text-slate-500 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold" />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t('modal.addWorkContent.titleLabel')}</label>
                      <input 
                        type="text" 
                        value={work.title} 
                        onChange={e => updateBlank(idx, 'title', e.target.value)} 
                        placeholder={t('modal.addWorkContent.titlePlaceholder')}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t('modal.addWorkContent.reportFormatLabel')}</label>
                      <select 
                        value={work.reportFormatId}
                        onChange={e => updateBlank(idx, 'reportFormatId', e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">{t('modal.addWorkContent.noSetting')}</option>
                        {reportTemplates?.map(rt => (
                          <option key={rt.id} value={rt.id}>{rt.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t('modal.addWorkContent.compensationLabel')}</label>
                      <select
                        value={work.paidServiceId}
                        onChange={e => updateBlank(idx, 'paidServiceId', e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">{t('modal.addWorkContent.noSetting')}</option>
                        <optgroup label={t('modal.addWorkContent.paidGroupLabel')}>
                          <option value="有償定期メンテナンス">{t('modal.addWorkContent.paidPeriodicMaintenance')}</option>
                          <option value="有償修理">{t('modal.addWorkContent.paidRepair')}</option>
                        </optgroup>
                        <optgroup label={t('modal.addWorkContent.warrantyGroupLabel')}>
                          <option value="無償定期メンテナンス">{t('modal.addWorkContent.warrantyPeriodicMaintenance')}</option>
                          <option value="無償修理">{t('modal.addWorkContent.warrantyRepair')}</option>
                        </optgroup>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={handleAddBlank}
                className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:bg-slate-100 hover:border-slate-400 hover:text-slate-700 transition flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" /> {t('modal.addWorkContent.addBlankButton')}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-700 mb-3 flex items-center"><FileText className="w-4 h-4 mr-2" /> {t('modal.addWorkContent.existingTasksTitle')}</h3>
                {tasks.length > 0 ? (
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <label key={task.id} className="flex items-start p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-indigo-50 transition">
                        <input 
                          type="checkbox" 
                          checked={selectedTaskIds.includes(task.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedTaskIds([...selectedTaskIds, task.id]);
                            else setSelectedTaskIds(selectedTaskIds.filter(id => id !== task.id));
                          }}
                          className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
                        />
                        <div className="ml-3">
                          <p className="text-sm font-bold text-slate-800">{task.title}</p>
                          <p className="text-xs text-slate-500">{tEnum('serviceCategory', task.category)} • {task.targetModelName || t('common.notSet')}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 bg-white p-4 rounded-lg border border-slate-200 text-center">{t('modal.addWorkContent.noExistingTasks')}</p>
                )}
              </div>
              
              <div>
                <h3 className="font-bold text-slate-700 mb-3 flex items-center"><AlertCircle className="w-4 h-4 mr-2 text-rose-500" /> {t('modal.addWorkContent.alertsTitle')}</h3>
                {alerts.length > 0 ? (
                  <div className="space-y-2">
                    {alerts.filter(a => !a.isIgnored).map(a => (
                      <label key={a.id} className="flex items-start p-3 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-indigo-50 transition">
                        <input 
                          type="checkbox" 
                          checked={selectedAlertIds.includes(a.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedAlertIds([...selectedAlertIds, a.id]);
                            else setSelectedAlertIds(selectedAlertIds.filter(id => id !== a.id));
                          }}
                          className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
                        />
                        <div className="ml-3">
                          <p className="text-sm font-bold text-slate-800">{a.title || a.description}</p>
                          <p className="text-xs text-slate-500">{a.type} {a.targetModelName ? `• ${a.targetModelName}` : ''}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 bg-white p-4 rounded-lg border border-slate-200 text-center">{t('modal.addWorkContent.noAlerts')}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-4 md:px-6 border-t border-slate-100 bg-white flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
            {t('common.cancel')}
          </button>
          <button 
            onClick={handleRegisterClick} 
            disabled={(tab === 'new' && !newWorks.some(w => w.title.trim())) || (tab === 'existing' && selectedTaskIds.length === 0 && selectedAlertIds.length === 0)}
            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 flex items-center"
          >
            <Check className="w-4 h-4 mr-2" />
            {t('modal.addWorkContent.registerButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
