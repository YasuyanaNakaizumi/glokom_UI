import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Calendar as CalendarIcon, Clock, Users, Type } from 'lucide-react';
import { addDays, format } from 'date-fns';

export function AddOtherEventModal({ onClose }: { onClose: () => void }) {
  const { staff, addTask, t } = useApp();
  
  const [title, setTitle] = useState('');
  const [staffIds, setStaffIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd'T'10:00"));
  const [endDate, setEndDate] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd'T'12:00"));
  const [isNonWorkingDay, setIsNonWorkingDay] = useState(false);

  const toggleStaff = (id: string) => {
    setStaffIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSave = () => {
    if (!title || staffIds.length === 0) return;
    addTask({
      title,
      category: 'その他予定',
      urgency: '通常',
      progress: '未着手',
      deadline: endDate,
      startDate: startDate,
      staffIds: staffIds,
      isNonWorkingDay
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-black text-slate-800">{t('modal.addOtherEvent.title')}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 overflow-y-auto">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
              <Type className="w-4 h-4 mr-1 text-slate-400" />
              {t('modal.addOtherEvent.titleLabel')}
            </label>
            <input 
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500" 
              placeholder={t('modal.addOtherEvent.titlePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
              <Users className="w-4 h-4 mr-1 text-slate-400" />
              {t('modal.addOtherEvent.participantsLabel')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {staff.map(s => (
                <label key={s.id} className="flex items-center space-x-2 border p-2 rounded cursor-pointer hover:bg-slate-50">
                  <input 
                    type="checkbox" 
                    checked={staffIds.includes(s.id)}
                    onChange={() => toggleStaff(s.id)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium">{s.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1 text-slate-400" />
                {t('modal.addOtherEvent.startDateLabel')}
              </label>
              <input 
                type="datetime-local" 
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center">
                <Clock className="w-4 h-4 mr-1 text-slate-400" />
                {t('modal.addOtherEvent.endDateLabel')}
              </label>
              <input 
                type="datetime-local" 
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm" 
              />
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-100 transition">
              <input 
                type="checkbox" 
                checked={isNonWorkingDay}
                onChange={e => setIsNonWorkingDay(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm font-bold text-amber-900">{t('modal.addOtherEvent.nonWorkingDayLabel')}</span>
            </label>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            {t('common.cancel')}
          </button>
          <button 
            onClick={handleSave}
            disabled={!title || staffIds.length === 0}
            className="px-6 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
