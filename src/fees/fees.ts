import { RegionFee } from './types';

export class Fees {
  private static regions: Map<string, RegionFee> = new Map();

  static register(name: string, regionFee: RegionFee) {
    this.regions.set(name, regionFee);
  }

  static region(name: string) {
    const regionFee = this.regions.get(name);
    if (!regionFee) {
      throw new Error(`no region fee service registered for ${name}`);
    }

    return regionFee;
  }
}

require('./regions/regions');
