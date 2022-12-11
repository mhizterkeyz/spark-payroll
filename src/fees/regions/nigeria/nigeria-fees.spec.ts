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
          employee: { netSalary: 0, addons: [], remittances: [] },
        }),
      ).toEqual({
        totalFee: 0,
        feeBreakdown: [],
      });
      expect(
        instance.processForEmployee({
          employee: { netSalary: 5000, addons: [], remittances: [] },
        }),
      ).toEqual({
        totalFee: 10,
        feeBreakdown: [
          {
            amount: 10,
            description: 'Fee for transferring to recipient',
            name: 'Transfer fee',
          },
        ],
      });
      expect(
        instance.processForEmployee({
          employee: { netSalary: 50000, addons: [], remittances: [] },
        }),
      ).toEqual({
        totalFee: 25,
        feeBreakdown: [
          {
            amount: 25,
            description: 'Fee for transferring to recipient',
            name: 'Transfer fee',
          },
        ],
      });
      expect(
        instance.processForEmployee({
          employee: { netSalary: 50000.1, addons: [], remittances: [] },
        }),
      ).toEqual({
        totalFee: 50,
        feeBreakdown: [
          {
            amount: 50,
            description: 'Fee for transferring to recipient',
            name: 'Transfer fee',
          },
        ],
      });

      expect(
        instance.processForEmployee({
          employee: {
            netSalary: 10,
            addons: [{ addonId: '', amount: 0, type: '', name: '' }],
            remittances: [{ name: '', amount: 0 }],
          },
        }),
      ).toEqual({
        totalFee: 160,
        feeBreakdown: [
          {
            amount: 10,
            description: 'Fee for transferring to recipient',
            name: 'Transfer fee',
          },
          {
            name: 'Processing fee',
            amount: 50,
            description: 'Fee for processing bonus, deduction and/or prorate',
          },
          {
            name: 'Remittance fee',
            amount: 100,
            description: 'Fee for processing remittances',
          },
        ],
      });
    });
  });
});
