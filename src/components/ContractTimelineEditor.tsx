import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ContractTimelineEditorProps {
  contractRule: string;
  contractValue: number;
  contractUnit?: 'months' | 'years';
  contractSmr: number;
  maintenanceRule: string;
  maintenanceValue: number;
  maintenanceUnit?: 'months' | 'years';
  maintenanceSmr: number;
  maintenanceCount?: number;
  periodSchedules: number[];
  setPeriodSchedules: (vals: number[]) => void;
  smrSchedules: number[];
  setSmrSchedules: (vals: number[]) => void;
}

export const ContractTimelineEditor: React.FC<ContractTimelineEditorProps> = ({
  contractRule, contractValue, contractUnit = 'months', contractSmr,
  maintenanceRule, maintenanceValue, maintenanceUnit = 'months', maintenanceSmr, maintenanceCount = 1,
  periodSchedules, setPeriodSchedules, smrSchedules, setSmrSchedules
}) => {
  const showPeriod = (contractRule === 'period' || contractRule === 'whichever_first') && (maintenanceRule === 'period' || maintenanceRule === 'whichever_first' || maintenanceRule === 'count');
  const showSmr = (contractRule === 'smr' || contractRule === 'whichever_first') && (maintenanceRule === 'smr' || maintenanceRule === 'whichever_first' || maintenanceRule === 'count');

  const generateLines = (total: number, interval: number) => {
    if (!total || !interval || interval <= 0) return [];
    const points = [];
    let current = interval;
    while(current <= total + 0.0001) {
      points.push(Math.round(current * 1000) / 1000);
      current += interval;
    }
    return points;
  };
  
  const generateCountLines = (total: number, count: number) => {
    if (!total || !count || count <= 0) return [];
    const interval = total / count;
    const points = [];
    for(let i=1; i<=count; i++) {
      points.push(Math.round(interval * i * 10) / 10);
    }
    return points;
  };

  useEffect(() => {
    if (showPeriod) {
      if (maintenanceRule === 'count') {
         setPeriodSchedules(generateCountLines(contractValue, maintenanceCount));
      } else {
        let interval = maintenanceValue;
        if (contractUnit === 'years' && maintenanceUnit === 'months') {
          interval = maintenanceValue / 12;
        } else if (contractUnit === 'months' && maintenanceUnit === 'years') {
          interval = maintenanceValue * 12;
        }
        setPeriodSchedules(generateLines(contractValue, interval));
      }
    } else {
      setPeriodSchedules([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractValue, contractUnit, maintenanceValue, maintenanceUnit, maintenanceRule, maintenanceCount, showPeriod]);

  useEffect(() => {
    if (showSmr) {
      if (maintenanceRule === 'count') {
         setSmrSchedules(generateCountLines(contractSmr, maintenanceCount));
      } else {
         setSmrSchedules(generateLines(contractSmr, maintenanceSmr));
      }
    } else {
      setSmrSchedules([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractSmr, maintenanceSmr, maintenanceRule, maintenanceCount, showSmr]);

  const TrackSlider = ({ values, max, label, onUpdate, isDraggable }: { values: number[], max: number, label: string, onUpdate: (newVals: number[]) => void, isDraggable: boolean }) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

    const handlePointerDown = (idx: number, e: React.PointerEvent) => {
      if (!isDraggable) return;
      setDraggingIdx(idx);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
      if (!isDraggable || draggingIdx === null || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      let percent = (e.clientX - rect.left) / rect.width;
      percent = Math.max(0, Math.min(1, percent));
      
      let newVal = percent * max;
      if (max <= 100) newVal = Math.round(newVal * 10) / 10;
      else newVal = Math.round(newVal);

      const updated = [...values];
      updated[draggingIdx] = newVal;
      onUpdate(updated);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
      setDraggingIdx(null);
    };

    const isDense = values.length > 15;

    return (
      <div className="font-sans px-2 pt-6 pb-2">
        <div 
          ref={trackRef} 
          className="relative h-8 w-full touch-none flex items-center group/track"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Main Track Background */}
          <div className="absolute left-0 right-0 h-2 bg-slate-100 rounded-full shadow-inner border border-slate-200/60"></div>
          
          {/* Active Track Progress */}
          <div 
            className="absolute left-0 h-2 bg-indigo-100 rounded-full" 
            style={{ width: values.length ? `${Math.max(0, Math.min(100, (values[values.length - 1] / max) * 100))}%` : '0%' }}
          ></div>
          
          {/* Draggable Thumbs / Ticks */}
          {values.map((v, i) => {
            const leftPerc = (v / max) * 100;
            return (
              <div 
                key={i}
                className={`absolute flex justify-center flex-col items-center top-1/2 -translate-y-1/2 w-6 h-10 -ml-3 group/thumb z-10 ${isDraggable ? 'cursor-ew-resize' : 'cursor-default'}`}
                style={{ left: `${Math.max(0, Math.min(100, leftPerc))}%` }}
                onPointerDown={(e) => handlePointerDown(i, e)}
              >
                {/* Visual Indicator (Circle or Tick based on density) */}
                <div 
                  className={`transition-all shadow-sm ${
                    isDense 
                      ? 'w-[3px] h-3.5 bg-indigo-400 rounded-full group-hover/thumb:h-5 group-hover/thumb:bg-indigo-600' 
                      : 'w-3.5 h-3.5 bg-white border-2 border-indigo-500 rounded-full group-hover/thumb:scale-125 group-hover/thumb:border-indigo-600'
                  } ${
                    draggingIdx === i 
                      ? (isDense ? 'h-6 bg-indigo-600 scale-110' : 'scale-150 border-indigo-600 ring-2 ring-indigo-100')
                      : ''
                  }`}
                ></div>
                
                {/* Hover Tooltip */}
                <div className={`absolute bottom-full mb-1 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded shadow-md pointer-events-none transition-all whitespace-nowrap ${
                  draggingIdx === i 
                    ? 'opacity-100 transform -translate-y-1 scale-110 bg-indigo-600 text-white z-20' 
                    : 'opacity-0 bg-slate-800 text-white group-hover/thumb:opacity-100 group-hover/thumb:-translate-y-0.5'
                }`}>
                  {v}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Scale Axis Labels */}
        <div className="flex justify-between text-[11px] text-slate-400 font-bold mt-1 px-1">
          <span>0 {label}</span>
          <span>{max} {label}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {showPeriod && (
        <TrackSlider 
          values={periodSchedules} 
          max={contractValue} 
          label={contractUnit === 'years' ? '年' : 'ヶ月'} 
          onUpdate={setPeriodSchedules} 
          isDraggable={maintenanceRule === 'count'}
        />
      )}
      
      {showPeriod && showSmr && <div className="h-px bg-slate-100 w-full my-2"></div>}
      
      {showSmr && (
        <TrackSlider 
          values={smrSchedules} 
          max={contractSmr} 
          label="SMR" 
          onUpdate={setSmrSchedules} 
          isDraggable={maintenanceRule === 'count'}
        />
      )}

      {!showPeriod && !showSmr && (
        <div className="text-sm text-slate-500 py-4 text-center">サイクルの組み合わせがないため、スケジュールは生成されません。</div>
      )}
    </div>
  );
};
