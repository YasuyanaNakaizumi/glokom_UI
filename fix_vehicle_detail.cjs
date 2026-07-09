const fs = require('fs');
const file = 'src/components/VehicleDetailPanels.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('const { tasks, parking } = useApp();')) {
  content = content.replace(
    'const { tasks } = useApp();',
    'const { tasks, parking } = useApp();'
  );
  content = content.replace(
    'import { Activity, ExternalLink, History, Wrench, Shield, FileText, Users, Bot, AlertTriangle } from \'lucide-react\';',
    'import { Activity, ExternalLink, History, Wrench, Shield, FileText, Users, Bot, AlertTriangle, MapPin } from \'lucide-react\';\nimport { cn } from \'../lib/utils\';'
  );
  
  const mapSection = `
      {/* 2. 在庫保管場所 (if applicable) */}
      {(vehicle.stockStatus === 'フリー在庫' || vehicle.stockStatus === '即納(引当済)') && vehicle.parkingAreaIds && vehicle.parkingAreaIds.length > 0 && (
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-4">
          <h4 className="font-bold text-slate-800 text-lg flex items-center">
            <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
            現在の保管場所
          </h4>
          <div className="h-[250px] w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] rounded-lg border border-slate-200 overflow-hidden relative">
            {parking.map(p => {
              const isSelected = vehicle.parkingAreaIds?.includes(p.id);
              if (!isSelected) return null; // Only show the parking area where it is, or show all and highlight? Let's show all and highlight.
            })}
            {parking.map(p => {
              const isSelected = vehicle.parkingAreaIds?.includes(p.id);
              return (
                <div
                  key={p.id}
                  className={cn(
                    "absolute rounded-lg border-2 flex flex-col items-center justify-center p-2 shadow-sm transition-all overflow-hidden",
                    isSelected ? "border-indigo-500 bg-indigo-50/90 shadow-md ring-2 ring-indigo-500/20 z-20" : "border-slate-300 bg-slate-50/50 opacity-50"
                  )}
                  style={{
                    left: p.x, top: p.y, width: p.width, height: p.height
                  }}
                >
                  <div className={cn("font-bold text-xs pointer-events-none text-center truncate w-full", isSelected ? "text-indigo-700" : "text-slate-500")}>
                    {p.name}
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1">
                      <MapPin className="w-4 h-4 text-indigo-500" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
`;

  // Insert before the Events Section (which is right after INFO section)
  // Let's replace:
  //      {/* 2. Events */}
  // with the map Section followed by Events Section.

  content = content.replace(
    '      {/* 2. Events */}',
    mapSection + '\n      {/* 3. Events */}'
  );

  fs.writeFileSync(file, content);
}
