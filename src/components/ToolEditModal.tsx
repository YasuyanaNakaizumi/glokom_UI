import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { Tool, ParkingArea } from '../types';
import { useApp } from '../context/AppContext';

export function ToolEditModal({ tool, onClose, onSave }: { tool?: Tool, onClose: () => void, onSave: (t: Tool) => void }) {
  const { parking, t, tEnum } = useApp();
  const [formData, setFormData] = useState<Tool>(tool || {
    id: 't' + Date.now(),
    name: '',
    manager: '',
    description: '',
    defaultLocationId: ''
  });

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-slate-800">{tool ? t('master.toolEditTitle') : t('master.toolCreateTitle')}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{t('master.toolNameLabel')} <span className="text-red-500">*</span></label>
            <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{t('master.toolManagerLabel')}</label>
            <input type="text" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500" value={formData.manager || ''} onChange={e => setFormData({...formData, manager: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{t('master.toolDescriptionLabel')}</label>
            <textarea className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500" rows={3} value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">{t('master.toolLocationLabel')}</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500" value={formData.defaultLocationId || ''} onChange={e => setFormData({...formData, defaultLocationId: e.target.value})}>
              <option value="">{t('common.notSet')}</option>
              {parking.map(p => <option key={p.id} value={p.id}>{p.name} ({tEnum('parkingAreaType', p.type || '駐車場')})</option>)}
            </select>
          </div>
        </div>
        <div className="p-4 border-t bg-slate-50 flex justify-end gap-2 shrink-0 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">{t('common.cancel')}</button>
          <button onClick={() => { if(formData.name) onSave(formData); }} disabled={!formData.name} className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center"><Save className="w-4 h-4 mr-1"/>{t('common.save')}</button>
        </div>
      </div>
    </div>
  );
}
