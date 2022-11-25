import { Remittances } from './remittances';

const processRemittancePayload = (country: string) => ({
  country,
  employee: { salary: 0, totalBonus: 0 },
});

describe('Remittances', () => {
  it('should be defined', () => {
    expect(Remittances).toBeDefined();
  });

  describe('registerRegion', () => {
    it('should register a remittance region service', () => {
      const country = Math.random().toString(36);
      const response = { totalRemittances: 10 };

      Remittances.registerRegion(
        country,
        class {
          static process<K>() {
            return response as K;
          }
        },
      );

      expect(Remittances.process(processRemittancePayload(country))).toEqual(
        response,
      );
    });
  });

  describe('process', () => {
    it('should call process on region service', () => {
      const country = Math.random().toString(36);
      const response = { totalRemittances: 10 };

      Remittances.registerRegion(
        country,
        class {
          static process<K>() {
            return response as K;
          }
        },
      );

      expect(Remittances.process(processRemittancePayload(country))).toEqual(
        response,
      );
    });

    it('should throw error if region service missing', () => {
      const country = Math.random().toString(36);

      try {
        Remittances.process(processRemittancePayload(country));
      } catch (error) {
        expect(error.message).toBe(
          `no remittance region service registered for ${country}`,
        );
      }
    });
  });
});
