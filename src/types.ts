export type VehicleStatus = '受け入れ予定'|'出荷済'|'搬入済'|'点検中'|'点検完了'|'在庫'|'納入済';
export type ServiceCategory = '新車巡回'|'故障修理'|'定期点検'|'車検'|'受け入れ点検'|'フィールドキャンペーン'|'在庫点検'|'納入作業'|'その他予定';
export type Urgency = '緊急'|'1ヶ月以内'|'数ヶ月後';
export type TaskProgress = '未着手'|'進行中'|'承認待ち'|'完了';
export type StockStatus = '即納(引当済)'|'フリー在庫'|'納入済';

export interface Customer {
  id: string;
  name: string;
  address: string; // 住所は必須
  lat?: number;
  lng?: number;
  assignedStaffId?: string; // 担当営業
  lastVisitDate?: string; // 最近訪問していない判定用
}

export interface VehicleMaster {
  id: string;
  modelName: string;
  maker?: string;
  type?: string;
}

export interface ParkingArea {
  id: string;
  name: string;
  capacity: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ContractPart {
  partNumber: string;
  partName: string;
  quantity: number;
}

export interface ReportField {
  id: string; // unique ID
  type: 'checkbox' | 'text' | 'image';
  label: string;
}

export interface MechanicReportTemplate {
  id: string;
  name: string;
  fields: ReportField[];
}

export interface ContractFile {
  id: string;
  name: string;
}

export interface ContractTemplate {
  id: string;
  title: string;
  description: string;
  rule: 'months' | 'smr' | 'whichever_first' | 'custom' | 'none'; // legacy/optional
  months?: number; // legacy
  smr?: number; // legacy
  
  // New section 1: Contract Period
  contractPeriodRule?: 'months' | 'years' | 'period' | 'smr' | 'whichever_first' | 'none';
  contractPeriodValue?: number;
  contractPeriodUnit?: 'months' | 'years';
  contractPeriodSmr?: number;
  
  // New section 2: Maintenance Work Period
  maintenancePeriodRule?: 'months' | 'years' | 'period' | 'smr' | 'whichever_first' | 'count' | 'none';
  maintenancePeriodValue?: number;
  maintenancePeriodUnit?: 'months' | 'years';
  maintenancePeriodSmr?: number;
  maintenancePeriodCount?: number;
  
  // Scheduled Maintenance points
  periodSchedules?: number[]; // Values of periods
  smrSchedules?: number[]; // Values of SMR

  // Alert timings
  alertTimingValue?: number; // legacy
  alertTimingUnit?: 'days' | 'hours'; // legacy
  alertTimingPeriodValue?: number;
  alertTimingSmrValue?: number;
  
  customText?: string;
  files?: ContractFile[]; // Multiple files supported
  partsConfig?: Record<string, ContractPart[]>; // Key is modelName
  defaultParts?: ContractPart[];
  reportFormatConfig?: Record<string, ReportField[]>; // Key is modelName
  defaultReportFormat?: ReportField[];
}

export interface VehicleContract {
  contractId: string;
  startDate: string; // ISO
  startSmr: number;
  endDate?: string;
  status?: 'active' | 'expired';
}

export interface Vehicle {
  id: string;
  modelName: string;
  serialNumber: string;
  status: VehicleStatus;
  stockStatus: StockStatus;
  shipDate?: string;
  arrivalDate?: string;
  deliveryDate?: string;
  parkingAreaIds?: string[];
  customerName?: string;
  currentSmr?: number;
  maintenanceSchedules?: { name: string; targetSmr: number }[];
  contracts?: VehicleContract[];
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface Tool {
  id: string;
  name: string;
  description?: string;
  manager?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  time: string;
  isSelf: boolean;
}

export interface ServiceTask {
  parentId?: string;
  id: string;
  vehicleId?: string;
  partStockId?: string;
  targetModelName?: string;
  targetMachineNumber?: string;
  title: string;
  category: ServiceCategory;
  urgency: Urgency;
  progress: TaskProgress;
  deadline: string; // ISO
  startDate?: string;
  plannedStart?: string;
  plannedEnd?: string;
  staffId?: string; // legacy single
  staffIds?: string[];
  assignments?: {staffId: string; plannedStart: string; plannedEnd: string}[]; // multiple staff support
  toolIds?: string[];
  parkingAreaIds?: string[];
  description?: string;
  isApproved?: boolean;
  approverName?: string;
  approvedAt?: string;
  approveComment?: string;
  approveStamp?: string;
  isNonWorkingDay?: boolean;
  chatMessages?: ChatMessage[];
}

export type ViewState = 'home' | 'fleet' | 'vehicles' | 'customers' | 'tasks' | 'tasks_patrol' | 'tasks_fc' | 'tasks_repair' | 'tasks_maintenance' | 'tasks_inspection' | 'schedule' | 'master' | 'stock_calendar' | 'reports' | 'sales' | 'app_list';

export type Language = 'ja' | 'en';

export interface PartStockHistory {
  date: string;
  quantity: number;
}

export interface PartStockItem {
  id: string;
  partNumber: string;
  partName: string;
  quantity: number;
  lastPurchaseDate?: string;
  history: PartStockHistory[];
}

export interface SalesVisitPlanItem {
  id: string;
  startMonth: string; // YYYY-MM
  endMonth: string; // YYYY-MM
  customerName: string;
  targetVisits: number;
  plannedDates: string[]; // ISO date strings
}

export interface SalesTargetItem {
  id: string;
  startMonth: string; // YYYY-MM
  endMonth: string; // YYYY-MM
  customerName: string; // どこで
  productName: string; // 何を
  amount: number; // いくらで
}

export interface SalesPlan {
  id: string;
  staffId: string;
  title?: string;
  startMonth?: string;
  endMonth?: string;
  totalSalesAmount?: number;
  totalVisitCount?: number;
  visitPlans: SalesVisitPlanItem[];
  salesTargets: SalesTargetItem[];
}

export interface SalesVisit {
  id: string;
  customerName: string;
  memo: string;
}

export interface SalesDailyReport {
  id: string;
  date: string;
  staffId: string;
  visits: SalesVisit[];
}

export interface SalesLead {
  id: string;
  customerName: string;
  memo: string;
  createdAt: string;
  salesTargetId?: string; // 紐づく販売計画ターゲットのID
  finalAmount?: number;
}

export interface QuoteItem {
  id: string;
  name: string;
  originalPrice: number;
  finalPrice: number;
}

export interface SalesFile {
  id: string;
  name: string;
  type: string; 
}

export interface AppliedContract {
  id: string;
  templateId: string;
  files: SalesFile[];
  chatMessages?: {id: string, text: string, sender: string, time: string, isSelf: boolean}[];
}

export interface SalesQuote {
  id: string;
  leadId?: string;
  revision: number; // NEW: quote revision number
  customerName: string;
  targetModelName?: string;
  targetMachineNumber?: string;
  dealType?: '新車販売' | '中古車販売' | '中古車買取のみ';
  hasTradeIn?: boolean;
  status: '見積作成中' | '見積提示済' | '注文書作成中' | '社内承認回付中' | '承認済・本発注' | '出庫手配済' | '次ステップへ移行済';
  specialRequest?: string; // 特注品・現地調達品仕様
  specialRequestDeadline?: string; // 欲しい時期
  cpqLinked?: boolean;
  items: QuoteItem[];
  modificationInstruction?: string; // フロントへの改造指示
  services: string[]; // 有償サービス等のテキストまたはID
  appliedContracts?: AppliedContract[];
  files: SalesFile[];
  chatMessages?: {id: string, text: string, sender: string, time: string, isSelf: boolean}[];
  vehicleId?: string;
  receivingSettings?: {
    answered: boolean;
    deliveryType?: 'immediate' | 'inventory_delivery' | 'inventory';
    isImmediateDelivery: boolean;
    needsAssembly: boolean;
    expectedDate?: string;
    memo?: string;
    targetVehicleModel?: string;
    targetSerialNumber?: string;
    deliveryDate?: string;
  };
  finalAmount?: number;
  salesTargetId?: string;
  quotePrepCompleted?: boolean;
  initialContractCompleted?: boolean;
  receiveProcessCompleted?: boolean;
  stockProcessCompleted?: boolean;
  deliveryProcessCompleted?: boolean;
  systemRegistrationCompleted?: boolean;
  receiveWork?: {
    date: string;
    staffIds: string[];
  };
  stockPeriod?: {
    startDate: string;
    endDate: string;
    parkingId?: string;
    isEndDateUndecided?: boolean;
  };
  deliveryWork?: {
    date: string;
    staffIds: string[];
  };
  createdAt: string;
}

export interface Alert {
  id: string;
  type: 'patrol' | 'fc' | 'contract' | 'maintenance' | 'inspection' | 'stock' | 'parts' | 'delivery' | 'vehicle';
  vehicleId?: string;
  targetModelName?: string;
  description: string;
  title?: string;
  isIgnored: boolean;
  date?: string;
}
