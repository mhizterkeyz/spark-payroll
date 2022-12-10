import { NigeriaFees } from './nigeria-fees';

describe('NigeriaFees', () => {
  it('should be defined', () => {
    expect(NigeriaFees).toBeDefined();
  });

  const instance = new NigeriaFees();

  describe('processForEmployee', () => {
    it('should return totalFee for employee', () => {
      expect(
        instance.processForEmployee({
          employee: { netSalary: 5000, addons: [] },
        }),
      ).toEqual({ totalFee: 10 });
      expect(
        instance.processForEmployee({
          employee: { netSalary: 50000, addons: [] },
        }),
      ).toEqual({ totalFee: 25 });
      expect(
        instance.processForEmployee({
          employee: { netSalary: 50000.1, addons: [] },
        }),
      ).toEqual({ totalFee: 50 });

      expect(
        instance.processForEmployee({
          employee: {
            netSalary: 10,
            addons: [{ addonId: '', amount: 0, type: '' }],
          },
        }),
      ).toEqual({ totalFee: 60 });
    });
  });
});
