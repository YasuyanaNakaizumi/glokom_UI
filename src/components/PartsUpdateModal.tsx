import React, { useState, useMemo } from 'react';
import { X, Search, Save, Replace } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PartsUpdateModal = ({ onClose }: { onClose: () => void }) => {
  const { contracts, batchUpdatePart } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get unique parts across all contracts
  const uniqueParts = useMemo(() => {
    const partMap = new Map<string, { partName: string, contracts: string[] }>();
    contracts.forEach(c => {
      if (c.partsConfig) {
        Object.values(c.partsConfig).forEach(value => {
          const parts = value as { partNumber: string, partName: string }[];
          parts.forEach(p => {
            if (!partMap.has(p.partNumber)) {
              partMap.set(p.partNumber, { partName: p.partName, contracts: [c.title] });
            } else {
              const existing = partMap.get(p.partNumber)!;
              if (!existing.contracts.includes(c.title)) {
                existing.contracts.push(c.title);
              }
            }
          });
        });
      }
    });
    return Array.from(partMap.entries()).map(([partNumber, data]) => ({
      partNumber,
      partName: data.partName,
      contracts: data.contracts
    }));
  }, [contracts]);

  const filteredParts = uniqueParts.filter(p => 
    p.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.partName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const handleUpdate = (oldNumber: string) => {
    const newNumber = editValues[oldNumber];
    if (!newNumber || newNumber === oldNumber) return;
    
    if (window.confirm(`品番 「${oldNumber}」を「${newNumber}」に更新済みのすべての契約部品を含めて更新しますか？`)) {
      batchUpdatePart(oldNumber, newNumber);
      alert('部品品番を更新しました');
      // Clear edit value
      setEditValues(prev => {
        const next = {...prev};
        delete next[oldNumber];
        return next;
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-slate-50 rounded-t-xl shrink-0">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <Replace className="w-5 h-5 mr-2 text-indigo-600" />
            部品品番更新
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 border-b border-slate-200 bg-white shrink-0">
           <div className="relative max-w-sm">
             <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
             <input 
               type="text" 
               className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
               placeholder="品番または部品名で検索"
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-0 bg-slate-50">
          <table className="w-full text-sm text-left">
             <thead className="bg-slate-100 text-slate-600 sticky top-0 shadow-sm z-10">
               <tr>
                 <th className="px-4 py-3 font-semibold w-1/4">現在の品番</th>
                 <th className="px-4 py-3 font-semibold w-1/4">部品名</th>
                 <th className="px-4 py-3 font-semibold w-1/4">使用されている契約</th>
                 <th className="px-4 py-3 font-semibold w-1/4 text-center">新しい品番</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-200 bg-white">
               {filteredParts.map(p => (
                 <tr key={p.partNumber} className="hover:bg-slate-50">
                   <td className="px-4 py-3 font-mono text-slate-800 font-bold">{p.partNumber}</td>
                   <td className="px-4 py-3 text-slate-700">{p.partName}</td>
                   <td className="px-4 py-3 text-xs text-slate-500">
                     <div className="flex flex-wrap gap-1">
                       {p.contracts.map(c => <span key={c} className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">{c}</span>)}
                     </div>
                   </td>
                   <td className="px-4 py-2 text-right">
                     <div className="flex items-center space-x-2">
                       <input 
                         type="text" 
                         className="flex-1 border rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition"
                         placeholder={p.partNumber}
                         value={editValues[p.partNumber] || ''}
                         onChange={e => setEditValues({...editValues, [p.partNumber]: e.target.value})}
                       />
                       <button 
                         onClick={() => handleUpdate(p.partNumber)}
                         disabled={!editValues[p.partNumber] || editValues[p.partNumber] === p.partNumber}
                         className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition whitespace-nowrap shadow-sm"
                       >
                         更新
                       </button>
                     </div>
                   </td>
                 </tr>
               ))}
               {filteredParts.length === 0 && (
                 <tr>
                   <td colSpan={4} className="px-4 py-12 text-center text-slate-500 font-medium">該当する部品がありません。</td>
                 </tr>
               )}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
