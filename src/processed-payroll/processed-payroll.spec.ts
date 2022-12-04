import { ProcessNigeriaRemittancePayload } from 'remittances/regions/Nigeria/types';
import { ProcessedPayroll } from './processed-payroll';
import { ProcessedPayrollPayload } from './types';

const getPayrollPayload = <
  T extends Record<string, unknown> = Record<string, unknown>,
>(
  data: Partial<ProcessedPayrollPayload<T>>,
) => ({
  addons: [],
  country: 'Nigeria',
  currency: '',
  cycle: 0,
  employees: [],
  groups: [],
  proRateMonth: 'November',
  remittances: [],
  year: 2022,
  ...data,
});

describe('Processed Payroll', () => {
  it('should be defined', () => {
    expect(ProcessedPayroll).toBeDefined();
  });

  describe('get', () => {
    it('should correctly process salaries', () => {
      const processedPayroll = new ProcessedPayroll(
        getPayrollPayload({
          employees: [
            { group: 'one', id: 'one', salary: 20000 },
            { group: 'two', id: 'two', salary: 100000 },
            { group: 'three', id: 'three', salary: 50000 },
          ],
          groups: [
            { id: 'one', commonSalary: 150000 },
            { id: 'two', commonSalary: 0 },
          ],
        }),
      );
      const data = processedPayroll.get();

      expect(data.totalNetSalaries).toBe(300000);
      expect(data.totalSalaries).toBe(300000);
      expect(data.mappedEmployees.one.salary).toBe(150000);
      expect(data.mappedEmployees.one.netSalary).toBe(150000);
      expect(data.mappedEmployees.two.salary).toBe(100000);
      expect(data.mappedEmployees.two.netSalary).toBe(100000);
      expect(data.mappedEmployees.three.salary).toBe(50000);
      expect(data.mappedEmployees.three.netSalary).toBe(50000);
    });

    it('should correctly process deductions', () => {
      const processedPayroll = new ProcessedPayroll(
        getPayrollPayload({
          employees: [
            { group: 'group-one', id: 'one', salary: 200 },
            { group: 'two', id: 'two', salary: 150 },
          ],
          addons: [
            {
              type: 'deduction',
              amount: 7,
              entity: 'one',
              dates: [],
            },
            {
              type: 'deduction',
              amount: 8,
              entity: 'group-one',
              dates: [],
            },
            {
              type: 'deduction',
              amount: 10,
              entity: 'two',
              dates: [],
            },
          ],
          groups: [{ id: 'group-one' }],
        }),
      );
      const data = processedPayroll.get();

      expect(data.totalDeductions).toBe(25);
      expect(data.totalNetSalaries).toBe(325);
      expect(data.totalSalaries).toBe(350);
      expect(data.mappedEmployees.one.totalDeduction).toBe(15);
      expect(data.mappedEmployees.one.netSalary).toBe(185);
      expect(data.mappedEmployees.one.salary).toBe(200);
      expect(data.mappedEmployees.two.totalDeduction).toBe(10);
      expect(data.mappedEmployees.two.netSalary).toBe(140);
      expect(data.mappedEmployees.two.salary).toBe(150);
    });

    it('should correctly process prorates', () => {
      const processedPayroll = new ProcessedPayroll(
        getPayrollPayload({
          employees: [
            { group: 'group-one', id: 'one', salary: 200 },
            { group: 'two', id: 'two', salary: 150 },
          ],
          addons: [
            {
              type: 'prorate',
              amount: 0,
              entity: 'group-one',
              dates: [{ days: ['15', '30'], month: 'November', year: 2022 }],
            },
            {
              type: 'prorate',
              amount: 0,
              entity: 'group-one',
              dates: [],
              frequency: 'recurring',
            },
            {
              type: 'prorate',
              amount: 0,
              entity: 'two',
              dates: [{ days: ['15', '30'], month: 'November', year: 2022 }],
              frequency: 'once',
            },
          ],
          groups: [{ id: 'group-one' }],
        }),
      );
      const data = processedPayroll.get();

      expect(data.totalProrate).toBe(159.0908);
      expect(data.totalNetSalaries).toBe(190.9092);
      expect(data.totalSalaries).toBe(350);
      expect(data.mappedEmployees.one.totalProrate).toBe(90.9092);
      expect(data.mappedEmployees.one.netSalary).toBe(109.0908);
      expect(data.mappedEmployees.one.salary).toBe(200);
      expect(data.mappedEmployees.two.totalProrate).toBe(68.1816);
      expect(data.mappedEmployees.two.netSalary).toBe(81.8184);
      expect(data.mappedEmployees.two.salary).toBe(150);
    });

    it('should correctly process bonuses', () => {
      const processedPayroll = new ProcessedPayroll(
        getPayrollPayload({
          employees: [
            { group: 'group-one', id: 'one', salary: 20000 },
            { group: 'two', id: 'two', salary: 100000 },
          ],
          addons: [
            {
              type: 'bonus',
              amount: 10000,
              entity: 'one',
              dates: [],
              frequency: '',
            },
            {
              type: 'bonus',
              amount: 5000,
              entity: 'group-one',
              dates: [],
              frequency: '',
            },
            {
              type: 'bonus',
              amount: 5000,
              entity: 'two',
              dates: [],
              frequency: '',
            },
          ],
          groups: [{ id: 'group-one' }],
        }),
      );
      const data = processedPayroll.get();

      expect(data.totalBonus).toBe(20000);
      expect(data.totalNetSalaries).toBe(140000);
      expect(data.totalSalaries).toBe(120000);
      expect(data.mappedEmployees.one.totalBonus).toBe(15000);
      expect(data.mappedEmployees.one.netSalary).toBe(35000);
      expect(data.mappedEmployees.one.salary).toBe(20000);
      expect(data.mappedEmployees.two.totalBonus).toBe(5000);
      expect(data.mappedEmployees.two.netSalary).toBe(105000);
      expect(data.mappedEmployees.two.salary).toBe(100000);
    });

    it('should process remittances', () => {
      const processedPayroll =
        new ProcessedPayroll<ProcessNigeriaRemittancePayload>(
          getPayrollPayload({
            remittanceProcessingContext: {
              tax: { enabled: true },
            },
            employees: [
              { group: 'group-one', id: 'one', salary: 52083 },
              { id: 'two', salary: 83333, group: '' },
            ],
            groups: [
              {
                id: 'group-one',
                remittanceProcessingContext: {
                  tax: {
                    enabled: true,
                    type: 'WITHHOLDING',
                    whTaxRate: 0.05,
                  },
                },
              },
            ],
          }),
        );
      const data = processedPayroll.get();

      expect(data.totalRemittances).toBe(7104.1207);
      expect(data.totalNetSalaries).toBe(128311.8793);
      expect(data.totalSalaries).toBe(135416);
      expect(data.mappedEmployees.one.totalRemittances).toBe(2604.15);
      expect(data.mappedEmployees.one.netSalary).toBe(49478.85);
      expect(data.mappedEmployees.one.salary).toBe(52083);
      expect(data.mappedEmployees.two.totalRemittances).toBe(4499.9707);
      expect(data.mappedEmployees.two.netSalary).toBe(78833.0293);
      expect(data.mappedEmployees.two.salary).toBe(83333);
    });
  });

  describe('updateEmployees', () => {
    it('should update employee salary', () => {
      const processedPayroll = new ProcessedPayroll(
        getPayrollPayload({ employees: [{ id: 'one', salary: 52083 }] }),
      );

      let data = processedPayroll.get();

      expect(
        data.employees[data.mappedEmployees.one.payloadArrayIndex].netSalary,
      ).toBe(52083);
      expect(
        data.employees[data.mappedEmployees.one.payloadArrayIndex].salary,
      ).toBe(52083);
      expect(data.mappedEmployees.one.netSalary).toBe(52083);
      expect(data.mappedEmployees.one.salary).toBe(52083);

      data = processedPayroll.updateEmployees({
        id: 'one',
        salary: 83333,
      });

      expect(data.mappedEmployees.one.netSalary).toBe(83333);
      expect(data.mappedEmployees.one.salary).toBe(83333);
      expect(
        data.employees[data.mappedEmployees.one.payloadArrayIndex].netSalary,
      ).toBe(83333);
      expect(
        data.employees[data.mappedEmployees.one.payloadArrayIndex].salary,
      ).toBe(83333);
    });

    it('should add employee if it does not exists', () => {
      const processedPayroll = new ProcessedPayroll(
        getPayrollPayload({ employees: [{ id: 'one', salary: 52083 }] }),
      );

      let data = processedPayroll.get();

      expect(data.employees).toHaveLength(1);
      expect(Object.keys(data.mappedEmployees)).toHaveLength(1);

      data = processedPayroll.updateEmployees({
        id: 'two',
        salary: 83333,
      });

      expect(data.employees).toHaveLength(2);
      expect(Object.keys(data.mappedEmployees)).toHaveLength(2);
      expect(data.mappedEmployees.two).toBeDefined();
    });

    it('should update totals', () => {
      const processedPayroll =
        new ProcessedPayroll<ProcessNigeriaRemittancePayload>(
          getPayrollPayload({
            remittanceProcessingContext: {
              tax: { enabled: true },
            },
            employees: [{ id: 'money', salary: 52083 }],
          }),
        );

      let data = processedPayroll.get();

      expect(data.totalNetSalaries).toBe(50333.0187);
      expect(data.totalSalaries).toBe(52083);
      expect(data.totalRemittances).toBe(1749.9813);

      data = processedPayroll.updateEmployees({ id: 'money', salary: 83333 });

      expect(data.totalNetSalaries).toBe(78833.0293);
      expect(data.totalSalaries).toBe(83333);
      expect(data.totalRemittances).toBe(4499.9707);
    });

    it('should accept one or more employees as parameter', () => {
      const processedPayroll =
        new ProcessedPayroll<ProcessNigeriaRemittancePayload>(
          getPayrollPayload({
            remittanceProcessingContext: {
              tax: { enabled: true },
            },
            employees: [
              { id: 'one', salary: 52083 },
              { id: 'two', salary: 83333 },
            ],
            groups: [
              {
                id: 'group-one',
                remittanceProcessingContext: {
                  tax: {
                    enabled: false,
                  },
                },
              },
            ],
          }),
        );

      let data = processedPayroll.updateEmployees({
        id: 'one',
        salary: 83333,
      });

      expect(data.totalRemittances).toBe(8999.9414);
      expect(data.totalNetSalaries).toBe(157666.0586);
      expect(data.totalSalaries).toBe(166666);
      expect(data.mappedEmployees.one.totalRemittances).toBe(4499.9707);
      expect(data.mappedEmployees.one.netSalary).toBe(78833.0293);
      expect(data.mappedEmployees.one.salary).toBe(83333);
      expect(data.mappedEmployees.two.totalRemittances).toBe(4499.9707);
      expect(data.mappedEmployees.two.netSalary).toBe(78833.0293);
      expect(data.mappedEmployees.two.salary).toBe(83333);

      data = processedPayroll.updateEmployees(
        { id: 'one', salary: 52083 },
        { id: 'two', salary: 52083 },
        { id: 'three', group: 'group-one', salary: 30000 },
      );

      expect(data.totalRemittances).toBe(3499.9626);
      expect(data.totalNetSalaries).toBe(130666.0374);
      expect(data.totalSalaries).toBe(134166);
      expect(data.mappedEmployees.one.totalRemittances).toBe(1749.9813);
      expect(data.mappedEmployees.one.netSalary).toBe(50333.0187);
      expect(data.mappedEmployees.one.salary).toBe(52083);
      expect(data.mappedEmployees.two.totalRemittances).toBe(1749.9813);
      expect(data.mappedEmployees.two.netSalary).toBe(50333.0187);
      expect(data.mappedEmployees.two.salary).toBe(52083);
      expect(data.mappedEmployees.three.totalRemittances).toBe(0);
      expect(data.mappedEmployees.three.netSalary).toBe(30000);
      expect(data.mappedEmployees.three.salary).toBe(30000);
    });
  });

  describe('removeEmployees', () => {
    it('should remove employee', () => {
      const processedPayroll = new ProcessedPayroll(
        getPayrollPayload({ employees: [{ id: 'one', salary: 52083 }] }),
      );

      let data = processedPayroll.get();

      expect(data.employees).toHaveLength(1);
      expect(Object.keys(data.mappedEmployees)).toHaveLength(1);

      data = processedPayroll.removeEmployees('one');

      expect(data.employees).toHaveLength(0);
      expect(Object.keys(data.mappedEmployees)).toHaveLength(0);
      expect(data.mappedEmployees.one).toBeUndefined();
    });

    it('should accept one or more employee ids as parametesrs', () => {
      const processedPayroll = new ProcessedPayroll(
        getPayrollPayload({
          employees: [
            { id: 'one', salary: 100 },
            { id: 'two', salary: 100 },
            { id: 'three', salary: 100 },
          ],
        }),
      );

      let data = processedPayroll.get();

      expect(data.employees).toHaveLength(3);
      expect(Object.keys(data.mappedEmployees)).toHaveLength(3);

      data = processedPayroll.removeEmployees('one');

      expect(data.employees).toHaveLength(2);
      expect(Object.keys(data.mappedEmployees)).toHaveLength(2);
      expect(data.mappedEmployees.one).toBeUndefined();

      data = processedPayroll.removeEmployees('two', 'three');

      expect(data.employees).toHaveLength(0);
      expect(Object.keys(data.mappedEmployees)).toHaveLength(0);
      expect(data.mappedEmployees.two).toBeUndefined();
      expect(data.mappedEmployees.three).toBeUndefined();
    });

    it('should update totals', () => {
      const processedPayroll =
        new ProcessedPayroll<ProcessNigeriaRemittancePayload>(
          getPayrollPayload({
            remittanceProcessingContext: {
              tax: { enabled: true },
            },
            employees: [{ id: 'one', salary: 152083 }],
            addons: [
              {
                type: 'bonus',
                amount: 10000,
                entity: 'one',
                dates: [],
                frequency: '',
              },
              {
                type: 'prorate',
                amount: 0,
                entity: 'one',
                dates: [{ days: ['15', '30'], month: 'November', year: 2022 }],
                frequency: 'recurring',
              },
              {
                type: 'deduction',
                amount: 7000,
                entity: 'one',
                dates: [],
                frequency: '',
              },
            ],
          }),
        );

      let data = processedPayroll.get();

      expect(data.totalBonus).toBeGreaterThan(0);
      expect(data.totalDeductions).toBeGreaterThan(0);
      expect(data.totalProrate).toBeGreaterThan(0);
      expect(data.totalNetSalaries).toBeGreaterThan(0);
      expect(data.totalRemittances).toBeGreaterThan(0);
      expect(data.totalSalaries).toBeGreaterThan(0);

      data = processedPayroll.removeEmployees('one');

      expect(data.totalBonus).toBe(0);
      expect(data.totalDeductions).toBe(0);
      expect(data.totalProrate).toBe(0);
      expect(data.totalNetSalaries).toBe(0);
      expect(data.totalRemittances).toBe(0);
      expect(data.totalSalaries).toBe(0);
    });
  });

  describe('updateAddons', () => {
    it('should update employee addons', () => {
      const processedPayroll = new ProcessedPayroll(
        getPayrollPayload({ employees: [{ id: 'one', salary: 52083 }] }),
      );

      let data = processedPayroll.get();

      expect(
        data.employees[data.mappedEmployees.one.payloadArrayIndex].addons,
      ).toHaveLength(0);
      expect(data.mappedEmployees.one.addons).toHaveLength(0);

      data = processedPayroll.updateAddons({
        type: 'bonus',
        amount: 100,
        entity: 'one',
      });

      expect(
        data.employees[data.mappedEmployees.one.payloadArrayIndex].addons,
      ).toHaveLength(1);
      expect(data.mappedEmployees.one.addons).toHaveLength(1);
    });

    it('should update totals', () => {
      const processedPayroll = new ProcessedPayroll(
        getPayrollPayload({
          remittanceProcessingContext: { tax: { enabled: true } },
          employees: [{ id: 'one', salary: 52083 }],
        }),
      );

      const {
        totalDeductions,
        totalBonus,
        totalNetSalaries,
        totalProrate,
        totalRemittances,
      } = processedPayroll.get();

      const data = processedPayroll.updateAddons(
        { type: 'bonus', amount: 20000, entity: 'one' },
        { type: 'deduction', amount: 1000, entity: 'one' },
        {
          type: 'prorate',
          amount: 0,
          entity: 'one',
          dates: [{ days: ['05', '30'], month: 'November', year: 2022 }],
        },
      );

      expect(data.totalDeductions).toBeGreaterThan(totalDeductions);
      expect(data.totalBonus).toBeGreaterThan(totalBonus);
      expect(data.totalNetSalaries).toBeGreaterThan(totalNetSalaries);
      expect(data.totalRemittances).toBeGreaterThan(totalRemittances);
      expect(data.totalProrate).toBeGreaterThan(totalProrate);
    });

    it('should update employee amounts', () => {
      const processedPayroll = new ProcessedPayroll(
        getPayrollPayload({
          remittanceProcessingContext: { tax: { enabled: true } },
          employees: [{ id: 'one', salary: 52083 }],
        }),
      );

      const {
        netSalary,
        totalBonus,
        totalDeduction,
        totalProrate,
        totalRemittances,
      } = processedPayroll.get().mappedEmployees.one;

      const data = processedPayroll.updateAddons(
        { type: 'bonus', amount: 20000, entity: 'one' },
        { type: 'deduction', amount: 1000, entity: 'one' },
        {
          type: 'prorate',
          amount: 0,
          entity: 'one',
          dates: [{ days: ['05', '30'], month: 'November', year: 2022 }],
        },
      );

      expect(data.mappedEmployees.one.netSalary).toBeGreaterThan(netSalary);
      expect(data.mappedEmployees.one.totalBonus).toBeGreaterThan(totalBonus);
      expect(data.mappedEmployees.one.totalDeduction).toBeGreaterThan(
        totalDeduction,
      );
      expect(data.mappedEmployees.one.totalProrate).toBeGreaterThan(
        totalProrate,
      );
      expect(data.mappedEmployees.one.totalRemittances).toBeGreaterThan(
        totalRemittances,
      );
    });
  });
});
