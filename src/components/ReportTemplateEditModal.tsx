import React, { useState } from 'react';
import { FileText, Plus, Trash2, Save, X, GripVertical } from 'lucide-react';
import { MechanicReportTemplate, ReportField } from '../types';
import { cn } from '../lib/utils';

interface ReportTemplateEditModalProps {
  template?: MechanicReportTemplate;
  onClose: () => void;
  onSave: (template: Omit<MechanicReportTemplate, 'id'> | MechanicReportTemplate) => void;
}

export function ReportTemplateEditModal({ template, onClose, onSave }: ReportTemplateEditModalProps) {
  const [name, setName] = useState(template?.name || '');
  const [fields, setFields] = useState<ReportField[]>(template?.fields || []);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAddField = (type: ReportField['type']) => {
    setFields([...fields, { 
      id: `f${Date.now()}`, 
      type, 
      label: type === 'checkbox' ? '確認項目' : type === 'text' ? '質問事項' : '写真撮影' 
    }]);
  };

  const updateFieldLabel = (index: number, label: string) => {
    setFields(fields.map((f, i) => i === index ? { ...f, label } : f));
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name) {
      alert('テンプレート名を入力してください');
      return;
    }
    if (fields.length === 0) {
      alert('項目を1つ以上追加してください');
      return;
    }
    
    if (template) {
      onSave({ ...template, name, fields });
    } else {
      onSave({ name, fields });
    }
    onClose();
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newFields = [...fields];
    const draggedField = newFields[draggedIndex];
    newFields.splice(draggedIndex, 1);
    newFields.splice(index, 0, draggedField);
    
    setDraggedIndex(index);
    setFields(newFields);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-slate-50 shrink-0">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-indigo-600" />
            {template ? '報告様式編集' : '報告様式新規作成'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">テンプレート名 <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              className="w-full border-slate-300 rounded-lg px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              placeholder="例: 新車巡回"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-bold text-slate-700">報告項目</label>
            </div>
            
            <div className="space-y-2 mb-4">
              {fields.map((f, i) => (
                <div 
                  key={f.id} 
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "flex items-center gap-3 bg-white border border-slate-200 p-3 rounded-lg shadow-sm group",
                    draggedIndex === i ? 'opacity-50 border-indigo-500' : ''
                  )}
                >
                  <div className="text-slate-400 cursor-move hover:text-indigo-500 transition">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                      {f.type === 'checkbox' ? 'チェックリスト' : f.type === 'text' ? 'テキスト入力' : '画像添付'}
                    </div>
                    <input 
                      type="text" 
                      value={f.label} 
                      onChange={e => updateFieldLabel(i, e.target.value)} 
                      className="w-full border-slate-300 rounded px-2 py-1 text-sm focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="項目名を入力..."
                    />
                  </div>
                  
                  <button onClick={() => removeField(i)} className="text-slate-400 hover:text-red-500 transition p-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {fields.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 text-sm">
                  項目がありません。「項目を追加」から追加してください。
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => handleAddField('checkbox')} 
                className="flex-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded font-bold text-sm flex items-center justify-center transition shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1" /> チェックリスト部品
              </button>
              <button 
                onClick={() => handleAddField('text')} 
                className="flex-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded font-bold text-sm flex items-center justify-center transition shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1" /> テキストボックス
              </button>
              <button 
                onClick={() => handleAddField('image')} 
                className="flex-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded font-bold text-sm flex items-center justify-center transition shadow-sm"
              >
                <Plus className="w-4 h-4 mr-1" /> 画像アップロード
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-slate-50 flex justify-end shrink-0 gap-3">
           <button onClick={onClose} className="px-5 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition shadow-sm">キャンセル</button>
           <button onClick={handleSave} className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition flex items-center shadow-md">
             <Save className="w-4 h-4 mr-2" /> 保存
           </button>
        </div>
      </div>
    </div>
  );
}
