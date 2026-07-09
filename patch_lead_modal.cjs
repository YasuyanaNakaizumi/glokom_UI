const fs = require('fs');
let content = fs.readFileSync('src/components/LeadDetailsModal.tsx', 'utf8');

// Add ExternalLink to imports
content = content.replace('X, Check, Link as LinkIcon, Trophy, Edit3, Building', 'X, Check, Link as LinkIcon, Trophy, Edit3, Building, ExternalLink');

const memoSectionEnd = `            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">`;

const quickLinks = `            {/* Quick Links */}
            <div className="flex flex-wrap gap-2">
              <a href="#" className="flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100 shadow-sm">
                <ExternalLink className="w-3 h-3 mr-1.5" /> 見積もりサイト
              </a>
              <a href="#" className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors border border-amber-100 shadow-sm">
                <ExternalLink className="w-3 h-3 mr-1.5" /> 特注可否申請
              </a>
              <a href="#" className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100 shadow-sm">
                <ExternalLink className="w-3 h-3 mr-1.5" /> 中古車販売サイト
              </a>
              <a href="#" className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100 shadow-sm">
                <ExternalLink className="w-3 h-3 mr-1.5" /> 下取り査定サイト
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">`;

content = content.replace(memoSectionEnd, quickLinks);
fs.writeFileSync('src/components/LeadDetailsModal.tsx', content);
