const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

const badLead = `export interface SalesLead {
  id: string;
  customerName: string;
  memo: string;
  finalAmount?: number;
  salesTargetId?: string;
  quotePrepCompleted?: boolean;
  initialContractCompleted?: boolean;
  deliveryProcessCompleted?: boolean;
  systemRegistrationCompleted?: boolean;
  receiveWork?: {
    date: string;
    staffIds: string[];
  };
  stockPeriod?: {
    startDate: string;
    endDate: string;
  };
  deliveryWork?: {
    date: string;
    staffIds: string[];
  };
  createdAt: string;
  salesTargetId?: string; // 紐づく販売計画ターゲットのID
  finalAmount?: number;
}`;

const goodLead = `export interface SalesLead {
  id: string;
  customerName: string;
  memo: string;
  createdAt: string;
  salesTargetId?: string; // 紐づく販売計画ターゲットのID
  finalAmount?: number;
}`;

content = content.replace(badLead, goodLead);

const oldQuote = `  receivingSettings?: {
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
  createdAt: string;
}`;

const newQuote = `  receivingSettings?: {
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
  deliveryProcessCompleted?: boolean;
  systemRegistrationCompleted?: boolean;
  receiveWork?: {
    date: string;
    staffIds: string[];
  };
  stockPeriod?: {
    startDate: string;
    endDate: string;
  };
  deliveryWork?: {
    date: string;
    staffIds: string[];
  };
  createdAt: string;
}`;

content = content.replace(oldQuote, newQuote);
fs.writeFileSync('src/types.ts', content);
