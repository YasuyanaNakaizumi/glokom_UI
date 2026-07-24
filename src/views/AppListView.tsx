import React from 'react';
import { useApp } from '../context/AppContext';
import { LayoutGrid, ExternalLink, ArrowRight, Bot, Truck, FileSignature, Cloud } from 'lucide-react';

export const AppListView: React.FC = () => {
  const { t } = useApp();

  const externalApps = [
    { id: 'kgp', icon: Cloud, title: 'KGP', descriptionKey: 'sample.app.kgpDesc', url: '#' },
    { id: 'aibot', icon: Bot, title: 'AIbot', descriptionKey: 'sample.app.aibotDesc', url: '#' },
    { id: 'komfleet', icon: Truck, title: 'komfleet', descriptionKey: 'sample.app.komfleetDesc', url: '#' },
    { id: 'cpq', icon: FileSignature, title: 'CPQ', descriptionKey: 'sample.app.cpqDesc', url: '#' }
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50 relative">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shrink-0 z-10 sticky top-0 shadow-sm">
        <div className="flex items-center space-x-2">
          <LayoutGrid className="w-5 h-5 text-indigo-600" />
          <h1 className="text-xl font-bold text-slate-800">{t('views.appList.title')}</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h2 className="text-sm font-bold text-slate-500 mb-4 tracking-wider flex items-center">
              {t('views.appList.externalApps')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {externalApps.map(app => (
                <a
                  key={app.id}
                  href={app.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white border border-slate-200 p-5 rounded-xl text-left hover:border-indigo-300 hover:shadow-md transition-all duration-200 flex flex-col h-full cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-indigo-600 mb-4 group-hover:bg-indigo-50 group-hover:scale-110 transition-transform">
                    <app.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-indigo-700 transition-colors">{app.title}</h3>
                  <p className="text-sm text-slate-500 flex-1">{t(app.descriptionKey)}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                      {t('views.appList.open')} <ArrowRight className="w-3 h-3 ml-1" />
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
