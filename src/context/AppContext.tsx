import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Vehicle, ServiceTask, Staff, ParkingArea, Tool, ContractTemplate, VehicleMaster, Language, ViewState, MechanicReportTemplate,
  SalesDailyReport, SalesLead, SalesQuote, PartStockItem, SalesPlan
} from '../types';
import {
  INITIAL_VEHICLES, INITIAL_TASKS, INITIAL_STAFF, INITIAL_PARKING, INITIAL_TOOLS, INITIAL_CONTRACTS, INITIAL_VEHICLE_MASTERS, INITIAL_REPORT_TEMPLATES,
  INITIAL_SALES_REPORTS, INITIAL_SALES_LEADS, INITIAL_SALES_QUOTES, INITIAL_SALES_PLANS, INITIAL_PART_STOCKS
} from '../lib/mock';
import { i18n } from '../lib/i18n';

interface AppContextType {
  alerts: import('../types').Alert[];
  updateAlert: (id: string, updates: Partial<import('../types').Alert>) => void;
  vehicles: Vehicle[];
  tasks: ServiceTask[];
  staff: Staff[];
  parking: ParkingArea[];
  tools: Tool[];
  contracts: ContractTemplate[];
  vehicleMasters: VehicleMaster[];
  reportTemplates: MechanicReportTemplate[];
  salesReports: SalesDailyReport[];
  salesPlans: SalesPlan[];
  salesLeads: SalesLead[];
  salesQuotes: SalesQuote[];
  partStocks: PartStockItem[];
  customers: import('../types').Customer[];
  lang: Language;
  view: ViewState;
  t: (key: keyof typeof i18n['ja']) => string;
  setLang: (l: Language) => void;
  setView: (v: ViewState) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  updateTask: (id: string, updates: Partial<ServiceTask>) => void;
  addTask: (task: Omit<ServiceTask, 'id' | 'progress'>) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => string;
  updateParking: (areas: ParkingArea[]) => void;
  addContract: (contract: Omit<ContractTemplate, 'id'>) => void;
  updateContract: (id: string, updates: Partial<ContractTemplate>) => void;
  deleteContract: (id: string) => void;
  batchUpdatePart: (oldNumber: string, newNumber: string) => void;
  deleteTask: (id: string) => void;
  deleteVehicle: (id: string) => void;
  addReportTemplate: (template: Omit<MechanicReportTemplate, 'id'>) => void;
  updateReportTemplate: (id: string, updates: Partial<MechanicReportTemplate>) => void;
  deleteReportTemplate: (id: string) => void;
  addSalesReport: (report: Omit<SalesDailyReport, 'id'>) => void;
  addSalesPlan: (plan: Omit<SalesPlan, 'id'>) => void;
  updateSalesPlan: (id: string, updates: Partial<SalesPlan>) => void;
  addSalesLead: (lead: Omit<SalesLead, 'id'>) => void;
  updateSalesLead: (id: string, updates: Partial<SalesLead>) => void;
  addSalesQuote: (quote: Omit<SalesQuote, 'id'>) => void;
  updateSalesQuote: (id: string, updates: Partial<SalesQuote>) => void;
  deleteSalesQuote: (id: string) => void;
  updatePartStocks: (updates: (Omit<PartStockItem, 'id' | 'history'> & { id?: string })[]) => void;
  setCustomers: (customers: import('../types').Customer[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);


const INITIAL_ALERTS: import('../types').Alert[] = [
  { id: 'a1', type: 'maintenance', vehicleId: 'v1', targetModelName: 'PC200-11', description: '500時間メンテナンス時期が近付いています（現在480時間）', isIgnored: false, title: 'PC200-11 500時間メンテ', date: new Date().toISOString() },
  { id: 'a2', type: 'maintenance', vehicleId: 'v3', targetModelName: 'HM300-5', description: '1000時間メンテナンス時期が近付いています（現在980時間）', isIgnored: false, title: 'HM300-5 1000時間メンテ', date: new Date().toISOString() },
  { id: 'a3', type: 'patrol', vehicleId: 'v1', targetModelName: 'PC200-11', description: '納車1ヶ月点検の時期です', isIgnored: false, title: 'PC200-11 1ヶ月点検', date: new Date().toISOString() },
  { id: 'a4', type: 'fc', vehicleId: 'v4', targetModelName: 'PC128US-11', description: '対象FC（油圧ホース交換）が未実施です', isIgnored: false, title: 'PC128US-11 FC未実施', date: new Date().toISOString() },
  { id: 'a5', type: 'inspection', vehicleId: 'v5', targetModelName: 'WA200-8', description: '特定自主検査の期限が1ヶ月以内に迫っています', isIgnored: false, title: 'WA200-8 自主検査', date: new Date().toISOString() },
  { id: 'a6', type: 'contract', vehicleId: 'v2', targetModelName: 'D37EX-24', description: '延長保証契約の更新期限が近づいています', isIgnored: false, title: 'D37EX-24 延長保証', date: new Date().toISOString() },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const updateAlert = (id: string, updates: Partial<import("../types").Alert>) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  const [lang, setLang] = useState<Language>('ja');
  const [view, setView] = useState<ViewState>('home');
  
  const useLocalStorage = <T,>(key: string, initialValue: T) => {
    const [state, setState] = useState<T>(() => {
      try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      } catch {
        return initialValue;
      }
    });

    useEffect(() => {
      window.localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState] as const;
  };

  const [vehicles, setVehicles] = useLocalStorage('kfleet_vehicles_v13', INITIAL_VEHICLES);
  const [tasks, setTasks] = useLocalStorage('kfleet_tasks_v13', INITIAL_TASKS);
  const [staff] = useLocalStorage('kfleet_staff_v4', INITIAL_STAFF);
  const [parking, setParking] = useLocalStorage('kfleet_parking_v4', INITIAL_PARKING);
  const [tools, setTools] = useLocalStorage('kfleet_tools_v4', INITIAL_TOOLS);
  const [contracts, setContracts] = useLocalStorage('kfleet_contracts_v4', INITIAL_CONTRACTS);
  const [vehicleMasters, setVehicleMasters] = useLocalStorage('kfleet_masters_v4', INITIAL_VEHICLE_MASTERS);
  const [reportTemplates, setReportTemplates] = useLocalStorage('kfleet_report_templates_v4', INITIAL_REPORT_TEMPLATES);
  const [salesReports, setSalesReports] = useLocalStorage('kfleet_sales_reports_v3', INITIAL_SALES_REPORTS);
  const [salesPlans, setSalesPlans] = useLocalStorage('kfleet_sales_plans_v3', INITIAL_SALES_PLANS);
  const [salesLeads, setSalesLeads] = useLocalStorage('kfleet_sales_leads_v3', INITIAL_SALES_LEADS);
  const [salesQuotes, setSalesQuotes] = useLocalStorage('kfleet_sales_quotes_v3', INITIAL_SALES_QUOTES);
  const [partStocks, setPartStocks] = useLocalStorage<PartStockItem[]>('kfleet_part_stocks_v2', INITIAL_PART_STOCKS);
  const [customers, setCustomers] = useLocalStorage<import('../types').Customer[]>('kfleet_customers_v1_1', [
    { id: 'c1', name: '山田建設', address: '東京都港区赤坂2-3-6', lat: 35.6725, lng: 139.7397, assignedStaffId: 's1', lastVisitDate: '2023-10-01' },
    { id: 'c2', name: 'ABC開発', address: '神奈川県川崎市川崎区駅前本町', lat: 35.5312, lng: 139.6974, assignedStaffId: 's1', lastVisitDate: new Date().toISOString() },
    { id: 'c3', name: '山田建機', address: '千葉県千葉市中央区', lat: 35.6073, lng: 140.1063, assignedStaffId: 's2', lastVisitDate: '2023-11-15' },
    { id: 'c4', name: '佐藤建設', address: '埼玉県さいたま市大宮区', lat: 35.9063, lng: 139.6238, assignedStaffId: 's2' },
    { id: 'c5', name: '高橋土木', address: '東京都新宿区西新宿2-8-1', lat: 35.6894, lng: 139.6917, assignedStaffId: 's1', lastVisitDate: '2023-12-01' }
  ]);

  const t = (key: keyof typeof i18n['ja']) => {
    return i18n[lang][key] || key;
  };

  const addSalesReport = (report: Omit<SalesDailyReport, 'id'>) => {
    setSalesReports([...salesReports, { ...report, id: `sr${Date.now()}` }]);
  };

  const addSalesPlan = (plan: Omit<SalesPlan, 'id'>) => {
    setSalesPlans([...salesPlans, { ...plan, id: `sp${Date.now()}` }]);
  };

  const updateSalesPlan = (id: string, updates: Partial<SalesPlan>) => {
    setSalesPlans(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const addSalesLead = (lead: Omit<SalesLead, 'id'>) => {
    setSalesLeads([...salesLeads, { ...lead, id: `sl${Date.now()}` }]);
  };

  const updateSalesLead = (id: string, updates: Partial<SalesLead>) => {
    setSalesLeads(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));
  };

  const addSalesQuote = (quote: Omit<SalesQuote, 'id'>) => {
    setSalesQuotes([...salesQuotes, { ...quote, id: `sq${Date.now()}` }]);
  };

  const deleteSalesQuote = (id: string) => {
    if (confirm("この案件を削除してもよろしいですか？")) {
      setSalesQuotes(prev => prev.filter(q => q.id !== id));
    }
  };

  const updateSalesQuote = (id: string, updates: Partial<SalesQuote>) => {
    setSalesQuotes(prev => prev.map(q => (q.id === id ? { ...q, ...updates } : q)));
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => (v.id === id ? { ...v, ...updates } : v)));
  };

  const updateTask = (id: string, updates: Partial<ServiceTask>) => {
    setTasks(prev => {
      const next = prev.map(t => (t.id === id ? { ...t, ...updates } : t));
      // Automatic state transition logic
      const targetTask = prev.find(t => t.id === id);
      if (targetTask && targetTask.category === '受け入れ点検' && updates.progress === '完了') {
        updateVehicle(targetTask.vehicleId, { status: '在庫' });
      }
      return next;
    });
  };

  const addTask = (taskProps: Omit<ServiceTask, 'id' | 'progress'>) => {
    const newTask: ServiceTask = {
      ...taskProps,
      id: `t${Date.now()}`,
      progress: '未着手'
    };
    setTasks([...tasks, newTask]);
  };

  const addVehicle = (vProps: Omit<Vehicle, 'id'>) => {
    const newId = `v${Date.now()}`;
    setVehicles([...vehicles, { ...vProps, id: newId }]);
    return newId;
  };

  const updateParking = (areas: ParkingArea[]) => {
    setParking(areas);
  };

  const addContract = (contractProps: Omit<ContractTemplate, 'id'>) => {
    setContracts([...contracts, { ...contractProps, id: `c${Date.now()}` }]);
  };

  const updateContract = (id: string, updates: Partial<ContractTemplate>) => {
    setContracts(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteContract = (id: string) => {
    setContracts(prev => prev.filter(c => c.id !== id));
  };

  const addReportTemplate = (template: Omit<MechanicReportTemplate, 'id'>) => {
    setReportTemplates([...reportTemplates, { ...template, id: `rt${Date.now()}` }]);
  };

  const updateReportTemplate = (id: string, updates: Partial<MechanicReportTemplate>) => {
    setReportTemplates(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteReportTemplate = (id: string) => {
    setReportTemplates(prev => prev.filter(t => t.id !== id));
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
    // Also delete associated tasks
    setTasks(prev => prev.filter(t => t.vehicleId !== id));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const batchUpdatePart = (oldNumber: string, newNumber: string) => {
    setContracts(prev => prev.map(c => {
      if (!c.partsConfig) return c;
      const newPartsConfig = { ...c.partsConfig };
      for (const model of Object.keys(newPartsConfig)) {
        newPartsConfig[model] = newPartsConfig[model].map(p => {
          if (p.partNumber === oldNumber) {
            return { ...p, partNumber: newNumber };
          }
          return p;
        });
      }
      return { ...c, partsConfig: newPartsConfig };
    }));
  };

  const updatePartStocks = (updates: (Omit<PartStockItem, 'id' | 'history'> & { id?: string })[]) => {
    setPartStocks(prev => {
      const next = [...prev];
      updates.forEach(u => {
        const existingIndex = next.findIndex(p => p.partNumber === u.partNumber);
        const dateStr = new Date().toISOString().split('T')[0];
        
        if (existingIndex >= 0 && !u.id) {
          // Confirm dialogue already done in component before calling this! 
          // So if it's existing we just increment
          const ex = next[existingIndex];
          next[existingIndex] = {
            ...ex,
            quantity: ex.quantity + u.quantity,
            lastPurchaseDate: dateStr,
            history: [
              ...(ex.history || []),
              { date: dateStr, quantity: u.quantity }
            ]
          };
        } else {
          // New part (or explicitly new with id to bypass merge)
          next.push({
            id: u.id || `p${Date.now()}_${Math.random()}`,
            partNumber: u.partNumber,
            partName: u.partName,
            quantity: u.quantity,
            lastPurchaseDate: dateStr,
            history: [{ date: dateStr, quantity: u.quantity }]
          });
        }
      });
      return next;
    });
  };

  return (
    <AppContext.Provider value={{
      vehicles, tasks, staff, parking, tools, contracts, vehicleMasters, reportTemplates,
      salesReports, salesPlans, salesLeads, salesQuotes, partStocks, customers,
      lang, view, t, setLang, setView, alerts, updateAlert, updateVehicle, updateTask, addTask, 
      addVehicle, deleteVehicle, deleteTask, updateParking, addContract, updateContract, deleteContract, batchUpdatePart,
      addReportTemplate, updateReportTemplate, deleteReportTemplate,
      addSalesReport, addSalesPlan, updateSalesPlan, addSalesLead, updateSalesLead, addSalesQuote, updateSalesQuote, deleteSalesQuote, updatePartStocks,
      setCustomers
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
