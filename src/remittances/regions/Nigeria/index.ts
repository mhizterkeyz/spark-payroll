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
    const { employee, ..._payload } =
      payload as ProcessRemittancePayload<ProcessNigeriaRemittancePayload>;

    const tax = Tax.process({ ..._payload, ...employee });

    const res = {
      tax,
      remittances: [{ name: 'Tax', amount: tax }],
    } as unknown as K;

    return { ...res, totalRemittances: tax };
  }
}

Remittances.registerRegion(COUNTRY, Nigeria);
