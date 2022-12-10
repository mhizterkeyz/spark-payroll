import keyBy from 'lodash.keyby';
import moment from 'moment';
import { Remittances } from 'remittances/remittances';
import { Util } from 'shared/util';
import { Fees } from '../fees/fees';
import {
  IProcessedPayrollEmployees,
  IProcessedPayrollPayloadAddon,
  IProcessedPayrollPayloadEmployee,
  IProcessedPayrollPayloadGroup,
  ProcessedPayrollPayload,
  ProcessEmployeePayload,
  ProcessPayload,
} from './types';

export class ProcessedPayroll<T extends Record<string, unknown>> {
  private groupsKeyedById: Record<string, IProcessedPayrollPayloadGroup<T>> =
    {};

  private addonsKeyedByEmployee: Record<
    string,
    {
      bonuses?: IProcessedPayrollPayloadAddon[];
      deductions?: IProcessedPayrollPayloadAddon[];
      prorates?: IProcessedPayrollPayloadAddon[];
    }
  > = {};

  private payloadEmployeesKeyedById: Record<
    string,
    IProcessedPayrollPayloadEmployee<T>
  > = {};

  private data: ReturnType<typeof this.process>;

  constructor(private readonly payload: ProcessedPayrollPayload<T>) {
    this.init();
  }

  get() {
    return this.data;
  }

  updateEmployees(...employees: IProcessedPayrollPayloadEmployee<T>[]) {
    let newData = { ...this.data };

    this.process({
      employees,
      beforeEach: ({ employee }) => {
        const oldEmployee = this.payloadEmployeesKeyedById[employee.id] || {};
        return { ...oldEmployee, ...employee };
      },
      afterEach: (payload) => {
        const { processedEmployee } = payload;
        const oldEmployee = this.data.mappedEmployees[processedEmployee.id];
        if (oldEmployee) {
          newData = this.removeEmployeeFromData(newData, oldEmployee, false);
        } else {
          processedEmployee.payloadArrayIndex = newData.employees.length;
        }

        newData.mappedEmployees[processedEmployee.id] = processedEmployee;
        newData.employees[processedEmployee.payloadArrayIndex] =
          processedEmployee;
        newData.totalBonus = Util.sum(
          newData.totalBonus,
          processedEmployee.totalBonus,
        );
        newData.totalDeductions = Util.sum(
          newData.totalDeductions,
          processedEmployee.totalDeduction,
        );
        newData.totalNetSalaries = Util.sum(
          newData.totalNetSalaries,
          processedEmployee.netSalary,
        );
        newData.totalProrate = Util.sum(
          newData.totalProrate,
          processedEmployee.totalProrate,
        );
        newData.totalSalaries = Util.sum(
          newData.totalSalaries,
          processedEmployee.salary,
        );
        newData.totalRemittances = Util.sum(
          newData.totalRemittances,
          processedEmployee.totalRemittances,
        );
      },
    });

    this.data = Object.freeze(newData);

    return this.data;
  }

  removeEmployees(...employeeIds: string[]) {
    let newData = { ...this.data };

    employeeIds.forEach((employeeId) => {
      const employee = newData.mappedEmployees[employeeId];
      if (employee) {
        newData = this.removeEmployeeFromData(newData, employee);
      }
    });

    newData.employees = Object.values(newData.mappedEmployees);

    this.data = newData;

    return this.data;
  }

  updateAddons(...addons: IProcessedPayrollPayloadAddon[]) {
    const employees: IProcessedPayrollPayloadEmployee<T>[] = [];

    this.initAddons(addons, (addon) => {
      const employee = this.payloadEmployeesKeyedById[addon.entity];
      if (employee) {
        employees.push(employee);
      }
    });

    return this.updateEmployees(...employees);
  }

  private removeEmployeeFromData(
    data: typeof this.data,
    employee: IProcessedPayrollEmployees,
    removeFromList = true,
  ) {
    const newData = { ...data };

    newData.totalBonus = Util.sub(newData.totalBonus, employee.totalBonus);
    newData.totalDeductions = Util.sub(
      newData.totalDeductions,
      employee.totalDeduction,
    );
    newData.totalNetSalaries = Util.sub(
      newData.totalNetSalaries,
      employee.netSalary,
    );
    newData.totalProrate = Util.sub(
      newData.totalProrate,
      employee.totalProrate,
    );
    newData.totalSalaries = Util.sub(newData.totalSalaries, employee.salary);
    newData.totalRemittances = Util.sub(
      newData.totalRemittances,
      employee.totalRemittances,
    );

    if (removeFromList) {
      delete newData.mappedEmployees[employee.id];
    }

    return newData;
  }

  private initAddons(
    addons: IProcessedPayrollPayloadAddon[],
    callback?: (addon: IProcessedPayrollPayloadAddon) => unknown,
  ) {
    addons.forEach((addon) => {
      if (callback) {
        callback(addon);
      }
      this.addonsKeyedByEmployee[addon.entity] = this.addonsKeyedByEmployee[
        addon.entity
      ] || { bonuses: [], deductions: [], prorates: [] };
      if (addon.type === 'bonus') {
        this.addonsKeyedByEmployee[addon.entity].bonuses?.push(addon);
      }
      if (addon.type === 'deduction') {
        this.addonsKeyedByEmployee[addon.entity].deductions?.push(addon);
      }
      if (addon.type === 'prorate') {
        this.addonsKeyedByEmployee[addon.entity].prorates?.push(addon);
      }
    });
  }

  private init() {
    this.groupsKeyedById = keyBy(this.payload.groups, 'id');

    this.initAddons(this.payload.addons);

    this.data = this.process({ employees: this.payload.employees });
  }

  private process(payload: ProcessPayload<T>) {
    const { employees, beforeEach, afterEach } = payload;
    const {
      year,
      proRateMonth,
      country,
      remittanceProcessingContext = {},
      beforeEach: _beforeEach,
    } = this.payload;
    const date = moment().year(year).month(proRateMonth);
    const workDaysInMonth = Util.calculateWorkDaysBetweenDates(
      date.startOf('month').add('1', 'hour'),
      date.clone().endOf('month'),
    );
    const processedEmployeesArray: IProcessedPayrollEmployees[] = [];
    const processedEmployees: Record<string, IProcessedPayrollEmployees> = {};
    let totalBonus = 0;
    let totalDeductions = 0;
    let totalNetSalaries = 0;
    let totalProrate = 0;
    let totalSalaries = 0;
    let totalRemittances = 0;
    let totalFee = 0;

    employees.forEach((_employee, payloadArrayIndex) => {
      let group = this.groupsKeyedById[_employee.group];

      const transformed = _beforeEach
        ? _beforeEach({ employee: _employee, group })
        : { employee: _employee, group };

      group = transformed.group;

      const employee = beforeEach
        ? beforeEach({ employee: transformed.employee })
        : transformed.employee;

      // @ts-ignore
      employee.remittanceProcessingContext =
        employee.remittanceProcessingContext || {
          ...employee,
          ...(employee.remittances || {}),
        };

      this.payloadEmployeesKeyedById[employee.id] = employee;

      const addons = this.addonsKeyedByEmployee[employee.id] || {
        bonuses: [],
        deductions: [],
        prorates: [],
      };
      if (group) {
        const groupAddons = this.addonsKeyedByEmployee[group.id];
        if (groupAddons) {
          addons.bonuses = addons.bonuses?.concat(groupAddons.bonuses);
          addons.deductions = addons.deductions?.concat(groupAddons.deductions);
          addons.prorates = addons.prorates?.concat(groupAddons.prorates);
        }

        // @ts-ignore
        group.remittanceProcessingContext =
          group.remittanceProcessingContext || {
            ...group,
            ...(group.remittances || {}),
          };
      }

      const processedEmployee = this.processEmployee({
        employee,
        group,
        ...addons,
        date,
        year,
        proRateMonth,
        workDaysInMonth,
      });
      const {
        totalBonus: _totalBonus,
        totalDeduction: _totalDeduction,
        salary,
        totalProrate: _totalProrate,
      } = processedEmployee;
      let { netSalary } = processedEmployee;

      const employeeRemittances = Remittances.process({
        ...remittanceProcessingContext,
        ...(employee.remittanceProcessingContext || {}),
        country,
        employee: { totalBonus: _totalBonus, salary },
        group,
      });
      const { totalRemittances: _totalRemittances } = employeeRemittances;

      netSalary = Math.max(0, Util.sub(netSalary, _totalRemittances));

      const fee = Fees.region(country).processForEmployee({
        employee: {
          netSalary,
          addons: processedEmployee.addons,
        },
      });
      const { totalFee: _totalFee } = fee;

      totalBonus = Util.sum(totalBonus, _totalBonus);
      totalDeductions = Util.sum(totalDeductions, _totalDeduction);
      totalNetSalaries = Util.sum(totalNetSalaries, netSalary);
      totalProrate = Util.sum(totalProrate, _totalProrate);
      totalSalaries = Util.sum(totalSalaries, salary);
      totalRemittances = Util.sum(totalRemittances, _totalRemittances);
      totalFee = Util.sum(totalFee, _totalFee);

      const _processedEmployee = {
        ...processedEmployee,
        ...employeeRemittances,
        ...fee,
        netSalary,
        arrayIndex: processedEmployeesArray.length,
        payloadArrayIndex,
      };

      processedEmployees[employee.id] = _processedEmployee;
      processedEmployeesArray.push(_processedEmployee);
      if (afterEach) {
        afterEach({
          processedEmployee: _processedEmployee,
          employeeRemittances,
        });
      }
    });

    return Object.freeze({
      totalBonus,
      totalDeductions,
      totalNetSalaries,
      totalProrate,
      totalSalaries,
      totalRemittances,
      totalFee,
      employees: processedEmployeesArray,
      mappedEmployees: processedEmployees,
    });
  }

  private processEmployee(payload: ProcessEmployeePayload<T>) {
    const {
      employee,
      group,
      bonuses,
      deductions,
      prorates,
      proRateMonth,
      year,
      date: processingDate,
      workDaysInMonth,
    } = payload;

    const employeeAddons: {
      amount: number;
      meta: unknown;
      addonId: string;
      type: string;
    }[] = [];

    let totalBonus = 0;
    let totalDeduction = 0;
    let totalProrate = 0;
    let { salary = 0 } = employee;
    let netSalary = salary;

    if (group) {
      const commonSalary = Number(group.commonSalary);
      if (!Number.isNaN(commonSalary) && commonSalary > 0) {
        salary = commonSalary;
        netSalary = commonSalary;
      }
    }

    bonuses?.forEach((bonus) => {
      netSalary = Util.sum(netSalary, bonus.amount);
      totalBonus = Util.sum(totalBonus, bonus.amount);

      employeeAddons.push({ ...bonus, meta: bonus, addonId: bonus.id });
    });

    deductions?.forEach((deduction) => {
      const amountAfterDeduction = Util.sub(netSalary - deduction.amount);
      if (amountAfterDeduction > 0) {
        netSalary = amountAfterDeduction;
        totalDeduction = Util.sum(totalDeduction, deduction.amount);

        employeeAddons.push({
          ...deduction,
          meta: deduction,
          addonId: deduction.id,
        });
      }
    });

    prorates?.forEach((prorate) => {
      const date = prorate.dates.find(
        (_date) =>
          _date.month === proRateMonth &&
          (prorate.frequency === 'recurring' || +_date.year === +year),
      );
      if (!date) {
        return;
      }

      const [start, end] = date.days || [];
      const numericStart = +start;
      const numericEnd = +end;
      const isValidProrate =
        numericStart >= 1 &&
        numericStart <= numericEnd &&
        numericEnd <= processingDate.daysInMonth();
      if (isValidProrate) {
        const proRateDays = Util.calculateWorkDaysBetweenDates(
          processingDate.clone().set('date', numericStart),
          processingDate.clone().set('date', numericEnd),
        );
        const deduction = Util.sub(
          salary - Util.mul(Util.div(salary, workDaysInMonth), proRateDays),
        );
        const amountAfterDeduction = Util.sub(netSalary, deduction);
        if (amountAfterDeduction >= 0) {
          employeeAddons.push({
            ...prorate,
            amount: deduction,
            meta: { ...prorate, deduction },
            addonId: prorate.id,
          });
          netSalary = Util.sub(netSalary - deduction);
          totalProrate = Util.sum(totalProrate, deduction);
        }
      }
    });

    return {
      id: employee.id,
      salary,
      netSalary,
      addons: employeeAddons,
      totalBonus,
      totalDeduction,
      totalProrate,
    };
  }
}
