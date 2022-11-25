import { Util } from 'shared/util';
import { NIGERIAN_MINIMUM_WAGE } from './constants';
import { Tax } from './tax';
import { ProcessTaxPayload, TaxType, TaxTypeEnum } from './types';

const getTaxPayload = (payload: Partial<ProcessTaxPayload>) => {
  const { taxSettings, ..._payload } = payload;
  return {
    salary: 30000,
    taxSettings: {
      taxRelief: [],
      enabled: true,
      type: 'PAYE' as TaxType,
      whTaxRate: 0,
      ...(taxSettings || {}),
    },
    totalBonus: 0,
    ..._payload,
  };
};

describe('Nigerian Tax', () => {
  it('should be defined', () => {
    expect(Tax).toBeDefined();
  });

  describe('process', () => {
    it('should return 0 if tax is disabled in settings', () => {
      const payload = getTaxPayload({ taxSettings: { enabled: false } });

      const tax = Tax.process(payload);

      expect(tax).toBe(0);
    });

    it('should return 0 if salary is less than minimum wage', () => {
      const payload = getTaxPayload({ salary: NIGERIAN_MINIMUM_WAGE - 10 });

      const tax = Tax.process(payload);

      expect(tax).toBe(0);
    });

    it('should calculate Withholding Tax if selected', () => {
      const whTaxRate = 0.05;
      const payload = getTaxPayload({
        taxSettings: { type: TaxTypeEnum.WITHHOLDING, whTaxRate },
      });

      const tax = Tax.process(payload);

      expect(tax).toBe(Util.mul(payload.salary, whTaxRate));
    });

    it('should consider tax reliefs', () => {
      const payload = getTaxPayload({
        taxSettings: {
          taxRelief: [
            { name: 'health insurance', value: 15000 },
            { name: 'job loss insurance', value: 15000 },
          ],
        },
      });

      const tax = Tax.process(payload);

      expect(tax).toBe(0);
    });

    it('should consider tax reliefs', () => {
      const payload = getTaxPayload({
        taxSettings: {
          taxRelief: [
            { name: 'health insurance', value: 15000 },
            { name: 'job loss insurance', value: 15000 },
          ],
        },
      });

      const tax = Tax.process(payload);

      expect(tax).toBe(0);
    });

    it('should correctly calculate tax', () => {
      const tax10m = Tax.process(getTaxPayload({ salary: 10000000 }));
      const tax52k = Tax.process(getTaxPayload({ salary: 52083 }));
      const tax83k = Tax.process(getTaxPayload({ salary: 83333 }));
      const tax135k = Tax.process(getTaxPayload({ salary: 135417 }));
      const tax187k = Tax.process(getTaxPayload({ salary: 187500 }));
      const tax354k = Tax.process(getTaxPayload({ salary: 354167 }));

      expect(tax10m).toBe(1878666.63);
      expect(tax135k).toBe(10750.04);
      expect(tax187k).toBe(18666.6533);
      expect(tax354k).toBe(46666.696);
      expect(tax52k).toBe(1749.9813);
      expect(tax83k).toBe(4499.9707);
    });
  });
});
