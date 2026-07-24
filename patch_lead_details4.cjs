const fs = require('fs');
const path = './src/components/LeadDetailsModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// The end is:
/*
              <button onClick={handleSaveLeadState} className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-indigo-700 flex items-center shadow-md transition-all active:scale-95">
                <Check className="w-4 h-4 mr-2" /> 保存して閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  );
};
*/

const parts = content.split('保存して閉じる');
if (parts.length > 1) {
  content = parts[0] + '保存して閉じる\n              </button>\n            </div>\n          </>\n          )}\n        </div>\n      )}\n    </>\n  );\n};\n';
}

fs.writeFileSync(path, content, 'utf8');
