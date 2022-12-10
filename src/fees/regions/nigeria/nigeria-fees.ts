import { Util } from '../../../shared/util';
import { Fees } from '../../fees';
import { RegionFee } from '../../types';
import { ProcessFeePayload } from './types';

export class NigeriaFees implements RegionFee {
  name = 'Nigeria';

  private getBaseFee(amount: number) {
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
    let totalFee = this.getBaseFee(employee.netSalary);
    if (Array.isArray(employee.addons) && employee.addons.length) {
      totalFee = Util.sum(totalFee, 50);
    }

    return { totalFee };
  }
}

const instance = new NigeriaFees();

Fees.register(instance.name, instance);
