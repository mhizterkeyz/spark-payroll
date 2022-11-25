import moment from 'moment';
import { Util } from './util';

describe('Util', () => {
  it('should be defined', () => {
    expect(Util).toBeDefined();
  });

  describe('calculateWorkDaysBetweenDates', () => {
    it('should return the number of workdays between two dates', () => {
      const workDaysInMonth = Util.calculateWorkDaysBetweenDates(
        moment('2022-11-01T00:00:00.000Z'),
        moment('2022-11-30T22:59:59.999Z'),
      );

      expect(workDaysInMonth).toBe(22);
    });
  });

  describe('sum', () => {
    it('should return the sum of numbers', () => {
      expect(Util.sum(10, 10)).toBe(20);
      expect(Util.sum(68.1818, 90.9091)).toBe(159.0909);
    });
  });

  describe('sub', () => {
    it('should return the subtraction of numbers', () => {
      expect(Util.sub(10, 10)).toBe(0);
      expect(Util.sub(68.1818, 90.9098)).toBe(-22.728);
    });
  });

  describe('sub', () => {
    it('should return the product of numbers', () => {
      expect(Util.mul(10, 10)).toBe(100);
      expect(Util.mul(68.1818, 90.9098)).toBe(6198.3938);
    });
  });

  describe('div', () => {
    it('should return the division of numbers', () => {
      expect(Util.div(10, 10)).toBe(1);
      expect(Util.div(68.1818, 90.9098)).toBe(0.75);
    });
  });
});
