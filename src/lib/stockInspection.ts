import { addMonths, differenceInCalendarMonths, differenceInMonths, isBefore, isSameMonth, startOfMonth } from 'date-fns';
import { ServiceTask, Vehicle } from '../types';
import { isTaskResolved } from './workflow';

export interface StockInspectionPlan {
  isEligible: boolean;
  isProvisional: boolean;
  receivingDate?: Date;
  deliveryDate?: Date;
  durationMonths: number;
  dueDates: Date[];
}

const toValidDate = (value?: string) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

export const getReceivingWorkDate = (vehicle: Vehicle, tasks: ServiceTask[]) => {
  const receivingTasks = tasks.filter(task =>
    task.vehicleId === vehicle.id &&
    (task.category === '受け入れ点検' || task.title.includes('受入'))
  );
  const resolvedTask = receivingTasks.find(isTaskResolved);
  const receivingTask = resolvedTask || receivingTasks[0];

  return toValidDate(receivingTask?.deadline || receivingTask?.startDate || vehicle.arrivalDate);
};

export const getStockInspectionPlan = (vehicle: Vehicle, tasks: ServiceTask[]): StockInspectionPlan => {
  const receivingDate = getReceivingWorkDate(vehicle, tasks);
  const deliveryDate = toValidDate(vehicle.deliveryDate);

  if (!receivingDate) {
    return {
      isEligible: false,
      isProvisional: false,
      receivingDate,
      deliveryDate,
      durationMonths: 0,
      dueDates: [],
    };
  }

  // When delivery is undecided, schedule the first stock inspection one month
  // after receiving. Once a delivery date is registered, use the two-month rule.
  if (!deliveryDate) {
    return {
      isEligible: true,
      isProvisional: true,
      receivingDate,
      deliveryDate,
      durationMonths: 0,
      dueDates: [addMonths(receivingDate, 1)],
    };
  }

  if (!isBefore(receivingDate, deliveryDate)) {
    return {
      isEligible: false,
      isProvisional: false,
      receivingDate,
      deliveryDate,
      durationMonths: 0,
      dueDates: [],
    };
  }

  const durationMonths = differenceInMonths(deliveryDate, receivingDate);
  const isEligible = durationMonths >= 2;
  const dueDates: Date[] = [];

  if (isEligible) {
    let monthOffset = 1;
    let dueDate = addMonths(receivingDate, monthOffset);

    while (isBefore(dueDate, deliveryDate) && monthOffset <= 120) {
      dueDates.push(dueDate);
      monthOffset += 1;
      dueDate = addMonths(receivingDate, monthOffset);
    }
  }

  return {
    isEligible,
    isProvisional: false,
    receivingDate,
    deliveryDate,
    durationMonths,
    dueDates,
  };
};

export const getStockInspectionDateForMonth = (plan: StockInspectionPlan, targetMonth: Date) => {
  if (!plan.isEligible || !plan.receivingDate) return undefined;

  if (!plan.isProvisional) {
    return plan.dueDates.find(dueDate => isSameMonth(dueDate, targetMonth));
  }

  const monthOffset = differenceInCalendarMonths(startOfMonth(targetMonth), startOfMonth(plan.receivingDate));
  if (monthOffset < 1) return undefined;

  const dueDate = addMonths(plan.receivingDate, monthOffset);
  return isSameMonth(dueDate, targetMonth) ? dueDate : undefined;
};

export const getNextStockInspectionDate = (plan: StockInspectionPlan, stockTasks: ServiceTask[]) => {
  if (!plan.isEligible || !plan.receivingDate) return undefined;

  if (!plan.isProvisional) {
    return plan.dueDates.find(dueDate =>
      !stockTasks.some(task => isTaskResolved(task) && isSameMonth(new Date(task.deadline), dueDate))
    );
  }

  // At most one completed task can consume each monthly slot, so the first
  // uncompleted provisional date must occur within task count + 1 months.
  for (let monthOffset = 1; monthOffset <= stockTasks.length + 1; monthOffset += 1) {
    const dueDate = addMonths(plan.receivingDate, monthOffset);
    const isCompleted = stockTasks.some(task =>
      isTaskResolved(task) && isSameMonth(new Date(task.deadline), dueDate)
    );
    if (!isCompleted) return dueDate;
  }

  return addMonths(plan.receivingDate, stockTasks.length + 2);
};
