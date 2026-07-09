import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Home, Truck, ClipboardList, CalendarDays, FileBox, Globe, User, MessageSquare, LayoutGrid, Users, Car } from 'lucide-react';
import { cn } from '../lib/utils';
import { ViewState } from '../types';
import { EditTaskModal } from './EditTaskModal';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang, setLang, view, setView, t, tasks } = useApp();
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const navItems: { id: ViewState, icon: React.FC<any>, label: string }[] = [
    { id: 'home', icon: Home, label: t('home') },
    { id: 'vehicles', icon: Car, label: '車両リスト' },
    { id: 'customers', icon: Users, label: '顧客リスト' },
    { id: 'fleet', icon: Truck, label: 'イベント管理' /* needs translation ref later */ },
    { id: 'tasks', icon: ClipboardList, label: t('tasksTab') },
    { id: 'schedule', icon: CalendarDays, label: t('schedule') },
    { id: 'master', icon: FileBox, label: t('masterTab') },
    { id: 'app_list', icon: LayoutGrid, label: 'アプリ' },
  ];

  // Adjust label names from translation manually for missing keys or update i18n
  const getNavLabel = (id: ViewState) => {
    switch (id) {
      case 'home': return t('home');
      case 'vehicles': return '車両リスト';
      case 'customers': return '顧客リスト';
      case 'fleet': return 'イベント管理';
      case 'tasks': return t('tasksTab');
      case 'schedule': return t('schedule');
      case 'master': return t('masterTab');
      case 'app_list': return 'アプリ';
      default: return id;
    }
  }

  // Get tasks with chats and sort by latest message
  const tasksWithChats = tasks
    .filter(t => t.chatMessages && t.chatMessages.length > 0)
    .sort((a, b) => {
      const aLatest = a.chatMessages![a.chatMessages!.length - 1];
      const bLatest = b.chatMessages![b.chatMessages!.length - 1];
      const aTime = isNaN(Number(aLatest.id)) ? 0 : Number(aLatest.id);
      const bTime = isNaN(Number(bLatest.id)) ? 0 : Number(bLatest.id);
      return bTime - aTime;
    });

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Sidebar (PC) */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-900 text-slate-300 shadow-xl z-20">
        <div className="p-4 bg-slate-950 flex items-center space-x-3 shrink-0">
          <div className="w-8 h-8 rounded bg-indigo-500 text-white flex items-center justify-center font-bold text-xl">
            K
          </div>
          <span className="font-bold text-lg text-white">K-Fleet Link</span>
        </div>
        
        <nav className="py-4 space-y-1 shrink-0 border-b border-slate-800">
          {navItems.map(item => {
            const isCategoryTaskView = view.startsWith('tasks_');
            const isActive = view === item.id || ((view === 'stock_calendar' || isCategoryTaskView) && item.id === 'home') || (view === 'reports' && item.id === 'tasks');
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={cn(
                  "w-full flex items-center space-x-3 px-6 py-2.5 transition-colors text-left",
                  isActive ? "bg-indigo-900/50 text-indigo-400 border-r-4 border-indigo-500" : "hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="font-medium text-sm">{getNavLabel(item.id)}</span>
              </button>
            )
          })}
        </nav>

        {/* Chat History Section */}
        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-2">
          <div className="px-3 flex items-center text-xs font-bold text-slate-500 mb-2 mt-2 uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
            最近のチャット
          </div>
          {tasksWithChats.length > 0 ? (
            tasksWithChats.map(t => {
              const latestMsg = t.chatMessages![t.chatMessages!.length - 1];
              return (
                <button
                  key={t.id}
                  onClick={() => setEditingTaskId(t.id)}
                  className="w-full text-left p-3 rounded-lg hover:bg-slate-800 transition-colors group relative"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-200 text-xs truncate pr-2">{t.title}</span>
                    <span className="text-[10px] text-slate-500 shrink-0">{latestMsg.time}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate flex items-center">
                    <span className="font-semibold text-slate-300 mr-1 shrink-0">{latestMsg.sender}:</span>
                    <span className="truncate">{latestMsg.text}</span>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="px-3 py-4 text-center text-xs text-slate-600">
              チャット履歴はありません
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 space-y-4 shrink-0">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <p className="text-white font-medium">Service Front</p>
              <p className="text-xs text-green-400">● Online</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs bg-slate-950 rounded p-1">
            <button
              onClick={() => setLang('ja')}
              className={cn("px-3 py-1.5 rounded transition-colors flex-1", lang === 'ja' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300')}
            >
              日本語
            </button>
            <button
              onClick={() => setLang('en')}
              className={cn("px-3 py-1.5 rounded transition-colors flex-1", lang === 'en' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300')}
            >
              EN
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0 relative bg-slate-50">
        {children}
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex p-2 z-50 overflow-x-auto gap-2" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {navItems.map(item => {
          const isCategoryTaskView = view.startsWith('tasks_');
          const isActive = view === item.id || ((view === 'stock_calendar' || isCategoryTaskView) && item.id === 'home') || (view === 'reports' && item.id === 'tasks');
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg min-w-[72px] shrink-0",
                isActive ? "text-indigo-600 font-medium" : "text-gray-500"
              )}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-[10px]">{getNavLabel(item.id)}</span>
            </button>
          );
        })}
      </nav>

      {editingTaskId && (
        <EditTaskModal
          taskId={editingTaskId}
          isReadOnly={tasks.find(t => t.id === editingTaskId)?.progress === '完了'}
          onClose={() => setEditingTaskId(null)}
        />
      )}
    </div>
  );
};
