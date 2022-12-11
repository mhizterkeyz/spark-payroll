import { Nigeria } from '.';
import { ProcessNigeriaRemittanceResponse } from './types';

describe('Nigeria', () => {
  it('should be defined', () => {
    expect(Nigeria).toBeDefined();
  });

  describe('process', () => {
    it('should process nigerian remittances', () => {
      const { tax, totalRemittances, remittances } =
        Nigeria.process<ProcessNigeriaRemittanceResponse>({
          employee: { salary: 52083, totalBonus: 0 },
          country: '',
          tax: { enabled: true },
        });

      expect(tax).toBeDefined();
      expect(tax).toBe(1749.9813);
      expect(totalRemittances).toBe(1749.9813);
      expect(remittances).toHaveLength(1);
    });

    it('should omit selected items', () => {
      const { tax, totalRemittances, remittances } =
        Nigeria.process<ProcessNigeriaRemittanceResponse>({
          employee: { salary: 52083, totalBonus: 0 },
          country: '',
          tax: { enabled: true },
          omit: { tax: true },
        });

      expect(tax).toBeUndefined();
      expect(totalRemittances).toBe(0);
      expect(remittances).toBeDefined();
      expect(remittances).toHaveLength(0);
    });
  });
});
