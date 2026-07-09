import React from 'react';
import { X, CheckCircle, Image as ImageIcon, CheckSquare, MessageSquare } from 'lucide-react';
import { ServiceTask } from '../types';
import { useApp } from '../context/AppContext';

interface TaskReportApprovalModalProps {
  task: ServiceTask;
  onClose: () => void;
}

export const TaskReportApprovalModal: React.FC<TaskReportApprovalModalProps> = ({ task, onClose }) => {
  const { updateTask } = useApp();

  const handleApprove = () => {
    updateTask(task.id, {
      isApproved: true,
      approvedAt: new Date().toISOString(),
      approverName: '管理者', // In a real app, this would be the logged-in user
      progress: '完了'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center">
            <CheckSquare className="w-5 h-5 mr-2 text-emerald-600" />
            結果確認及び承認: {task.title}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <div className="space-y-6">
            
            {/* Task Info Summary */}
            <div className="bg-white p-4 rounded-lg border border-slate-200 flex flex-wrap gap-4 text-sm shadow-sm">
              <div>
                <div className="text-slate-500 mb-1">対象機材</div>
                <div className="font-bold text-slate-800">{task.targetModelName || '未設定'}</div>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <div className="text-slate-500 mb-1">カテゴリ</div>
                <div className="font-bold text-slate-800">{task.category}</div>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <div className="text-slate-500 mb-1">作業完了予定日</div>
                <div className="font-bold text-slate-800">{new Date(task.deadline).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Mechanic Report */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center">
                <MessageSquare className="w-4 h-4 text-slate-600 mr-2" />
                <h3 className="font-bold text-slate-800 text-sm">作業報告内容 (メカニックより)</h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-500 mb-2">作業コメント</h4>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-slate-700 text-sm leading-relaxed">
                    指定された項目の点検および調整を完了しました。
                    特に異常は見られませんでしたが、可動部のグリスアップを重点的に行いました。
                    次回点検時にはフィルター類の交換を推奨します。
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-500 mb-2 flex items-center">
                    <ImageIcon className="w-3 h-3 mr-1" />
                    添付画像 (証跡)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Dummy images with placeholders */}
                    <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden border border-slate-300 relative group cursor-pointer">
                      <img src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=400&q=80" alt="作業証跡1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                    </div>
                    <div className="aspect-video bg-slate-200 rounded-lg overflow-hidden border border-slate-300 relative group cursor-pointer">
                      <img src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&q=80" alt="作業証跡2" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-500 mb-2">チェックリスト項目</h4>
                  <div className="space-y-2 text-sm bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <div className="flex items-center px-3 py-2 border-b border-slate-100 bg-emerald-50/30">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                      <span className="text-slate-700">エンジンオイル・冷却水の漏れ確認</span>
                    </div>
                    <div className="flex items-center px-3 py-2 border-b border-slate-100 bg-emerald-50/30">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                      <span className="text-slate-700">各部グリスアップ実施</span>
                    </div>
                    <div className="flex items-center px-3 py-2 bg-emerald-50/30">
                      <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                      <span className="text-slate-700">動作テスト（異音・振動の確認）</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-white flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors"
          >
            キャンセル
          </button>
          <button 
            onClick={handleApprove}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center transition-colors shadow-sm"
          >
            <CheckSquare className="w-5 h-5 mr-2" />
            承認する (完了)
          </button>
        </div>
      </div>
    </div>
  );
};
