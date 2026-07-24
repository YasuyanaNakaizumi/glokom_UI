const fs = require('fs');
const path = './src/components/ContractEditModal.tsx';
let content = fs.readFileSync(path, 'utf8');

const modals = `
      {showReportSelector && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                報告様式の選択
              </h3>
              <button onClick={() => setShowReportSelector(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {reportTemplates.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  作成済みの報告様式はありません。
                </div>
              ) : (
                <div className="space-y-2">
                  {reportTemplates.map(rt => (
                    <button
                      key={rt.id}
                      onClick={() => {
                        setDefaultReportFormat(rt.fields.map(f => ({ ...f, id: \`rf\${Date.now()}_\${f.id}\` })));
                        setShowReportSelector(false);
                      }}
                      className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition flex items-center justify-between group"
                    >
                      <div className="font-bold text-slate-700 group-hover:text-indigo-800">{rt.name}</div>
                      <div className="text-xs text-slate-400">{rt.fields.length} 項目</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button 
                onClick={() => {
                  setShowReportSelector(false);
                  setShowNewReportModal(true);
                }} 
                className="bg-indigo-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-indigo-700 transition flex items-center shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1" /> 新規追加
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewReportModal && (
        <ReportTemplateEditModal
          onClose={() => setShowNewReportModal(false)}
          onSave={(newTemplate) => {
            addReportTemplate(newTemplate);
            setShowNewReportModal(false);
            setShowReportSelector(true);
          }}
        />
      )}
`;

content = content.replace(/(?=\s*<\/div>\s*<\/div>\s*\)\;\s*\}\;)/, modals);
fs.writeFileSync(path, content, 'utf8');
