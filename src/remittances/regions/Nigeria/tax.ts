import { Util } from 'shared/util';
import { NIGERIAN_MINIMUM_WAGE } from './constants';
import { ProcessTaxPayload } from './types';

export class Tax {
  private static getSettings(payload: ProcessTaxPayload) {
    return payload.group?.taxSettings || payload.taxSettings || {};
  }

  static process(payload: ProcessTaxPayload) {
    const settings = this.getSettings(payload);
    if (!settings.enabled) {
      return 0;
    }

    const { salary } = payload;

    const grossSalary = Util.sum(salary, payload.totalBonus);
    if (grossSalary < NIGERIAN_MINIMUM_WAGE) {
      return 0;
    }

    const isWithholdingTax = settings.type === 'WITHHOLDING';
    if (isWithholdingTax) {
      return Util.mul(grossSalary, settings.whTaxRate || 0.05);
    }

    // First Consolidated relief is 1% of Gross Income or N200000/yr whichever is higher
    const firstConsolidatedRelief = Math.max(
      Util.mul(grossSalary, 0.01),
      Util.div(200000, 12),
    );
    // Second Consolidated Relief is 20% of Gross Income
    const secondConsolidatedRelief = Util.mul(grossSalary, 0.2);
    const totalCustomRelief = Util.sum(
      ...(settings.taxRelief?.map(({ value }) => value) || [0]),
    );
    const taxableSalary = Math.max(
      Util.sub(
        grossSalary,
        Util.sum(
          firstConsolidatedRelief,
          secondConsolidatedRelief,
          totalCustomRelief,
        ),
      ),
      0,
    );
    if (taxableSalary < 1) {
      return 0;
    }

    return this.calculateTax(taxableSalary);
  }

  private static calculateTax(taxableSalary: number) {
    let remainingSalary = taxableSalary;
    let totalTax = 0;

    // First N25000
    if (remainingSalary > 25000) {
      totalTax = Util.mul(0.07, 25000);
    } else {
      return Util.mul(0.07, remainingSalary);
    }

    remainingSalary = Util.sub(remainingSalary, 25000);

    // Next N25000
    if (remainingSalary > 25000) {
      totalTax = Util.sum(totalTax, Util.mul(0.11, 25000));
    } else {
      return Util.sum(totalTax, Util.mul(0.11, remainingSalary));
    }

    remainingSalary = Util.sub(remainingSalary, 25000);

    // Next N41667
    if (remainingSalary > 41667) {
      totalTax = Util.sum(totalTax, Util.mul(0.15, 41667));
    } else {
      return Util.sum(totalTax, Util.mul(0.15, remainingSalary));
    }

    remainingSalary = Util.sub(remainingSalary, 41667);

    // Next N41667
    if (remainingSalary > 41667) {
      totalTax = Util.sum(totalTax, Util.mul(0.19, 41667));
    } else {
      return Util.sum(totalTax, Util.mul(0.19, remainingSalary));
    }

    remainingSalary = Util.sub(remainingSalary, 41667);

    // Next N133333
    if (remainingSalary > 133333) {
      totalTax = Util.sum(totalTax, Util.mul(0.21, 133333));
    } else {
      return Util.sum(totalTax, Util.mul(0.21, remainingSalary));
    }

    remainingSalary = Util.sub(remainingSalary, 133333);

    // Over 266,667
    return Util.sum(totalTax, Util.mul(0.24, remainingSalary));
  }
}
