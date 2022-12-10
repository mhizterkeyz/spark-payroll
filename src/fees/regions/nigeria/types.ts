import { IProcessedPayrollEmployees } from '../../../processed-payroll/types';

export type ProcessFeePayload = {
  employee: Pick<IProcessedPayrollEmployees, 'netSalary' | 'addons'>;
};
