import { RemittanceRegionService } from './interfaces';
import { ProcessRemittancePayload } from './types';

export class Remittances {
  private static regionService: Map<string, typeof RemittanceRegionService> =
    new Map();

  static registerRegion(name: string, service: typeof RemittanceRegionService) {
    this.regionService.set(name, service);
  }

  private static getRegion(name: string) {
    const service = this.regionService.get(name);
    if (!service) {
      throw new Error(`no remittance region service registered for ${name}`);
    }

    return service;
  }

  static process<
    K extends Record<string, unknown>,
    T extends Record<string, unknown>,
  >(payload: ProcessRemittancePayload<T>) {
    return this.getRegion(payload.country).process<K, T>(payload);
  }
}

// should be here because of circular dependency
require('./regions');
