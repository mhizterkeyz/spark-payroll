import { Nigeria } from '.';
import { ProcessNigeriaRemittanceResponse } from './types';

describe('Nigeria', () => {
  it('should be defined', () => {
    expect(Nigeria).toBeDefined();
  });

  describe('process', () => {
    it('should process nigerian tax', () => {
      const { tax } = Nigeria.process<ProcessNigeriaRemittanceResponse>({
        employee: { salary: 52083, totalBonus: 0 },
        country: '',
        tax: { enabled: true },
      });

      expect(tax).toBeDefined();
      expect(tax).toBe(1749.9813);
    });
  });
});
