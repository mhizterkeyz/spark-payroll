import { Util } from '../../../shared/util';
import { Fees } from '../../fees';
import { RegionFee } from '../../types';
import { ProcessFeePayload } from './types';

export class NigeriaFees implements RegionFee {
  name = 'Nigeria';

  private getBaseFee(amount: number) {
    if (amount <= 0) {
      return 0;
    }

    if (amount <= 5000) {
      return 10;
    }

    if (amount <= 50000) {
      return 25;
    }

    return 50;
  }

  processForEmployee(payload: ProcessFeePayload) {
    const { employee } = payload;
    const feeBreakdown: {
      name: string;
      description: string;
      amount: number;
    }[] = [];
    let totalFee = 0;

    if (employee.netSalary > 0) {
      totalFee = Util.sum(totalFee, this.getBaseFee(employee.netSalary));
      feeBreakdown.push({
        name: 'Transfer fee',
        amount: totalFee,
        description: 'Fee for transferring to recipient',
      });
    }
    if (Array.isArray(employee.addons) && employee.addons.length) {
      totalFee = Util.sum(totalFee, 50);
      feeBreakdown.push({
        name: 'Processing fee',
        amount: 50,
        description: 'Fee for processing bonus, deduction and/or prorate',
      });
    }

    if (Array.isArray(employee.remittances) && employee.remittances.length) {
      const amount = Util.mul(employee.remittances.length, 100);
      totalFee = Util.sum(totalFee, amount);
      feeBreakdown.push({
        name: 'Remittance fee',
        amount,
        description: 'Fee for processing remittances',
      });
    }

    return { totalFee, feeBreakdown };
  }
}

const instance = new NigeriaFees();

Fees.register(instance.name, instance);
