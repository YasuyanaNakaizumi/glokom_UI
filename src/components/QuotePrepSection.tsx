import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';

export const QuotePrepSection: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="p-3 bg-amber-50 border-b border-amber-100/50 text-amber-900">
        <h3 className="font-bold text-sm flex items-center">
          <FileText className="w-4 h-4 mr-2 text-amber-500" />
          見積文書準備
        </h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 gap-3">
          <button className="flex items-center justify-center p-3 border border-amber-200 rounded-lg bg-amber-50/50 text-amber-800 hover:bg-amber-100 transition-colors shadow-sm group">
            <ExternalLink className="w-4 h-4 mr-2 text-amber-500 group-hover:text-amber-600" />
            <span className="font-bold text-sm">見積もりサイト</span>
          </button>
          <button className="flex items-center justify-center p-3 border border-amber-200 rounded-lg bg-amber-50/50 text-amber-800 hover:bg-amber-100 transition-colors shadow-sm group">
            <ExternalLink className="w-4 h-4 mr-2 text-amber-500 group-hover:text-amber-600" />
            <span className="font-bold text-sm">特注可否申請</span>
          </button>
          <button className="flex items-center justify-center p-3 border border-amber-200 rounded-lg bg-amber-50/50 text-amber-800 hover:bg-amber-100 transition-colors shadow-sm group">
            <ExternalLink className="w-4 h-4 mr-2 text-amber-500 group-hover:text-amber-600" />
            <span className="font-bold text-sm">中古車販売サイト</span>
          </button>
          <button className="flex items-center justify-center p-3 border border-amber-200 rounded-lg bg-amber-50/50 text-amber-800 hover:bg-amber-100 transition-colors shadow-sm group">
            <ExternalLink className="w-4 h-4 mr-2 text-amber-500 group-hover:text-amber-600" />
            <span className="font-bold text-sm">下取り査定サイト</span>
          </button>
        </div>
      </div>
    </div>
  );
};
