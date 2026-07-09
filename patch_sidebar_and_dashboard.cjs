const fs = require('fs');

// Patch VehicleListView
let vContent = fs.readFileSync('src/views/VehicleListView.tsx', 'utf8');
vContent = vContent.replace(
  'className={`w-full md:w-[320px] shrink-0 flex-col border-r border-slate-200 bg-slate-50/50 h-full ${selectedVehicleId ? \'hidden md:flex\' : \'flex\'}`}',
  'className={`w-full md:w-[260px] shrink-0 flex-col border-r border-slate-200 bg-slate-50/50 h-full ${selectedVehicleId ? \'hidden md:flex\' : \'flex\'}`}'
);
fs.writeFileSync('src/views/VehicleListView.tsx', vContent);

// Patch CustomerListView
let cContent = fs.readFileSync('src/views/CustomerListView.tsx', 'utf8');
cContent = cContent.replace(
  'className={`w-full md:w-[320px] shrink-0 flex-col border-r border-slate-200 bg-slate-50/50 h-full ${selectedCustomerId ? \'hidden md:flex\' : \'flex\'}`}',
  'className={`w-full md:w-[260px] shrink-0 flex-col border-r border-slate-200 bg-slate-50/50 h-full ${selectedCustomerId ? \'hidden md:flex\' : \'flex\'}`}'
);
fs.writeFileSync('src/views/CustomerListView.tsx', cContent);

// Patch SalesDashboardSection
let sContent = fs.readFileSync('src/components/SalesDashboardSection.tsx', 'utf8');

const oldSalesTarget = `                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">
                          売上目標 <span className="font-mono ml-2">{periodStr}</span>
                        </h4>
                      </div>
                    </div>`;

const newSalesTarget = `                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-bold text-slate-800 text-sm">売上目標</h4>
                      <span className="font-mono text-slate-500 text-sm">{periodStr}</span>
                    </div>`;

const oldVisitTarget = `                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-slate-800 text-sm">
                          訪問回数目標 <span className="font-mono ml-2">{periodStr}</span>
                        </h4>
                      </div>`;

const newVisitTarget = `                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-slate-800 text-sm">訪問回数目標</h4>
                        <span className="font-mono text-slate-500 text-sm">{periodStr}</span>
                      </div>`;

sContent = sContent.replace(oldSalesTarget, newSalesTarget);
sContent = sContent.replace(oldVisitTarget, newVisitTarget);

fs.writeFileSync('src/components/SalesDashboardSection.tsx', sContent);
