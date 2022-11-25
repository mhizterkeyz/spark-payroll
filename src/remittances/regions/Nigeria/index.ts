import { RemittanceRegionService } from 'remittances/interfaces';
import { Remittances } from 'remittances/remittances';
import { ProcessRemittancePayload } from 'remittances/types';
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

    const res = { tax } as unknown as K;

    return { ...res, totalRemittances: tax };
  }
}

Remittances.registerRegion(COUNTRY, Nigeria);
