import React, { useState } from 'react';
import { X, Plus, Trash2, Upload, FileText, Copy, Save, CheckSquare, Calendar, AlertTriangle } from 'lucide-react';
import { ContractTemplate, ContractPart, ContractFile, ReportField } from '../types';
import { useApp } from '../context/AppContext';
import { ContractTimelineEditor } from './ContractTimelineEditor';

export const ContractEditModal = ({ 
  contract, 
  onClose,
  onSave
}: { 
  contract?: ContractTemplate;
  onClose: () => void;
  onSave: (c: Omit<ContractTemplate, 'id'> | ContractTemplate) => void;
}) => {
  const { contracts, vehicleMasters } = useApp();
  
  const [title, setTitle] = useState(contract?.title || '');
  const [description, setDescription] = useState(contract?.description || '');
  
  // Legacy
  const [rule, setRule] = useState<ContractTemplate['rule']>(contract?.rule || 'none');
  const [months, setMonths] = useState<number | ''>(contract?.months || '');
  const [smr, setSmr] = useState<number | ''>(contract?.smr || '');

  // New Contract Period
  const defaultCPRule = contract?.contractPeriodRule;
  const initialCPRule = (defaultCPRule === 'months' || defaultCPRule === 'years') ? 'period' : (defaultCPRule || 'none');
  const initialCPUnit = (defaultCPRule === 'years') ? 'years' : (contract?.contractPeriodUnit || 'months');
  
  const [contractPeriodRule, setContractPeriodRule] = useState<any>(initialCPRule);
  const [contractPeriodUnit, setContractPeriodUnit] = useState<'months'|'years'>(initialCPUnit);
  const [contractPeriodValue, setContractPeriodValue] = useState<number>(contract?.contractPeriodValue || 24);
  const [contractPeriodSmr, setContractPeriodSmr] = useState<number>(contract?.contractPeriodSmr || 2000);

  // New Maintenance Period
  const defaultMPRule = contract?.maintenancePeriodRule;
  const initialMPRule = (defaultMPRule === 'months' || defaultMPRule === 'years') ? 'period' : (defaultMPRule || 'none');
  const initialMPUnit = (defaultMPRule === 'years') ? 'years' : (contract?.maintenancePeriodUnit || 'months');

  const [hasMaintenance, setHasMaintenance] = useState<boolean>(defaultMPRule ? defaultMPRule !== 'none' : false);
  const [maintenancePeriodRule, setMaintenancePeriodRule] = useState<any>(initialMPRule);
  const [maintenancePeriodUnit, setMaintenancePeriodUnit] = useState<'months'|'years'>(initialMPUnit);
  const [maintenancePeriodValue, setMaintenancePeriodValue] = useState<number>(contract?.maintenancePeriodValue || 1);
  const [maintenancePeriodSmr, setMaintenancePeriodSmr] = useState<number>(contract?.maintenancePeriodSmr || 500);
  const [maintenancePeriodCount, setMaintenancePeriodCount] = useState<number>(contract?.maintenancePeriodCount || 1);

  // Schedules and Alerts
  const [periodSchedules, setPeriodSchedules] = useState<number[]>(contract?.periodSchedules || []);
  const [smrSchedules, setSmrSchedules] = useState<number[]>(contract?.smrSchedules || []);
  
  const [alertTimingPeriodValue, setAlertTimingPeriodValue] = useState<number>(contract?.alertTimingPeriodValue ?? contract?.alertTimingValue ?? 10);
  const [alertTimingSmrValue, setAlertTimingSmrValue] = useState<number>(contract?.alertTimingSmrValue ?? 50);

  const [files, setFiles] = useState<ContractFile[]>(contract?.files || []);
  const [partsConfig, setPartsConfig] = useState<Record<string, ContractPart[]>>(contract?.partsConfig || {});
  const [reportFormatConfig, setReportFormatConfig] = useState<Record<string, ReportField[]>>(contract?.reportFormatConfig || {});
  
  const [defaultParts, setDefaultParts] = useState<ContractPart[]>(contract?.defaultParts || []);
  const [defaultReportFormat, setDefaultReportFormat] = useState<ReportField[]>(contract?.defaultReportFormat || []);

  const [selectedModel, setSelectedModel] = useState<string>('');

  const [enableAdvanced, setEnableAdvanced] = useState(
    Boolean(contract && (
      contract.rule !== 'none' || 
      Object.keys(contract.partsConfig || {}).length > 0 || 
      Object.keys(contract.reportFormatConfig || {}).length > 0 ||
      (contract.defaultParts && contract.defaultParts.length > 0) ||
      (contract.defaultReportFormat && contract.defaultReportFormat.length > 0)
    ))
  );
  
  const [copyPromptState, setCopyPromptState] = useState<{
    isOpen: boolean;
    targetModel: string;
    existingModels: string[];
  }>({ isOpen: false, targetModel: '', existingModels: [] });

  // Handlers for Files
  const handleAddFile = () => {
    const fn = prompt('アップロードするファイル名（※デモ用）');
    if (fn) {
      setFiles([...files, { id: `f${Date.now()}`, name: fn }]);
    }
  };
  const handleRemoveFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };
  
  // Handlers for Models & Checklists/Parts
  const handleAddModel = () => {
    if(!selectedModel || partsConfig[selectedModel] || reportFormatConfig[selectedModel]) return;
    
    const existingModelsSet = new Set([...Object.keys(partsConfig), ...Object.keys(reportFormatConfig)]);
    const existingModels = Array.from(existingModelsSet);
    
    if (existingModels.length > 0) {
      setCopyPromptState({
        isOpen: true,
        targetModel: selectedModel,
        existingModels
      });
    } else {
      setPartsConfig({...partsConfig, [selectedModel]: []});
      setReportFormatConfig({...reportFormatConfig, [selectedModel]: []});
      setSelectedModel('');
    }
  };

  const executeAddWithCopy = (sourceModel: string | null) => {
    const target = copyPromptState.targetModel;
    let partsToCopy: ContractPart[] = [];
    let reportFormatToCopy: ReportField[] = [];

    if (sourceModel) {
       partsToCopy = partsConfig[sourceModel] ? JSON.parse(JSON.stringify(partsConfig[sourceModel])) : [];
       reportFormatToCopy = reportFormatConfig[sourceModel] ? JSON.parse(JSON.stringify(reportFormatConfig[sourceModel])) : [];
    }

    setPartsConfig({...partsConfig, [target]: partsToCopy});
    setReportFormatConfig({...reportFormatConfig, [target]: reportFormatToCopy});
    setSelectedModel('');
    setCopyPromptState({ isOpen: false, targetModel: '', existingModels: [] });
  };

  const handleAddPart = (model: string) => {
    const list = partsConfig[model] || [];
    setPartsConfig({
      ...partsConfig,
      [model]: [...list, { partNumber: '', partName: '', quantity: 1 }]
    });
  };
  const handleUpdatePart = (model: string, index: number, field: keyof ContractPart, value: string | number) => {
    const list = [...(partsConfig[model] || [])];
    list[index] = { ...list[index], [field]: value };
    setPartsConfig({ ...partsConfig, [model]: list });
  };
  const handleRemovePart = (model: string, index: number) => {
    const list = [...(partsConfig[model] || [])];
    list.splice(index, 1);
    setPartsConfig({ ...partsConfig, [model]: list });
  };
  
  const handleCopyFromOtherContract = () => {
    const cid = prompt('コピー元の契約IDを入力するか、契約名を入力してください（完全一致）\n利用可能な契約: ' + contracts.map(c => c.title).join(', '));
    if (!cid) return;
    const target = contracts.find(c => c.id === cid || c.title === cid);
    if (target && (target.partsConfig || target.reportFormatConfig || target.defaultParts || target.defaultReportFormat)) {
      if(window.confirm('既存のタスク・部品設定を上書きしてコピーしますか？')) {
        setPartsConfig(target.partsConfig || {});
        setReportFormatConfig(target.reportFormatConfig || {});
        setDefaultParts(target.defaultParts || []);
        setDefaultReportFormat(target.defaultReportFormat || []);
      }
    } else {
      alert('指定された契約が見つからないか、設定がありません。');
    }
  };

  const handleSave = () => {
    if (!title) return alert('契約名を入力してください。');
    onSave({
      ...(contract ? { id: contract.id } : {}),
      title,
      description,
      // Legacy
      rule: enableAdvanced ? rule : 'none',
      months: (enableAdvanced && months) ? Number(months) : undefined,
      smr: (enableAdvanced && smr) ? Number(smr) : undefined,
      // New
      contractPeriodRule: enableAdvanced ? contractPeriodRule : 'none',
      contractPeriodValue,
      contractPeriodUnit: enableAdvanced ? contractPeriodUnit : undefined,
      contractPeriodSmr,
      maintenancePeriodRule: (enableAdvanced && hasMaintenance) ? maintenancePeriodRule : 'none',
      maintenancePeriodValue,
      maintenancePeriodUnit: (enableAdvanced && hasMaintenance) ? maintenancePeriodUnit : undefined,
      maintenancePeriodSmr,
      maintenancePeriodCount,
      periodSchedules: (enableAdvanced && hasMaintenance) ? periodSchedules : [],
      smrSchedules: (enableAdvanced && hasMaintenance) ? smrSchedules : [],
      alertTimingPeriodValue: (enableAdvanced && hasMaintenance) ? alertTimingPeriodValue : 10,
      alertTimingSmrValue: (enableAdvanced && hasMaintenance) ? alertTimingSmrValue : 50,
      
      files,
      partsConfig: enableAdvanced ? partsConfig : undefined,
      reportFormatConfig: enableAdvanced ? reportFormatConfig : undefined,
      defaultParts: enableAdvanced ? defaultParts : [],
      defaultReportFormat: enableAdvanced ? defaultReportFormat : [],
    } as any);
    onClose();
  };

  // Ensure every model exists in our keys array
  const allModels = Array.from(new Set([...Object.keys(partsConfig), ...Object.keys(reportFormatConfig)]));

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex justify-center items-center p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-slate-50 shrink-0">
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-indigo-600" />
            {contract ? '契約テンプレート編集' : '契約テンプレート新規作成'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 min-h-0">
          <section className="space-y-4">
             <h3 className="text-lg font-bold text-slate-700 border-b pb-2">基本情報</h3>
             <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1">契約名 <span className="text-red-500">*</span></label>
                 <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" value={title} onChange={e => setTitle(e.target.value)} />
               </div>
               <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1">説明</label>
                 <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500" value={description} onChange={e => setDescription(e.target.value)} />
               </div>
             </div>
          </section>

          <section className="space-y-4">
             <div className="flex justify-between items-end border-b pb-2">
               <h3 className="text-lg font-bold text-slate-700">雛形ファイル</h3>
               <button onClick={handleAddFile} className="text-sm px-3 py-1.5 bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center font-bold text-slate-700 transition">
                 <Upload className="w-4 h-4 mr-1" /> ファイル追加
               </button>
             </div>
             {files.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                 {files.map(f => (
                   <div key={f.id} className="flex items-center justify-between border border-slate-200 bg-white px-3 py-2 rounded-lg">
                     <span className="text-sm font-medium text-slate-700 truncate mr-2" title={f.name}>{f.name}</span>
                     <button onClick={() => handleRemoveFile(f.id)} className="text-slate-400 hover:text-red-500 transition"><X className="w-4 h-4"/></button>
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-sm text-slate-400">ファイルはアップロードされていません。</p>
             )}
          </section>

          <div className="pt-4 border-t">
            <label className="flex items-start sm:items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={enableAdvanced} 
                onChange={(e) => setEnableAdvanced(e.target.checked)} 
                className="mt-1 sm:mt-0 rounded text-indigo-600 focus:ring-indigo-500 w-5 h-5 border-slate-300 shrink-0" 
              />
              <span className="font-bold text-slate-800 text-base sm:text-lg leading-snug">詳細設定（契約期間条件・機種ごとのタスク等の登録）を有効にする</span>
            </label>
            {!enableAdvanced && (
               <p className="text-sm text-slate-500 mt-2 ml-7">有効にすると、特定の期間やSMRに基づくタスク生成、機種ごとのチェックシートや必要部品を設定できます。</p>
            )}
          </div>

          {enableAdvanced && (
            <>
              <div className="border border-slate-200 rounded-xl overflow-hidden mb-6 bg-white shadow-sm">
                <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-bold text-slate-800">契約期間・定期スケジュールの設定</h3>
                  </div>
                </div>
                
                <div className="p-5 space-y-6">
                  {/* 総契約期間 */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="sm:w-36 font-bold text-slate-700 text-sm">総契約期間</div>
                    <div className="flex flex-wrap gap-3 items-center flex-1">
                      <select className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 bg-slate-50 min-w-[200px]" value={contractPeriodRule} onChange={(e: any) => setContractPeriodRule(e.target.value)}>
                        <option value="none">設定なし</option>
                        <option value="period">期間ベース</option>
                        <option value="smr">稼働時間(SMR)ベース</option>
                        <option value="whichever_first">期間・SMRのいずれか早い方</option>
                      </select>

                      {(contractPeriodRule === 'period' || contractPeriodRule === 'whichever_first') && (
                        <div className="flex items-center shadow-sm rounded-lg">
                          <input type="number" className="border rounded-l-lg px-3 py-2 text-sm w-24 focus:ring-2 focus:ring-indigo-500 z-10" value={contractPeriodValue} onChange={e => setContractPeriodValue(Number(e.target.value))} placeholder={contractPeriodUnit === 'years' ? "例: 2" : "例: 12"} />
                          <select className="border-y border-r rounded-r-lg px-3 py-2 text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500 hover:bg-slate-100 transition-colors" value={contractPeriodUnit} onChange={e => setContractPeriodUnit(e.target.value as any)}>
                            <option value="months">ヶ月</option>
                            <option value="years">年</option>
                          </select>
                        </div>
                      )}
                      {(contractPeriodRule === 'smr' || contractPeriodRule === 'whichever_first') && (
                        <div className="flex items-center shadow-sm rounded-lg">
                          <input type="number" className="border rounded-l-lg px-3 py-2 text-sm w-32 focus:ring-2 focus:ring-indigo-500 z-10" value={contractPeriodSmr} onChange={e => setContractPeriodSmr(Number(e.target.value))} placeholder="例: 2000" />
                          <div className="px-3 py-2 bg-slate-50 border-y border-r rounded-r-lg text-sm text-slate-600 font-medium whitespace-nowrap">SMR</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* 定期作業 */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="sm:w-36 pt-2">
                      <label className="flex items-center space-x-2 cursor-pointer group w-max">
                        <input type="checkbox" className="w-4 h-4 text-indigo-600 rounded border-slate-300 cursor-pointer focus:ring-indigo-500" checked={hasMaintenance} onChange={e => setHasMaintenance(e.target.checked)} />
                        <span className="font-bold text-slate-700 text-sm group-hover:text-indigo-600 transition-colors">定期作業を設定する</span>
                      </label>
                    </div>

                    {hasMaintenance && (
                      <div className="flex-1 space-y-5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex flex-wrap gap-3 items-center">
                          <div className="text-sm font-medium text-slate-500 mr-2">作業サイクル</div>
                          <select className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 bg-white min-w-[180px]" value={maintenancePeriodRule} onChange={(e: any) => setMaintenancePeriodRule(e.target.value)}>
                            <option value="none">設定なし</option>
                            <option value="period">期間ベース</option>
                            <option value="smr">稼働時間(SMR)ベース</option>
                            <option value="whichever_first">期間・SMRのいずれか早い方</option>
                            <option value="count">回数指定（期間内にN回）</option>
                          </select>

                          {(maintenancePeriodRule === 'period' || maintenancePeriodRule === 'whichever_first') && (
                            <div className="flex items-center shadow-sm rounded-lg">
                              <input type="number" className="border rounded-l-lg px-3 py-2 text-sm w-24 focus:ring-2 focus:ring-indigo-500 z-10 bg-white" value={maintenancePeriodValue} onChange={e => setMaintenancePeriodValue(Number(e.target.value))} placeholder={maintenancePeriodUnit === 'years' ? "例: 1" : "例: 6"} min={1} />
                              <select className="border-y border-r rounded-r-lg px-3 py-2 text-sm bg-slate-100 focus:ring-2 focus:ring-indigo-500 hover:bg-slate-200 transition-colors" value={maintenancePeriodUnit} onChange={e => setMaintenancePeriodUnit(e.target.value as any)}>
                                <option value="months">ヶ月</option>
                                <option value="years">年</option>
                              </select>
                            </div>
                          )}
                          {(maintenancePeriodRule === 'smr' || maintenancePeriodRule === 'whichever_first') && (
                            <div className="flex items-center shadow-sm rounded-lg">
                              <input type="number" className="border rounded-l-lg px-3 py-2 text-sm w-28 focus:ring-2 focus:ring-indigo-500 z-10 bg-white" value={maintenancePeriodSmr} onChange={e => setMaintenancePeriodSmr(Number(e.target.value))} placeholder="例: 500" min={1} />
                              <div className="px-3 py-2 bg-slate-100 border-y border-r rounded-r-lg text-sm text-slate-600 font-medium whitespace-nowrap">SMR</div>
                            </div>
                          )}
                          {maintenancePeriodRule === 'count' && (
                            <div className="flex items-center shadow-sm rounded-lg">
                              <input type="number" className="border rounded-l-lg px-3 py-2 text-sm w-24 focus:ring-2 focus:ring-indigo-500 z-10 bg-white" value={maintenancePeriodCount} onChange={e => setMaintenancePeriodCount(Number(e.target.value))} placeholder="例: 3" min={1} />
                              <div className="px-3 py-2 bg-slate-100 border-y border-r rounded-r-lg text-sm text-slate-600 font-medium whitespace-nowrap">回</div>
                            </div>
                          )}
                        </div>

                        <div className="bg-white p-5 border border-slate-200 rounded-lg shadow-sm">
                          <div className="flex justify-between items-end mb-4">
                            <div className="text-sm font-bold text-slate-700">スケジュールのプレビュー</div>
                            {maintenancePeriodRule === 'count' ? (
                              <div className="text-[11px] text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full font-medium">ポイントをドラッグして微調整できます</div>
                            ) : (
                              <div className="text-[11px] text-slate-500">※回数指定時のみポイントをドラッグで調整可能です</div>
                            )}
                          </div>
                          
                          <ContractTimelineEditor 
                            contractRule={contractPeriodRule}
                            contractValue={contractPeriodValue}
                            contractUnit={contractPeriodUnit}
                            contractSmr={contractPeriodSmr}
                            maintenanceRule={maintenancePeriodRule}
                            maintenanceValue={maintenancePeriodValue}
                            maintenanceUnit={maintenancePeriodUnit}
                            maintenanceSmr={maintenancePeriodSmr}
                            maintenanceCount={maintenancePeriodCount}
                            periodSchedules={periodSchedules}
                            setPeriodSchedules={setPeriodSchedules}
                            smrSchedules={smrSchedules}
                            setSmrSchedules={setSmrSchedules}
                          />

                          <div className="mt-6 flex flex-col space-y-3 bg-amber-50/50 p-4 rounded-lg border border-amber-100/50">
                            <div className="flex items-center">
                              <AlertTriangle className="w-4 h-4 text-amber-500 mr-1.5" />
                              <span className="font-bold text-slate-700 text-sm">アラート通知設定</span>
                            </div>
                            
                            <div className="pl-5 space-y-3">
                              {/* 期間ベースのアラート */}
                              {(contractPeriodRule === 'period' || contractPeriodRule === 'whichever_first' || maintenancePeriodRule === 'period' || maintenancePeriodRule === 'whichever_first' || maintenancePeriodRule === 'count') && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-slate-600 w-20">予定日の</span>
                                  <input 
                                    type="number" 
                                    className="border border-slate-300 rounded-md px-3 py-1.5 w-20 text-center focus:ring-2 focus:ring-indigo-500 bg-white" 
                                    value={alertTimingPeriodValue} 
                                    onChange={e => setAlertTimingPeriodValue(Number(e.target.value))} 
                                    min={1}
                                  />
                                  <span className="text-slate-600">日前に通知</span>
                                </div>
                              )}
                              
                              {/* SMRベースのアラート */}
                              {(contractPeriodRule === 'smr' || contractPeriodRule === 'whichever_first' || maintenancePeriodRule === 'smr' || maintenancePeriodRule === 'whichever_first') && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-slate-600 w-20">予定SMRの</span>
                                  <input 
                                    type="number" 
                                    className="border border-slate-300 rounded-md px-3 py-1.5 w-20 text-center focus:ring-2 focus:ring-indigo-500 bg-white" 
                                    value={alertTimingSmrValue} 
                                    onChange={e => setAlertTimingSmrValue(Number(e.target.value))} 
                                    min={1}
                                  />
                                  <span className="text-slate-600">時間(SMR)前に通知</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <section className="space-y-4">
                 <div className="flex justify-between items-end border-b pb-2">
                   <h3 className="text-lg font-bold text-slate-700">機種ごとのタスク、チェックシート、部品</h3>
                   <button onClick={handleCopyFromOtherContract} className="text-sm px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded hover:bg-indigo-100 flex items-center font-bold transition">
                     <Copy className="w-4 h-4 mr-1" /> 他契約の設定をコピー
                   </button>
                 </div>
                 <div className="bg-slate-50 p-4 border rounded-lg">
                   <div className="flex items-center space-x-2 mb-4">
                     <select className="border rounded px-3 py-2 text-sm bg-white" value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
                       <option value="">-- 機種を選択して追加 --</option>
                       {vehicleMasters.map(m => <option key={m.id} value={m.modelName}>{m.modelName}</option>)}
                       <option value="COMMON">全機種共通 (COMMON)</option>
                     </select>
                     <button 
                       onClick={handleAddModel}
                       className="px-3 py-2 bg-slate-800 text-white text-sm rounded font-bold hover:bg-slate-700 disabled:opacity-50"
                       disabled={!selectedModel || allModels.includes(selectedModel)}
                     >追加</button>
                   </div>
                   
                   <div className="space-y-6">
                     <div className="bg-white border rounded shadow-sm overflow-hidden mb-6">
                       <div className="bg-indigo-50 px-4 py-3 border-b flex justify-between items-center">
                         <div className="font-bold text-indigo-800 flex items-center">
                            <CheckSquare className="w-4 h-4 mr-2" />
                            全機種共通・デフォルト設定
                         </div>
                       </div>
                       
                       <div className="p-3 border-b bg-slate-50/50">
                         <div className="text-sm font-bold text-slate-700 mb-2 flex items-center">
                           <FileText className="w-4 h-4 mr-1 text-slate-500" />
                           デフォルトの報告様式
                         </div>
                         <div className="space-y-2 max-w-2xl">
                           {defaultReportFormat.map((field, idx) => (
                             <div key={field.id} className="flex items-center space-x-2">
                               <div className="min-w-[20px] text-xs text-slate-400 font-mono">{idx + 1}.</div>
                               
                               <select 
                                 value={field.type}
                                 onChange={e => {
                                   const list = [...defaultReportFormat];
                                   list[idx] = { ...list[idx], type: e.target.value as any };
                                   setDefaultReportFormat(list);
                                 }}
                                 className="border border-slate-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 bg-white w-36"
                               >
                                  <option value="checkbox">チェックボックス</option>
                                  <option value="text">テキスト入力</option>
                                  <option value="image">画像登録</option>
                               </select>

                               <input 
                                 type="text" 
                                 value={field.label} 
                                 onChange={e => {
                                    const list = [...defaultReportFormat];
                                    list[idx] = { ...list[idx], label: e.target.value };
                                    setDefaultReportFormat(list);
                                 }}
                                 className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 bg-white"
                                 placeholder="項目名を入力"
                               />
                               <button onClick={() => {
                                    const list = [...defaultReportFormat];
                                    list.splice(idx, 1);
                                    setDefaultReportFormat(list);
                               }} className="text-slate-400 hover:text-red-500 p-1"><X className="w-4 h-4"/></button>
                             </div>
                           ))}
                           <button onClick={() => {
                               const list = [...defaultReportFormat];
                               list.push({ id: `f_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, type: 'checkbox', label: '' });
                               setDefaultReportFormat(list);
                           }} className="mt-2 ml-7 text-sm text-indigo-600 hover:text-indigo-800 font-bold flex items-center"><Plus className="w-3 h-3 mr-1"/> 項目を追加</button>
                         </div>
                       </div>

                       <div className="p-3">
                         <div className="text-sm font-bold text-slate-700 mb-2">デフォルトの必要部品</div>
                         <table className="w-full text-sm text-left">
                           <thead className="text-xs text-slate-500 border-b">
                             <tr><th className="pb-1 w-1/3">部品番号</th><th className="pb-1 w-1/3">部品名</th><th className="pb-1 w-1/6">数量</th><th className="pb-1 w-1/6"></th></tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                             {defaultParts.map((p, idx) => (
                               <tr key={idx}>
                                 <td className="py-2 pr-2"><input type="text" className="w-full border rounded px-2 py-1 text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500" value={p.partNumber} onChange={e => { const list = [...defaultParts]; list[idx].partNumber = e.target.value; setDefaultParts(list); }} placeholder="品番"/></td>
                                 <td className="py-2 pr-2"><input type="text" className="w-full border rounded px-2 py-1 text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500" value={p.partName} onChange={e => { const list = [...defaultParts]; list[idx].partName = e.target.value; setDefaultParts(list); }} placeholder="品名"/></td>
                                 <td className="py-2 pr-2"><input type="number" className="w-full border rounded px-2 py-1 text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500" value={p.quantity} onChange={e => { const list = [...defaultParts]; list[idx].quantity = Number(e.target.value); setDefaultParts(list); }} min={1} /></td>
                                 <td className="py-2 text-right">
                                   <button onClick={() => { const list = [...defaultParts]; list.splice(idx, 1); setDefaultParts(list); }} className="text-slate-400 hover:text-red-500 p-1"><X className="w-4 h-4"/></button>
                                 </td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                         <button onClick={() => {
                           const list = [...defaultParts];
                           list.push({ partNumber: '', partName: '', quantity: 1 });
                           setDefaultParts(list);
                         }} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-bold flex items-center"><Plus className="w-3 h-3 mr-1"/> 部品を追加</button>
                       </div>
                     </div>

                     {allModels.map((model) => (
                       <div key={model} className="bg-white border rounded shadow-sm overflow-hidden">
                         <div className="bg-slate-100 px-4 py-2 border-b flex justify-between items-center">
                           <div className="font-bold text-slate-800">
                              機種: {model} <span className="text-slate-500 text-sm font-normal ml-3">タスク名: {title || '(契約名未入力)'}</span>
                           </div>
                           <button onClick={() => {
                             const p = {...partsConfig}; delete p[model]; setPartsConfig(p);
                             const c = {...reportFormatConfig}; delete c[model]; setReportFormatConfig(c);
                           }} className="text-slate-400 hover:text-red-500 text-sm p-1 transition"><Trash2 className="w-4 h-4"/></button>
                         </div>
                         
                         <div className="p-3 border-b bg-slate-50/50">
                           <div className="text-sm font-bold text-slate-700 mb-2 flex items-center">
                             <CheckSquare className="w-4 h-4 mr-1 text-slate-500" />
                             報告様式
                           </div>
                           <div className="space-y-2 max-w-2xl">
                             {(reportFormatConfig[model] || []).map((field, idx) => (
                               <div key={field.id} className="flex items-center space-x-2">
                                 <div className="min-w-[20px] text-xs text-slate-400 font-mono">{idx + 1}.</div>
                                 
                                 <select 
                                   value={field.type}
                                   onChange={e => {
                                     const list = [...(reportFormatConfig[model] || [])];
                                     list[idx] = { ...list[idx], type: e.target.value as any };
                                     setReportFormatConfig({...reportFormatConfig, [model]: list});
                                   }}
                                   className="border border-slate-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 bg-white w-36"
                                 >
                                    <option value="checkbox">チェックボックス</option>
                                    <option value="text">テキスト入力</option>
                                    <option value="image">画像登録</option>
                                 </select>

                                 <input 
                                   type="text" 
                                   value={field.label} 
                                   onChange={e => {
                                      const list = [...(reportFormatConfig[model] || [])];
                                      list[idx] = { ...list[idx], label: e.target.value };
                                      setReportFormatConfig({...reportFormatConfig, [model]: list});
                                   }}
                                   className="flex-1 border border-slate-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500 bg-white"
                                   placeholder="項目名を入力"
                                 />
                                 <button onClick={() => {
                                      const list = [...(reportFormatConfig[model] || [])];
                                      list.splice(idx, 1);
                                      setReportFormatConfig({...reportFormatConfig, [model]: list});
                                 }} className="text-slate-400 hover:text-red-500 p-1"><X className="w-4 h-4"/></button>
                               </div>
                             ))}
                             <button onClick={() => {
                                 const list = [...(reportFormatConfig[model] || [])];
                                 list.push({ id: `f_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, type: 'checkbox', label: '' });
                                 setReportFormatConfig({...reportFormatConfig, [model]: list});
                             }} className="mt-2 ml-7 text-sm text-indigo-600 hover:text-indigo-800 font-bold flex items-center"><Plus className="w-3 h-3 mr-1"/> 項目を追加</button>
                           </div>
                         </div>

                         <div className="p-3">
                           <div className="text-sm font-bold text-slate-700 mb-2">必要部品</div>
                           <table className="w-full text-sm text-left">
                             <thead className="text-xs text-slate-500 border-b">
                               <tr><th className="pb-1 w-1/3">部品番号</th><th className="pb-1 w-1/3">部品名</th><th className="pb-1 w-1/6">数量</th><th className="pb-1 w-1/6"></th></tr>
                             </thead>
                             <tbody className="divide-y divide-slate-100">
                               {(partsConfig[model] || []).map((p, idx) => (
                                 <tr key={idx}>
                                   <td className="py-2 pr-2"><input type="text" className="w-full border rounded px-2 py-1 text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500" value={p.partNumber} onChange={e => handleUpdatePart(model, idx, 'partNumber', e.target.value)} placeholder="品番"/></td>
                                   <td className="py-2 pr-2"><input type="text" className="w-full border rounded px-2 py-1 text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500" value={p.partName} onChange={e => handleUpdatePart(model, idx, 'partName', e.target.value)} placeholder="品名"/></td>
                                   <td className="py-2 pr-2"><input type="number" className="w-full border rounded px-2 py-1 text-sm bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500" value={p.quantity} onChange={e => handleUpdatePart(model, idx, 'quantity', Number(e.target.value))} min={1} /></td>
                                   <td className="py-2 text-right">
                                     <button onClick={() => handleRemovePart(model, idx)} className="text-slate-400 hover:text-red-500 p-1"><X className="w-4 h-4"/></button>
                                   </td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                           <button onClick={() => handleAddPart(model)} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 font-bold flex items-center"><Plus className="w-3 h-3 mr-1"/> 部品を追加</button>
                         </div>
                       </div>
                     ))}
                     {allModels.length === 0 && (
                       <p className="text-sm text-slate-500 text-center py-4 border-2 border-dashed rounded-lg">機種別のタスク・部品が設定されていません</p>
                     )}
                   </div>
                 </div>
              </section>
            </>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-slate-50 flex justify-end shrink-0 gap-3">
           <button onClick={onClose} className="px-5 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition">キャンセル</button>
           <button onClick={handleSave} className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition flex items-center shadow-md">
             <Save className="w-4 h-4 mr-2" /> 保存
           </button>
        </div>
      </div>
      
      {copyPromptState.isOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-900/50 backdrop-blur-sm flex flex-col justify-center items-center p-4">
           <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
              <h3 className="font-bold text-lg text-slate-800 mb-2">設定のコピー</h3>
              <p className="text-sm text-slate-600 mb-4">
                すでに設定済みの機種があります。これをコピーして新しく「{copyPromptState.targetModel}」を作成しますか？
              </p>
              
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                 {copyPromptState.existingModels.map(m => (
                   <button
                     key={m}
                     onClick={() => executeAddWithCopy(m)}
                     className="w-full text-left px-4 py-3 border rounded-lg hover:bg-slate-50 hover:border-indigo-300 hover:ring-1 hover:ring-indigo-300 transition font-medium text-slate-700 flex items-center justify-between group"
                   >
                     <span>{m} からコピー</span>
                     <Copy className="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
                   </button>
                 ))}
                 <button
                   onClick={() => executeAddWithCopy(null)}
                   className="w-full text-left px-4 py-3 border border-dashed rounded-lg hover:bg-slate-50 transition font-medium text-slate-700"
                 >
                   コピーせずに新規作成
                 </button>
              </div>
              
              <button
                onClick={() => setCopyPromptState({ isOpen: false, targetModel: '', existingModels: [] })}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition"
              >
                キャンセル
              </button>
           </div>
        </div>
      )}
    </div>
  );
};
