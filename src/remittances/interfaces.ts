/* istanbul ignore file */
import { ProcessRemittancePayload } from './types';

export abstract class RemittanceRegionService {
  static process<
    K extends Record<string, unknown>,
    T extends Record<string, unknown>,
  >(_payload: ProcessRemittancePayload<T>): K & { totalRemittances: number } {
    throw new Error('method not implemented');
  }
}
