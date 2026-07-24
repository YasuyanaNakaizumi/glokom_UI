const fs = require('fs');
const path = './src/components/LeadDetailsModal.tsx';
let content = fs.readFileSync(path, 'utf8');

const imports = "import { X, Check, Link as LinkIcon, Trophy, Edit3, Building, ExternalLink, AlertTriangle, Plus, Trash2 } from 'lucide-react';";
content = content.replace(/import \{ X, Check, Link as LinkIcon, Trophy, Edit3, Building, ExternalLink \} from 'lucide-react';/, imports);

const statesToAdd = `
  const [showLostForm, setShowLostForm] = useState(false);
  const [lostReason, setLostReason] = useState<string>('');
  const [competitors, setCompetitors] = useState<{ companyName: string, amount: number | '' }[]>([{ companyName: '', amount: '' }]);
`;
content = content.replace("const [createdQuoteId, setCreatedQuoteId] = useState<string>('');", "const [createdQuoteId, setCreatedQuoteId] = useState<string>('');\n" + statesToAdd);

const handleSaveLost = `
  const handleSaveLost = () => {
    updateSalesLead(lead.id, {
      ...lead,
      status: 'lost',
      lostReason,
      competitors: competitors.filter(c => c.companyName).map(c => ({ ...c, amount: Number(c.amount) || 0 }))
    });
    onClose();
  };
`;
content = content.replace("const handleSaveLeadState = () => {", handleSaveLost + "\n  const handleSaveLeadState = () => {");

const lostFormJSX = `
          {showLostForm ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 flex items-center text-rose-600">
                  <AlertTriangle className="w-6 h-6 mr-2" /> 失注処理
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">失注理由 <span className="text-red-500">*</span></label>
                  <textarea 
                    value={lostReason} 
                    onChange={e => setLostReason(e.target.value)} 
                    className="w-full border-slate-300 rounded-lg p-3 text-sm focus:ring-rose-500 focus:border-rose-500" 
                    rows={3} 
                    placeholder="価格負け、納期、スペック不足など..."
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-bold text-slate-700">競合会社情報</label>
                    <button 
                      onClick={() => setCompetitors([...competitors, { companyName: '', amount: '' }])}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded font-bold flex items-center transition"
                    >
                      <Plus className="w-3 h-3 mr-1" /> 追加
                    </button>
                  </div>
                  <div className="space-y-2">
                    {competitors.map((comp, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input 
                          type="text" 
                          value={comp.companyName} 
                          onChange={e => {
                            const newC = [...competitors];
                            newC[idx].companyName = e.target.value;
                            setCompetitors(newC);
                          }} 
                          placeholder="会社名" 
                          className="flex-1 border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-rose-500" 
                        />
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">¥</span>
                          <input 
                            type="number" 
                            value={comp.amount} 
                            onChange={e => {
                              const newC = [...competitors];
                              newC[idx].amount = e.target.value ? Number(e.target.value) : '';
                              setCompetitors(newC);
                            }} 
                            placeholder="金額" 
                            className="w-32 pl-7 pr-3 py-2 border-slate-300 rounded-lg text-sm focus:ring-rose-500" 
                          />
                        </div>
                        {competitors.length > 1 && (
                          <button 
                            onClick={() => setCompetitors(competitors.filter((_, i) => i !== idx))} 
                            className="text-slate-400 hover:text-red-500 transition p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button onClick={() => setShowLostForm(false)} className="px-5 py-2.5 rounded-lg text-slate-600 font-bold hover:bg-slate-100 transition">
                  キャンセル
                </button>
                <button 
                  onClick={handleSaveLost} 
                  disabled={!lostReason.trim()}
                  className="px-5 py-2.5 rounded-lg text-white font-bold bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition shadow-sm"
                >
                  失注として確定
                </button>
              </div>
            </div>
          ) : (
            <>
`;

content = content.replace("          {/* Header */}", lostFormJSX + "          {/* Header */}");

const lostButtonJSX = `
            <button 
              onClick={handleConfirmOrder} 
              className="w-full md:w-auto bg-emerald-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-emerald-700 flex items-center shadow-md transition-all active:scale-95"
            >
              <Trophy className="w-4 h-4 mr-2" /> 受注を確定して納入管理に進む
            </button>
            <div className="flex gap-3 w-full md:w-auto justify-end mt-4 md:mt-0">
              <button 
                onClick={() => setShowLostForm(true)} 
                className="bg-white border border-rose-200 text-rose-600 font-bold px-4 py-2.5 rounded-lg hover:bg-rose-50 flex items-center transition-colors mr-auto"
              >
                失注
              </button>
`;
content = content.replace(/            <button \n              onClick=\{handleConfirmOrder\} [\s\S]*?<Trophy className="w-4 h-4 mr-2" \/> 受注を確定して納入管理に進む\n            <\/button>\n            <div className="flex gap-3 w-full md:w-auto justify-end">/, lostButtonJSX);

content = content.replace(/          <\/div>\n        <\/div>\n      \)\}\n    <\/>\n  \);\n\};/, "          </div>\n        </>\n        )}\n        </div>\n      )}\n    </>\n  );\n};");

fs.writeFileSync(path, content, 'utf8');
