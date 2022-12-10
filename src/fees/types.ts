export abstract class RegionFee {
  processForEmployee(
    _config: unknown,
  ): { totalFee: number } & Record<string, unknown> {
    throw new Error('method not implemented');
  }
}
