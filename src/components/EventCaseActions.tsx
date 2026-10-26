import React, { useId } from 'react';
import { Briefcase, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const EventCaseActions = ({ action }: { action: 'create' | 'detail' }) => {
  const { t } = useApp();
  const descriptionId = useId();

  return (
    <section className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
      <div className="flex items-start gap-3">
        <span className="rounded-lg bg-indigo-100 p-2 text-indigo-700">
          <Briefcase className="h-5 w-5" />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-black text-slate-800">{t('fleet.event.caseManagementTitle')}</h4>
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-indigo-600 ring-1 ring-indigo-200">
              {t('fleet.event.caseScreenPending')}
            </span>
          </div>
          <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
            {t(action === 'create' ? 'fleet.event.caseCreateDescription' : 'fleet.event.caseDetailDescription')}
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled
        aria-describedby={descriptionId}
        className="mt-4 inline-flex w-full cursor-not-allowed items-center justify-center rounded-lg border border-indigo-200 bg-white px-4 py-2.5 text-sm font-black text-indigo-400"
      >
        {action === 'create' ? <Briefcase className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
        {t(action === 'create' ? 'fleet.event.createCase' : 'fleet.event.openCaseDetail')}
      </button>
      <p id={descriptionId} className="mt-2 text-xs text-slate-500">
        {t('fleet.event.caseScreenPendingDescription')}
      </p>
    </section>
  );
};
