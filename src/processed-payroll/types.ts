import * as moment from 'moment';

export type IProcessedPayrollPayloadEmployee<
  T extends Record<string, unknown>,
> = {
  id: string;
  group?: string;
  remittanceProcessingContext?: T;
  salary?: number;
};

export type IProcessedPayrollPayloadGroup<T extends Record<string, unknown>> = {
  id: string;
  remittanceProcessingContext?: T;
  commonSalary?: number;
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
  country: string;
  employees: IProcessedPayrollPayloadEmployee<T>[];
  addons: IProcessedPayrollPayloadAddon[];
  groups: IProcessedPayrollPayloadGroup<T>[];
  cycle: number;
  year: number;
  proRateMonth: string;
  remittanceProcessingContext?: T;
  beforeEach?(payload: {
    employee: IProcessedPayrollPayloadEmployee<T>;
    group: IProcessedPayrollPayloadGroup<T>;
  }): {
    employee: IProcessedPayrollPayloadEmployee<T>;
    group: IProcessedPayrollPayloadGroup<T>;
  };
};

export type ProcessEmployeePayload<T extends Record<string, unknown>> = {
  employee: IProcessedPayrollPayloadEmployee<T>;
  group?: IProcessedPayrollPayloadGroup<T>;
  bonuses?: IProcessedPayrollPayloadAddon[];
  deductions?: IProcessedPayrollPayloadAddon[];
  prorates?: IProcessedPayrollPayloadAddon[];
  proRateMonth: string;
  year: number;
  date: moment.Moment;
  workDaysInMonth: number;
};

export type ProcessPayload<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  employees: IProcessedPayrollPayloadEmployee<T>[];
  beforeEach?(payload: {
    employee: IProcessedPayrollPayloadEmployee<T>;
  }): IProcessedPayrollPayloadEmployee<T>;
  afterEach?(payload: {
    processedEmployee: IProcessedPayrollEmployees;
    employeeRemittances: { totalRemittances: number };
  }): unknown;
};
