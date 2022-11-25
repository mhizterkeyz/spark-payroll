import * as moment from 'moment';

export type IProcessedPayrollPayloadEmployee = {
  id: string;
  group?: string;
  salary?: number;
};

export type IProcessedPayrollPayloadGroup<T extends Record<string, unknown>> = {
  id: string;
  taxSettings?: T;
  meta?: { commonSalary?: number };
};

export type IProcessedPayrollPayloadAddon = {
  id?: string;
  amount: number;
  dates?: { days?: string[]; year?: number; month: string }[];
  type: string;
  entity: string;
  frequency?: string;
};

export type IProcessedPayrollTotals = {
  totalSalaries: number;
  totalNetSalaries: number;
  totalDeductions: number;
  totalBonus: number;
  totalProrate: number;
};

export type IProcessedPayrollEmployees = {
  id: string;
  salary: number;
  netSalary: number;
  addons: { amount: number; type: string; meta?: unknown; addonId: string }[];
  totalDeduction: number;
  totalBonus: number;
  totalProrate: number;
  totalRemittances: number;
  arrayIndex?: number;
  payloadArrayIndex?: number;
};

export type ProcessedPayrollPayload<T extends Record<string, unknown>> = {
  currency: string;
  country: string;
  employees: IProcessedPayrollPayloadEmployee[];
  addons: IProcessedPayrollPayloadAddon[];
  groups: IProcessedPayrollPayloadGroup<T>[];
  cycle: number;
  year: number;
  proRateMonth: string;
  remittanceProcessingContext?: T;
};

export type ProcessEmployeePayload<T extends Record<string, unknown>> = {
  employee: IProcessedPayrollPayloadEmployee;
  group?: IProcessedPayrollPayloadGroup<T>;
  bonuses?: IProcessedPayrollPayloadAddon[];
  deductions?: IProcessedPayrollPayloadAddon[];
  prorates?: IProcessedPayrollPayloadAddon[];
  proRateMonth: string;
  year: number;
  date: moment.Moment;
  workDaysInMonth: number;
};

export type ProcessPayload = {
  employees: IProcessedPayrollPayloadEmployee[];
  beforeEach?(payload: {
    employee: IProcessedPayrollPayloadEmployee;
  }): IProcessedPayrollPayloadEmployee;
  afterEach?(payload: {
    processedEmployee: IProcessedPayrollEmployees;
    employeeRemittances: { totalRemittances: number };
  }): unknown;
};
