import { Fees } from './fees';
import { RegionFee } from './types';

class DummyRegionFee implements RegionFee {
  processForEmployee(_config: unknown) {
    return { totalFee: 0, feeBreakdown: [] };
  }
}

describe('Fees', () => {
  it('should be defined', () => {
    expect(Fees).toBeDefined();
  });

  describe('register', () => {
    it('should register a region fee service', () => {
      const name = Math.random().toString(36);

      Fees.register(name, new DummyRegionFee());

      expect(Fees.region(name)).toBeDefined();
    });
  });

  describe('region', () => {
    it('should get a registered region fee', () => {
      const name = Math.random().toString(36);

      Fees.register(name, new DummyRegionFee());

      expect(Fees.region(name)).toBeDefined();
    });

    it('should throw error if region fee service missing', () => {
      const name = Math.random().toString(36);

      try {
        Fees.region(name);
      } catch (error) {
        expect(error.message).toBe(
          `no region fee service registered for ${name}`,
        );
      }
    });
  });
});
