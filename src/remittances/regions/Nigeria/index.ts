import { Util } from '../../../shared/util';
import { RemittanceRegionService } from '../../interfaces';
import { Remittances } from '../../remittances';
import { ProcessRemittancePayload } from '../../types';
import { COUNTRY } from './constants';
import { Tax } from './tax';
import { ProcessNigeriaRemittancePayload } from './types';

export class Nigeria implements RemittanceRegionService {
  static process<K extends Record<string, unknown>>(
    payload: ProcessRemittancePayload,
  ): K & { totalRemittances: number } {
    const { employee, omit, ..._payload } =
      payload as ProcessRemittancePayload<ProcessNigeriaRemittancePayload>;
    const res: Record<string, unknown> = {
      totalRemittances: 0,
      remittances: [],
    };

    // Tax
    if (!omit?.tax) {
      const tax = Tax.process({ ..._payload, ...employee });

      res.tax = tax;
      res.totalRemittances = Util.sum(res.totalRemittances as number, tax);
      (res.remittances as unknown[]).push({ name: 'Tax', amount: tax });
    }

    return res as unknown as K & { totalRemittances: number };
  }
}

Remittances.registerRegion(COUNTRY, Nigeria);
