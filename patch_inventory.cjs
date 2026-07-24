const fs = require('fs');
const path = './src/components/InventoryListSection.tsx';
let content = fs.readFileSync(path, 'utf8');

// add MapPin to lucide-react imports
content = content.replace(/import \{ Package, Plus, Save, X, History, Box, Car \} from "lucide-react";/, 'import { Package, Plus, Save, X, History, Box, Car, MapPin } from "lucide-react";');

// add state for location modal
content = content.replace(/const \[inputs, setInputs\] = useState<PartInputRow\[\]>\(\[/, 'const [locationModalItem, setLocationModalItem] = useState<PartStockItem | null>(null);\n  const [inputs, setInputs] = useState<PartInputRow[]>([');

// add header column
content = content.replace(/<th className="py-3 px-4">最終仕入日<\/th>/, '<th className="py-3 px-4">最終仕入日</th>\n                <th className="py-3 px-4 text-center">置き場</th>');

// add body column
const targetRowEnd = `                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>`;

const newRowEnd = `                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setLocationModalItem(p)}
                      className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="置き場を確認"
                    >
                      <MapPin className="w-5 h-5" />
                    </button>
                  </td>
                </tr>`;
content = content.replace(targetRowEnd, newRowEnd);

// add modal
const modalJSX = `
      {/* Location Modal */}
      {locationModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
                置き場確認
              </h3>
              <button
                onClick={() => setLocationModalItem(null)}
                className="text-slate-400 hover:text-slate-600 hover:bg-white rounded-full p-1 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="text-xs text-slate-500 font-bold mb-1">部品名</div>
                <div className="text-slate-800 font-medium">{locationModalItem.partName}</div>
              </div>
              <div className="mb-6">
                <div className="text-xs text-slate-500 font-bold mb-1">現在の置き場</div>
                <div className="text-lg font-bold text-indigo-700 bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex items-center justify-center">
                  {locationModalItem.locationId ? (
                    // 実際にはparking情報などから名前を引くか、ここでは単純に表示する
                    // モックとして「第1倉庫 棚A-3」等を表示
                    locationModalItem.locationId
                  ) : (
                    "未設定 (標準倉庫 棚A-1)"
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setLocationModalItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(/    <\/div>\n  \);\n\};/, modalJSX + '\n    </div>\n  );\n};');

fs.writeFileSync(path, content, 'utf8');
